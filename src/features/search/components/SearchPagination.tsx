interface SearchPaginationProps {
  page: number;
  totalCount: number;
  pageSize: number;
  isPlaceholderData: boolean;
  onPageChange: (page: number) => void;
}

export function SearchPagination({
  page,
  totalCount,
  pageSize,
  isPlaceholderData,
  onPageChange,
}: SearchPaginationProps) {
  const maxResults = Math.min(totalCount, 1_000);
  const hasNextPage = page * pageSize < maxResults;

  return (
    <nav className="search-pagination" aria-label="Search results pages">
      <button
        className="pagination-button"
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="search-pagination__page" aria-live="polite">
        Page {page}
      </span>
      <button
        className="pagination-button"
        type="button"
        disabled={!hasNextPage || isPlaceholderData}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
