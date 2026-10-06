import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../../../services/github/githubApi';

export function useRepository(owner: string, repo: string) {
  const safeOwner = owner.trim();
  const safeRepo = repo.trim();

  return useQuery({
    queryKey: ['repository', safeOwner.toLowerCase(), safeRepo.toLowerCase()],
    queryFn: ({ signal }) => githubApi.getRepository(safeOwner, safeRepo, signal),
    enabled: safeOwner.length > 0 && safeRepo.length > 0,
  });
}
