# GitHub Developer Intelligence

A React and TypeScript application for exploring developer and repository insights with the public GitHub REST API.

## Getting started

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or preview the build locally with `npm run preview`.

The application contains the shared shell, design tokens, and placeholder routes. Its GitHub API foundation is in `src/services/github`; it provides typed repository and user search, user and repository lookup, and repository issue requests. API calls accept `AbortSignal` for request cancellation. Search and repository UI features have not been implemented yet.
