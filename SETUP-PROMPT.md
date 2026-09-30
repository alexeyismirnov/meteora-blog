# Paste this to a new Grok Bot

Copy everything below the line into a **fresh** Grok Bot chat (any default Bot is fine — it will create the specialists). Replace nothing unless your clone path must differ.

---

You are installing the **Meteora Token Memos** playbook from GitHub onto this Grok Bot account and shared computer. Do as much as you can yourself. Only ask me when a step needs a secret, a Notion login, or a choice only I can make.

## Repo

```text
https://github.com/alexeyismirnov/meteora-blog
```

Working install path on this computer:

```text
~/meteora-blog
```

Playbook clone (source of profiles, skills, scripts):

```text
~/src/meteora-blog
```

## Do this in order. Stop and report if a step fails.

### 1. Clone the playbook

```bash
mkdir -p ~/src
if [ -d ~/src/meteora-blog/.git ]; then
  git -C ~/src/meteora-blog pull --ff-only origin main
else
  git clone https://github.com/alexeyismirnov/meteora-blog.git ~/src/meteora-blog
fi
ls ~/src/meteora-blog
```

Read `~/src/meteora-blog/README.md` and every file under `bots/` and `skills/` before continuing.

### 2. Create the four specialist Bots

Using Grok Bot’s create-Bot UI (or equivalent agent tools), create these Bots if they do not already exist. For each one, set **name**, **title**, and **description** from the matching file — use the Description section as the Bot’s standing instructions:

| Bot | File |
|-----|------|
| MeteoraDesk | `bots/meteora-desk.md` |
| WalletScout | `bots/wallet-scout.md` |
| TokenResearch | `bots/token-research.md` |
| NotionPublisher | `bots/notion-publisher.md` |

Do **not** ask me to paste profiles. Read the files and apply them.

### 3. Create the group chat

Create a group chat named **`Meteora Blog`** and add all four Bots: MeteoraDesk, WalletScout, TokenResearch, NotionPublisher.

Prefer that group for pipeline handoffs so I can see the chain.

### 4. Install skills

Save these skills from the file bodies (exact skill names):

| Skill name | File | Primary owner |
|------------|------|----------------|
| `update-pipeline` | `skills/update-pipeline.md` | MeteoraDesk |
| `scan-meteora-wallet` | `skills/scan-meteora-wallet.md` | WalletScout |
| `research-token` | `skills/research-token.md` | TokenResearch |
| `publish-notion-memo` | `skills/publish-notion-memo.md` | NotionPublisher |

If your product loads skills from disk, also keep them available from `~/src/meteora-blog/skills/`. Prefer the saved named skills above for triggers.

### 5. Lay out shared state on the computer

```bash
mkdir -p ~/meteora-blog/scripts
cp ~/src/meteora-blog/scripts/scan_meteora_positions.mjs ~/meteora-blog/scripts/
if [ ! -f ~/meteora-blog/researched-tokens.json ]; then
  cp ~/src/meteora-blog/templates/researched-tokens.json ~/meteora-blog/researched-tokens.json
fi
```

Do **not** overwrite an existing `researched-tokens.json`, `WALLET`, or `NOTION_HOME_URL`.

Expected layout:

```text
~/meteora-blog/
  WALLET                 # public Solana address only — you will write this after I reply
  NOTION_HOME_URL        # Notion Site / parent page URL — same
  researched-tokens.json
  scripts/scan_meteora_positions.mjs
```

The scanner is plain Node 20+ (`fetch` built-in). No `npm install` required.

### 6. Notion blog (guide me; automate what you can)

Public layout must be a **blog**, not a database table UI:

```text
Home (Meteora Token Blog)  ← this is NOTION_HOME_URL / Site home
  ├── short intro
  ├── Posts — linked list of full post pages (newest first)
  └── optional Memos DB (bookkeeping only; not the main Site entry)
```

If Notion is already connected in the browser / plugin, help create (or verify):

1. A page **Meteora Token Blog** as the Site **home / index**.
2. A **Posts** heading on that page (NotionPublisher will add page links under it).
3. Optional database (Title, Symbol, Mint, Pool, First seen, Sources, Status `published` / `thin-info`) — do **not** make the DB the public homepage.
4. **Share → Publish** on the home page so child post pages go live.

Copy the **home page / Site URL** (index), not a nested database URL.

If you cannot complete Notion without me, tell me exactly what to click, then wait for the URL.

**Plan B:** if I say Notion is awkward, switch NotionPublisher to publish Markdown into a public GitHub repo instead; keep the same registry and memo shape.

### 7. Ask me once for runtime config

Ask for:

1. Solana **watch** address (public key only — never a private key)
2. Notion home / site URL (unless you already obtained it in step 6)

Write them:

```bash
# after I reply — example only
printf '%s\n' '<BASE58_ADDRESS>' > ~/meteora-blog/WALLET
printf '%s\n' '<NOTION_URL>' > ~/meteora-blog/NOTION_HOME_URL
```

Never store a private key. Never print secrets into chat logs beyond confirming the public address and Notion URL I gave you.

### 8. Smoke-check the scanner

```bash
cd ~/meteora-blog/scripts
node scan_meteora_positions.mjs "$(cat ~/meteora-blog/WALLET)"
```

Report: success / empty `tokens` / error. Do not invent positions.

### 9. Hand off and confirm

Reply with a short install report:

- Bots created (names)
- Group chat name
- Skills saved
- Paths under `~/meteora-blog/`
- Scanner smoke-check result
- Whether Notion is ready

Then tell me:

> Setup complete. In **Meteora Blog** (or DM MeteoraDesk), send `update` to run the pipeline. Optional: ask MeteoraDesk to schedule `update-pipeline` daily.

After setup, **MeteoraDesk** owns day-to-day talk with me. Specialists stay in the group for handoffs.
