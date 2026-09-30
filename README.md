# Meteora Token Memos — Grok Bot Playbook

Track Solana tokens you trade on Meteora DLMM pools, research each new one, and publish a short memo to a free Notion Site. You talk to a small team of Grok Bots; they hand work to each other. The command is `update`.

This repo is a **configuration playbook**, not a hosted app. Point a fresh Grok Bot at it and let the Bot install as much as it can.

## What you get

| Piece | Role |
|-------|------|
| [SETUP-PROMPT.md](SETUP-PROMPT.md) | **Paste-once** first message for a new Grok Bot |
| [bots/](bots/) | Standing rules for four specialist Bots |
| [skills/](skills/) | Reusable workflows (`update`, scan, research, publish) |
| [scripts/scan_meteora_positions.mjs](scripts/scan_meteora_positions.mjs) | Lists DLMM positions / non-SOL mints for a wallet |
| [templates/researched-tokens.json](templates/researched-tokens.json) | Empty registry so the same token is not researched twice |

```text
You ──update──► MeteoraDesk ──► WalletScout ──► TokenResearch ──► NotionPublisher
                     ▲                                                    │
                     └──────────────── report + Notion URLs ──────────────┘
```

## Prerequisites

- A Grok Bot account (Cursor / xAI Grok Bot app)
- A Solana **watch** address (public key only — never a private key)
- A free [Notion](https://www.notion.so) workspace (or GitHub Pages Plan B)
- Node.js 20+ on the Grok Bot cloud computer (usually already available)
- Network access so the Bot can `git clone` this public repo

## Automated install (preferred)

1. Open Grok Bot and start a chat with a **new / default Bot** (it will create the specialists).
2. Open [SETUP-PROMPT.md](SETUP-PROMPT.md), copy everything **below the horizontal rule**, and paste it as your first message.
3. Let the Bot run. It should:
   - Clone `https://github.com/alexeyismirnov/meteora-blog` to `~/src/meteora-blog`
   - Create **MeteoraDesk**, **WalletScout**, **TokenResearch**, and **NotionPublisher** from `bots/*.md`
   - Create the **Meteora Blog** group and add all four
   - Save the four skills from `skills/*.md`
   - Install the scanner + empty registry under `~/meteora-blog/`
   - Help with Notion (or tell you exactly what to click)
   - Ask once for your watch wallet and Notion URL, then smoke-check the scanner
4. When it says setup is complete, open **Meteora Blog** (or DM MeteoraDesk) and send:

```text
update
```

You only need to intervene for: Notion login / Publish, and providing the public wallet + Notion URL.

### Optional daily routine

After install, ask MeteoraDesk:

> Every day at 09:00 in my timezone, run the `update-pipeline` skill and post the report in this group. Publish without asking. If the scanner or Notion fails, report the failure instead of inventing data.

## What the Bot installs on disk

```text
~/src/meteora-blog/          # git clone of this playbook
~/meteora-blog/
  WALLET                     # public Solana address
  NOTION_HOME_URL
  researched-tokens.json
  scripts/scan_meteora_positions.mjs
```

Optional env:

- `METEORA_DLMM_API` — default `https://dlmm.datapi.meteora.ag`
- `DAYS_BACK` — closed-position lookback in days (default `365`)

## Notion site layout (blog, not DB table)

Public Site should read like a blog:

```text
Home (published Notion Site)
  ├── short intro
  ├── Posts — linked list, newest first → each link opens a full post page
  └── (optional) hidden/low Memos database for your own filtering
```

Do **not** use “open database → click row → side peek” as the main reading path.

If the Bot cannot finish Notion alone:

1. Create a page **Meteora Token Blog** (this is the Site home / index).
2. Add a **Posts** heading; leave room for links NotionPublisher will add.
3. Optional: a Memos database with Title, Symbol, Mint, Pool, First seen, Sources, Status (`published` / `thin-info`) — for bookkeeping only.
4. **Share → Publish** the home page.

**Already live with a DB-only layout?** Pull this repo, ask NotionPublisher to reload `publish-notion-memo` and its profile from `bots/notion-publisher.md`, then say:

> Migrate the Notion Site to a blog index: on the home page, add a Posts list linking to each existing memo as a full page (newest first). Keep the database off the main reading path.

**Plan B:** publish Markdown to a public GitHub repo instead. Keep the same registry and memo shape; only NotionPublisher’s steps change.

## Run `update`

In the `Meteora Blog` group (or to MeteoraDesk):

```text
update
```

Expected flow:

1. WalletScout runs the scanner and diffs against `researched-tokens.json`.
2. For each **new** non-SOL mint, TokenResearch writes a 3–4 sentence memo.
3. NotionPublisher creates a **full blog post page**, adds it to the home **Posts** index, and updates the registry (no draft approval).
4. MeteoraDesk replies with token, one-line thesis, and Notion **post** URL for each new entry.

If there are no new mints: **No new tokens.**

## Security and approval rules

- **Read-only wallet.** Public address only. No signing, no swaps, no private keys.
- **Publish is allowed without asking.** New memos go live as soon as NotionPublisher finishes.
- Escalate to you only when: RPC/scanner fails after retry, Notion login/plugin is broken, or you explicitly ask to change the wallet or Notion home.
- Do not treat Bot memory as the source of truth for “already researched” — the registry file is authoritative.

## Manual scanner check

On the cloud computer:

```bash
cd ~/meteora-blog/scripts
node scan_meteora_positions.mjs "$(cat ~/meteora-blog/WALLET)"
```

JSON on stdout lists pools and non-SOL mints. Empty `tokens` means no open DLMM positions were found for that address.

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| Clone fails | Confirm the computer can reach GitHub; retry `git clone` / `git pull` |
| Bots / group not created | Re-paste [SETUP-PROMPT.md](SETUP-PROMPT.md) and tell the Bot to resume from step 2 |
| API errors / timeouts | Retry; confirm `METEORA_DLMM_API` reaches `https://dlmm.datapi.meteora.ag` |
| Empty positions but you know you have pools | Confirm the watch address; raise `DAYS_BACK` (max 365) so closed pools are included |
| Notion page not public | Re-open Share → Publish on the parent page |
| Bot republishes an old token | Check `researched-tokens.json` for that mint; restore from backup if the file was wiped |
| Skill not found | Ask MeteoraDesk to re-save skills from `~/src/meteora-blog/skills/` |

## Manual install (fallback)

Only if the Bot cannot drive create-Bot / group UI:

1. Create the four Bots and paste profiles from [bots/](bots/).
2. Create group `Meteora Blog` and add them.
3. Ask MeteoraDesk to save skills from [skills/](skills/).
4. Clone this repo and copy scripts/registry as in [SETUP-PROMPT.md](SETUP-PROMPT.md) steps 1 and 5.
5. Write `WALLET` and `NOTION_HOME_URL`, then send `update`.

## Repo layout

```text
SETUP-PROMPT.md   Paste-once automated install for a fresh Grok Bot
bots/             Bot profile text
skills/           Skill instructions
scripts/          Meteora DLMM wallet scanner
templates/        Empty researched-tokens.json
README.md         This guide
```
