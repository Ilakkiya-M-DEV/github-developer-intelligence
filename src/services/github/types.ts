export interface GitHubRepositoryOwner {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  name?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string;
  followers?: number;
  following?: number;
  public_repos?: number;
  created_at?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  default_branch: string;
  owner: GitHubRepositoryOwner;
}

export interface GitHubSearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: GitHubRepositoryOwner | null;
  pull_request?: {
    url: string;
    html_url?: string;
  };
}