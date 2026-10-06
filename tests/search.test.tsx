import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../src/components/layout/Header';
import { SearchPagination } from '../src/features/search/components/SearchPagination';
import { SearchError } from '../src/features/search/components/SearchStatus';
import { useGithubSearch } from '../src/features/search/hooks/useGithubSearch';
import { useDebounce } from '../src/hooks/useDebounce';
import SearchPage from '../src/pages/SearchPage';
import { githubApi } from '../src/services/github/githubApi';
import { GitHubApiError } from '../src/services/github/githubErrors';
import type { GitHubRepository } from '../src/services/github/types';
import { normalizeSearchPage } from '../src/features/search/utils/normalizeSearchPage';

function SearchLocation() {
  const location = useLocation();
  return <output data-testid="search-location">{`${location.pathname}${location.search}`}</output>;
}

function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  return queryClient;
}

function createQueryWrapper() {
  const queryClient = createQueryClient();
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function renderSearchAt(entry: string) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[entry]}>
        <Header />
        <SearchPage />
        <SearchLocation />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('normalizeSearchPage', () => {
  it.each([
    [null, 1],
    ['', 1],
    ['invalid', 1],
    ['0', 1],
    ['-3', 1],
    ['1.5', 1],
    ['1', 1],
    ['25', 25],
    ['50', 50],
    ['51', 50],
    ['999', 50],
    [Number.NaN, 1],
    [0, 1],
    [-1, 1],
    [51, 50],
  ])('normalizes page %s to %s', (value, expected) => {
    expect(normalizeSearchPage(value)).toBe(expected);
  });
});

describe('useDebounce', () => {
  it('emits the latest value after the delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 350),
      { initialProps: { value: 'react' } },
    );

    rerender({ value: 'typescript' });
    act(() => vi.advanceTimersByTime(349));
    expect(result.current).toBe('react');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('typescript');
  });
});

