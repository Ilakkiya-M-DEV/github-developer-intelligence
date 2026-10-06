import type { SearchUser } from '../types';

interface UserCardProps {
  user: SearchUser;
  isExpanded: boolean;
  onToggleDetails: () => void;
}

export function UserCard({ user, isExpanded, onToggleDetails }: UserCardProps) {
  return (
    <article className="result-card user-card">
      <img className="avatar user-card__avatar" src={user.avatarUrl} alt="" loading="lazy" />
      <div className="user-card__main">
        <h3 className="result-card__title">{user.name || user.username}</h3>
        {user.name && <p className="user-card__username">@{user.username}</p>}
        {user.location && <p className="user-card__location">{user.location}</p>}
        <p className="user-card__note">
          Follower, following, repository, and profile details load when requested.
        </p>
      </div>
      <div className="user-card__actions">
        <button
          className="result-card__link user-card__details-button"
          type="button"
          aria-expanded={isExpanded}
          aria-controls={`user-profile-${user.id}`}
          onClick={onToggleDetails}
        >
          {isExpanded ? 'Hide profile details' : 'Load profile details'}
        </button>
        <a
          className="result-card__link"
          href={user.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${user.username} on GitHub (opens in a new tab)`}
        >
          View profile <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}
