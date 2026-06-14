import { test, expect } from '@playwright/test';

test('case detail carousel switches media and text', async ({ page }) => {
  await page.goto('/cases/punchbet/');

  const t0 = page.locator('[data-text="0"]');
  const t1 = page.locator('[data-text="1"]');

  // Slide 1 active by default
  await expect(t0).toBeVisible();
  await expect(t1).toBeHidden();
  await expect(t0).toContainText('Создание web-продукта');
  await expect(page.locator('[data-dot]')).toHaveCount(2);
  await expect(page.locator('.banner__slide.is-active')).toHaveCount(1);

  // Next -> slide 2 (text changes with the banner)
  await page.locator('[data-next]').click();
  await expect(t1).toBeVisible();
  await expect(t0).toBeHidden();
  await expect(t1).toContainText('Welcome-офер');
  await expect(page.locator('[data-slide="1"]')).toHaveClass(/is-active/);

  // Dot back to slide 1
  await page.locator('[data-dot="0"]').click();
  await expect(t0).toBeVisible();
  await expect(t1).toBeHidden();
});

test('single-slide case has no pager', async ({ page }) => {
  await page.goto('/cases/crasher/');
  await expect(page.locator('[data-dot]')).toHaveCount(0);
  await expect(page.locator('[data-next]')).toHaveCount(0);
  await expect(page.locator('[data-text="0"]')).toBeVisible();
});
