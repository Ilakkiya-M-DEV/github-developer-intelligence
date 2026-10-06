import { GitHubApiError } from '../../services/github/githubErrors';

interface ApiErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  retryLabel: string;
  notFoundTitle?: string;
}

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

function getErrorMessage(
  error: Error,
  notFoundTitle: string,
): { title: string; detail: string | null; retryable: boolean } {
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
        title: notFoundTitle,
        detail: 'Check the name or address and try again.',
        retryable: false,
      };
    case 'invalid-request':
    case 'validation':
      return {
        title: 'GitHub could not process this request.',
        detail: 'Check the request and try again.',
        retryable: false,
      };
    case 'http':
      if (error.status === 403) {
        return {
          title: 'GitHub denied this request.',
          detail: 'This resource may not be publicly accessible.',
          retryable: false,
        };
      }
      return {
        title: 'GitHub is having trouble completing this request.',
        detail: 'Please try again in a moment.',
        retryable: true,
      };
    case 'server':
    case 'unknown':
      return {
        title: 'GitHub is having trouble completing this request.',
        detail: 'Please try again in a moment.',
        retryable: true,
      };
    case 'aborted':
      return {
        title: 'Request was cancelled.',
        detail: null,
        retryable: false,
      };
  }
}

export function ApiErrorState({
  error,
  onRetry,
  retryLabel,
  notFoundTitle = 'The requested GitHub resource was not found.',
}: ApiErrorStateProps) {
  if (!error) return null;

  const message = getErrorMessage(error, notFoundTitle);

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
