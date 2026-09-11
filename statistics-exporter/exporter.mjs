import { parseArgs } from 'node:util';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const HOUR = 60 * 60 * 1000;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function validateConfig(config) {
  for (const key of ['width', 'height']) {
    if (!Number.isSafeInteger(config[key]) || config[key] <= 0) {
      throw new Error(`${key} must be a positive integer`);
    }
  }
  if (!/^[1-9]\d*h$/.test(config.lookback)) {
    throw new Error('lookback must be a positive number of hours, such as 24h');
  }
  const hours = Number(config.lookback.slice(0, -1));
  if (!Number.isSafeInteger(hours * HOUR)) {
    throw new Error('lookback is too large');
  }
  if (!Array.isArray(config.panels) || config.panels.length === 0) {
    throw new Error('panels must contain at least one panel');
  }
  const ids = new Set();
  for (const panel of config.panels) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(panel.id ?? '') || ids.has(panel.id)) {
      throw new Error(
        'panel ids must be unique lowercase names using letters, numbers and hyphens'
      );
    }
    ids.add(panel.id);
    if (
      !/^[\w-]+$/.test(panel.dashboardUid ?? '') ||
      !Number.isSafeInteger(panel.panelId) ||
      panel.panelId <= 0
    ) {
      throw new Error(`Invalid dashboardUid or panelId for ${panel.id}`);
    }
    if (
      !panel.title?.zh ||
      !panel.title?.en ||
      typeof panel.title.zh !== 'string' ||
      typeof panel.title.en !== 'string'
    ) {
      throw new Error(`Both zh and en titles are required for ${panel.id}`);
    }
  }
  return config;
}

export function hourWindow(now, lookback) {
  const to = Math.floor(now / HOUR) * HOUR;
  return { from: to - Number(lookback.slice(0, -1)) * HOUR, to };
}

export function nextRunDelay(to, now) {
  return Math.max(0, to + HOUR - now);
}

export function renderURL(baseURL, config, panel, theme, window) {
  const url = new URL(
    `${baseURL.replace(/\/$/, '')}/render/d-solo/${encodeURIComponent(panel.dashboardUid)}/_`
  );
  url.search = new URLSearchParams({
    panelId: String(panel.panelId),
    from: String(window.from),
    to: String(window.to),
    width: String(config.width),
    height: String(config.height),
    tz: config.timezone ?? 'Asia/Shanghai',
    theme,
    timeout: '60',
  }).toString();
  for (const [name, values] of Object.entries(panel.variables ?? {})) {
    for (const value of Array.isArray(values) ? values : [values]) {
      url.searchParams.append(`var-${name}`, String(value));
    }
  }
  return url;
}

export async function renderBatch({
  config,
  baseURL,
  username,
  password,
  token,
  output,
  window,
  signal,
}) {
  await mkdir(output, { recursive: true });
  const authorization = token
    ? `Bearer ${token}`
    : `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  const panels = [];
  for (const panel of config.panels) {
    const images = {};
    for (const theme of ['light', 'dark']) {
      const response = await fetch(
        renderURL(baseURL, config, panel, theme, window),
        {
          headers: { Authorization: authorization },
          redirect: 'error',
          signal: AbortSignal.any([
            AbortSignal.timeout(75_000),
            ...(signal ? [signal] : []),
          ]),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Rendering ${panel.id}/${theme} returned HTTP ${response.status}`
        );
      }
      const image = Buffer.from(await response.arrayBuffer());
      if (!image.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
        throw new Error(`Rendering ${panel.id}/${theme} did not return a PNG`);
      }
      images[theme] = `${panel.id}-${theme}.png`;
      await writeFile(join(output, images[theme]), image);
    }
    panels.push({ id: panel.id, title: panel.title, images });
  }
  const manifest = {
    width: config.width,
    height: config.height,
    ...window,
    panels,
  };
  await writeFile(
    join(output, 'manifest.json'),
    `${JSON.stringify(manifest)}\n`
  );
  return manifest;
}

async function main() {
  const { values } = parseArgs({
    options: {
      config: {
        type: 'string',
        default: '/etc/statistics-exporter/panels.json',
      },
      output: { type: 'string', default: '/output' },
      once: { type: 'boolean', default: false },
    },
  });
  const baseURL = process.env.GRAFANA_URL;
  if (!baseURL || !['http:', 'https:'].includes(new URL(baseURL).protocol)) {
    throw new Error('GRAFANA_URL must be an HTTP or HTTPS URL');
  }
  const controller = new AbortController();
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => controller.abort());
  }
  while (!controller.signal.aborted) {
    // Re-read mounted files each cycle so ConfigMap and Secret updates take effect.
    const config = validateConfig(
      JSON.parse(await readFile(values.config, 'utf8'))
    );
    const window = hourWindow(Date.now(), config.lookback);
    try {
      const token = process.env.GRAFANA_TOKEN_FILE
        ? (await readFile(process.env.GRAFANA_TOKEN_FILE, 'utf8')).trim()
        : undefined;
      if (process.env.GRAFANA_TOKEN_FILE && !token) {
        throw new Error('GRAFANA_TOKEN_FILE is empty');
      }
      const [username, password] = token
        ? []
        : await Promise.all([
            readFile(
              process.env.GRAFANA_USERNAME_FILE ??
                '/etc/grafana-credentials/admin-user',
              'utf8'
            ),
            readFile(
              process.env.GRAFANA_PASSWORD_FILE ??
                '/etc/grafana-credentials/admin-password',
              'utf8'
            ),
          ]);
      await renderBatch({
        config,
        baseURL,
        username,
        password,
        token,
        output: values.output,
        window,
        signal: controller.signal,
      });
      console.log(
        `Rendered ${config.panels.length} panels in both themes for ${new Date(window.from).toISOString()} to ${new Date(window.to).toISOString()}`
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      if (values.once) throw error;
      console.error(
        `Export failed; next attempt is on the next hour: ${error.message}`
      );
    }
    if (values.once || controller.signal.aborted) return;
    await sleep(nextRunDelay(window.to, Date.now()), undefined, {
      signal: controller.signal,
    });
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    if (error.name === 'AbortError') return;
    console.error(error.message);
    process.exitCode = 1;
  });
}
