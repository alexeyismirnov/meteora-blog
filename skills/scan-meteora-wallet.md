# Skill: scan-meteora-wallet

**Name:** `scan-meteora-wallet`  
**Owner:** WalletScout

## Goal

List unique non-SOL token mints from the user’s open Meteora DLMM positions and return which of those are not yet in `researched-tokens.json`.

## Inputs

- Wallet: contents of `~/meteora-blog/WALLET`
- Registry: `~/meteora-blog/researched-tokens.json`
- Optional env: `METEORA_DLMM_API`, `DAYS_BACK` (closed lookback, default 365)

## Steps

1. Read the wallet address. Validate it looks like a base58 pubkey. If empty, fail clearly.
2. Load the registry JSON. If invalid JSON, fail clearly (do not overwrite).
3. Run:

   ```bash
   cd ~/meteora-blog/scripts && node scan_meteora_positions.mjs "$(cat ~/meteora-blog/WALLET)"
   ```

4. If the command fails (non-zero exit or empty/invalid JSON):
   - Retry once against the default Meteora Data API.
   - If still failing, return `{ "ok": false, "error": "..." }` — do not invent data.

5. From successful output, take `tokens` (or equivalent). Build `scannedMints`.
6. `newTokens` = scanned entries whose `mint` is not a key / entry in the registry.
7. Return:

```json
{
  "ok": true,
  "wallet": "<address>",
  "scannedCount": 0,
  "alreadyResearched": [],
  "newTokens": [
    {
      "mint": "",
      "symbol": "",
      "name": "",
      "poolAddress": "",
      "pairLabel": ""
    }
  ]
}
```

## Rules

- Read-only on-chain access.
- Do not update the registry.
- Do not drop non-SOL quote tokens unless the scanner already filtered them; trust the script’s SOL filter.
