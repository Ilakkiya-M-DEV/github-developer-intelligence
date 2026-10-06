# GitHub Developer Intelligence

## Overview

GitHub Developer Intelligence is a responsive React application for exploring public GitHub repositories and people. It helps developers discover projects and contributors, inspect repository details and recent issues, and load fuller user profiles only when needed.

## Features

- Search public GitHub repositories or users and switch between result types.
- Debounced search with query, type, and page persisted in URL parameters (`q`, `type`, `page`).
- Page-based pagination with 20 results per page, bounded to GitHub's 1,000-result search limit.
- Repository search cards with owner, description, language, stars, forks, open issues, update date, an in-app details link, and a separate GitHub link.
- User search results with available profile information and on-demand full profile enrichment.
- Repository details including owner, description, statistics, language, dates, branch, and GitHub link.
- Recent repository issues, with pull requests excluded from issue display.
- Loading, empty, and error states for search, profile, repository, and issue requests.
- Rate-limit-aware messaging; rate-limited requests are not automatically retried.
- Responsive layouts, semantic landmarks and result elements, labelled controls, keyboard-operable links and buttons, visible focus styles, a skip link, and announced loading/error states.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Vitest, Testing Library, and jsdom

`lucide-react` is not used.

## Getting Started

Requires Node.js and npm. No credentials or API key are required for the public GitHub API requests in this application.

```sh
npm install
npm run dev
```

Run tests and create a production build:

```sh
npm test
npm run build
```

## Architecture

The dependency direction is:

```text
UI
↓
Feature hooks
↓
TanStack Query
↓
GitHub API service
↓
HTTP client
↓
GitHub REST API
```

- `app/` configures providers, routing, and the shared layout.
- `pages/` composes route-level features and URL state.
- `features/` groups search and repository hooks, presentation, view models, and data mapping.
- `components/` holds shared layout and UI components.
- `services/github/` contains API functions, response types, the fetch client, and typed errors.
- `hooks/` contains reusable UI hooks such as debouncing.
- `utils/` contains shared date and number formatting.
- `styles/` contains design tokens and responsive global styles.

## State Management

**Local/UI state** includes the current search input and the currently expanded user profile. Search type, query, and page are derived from the URL.

**Server state** includes search results, repository details, issue lists, and selected user profiles. TanStack Query owns these results and their loading, error, cache, and request lifecycles. This avoids copying API responses into component state and provides keyed queries and cancellation without a separate global state library.

## API Layer

The GitHub service uses a lightweight `fetch` client with the fixed `https://api.github.com/` base URL. It builds query parameters with `URLSearchParams`, encodes dynamic path segments, accepts `AbortSignal`, checks `response.ok`, and parses successful JSON.

Focused TypeScript API response models are mapped into feature-specific view models before display. HTTP failures, network errors, aborts, and unexpected failures are represented with a typed GitHub API error. GitHub messages, validation details, documentation URLs, and rate-limit timing are retained where available. The issue mapper filters out entries with GitHub's `pull_request` property.

## Key Technical Decisions

### Decision 1: Server State Management

**Decision:**
Use TanStack Query for server state, caching, and request lifecycles.

**Alternatives considered:**
Local component state for API responses or a global store such as Redux.

**Why I chose this:**
The features need keyed caching, cancellation, and independent loading and error states; TanStack Query provides these without duplicating API data in local state.

**Trade-off:**
Query keys and query defaults are part of the feature contract and need to stay consistent.

### Decision 2: Feature-Based Architecture

**Decision:**
Keep search and repository hooks, components, models, and mappers in their feature directories, with shared GitHub transport in `services/github/`.

**Alternatives considered:**
Putting API calls in pages or grouping all components only by technical type.

**Why I chose this:**
It keeps feature behavior cohesive while leaving the API service independent of React.

**Trade-off:**
A feature spans several files, so files and abstractions are kept focused.

### Decision 3: Debounced Search

**Decision:**
Wait 350 ms after input changes and require at least two non-whitespace characters before searching.

**Alternatives considered:**
Sending a request for each keystroke or requiring an explicit submit action.

**Why I chose this:**
It retains interactive search while reducing requests during rapid typing; empty and too-short terms do not query.

**Trade-off:**
Results update after the debounce interval rather than immediately.

### Decision 4: URL-Persisted Search State

**Decision:**
Store query, search type, and page in `q`, `type`, and `page` URL parameters.

**Alternatives considered:**
Keeping all search criteria only in component state.

**Why I chose this:**
Searches can be refreshed, bookmarked, and shared.

**Trade-off:**
URL values must be parsed and normalized; typing updates the URL.

### Decision 5: On-Demand User Profile Enrichment

**Decision:**
Fetch a full user profile only after the user selects **Load profile details**.

**Alternatives considered:**
Fetching every result's profile during search or leaving the search response's missing fields unexplained.

**Why I chose this:**
GitHub user search omits profile statistics. Selection retrieves those fields without adding a profile request for every result.

**Trade-off:**
Full-profile information is shown only after selection, and unavailable profile fields remain identified as unavailable.

### Decision 6: Request Cancellation

