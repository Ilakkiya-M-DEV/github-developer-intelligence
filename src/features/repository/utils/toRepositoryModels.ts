import type { GitHubIssue, GitHubRepository } from '../../../services/github/types';
import type { IssueViewModel, RepositoryViewModel } from '../types';

export function toRepositoryViewModel(repository: GitHubRepository): RepositoryViewModel {
  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description,
    owner: {
      login: repository.owner.login,
      avatarUrl: repository.owner.avatar_url,
      githubUrl: repository.owner.html_url,
    },
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    watchers: repository.watchers_count,
    openIssues: repository.open_issues_count,
    language: repository.language,
    createdAt: repository.created_at,
    updatedAt: repository.updated_at,
    defaultBranch: repository.default_branch,
    githubUrl: repository.html_url,
  };
}

export function toIssueViewModels(issues: GitHubIssue[]): IssueViewModel[] {
  return issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      author: issue.user
        ? {
            login: issue.user.login,
            avatarUrl: issue.user.avatar_url,
          }
        : null,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      githubUrl: issue.html_url,
    }));
}
