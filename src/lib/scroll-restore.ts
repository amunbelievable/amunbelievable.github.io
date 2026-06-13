const CASE_HASH = /^#case-(.+)$/;

export function resolveTargetCase(hash: string, stored: string | null): string | null {
  const m = hash.match(CASE_HASH);
  if (m) return m[1];
  if (stored) return stored;
  return null;
}
