import type { GithubSearchType } from '../types';

interface SearchTypeToggleProps {
  searchType: GithubSearchType;
  onSearchTypeChange: (type: GithubSearchType) => void;
}

export function SearchTypeToggle({
  searchType,
  onSearchTypeChange,
}: SearchTypeToggleProps) {
  return (
    <div className="search-type" role="group" aria-label="Search type">
      <button
        type="button"
        className={searchType === 'repository' ? 'search-type__button is-active' : 'search-type__button'}
        aria-pressed={searchType === 'repository'}
        onClick={() => onSearchTypeChange('repository')}
      >
        Repositories
      </button>
      <button
        type="button"
        className={searchType === 'user' ? 'search-type__button is-active' : 'search-type__button'}
        aria-pressed={searchType === 'user'}
        onClick={() => onSearchTypeChange('user')}
      >
        People
      </button>
    </div>
  );
}
