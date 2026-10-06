import { PageContainer } from '../components/layout/PageContainer';

export default function SearchPage() {
  return (
    <PageContainer>
      <div className="page-content">
        <header className="page-intro">
          <p className="eyebrow">DEVELOPER INTELLIGENCE</p>
          <h1>A clearer view of the work behind the code.</h1>
          <p className="page-intro__description">
            Explore the people and projects shaping open source. Your workspace starts here.
          </p>
        </header>

        <section className="placeholder-panel" aria-labelledby="workspace-title">
          <div className="placeholder-panel__indicator" aria-hidden="true">
            <span />
          </div>
          <p className="placeholder-panel__eyebrow">YOUR WORKSPACE</p>
          <h2 id="workspace-title">Insights are on the way</h2>
          <p>
            Search and repository insights will live here. This foundation is ready to grow with
            your workflow.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}