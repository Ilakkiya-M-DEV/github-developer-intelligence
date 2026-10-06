export interface RepositoryViewModel {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  owner: {
    login: string;
    avatarUrl: string;
    githubUrl: string;
  };
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  defaultBranch: string;
  githubUrl: string;
}

export interface IssueViewModel {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: {
    login: string;
    avatarUrl: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  githubUrl: string;
}