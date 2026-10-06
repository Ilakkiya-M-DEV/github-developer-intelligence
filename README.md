# GitHub Developer Intelligence

A React and TypeScript application for exploring developer and repository insights with the public GitHub REST API.

## Getting started

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or preview the build locally with `npm run preview`.

The application contains a responsive search experience for public GitHub repositories and users. Search state is shareable through URL parameters (`q`, `type`, and `page`), and requests are debounced by 350 ms. Terms must contain at least 2 non-whitespace characters before a request is made.

TanStack Query manages server state and request cancellation. The reusable GitHub API foundation is in `src/services/github`; it provides typed repository and user search, user and repository lookup, and repository issue requests. The repository route remains a placeholder.

GitHub's user search response does not include complete profile fields such as a user's display name, location, follower/following counts, or public repository count. Search cards explain that these details are not included, and load the full profile only when the user selects **Load profile details**. This avoids making one extra profile request for every result on every search or page. Selected profiles are cached by username with TanStack Query and an in-flight request is cancelled when its details are closed or no longer displayed.

Run focused tests with `npm test`.
