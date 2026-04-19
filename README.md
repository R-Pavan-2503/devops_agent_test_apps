# AppHub Monorepo

A dynamic multi-app platform where a single shell app hosts multiple sub-apps. App discovery is automatic!

## How to Install

```bash
npm run install:all
```

_(This uses our dynamic script from the root `scripts/install-all.js` to install dependencies for `main-app` and all sub-apps found in `apps/`)_

## How to Run

```bash
npm run dev:all
```

_(Starts the main shell on port 3000, and fully boots all frontend and backend servers dynamically based on what it finds in `apps/`)_

## How to add a new app

1. Create a new folder in `apps/`: e.g., `apps/notes/`
2. Inside that folder, create a `frontend/` and/or `backend/` directory with a valid `package.json` inside.
3. Restart the dev server. It will be discovered automatically and added to the sidebar! No config needed!

## Jira Integrated
