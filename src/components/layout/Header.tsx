import { Link } from 'react-router-dom';

export function Header() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label="GitHub Developer Intelligence home">
            <span className="brand__mark" aria-hidden="true">
              GI
            </span>
            <span className="brand__name">GitHub Developer Intelligence</span>
          </Link>
          <span className="site-header__caption">A workspace for repository insights</span>
        </div>
      </header>
    </>
  );
}