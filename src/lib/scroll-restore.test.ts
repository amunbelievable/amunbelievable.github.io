import { describe, it, expect } from 'vitest';
import { resolveTargetCase } from './scroll-restore';

describe('resolveTargetCase', () => {
  it('prefers hash over stored value', () => {
    expect(resolveTargetCase('#case-crasher', 'other')).toBe('crasher');
  });
  it('falls back to stored value when no hash', () => {
    expect(resolveTargetCase('', 'crasher')).toBe('crasher');
  });
  it('returns null when nothing applies', () => {
    expect(resolveTargetCase('', null)).toBeNull();
  });
  it('ignores hashes that are not case anchors', () => {
    expect(resolveTargetCase('#hero', null)).toBeNull();
  });
});
