# AGENTS.md

This repository is a React + Vite admin dashboard for warehouse and logistics management. The app uses Firebase Authentication/Firestore, nested admin pages, and role-based route protection.

## Project overview

- App entry: [src/App.jsx](src/App.jsx)
- Firebase setup: [src/firebase.js](src/firebase.js)
- Main layout and routing shell: [src/layouts/DashboardLayout.jsx](src/layouts/DashboardLayout.jsx)
- Protected route checks: [src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)
- Feature pages: [src/pages/admin](src/pages/admin)
- Shared UI and modal components: [src/components](src/components)
- Export/report helpers: [src/utils](src/utils)
- Project setup and scripts: [README.md](README.md), [package.json](package.json)

## Common commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Run lint: `npm run lint`

## Architecture and conventions

- Prefer the existing folder layout: pages live under `src/pages/admin`, shared UI under `src/components`, and supporting logic under `src/utils`.
- Maintain the current React + Vite pattern rather than introducing a new state management library unless the task clearly requires it.
- Keep UI styling consistent with the existing Tailwind utility classes and Lucide icons already used across the app.
- When changing a feature page, match the established Indonesian labels and admin dashboard terminology used in the current screens.
- Role-based access is enforced in [src/App.jsx](src/App.jsx) via `ProtectedRoute` and `allowedRoles`. If a screen needs a new permission, update that route configuration instead of bypassing it.
- Firebase data access is centralized around Firestore collections such as `employees`, `departemen`, and other admin resources. Keep collection names and field keys consistent with the current code.

## Safe workflow for changes

- Prefer small, local edits that match surrounding patterns.
- Check the parent route and component structure before adding or moving logic.
- Verify build and lint health after functional changes using the project scripts above.
- If a task touches a specific admin module, inspect the nearest existing page and modal pattern before implementing a new version.

## Useful references

- [README.md](README.md) for the basic project setup
- [package.json](package.json) for available scripts and dependencies
- [src/App.jsx](src/App.jsx) for routes and permission rules
- [src/firebase.js](src/firebase.js) for Firebase initialization
- [src/pages/admin/DataPegawai.jsx](src/pages/admin/DataPegawai.jsx) as a representative admin page pattern
