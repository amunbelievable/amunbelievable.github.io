import { describe, it, expect } from 'vitest';
import { sortCases } from './cases';

describe('sortCases', () => {
  it('sorts by ascending order field', () => {
    const input = [
      { id: 'b', data: { order: 2 } },
      { id: 'a', data: { order: 1 } },
      { id: 'c', data: { order: 3 } },
    ];
    expect(sortCases(input as any).map((c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input array', () => {
    const input = [
      { id: 'b', data: { order: 2 } },
      { id: 'a', data: { order: 1 } },
    ];
    sortCases(input as any);
    expect(input.map((c) => c.id)).toEqual(['b', 'a']);
  });
});
