# GitHub Developer Intelligence

## Overview

GitHub Developer Intelligence is a responsive React application for exploring public GitHub repositories and people. It helps developers find projects and contributors, inspect repository health and recent issues, and view richer user profile information only when requested.

## Features

- Search public GitHub repositories and users, with a control to switch between result types.
- Debounced search with URL-persisted query, type, and page (`q`, `type`, and `page`).
- Page-based results with 20 results per page and page numbers bounded to GitHub's 1,000-result search limit.
- Repository results show owner, description, language, stars, forks, open issues, and last-updated date, with links to in-app repository details and GitHub.
- User results show available search fields. Selecting **Load profile details** fetches the full public profile, including name, location, followers, following, and public repositories when GitHub provides them.
- Repository detail pages show repository metadata and the first 10 entries from the recent issues endpoint. Pull requests are filtered out before display.
- Loading, empty, and error states are provided for search, profile details, repository details, and issues. Rate-limit errors show retry timing when the API provides it; rate-limited requests are not automatically retried.
- Responsive layouts, semantic page and result structure, labelled search and toggle controls, keyboard-operable buttons and links, visible focus styles, a skip link, and accessible loading/error announcements.

## Tech Stack

- React 19 and TypeScript
- Vite
- React Router
- TanStack Query
- Vitest, Testing Library, and jsdom

`lucide-react` is not used.

## Getting Started

Requires Node.js and npm. No credentials, API key, or authentication setup is needed for the public API features in this assessment.

```sh
npm install
npm run dev
```

Run the tests and production build with:

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

- `app/` configures application providers, routing, and the shared layout.
- `pages/` composes page-level features and URL state.
- `features/` groups search and repository hooks, presentation components, view models, and API-to-view-model mapping.
- `components/` contains shared layout and UI elements, including typed API error presentation.
- `services/github/` contains the reusable GitHub API interface, focused response types, fetch client, and typed errors.
- `hooks/` contains reusable UI hooks such as the search debounce.
- `utils/` contains shared date and number formatting.
- `styles/` contains design tokens and responsive global styles.

## State Management

**Local/UI state** includes the current search input, selected search type, and the currently expanded user profile. The URL is the source of truth for the query, search type, and page; page values are normalized before use.

**Server state** includes search results, repository details, recent issues, and selected user profiles. TanStack Query owns this data, its cache, loading/error status, and request lifecycle. This avoids copying API responses into component state and provides query-key isolation and cancellation without a separate global state library.

## API Layer

The GitHub service uses a lightweight `fetch` client with a fixed `https://api.github.com/` base URL. Query parameters are built with `URLSearchParams`; dynamic path segments are encoded. Requests accept an `AbortSignal` and pass it to `fetch`.

Focused TypeScript API models describe only fields used by the application. The client checks `response.ok`, parses successful JSON, and maps HTTP, network, aborted, and unexpected failures to a typed GitHub API error. GitHub messages, validation details, documentation links, and rate-limit timing are retained where available.

Feature mappers convert API responses into UI-specific repository, issue, and search models. Repository issue mapping removes entries with a `pull_request` property before presentation. Components display API content as text; they do not render arbitrary HTML.

## Key Technical Decisions

### Decision 1: Server State Management

**Decision:** Use TanStack Query for server state, request lifecycle, and caching.

**Alternatives considered:** Local component state for API responses; Redux or another global state library.

**Why I chose this:** The application needs query-keyed caching, cancellation, loading/error states, and independent repository and issue requests. TanStack Query supplies these without duplicating server data in local state.

**Trade-off:** Query configuration and query keys become part of the feature contract and need deliberate maintenance.

### Decision 2: Feature-Based Architecture

**Decision:** Keep search and repository hooks, components, models, and mappers in their respective feature directories, with GitHub transport in a shared service.

**Alternatives considered:** Putting API calls and rendering in page components or grouping all components by technical type.

**Why I chose this:** Feature ownership stays clear while the API service remains reusable and independent of React.

**Trade-off:** A small feature can span several files, so the structure is kept focused rather than adding layers without a need.

### Decision 3: Debounced Search

**Decision:** Debounce URL-backed input by 350 ms and require at least two non-whitespace characters before querying.

**Alternatives considered:** Sending a request on every keystroke or waiting for a separate submit action.

**Why I chose this:** It avoids a request for every edit while keeping interactive search; short and empty terms make no search request.

**Trade-off:** Results do not update until the debounce delay has elapsed.

### Decision 4: URL-Persisted Search State

**Decision:** Store query, type, and page in URL search parameters.

**Alternatives considered:** Keeping all criteria only in component state.

**Why I chose this:** Search state can be refreshed, bookmarked, and shared; page values are normalized to the supported range before querying.

**Trade-off:** The page must parse and canonicalize URL values, and typing updates the URL.

### Decision 5: On-Demand User Profile Enrichment

**Decision:** Fetch a user's full profile only after the user selects **Load profile details**.

**Alternatives considered:** Requesting `/users/{username}` for every result or showing only the limited search response permanently.

**Why I chose this:** GitHub user search omits fields required by the assessment. Selection supplies those fields without issuing up to 20 extra requests for each result page.

**Trade-off:** Profile statistics and other full-profile fields are not shown until selected; unavailable API fields are identified rather than fabricated.

### Decision 6: Request Cancellation

**Decision:** Pass TanStack Query's `AbortSignal` through feature hooks to the GitHub API service.

