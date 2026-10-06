import { useGithubUserProfile } from '../hooks/useGithubUserProfile';
import { SearchError } from './SearchStatus';

interface UserProfileDetailsProps {
  username: string;
}

const numberFormat = new Intl.NumberFormat();

function formatCount(value: number | undefined): string {
  return value === undefined ? 'Not provided by GitHub' : numberFormat.format(value);
}

export function UserProfileDetails({ username }: UserProfileDetailsProps) {
  const profile = useGithubUserProfile(username);

  if (profile.isPending) {
    return (
      <section className="user-profile-details" aria-label={`${username} profile details`}>
        <p className="user-profile-details__status" role="status">
          Loading full profile for @{username}…
        </p>
      </section>
    );
  }

  if (profile.isError) {
    return (
      <div className="user-profile-details">
        <SearchError
          error={profile.error}
          onRetry={() => void profile.refetch()}
          retryLabel="Retry profile request"
        />
      </div>
    );
  }

  const user = profile.data;

  return (
    <section className="user-profile-details" aria-labelledby={`profile-${user.id}-title`}>
      <h4 id={`profile-${user.id}-title`}>
        {user.name ? `${user.name} (@${user.login})` : `@${user.login}`}
      </h4>
      {user.bio && <p className="user-profile-details__bio">{user.bio}</p>}
      <dl className="user-profile-details__stats">
        <div>
          <dt>Followers</dt>
          <dd>{formatCount(user.followers)}</dd>
        </div>
        <div>
          <dt>Following</dt>
          <dd>{formatCount(user.following)}</dd>
        </div>
        <div>
          <dt>Public repositories</dt>
          <dd>{formatCount(user.public_repos)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{user.location || 'Not listed'}</dd>
        </div>
      </dl>
    </section>
  );
}
