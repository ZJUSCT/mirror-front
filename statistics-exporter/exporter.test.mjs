import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  hourWindow,
  nextRunDelay,
  renderBatch,
  validateConfig,
} from './exporter.mjs';

const config = {
  width: 1200,
  height: 400,
  lookback: '24h',
  panels: [
    {
      id: 'traffic',
      title: { zh: '流量', en: 'Traffic' },
      dashboardUid: 'public-dashboard',
      panelId: 12,
      variables: { node: ['one', 'two'] },
    },
  ],
};
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=',
  'base64'
);

test('startup uses the completed hour and subsequent runs use wall-clock boundaries', () => {
  const now = Date.parse('2026-09-11T13:14:00+08:00');
  const window = hourWindow(now, '24h');
  assert.equal(window.to, Date.parse('2026-09-11T13:00:00+08:00'));
  assert.equal(window.from, Date.parse('2026-09-10T13:00:00+08:00'));
  assert.equal(nextRunDelay(window.to, now), 46 * 60 * 1000);
  assert.equal(nextRunDelay(window.to, now + 2 * 60 * 1000), 44 * 60 * 1000);
  assert.equal(nextRunDelay(window.to, now + 60 * 60 * 1000), 0);
  assert.equal(
    hourWindow(window.to + 60 * 60 * 1000, '24h').to,
    window.to + 60 * 60 * 1000
  );
});

test('rejects output path traversal, duplicate ids and invalid shared dimensions', () => {
  assert.equal(validateConfig(config), config);
  assert.throws(() => validateConfig({ ...config, width: 0 }));
  assert.throws(() => validateConfig({ ...config, lookback: '0h' }));
  assert.throws(() =>
    validateConfig({ ...config, panels: [config.panels[0], config.panels[0]] })
  );
  assert.throws(() =>
    validateConfig({
      ...config,
      panels: [{ ...config.panels[0], id: '../outside' }],
    })
  );
});

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'statistics-exporter-'));
  const requests = [];
  let mode = 'png';
  const server = createServer((request, response) => {
    requests.push({
      url: new URL(request.url, 'http://localhost'),
      authorization: request.headers.authorization,
    });
    if (mode === 'redirect') {
      response.writeHead(302, { Location: '/login' });
      response.end();
    } else if (mode === 'html') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<html>Login</html>');
    } else {
      response.writeHead(200, { 'Content-Type': 'image/png' });
      response.end(png);
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  return {
    directory,
    requests,
    baseURL: `http://127.0.0.1:${server.address().port}`,
    setMode: (value) => {
      mode = value;
    },
  };
}

for (const authentication of ['basic', 'token']) {
  test(`CLI exports both themes using ${authentication} authentication`, async (t) => {
    const { directory, requests, baseURL } = await fixture(t);
    await Promise.all([
      writeFile(join(directory, 'panels.json'), JSON.stringify(config)),
      writeFile(join(directory, 'username'), 'export-user'),
      writeFile(join(directory, 'password'), 'test-password'),
      writeFile(join(directory, 'token'), 'test-service-token'),
    ]);
    const child = spawn(
      process.execPath,
      [
        new URL('./exporter.mjs', import.meta.url).pathname,
        '--once',
        '--config',
        join(directory, 'panels.json'),
        '--output',
        directory,
      ],
      {
        env: {
          ...process.env,
          GRAFANA_URL: baseURL,
          GRAFANA_TOKEN_FILE:
            authentication === 'token' ? join(directory, 'token') : '',
          GRAFANA_USERNAME_FILE:
            authentication === 'token'
              ? '/missing-username'
              : join(directory, 'username'),
          GRAFANA_PASSWORD_FILE:
            authentication === 'token'
              ? '/missing-password'
              : join(directory, 'password'),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    let logs = '';
    child.stdout.on('data', (data) => {
      logs += data;
    });
    child.stderr.on('data', (data) => {
      logs += data;
    });
    const [code] = await once(child, 'close');
    assert.equal(code, 0, logs);
    assert.equal(requests.length, 2);
    const manifest = JSON.parse(
      await readFile(join(directory, 'manifest.json'), 'utf8')
    );
    assert.equal(manifest.to % 3_600_000, 0);
    assert.equal(manifest.to - manifest.from, 24 * 3_600_000);
    assert.equal(manifest.width, config.width);
    assert.equal(manifest.height, config.height);
    assert.deepEqual(manifest.panels, [
      {
        id: 'traffic',
        title: config.panels[0].title,
        images: { light: 'traffic-light.png', dark: 'traffic-dark.png' },
      },
    ]);
    for (const [index, theme] of ['light', 'dark'].entries()) {
      const { url, authorization } = requests[index];
      assert.equal(url.pathname, '/render/d-solo/public-dashboard/_');
      assert.equal(
        authorization,
        authentication === 'token'
          ? 'Bearer test-service-token'
          : `Basic ${Buffer.from('export-user:test-password').toString('base64')}`
      );
      assert.equal(url.searchParams.get('theme'), theme);
      assert.equal(url.searchParams.get('width'), '1200');
      assert.equal(url.searchParams.get('height'), '400');
      assert.equal(url.searchParams.get('panelId'), '12');
      assert.equal(url.searchParams.get('from'), String(manifest.from));
      assert.equal(url.searchParams.get('to'), String(manifest.to));
      assert.deepEqual(url.searchParams.getAll('var-node'), ['one', 'two']);
      assert.deepEqual(
        await readFile(join(directory, `traffic-${theme}.png`)),
        png
      );
    }
    assert.ok(!logs.includes('test-password'));
    assert.ok(!logs.includes('test-service-token'));
  });
}

test('does not follow login redirects or overwrite images with HTML', async (t) => {
  const f = await fixture(t);
  const options = {
    config,
    baseURL: f.baseURL,
    username: 'user',
    password: 'password',
    output: f.directory,
    window: hourWindow(Date.now(), '24h'),
  };
  await writeFile(join(f.directory, 'traffic-light.png'), png);
  f.setMode('html');
  await assert.rejects(renderBatch(options), /did not return a PNG/);
  assert.deepEqual(await readFile(join(f.directory, 'traffic-light.png')), png);
  f.setMode('redirect');
  await assert.rejects(renderBatch(options));
  assert.equal(f.requests.length, 2);
});
