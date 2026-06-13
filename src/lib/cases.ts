export interface CaseLike {
  id: string;
  data: { order: number };
}

export function sortCases<T extends CaseLike>(cases: T[]): T[] {
  return [...cases].sort((a, b) => a.data.order - b.data.order);
}
