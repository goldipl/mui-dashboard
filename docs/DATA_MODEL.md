# Data model

All types are defined in [`src/types/index.ts`](../src/types/index.ts). Dates are ISO-8601 strings.

## Entities

```text
Site 1 ──── * Article * ──── 1 Author
                │  │
                │  └── 0..1 featured Photo
                └── * ContentBlock ── 0..1 Photo | Video
                └── * ArticleRevision

Photo, Video          media library shared by all sites
EditorProfile         the signed-in editor (extends Author)
ActivityEvent         newsroom activity log
```

### Site

| Field | Description |
| --- | --- |
| `id` | `herald`, `sport`, `tech`, `business` or `lifestyle` |
| `name`, `domain`, `description` | Display data (domains use the reserved `.example` TLD) |
| `color` | Brand colour, used for chips, charts and the preview header |
| `categories` | Sections available on that site |

### Article

| Field | Description |
| --- | --- |
| `title`, `slug`, `lead` | Headline, URL slug (generated automatically until the article is published) and summary |
| `body` | Array of `ContentBlock` |
| `siteId`, `category`, `tags` | Placement. The category must belong to the site. |
| `authorId` | Author (`AUTHORS` in `data/sites.ts`) |
| `status` | Workflow state, see below |
| `priority` | `low`, `normal`, `high` or `breaking` |
| `featuredImageId` | Optional photo id |
| `createdAt`, `updatedAt` | Timestamps |
| `publishedAt` | Set the first time the article is published |
| `scheduledAt` | Publication time while `status === 'scheduled'` |
| `views`, `comments` | Readership statistics |
| `isPremium`, `allowComments` | Options |
| `editorNotes` | Internal notes, never shown to readers |
| `seo` | `metaTitle`, `metaDescription`, `canonicalUrl`, `noIndex` |
| `revisions` | Newest first. Each revision has `note`, `authorId`, `createdAt` and a `snapshot` of title, lead and body. |

### ContentBlock

| `type` | Fields used |
| --- | --- |
| `paragraph` | `text` |
| `heading` | `text` |
| `quote` | `text`, `caption` (attribution) |
| `list` | `items` |
| `image` | `mediaId` (photo), `caption` |
| `video` | `mediaId` (video), `caption` |

### Photo

`title`, `caption`, `url`, `thumbnailUrl`, `width`, `height`, `credit`, `license`
(`editorial`, `royalty_free`, `rights_managed` or `creative_commons`), `tags`, `format`, `sizeKb`, `uploadedAt`
and `uploadedBy`.

When a photo is deleted, it is removed from every article that uses it as the featured image.

### Video

`title`, `description`, `thumbnailUrl`, `src`, `durationSec`, `status` (`processing`, `ready` or `failed`),
`progress` (0–100), `resolution`, `sizeMb`, `siteId`, `tags`, `views`, `uploadedAt` and `uploadedBy`.
Only `ready` videos can be inserted into articles.

### EditorProfile

Personal data (`name`, `email`, `phone`, `location`, `bio`, `languages`, `beats`, `social`), the sites the editor
works for (`siteIds`), the default site for new articles, and notification preferences.

Validation (`features/profile/validateProfile.ts`):

- the name must have at least 3 characters,
- the email must be valid,
- the phone number, when given, must have 7–20 digits, spaces or dashes,
- the bio can have at most 400 characters,
- at least one site must be selected.

## Editorial workflow

```text
            ┌──────────────┐
            │    Draft     │◄─────────────────────────┐
            └──┬───┬────┬──┘                          │
   submit      │   │    │ publish now                 │ back to draft /
               ▼   │    ▼                             │ unpublish / restore
        ┌──────────┐ │ ┌────────────┐   archive  ┌──────────┐
        │In review │─┼►│ Published  │───────────►│ Archived │
        └────┬─────┘ │ └────────────┘            └──────────┘
     approve │       │        ▲
             ▼       ▼        │ scheduler / publish now
          ┌──────────────┐    │
          │  Scheduled   │────┘
          └──────────────┘
```

Allowed transitions (`TRANSITIONS` in `utils/workflow.ts`):

| From | To |
| --- | --- |
| `draft` | `in_review`, `scheduled`, `published`, `archived` |
| `in_review` | `draft`, `scheduled`, `published` |
| `scheduled` | `draft`, `published` |
| `published` | `draft`, `archived` |
| `archived` | `draft` |

Date rules (`applyStatus` in `store/reducer.ts`):

- **published**: `publishedAt` is set to now, unless the article was already published. `scheduledAt` is cleared.
- **draft / in_review**: `scheduledAt` is cleared.
- **scheduled**: `scheduledAt` must be in the future.

## Publishing validation

`validateForPublish(article, target)` returns a list of issues. **Errors** block the transition. **Warnings** are
only shown in the publishing checklist.

| Rule | Severity |
| --- | --- |
| Headline has at least 10 characters | error |
| Lead has at least 30 characters | error |
| Body has at least 50 words | error |
| Category is selected | error |
| Scheduling: a date is set and it is in the future | error |
| Featured image is set | warning |
| Meta description is not empty | warning |
| Meta description is at most 160 characters | warning |

Validation runs when an article is submitted for review, published or scheduled. It also runs when a
non-draft article is saved.

## Activity log

Each action creator records an `ActivityEvent` (`type`, `message`, `at`, `actorId`, optional `articleId`). The
log keeps the latest 100 events and powers the dashboard feed, the notifications menu and the profile activity
tab.
