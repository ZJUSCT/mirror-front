import { expect, test } from '@playwright/test';

const manifest = {
  width: 1200,
  height: 400,
  from: Date.UTC(2026, 8, 10, 13),
  to: Date.UTC(2026, 8, 11, 13),
  panels: [
    {
      id: 'traffic',
      title: { zh: '下载流量', en: 'Download traffic' },
      images: { light: 'traffic-light.png', dark: 'traffic-dark.png' },
    },
  ],
};

test('loads only static statistics, follows the theme and refreshes images', async ({
  page,
}) => {
  await page.clock.install();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.route('**/statistics-data/manifest.json', (route) =>
    route.fulfill({ json: manifest })
  );
  await page.route('**/statistics-data/*.png?*', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
        'base64'
      ),
    })
  );
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/en/statistics/');
  await expect(
    page.getByRole('link', { name: 'Statistics', exact: true })
  ).toHaveAttribute('href', '/en/statistics/');
  const image = page.getByRole('img', { name: 'Download traffic' });
  await expect(image).toHaveAttribute('src', /traffic-light\.png\?t=\d+$/);
  await expect(image).toHaveAttribute('width', '1200');
  await expect(image).toHaveAttribute('height', '400');
  await expect(page.locator('.statistics-period time').last()).toHaveAttribute(
    'datetime',
    '2026-09-11T13:00:00.000Z'
  );
  await expect(image.locator('..')).toHaveAttribute(
    'href',
    (await image.getAttribute('src')) as string
  );

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(image).toHaveAttribute('src', /traffic-dark\.png\?t=\d+$/);
  const previousSrc = await image.getAttribute('src');
  await page.clock.fastForward(5 * 60 * 1000);
  await expect(image).not.toHaveAttribute('src', previousSrc as string);

  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(375);
  expect(
    requests.every((url) => new URL(url).origin === new URL(page.url()).origin)
  ).toBe(true);

  await page.goto('/statistics/');
  await expect(page.getByRole('heading', { name: '下载流量' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: '切换至 English' })
  ).toHaveAttribute('href', '/en/statistics/');
});

test('shows a friendly message before the first export exists', async ({
  page,
}) => {
  await page.route('**/statistics-data/manifest.json', (route) =>
    route.fulfill({ status: 404, body: '' })
  );
  await page.goto('/en/statistics/');
  await expect(page.getByRole('status')).toHaveText(
    'Charts are not available yet. Please check back soon.'
  );
  await expect(page.locator('.statistics-panel')).toHaveCount(0);
});
