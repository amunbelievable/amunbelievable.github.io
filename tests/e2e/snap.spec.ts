import { test, expect } from '@playwright/test';
test('scroll snap is on the document root', async ({ page }) => {
  await page.goto('/');
  await page.locator('#preloader').waitFor({ state: 'hidden' }).catch(() => {});
  // On load, restoreScroll() parks the hero with snap temporarily disabled
  // (lockScrollTo) until the first touch. Simulate that touch so we observe the
  // resting CSS snap value rather than the transient inline 'none'.
  await page.evaluate(() => window.dispatchEvent(new Event('touchstart')));
  const snapType = await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType);
  expect(snapType).toContain('mandatory');
  const heroSnap = await page.evaluate(() => {
    const h = document.getElementById('hero');
    return h ? getComputedStyle(h).scrollSnapAlign : '';
  });
  expect(heroSnap).toBe('start');
});
