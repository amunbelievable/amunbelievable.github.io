import { describe, it, expect } from 'vitest';
import { shouldShowPreloader } from './preloader';

describe('shouldShowPreloader', () => {
  it('shows when no session flag set', () => {
    expect(shouldShowPreloader(null)).toBe(true);
  });
  it('does not show when already shown this session', () => {
    expect(shouldShowPreloader('1')).toBe(false);
  });
});
