import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { MIN_SEARCH_LENGTH, useGithubSearch } from '../features/search/hooks/useGithubSearch';
import { SearchBar } from '../features/search/components/SearchBar';
import { SearchPagination } from '../features/search/components/SearchPagination';
import { SearchResults } from '../features/search/components/SearchResults';
import { SearchError, SearchLoading } from '../features/search/components/SearchStatus';
import { SearchTypeToggle } from '../features/search/components/SearchTypeToggle';
import { toSearchRepository, toSearchUser } from '../features/search/utils/toSearchModels';
import type { GithubSearchType } from '../features/search/types';
import { useDebounce } from '../hooks/useDebounce';
import type { GitHubRepository, GitHubUser } from '../services/github/types';
import { normalizeSearchPage, SEARCH_PAGE_SIZE } from '../features/search/utils/normalizeSearchPage';

function parseSearchType(value: string | null): GithubSearchType {
  return value === 'user' ? 'user' : 'repository';
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchType = parseSearchType(searchParams.get('type'));
  const searchTerm = searchParams.get('q') ?? '';
  const rawPage = searchParams.get('page');
  const page = normalizeSearchPage(rawPage);
  const debouncedTerm = useDebounce(searchTerm);
  const normalizedTerm = debouncedTerm.trim();
  const isDebouncing = searchTerm.trim() !== normalizedTerm;
  const query = useGithubSearch(searchType, normalizedTerm, page);

  useEffect(() => {
    const canonicalPage = page === 1 ? null : String(page);
    if (rawPage === canonicalPage) return;

    const nextParams = new URLSearchParams(searchParams);
    if (canonicalPage === null) nextParams.delete('page');
    else nextParams.set('page', canonicalPage);
    setSearchParams(nextParams, { replace: true });
  }, [page, rawPage, searchParams, setSearchParams]);

  const updateParams = (updates: {
    q?: string;
    type?: GithubSearchType;
    page?: number;
  }, replace = false) => {
    const nextParams = new URLSearchParams(searchParams);
    if (updates.q !== undefined) {
      if (updates.q) nextParams.set('q', updates.q);
      else nextParams.delete('q');
    }
    if (updates.type !== undefined) {
      if (updates.type === 'repository') nextParams.delete('type');
      else nextParams.set('type', updates.type);
    }
    if (updates.page !== undefined) {
      if (updates.page === 1) nextParams.delete('page');
      else nextParams.set('page', String(updates.page));
    }
    setSearchParams(nextParams, { replace });
  };

  const repositoryItems = query.data?.items
    .filter((item): item is GitHubRepository => 'full_name' in item)
    .map(toSearchRepository) ?? [];
  const userItems = query.data?.items
    .filter((item): item is GitHubUser => 'login' in item && !('full_name' in item))
    .map(toSearchUser) ?? [];
  const totalCount = query.data?.total_count ?? 0;
  const isLoading = isDebouncing || (query.isFetching && !query.data);
  const showTooShortMessage = searchTerm.trim().length > 0 &&
    searchTerm.trim().length < MIN_SEARCH_LENGTH;

  return (
    <PageContainer>
      <div className="page-content search-page">
        <header className="page-intro">
          <p className="eyebrow">DEVELOPER INTELLIGENCE</p>
          <h1>A clearer view of the work behind the code.</h1>
          <p className="page-intro__description">
            Explore the people and projects shaping open source.
          </p>
        </header>

        <section className="search-workspace" aria-label="GitHub search">
          <div className="search-workspace__controls">
            <SearchTypeToggle
              searchType={searchType}
              onSearchTypeChange={(type) => updateParams({ type, page: 1 })}
            />
            <SearchBar
              searchTerm={searchTerm}
              onSearchTermChange={(value) => updateParams({ q: value, page: 1 }, true)}
            />
          </div>

          {!searchTerm.trim() ? (
            <section className="search-message" aria-labelledby="search-welcome-title">
              <div className="placeholder-panel__indicator" aria-hidden="true">
                <span />
              </div>
              <p className="placeholder-panel__eyebrow">YOUR WORKSPACE</p>
              <h2 id="search-welcome-title">Find your next open-source signal</h2>
              <p>Search public GitHub repositories or people by name, topic, or language.</p>
            </section>
          ) : showTooShortMessage ? (
            <section className="search-message" aria-live="polite">
              <h2>Keep typing to search</h2>
              <p>Enter at least {MIN_SEARCH_LENGTH} characters to search GitHub.</p>
            </section>
          ) : isLoading ? (
            <SearchLoading searchType={searchType} />
          ) : query.isError ? (
            <SearchError error={query.error} onRetry={() => void query.refetch()} />
          ) : query.data && query.data.items.length === 0 ? (
            <section className="search-message" aria-live="polite">
              <h2>No {searchType === 'repository' ? 'repositories' : 'people'} found for “{normalizedTerm}”.</h2>
              <p>Try a different search term or switch the search type.</p>
            </section>
          ) : query.data ? (
            <>
              <div className="search-results-heading">
                <div>
                  <h2>
                    {searchType === 'repository' ? 'Repositories' : 'People'}
                    <span className="search-results-heading__count">
                      {new Intl.NumberFormat().format(totalCount)}
                    </span>
                  </h2>
                  <p>
                    Results for <strong>{normalizedTerm}</strong>
                    {query.data.incomplete_results && ' · GitHub returned partial results'}
                  </p>
                </div>
                {query.isFetching && (
                  <span className="inline-loading" role="status">Updating results…</span>
                )}
              </div>
              <SearchResults
                key={`${searchType}:${normalizedTerm}:${page}`}
                searchType={searchType}
                repositories={repositoryItems}
                users={userItems}
              />
              <SearchPagination
                page={page}
                totalCount={totalCount}
                pageSize={SEARCH_PAGE_SIZE}
                isPlaceholderData={query.isPlaceholderData}
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
              />
            </>
          ) : null}
        </section>
      </div>
    </PageContainer>
  );
}
