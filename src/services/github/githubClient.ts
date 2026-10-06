import {
  GitHubApiError,
  isAbortError,
  type GitHubApiErrorKind,
  type GitHubValidationError,
} from './githubErrors';

const GITHUB_API_BASE_URL = 'https://api.github.com/';

type QueryParameters = Record<string, string | number | undefined>;

interface GitHubRequestOptions {
  query?: QueryParameters;
  signal?: AbortSignal;
}

interface GitHubErrorPayload {
  message?: string;
  documentation_url?: string;
  errors?: GitHubValidationError[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseValidationErrors(value: unknown): GitHubValidationError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry): GitHubValidationError[] => {
    if (!isRecord(entry)) {
      return typeof entry === 'string' ? [{ message: entry }] : [];
    }

    const result: GitHubValidationError = {};
    if (typeof entry.resource === 'string') result.resource = entry.resource;
    if (typeof entry.field === 'string') result.field = entry.field;
    if (typeof entry.code === 'string') result.code = entry.code;
    if (typeof entry.message === 'string') result.message = entry.message;
    return [result];
  });
}

function parseErrorPayload(value: unknown): GitHubErrorPayload {
  if (!isRecord(value)) {
    return {};
  }

  return {
    message: typeof value.message === 'string' ? value.message : undefined,
    documentation_url:
      typeof value.documentation_url === 'string' ? value.documentation_url : undefined,
    errors: parseValidationErrors(value.errors),
  };
}

async function readErrorPayload(response: Response): Promise<GitHubErrorPayload> {
  const body = await response.text();
  if (!body) {
    return {};
  }

  try {
    return parseErrorPayload(JSON.parse(body) as unknown);
  } catch {
    return { message: body };
  }
}

function createHttpError(
  response: Response,
  payload: GitHubErrorPayload,
): GitHubApiError {
  const isRateLimited =
    response.status === 429 ||
    (response.status === 403 &&
      (response.headers.get('x-ratelimit-remaining') === '0' ||
        payload.message?.toLowerCase().includes('rate limit') === true));

  let kind: GitHubApiErrorKind = 'http';
  if (response.status === 400) kind = 'invalid-request';
  else if (isRateLimited) kind = 'rate-limit';
  else if (response.status === 404) kind = 'not-found';
  else if (response.status === 422) kind = 'validation';
  else if (response.status >= 500) kind = 'server';

  const defaultMessages: Record<GitHubApiErrorKind, string> = {
    network: 'Unable to connect to the GitHub API.',
    aborted: 'The GitHub API request was cancelled.',
    'invalid-request': 'GitHub could not process the request.',
    'rate-limit': 'The GitHub API rate limit has been reached.',
    'not-found': 'The requested GitHub resource was not found.',
    validation: 'GitHub rejected the request because of validation errors.',
    server: 'The GitHub API encountered a server error.',
    http: `The GitHub API request failed with status ${response.status}.`,
    unknown: 'An unexpected GitHub API error occurred.',
  };

  const retryAfter = response.headers.get('retry-after');
  const resetAt = response.headers.get('x-ratelimit-reset');

  return new GitHubApiError(payload.message || defaultMessages[kind], {
    kind,
    status: response.status,
    documentationUrl: payload.documentation_url,
    validationErrors: payload.errors,
    retryAfterSeconds: retryAfter ? Number(retryAfter) : undefined,
    rateLimitResetAt: resetAt ? Number(resetAt) : undefined,
  });
}

function createRequestFailure(error: unknown, signal?: AbortSignal): GitHubApiError {
  if (signal?.aborted || isAbortError(error)) {
    return new GitHubApiError('The GitHub API request was cancelled.', {
      kind: 'aborted',
      cause: error,
    });
  }
  if (error instanceof GitHubApiError) {
    return error;
  }
  if (error instanceof TypeError) {
    return new GitHubApiError('Unable to connect to the GitHub API.', {
      kind: 'network',
      cause: error,
    });
  }
  return new GitHubApiError('An unexpected GitHub API error occurred.', {
    kind: 'unknown',
    cause: error,
  });
}

function buildUrl(path: string, query?: QueryParameters): URL {
  const url = new URL(path, GITHUB_API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url;
}

export async function githubRequest<T>(
  path: string,
  options: GitHubRequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: options.signal,
    });
  } catch (error) {
    throw createRequestFailure(error, options.signal);
  }

  if (!response.ok) {
    let payload: GitHubErrorPayload;
    try {
      payload = await readErrorPayload(response);
    } catch (error) {
      throw createRequestFailure(error, options.signal);
    }
    throw createHttpError(response, payload);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    const requestFailure = createRequestFailure(error, options.signal);
    if (requestFailure.kind !== 'unknown') {
      throw requestFailure;
    }
    throw new GitHubApiError('GitHub returned a response that could not be read as JSON.', {
      kind: 'unknown',
      status: response.status,
      cause: error,
    });
  }
}