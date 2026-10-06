import type { GithubSearchType } from '../types';
import { SearchTypeToggle } from './SearchTypeToggle';

interface SearchSidebarProps {
  searchType: GithubSearchType;
  searchTerm: string;
  resultCount: number | undefined;
  onSearchTypeChange: (type: GithubSearchType) => void;
}

const numberFormat = new Intl.NumberFormat();

export function SearchSidebar({
  searchType,
  searchTerm,
  resultCount,
  onSearchTypeChange,
}: SearchSidebarProps) {
  return (
    <aside className="search-sidebar" aria-label="Search options and tips">
      <section className="search-sidebar__section" aria-labelledby="search-sidebar-type">
        <h2 id="search-sidebar-type">Search type</h2>
        <SearchTypeToggle
          searchType={searchType}
          onSearchTypeChange={onSearchTypeChange}
        />
        {resultCount !== undefined && (
          <p className="search-sidebar__count">
            {numberFormat.format(resultCount)} {searchType === 'repository' ? 'repositories' : 'people'}
            {searchTerm && <> for <strong>{searchTerm}</strong></>}
          </p>
        )}
      </section>

      <section className="search-sidebar__tip" aria-labelledby="search-tip-title">
        <span className="search-sidebar__tip-icon" aria-hidden="true">i</span>
        <div>
          <h2 id="search-tip-title">A better search</h2>
          <p>
            Try a project name, developer username, language, or topic to narrow your discovery.
          </p>
        </div>
      </section>
    </aside>
  );
}