**Alternatives considered:** Creating separate `AbortController` instances in components or allowing obsolete requests to continue.

**Why I chose this:** Query cancellation follows the lifecycle of the active query and avoids a parallel cancellation mechanism.

**Trade-off:** Cancellation depends on each service call continuing to forward the provided signal.

### Decision 7: Page-Based Pagination

**Decision:** Use page-based pagination with 20 search results per page and a maximum of 50 pages.

**Alternatives considered:** Infinite scrolling or attempting to retrieve beyond GitHub's search result limit.

**Why I chose this:** It makes navigation explicit and respects GitHub's 1,000-result search limit.

**Trade-off:** Users navigate between pages instead of continuously scrolling.

## Search & Async Behavior

Input is reflected in the URL immediately. After 350 ms without a change, the trimmed search term is passed to the search hook; terms shorter than two characters do not trigger a request. Query keys use `["github-search", searchType, searchTerm, page]`, so different searches and pages have separate server-state entries.

The query function passes TanStack Query's `AbortSignal` to the GitHub service. Changing the query key isolates results by search; obsolete responses cannot become the current key's data. Previous results may remain visible while changing pages within the same type and term, and the Next control is disabled while that placeholder page is loading.

The URL page is normalized to an integer from 1 through 50 before it reaches the query or API. This matches the 20-result page size and GitHub's 1,000-result search limit; noncanonical page values are replaced in the URL.

## Error Handling

The HTTP client distinguishes network failures, cancellation, invalid requests, rate limits, not-found responses, validation failures, server failures, and other HTTP or unexpected errors. UI messages do not expose stack traces or raw technical details.

Search and profile/repository operations provide manual retry when appropriate. Rate-limit errors are not automatically retried and do not offer the normal retry action; available reset or retry timing is shown. Repository data and recent issues load independently, so an issue failure does not replace successfully loaded repository details.

## Performance

TanStack Query caches results by query key with a 30-second default stale time and deduplicates requests for the same active key. The query client disables automatic retries and window-focus refetches. Debouncing reduces repeated search requests, and obsolete requests can be cancelled through `AbortSignal`.

Only the selected user's full profile is requested; profile queries are keyed by username and reuse cached data. Search renders one 20-item page at a time. Repository detail requests fetch one repository and the first 10 issue endpoint entries; the UI does not fetch issue details individually. No unnecessary memoization or client-side API cache is added.

## Accessibility

The UI uses semantic headers, main content, sections, articles, lists, and navigation. Search has an associated label and hint, search-type buttons expose their selected state, and pagination has a labelled navigation region and disabled states. Loading and errors use status/alert announcements; controls and links are keyboard operable and have visible focus styles. A skip link targets the main content. Layouts adapt for narrow screens without horizontal overflow in the reviewed mobile viewport.

## Security

- The application uses the public API without credentials or API keys.
- The HTTP client uses a fixed GitHub HTTPS API base URL, `URLSearchParams`, and encoded dynamic path segments.
- No `dangerouslySetInnerHTML` or arbitrary HTML rendering is used; API text is rendered as text.
- External GitHub links opened in a new tab use `rel="noopener noreferrer"`.

These measures reflect the current client-side scope; they are not a substitute for a broader security review if the application later handles credentials or untrusted external data sources.

## Testing

The current suite has **41 passing tests** in two test files, using Vitest and Testing Library.

- Search behavior: debounce timing, minimum query length, query cancellation, rapid input changes, URL state, page normalization, and pagination.
- Search presentation: empty results, repository navigation, user results, selected profile loading/caching/cancellation, and rate-limit/network error actions.
- Repository behavior: loading, details, not-found and retry states, independent issue loading/errors, empty issues, issue rendering, and pull-request filtering.

Run the suite with `npm test`.

## Trade-offs

1. **User profile details are on demand:** GitHub's user search response does not contain all requested statistics. Loading only a selected profile avoids extra requests for every listed user, but profile details require an explicit action.
2. **Recent issues use the first 10 endpoint entries:** GitHub can include pull requests in this response. They are filtered from issue display, so fewer than 10 issues may appear even when later issues exist.
3. **Public API limits apply:** Unauthenticated GitHub API use is subject to public rate limits and availability.
4. **Pagination is page-based:** This is explicit and bounded to the search API's first 1,000 results rather than using infinite scrolling.

## Assumptions

- The public GitHub REST API is available to the browser.
- Assessment scope does not require authentication; no credentials are required by the application.
- GitHub search results, issue ordering, available fields, and rate limits follow the public API response.
- Full user profile details are useful when selected, rather than for every search result.

## Known Limitations

- Full user profile statistics are loaded only after selecting a user.
- Because the application fetches the first 10 issue endpoint entries before filtering pull requests, it may display fewer than 10 issues.
- Unauthenticated public API rate limits can prevent or delay requests.
- Search results are limited to GitHub's first 1,000 results.

## AI Usage Disclosure

AI tools were used to assist with project scaffolding, implementation, debugging, test generation, code review, and exploring implementation alternatives. The developer retained responsibility for engineering decisions and the final review. Decisions deliberately reviewed included TanStack Query rather than Redux, on-demand rather than bulk user-profile enrichment, forwarding request cancellation, bounding pagination to the API limit, and filtering pull requests from issue results.

## Development Notes

Within the four-hour assessment time-box, work was prioritized in this order:

**Architecture → Correctness → Reliability → UX → Maintainability → Performance → Polish**
