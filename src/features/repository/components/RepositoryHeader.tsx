import type { RepositoryViewModel } from '../types';

interface RepositoryHeaderProps {
  repository: RepositoryViewModel;
}

export function RepositoryHeader({ repository }: RepositoryHeaderProps) {
  return (
    <header className="repository-header">
      <div className="repository-header__identity">
        <a
          href={repository.owner.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${repository.owner.login} on GitHub (opens in a new tab)`}
        >
          <img
            className="avatar repository-header__avatar"
            src={repository.owner.avatarUrl}
            alt=""
          />
        </a>
        <div>
          <p className="eyebrow">REPOSITORY</p>
          <p className="repository-header__owner">{repository.owner.login}</p>
        </div>
      </div>
      <h1>{repository.name}</h1>
      <p className="repository-header__full-name">{repository.fullName}</p>
      <p className="repository-header__description">
        {repository.description || 'No description provided.'}
      </p>
      <a
        className="result-card__link repository-header__github-link"
        href={repository.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${repository.fullName} on GitHub (opens in a new tab)`}
      >
        View on GitHub <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
