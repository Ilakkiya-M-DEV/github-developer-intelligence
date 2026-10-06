import { Link, useLocation } from 'react-router-dom';

function getReturnPath(state: unknown): string {
  if (
    typeof state !== 'object' ||
    state === null ||
    !('returnTo' in state) ||
    typeof state.returnTo !== 'string' ||
    !state.returnTo.startsWith('/') ||
    state.returnTo.startsWith('//')
  ) {
    return '/';
  }

  return state.returnTo;
}

export function Header() {
  const location = useLocation();
  const homePath = getReturnPath(location.state);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to={homePath} aria-label="GitHub Developer Intelligence home">
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