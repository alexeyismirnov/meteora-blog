# Skill: research-token

**Name:** `research-token`  
**Owner:** TokenResearch

## Goal

Produce a 3–4 sentence memo and a one-line thesis for a Solana token mint, suitable for immediate Notion publish.

## Inputs

- `mint` (required)
- `symbol`, `name`, `poolAddress`, `pairLabel` (optional, from WalletScout)

## Steps

1. Look up the mint on public market and explorer sites (DexScreener, Birdeye, Solscan or Solana Explorer). Note liquidity, pair age, and any linked socials or website.
2. If a Meteora pool address is provided, open the Meteora DLMM pool page for pair context (TOKEN/SOL, fee tier if visible).
3. Search for creator / deployer / project claims carefully. Prefer verifiable links. If unknown, say the creators are not clearly identified.
4. Note 1–2 similar tokens or comps only when the comparison is grounded (same niche, meme theme, or obvious fork). Otherwise skip comps.
5. Write **exactly 3–4 sentences** covering idea, creators/context, comps or positioning, and growth/risk angle. For thin data, mark honestly and lean on on-chain facts.
6. Return:

```json
{
  "mint": "",
  "symbol": "",
  "name": "",
  "poolAddress": "",
  "memo": "",
  "oneLineThesis": "",
  "sources": ["https://..."],
  "infoLevel": "solid"
}
```

`infoLevel` is `solid` when there is a clear project narrative, or `thin` when the memo is mostly on-chain / market inference.

## Rules

- No fabricated team names, audits, or partnerships.
- No “guaranteed” returns or investment advice.
- Keep the memo brief; the Notion page is a memo, not a research report.
