import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

interface DirectoryEntry {
  name: string;
  type: 'directory' | 'file';
  mtime: string;
  size?: number;
}

function mockDirectoryListing(
  page: Page,
  pattern: string,
  shell: string,
  entries: DirectoryEntry[]
): void {
  page.route(pattern, (route) => {
    if (route.request().headers().accept?.includes('text/html')) {
      return route.fulfill({ body: shell, contentType: 'text/html' });
    }
    return route.fulfill({ json: entries });
  });
}

const mirrorFixture = {
  version: 1.7,
  site: {
    url: 'https://mirrors.zju.edu.cn',
    abbr: 'ZJU',
  },
  info: [],
  mirrors: [
    {
      cname: 'Browser fixture mirror',
      url: '/browser-fixture',
      desc: 'Checks mirror data links',
      upstream: 'https://upstream.example.invalid/browser-fixture/',
      status: 'S1787544060X1787547600',
    },
    {
      cname: 'Ubuntu',
      url: '/ubuntu',
      desc: 'Sample directory tree for visual acceptance',
      status: 'S1787544060X1787547600',
    },
    ...(
      [
        ['syncing', 'Y1787544000O1787540000X1787547600'],
        ['pending', 'D1787544000X1787547600'],
        ['failed', 'F1787544060O1787540000X1787547600'],
        ['paused', 'P1787544000'],
        ['cached', 'C'],
        ['proxied', 'R'],
        ['unknown', 'U'],
      ] as const
    ).map(([name, status]) => ({
      cname: `${name} fixture`,
      url: `/${name}-fixture`,
      status,
    })),
    {
      cname: 'disabled fixture',
      url: '/disabled-fixture',
      status: 'U',
      disable: true,
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/mirrorz.json', (route) =>
    route.fulfill({ json: mirrorFixture })
  );
  await page.route('**/api/is_campus_network', (route) =>
    route.fulfill({ body: '0', contentType: 'application/json' })
  );
});

test('keeps the static portal useful without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  expect((await page.goto('/'))?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'ZJU Mirror', exact: true })
  ).toBeVisible();
  await expect(page.getByPlaceholder('今天你想来点镜像吗？')).toBeVisible();
  await expect(
    page.getByRole('link', { name: '关于', exact: true })
  ).toHaveAttribute('href', '/about/');
  await expect(page.getByRole('heading', { name: '近期更新' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '常用镜像' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Fedora Fedora 发行版软件包/ })
  ).toHaveAttribute('href', '/docs/fedora/');

  await context.close();
});

test('uses production mirror links and persists the name display mode', async ({
  page,
}) => {
  await page.goto('/en/');

  const card = page.locator('.mirror-card').filter({
    has: page.getByRole('heading', { name: 'Browser fixture mirror' }),
  });
  await expect(card).toHaveAttribute(
    'href',
    'https://mirrors.zju.edu.cn/browser-fixture'
  );

  await page.getByRole('button', { name: 'Toggle friendly name' }).click();
  await expect(
    page.getByRole('heading', { name: 'browser-fixture' })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'browser-fixture' })
  ).toBeVisible();
});

