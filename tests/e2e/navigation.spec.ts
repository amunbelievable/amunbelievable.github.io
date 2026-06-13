import { test, expect } from '@playwright/test';

test('open a case and return to its position via Назад', async ({ page }) => {
  await page.goto('/');
  await page.locator('#preloader').waitFor({ state: 'hidden' }).catch(() => {});

  await page.locator('[data-case-link="crasher"]').click();
  await expect(page).toHaveURL(/\/cases\/crasher\/?$/);
  await expect(page.getByRole('heading', { name: /Бренд-менеджмент выхода на Мексику/i })).toBeVisible();

  await page.getByRole('link', { name: /назад/i }).click();
  await expect(page).toHaveURL(/\/(#case-crasher)?$/);
  // NOTE: exact-position restoration hardened in Task 10
  await expect(page.locator('#case-crasher')).toBeVisible();
});
