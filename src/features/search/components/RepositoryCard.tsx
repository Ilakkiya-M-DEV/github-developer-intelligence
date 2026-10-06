import { generatePath, Link } from 'react-router-dom';
import type { SearchRepository } from '../types';

interface RepositoryCardProps {
  repository: SearchRepository;
}

const numberFormat = new Intl.NumberFormat();
const dateFormat = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : dateFormat.format(date);
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const detailsPath = generatePath('/repositories/:owner/:repo', {
    owner: repository.ownerLogin,
    repo: repository.name,
  });

  return (
    <article className="result-card repository-card">
      <img
        className="avatar repository-card__avatar"
        src={repository.ownerAvatarUrl}
        alt=""
        loading="lazy"
      />
      <div className="result-card__main">
        <div className="repository-card__identity">
          <span className="repository-card__owner">{repository.ownerLogin}</span>
          <span className="repository-card__separator" aria-hidden="true">/</span>
        </div>
        <h3 className="result-card__title">
          <Link
            className="repository-card__details-link"
            to={detailsPath}
          >
            {repository.name}
          </Link>
        </h3>
        <p className="result-card__description">
          {repository.description || 'No description provided.'}
        </p>
        <ul className="repository-card__metadata" aria-label="Repository details">
          {repository.language && <li>{repository.language}</li>}
          <li>{numberFormat.format(repository.stars)} stars</li>
          <li>{numberFormat.format(repository.forks)} forks</li>
          <li>{numberFormat.format(repository.openIssues)} open issues</li>
          <li>Updated {formatDate(repository.updatedAt)}</li>
        </ul>
      </div>
      <div className="repository-card__actions">
        <Link
          className="result-card__link result-card__link--primary"
          to={detailsPath}
        >
          View insights <span aria-hidden="true">→</span>
        </Link>
        <a
          className="result-card__link"
          href={repository.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${repository.fullName} on GitHub (opens in a new tab)`}
        >
          View on GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}
