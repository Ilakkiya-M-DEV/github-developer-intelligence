import { useRepositoryIssues } from '../hooks/useRepositoryIssues';
import { toIssueViewModels } from '../utils/toRepositoryModels';
import { IssueCard } from './IssueCard';
import { ApiErrorState } from '../../../components/ui/ApiErrorState';

interface RepositoryIssuesProps {
  owner: string;
  repo: string;
}

export function RepositoryIssues({ owner, repo }: RepositoryIssuesProps) {
  const issuesQuery = useRepositoryIssues(owner, repo);

  return (
    <section className="repository-issues" aria-labelledby="repository-issues-title">
      <div className="repository-section-heading">
        <div>
          <p className="eyebrow">RECENT ACTIVITY</p>
          <h2 id="repository-issues-title">Recent issues</h2>
        </div>
        {issuesQuery.isFetching && issuesQuery.data && (
          <span className="inline-loading" role="status">Updating issues…</span>
        )}
      </div>

      {issuesQuery.isPending ? (
        <div className="loading-results" role="status" aria-label="Loading recent issues">
          <span className="sr-only">Loading recent issues…</span>
          {[0, 1, 2].map((item) => (
            <div className="loading-card" aria-hidden="true" key={item}>
              <span className="loading-card__line loading-card__line--title" />
              <span className="loading-card__line" />
              <span className="loading-card__line loading-card__line--short" />
            </div>
          ))}
        </div>
      ) : issuesQuery.isError ? (
        <ApiErrorState
          error={issuesQuery.error}
          onRetry={() => void issuesQuery.refetch()}
          retryLabel="Retry issues"
          notFoundTitle="Issues could not be found."
        />
      ) : (
        (() => {
          const issues = toIssueViewModels(issuesQuery.data);
          if (issues.length === 0) {
            return (
              <div className="search-message" aria-live="polite">
                <h3>No recent issues</h3>
                <p>This repository has no recent issues to display.</p>
              </div>
            );
          }

          return (
            <div className="issue-list">
              {issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          );
        })()
      )}
    </section>
  );
}
