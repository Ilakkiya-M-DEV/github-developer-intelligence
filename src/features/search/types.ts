export type GithubSearchType = 'repository' | 'user';

export interface SearchRepository {
  id: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  ownerAvatarUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  githubUrl: string;
}

export interface SearchUser {
  id: number;
  username: string;
  avatarUrl: string;
  name: string | null;
  location: string | null;
  followers: number | undefined;
  following: number | undefined;
  publicRepositories: number | undefined;
  githubUrl: string;
}