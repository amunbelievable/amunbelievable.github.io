import { test, expect } from '@playwright/test';

test('favicon and open graph meta are present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.png');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Anton Malakhovskiy');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    'Senior Creator & Brand Manager portfolio',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/favicon\.png$/);
});
