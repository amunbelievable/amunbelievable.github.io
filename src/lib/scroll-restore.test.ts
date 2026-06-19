import { describe, it, expect } from 'vitest';
import { resolveTargetCase } from './scroll-restore';

describe('resolveTargetCase', () => {
  it('returns the case slug from a #case- hash', () => {
    expect(resolveTargetCase('#case-crasher')).toBe('crasher');
  });
  it('returns null when there is no hash', () => {
    expect(resolveTargetCase('')).toBeNull();
  });
  it('ignores hashes that are not case anchors', () => {
    expect(resolveTargetCase('#hero')).toBeNull();
  });
});
