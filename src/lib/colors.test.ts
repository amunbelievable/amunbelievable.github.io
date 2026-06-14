import { describe, it, expect } from 'vitest';
import { parseHex, pickTextColor, resolveCaseColors } from './colors';

describe('parseHex', () => {
  it('parses 6-digit hex', () => {
    expect(parseHex('#112233')).toEqual([17, 34, 51]);
  });
  it('parses 3-digit shorthand', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
  });
  it('tolerates a missing leading #', () => {
    expect(parseHex('000000')).toEqual([0, 0, 0]);
  });
  it('returns null for invalid input', () => {
    expect(parseHex('nope')).toBeNull();
  });
});

describe('pickTextColor', () => {
  it('returns black on a white background', () => {
    expect(pickTextColor('#ffffff')).toBe('black');
  });
  it('returns white on a black background', () => {
    expect(pickTextColor('#000000')).toBe('white');
  });
  it('returns white on a near-black background', () => {
    expect(pickTextColor('#101010')).toBe('white');
  });
  it('returns black on a bright yellow background', () => {
    expect(pickTextColor('#ffeb3b')).toBe('black');
  });
  it('defaults to black for an unparseable color', () => {
    expect(pickTextColor('bogus')).toBe('black');
  });
});

describe('resolveCaseColors', () => {
  it('defaults to white background + black text when nothing is set', () => {
    expect(resolveCaseColors(undefined, undefined)).toEqual({ bg: '#ffffff', fg: '#000000' });
  });
  it('auto-picks white text for a dark background', () => {
    expect(resolveCaseColors('#101010', undefined)).toEqual({ bg: '#101010', fg: '#ffffff' });
  });
  it('honors an explicit fg override', () => {
    expect(resolveCaseColors('#ffffff', 'white')).toEqual({ bg: '#ffffff', fg: '#ffffff' });
  });
});
