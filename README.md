# Meteora Token Memos — Grok Bot Playbook

Track Solana tokens you trade on Meteora DLMM pools, research each new one, and publish a short memo to a free Notion Site. You talk to a small team of Grok Bots; they hand work to each other. The command is `update`.

This repo is a **configuration playbook**, not a hosted app. Copy the bot profiles and skills into a fresh Grok Bot instance, put the scanner on the shared cloud computer, and run.

## What you get

| Piece | Role |
|-------|------|
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
- A free [Notion](https://www.notion.so) workspace
- Node.js 20+ on the Grok Bot cloud computer (usually already available)

## 1. Create the Notion blog (once)

1. In Notion, create a page named **Meteora Token Blog**.
2. On that page, create a **full-page database** (or an inline database) with these properties:

   | Property | Type |
   |----------|------|
   | Title | Title (token name or symbol) |
   | Symbol | Text |
   | Mint | Text |
   | Pool | Text |
   | First seen | Date |
   | Sources | Text or URL |
   | Status | Select — `published`, `thin-info` |

3. Open **Share → Publish** and publish the page as a Notion Site. Subpages and database rows go live automatically when created.
4. Copy the public site URL. You will give it to MeteoraDesk as `NOTION_HOME_URL`.
5. Log into Notion in the Grok Bot computer’s browser (or connect the Notion plugin) so NotionPublisher can create pages.

**Plan B:** if Notion is awkward, publish Markdown files to a public GitHub repo instead. Keep the same registry and memo shape; only NotionPublisher’s steps change.

## 2. Create the four Bots

In Grok Bot:

1. **New → Create new Bot** (four times), using the names below.
2. Open each Bot → **Edit Profile** and paste **name**, **title**, and **description** from the matching file:

| Bot | Profile file |
|-----|----------------|
| MeteoraDesk | [bots/meteora-desk.md](bots/meteora-desk.md) |
| WalletScout | [bots/wallet-scout.md](bots/wallet-scout.md) |
| TokenResearch | [bots/token-research.md](bots/token-research.md) |
| NotionPublisher | [bots/notion-publisher.md](bots/notion-publisher.md) |

3. Create a **group chat** named `Meteora Blog` and add all four Bots.
4. You will issue `update` in that group (or DM MeteoraDesk).

## 3. Install skills

In the MeteoraDesk conversation (or the group), ask it to save these as skills, using the file bodies as the skill text:

| Skill | File |
|-------|------|
| `update-pipeline` | [skills/update-pipeline.md](skills/update-pipeline.md) |
| `scan-meteora-wallet` | [skills/scan-meteora-wallet.md](skills/scan-meteora-wallet.md) |
| `research-token` | [skills/research-token.md](skills/research-token.md) |
| `publish-notion-memo` | [skills/publish-notion-memo.md](skills/publish-notion-memo.md) |

Example message:

> Save four skills from this playbook. Use the exact names and instructions in `skills/update-pipeline.md`, `skills/scan-meteora-wallet.md`, `skills/research-token.md`, and `skills/publish-notion-memo.md`. MeteoraDesk owns `update-pipeline`; hand scan / research / publish to the specialist Bots.

## 4. Put shared state on the cloud computer

All Bots share one computer. Ask MeteoraDesk (or run this yourself on the desktop):

```bash
mkdir -p ~/meteora-blog/scripts
# Copy from this repo (clone, download, or paste):
#   scripts/scan_meteora_positions.mjs → ~/meteora-blog/scripts/
#   templates/researched-tokens.json   → ~/meteora-blog/researched-tokens.json
```

The scanner is plain Node 20+ (uses built-in `fetch`). No `npm install` required.

Then tell MeteoraDesk:

> My Solana watch wallet is `<BASE58_ADDRESS>`.  
> Notion home URL is `<NOTION_SITE_OR_PAGE_URL>`.  
> Write them to `~/meteora-blog/WALLET` and `~/meteora-blog/NOTION_HOME_URL`. Never store a private key.

Shared layout:

```text
~/meteora-blog/
  WALLET
  NOTION_HOME_URL
  researched-tokens.json
  scripts/scan_meteora_positions.mjs
```

Optional env:

- `METEORA_DLMM_API` — default `https://dlmm.datapi.meteora.ag`
- `DAYS_BACK` — closed-position lookback in days (default `365`)

## 5. Run `update`

In the `Meteora Blog` group (or to MeteoraDesk):

```text
update
```

Expected flow:

1. WalletScout runs the scanner and diffs against `researched-tokens.json`.
2. For each **new** non-SOL mint, TokenResearch writes a 3–4 sentence memo.
3. NotionPublisher creates the Notion page + database row **immediately** (no draft approval) and updates the registry.
4. MeteoraDesk replies with token, one-line thesis, and Notion URL for each new post.

If there are no new mints: **No new tokens.**

### Optional daily routine

Ask MeteoraDesk:

> Every day at 09:00 in my timezone, run the `update-pipeline` skill and post the report in this group. Publish without asking. If the scanner or Notion fails, report the failure instead of inventing data.

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
| API errors / timeouts | Retry; confirm `METEORA_DLMM_API` reaches `https://dlmm.datapi.meteora.ag` |
| Empty positions but you know you have pools | Confirm the watch address; raise `DAYS_BACK` (max 365) so closed pools are included |
| Notion page not public | Re-open Share → Publish on the parent page |
| Bot republishes an old token | Check `researched-tokens.json` for that mint; restore from backup if the file was wiped |
| Skill not found | Re-paste the skill body and ask the Bot to save it under the exact name |

## Repo layout

```text
bots/           Bot profile text (paste into Edit Profile)
skills/         Skill instructions for Grok Bot
scripts/        Meteora DLMM wallet scanner
templates/      Empty researched-tokens.json
README.md       This guide
```
