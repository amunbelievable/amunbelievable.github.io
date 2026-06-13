import { test, expect } from '@playwright/test';
test('scroll snap is on the document root', async ({ page }) => {
  await page.goto('/');
  const snapType = await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType);
  expect(snapType).toContain('mandatory');
  const heroSnap = await page.evaluate(() => {
    const h = document.getElementById('hero');
    return h ? getComputedStyle(h).scrollSnapAlign : '';
  });
  expect(heroSnap).toBe('start');
});
