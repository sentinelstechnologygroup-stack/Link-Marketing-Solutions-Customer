# AGENTS.md

This is a Vercel-deployable React/Vite portal repository.

## Project scope

- Frontend app source lives in `src/`.
- Runtime API settings are driven by environment variables in `.env.local`.
- Prefer standard Vite/NPM workflows unless deployment scripts are explicitly changed.

## Key files

- `src/api/portalAuthClient.js`: portal auth compatibility layer backed by the portal service adapter.
- `src/lib/app-params.js`: app-level identifiers + token source.
- `vite.config.js`: Vite plugins and build configuration.
- `.npmrc` and `package-lock.json`: lockfile/install policy for reliable installs.

## Protected UI and migration rule

- Never delete page layouts, navigation, controls, forms, tables, cards, account screens, workflows, or test fixtures when replacing a backend or data source.
- Preserve the complete presentation and interaction layer while migrating adapters incrementally from fixture data to live services.
- Keep fixtures available as an explicit development/test fallback until live parity, authorization, and end-to-end behavior are verified.
- Remove fixtures or legacy integrations only as a separate, explicitly approved cleanup step after parity testing passes.
- Never disable, narrow, relocate, or change the permanent demo experience during a production migration without explicit approval; production data-source changes must not alter demo behavior.
