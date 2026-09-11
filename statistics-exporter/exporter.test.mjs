import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { hourWindow, nextRunDelay, renderBatch } from './exporter.mjs';

test('renders the last completed hour and wakes at the next hour boundary', () => {
  const now = Date.parse('2026-09-11T13:14:00+08:00');
  const window = hourWindow(now, '24h');
  assert.equal(window.to, Date.parse('2026-09-11T13:00:00+08:00'));
  assert.equal(window.from, Date.parse('2026-09-10T13:00:00+08:00'));
  assert.equal(nextRunDelay(window.to, now), 46 * 60 * 1000);
  assert.equal(nextRunDelay(window.to, now + 2 * 60 * 1000), 44 * 60 * 1000);
  assert.equal(nextRunDelay(window.to, now + 60 * 60 * 1000), 0);
});

test('exports authenticated panels in both themes with a frontend manifest', async (t) => {
  const output = await mkdtemp(join(tmpdir(), 'statistics-exporter-'));
  const requests = [];
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=',
    'base64'
  );
  const server = createServer((request, response) => {
    requests.push({
      url: new URL(request.url, 'http://localhost'),
      auth: request.headers.authorization,
    });
    response.writeHead(200, { 'Content-Type': 'image/png' });
    response.end(png);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(output, { recursive: true, force: true });
  });
  const window = hourWindow(Date.now(), '24h');
  const config = {
    width: 1200,
    height: 500,
    panels: [
      {
        id: 'traffic',
        title: { zh: '流量', en: 'Traffic' },
        dashboardUid: 'public',
        panelId: 12,
        variables: { node: ['one', 'two'] },
      },
    ],
  };
  for (const credentials of [
    { username: 'user', password: 'password' },
    { token: 'test-token' },
  ]) {
    requests.length = 0;
    await renderBatch({
      config,
      ...credentials,
      window,
      output,
      baseURL: `http://127.0.0.1:${server.address().port}`,
    });
    const expectedAuth = credentials.token
      ? 'Bearer test-token'
      : `Basic ${Buffer.from('user:password').toString('base64')}`;
    assert.equal(requests.length, 2);
    for (const [i, theme] of ['light', 'dark'].entries()) {
      const { url, auth } = requests[i];
      assert.equal(auth, expectedAuth);
      assert.equal(url.pathname, '/render/d-solo/public/_');
      for (const [key, value] of Object.entries({
        panelId: 12,
        width: 1200,
        height: 500,
        ...window,
        theme,
      })) {
        assert.equal(url.searchParams.get(key), String(value));
      }
      assert.deepEqual(url.searchParams.getAll('var-node'), ['one', 'two']);
      assert.deepEqual(
        await readFile(join(output, `traffic-${theme}.png`)),
        png
      );
    }
    assert.deepEqual(
      JSON.parse(await readFile(join(output, 'manifest.json'), 'utf8')),
      {
        width: 1200,
        height: 500,
        ...window,
        panels: [
          {
            id: 'traffic',
            title: config.panels[0].title,
            images: { light: 'traffic-light.png', dark: 'traffic-dark.png' },
          },
        ],
      }
    );
  }
});
