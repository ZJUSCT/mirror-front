import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const mirrorFixture = [
  {
    id: 'browser-fixture',
    url: '/browser-fixture/',
    name: { zh: '浏览器测试镜像', en: 'Browser fixture mirror' },
    desc: { zh: '验证镜像数据链接', en: 'Checks mirror data links' },
    upstream: 'https://upstream.example.invalid/browser-fixture/',
    size: 1024,
    status: 'succeeded',
    lastAttempt: 1787544000,
    nextScheduled: 1787547600,
    lastFailure: -62135596800,
    lastSuccess: 1787544060,
  },
  ...(
    ['syncing', 'pending', 'failed', 'paused', 'cached', 'unknown'] as const
  ).map((status, index) => ({
    id: `${status}-fixture`,
    url: `/${status}-fixture/`,
    name: { zh: `${status} 状态镜像`, en: `${status} status mirror` },
    desc: {
      zh: `验证 ${status} 状态文字`,
      en: `Checks the ${status} status label`,
    },
    upstream: `https://upstream.example.invalid/${status}-fixture/`,
    size: 2048 + index,
    status,
    lastAttempt: 1787544000,
    nextScheduled: 1787547600,
    lastFailure: status === 'failed' ? 1787544060 : -62135596800,
    lastSuccess: status === 'failed' ? -62135596800 : 1787544060,
  })),
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v2/mirrorgo.json', (route) =>
    route.fulfill({ json: mirrorFixture })
  );
  await page.route('**/api/is_campus_network', (route) =>
    route.fulfill({ body: '0', contentType: 'application/json' })
  );
});

test('renders useful portal content without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'ZJU Mirror', exact: true })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '常用镜像' })).toBeVisible();
  await context.close();
});

test('keeps mirror data links on the production origin', async ({ page }) => {
  await page.goto('/');

  const link = page.locator(
    'a[href="https://mirrors.zju.edu.cn/browser-fixture/"]'
  );
  await expect(link).toBeVisible();
});

test('searches the normalized status API in English', async ({ page }) => {
  await page.goto('/en/');

  const search = page.getByPlaceholder('Search by name, ID, or description…');
  await search.fill('Browser fixture');

  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
  await expect(page.getByText('Checks mirror data links')).toBeVisible();

  await search.fill('browser-fixture');
  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
  await search.fill('mirror data links');
  await expect(page.getByText('Checks mirror data links')).toBeVisible();
});

test('exposes every status as text and handles unavailable guides honestly', async ({
  page,
}) => {
  await page.goto('/en/');

  for (const label of [
    'Ready',
    'Syncing',
    'Pending',
    'Failed',
    'Paused',
    'Cached',
    'Unknown',
  ]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  const browserCard = page
    .locator('.mirror-card')
    .filter({ hasText: 'browser-fixture' });
  await expect(browserCard.getByText('No guide')).toBeVisible();
});

test('keeps announcements ordered and uses a safe language fallback', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.announcement-item a')).toHaveText([
    '关于分阶段移除 CentOS 镜像的通知',
    '关于移除 IUS 镜像的通知',
    '镜像站维护通知',
    '欢迎使用全新的浙江大学开源软件镜像站',
  ]);

  const response = await page.goto('/news/240410_maintenance/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute(
    'href',
    '/en/'
  );
});

test('keeps static navigation usable when the status API fails', async ({
  page,
}) => {
  await page.unroute('**/api/v2/mirrorgo.json');
  await page.route('**/api/v2/mirrorgo.json', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' })
  );

  await page.goto('/');

  await expect(page.getByRole('link', { name: /Debian/ })).toBeVisible();
  await expect(
    page.getByText('状态接口暂时不可用。镜像文件和公告仍可正常访问。')
  ).toBeVisible();

  await page.unroute('**/api/v2/mirrorgo.json');
  await page.route('**/api/v2/mirrorgo.json', (route) =>
    route.fulfill({ json: mirrorFixture })
  );
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByText('浏览器测试镜像')).toBeVisible();
});

test('marks cached API data stale with its timestamp', async ({ page }) => {
  await page.goto('/en/');
  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();

  await page.unroute('**/api/v2/mirrorgo.json');
  await page.route('**/api/v2/mirrorgo.json', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' })
  );
  await page.reload();

  await expect(page.getByText(/showing data saved at/i)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
});

test('keeps live data usable when browser storage is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage denied', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage denied', 'SecurityError');
    };
  });

  await page.goto('/en/');
  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
});

