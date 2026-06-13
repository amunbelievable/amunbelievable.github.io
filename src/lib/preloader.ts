export function shouldShowPreloader(sessionFlag: string | null): boolean {
  return sessionFlag === null;
}
