import { describe, it, expect } from 'vitest';
import { renderRichText } from './richtext';

describe('renderRichText', () => {
  it('returns empty string for empty input', () => {
    expect(renderRichText('')).toBe('');
  });
  it('wraps **bold** in <strong>', () => {
    expect(renderRichText('это **важно** да')).toBe('это <strong>важно</strong> да');
  });
  it('renders [text](https url) as a safe link', () => {
    expect(renderRichText('см. [сайт](https://example.com)')).toBe(
      'см. <a href="https://example.com" target="_blank" rel="noopener noreferrer">сайт</a>',
    );
  });
  it('allows mailto links', () => {
    expect(renderRichText('[почта](mailto:a@b.com)')).toBe(
      '<a href="mailto:a@b.com" target="_blank" rel="noopener noreferrer">почта</a>',
    );
  });
  it('escapes HTML to prevent injection', () => {
    expect(renderRichText('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
  it('does NOT linkify unsafe (javascript:) urls', () => {
    expect(renderRichText('[x](javascript:alert(1))')).toBe('[x](javascript:alert(1))');
  });
  it('preserves newlines (left for white-space: pre-line)', () => {
    expect(renderRichText('a\nb')).toBe('a\nb');
  });
  it('handles bold and link together', () => {
    expect(renderRichText('**жирно** и [ссылка](https://x.io)')).toBe(
      '<strong>жирно</strong> и <a href="https://x.io" target="_blank" rel="noopener noreferrer">ссылка</a>',
    );
  });
});
