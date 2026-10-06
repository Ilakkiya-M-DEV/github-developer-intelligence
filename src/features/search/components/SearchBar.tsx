interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}

export function SearchBar({ searchTerm, onSearchTermChange }: SearchBarProps) {
  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="search-bar__label" htmlFor="github-search">
        Search GitHub
      </label>
      <div className="search-bar__control">
        <input
          id="github-search"
          type="search"
          value={searchTerm}
          minLength={2}
          autoComplete="off"
          placeholder="Try a project, language, or username"
          onChange={(event) => onSearchTermChange(event.currentTarget.value)}
        />
        <span className="search-bar__hint" aria-hidden="true">
          GitHub
        </span>
      </div>
      <p className="search-bar__help" id="search-help">
        Enter at least 2 characters. Results update as you type.
      </p>
    </form>
  );
}
