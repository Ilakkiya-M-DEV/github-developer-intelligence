import { useState } from 'react';
import type { SearchRepository, SearchUser } from '../types';
import { RepositoryCard } from './RepositoryCard';
import { UserCard } from './UserCard';
import { UserProfileDetails } from './UserProfileDetails';

interface SearchResultsProps {
  searchType: 'repository' | 'user';
  repositories: SearchRepository[];
  users: SearchUser[];
}

export function SearchResults({ searchType, repositories, users }: SearchResultsProps) {
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  if (searchType === 'repository') {
    return (
      <div className="search-results">
        {repositories.map((repository) => (
          <RepositoryCard key={repository.id} repository={repository} />
        ))}
      </div>
    );
  }

  return (
    <div className="search-results">
      {users.map((user) => {
        const isExpanded = selectedUsername === user.username;

        return (
          <div className="user-result" key={user.id}>
            <UserCard
              user={user}
              isExpanded={isExpanded}
              onToggleDetails={() =>
                setSelectedUsername(isExpanded ? null : user.username)
              }
            />
            <div id={`user-profile-${user.id}`} hidden={!isExpanded}>
              {isExpanded && <UserProfileDetails username={user.username} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
