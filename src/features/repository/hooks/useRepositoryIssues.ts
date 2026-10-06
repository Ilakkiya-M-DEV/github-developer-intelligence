import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../../../services/github/githubApi';

export const REPOSITORY_ISSUES_PAGE_SIZE = 10;

export function useRepositoryIssues(owner: string, repo: string) {
  const safeOwner = owner.trim();
  const safeRepo = repo.trim();

  return useQuery({
    queryKey: ['repository-issues', safeOwner.toLowerCase(), safeRepo.toLowerCase()],
    queryFn: ({ signal }) =>
      githubApi.getRepositoryIssues(safeOwner, safeRepo, {
        page: 1,
        perPage: REPOSITORY_ISSUES_PAGE_SIZE,
        signal,
      }),
    enabled: safeOwner.length > 0 && safeRepo.length > 0,
  });
}
