import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../../../services/github/githubApi';

export function useGithubUserProfile(username: string) {
  return useQuery({
    queryKey: ['github-user-profile', username.toLowerCase()],
    queryFn: ({ signal }) => githubApi.getUser(username, signal),
    enabled: username.trim().length > 0,
  });
}
