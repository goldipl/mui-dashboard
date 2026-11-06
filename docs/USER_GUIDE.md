# User guide

This guide is for the people who use the dashboard every day: editors, reporters, photo editors and video
producers.

## Navigation

- The **sidebar** groups the modules into *Overview*, *Content*, *Media* and *Account*. On desktop you can collapse
  it with the arrow at the bottom. On phones and tablets, open it with the ☰ button.
- Badges in the sidebar show how many articles are **waiting for review** and how many videos are **processing**.
- The **top bar** has:
  - global article search (press Enter to open the results in *Articles*),
  - **Breaking** (start a breaking news article) and **New article**,
  - a light/dark mode switch,
  - notifications (recent newsroom activity),
  - the user menu (*My profile*, *Reset demo data*).

## Dashboard

The start page summarises the newsroom:

- **KPI tiles**: articles published today (with the change since yesterday), the review queue, scheduled
  articles, and views from this week. Click a tile to open the matching filtered list.
- **Publishing activity**: articles published per day over the last 14 days, stacked by site.
- **Content by site**: share of articles per publication. Click a site to open it.
- **Review queue**: articles waiting for approval, with breaking news first.
- **Top performing articles**: ranking by views. You can filter it by site.
- **Total views by site**, **Media library** and **Recent activity**.

## Articles

A single list of every article from every site.

1. Use the **status tabs** (All, Draft, In review, Scheduled, Published, Archived). The counters respect the other
   filters.
2. **Search** by headline, lead, tag, category or author, and filter by **site**, **author** and **priority**.
   The URL updates as you filter, so you can copy it and share the view.
3. Tick the checkboxes to use the **bulk actions**: *Send to review*, *Publish*, *Move to drafts*, *Archive* and
   *Delete*. Articles that cannot make the selected transition are skipped, and the notification tells you how
   many.
4. **Export CSV** downloads the currently filtered list.
5. Double-click a row, or use the ✎ icon, to open the article in the editor. The ⋮ menu has *Duplicate* and
   *Delete*.

## Sites

Each publication has its own tab with its brand colour, domain, 14-day publishing trend, KPIs and category chart.
Click a **category chip** to filter the list. Use the status buttons and search to narrow it down further.
**New … article** creates an article that is already assigned to that site.

## Photos

- Switch between **grid** and **list** view. Filter by license or tag, sort the results, and search by title,
  caption or credit.
- Click a photo to open the **details drawer**. There you can edit the title, caption, credit, license and tags,
  copy the URL, open the original, and see **which articles use the photo**.
- **Upload photos**: drag files onto the drop zone, or click to browse. You can upload up to 10 images at once,
  15 MB each. Set the title of each file and a shared credit and license. Images are resized in the browser.
- Click **Select** to enter selection mode for bulk deletes. If you delete a photo that is used as a featured
  image, it is removed from those articles.

## Videos

- The tiles show how many videos are ready, processing or failed, and the total number of plays.
- Filter by status or site, sort by date, views or duration, and search.
- Click a card to play the video (when it is ready) and edit its title, description, site and tags.
- **Upload video**: choose a file (its duration is detected automatically), then add a title, description, site
  and tags. In the demo, transcoding is simulated, and the progress bar fills up live.
- If transcoding failed, click **Retry** on the card.

## Publisher panel

The editorial workflow board.

| Column | Meaning |
| --- | --- |
| **Draft** | Work in progress |
| **In review** | Waiting for an editor's approval |
| **Scheduled** | Approved and queued for automatic publishing |
| **Published** | Live in the last 48 hours |

- **Drag a card** to another column, or use the ← and → arrows on the card.
- Moving an article to *In review* or *Published* checks it first. If something required is missing (for
  example, the body is too short), the move is refused and the reason is shown.
- Moving an article to *Scheduled* opens a **date picker**, with shortcuts such as *Tomorrow 07:00*.
- Use the filters for site, search and **Only my articles**.
- The **Publishing schedule** below the board shows what goes live over the next 7 days.

## Article editor

Open it from any list, or with **New article** or **Breaking**.

### Content tab

- **Headline**: about 90 characters is recommended. The **URL slug** follows the headline automatically until the
  article is published or you edit the slug yourself.
- **Lead**: one or two sentences, about 300 characters.
- **Body blocks**: add paragraphs, subheadings, quotes, bullet lists, images and videos with the buttons below the
  body. You can also hover between two blocks and click **+** to insert a block there. Use ↑ and ↓ to reorder
  blocks, and 🗑 to remove one. Image and video blocks open the media library picker.

### Preview tab

Shows how the article will look on the site, in **desktop** or **mobile** width, with the site's branding.

### SEO & social tab

Set the meta title (60 characters), the meta description (160 characters), the canonical URL and *noindex*. The
tab shows live previews of the **search result** and the **social card**. A dot on the tab means there is an SEO
warning.

### History tab

Every save that changes the content, and every status change, stores a **revision**. Click **Restore** to load
an older version into the editor. It is not saved until you save.

### Sidebar

- **Publishing**: the buttons depend on the article's status:
  - **Draft**: *Save draft*, *Submit for review*, *Publish now*, *Schedule…*
  - **In review**: *Save*, *Approve & publish*, *Schedule…*, *Request changes*
  - **Scheduled**: *Save*, *Change date*, *Publish now*, *Unschedule*
  - **Published**: *Update live article*, *Unpublish*, *Archive*
  - **Archived**: *Restore to draft*

  The **publishing checklist** lists errors (red, these block publishing) and warnings (amber).
- **Placement**: site, category, priority, author and tags.
- **Featured image**: choose, change or remove it.
- **Options**: premium (paywall), allow comments, and internal notes for editors.
- **Statistics**: words, reading time, number of blocks and characters. Views and comments appear once the
  article is published.

### Shortcuts and safety

- Press **Ctrl + S** (or **⌘ + S**) to save.
- If you try to leave the editor with unsaved changes, it asks you to confirm. Closing the browser tab shows the
  browser's own warning.
- If the scheduler publishes the article while you are editing it, a banner offers to **load the latest
  version**.

## My profile

- The **header** shows your role, location, the sites you work for, and your article statistics.
- **Overview**: bio, contact details, beats and languages, your publications over the last 30 days, the status of
  your articles, and your top categories.
- **My articles**: all articles you have written.
- **Activity**: your actions, or the whole newsroom's.
- **Settings**: edit your personal information, the sites you work for, the default site for new articles, and
  notification preferences. Fields are validated, and *Discard changes* reverts any edits you haven't saved.

## Resetting the demo

Open the avatar menu and choose **Reset demo data**. This restores the original articles, media and profile.
Changes are stored only in your browser.
