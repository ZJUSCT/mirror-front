import { expect, test } from '@playwright/test';

test('serves every localized special page', async ({ page }) => {
  for (const path of [
    '/about/',
    '/container-images/',
    '/history/',
    '/faq/',
    '/en/about/',
    '/en/container-images/',
    '/en/history/',
    '/en/faq/',
  ]) {
    const response = await page.goto(path);

    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  await page.goto('/about/');
  await expect(
    page.getByRole('link', { name: '切换至 English' })
  ).toHaveAttribute('href', '/en/about/');
});

test('opens an FAQ disclosure from the keyboard', async ({ page }) => {
  await page.goto('/en/faq/');

  const question = page.locator('summary').first();
  const disclosure = question.locator('..');
  const wasOpen = await disclosure.evaluate((element) =>
    element.hasAttribute('open')
  );
  await question.focus();
  await page.keyboard.press('Enter');

  await expect
    .poll(() => disclosure.evaluate((element) => element.hasAttribute('open')))
    .toBe(!wasOpen);
});

test('uses guide-style code blocks on local content pages', async ({
  browser,
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/container-images/');

  const blocks = page.locator('.code-block-shell');
  await expect(blocks).toHaveCount(2);
  await expect(blocks.first().locator('figcaption')).toHaveText('bash');
  await expect(blocks.nth(1).locator('figcaption')).toHaveText('yaml');
  await expect(
    blocks.first().getByRole('button', { name: '复制' })
  ).toBeVisible();
  await expect(blocks.first().locator('pre')).not.toHaveAttribute('style');

  await blocks.first().getByRole('button', { name: '复制' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'docker pull harbor.mirrors.zjusct.io/'
  );

  const noScriptContext = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: 'light',
  });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto('/container-images/');
  await expect(noScriptPage.locator('pre').first()).not.toHaveCSS(
    'background-color',
    'rgb(36, 41, 46)'
  );
  await noScriptContext.close();
});

test('opens and navigates the infrastructure image gallery', async ({
  page,
}) => {
  await page.goto('/en/about/');

  const items = page.locator('[data-gallery-item]');
  const invokingItem = items.nth(1);
  await expect(items).toHaveCount(3);
  await invokingItem.click();

  const dialog = page.locator('[data-gallery-dialog]');
  const image = dialog.locator('[data-gallery-image]');
  await expect(dialog).toHaveAttribute('open', '');
  await expect(image).toHaveAttribute('src', '/images/about/infra-1.webp');
  await expect(dialog.locator('figcaption')).toHaveText(
    'Mirror server rack (rear view)'
  );

  await page.keyboard.press('ArrowRight');
  await expect(image).toHaveAttribute('src', '/images/about/infra-2.webp');

  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(invokingItem).toBeFocused();
});
