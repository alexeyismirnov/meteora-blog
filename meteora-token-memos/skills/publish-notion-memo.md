# Skill: publish-notion-memo

**Name:** `publish-notion-memo`  
**Owner:** NotionPublisher

## Goal

Create a live Notion database page for a researched token and update the local registry. No draft approval.

## Inputs

- Research package from `research-token` (`mint`, `symbol`, `name`, `poolAddress`, `memo`, `sources`, `infoLevel`, `oneLineThesis`)
- Notion home: `~/meteora-blog/NOTION_HOME_URL`
- Registry path: `~/meteora-blog/researched-tokens.json`

## Steps

1. If the registry already contains this `mint`, stop and return `{ "ok": false, "error": "already_researched", "mint": "..." }` unless MeteoraDesk explicitly requested a re-publish.
2. Open the Notion home / database from `NOTION_HOME_URL`.
3. Create a new row/page:

   | Field | Value |
   |-------|--------|
   | Title | `name` or `symbol` or short mint |
   | Symbol | `symbol` |
   | Mint | `mint` |
   | Pool | `poolAddress` |
   | First seen | today’s date (ISO) |
   | Sources | joined source URLs |
   | Status | `published` if `infoLevel` is `solid`, else `thin-info` |

4. Page body:
   - Heading with symbol/name
   - Memo paragraphs (the 3–4 sentences)
   - Sources list

5. Confirm the page is visible under the published Notion Site (parent already published).
6. Update `researched-tokens.json`:
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

7. Return:

```json
{
  "ok": true,
  "mint": "",
  "notionPageId": "",
  "notionUrl": "",
  "status": "published"
}
```

## Rules

- Publish immediately. Do not ask the user for approval.
- On Notion failure, do not write the registry entry.
- Do not delete other registry entries.
