import { ApiErrorState } from '../../../components/ui/ApiErrorState';

interface SearchErrorProps {
  error: Error | null;
  onRetry: () => void;
  retryLabel?: string;
  notFoundTitle?: string;
}

export function SearchError({
  error,
  onRetry,
  retryLabel = 'Retry search',
  notFoundTitle = 'The requested GitHub resource was not found.',
}: SearchErrorProps) {
  return (
    <ApiErrorState
      error={error}
      onRetry={onRetry}
      retryLabel={retryLabel}
      notFoundTitle={notFoundTitle}
    />
  );
}

interface SearchLoadingProps {
  searchType: 'repository' | 'user';
}

export function SearchLoading({ searchType }: SearchLoadingProps) {
  const label = searchType === 'repository' ? 'repositories' : 'people';
  return (
    <div className="loading-results" role="status" aria-label={`Loading ${label}`}>
      <span className="sr-only">Loading {label}…</span>
      {[0, 1, 2].map((item) => (
        <div className="loading-card" aria-hidden="true" key={item}>
          <span className="loading-card__line loading-card__line--title" />
          <span className="loading-card__line" />
          <span className="loading-card__line loading-card__line--short" />
        </div>
      ))}
    </div>
  );
}
