export type GitHubApiErrorKind =
  | 'network'
  | 'aborted'
  | 'invalid-request'
  | 'rate-limit'
  | 'not-found'
  | 'validation'
  | 'server'
  | 'http'
  | 'unknown';

export interface GitHubValidationError {
  resource?: string;
  field?: string;
  code?: string;
  message?: string;
}

export interface GitHubApiErrorOptions {
  kind: GitHubApiErrorKind;
  status?: number;
  documentationUrl?: string;
  validationErrors?: readonly GitHubValidationError[];
  retryAfterSeconds?: number;
  rateLimitResetAt?: number;
  cause?: unknown;
}

export class GitHubApiError extends Error {
  readonly kind: GitHubApiErrorKind;
  readonly status: number | undefined;
  readonly documentationUrl: string | undefined;
  readonly validationErrors: readonly GitHubValidationError[];
  readonly retryAfterSeconds: number | undefined;
  readonly rateLimitResetAt: number | undefined;

  constructor(message: string, options: GitHubApiErrorOptions) {
    super(message, { cause: options.cause });
    this.name = 'GitHubApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.documentationUrl = options.documentationUrl;
    this.validationErrors = options.validationErrors ?? [];
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.rateLimitResetAt = options.rateLimitResetAt;
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}