**Decision:**
Forward TanStack Query's `AbortSignal` through feature hooks to the GitHub API service.

**Alternatives considered:**
Creating separate `AbortController` instances in components or allowing obsolete requests to continue.

**Why I chose this:**
The active query owns the cancellation lifecycle, avoiding a second mechanism.

**Trade-off:**
Each API call must continue to forward the signal it receives.

### Decision 7: Page-Based Pagination

**Decision:**
Use 20 results per page and normalize page numbers to the range 1–50.

**Alternatives considered:**
Infinite scrolling or requesting beyond GitHub's search limit.

**Why I chose this:**
Page navigation is explicit and respects the 1,000-result search limit.

**Trade-off:**
Users navigate between pages rather than scrolling through a continuous list.

## Search & Async Behavior

The input updates the URL immediately. After 350 ms without a change, the trimmed query is passed to the search hook; queries shorter than two characters are disabled. Search query keys include the type, normalized term, and page: `["github-search", searchType, searchTerm, page]`.

TanStack Query's signal is passed to the API service. Query keys isolate results for different search inputs, so a response for an obsolete key cannot become the active search's result. During page changes for the same search, existing results can remain visible until the next page loads.

URL page values are normalized to an integer from 1 through 50 before reaching the query/API, and noncanonical values are replaced in the URL. The bound follows the 20-result page size and GitHub's 1,000-result search limit.

## Error Handling

Typed errors distinguish network failures, cancellation, invalid requests, rate limits, not-found responses, validation failures, server failures, and other HTTP or unexpected errors. The UI presents user-facing messages rather than stack traces.

Retry actions are manual where appropriate. Rate-limit errors are not automatically retried and do not offer the normal retry action; retry timing is shown when available. Repository details and issue requests have independent error states, so an issue failure does not replace loaded repository details.

## Performance

TanStack Query caches by query key with a 30-second default stale time and deduplicates requests for the same key. The query client disables automatic retries and refetch-on-window-focus. Debouncing reduces requests during active typing; obsolete queries can be cancelled through `AbortSignal`.

Full profiles are queried only for selected users and cached by username. Search displays one 20-result page at a time. Repository details fetch one repository and the first 10 entries from the issue endpoint; individual issue details are not fetched. The implementation does not add client-side API caching or unnecessary memoization.

## Accessibility

Pages use semantic headings, landmarks, sections, articles, lists, and pagination navigation. The search input has a label and helper text; type buttons expose their pressed state. Pagination controls have a labelled navigation region and disabled states. Links and buttons are keyboard-operable, focus styles are visible, and a skip link targets the main content. Loading and error messages use status/alert announcements. Layouts adapt to narrow viewports.

## Security

- No credentials, API keys, or authentication are used.
- Requests use a fixed GitHub HTTPS API base URL, `URLSearchParams`, and encoded dynamic path segments.
- The application does not use `dangerouslySetInnerHTML`; API values are rendered as text.
- External links opened in a new tab use `rel="noopener noreferrer"`.

These are measures for the current public-API client scope, not a broader security guarantee for future credentialed or third-party data sources.

## Testing

The current suite contains **41 tests** across two files, using Vitest and Testing Library.

- Search and async behavior: debounce timing, minimum query length, cancellation, rapid input, URL state, page normalization, and pagination.
- Search UI: empty results, repository navigation, user results, profile enrichment/cache/cancellation, and network/rate-limit messaging.
- Repository behavior: loading and error states, details, retries, issue rendering, empty issues, independent issue failures, and pull-request filtering.

Run the suite with `npm test`.

## Trade-offs

1. **On-demand profile enrichment:** GitHub user search omits full profile statistics. Loading profiles only after selection avoids extra requests for every result, but requires an explicit action to view those fields.
2. **First 10 issue endpoint entries:** Pull requests can appear in the response and are filtered before display, so fewer than 10 issues may be shown even when later issues exist.
3. **Public API constraints:** Unauthenticated GitHub API requests are subject to public rate limits and service availability.
4. **Page-based pagination:** Navigation is explicit and bounded to GitHub's first 1,000 search results rather than using infinite scrolling.

## Assumptions

- The public GitHub REST API is available to the browser.
- The assessment scope does not require authentication or credentials.
- Available fields, results, ordering, and rate limits follow GitHub's public API responses.
- Full user profile details are needed on selection, not for every search result.

## Known Limitations

- User profile statistics and other full-profile fields load only after selecting a user.
- Filtering pull requests from the first 10 issue endpoint entries can leave fewer than 10 displayed issues.
- Unauthenticated public API rate limits can prevent or delay requests.
- Search results are limited to GitHub's first 1,000 results.

## AI Usage Disclosure

AI tools assisted with scaffolding, implementation, debugging, test generation, code review, and exploring implementation alternatives. The developer owned the engineering decisions and final review. Deliberately reviewed decisions included TanStack Query instead of Redux, on-demand profile enrichment instead of fetching every profile, request cancellation, bounded pagination, and filtering pull requests from issue results.

## Development Notes

Within the four-hour assessment time-box, work was prioritized in this order:

**Architecture → Correctness → Reliability → UX → Maintainability → Performance → Polish**
