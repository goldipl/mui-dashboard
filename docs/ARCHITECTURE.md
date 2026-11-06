# Architecture

This document explains how the Newsroom Dashboard is put together and why. It is written for developers who are
going to change or extend the code.

## Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│ main.tsx → <App />                                                  │
│   ColorModeProvider     MUI theme, CssBaseline, light/dark switch    │
│   └─ NotificationProvider   one global Snackbar (useNotify)          │
│      └─ NewsroomProvider    global state + background jobs           │
│         └─ RouterProvider   createBrowserRouter(routes)              │
│            └─ AppLayout     Sidebar + TopBar + <Suspense><Outlet/>   │
│               └─ lazy page (Dashboard, Articles, Editor, …)          │
└─────────────────────────────────────────────────────────────────────┘
```

The app is a client-only SPA. A backend is replaced by an in-memory store that is persisted to `localStorage`.
Each feature lives in its own folder under `src/features/`. Shared building blocks live in `src/components/`,
and logic with no UI lives in `src/utils/` and `src/store/`, where it can be unit-tested.

## Folder conventions

| Folder | Rule |
| --- | --- |
| `types/` | The domain model only. No runtime code. |
| `data/` | Static configuration (`SITES`, `AUTHORS`) and the seed generator. |
| `utils/` | Pure functions with no React. Easy to test. |
| `store/` | Reducer (pure), provider (side effects), selectors (pure), storage (I/O). |
| `components/` | Generic, reusable UI. Components here do not know about a specific page. |
| `features/<name>/` | A page component (default export, lazy loaded) plus its private sub-components and helpers. |
| `layout/` | The application shell. |
| `theme/` | Theme factory and colour-mode context. |

Pages use **default exports** because `React.lazy` needs them. Every other component uses named exports.
Contexts and hooks are kept in separate files from the components that provide them, which keeps React Fast
Refresh working (the `react-refresh/only-export-components` lint rule).

## State management

The global state is a single object:

```ts
interface NewsroomState {
  version: number;          // schema version used for persistence
  articles: Article[];
  photos: Photo[];
  videos: Video[];
  activity: ActivityEvent[];
  profile: EditorProfile;
}
```

It is managed with `useReducer` in [`NewsroomProvider`](../src/store/NewsroomProvider.tsx).

### Pure reducer and impure action creators

- [`reducer.ts`](../src/store/reducer.ts) is **pure**. It never calls `Date.now()`, `Math.random()` or storage
  APIs, which makes it trivial to test.
- The provider exposes **action creators** through context (`actions.saveArticle`, `actions.setArticleStatus`, …).
  They create ids and timestamps, build an `ActivityEvent`, and dispatch a plain action.
- Any action can carry an optional `activity` event. The reducer prepends it to the activity log, which is capped
  at 100 entries.

```ts
const { state, actions } = useNewsroom();
actions.setArticleStatus([id], 'published');
```

`actions` is memoised once (`useMemo(..., [])`) and reads the latest state through a ref, so its identity never
changes and it is safe to use in effect dependencies.

### Persistence

[`storage.ts`](../src/store/storage.ts) writes the state to `localStorage` with a 400 ms debounce. On start-up the
stored state is used only when its `version` matches `STATE_VERSION`. Otherwise a fresh dataset is generated.
**Bump `STATE_VERSION` whenever the shape of the state changes.** If the quota is exceeded, the user sees a single
warning.

### Background jobs

The provider runs two intervals:

| Job | Interval | Behaviour |
| --- | --- | --- |
| Scheduler | 20 s | Publishes every `scheduled` article whose `scheduledAt` is in the past. |
| Transcoder | 1.5 s | Advances the `progress` of `processing` videos and marks them `ready` at 100%. |

Both read the current state through `stateRef`, so the intervals are created only once.

### Selectors

[`selectors.ts`](../src/store/selectors.ts) holds derived-data helpers such as `countByStatus`,
`publishedPerDay` and `articlesUsingMedia`. Pages wrap them in `useMemo`. For pure render output, values that
depend on "now" are captured once with `useState(() => Date.now())`.

## Routing

Routes are defined in [`src/app/routes.tsx`](../src/app/routes.tsx) and use the React Router **data router**
(`createBrowserRouter`). The data router is required for `useBlocker`.

| Path | Page |
| --- | --- |
| `/` | Dashboard |
| `/articles` | All articles (`?q=&status=&site=&author=&priority=`) |
| `/sites/:siteId` | Articles of one publication |
| `/media/photos`, `/media/videos` | Media libraries |
| `/publisher` | Workflow board and schedule |
| `/publisher/articles/new` | New article (`?site=&priority=breaking`) |
| `/publisher/articles/:articleId` | Edit article |
| `/profile` | Editor profile (`?tab=overview|articles|activity|settings`) |

Filters that are worth sharing (the article filters, the profile tab) live in the URL. Short-lived UI state
(dialogs, selection) lives in component state.

### Sub-path hosting

The app can be served from a sub-path, as on GitHub Pages (`/mui-dashboard/`). The `BASE_PATH` environment
variable sets Vite's `base`. The router receives `import.meta.env.BASE_URL` as its `basename`, so every
`<Link>` and `navigate()` call stays relative to it. Anything outside the router, such as static asset URLs,
must be built from `import.meta.env.BASE_URL` instead of a hard-coded `/`.

## Article editor

[`ArticleEditorPage`](../src/features/publisher/editor/ArticleEditorPage.tsx) chooses which article to edit, and
`ArticleEditor` holds the editing session:

- **`draft`**: the article being edited (local state, never shared until it is saved).
- **`baseline`**: the version that was last loaded or saved. `dirty = draft ≠ baseline`.
- If the stored article changes outside the editor (for example, the scheduler publishes it), the editor shows a
  *Load latest* warning instead of silently overwriting it.
- **Unsaved changes** are protected by `useBlocker` (in-app navigation) and `beforeunload` (closing the tab).
  After its own save or delete, the editor sets `skipBlockRef` so that its own redirect is not blocked.
- The editor is keyed by article id. When a new article is saved for the first time, the URL changes from `/new`
  to `/:id` and the editor remounts with the stored version.
- Workflow changes use `applyStatus()` from the reducer, so `publishedAt` and `scheduledAt` follow the same rules
  everywhere. Every status change stores a revision snapshot.

The body is a list of typed `ContentBlock`s rather than HTML. That keeps validation, word counts and previews
simple, and it maps directly to a JSON API.

## Workflow rules

All business rules live in [`utils/workflow.ts`](../src/utils/workflow.ts): the allowed transitions, the
next and previous board column, and `validateForPublish()`. The same rules are used by the article editor, the
publisher board (`useWorkflow`) and the bulk actions on the Articles page. See [DATA_MODEL.md](DATA_MODEL.md) for
the details.

## Theming

[`createAppTheme(mode)`](../src/theme/theme.ts) builds a light or dark theme with:

- the Inter typeface for the UI and Merriweather (`HEADLINE_FONT`) for article headlines and previews,
- outlined cards, 10 px corner radius and no uppercase buttons,
- an `.active` style for navigation links (`NavLink` adds the class automatically).

`ColorModeProvider` follows `prefers-color-scheme` until the user toggles the mode, and then remembers the choice.

## MUI 9 notes

The project targets Material UI 9 and MUI X 9:

- Use `slotProps` (`slotProps.input`, `slotProps.htmlInput`, `slotProps.paper`, `slotProps.primary`…) instead of
  the removed `InputProps`, `PaperProps` and `primaryTypographyProps`.
- `Grid` uses the `size={{ xs, md }}` API.
- Style through `sx` instead of system props on `Box` and `Typography`.
- The DataGrid selection model is `{ type: 'include' | 'exclude', ids: Set }`. `ArticlesTable` converts it to a
  plain `string[]`.

## Performance

- Every page is a `React.lazy` chunk. The data grid and charts are only downloaded when a page needs them.
- Search inputs are debounced (`useDebouncedValue`).
- Lists are memoised. The photo grid loads 24 items at a time.
- Images use `loading="lazy"` and are served as small thumbnails in lists.

## Testing strategy

| Level | Examples |
| --- | --- |
| Unit | `text.test.ts`, `workflow.test.ts`, `reducer.test.ts`, `filterArticles.test.ts`, `seed.test.ts` |
| Component | `Chips.test.tsx`, `ProfileSettingsForm.test.tsx` |
| Integration | `ArticleEditorPage.test.tsx` (real router, creating a draft, validation, navigation guard) |
| Smoke | `routes.smoke.test.tsx` renders every route and fails on any `console.error` |

Tests use `createTestState()`, which seeds data against a fixed date, so results are deterministic.

## Replacing the mock backend

To connect a real API:

1. Keep the `NewsroomActions` interface and implement it with API calls (for example with TanStack Query
   mutations).
2. Replace `createInitialState()` with data fetching, and remove `storage.ts`.
3. Move the scheduler and transcoder jobs to the server.
4. `types/index.ts` already describes the payloads, and dates are ISO strings.