describe('useGithubSearch', () => {
  it('does not query terms shorter than the minimum', () => {
    const request = vi.spyOn(githubApi, 'searchRepositories');
    const { result } = renderHook(
      () => useGithubSearch('repository', 'x', 1),
      { wrapper: createQueryWrapper() },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(request).not.toHaveBeenCalled();
  });

  it('passes the query cancellation signal to the API and cancels obsolete searches', async () => {
    const signals: AbortSignal[] = [];
    vi.spyOn(githubApi, 'searchRepositories').mockImplementation(
      (_query, options) => {
        if (options?.signal) signals.push(options.signal);
        return new Promise((_resolve, reject) => {
          options?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Request aborted', 'AbortError')),
            { once: true },
          );
        });
      },
    );

    const { rerender } = renderHook(
      ({ term }) => useGithubSearch('repository', term, 1),
      { initialProps: { term: 'react' }, wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(signals).toHaveLength(1));
    rerender({ term: 'typescript' });
    await waitFor(() => expect(signals).toHaveLength(2));
    expect(signals[0].aborted).toBe(true);
  });
});

describe('search presentation states', () => {
  it('shows the initial empty-search guidance without requesting results', () => {
    const request = vi.spyOn(githubApi, 'searchRepositories');
    renderSearchAt('/');

    expect(screen.getByRole('heading', { name: 'Find your next open-source signal' })).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });

  it('clears the search term and page after a browser refresh', async () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { entryType: 'navigation', type: 'reload' } as PerformanceNavigationTiming,
    ]);
    const request = vi.spyOn(githubApi, 'searchRepositories');

    renderSearchAt('/?q=react&page=3&type=user');

    await waitFor(() => {
      expect(screen.getByTestId('search-location').textContent).toBe('/?type=user');
    });
    expect((screen.getByRole('searchbox', { name: 'Search GitHub' }) as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('heading', { name: 'Find your next open-source signal' })).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });

  it('runs the current search immediately when the Search button is submitted', async () => {
    const request = vi.spyOn(githubApi, 'searchRepositories').mockResolvedValue({
      total_count: 0,
      incomplete_results: false,
      items: [],
    });
    renderSearchAt('/');

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search GitHub' }), {
      target: { value: 'react' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByRole('heading', { name: 'No repositories found for “react”.' })).toBeTruthy();
    expect(request).toHaveBeenCalledWith('react', expect.any(Object));
  });

  it('renders repository results from the URL-backed search', async () => {
    const repository: GitHubRepository = {
      id: 1,
      name: 'react',
      full_name: 'facebook/react',
      description: 'A declarative UI library',
      html_url: 'https://github.com/facebook/react',
      stargazers_count: 220_000,
      forks_count: 45_000,
      watchers_count: 220_000,
      open_issues_count: 1_200,
      language: 'JavaScript',
      created_at: '2013-05-24T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
      pushed_at: '2026-10-01T00:00:00Z',
      default_branch: 'main',
      owner: {
        id: 2,
        login: 'facebook',
        avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
        html_url: 'https://github.com/facebook',
        type: 'Organization',
      },
    };
    vi.spyOn(githubApi, 'searchRepositories').mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: [repository],
    });

    renderSearchAt('/?q=react');

    expect(await screen.findByRole('heading', { name: 'react' })).toBeTruthy();
    expect(screen.getByText('A declarative UI library')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'facebook/react on GitHub (opens in a new tab)' })
        .getAttribute('rel'),
    ).toBe('noopener noreferrer');
  });

  it('links repository search results to the in-app repository route', async () => {
    vi.spyOn(githubApi, 'searchRepositories').mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          name: 'react',
          full_name: 'facebook/react',
          description: null,
          html_url: 'https://github.com/facebook/react',
          stargazers_count: 10,
          forks_count: 2,
          watchers_count: 10,
          open_issues_count: 1,
          language: 'JavaScript',
          created_at: '2013-05-24T00:00:00Z',
          updated_at: '2026-10-01T00:00:00Z',
          pushed_at: '2026-10-01T00:00:00Z',
          default_branch: 'main',
          owner: {
            id: 2,
            login: 'facebook',
            avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
            html_url: 'https://github.com/facebook',
            type: 'Organization',
          },
        },
      ],
    });
    renderSearchAt('/?q=react');

    const repositoryLink = await screen.findByRole('link', { name: 'View insights' });
    expect(repositoryLink.getAttribute('href')).toBe('/repositories/facebook/react');
    expect(screen.getByRole('link', {
      name: 'facebook/react on GitHub (opens in a new tab)',
    }).getAttribute('href')).toBe('https://github.com/facebook/react');
    fireEvent.click(repositoryLink);
    expect(screen.getByTestId('search-location').textContent).toBe('/repositories/facebook/react');
    const homeLink = screen.getByRole('link', { name: 'GitHub Developer Intelligence home' });
    expect(homeLink.getAttribute('href')).toBe('/?q=react');

    fireEvent.click(homeLink);
    expect(screen.getByTestId('search-location').textContent).toBe('/?q=react');
    expect((screen.getByRole('searchbox', { name: 'Search GitHub' }) as HTMLInputElement).value).toBe('react');
  });

  it('clamps an out-of-range URL page before it reaches the search API', async () => {
    const request = vi.spyOn(githubApi, 'searchRepositories').mockResolvedValue({
      total_count: 1_000,
      incomplete_results: false,
      items: [],
    });
    renderSearchAt('/?q=react&page=999');

    await waitFor(() => expect(request).toHaveBeenCalledWith(
      'react',
      expect.objectContaining({ page: 50 }),
    ));
    await waitFor(() => expect(screen.getByTestId('search-location').textContent).toBe('/?q=react&page=50'));
  });

  it('debounces rapid UI searches and keeps the latest term and result visible', async () => {
    vi.useFakeTimers();
    const request = vi.spyOn(githubApi, 'searchRepositories').mockImplementation(
      (term) => Promise.resolve({
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            id: term === 'typescript' ? 2 : 1,
            name: `${term}-result`,
            full_name: `example/${term}-result`,
            description: `Result for ${term}`,
            html_url: `https://github.com/example/${term}-result`,
            stargazers_count: 1,
            forks_count: 0,
            watchers_count: 1,
            open_issues_count: 0,
            language: 'TypeScript',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2026-10-01T00:00:00Z',
            pushed_at: '2026-10-01T00:00:00Z',
            default_branch: 'main',
            owner: {
              id: 3,
              login: 'example',
              avatar_url: 'https://avatars.githubusercontent.com/u/3?v=4',
              html_url: 'https://github.com/example',
              type: 'Organization',
            },
          },
        ],
      }),
    );
    renderSearchAt('/');
    const input = screen.getByRole('searchbox', { name: 'Search GitHub' });

    fireEvent.change(input, { target: { value: 'react' } });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.change(input, { target: { value: 'typescript' } });
    expect(screen.getByTestId('search-location').textContent).toBe('/?q=typescript');

    act(() => vi.advanceTimersByTime(349));
    expect(request).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    vi.useRealTimers();

    await waitFor(() => {
      expect(request).toHaveBeenCalledTimes(1);
      expect(request).toHaveBeenCalledWith('typescript', expect.any(Object));
    });
    expect(await screen.findByRole('heading', { name: 'typescript-result' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'react-result' })).toBeNull();
    expect(screen.getByTestId('search-location').textContent).toBe('/?q=typescript');
  });

  it('shows a useful empty result message', async () => {
    vi.spyOn(githubApi, 'searchRepositories').mockResolvedValue({
    total_count: 0,
    incomplete_results: false,
    items: [],
    });
    renderSearchAt('/?q=nothing-found');

    expect(
    await screen.findByRole('heading', { name: 'No repositories found for “nothing-found”.' }),
    ).toBeTruthy();
  });

  it('renders user search results without requesting profile details per result', async () => {
    const userSearch = vi.spyOn(githubApi, 'searchUsers').mockResolvedValue({
    total_count: 1,
    incomplete_results: false,
    items: [
      {
        id: 1,
        login: 'octocat',
        avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
        html_url: 'https://github.com/octocat',
        type: 'User',
      },
    ],
    });
    const profileRequest = vi.spyOn(githubApi, 'getUser');
    renderSearchAt('/?q=octocat&type=user');

    expect(await screen.findByRole('heading', { name: 'octocat' })).toBeTruthy();
    expect(
      screen.getByText('Follower, following, repository, and profile details load when requested.'),
    ).toBeTruthy();
    expect(userSearch).toHaveBeenCalledTimes(1);
    expect(profileRequest).not.toHaveBeenCalled();
  });

  it('loads and caches full user details only after selection', async () => {
    vi.spyOn(githubApi, 'searchUsers').mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          login: 'octocat',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          html_url: 'https://github.com/octocat',
          type: 'User',
        },
      ],
    });
    const profileRequest = vi.spyOn(githubApi, 'getUser').mockResolvedValue({
      id: 1,
      login: 'octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      html_url: 'https://github.com/octocat',
      type: 'User',
      name: 'The Octocat',
      location: 'San Francisco',
      followers: 8_000,
      following: 9,
      public_repos: 12,
    });
    renderSearchAt('/?q=octocat&type=user');

    expect(await screen.findByRole('heading', { name: 'octocat' })).toBeTruthy();
    expect(profileRequest).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Load profile details' }));
    expect(await screen.findByText('The Octocat (@octocat)')).toBeTruthy();
    expect(screen.getByText('San Francisco')).toBeTruthy();
    expect(screen.getByText('8,000')).toBeTruthy();
    expect(screen.getByText('9')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(profileRequest).toHaveBeenCalledOnce();
    expect(profileRequest.mock.calls[0][1]).toBeInstanceOf(AbortSignal);

    fireEvent.click(screen.getByRole('button', { name: 'Hide profile details' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load profile details' }));
    expect(await screen.findByText('The Octocat (@octocat)')).toBeTruthy();
    expect(profileRequest).toHaveBeenCalledOnce();
  });

  it('cancels a selected profile request when the profile is closed', async () => {
    let requestSignal: AbortSignal | undefined;
    vi.spyOn(githubApi, 'searchUsers').mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          login: 'octocat',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          html_url: 'https://github.com/octocat',
          type: 'User',
        },
      ],
    });
    vi.spyOn(githubApi, 'getUser').mockImplementation((_username, signal) => {
      requestSignal = signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener(
          'abort',
          () => reject(new DOMException('Request aborted', 'AbortError')),
          { once: true },
        );
      });
    });
    renderSearchAt('/?q=octocat&type=user');

    fireEvent.click(await screen.findByRole('button', { name: 'Load profile details' }));
    await waitFor(() => expect(requestSignal).toBeInstanceOf(AbortSignal));
    fireEvent.click(screen.getByRole('button', { name: 'Hide profile details' }));
    await waitFor(() => expect(requestSignal?.aborted).toBe(true));
  });

  it('shows a selected profile rate-limit error without a retry action', async () => {
    vi.spyOn(githubApi, 'searchUsers').mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: [
        {
          id: 1,
          login: 'octocat',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          html_url: 'https://github.com/octocat',
          type: 'User',
        },
      ],
    });
    vi.spyOn(githubApi, 'getUser').mockRejectedValue(
      new GitHubApiError('rate limited', {
        kind: 'rate-limit',
        retryAfterSeconds: 60,
      }),
    );
    renderSearchAt('/?q=octocat&type=user');

    fireEvent.click(await screen.findByRole('button', { name: 'Load profile details' }));
    expect(
      await screen.findByText('GitHub requests are temporarily rate-limited.'),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry profile request' })).toBeNull();
  });

  it('disables previous on page one and disables next after the last page', () => {
    const onPageChange = vi.fn();
    render(
      <SearchPagination
        page={1}
        totalCount={20}
        pageSize={20}
        isPlaceholderData={false}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Next' }).hasAttribute('disabled')).toBe(true);
  });

  it('changes to the next page when more results exist', () => {
    const onPageChange = vi.fn();
    render(
      <SearchPagination
        page={1}
        totalCount={21}
        pageSize={20}
        isPlaceholderData={false}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('does not offer an automatic retry for rate-limited searches', () => {
    render(
      <SearchError
        error={
          new GitHubApiError('rate limited', {
            kind: 'rate-limit',
            retryAfterSeconds: 60,
          })
        }
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain('rate-limited');
    expect(screen.queryByRole('button', { name: 'Retry search' })).toBeNull();
  });

  it('offers a manual retry for network failures', () => {
    const onRetry = vi.fn();
    render(
      <SearchError
        error={new GitHubApiError('fetch failed', { kind: 'network' })}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry search' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert').textContent).toContain('Check your internet connection');
  });
});
