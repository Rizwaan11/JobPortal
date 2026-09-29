# JobPortal frontend

The Next.js application for [JobPortal](../README.md). It provides public job discovery plus separate applicant, recruiter, and administrator workspaces.

## Responsibilities

- Render public and authenticated application areas with the App Router
- Keep backend access and refresh tokens out of browser JavaScript
- Store tokens in HttpOnly cookies through same-origin auth routes
- Forward protected requests to the Express API from server-side route handlers
- Apply role-aware navigation and route protection
- Present loading, empty, error, and not-found states for the main workflows

## Application areas

- `src/app/jobs` — public job list and details
- `src/app/portal` — applicant profile, shortlist, and application tracking
- `src/app/dashboard` — recruiter company, jobs, members, and pipeline
- `src/app/admin` — company, job, and user moderation
- `src/app/api` — backend-for-frontend route handlers
- `src/proxy.ts` — session-aware route protection

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `API_URL` in `.env.local` to the Express server URL. For the default local setup:

```env
API_URL=http://localhost:5000
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev       # development server
npm run lint      # ESLint
npm run build     # production build
npm run start     # run the production build
```

For architecture, infrastructure, backend setup, and the live demo, see the [root project README](../README.md).
