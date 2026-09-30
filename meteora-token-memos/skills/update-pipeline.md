# Skill: update-pipeline

**Name:** `update-pipeline`  
**Owner:** MeteoraDesk  
**Trigger:** User message `update` (or “run update”, “check for new pools”)

## Goal

Find new Meteora DLMM tokens for the watch wallet that are not yet in the registry, research each one, publish a Notion memo immediately, and report back.

## Steps

1. **Preconditions**
   - Ensure `~/meteora-blog/WALLET` and `~/meteora-blog/NOTION_HOME_URL` exist. If missing, ask the user once, write the files, continue.
   - Ensure `~/meteora-blog/researched-tokens.json` exists (copy from the playbook template if needed).

2. **Scan**
   - @ WalletScout: run skill `scan-meteora-wallet`.
   - Wait for structured result with `newTokens`.

3. **Empty path**
   - If `newTokens` is empty, reply to the user: **No new tokens.** Stop.

4. **Research each new mint**
   - For each item in `newTokens`, @ TokenResearch: run skill `research-token` with mint, optional symbol/name, poolAddress.
   - Collect memo packages. On research failure for one mint, note it and continue with the others.

5. **Publish each memo**
   - For each successful research package, @ NotionPublisher: run skill `publish-notion-memo`.
   - Publish live immediately — no user approval.
   - On publish failure, report that mint as failed; do not mark it researched.

6. **User report**
   - Summarize each success: `SYMBOL` — oneLineThesis — Notion URL.
   - List failures separately with the error reason.

## Approval boundary

- Publishing is allowed without asking.
- Escalate only for hard failures (scanner/Notion broken) or missing WALLET / NOTION_HOME_URL after asking once.

## Failure rules

- Do not invent positions, memos, or Notion URLs.
- Registry updates happen only after a successful publish (NotionPublisher).
