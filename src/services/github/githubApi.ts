import { githubRequest } from './githubClient';
import type {
  GitHubIssue,
  GitHubRepository,
  GitHubSearchResponse,
  GitHubUser,
} from './types';

export interface SearchOptions {
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
}

export interface PaginationOptions {
  page?: number;
  perPage?: number;
  signal?: AbortSignal;
}

export const githubApi = {
  searchRepositories(
    query: string,
    { page = 1, perPage = 30, signal }: SearchOptions = {},
  ): Promise<GitHubSearchResponse<GitHubRepository>> {
    return githubRequest('search/repositories', {
      query: { q: query, page, per_page: perPage },
      signal,
    });
  },

  searchUsers(
    query: string,
    { page = 1, perPage = 30, signal }: SearchOptions = {},
  ): Promise<GitHubSearchResponse<GitHubUser>> {
    return githubRequest('search/users', {
      query: { q: query, page, per_page: perPage },
      signal,
    });
  },

  getUser(username: string, signal?: AbortSignal): Promise<GitHubUser> {
    return githubRequest(`users/${encodeURIComponent(username)}`, { signal });
  },

  getRepository(
    owner: string,
    repo: string,
    signal?: AbortSignal,
  ): Promise<GitHubRepository> {
    return githubRequest(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { signal },
    );
  },

  getRepositoryIssues(
    owner: string,
    repo: string,
    { page = 1, perPage = 30, signal }: PaginationOptions = {},
  ): Promise<GitHubIssue[]> {
    return githubRequest(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`,
      {
        query: { page, per_page: perPage },
        signal,
      },
    );
  },
};