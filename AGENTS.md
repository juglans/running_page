# AGENTS.md

This document provides guidance for agentic coding assistants working on this running_page repository.

## Project Overview

React + TypeScript + Vite application for displaying personal running activities with interactive maps. Supports data sync from Garmin, Nike Run Club, Strava, and GPX/TCX/FIT files. Uses Mapbox for visualization and React Router for routing.

## Development Commands

### Core Commands

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `pnpm develop` | Start dev server (http://localhost:5173) |
| `pnpm build`   | Build for production                     |
| `pnpm serve`   | Preview production build                 |
| `pnpm lint`    | Run ESLint with auto-fix (`.ts`, `.tsx`) |
| `pnpm check`   | Format with Prettier                     |
| `pnpm ci`      | Run check + lint + build (CI validation) |

### Data Management Commands (Python)

| Command                                                                          | Description                            |
| -------------------------------------------------------------------------------- | -------------------------------------- |
| `python3 run_page/garmin_sync.py <secret>`                                       | Sync Garmin data                       |
| `python3 run_page/nike_sync.py <token>`                                          | Sync Nike data                         |
| `python3 run_page/strava_sync.py <id> <secret> <token>`                          | Sync Strava data                       |
| `python3 run_page/keep_sync.py <token>`                                          | Sync Keep data                         |
| `python3 run_page/gpx_sync.py`                                                   | Process GPX files                      |
| `python3 run_page/tcx_sync.py`                                                   | Process TCX files                      |
| `python3 run_page/fit_sync.py`                                                   | Process FIT files                      |
| `python3 run_page/gen_svg.py --from-db --type github --output assets/github.svg` | Generate activity SVG                  |
| `pnpm run data:clean`                                                            | Clean all data files and database      |
| `pnpm run data:analysis`                                                         | Generate GitHub-style contribution SVG |

**Note:** No test framework exists. Do not add or assume test commands.

## Code Style Guidelines

### TypeScript & Types

- Strict mode enabled in `tsconfig.json`
- Define interfaces for props and data structures
- Export types at module level when used across files
- Use `type` for aliases, `interface` for object shapes
- Avoid `any` - use explicit types or `unknown` with type guards

### Component Structure

- Functional components only (no class components)
- Use React Hooks for state and effects
- Separate concerns: hooks in `src/hooks/`, utils in `src/utils/`, components in `src/components/`
- Each component folder contains `index.tsx` and related files
- Use CSS Modules with `.module.scss` extension

### Imports Order

1. External libraries: `import React from 'react';`
2. Path aliases: `import { useActivities } from '@/hooks/useActivities';`
3. Relative imports: `import RunMarker from './RunMarker';`
4. Styles last: `import styles from './style.module.scss';`

Prefer named exports over default exports.

### Naming Conventions

| Type                | Convention       | Example                               |
| ------------------- | ---------------- | ------------------------------------- |
| Components          | PascalCase       | `RunMap`, `RunMarker`                 |
| Functions/variables | camelCase        | `formatPace`, `convertMovingTime2Sec` |
| Constants           | UPPER_SNAKE_CASE | `USE_DASH_LINE`, `LINE_OPACITY`       |
| Types/interfaces    | PascalCase       | `Activity`, `IViewState`              |
| CSS classes         | kebab-case       | `run-title`, `map-container`          |
| Utility files       | kebab-case       | `track-route.tsx`                     |
| Component files     | PascalCase       | `RunMap.tsx`                          |

### Formatting (Prettier)

- Single quotes for strings
- Trailing commas (ES5 compatible)
- Semicolons required
- Bracket spacing: `{ spacing: true }`
- 2-space indentation
- Run `pnpm check` before committing

### Error Handling

- Use try-catch for operations that may throw
- Return sensible defaults on error (empty arrays, fallback values)
- Console errors sparingly; prefer user-friendly UI messages
- Validate external data before processing

### State Management

- Prefer React hooks (useState, useEffect, useCallback, useMemo, useRef)
- Custom hooks for reusable logic
- Context only when prop drilling becomes unwieldy
- Keep state local to components when possible

### Performance

- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations in renders
- Lazy load large assets via dynamic imports
- Map component uses ref callbacks for initialization

### Path Aliases

- `@/*` → `./src/*`
- `@assets/*` → `./assets/*`
- Example: `import activities from '@/static/activities.json';`

## File Organization

```
src/
├── components/      # React components
├── hooks/           # Custom React hooks
├── pages/           # Route-level components
├── static/          # Static data (activities.json, site-metadata.ts)
├── styles/          # Global SCSS files
├── utils/           # Utility functions and constants
└── main.tsx         # Application entry point
```

## Configuration Files

| File             | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `tsconfig.json`  | TypeScript config with path aliases      |
| `vite.config.ts` | Vite build config, SVG plugins, chunking |
| `.eslintrc.js`   | ESLint rules                             |
| `.prettierrc.js` | Code formatting rules                    |
| `package.json`   | Dependencies and scripts                 |

## Important Notes

- Node.js >= 18 required
- Python >= 3.8 required for data sync scripts
- Activities data generated by Python scripts, not committed
- Mapbox token configurable in `src/utils/const.ts`
- Support for both Chinese and English (via `IS_CHINESE` constant)
- Use pnpm as package manager
