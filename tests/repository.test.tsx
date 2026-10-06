import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from '../src/app/providers';
import RepositoryPage from '../src/pages/RepositoryPage';
import { githubApi } from '../src/services/github/githubApi';
import { GitHubApiError } from '../src/services/github/githubErrors';
import type { GitHubIssue, GitHubRepository } from '../src/services/github/types';

const repository: GitHubRepository = {
  id: 11,
  name: 'project',
  full_name: 'acme/project',
  description: 'An example repository',
  html_url: 'https://github.com/acme/project',
  stargazers_count: 1_250,
  forks_count: 120,
  watchers_count: 1_100,
  open_issues_count: 2,
  language: 'TypeScript',
  created_at: '2024-01-14T00:00:00Z',
  updated_at: '2026-10-06T00:00:00Z',
  pushed_at: '2026-10-06T00:00:00Z',
  default_branch: 'main',
  owner: {
    id: 12,
    login: 'acme',
    avatar_url: 'https://avatars.githubusercontent.com/u/12?v=4',
    html_url: 'https://github.com/acme',
    type: 'Organization',
  },
};

function makeIssue(overrides: Partial<GitHubIssue> = {}): GitHubIssue {
  return {
    id: 31,
    number: 7,
    title: 'Improve the example',
    body: null,
    state: 'open',
    html_url: 'https://github.com/acme/project/issues/7',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-05T00:00:00Z',
    closed_at: null,
    user: {
      id: 12,
      login: 'octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/12?v=4',
      html_url: 'https://github.com/octocat',
      type: 'User',
    },
    ...overrides,
  };
}

function renderRepository() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/repositories/acme/project']}>
        <Routes>
          <Route path="/repositories/:owner/:repo" element={<RepositoryPage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('repository details page', () => {
  it('shows a repository loading state', () => {
    vi.spyOn(githubApi, 'getRepository').mockReturnValue(new Promise(() => {}));
    vi.spyOn(githubApi, 'getRepositoryIssues').mockReturnValue(new Promise(() => {}));
    renderRepository();

    expect(screen.getByRole('status', { name: 'Loading repository' })).toBeTruthy();
  });

  it('renders repository details and recent issues while filtering pull requests', async () => {
    vi.spyOn(githubApi, 'getRepository').mockResolvedValue(repository);
    vi.spyOn(githubApi, 'getRepositoryIssues').mockResolvedValue([
      makeIssue(),
      makeIssue({
        id: 32,
        number: 8,
        title: 'This is a pull request',
        pull_request: { url: 'https://api.github.com/repos/acme/project/pulls/8' },
      }),
    ]);
    renderRepository();

    expect(await screen.findByRole('heading', { name: 'project' })).toBeTruthy();
    expect(screen.getByText('1.3K')).toBeTruthy();
    expect(screen.getByText('Watchers')).toBeTruthy();
    expect(screen.getByText('Default branch')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Improve the example' })).toBeTruthy();
    expect(screen.queryByText('This is a pull request')).toBeNull();
    expect(screen.getByText(/Created 1 Oct 2026/)).toBeTruthy();
    expect(githubApi.getRepository).toHaveBeenCalledWith(
      'acme',
      'project',
      expect.any(AbortSignal),
    );
    expect(githubApi.getRepositoryIssues).toHaveBeenCalledWith(
      'acme',
      'project',
      expect.objectContaining({ page: 1, perPage: 10, signal: expect.any(AbortSignal) }),
    );
  });

  it('keeps repository details visible while issues are loading', async () => {
    vi.spyOn(githubApi, 'getRepository').mockResolvedValue(repository);
    vi.spyOn(githubApi, 'getRepositoryIssues').mockReturnValue(new Promise(() => {}));
    renderRepository();

    expect(await screen.findByRole('heading', { name: 'project' })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Loading recent issues' })).toBeTruthy();
  });

  it('shows an empty state when there are no issues', async () => {
    vi.spyOn(githubApi, 'getRepository').mockResolvedValue(repository);
    vi.spyOn(githubApi, 'getRepositoryIssues').mockResolvedValue([]);
    renderRepository();

    expect(await screen.findByRole('heading', { name: 'No recent issues' })).toBeTruthy();
  });

  it('shows an empty state when all returned entries are pull requests', async () => {
    vi.spyOn(githubApi, 'getRepository').mockResolvedValue(repository);
    vi.spyOn(githubApi, 'getRepositoryIssues').mockResolvedValue([
      makeIssue({
        pull_request: { url: 'https://api.github.com/repos/acme/project/pulls/7' },
      }),
    ]);
    renderRepository();

    expect(await screen.findByRole('heading', { name: 'No recent issues' })).toBeTruthy();
  });

  it('shows a repository not-found error without offering a retry', async () => {
    vi.spyOn(githubApi, 'getRepository').mockRejectedValue(
      new GitHubApiError('Not Found', { kind: 'not-found', status: 404 }),
    );
    vi.spyOn(githubApi, 'getRepositoryIssues');
    renderRepository();

    expect(await screen.findByText('Repository not found.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry repository' })).toBeNull();
    expect(githubApi.getRepositoryIssues).not.toHaveBeenCalled();
  });

  it('retries a repository network failure when requested', async () => {
    const request = vi.spyOn(githubApi, 'getRepository')
      .mockRejectedValue(new GitHubApiError('offline', { kind: 'network' }));
    vi.spyOn(githubApi, 'getRepositoryIssues').mockResolvedValue([]);
    renderRepository();

    await screen.findByRole('button', { name: 'Retry repository' });
    request.mockResolvedValueOnce(repository);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry repository' }));
    expect(await screen.findByRole('heading', { name: 'project' })).toBeTruthy();
  });

  it('keeps repository details visible and offers retry when issues fail', async () => {
    vi.spyOn(githubApi, 'getRepository').mockResolvedValue(repository);
    const issueRequest = vi.spyOn(githubApi, 'getRepositoryIssues')
      .mockRejectedValue(new GitHubApiError('offline', { kind: 'network' }));
    renderRepository();

    expect(await screen.findByRole('heading', { name: 'project' })).toBeTruthy();
    await screen.findByRole('button', { name: 'Retry issues' });
    issueRequest.mockResolvedValueOnce([makeIssue()]);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry issues' }));
    expect(await screen.findByRole('heading', { name: 'Improve the example' })).toBeTruthy();
  });

  it('shows an independent issue rate-limit error and does not offer retry', async () => {
    vi.spyOn(githubApi, 'getRepository').mockResolvedValue(repository);
    vi.spyOn(githubApi, 'getRepositoryIssues').mockRejectedValue(
      new GitHubApiError('rate limited', {
        kind: 'rate-limit',
        retryAfterSeconds: 60,
      }),
    );
    renderRepository();

    expect(await screen.findByRole('heading', { name: 'project' })).toBeTruthy();
    expect(
      await screen.findByText('GitHub requests are temporarily rate-limited.'),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry issues' })).toBeNull();
  });
});
