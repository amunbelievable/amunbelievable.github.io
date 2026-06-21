import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

// Regression: with history.scrollRestoration='manual' suppressing ClientRouter's
// own scroll reset, a case opened from a scrolled-down home used to inherit the
// home scroll position and open scrolled down. It must open at the top.
test('a case opened from a scrolled-down home lands at the top', async ({ page }) => {
  await page.goto('/');
  await page.locator('#preloader').waitFor({ state: 'hidden' }).catch(() => {});

  // End the lockScrollTo hold, then scroll home down (instant, so smooth-scroll
  // + snap don't fight the measurement).
  await page.waitForTimeout(800);
  await page.evaluate(() => window.dispatchEvent(new Event('wheel')));
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 1_000_000);
  });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

  await page.locator('[data-case-link="raff"]').first().click();
  await page.waitForURL(/\/cases\/raff\/?$/);
  await page.waitForTimeout(400);

  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
