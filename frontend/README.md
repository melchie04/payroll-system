# Payroll System — Frontend

The web interface for the payroll system: timesheet capture and review, payroll runs,
client billing, and the employee and client records behind them.

This folder is the frontend only. The backend is a later phase, so all data currently
comes from `src/assets/data/index.js` and lives in React state.

## Stack

| Piece | What it is |
| --- | --- |
| React 19 | The UI library |
| Vite 8 | Dev server and build tool |
| React Router 8 | Maps URLs to pages |
| Bootstrap 5.3.8 | CSS framework, imported from source in `styles.scss` |
| Sass | Stylesheet language for everything under `assets/scss/` |
| Font Awesome 7 | Icons |
| Inter | Typeface, self-hosted via `@fontsource-variable/inter` |

## Running it

```bash
npm install     # once, and after any dependency change
npm run dev     # start the dev server
npm run build   # production build into dist/
npm run preview # serve the production build locally
npm run lint    # ESLint; should report nothing
```

## How the folders are arranged

```
src/
  main.jsx              Entry point: mounts React and nests every provider
  App.jsx               The route table

  assets/data/          Seed data standing in for the backend
  assets/scss/          All styling (see below)

  components/           Footer, SideNav, TopNav — the app shell
  components/ui/        Shared building blocks, re-exported from ui/index.jsx

  context/contexts.js   The context objects
  context/hooks.js      useEmployees, useTimesheets and the rest
  context/*Context.jsx  One provider component each

  layouts/              The three page frames: dashboard, auth, error
  pages/                One folder per nav item; tab content in a tabs/ subfolder
  utils/                Pure calculations with no React in them
```

## How the styling is layered

`main.jsx` loads two stylesheets, in this order:

1. `assets/scss/styles.scss` — the framework layer. Imports the Bootstrap modules this
   app uses, straight from the package. Nothing project-specific belongs here.
2. `assets/scss/app.scss` — the app layer. Loads `_variables.scss` first, then one
   partial per area of the interface.

Because the app layer loads second, it wins wherever the two disagree.

Every variable lives in `_variables.scss`: the design tokens, the type scale, the icon
and layout sizes, and the dark palette. Dark mode works by re-aiming those tokens under
`[data-bs-theme="dark"]`, never by rewriting markup.

## House rules

- Prefer deleting a superseded rule at its source over adding another rule to cancel it.
- Every component, page and stylesheet opens with a one-line comment saying what it is.
  Named functions carry a short comment explaining what they do.
- `.prettierrc.json` at the repo root sets `printWidth` to 150.
