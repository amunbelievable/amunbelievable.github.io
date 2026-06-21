import { test, expect } from '@playwright/test';

test('case detail carousel switches slides (media + text)', async ({ page }) => {
  await page.goto('/cases/punchbet/');

  const t0 = page.locator('[data-text="0"]');
  const t1 = page.locator('[data-text="1"]');

  // Slide 1 active by default
  await expect(t0).toBeVisible();
  await expect(t1).toBeHidden();
  await expect(page.locator('[data-dot]')).toHaveCount(11);
  await expect(page.locator('.banner__slide.is-active')).toHaveCount(1);

  // Next -> slide 2 (its own text becomes visible, slide 1 hidden)
  await page.locator('[data-next]').click();
  await expect(t1).toBeVisible();
  await expect(t0).toBeHidden();
  await expect(page.locator('[data-slide="1"]')).toHaveClass(/is-active/);

  // Dot back to slide 1
  await page.locator('[data-dot="0"]').click();
  await expect(t0).toBeVisible();
  await expect(t1).toBeHidden();
});

test('casetype hashtags show on homepage preview but not on the detail page', async ({ page }) => {
  await page.goto('/');
  await page.locator('#preloader').waitFor({ state: 'hidden' }).catch(() => {});
  await expect(page.locator('#case-punchbet .case__type')).toContainText('#igaming');

  await page.goto('/cases/punchbet/');
  await expect(page.locator('.case__type')).toHaveCount(0);
});