test('searches only MirrorZ mirror names', async ({ page }) => {
  await page.goto('/en/');

  const search = page.getByPlaceholder(
    'What mirror are you looking for today?'
  );
  await search.fill('BROWSER FIXTURE');
  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Popular Mirrors' })
  ).toBeHidden();

  await search.fill('mirror data links');
  await expect(page.getByText('No mirrors match your search.')).toBeVisible();

  await search.fill('d');
  await expect(
    page.getByRole('heading', { name: 'disabled fixture' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ubuntu' })).toBeHidden();
});

test('exposes every mirror status as text', async ({ page }) => {
  await page.goto('/en/');

  for (const label of [
    'SUCCEEDED',
    'SYNCING',
    'PENDING',
    'FAILED',
    'PAUSED',
    'CACHED',
    'PROXIED',
    'DISABLED',
    'UNKNOWN',
  ]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
});

test('expands announcements and links translated news and GitHub authors', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.announcement-item:visible')).toHaveCount(2);
  await page.getByText('查看更多', { exact: true }).click();
  expect(
    await page.locator('.announcement-item:visible').count()
  ).toBeGreaterThan(2);

  await page.goto('/news/240410_maintenance/');
  await page.getByRole('button', { name: '切换语言' }).click();
  await expect(
    page.getByRole('menuitem', { name: 'English (英语)' })
  ).toHaveAttribute('href', '/en/news/240410_maintenance/');

  const author = page.getByRole('link', { name: '@determ1ne' });
  await expect(author).toHaveAttribute('href', 'https://github.com/determ1ne');
  await expect(author.locator('img')).toHaveAttribute(
    'src',
    'https://avatars.githubusercontent.com/determ1ne?s=64'
  );
});

test('recovers when MirrorZ data is temporarily unavailable', async ({
  page,
}) => {
  await page.unroute('**/mirrorz.json');
  await page.route('**/mirrorz.json', (route) =>
    route.fulfill({ status: 503, body: 'unavailable' })
  );
  await page.goto('/');

  await expect(page.getByRole('button', { name: '重试' })).toBeVisible();

  await page.unroute('**/mirrorz.json');
  await page.route('**/mirrorz.json', (route) =>
    route.fulfill({ json: mirrorFixture })
  );
  await page.getByRole('button', { name: '重试' }).click();
  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
});

test('keeps guide fallback and retirement routes usable', async ({
  page,
  request,
}) => {
  expect((await page.goto('/en/docs/debian/'))?.status()).toBe(200);
  await expect(
    page.getByText('This shared guide is currently available only in Chinese.')
  ).toBeVisible();
  await expect(page.getByText('General options')).toBeVisible();

  for (const path of [
    '/en/docs/almalinux/',
    '/en/docs/crates.io-index.git/',
    '/en/docs/npm/',
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test('supports keyboard search and persists the selected theme', async ({
  page,
}) => {
  await page.goto('/en/');
  const search = page.getByPlaceholder(
    'What mirror are you looking for today?'
  );

  await expect(
    page.getByRole('heading', { name: 'Browser fixture mirror' })
  ).toBeVisible();
  await page.keyboard.press('/');
  await expect(search).toBeFocused();
  const initialTheme = await page
    .locator('html')
    .getAttribute('data-theme-pref');
  await page.getByRole('button', { name: 'Toggle color theme' }).click();
  const selectedTheme = await page
    .locator('html')
    .getAttribute('data-theme-pref');
  expect(selectedTheme).not.toBe(initialTheme);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme-pref',
    selectedTheme ?? ''
  );
});

test('reveals a navigation label before following it on touch', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/en/');

  const about = page.getByRole('link', { name: 'About', exact: true });
  await about.tap();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(about).toHaveAttribute('data-touch-expanded', 'true');

  await page.getByPlaceholder('What mirror are you looking for today?').tap();
  await expect(about).not.toHaveAttribute('data-touch-expanded', 'true');

  await about.tap();
  await about.tap();
  await expect(page).toHaveURL(/\/en\/about\/$/);
  await context.close();
});

test('has no serious accessibility violations on representative pages', async ({
  page,
}) => {
  for (const path of ['/en/', '/en/docs/debian/', '/about/', '/404/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      ({ impact }) => impact === 'serious' || impact === 'critical'
    );
    expect(serious, `accessibility violations on ${path}`).toEqual([]);
  }
});

test('updates and copies a generated documentation command', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/docs/debian/');

  await page
    .locator('.docs-controls select')
    .first()
    .selectOption({ label: 'Debian 12 (bookworm)' });
  await expect(
    page
      .locator('code[data-zdoc-template]')
      .filter({ hasText: 'bookworm' })
      .first()
  ).toBeVisible();

  const block = page.locator('.code-block-shell').first();
  const expected = await block.locator('code').textContent();
  await block.getByRole('button', { name: '复制' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    expected
  );
});

test('switches commands and file links to the CERNET federation', async ({
  page,
}) => {
  await page.goto('/docs/debian/');

  const toggle = page.getByRole('checkbox', {
    name: '使用教育网联合镜像站',
  });
  await toggle.check();
  await expect(
    page
      .locator('code[data-zdoc-template]')
      .filter({ hasText: 'mirrors.cernet.edu.cn/debian' })
      .first()
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '文件列表' })).toHaveAttribute(
    'href',
    'https://mirrors.cernet.edu.cn/debian'
  );
});

test('shows mirror synchronization state in guides and file listings', async ({
  page,
  request,
}) => {
  const lastSuccess = 1_787_544_060;
  await page.clock.setFixedTime(new Date((lastSuccess + 3 * 3_600) * 1_000));
  await page.unroute('**/mirrorz.json');
  await page.route('**/mirrorz.json', (route) =>
    route.fulfill({
      json: {
        ...mirrorFixture,
        mirrors: [
          {
            cname: 'Debian',
            url: '/debian',
            status: `Y${lastSuccess + 7_200}O${lastSuccess}X${lastSuccess + 10_800}`,
          },
        ],
      },
    })
  );

  await page.goto('/docs/debian/');
  await expect(page.locator('.guide-updated')).toContainText(/3\s*小时前/);

  const shell = await (await request.get('/autoindex/index.html')).text();
  mockDirectoryListing(page, '**/debian/', shell, []);
  await page.goto('/debian/');
  await expect(page.locator('#mirror-status')).toHaveText('SYNCING');
  await expect(page.locator('#mirror-updated')).toContainText(
    /(?:3\s*小时前|3 hours ago)/
  );
});

test('renders, sorts, and safely escapes an AutoIndex listing', async ({
  page,
  request,
}) => {
  const shell = await (await request.get('/autoindex/index.html')).text();
  const mtime = 'Fri, 24 Apr 2026 02:27:08 GMT';
  mockDirectoryListing(page, '**/autoindex/', shell, [
    { name: 'zlib', type: 'directory', mtime },
    { name: 'README.md', type: 'file', size: 2048, mtime },
    { name: '<img onerror=alert(1)>.txt', type: 'file', size: 5, mtime },
  ]);

  await page.goto('/autoindex/');
  const rows = page.locator('#autoindex-list tbody tr');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(1)).toContainText('zlib/');
  await expect(rows.nth(2).locator('a')).toHaveText(
    '<img onerror=alert(1)>.txt'
  );
  await expect(rows.nth(2).locator('a')).toHaveAttribute(
    'href',
    '%3Cimg%20onerror%3Dalert(1)%3E.txt'
  );
  await expect(page.locator('#autoindex-list script')).toHaveCount(0);

  await page.getByRole('button', { name: 'File Size' }).click();
  await page.getByRole('button', { name: 'File Size' }).click();
  await expect(rows.nth(1)).toContainText('zlib/');
  await expect(rows.nth(2)).toContainText('README.md');
  await expect(rows.nth(3)).toContainText('<img onerror=alert(1)>.txt');
});

test('reports AutoIndex JSON failures', async ({ page, request }) => {
  const shell = await (await request.get('/autoindex/index.html')).text();
  await page.route('**/autoindex/', (route) => {
    if (route.request().headers().accept?.includes('text/html')) {
      return route.fulfill({ body: shell, contentType: 'text/html' });
    }
    return route.fulfill({ status: 503, body: 'unavailable' });
  });

  await page.goto('/autoindex/');
  await expect(page.getByText(/目录列表加载失败.*503/)).toBeVisible();
});

test('serves core routes with security headers and negotiates AutoIndex', async ({
  request,
}) => {
  const homepage = await request.get('/en/');
  expect(homepage.status()).toBe(200);
  expect(homepage.headers()['x-content-type-options']).toBe('nosniff');
  expect(homepage.headers()['content-security-policy']).toContain(
    'upgrade-insecure-requests'
  );
  expect((await request.get('/docs/debian/')).status()).toBe(200);

  const listing = await request.get('/autoindex/', {
    headers: { Accept: 'application/json' },
  });
  expect(listing.headers()['content-type']).toContain('application/json');
  expect(listing.headers().vary).toContain('Accept');
  expect(await listing.json()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'index.html', type: 'file' }),
    ])
  );

  const shell = await request.get('/autoindex/', {
    headers: { Accept: 'text/html' },
  });
  expect(shell.headers()['content-type']).toContain('text/html');
  expect(await shell.text()).toContain('id="autoindex-list"');
  expect((await request.get('/definitely-not-a-route')).status()).toBe(404);
});
