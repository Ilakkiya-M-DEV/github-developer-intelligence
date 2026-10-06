import heroImageUrl from '../../../utils/assets/image.png';

export function SearchHero() {
  return (
    <header className="search-hero">
      <div className="search-hero__copy">
        <p className="eyebrow">DEVELOPER INTELLIGENCE</p>
        <h1>A clearer view of the work behind the code.</h1>
        <p>
          Search repositories and developers, explore real projects, and get a deeper
          understanding of the open-source ecosystem.
        </p>
      </div>
      <div className="search-hero__visual" aria-hidden="true">
        <div className="orbit orbit--one" />
        <div className="orbit orbit--two" />
        <span className="visual-dot visual-dot--blue" />
        <span className="visual-dot visual-dot--mint" />
        <span className="visual-dot visual-dot--violet" />
        <div className="visual-card visual-card--repositories">
          <span className="visual-card__icon">⌘</span>
          <span>
            <strong>Repositories</strong>
            <small>Find and explore projects</small>
          </span>
        </div>
        <div className="visual-card visual-card--people">
          <span className="visual-card__icon">◎</span>
          <span>
            <strong>Developer profiles</strong>
            <small>Explore details on demand</small>
          </span>
        </div>
        <div className="visual-card visual-card--insights">
          <span className="visual-card__icon">↗</span>
          <span>
            <strong>Repository details</strong>
            <small>Stats, activity, and issues</small>
          </span>
        </div>
        <div className="visual-core">
          <img className="visual-core__image" src={heroImageUrl} alt="" />
        </div>
      </div>
    </header>
  );
}
