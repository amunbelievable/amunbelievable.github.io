const CASE_HASH = /^#case-(.+)$/;

// Restore the case position ONLY from an explicit "#case-…" hash (left by the
// in-page "Назад" button). We deliberately do NOT fall back to any stored
// "last visited case": that fallback made the favicon/home link land on a case
// instead of the hero whenever the user had previously opened one.
export function resolveTargetCase(hash: string): string | null {
  const m = hash.match(CASE_HASH);
  return m ? m[1] : null;
}
