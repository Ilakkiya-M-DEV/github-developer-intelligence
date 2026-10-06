import type { GitHubRepository, GitHubUser } from '../../../services/github/types';
import type { SearchRepository, SearchUser } from '../types';

export function toSearchRepository(repository: GitHubRepository): SearchRepository {
  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    ownerLogin: repository.owner.login,
    ownerAvatarUrl: repository.owner.avatar_url,
    description: repository.description,
    language: repository.language,
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    openIssues: repository.open_issues_count,
    updatedAt: repository.updated_at,
    githubUrl: repository.html_url,
  };
}

export function toSearchUser(user: GitHubUser): SearchUser {
  return {
    id: user.id,
    username: user.login,
    avatarUrl: user.avatar_url,
    name: user.name ?? null,
    location: user.location ?? null,
    followers: user.followers,
    following: user.following,
    publicRepositories: user.public_repos,
    githubUrl: user.html_url,
  };
}
