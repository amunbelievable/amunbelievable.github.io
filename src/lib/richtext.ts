const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const BOLD = /\*\*([^*]+)\*\*/g;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Minimal, safe rich-text for case-slide descriptions.
 * Supports **bold** and [text](url) links. Everything else is escaped.
 * Only http(s), mailto, tel and site-relative (/...) URLs are linkified.
 */
export function renderRichText(input: string): string {
  if (!input) return '';
  let s = escapeHtml(input);
  s = s.replace(LINK, (whole, text, url) => {
    const safe = /^(https?:\/\/|mailto:|tel:|\/)/i.test(url);
    if (!safe) return whole;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  s = s.replace(BOLD, '<strong>$1</strong>');
  return s;
}
