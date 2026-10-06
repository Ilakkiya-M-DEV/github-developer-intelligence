# GitHub Developer Intelligence

A React and TypeScript application for exploring developer and repository insights with the public GitHub REST API.

## Getting started

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or preview the build locally with `npm run preview`.

The application contains responsive repository and user search, page-based pagination, and repository detail pages with recent issues. Search state is shareable through URL parameters (`q`, `type`, and `page`), and requests are debounced by 350 ms. Terms must contain at least 2 non-whitespace characters before a request is made. Loading, empty, and error states are provided throughout.

TanStack Query manages server state, caching, and request cancellation. Search feature hooks call the reusable GitHub API service in `src/services/github`, which provides typed repository and user search, user and repository lookup, and repository issue requests. Search components use focused UI models mapped from API response models.

GitHub's user search response does not include complete profile fields such as a user's display name, location, follower/following counts, or public repository count. Search cards explain that these details are not included and load the full profile only when the user selects **Load profile details**. This avoids making one extra profile request for every result on every search or page. Selected profiles are cached by username with TanStack Query, and an in-flight request is cancelled when its details are closed or no longer displayed.

Search tests cover debouncing, query cancellation, URL state, pagination, errors, and profile enrichment. Repository tests cover loading/error states, repository and issue rendering, retry behavior, and filtering pull requests from recent issues. Run all tests with `npm test`.
