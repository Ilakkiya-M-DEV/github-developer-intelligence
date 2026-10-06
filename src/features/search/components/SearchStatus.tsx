import { GitHubApiError } from '../../../services/github/githubErrors';

function retryTime(error: GitHubApiError): string | null {
  let retryAt: Date | null = null;

  if (error.rateLimitResetAt !== undefined) {
    retryAt = new Date(error.rateLimitResetAt * 1_000);
  } else if (error.retryAfterSeconds !== undefined) {
    retryAt = new Date(Date.now() + error.retryAfterSeconds * 1_000);
  }

  return retryAt && !Number.isNaN(retryAt.getTime())
    ? retryAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;
}

function getErrorMessage(error: Error): { title: string; detail: string | null; retryable: boolean } {
  if (!(error instanceof GitHubApiError)) {
    return {
      title: 'Something unexpected happened.',
      detail: 'Please try again in a moment.',
      retryable: true,
    };
  }

  switch (error.kind) {
    case 'network':
      return {
        title: 'Could not connect to GitHub.',
        detail: 'Check your internet connection and try again.',
        retryable: true,
      };
    case 'rate-limit': {
      const time = retryTime(error);
      return {
        title: 'GitHub requests are temporarily rate-limited.',
        detail: time ? `You can try again after ${time}.` : 'Please wait a little before trying again.',
        retryable: false,
      };
    }
    case 'not-found':
      return {
        title: 'The requested GitHub resource was not found.',
        detail: 'Try a different search term.',
        retryable: false,
      };
    case 'invalid-request':
    case 'validation':
      return {
        title: 'GitHub could not process this search.',
        detail: 'Check the search term and try again.',
        retryable: false,
      };
    case 'server':
    case 'http':
    case 'unknown':
      return {
        title: 'GitHub is having trouble completing this request.',
        detail: 'Please try again in a moment.',
        retryable: true,
      };
    case 'aborted':
      return {
        title: 'Search was cancelled.',
        detail: null,
        retryable: false,
      };
  }
}

interface SearchErrorProps {
  error: Error | null;
  onRetry: () => void;
  retryLabel?: string;
}

export function SearchError({
  error,
  onRetry,
  retryLabel = 'Retry search',
}: SearchErrorProps) {
  if (!error) return null;

  const message = getErrorMessage(error);

  return (
    <section className="search-message search-message--error" role="alert">
      <h2>{message.title}</h2>
      {message.detail && <p>{message.detail}</p>}
      {message.retryable && (
        <button className="action-button" type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </section>
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
