import { expect, test } from '@playwright/test';

test('serves every localized special page', async ({ page }) => {
  for (const path of [
    '/about/',
    '/history/',
    '/faq/',
    '/en/about/',
    '/en/history/',
    '/en/faq/',
  ]) {
    const response = await page.goto(path);

    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  await page.goto('/about/');
  await page.getByRole('button', { name: '切换语言' }).click();
  await expect(
    page.getByRole('menuitem', { name: 'English (英语)' })
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
