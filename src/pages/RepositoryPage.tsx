import { useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { RepositoryHeader } from '../features/repository/components/RepositoryHeader';
import { RepositoryIssues } from '../features/repository/components/RepositoryIssues';
import { RepositoryMetadata } from '../features/repository/components/RepositoryMetadata';
import { RepositoryStats } from '../features/repository/components/RepositoryStats';
import { useRepository } from '../features/repository/hooks/useRepository';
import { toRepositoryViewModel } from '../features/repository/utils/toRepositoryModels';
import { ApiErrorState } from '../components/ui/ApiErrorState';

function RepositoryLoading() {
  return (
    <div className="repository-loading" role="status" aria-label="Loading repository">
      <span className="sr-only">Loading repository details…</span>
      <div className="loading-card">
        <span className="loading-card__line loading-card__line--short" />
        <span className="loading-card__line loading-card__line--title" />
        <span className="loading-card__line" />
      </div>
      <div className="repository-stats repository-stats--loading" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => <div className="loading-card" key={item} />)}
      </div>
    </div>
  );
}

export default function RepositoryPage() {
  const { owner = '', repo = '' } = useParams<{ owner: string; repo: string }>();
  const repositoryQuery = useRepository(owner, repo);

  return (
    <PageContainer>
      <div className="page-content repository-page">
        {repositoryQuery.isPending ? (
          <RepositoryLoading />
        ) : repositoryQuery.isError ? (
          <section className="repository-page__error" aria-labelledby="repository-error-title">
            <p className="eyebrow">REPOSITORY</p>
            <h1 id="repository-error-title">Repository unavailable</h1>
            <ApiErrorState
              error={repositoryQuery.error}
              onRetry={() => void repositoryQuery.refetch()}
              retryLabel="Retry repository"
              notFoundTitle="Repository not found."
            />
          </section>
        ) : (
          (() => {
            const repository = toRepositoryViewModel(repositoryQuery.data);

            return (
              <>
                <RepositoryHeader repository={repository} />
                <RepositoryStats repository={repository} />
                <RepositoryMetadata repository={repository} />
                <RepositoryIssues owner={owner} repo={repo} />
              </>
            );
          })()
        )}
      </div>
    </PageContainer>
  );
}
