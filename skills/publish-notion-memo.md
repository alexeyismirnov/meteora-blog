# Skill: publish-notion-memo

**Name:** `publish-notion-memo`  
**Owner:** NotionPublisher

## Goal

Publish a researched token as a **full blog post page** on the Notion Site, and add it to the **home-page index** as a normal link. Do not treat the database table as the public reading experience. No draft approval.

## Public layout (required)

Notion Site should feel like a blog:

```text
Home (NOTION_HOME_URL)
  ├── intro / title
  ├── Posts (index) — newest first, each line links to a full post page
  └── Post pages — one full page per token (opened as a page, not a DB side peek)
```

- **Home page** = index. Readers click a post title → open that post’s **full page**.
- **Do not** make the main public entry point a database full-page (table of rows with side peek).
- A database is optional for your own filtering; if it exists, keep it out of the primary Site nav or below the fold. Public index = linked pages on Home.

## Inputs

- Research package from `research-token` (`mint`, `symbol`, `name`, `poolAddress`, `memo`, `sources`, `infoLevel`, `oneLineThesis`)
- Notion home: `~/meteora-blog/NOTION_HOME_URL` (the **Site home / blog index page**, not a nested DB URL)
- Registry path: `~/meteora-blog/researched-tokens.json`

## Steps

1. If the registry already contains this `mint`, stop and return `{ "ok": false, "error": "already_researched", "mint": "..." }` unless MeteoraDesk explicitly requested a re-publish.

2. Open the Notion **home page** from `NOTION_HOME_URL`.

3. Ensure the home page has a clear blog index section, for example a heading **Posts** (or **Memos**). Under it, keep a list of links to post pages, **newest first**. Create that heading if missing.

4. Create a **new full page** for this token (child of the home page, or under a `Posts` parent page — prefer child of home for a flat blog):

   - Page title: `name` or `symbol` (human-readable; e.g. `cat wif sword` or `swordcat · cat wif sword`)
   - Optional properties on the page (if using a DB template, fine — but the page must open as a **full page**):

   | Field | Value |
   |-------|--------|
   | Symbol | `symbol` |
   | Mint | `mint` |
   | Pool | `poolAddress` |
   | First seen | today’s date (ISO) |
   | Sources | joined source URLs |
   | Status | `published` if `infoLevel` is `solid`, else `thin-info` |

5. Page body (the post readers see):

   - Heading with symbol/name
   - Memo paragraphs (the 3–4 sentences)
   - Sources list (bulleted links)

6. **Update the home index:** at the top of the Posts list, add a line that **links to this new page**, e.g.:

   ```text
   · SYMBOL — short name (First seen YYYY-MM-DD)
   ```

   Use a Notion page mention / link to the post, not plain text. Keep newest entries first. Do not duplicate an existing index line for the same mint.

7. If a Memos database still exists from an older layout:
   - You may also add a row for bookkeeping, **or** leave the DB unused.
   - Do **not** rely on “open DB → click row → side peek” as the Site experience.
   - Prefer setting any remaining DB views to **Open pages in → Full page**, and keep the DB off the public home if the Posts link list is present.

8. Confirm the post page is under the published Notion Site (parent already published) and that clicking the home index link opens the full post.

9. Update `researched-tokens.json`:
   - Keep existing entries.
   - Add:

   ```json
   {
     "mint": "",
     "symbol": "",
     "name": "",
     "poolAddress": "",
     "firstSeen": "YYYY-MM-DD",
     "notionPageId": "",
     "notionUrl": "",
     "memo": ""
   }
   ```

   Prefer a top-level object map keyed by mint, or an array of entries — match the file’s existing shape. Default template uses `{ "tokens": [ ... ] }`.

10. Return:

```json
{
  "ok": true,
  "mint": "",
  "notionPageId": "",
  "notionUrl": "",
  "status": "published"
}
```

`notionUrl` must be the **public full post page** URL (or share link that opens the post), not the database table URL.

## One-time migration (existing DB-only sites)

If the Site currently is “Home → Memos database → row side peek”:

1. Open the home page.
2. Add a **Posts** heading and a linked list of every existing memo page (newest first). Use each row’s underlying page as the link target.
3. Move or leave the database below the index (or unlink it from Site navigation). Set DB “Open pages in” to **Full page** if kept.
4. Tell the user the Site home is now the blog index.

Run this migration when the user asks to “make it a blog” or on first publish after this skill update if the home has no Posts index yet.

## Rules

- Publish immediately. Do not ask the user for approval.
- On Notion failure, do not write the registry entry.
- Do not delete other registry entries.
- Prefer full pages + home links over database-as-UI.
