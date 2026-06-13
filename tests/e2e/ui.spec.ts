import { test, expect } from '@playwright/test';

test('contacts popup opens and closes', async ({ page }) => {
  await page.goto('/');
  // дождаться скрытия прелоадера
  await page.locator('#preloader').waitFor({ state: 'hidden' }).catch(() => {});

  const popup = page.locator('#contacts-popup');
  await expect(popup).toBeHidden();

  await page.getByRole('button', { name: /контакты/i }).click();
  await expect(popup).toBeVisible();
  await expect(page.getByRole('link', { name: /amunbelievable@gmail.com/i })).toBeVisible();

  await page.locator('#contacts-close').click();
  await expect(popup).toBeHidden();
});
