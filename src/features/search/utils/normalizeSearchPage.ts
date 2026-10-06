export const SEARCH_RESULT_LIMIT = 1_000;
export const SEARCH_PAGE_SIZE = 20;

export function normalizeSearchPage(value: string | number | null): number {
  const page = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return Math.min(page, SEARCH_RESULT_LIMIT / SEARCH_PAGE_SIZE);
}