test('labels campus IPv4, campus IPv6, and invalid network responses', async ({
  page,
}) => {
  for (const [mode, label] of [
    [1, 'On-Campus - IPv4'],
    [2, 'On-Campus - IPv6'],
    [9, 'Network status unavailable'],
  ] as const) {
    await page.unroute('**/api/is_campus_network');
    await page.route('**/api/is_campus_network', (route) =>
      route.fulfill({ json: mode })
    );
    await page.goto('/en/');
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
});

test('provides an explicit English fallback for Chinese guides', async ({
  page,
}) => {
  const response = await page.goto('/en/docs/debian/');

  expect(response?.status()).toBe(200);
  await expect(
    page.getByText('This shared guide is currently available only in Chinese.')
  ).toBeVisible();
  await expect(page.getByText('General options')).toBeVisible();
  await expect(page.getByRole('link', { name: '中文' })).toHaveAttribute(
    'href',
    '/docs/debian/'
  );

  await page.goto('/en/docs/pypi/');
  const requiredHttps = page.getByRole('checkbox', {
    name: 'This guide requires HTTPS',
  });
  await expect(requiredHttps).toBeChecked();
  await expect(requiredHttps).toBeDisabled();
});

test('preserves unavailable and retired guide routes honestly', async ({
  page,
}) => {
  let response = await page.goto('/en/docs/almalinux/');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByText('No reviewed shared guide is available.')
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Browse the almalinux mirror files' })
  ).toHaveAttribute('href', 'https://mirrors.zju.edu.cn/almalinux');

  response = await page.goto('/en/docs/crates.io-index.git/');
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'crates.io Git index (retired)' })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open the sparse-index guide' })
  ).toHaveAttribute('href', '/en/docs/crates.io-index/');

  response = await page.goto('/en/docs/npm/');
  expect(response?.status()).toBe(200);
  await expect(page.getByText(/outside the current catalog/)).toBeVisible();
});

test('supports keyboard search, persistent theme, mobile width, and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/en/');

  const search = page.getByPlaceholder('Search by name, ID, or description…');
  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
  await page.keyboard.press('/');
  await expect(search).toBeFocused();

  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  const selectedTheme = await page.locator('html').getAttribute('data-theme');
  expect(selectedTheme).not.toBe(initialTheme);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    selectedTheme ?? ''
  );

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(
    await page
      .locator('.quick-link')
      .first()
      .evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).transitionDuration)
      )
  ).toBeLessThanOrEqual(0.001);
});

test('has no serious automated accessibility violations on representative pages', async ({
  page,
}) => {
  for (const path of [
    '/en/',
    '/en/docs/debian/',
    '/news/221115_hello_mirror/',
  ]) {
    await page.goto(path);
    if (path === '/en/') {
      await expect(
        page.getByRole('heading', { name: 'Browser fixture mirror' })
      ).toBeVisible();
    }
    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter(
      (violation) =>
        violation.impact === 'serious' || violation.impact === 'critical'
    );
    expect(seriousViolations, `accessibility violations on ${path}`).toEqual(
      []
    );
  }
});

test('updates a pinned MirrorZ command from its document controls', async ({
  page,
}) => {
  await page.goto('/docs/debian/');

  const releaseSelect = page.locator('.docs-controls select').first();
  await expect(releaseSelect).toHaveAccessibleName('Debian 版本');
  await releaseSelect.selectOption({ label: 'Debian 12 (bookworm)' });

  await expect(
    page
      .locator('code[data-zdoc-template]')
      .filter({ hasText: 'bookworm' })
      .first()
  ).toBeVisible();
  await expect(page.getByText(/CC BY-NC-SA 4\.0/)).toBeVisible();
});

test('composes FancyIndex fragments and neutralizes injected markup', async ({
  page,
  request,
}) => {
  const beforeResponse = await request.get('/fancy-index/before.html');
  const afterResponse = await request.get('/fancy-index/after.html');
  expect(beforeResponse.status()).toBe(200);
  expect(afterResponse.status()).toBe(200);

  const fixture = `
    <table id="list">
      <tbody>
        <tr>
          <td>
            <a id="unsafe-link" href="javascript:alert(1)" onclick="globalThis.compromised = true">
              escaped-&lt;script&gt;-filename
            </a>
            <script>globalThis.compromised = true</script>
          </td>
          <td class="size">42 KiB</td>
        </tr>
      </tbody>
    </table>`;
  await page.setContent(
    `${await beforeResponse.text()}${fixture}${await afterResponse.text()}`
  );

  await expect(page.locator('#list')).toBeVisible();
  await expect(page.getByText('escaped-<script>-filename')).toBeVisible();
  await expect(page.locator('#unsafe-link')).not.toHaveAttribute('href');
  await expect(page.locator('#unsafe-link')).not.toHaveAttribute('onclick');
  await expect(page.locator('#list script')).toHaveCount(0);
  expect(
    await page.evaluate(() => Reflect.get(globalThis, 'compromised'))
  ).toBeUndefined();
});

test('serves deep links, assets, FancyIndex fragments, and real 404s', async ({
  request,
}) => {
  const homepage = await request.get('/en/');
  expect(homepage.status()).toBe(200);
  expect(homepage.headers()['x-content-type-options']).toBe('nosniff');
  expect(homepage.headers()['content-security-policy']).toContain(
    'upgrade-insecure-requests'
  );
  expect((await request.get('/docs/debian/')).status()).toBe(200);
  expect((await request.get('/en/docs/debian/')).status()).toBe(200);
  expect((await request.get('/docs/almalinux/')).status()).toBe(200);
  expect((await request.get('/docs/gentoo-portage.git/')).status()).toBe(200);
  expect((await request.get('/manifest.webmanifest')).status()).toBe(200);
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
  expect((await request.get('/fancy-index/before.html')).status()).toBe(200);
  expect((await request.get('/definitely-not-a-route')).status()).toBe(404);
});
