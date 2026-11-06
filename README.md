# Newsroom Dashboard

An editorial dashboard for a news publishing house, built with **React 19**, **Material UI 9** and **TypeScript**.
One newsroom runs five publications. Editors can manage articles for every site, look after the photo and video
libraries, keep their own profile up to date, and move stories through the editorial workflow in the
**Publisher panel**, which includes a full article editor.

**Live demo:** https://goldipl.github.io/mui-dashboard/

![React](https://img.shields.io/badge/React-19.3-61dafb?logo=react&logoColor=white)
![Material UI](https://img.shields.io/badge/Material_UI-9.5-007fff?logo=mui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3-646cff?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/tested_with-Vitest-6e9f18?logo=vitest&logoColor=white)
![Conventional Commits](https://img.shields.io/badge/Conventional_Commits-1.0.0-fe5196?logo=conventionalcommits&logoColor=white)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Demo data and persistence](#demo-data-and-persistence)
- [Testing](#testing)
- [Contributing and commit convention](#contributing-and-commit-convention)
- [Documentation](#documentation)
- [License](#license)

## Features

| Module | What it does |
| --- | --- |
| **Dashboard** | KPI tiles with trends, publishing activity per site (stacked area chart), content share by site, review queue, top articles, views per site, media summary and an activity feed. |
| **Editor profile** | Profile header with stats, an *Overview* tab (bio, contact details, beats, publication chart, workflow breakdown, top categories), *My articles*, an *Activity log* and *Settings* (validated profile form, sites, notification preferences). |
| **Articles** | Every article from every site in one data grid. Status tabs with counters, full-text search, filters for site, author and priority, bulk workflow actions, bulk delete and CSV export. Filters live in the URL, so you can share a filtered view. |
| **Sites** | One tab per publication (*The Daily Herald*, *Sport Today*, *Tech Pulse*, *Market Wire*, *Living & Style*) with site KPIs, a 14-day publishing trend, a category chart and the site's own article list. |
| **Photos** | Grid or list view, search, license and tag filters, sorting, multi-select and bulk delete. Drag-and-drop upload resizes images in the browser. A details drawer lets you edit metadata and shows which articles use a photo. |
| **Videos** | Video cards with duration, resolution and status. Transcoding is simulated with live progress, and failed jobs can be retried. Includes an upload dialog that reads the clip duration, plus a player and metadata editor. |
| **Publisher panel** | A kanban workflow board (Draft → In review → Scheduled → Published) with drag and drop, validation on every transition, and a 7-day publishing schedule. |
| **Article editor** | Block-based body editor (paragraph, subheading, quote, list, image, video), automatic slug, lead and headline counters, live preview (desktop and mobile), SEO and social card previews, revision history with restore, a publishing checklist, scheduling, duplicate and delete, Ctrl + S to save, and a guard against losing unsaved changes. |

Cross-cutting features:

- Light and dark mode. It follows the OS until you choose one, and your choice is remembered.
- A responsive layout with a collapsible sidebar on desktop and a drawer on mobile.
- Global article search in the top bar, a notifications menu and a *Reset demo data* action.
- A background **scheduler** that publishes scheduled articles automatically when their time comes.
- Every page is lazy-loaded (code splitting), so the charts and the data grid load only when needed.

## Tech stack

| Area | Library |
| --- | --- |
| UI framework | [React 19](https://react.dev) |
| Component library | [Material UI 9](https://mui.com/material-ui/) and Material Icons |
| Data grid and charts | [MUI X Data Grid](https://mui.com/x/react-data-grid/) and [MUI X Charts](https://mui.com/x/react-charts/) (MIT editions) |
| Routing | [React Router 8](https://reactrouter.com) (data router, `useBlocker`) |
| Dates | [Day.js](https://day.js.org) |
| Build tool | [Vite 8](https://vite.dev) |
| Language | TypeScript 6 (strict mode) |
| Testing | [Vitest 5](https://vitest.dev), [Testing Library](https://testing-library.com), jsdom |
| Code quality | ESLint 10 (typescript-eslint, react-hooks, react-refresh), EditorConfig |
| Git hooks | Husky, commitlint (Conventional Commits) |

## Getting started

### Requirements

- **Node.js 20.19+** (22 LTS recommended; see `.nvmrc`)
- npm 10+

### Installation

```bash
git clone <repository-url> newsroom-dashboard
cd newsroom-dashboard
npm install        # also installs the Git hooks (husky)
npm run dev        # http://localhost:5173
```

### Production build

```bash
npm run build      # type-check + bundle into dist/
npm run preview    # serve the production build locally
```

The app is a static single-page application, so `dist/` can be deployed to any static host (Netlify, Vercel, GitHub
Pages, S3 and others). Configure the host to fall back to `index.html` so client-side routes work.

### Deployment to GitHub Pages

Every push to `main` deploys the app to **https://goldipl.github.io/mui-dashboard/** through the
[`deploy.yml`](.github/workflows/deploy.yml) workflow. You can also start it manually from the **Actions** tab.
The workflow:

1. runs the tests,
2. builds with `BASE_PATH=/mui-dashboard`, so assets and routes are served from the repository sub-path,
3. copies `index.html` to `404.html`, so deep links such as `/mui-dashboard/publisher` work after a refresh,
4. publishes `dist/` with `actions/deploy-pages`.

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.

To test a sub-path build locally:

```bash
BASE_PATH=/mui-dashboard npm run build
npm run preview    # http://localhost:4173/mui-dashboard/
```

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot module replacement. |
| `npm run build` | Type-check the project (`tsc -b`) and create a production build. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint on the whole project. |
| `npm run typecheck` | Run the TypeScript compiler without emitting files. |
| `npm test` | Run the test suite once. |
| `npm run test:watch` | Run tests in watch mode. |

## Project structure

```text
src/
├── app/                 # App root, providers and route definitions (+ route smoke tests)
├── components/          # Reusable UI: PageHeader, StatCard, chips, dialogs, media picker…
├── data/                # Static configuration (sites, authors) and the demo data generator
├── features/            # One folder per module
│   ├── articles/        # Articles page, shared ArticlesTable, filtering and CSV export
│   ├── dashboard/       # Dashboard page and widgets
│   ├── errors/          # 404 and route error pages
│   ├── photos/          # Photo library, upload dialog, details drawer
│   ├── profile/         # Editor profile, overview, activity, settings form
│   ├── publisher/       # Workflow board, schedule dialog
│   │   └── editor/      # Article editor: blocks, preview, SEO, history, sidebar panels
│   ├── sites/           # Articles per publication
│   └── videos/          # Video library, upload and details dialogs
├── hooks/               # Generic hooks (debounce, document title, notifications)
├── layout/              # App shell: sidebar, top bar, navigation config
├── store/               # Global state: reducer, provider, selectors, persistence
├── test/                # Test setup and render helpers
├── theme/               # MUI theme and colour-mode provider
├── types/               # Domain model (Article, Photo, Video, EditorProfile…)
└── utils/               # Pure helpers: formatting, slugs, workflow rules, image resizing
docs/                    # Project documentation
```

## Demo data and persistence

There is no backend. On first launch the app generates a **deterministic demo dataset**: 150 articles across 5
sites, 60 photos, 18 videos, 8 newsroom members and an activity log. All dates are relative to the current day, so
the charts always look current.

- Every change is saved to `localStorage` (key `newsroom-dashboard/state`), so your edits survive a page reload.
- Choose **avatar menu → Reset demo data** to restore the original dataset.
- Uploaded photos are downscaled in the browser (max 1600 px) and stored as data URLs. Browser storage is limited
  (usually about 5 MB), and the app warns you once if it fills up.
- Video uploads are simulated: the file is not stored, a public-domain sample clip is played instead, and
  transcoding progress is simulated.
- Images come from [picsum.photos](https://picsum.photos), so an internet connection is needed to see them.

All site names use the reserved `.example` domain, and all people in the dataset are fictional.

## Testing

```bash
npm test
```

The suite (55 tests) covers:

- **Pure logic**: slug generation, text statistics, workflow transitions and publishing validation, reducer
  behaviour, filtering and CSV export, profile validation, and the determinism of the demo data.
- **Components**: chips and the profile settings form (validation and dirty state).
- **Integration**: the article editor (creating a draft, blocked publishing, the unsaved-changes guard).
- **Smoke tests**: every route renders inside the real layout without console errors.

## Contributing and commit convention

This project follows **[Conventional Commits](https://www.conventionalcommits.org)**. Commit messages are checked
by commitlint in a Husky `commit-msg` hook, and the `pre-commit` hook runs lint and type-check.

```text
feat(editor): add revision restore
fix(photos): keep selection after filtering
docs: describe the publishing workflow
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide (types, scopes, branching, pull requests).

## Documentation

| Document | Contents |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture, state management, routing, theming and design decisions |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | How to use each module, from the newsroom's point of view |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Domain entities, workflow states and validation rules |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development workflow and commit convention |
| [CHANGELOG.md](CHANGELOG.md) | Release notes |

## License

[MIT](LICENSE)
