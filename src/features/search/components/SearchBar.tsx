interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export function SearchBar({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
}: SearchBarProps) {
  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearchSubmit();
      }}
    >
      <label className="sr-only" htmlFor="github-search">Search GitHub</label>
      <div className="search-bar__control">
        <span className="search-bar__icon" aria-hidden="true">⌕</span>
        <input
          id="github-search"
          type="search"
          aria-label="Search GitHub"
          value={searchTerm}
          minLength={2}
          autoComplete="off"
          aria-describedby="search-help"
          placeholder="Try a project, language, or username"
          onChange={(event) => onSearchTermChange(event.currentTarget.value)}
        />
        <button className="search-bar__submit" type="submit">Search</button>
      </div>
      <p className="search-bar__help" id="search-help">
        Enter at least 2 characters. Results update as you type, or press Enter to search now.
      </p>
    </form>
  );
}
