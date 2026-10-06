import { PageContainer } from '../components/layout/PageContainer';

export default function RepositoryPage() {
  return (
    <PageContainer>
      <div className="page-content">
        <header className="page-intro">
          <p className="eyebrow">REPOSITORY</p>
          <h1>Repository overview</h1>
          <p className="page-intro__description">
            A focused view of a project’s activity, people, and health.
          </p>
        </header>

        <section className="placeholder-panel" aria-labelledby="repository-title">
          <div className="placeholder-panel__indicator" aria-hidden="true">
            <span />
          </div>
          <p className="placeholder-panel__eyebrow">PROJECT WORKSPACE</p>
          <h2 id="repository-title">Repository insights will appear here</h2>
          <p>
            This page is ready for a repository overview when connected to the public GitHub API.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}