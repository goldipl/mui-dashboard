# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Conventional Commits](https://www.conventionalcommits.org).

## Unreleased

### Added

- Automatic deployment to GitHub Pages (`.github/workflows/deploy.yml`).
- Support for serving the app from a sub-path via the `BASE_PATH` build variable (Vite `base` and router
  `basename`).

## 1.0.0 - 2026-11-06

### Added

- Application shell with a collapsible sidebar, top bar, global search, notifications, user menu, and light and
  dark mode.
- **Dashboard** with KPI tiles, publishing activity and site share charts, review queue, top articles, views by
  site, media summary and activity feed.
- **Editor profile** with overview, my articles, activity log and a validated settings form.
- **Articles** list for all sites, with status tabs, filters synced to the URL, bulk workflow actions, bulk delete
  and CSV export.
- **Sites** view with per-publication KPIs, trend and category charts, and the site's article list.
- **Photo library** with grid and list views, filters, upload with in-browser resizing, a metadata drawer, usage
  tracking and bulk delete.
- **Video library** with status filters, simulated transcoding, retry for failed jobs, an upload dialog, a player
  and a metadata editor.
- **Publisher panel** with a drag-and-drop workflow board, validated transitions and a 7-day publishing schedule.
- **Article editor** with block-based body editing, live preview (desktop and mobile), SEO and social previews,
  revision history with restore, a publishing checklist, scheduling, duplicate and delete, Ctrl + S, and an
  unsaved-changes guard.
- Global state with a pure reducer, activity log, localStorage persistence, an automatic publishing scheduler and
  a demo data generator.
- Unit, component, integration and route smoke tests (Vitest and Testing Library).
- ESLint, TypeScript strict mode, Husky, commitlint (Conventional Commits) and a GitHub Actions CI workflow.
- Documentation: README, architecture, data model, user guide and contributing guide.
