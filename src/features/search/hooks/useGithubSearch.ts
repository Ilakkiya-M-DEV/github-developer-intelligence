import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../../../services/github/githubApi';
import type { GitHubRepository, GitHubSearchResponse, GitHubUser } from '../../../services/github/types';
import type { GithubSearchType } from '../types';
import { SEARCH_PAGE_SIZE } from '../utils/normalizeSearchPage';

export const MIN_SEARCH_LENGTH = 2;
export { SEARCH_PAGE_SIZE };

type SearchResponse =
  | GitHubSearchResponse<GitHubRepository>
  | GitHubSearchResponse<GitHubUser>;

export function useGithubSearch(
  searchType: GithubSearchType,
  searchTerm: string,
  page: number,
) {
  const normalizedTerm = searchTerm.trim();

  return useQuery<SearchResponse>({
    queryKey: ['github-search', searchType, normalizedTerm, page],
    queryFn: ({ signal }) =>
      searchType === 'repository'
        ? githubApi.searchRepositories(normalizedTerm, {
            page,
            perPage: SEARCH_PAGE_SIZE,
            signal,
          })
        : githubApi.searchUsers(normalizedTerm, {
            page,
            perPage: SEARCH_PAGE_SIZE,
            signal,
          }),
    enabled: normalizedTerm.length >= MIN_SEARCH_LENGTH,
    placeholderData: (previousData, previousQuery) => {
      const previousKey = previousQuery?.queryKey;
      return previousKey?.[0] === 'github-search' &&
        previousKey[1] === searchType &&
        previousKey[2] === normalizedTerm
        ? previousData
        : undefined;
    },
  });
}
