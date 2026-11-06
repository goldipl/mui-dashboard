# Contributing

Thank you for helping improve the Newsroom Dashboard. This guide describes the development workflow.

## Setup

```bash
npm install     # installs dependencies and the Husky Git hooks
npm run dev
```

Before you open a pull request, make sure that all of these pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The `pre-commit` hook runs lint and type-check automatically. The CI workflow runs all four commands.

## Branches

Create a branch from `main` and give it a short, descriptive name:

```text
feat/editor-autosave
fix/photos-upload-quota
docs/user-guide-publisher
chore/update-mui
```

## Commit messages: Conventional Commits

Every commit message must follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org). The
`commit-msg` hook checks this with commitlint and rejects messages that don't match.

```text
<type>(<optional scope>): <short summary in imperative mood>

<optional body: what and why, wrapped at 100 characters>

<optional footer: BREAKING CHANGE: …, Closes #123>
```

### Types

| Type | Use for |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting that doesn't change behaviour |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A performance improvement |
| `test` | Adding or fixing tests |
| `build` | The build system or dependencies |
| `ci` | CI configuration |
| `chore` | Maintenance that doesn't touch `src` or tests |
| `revert` | Reverting a previous commit |

### Scopes

Scopes are optional but recommended. These are configured in `commitlint.config.js`:

`app`, `articles`, `dashboard`, `deps`, `docs`, `editor`, `layout`, `photos`, `profile`, `publisher`, `sites`,
`store`, `theme`, `tests`, `tooling`, `videos`

### Examples

```text
feat(editor): add bullet list block
fix(publisher): prevent scheduling in the past
refactor(store): move workflow rules to utils
test(articles): cover CSV export escaping
docs: document the editorial workflow
build(deps): bump @mui/material to 9.5.0
feat(store)!: rename article.lead to article.standfirst

BREAKING CHANGE: persisted state version bumped to 2, local data is reset.
```

Rules:

- Use the imperative mood: "add", not "added" or "adds".
- Don't capitalise the first letter of the summary, and don't end it with a period.
- Keep the header to 100 characters or fewer.
- Mark a breaking change with `!` after the type or scope, **and** add a `BREAKING CHANGE:` footer.

## Code style

- TypeScript in strict mode. Avoid `any`, and prefer the domain types from `src/types`.
- Use MUI 9 APIs: `slotProps` instead of the removed `*Props` props, `sx` instead of system props, and the
  `Grid` `size` prop.
- Keep business rules in `src/utils` or `src/store`, where they are pure and tested, not in components.
- Pages use a default export (because they are lazy loaded). Everything else uses named exports.
- Put contexts and hooks in their own files so that Fast Refresh keeps working.
- All user-facing text is in English.
- If you change the shape of the persisted state, bump `STATE_VERSION` in `src/store/reducer.ts`.

## Tests

- Add unit tests for new pure logic next to the file: `something.ts` → `something.test.ts`.
- Use `renderWithProviders()` and `createTestState()` from `src/test/` in component tests.
- When you add a route, add it to `src/app/routes.smoke.test.tsx`.

## Pull requests

1. Keep each PR focused on one topic.
2. Use a Conventional Commit style title for the PR, because it becomes the squash commit message.
3. Describe **what** changed and **why**. Add screenshots for UI changes.
4. Update the documentation (`README.md`, `docs/`) and `CHANGELOG.md` when behaviour changes.
5. After visible UI changes, run `npm run screenshots` and commit the updated images in `docs/screenshots/`.
   It needs Microsoft Edge or Google Chrome installed.
