#!/usr/bin/env node
/**
 * List Meteora DLMM tokens for a Solana wallet via the public Data API.
 * Includes open positions and closed positions (last N days).
 *
 * Usage:
 *   node scan_meteora_positions.mjs <WALLET_BASE58>
 *
 * Env:
 *   METEORA_DLMM_API   (default: https://dlmm.datapi.meteora.ag)
 *   DAYS_BACK          closed-position lookback in days (default: 365, max: 365)
 *
 * Output: JSON on stdout
 */

const WSOL = "So11111111111111111111111111111111111111112";
const NATIVE_SOL = "11111111111111111111111111111111";
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const API_BASE = (process.env.METEORA_DLMM_API || "https://dlmm.datapi.meteora.ag").replace(
  /\/$/,
  "",
);

function isSolMint(mint) {
  return mint === WSOL || mint === NATIVE_SOL;
}

function parseDaysBack() {
  const raw = Number(process.env.DAYS_BACK ?? 365);
  if (!Number.isFinite(raw)) return 365;
  return Math.min(365, Math.max(1, Math.floor(raw)));
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { accept: "application/json" },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} for ${url}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

async function fetchAllPages(buildUrl) {
  const pools = [];
  let page = 1;
  let guard = 0;
  while (guard < 100) {
    guard += 1;
    const data = await fetchJson(buildUrl(page));
    const batch = Array.isArray(data?.pools) ? data.pools : [];
    pools.push(...batch);
    if (!data?.hasNext || batch.length === 0) {
      return { pools, lastPage: data };
    }
    page += 1;
  }
  return { pools, lastPage: null };
}

function addToken(tokenByMint, { mint, symbol, name, poolAddress, pairLabel, source }) {
  if (!mint || isSolMint(mint)) return;
  const existing = tokenByMint.get(mint);
  if (!existing) {
    tokenByMint.set(mint, {
      mint,
      symbol: symbol || "",
      name: name || "",
      poolAddress: poolAddress || "",
      pairLabel: pairLabel || "",
      sources: source ? [source] : [],
    });
    return;
  }
  if (!existing.symbol && symbol) existing.symbol = symbol;
  if (!existing.name && name) existing.name = name;
  if (!existing.poolAddress && poolAddress) existing.poolAddress = poolAddress;
  if (!existing.pairLabel && pairLabel) existing.pairLabel = pairLabel;
  if (source && !existing.sources.includes(source)) existing.sources.push(source);
}

function ingestPool(tokenByMint, poolRows, pool, source) {
  const poolAddress = pool.poolAddress || pool.pool_address || "";
  const tokenXMint = pool.tokenXMint || pool.token_x_mint || "";
  const tokenYMint = pool.tokenYMint || pool.token_y_mint || "";
  const tokenXSymbol = pool.tokenX || pool.token_x?.symbol || "";
  const tokenYSymbol = pool.tokenY || pool.token_y?.symbol || "";
  const tokenXName =
    typeof pool.token_x === "object" ? pool.token_x?.name || "" : "";
  const tokenYName =
    typeof pool.token_y === "object" ? pool.token_y?.name || "" : "";
  const pairLabel =
    [tokenXSymbol || tokenXMint.slice(0, 4), tokenYSymbol || tokenYMint.slice(0, 4)]
      .filter(Boolean)
      .join("/") || pool.name || "";

  poolRows.push({
    poolAddress,
    tokenXMint,
    tokenYMint,
    tokenXSymbol,
    tokenYSymbol,
    pairLabel,
    source,
    openPositionCount: pool.openPositionCount ?? null,
    lastClosedAt: pool.lastClosedAt ?? null,
  });

  addToken(tokenByMint, {
    mint: tokenXMint,
    symbol: typeof tokenXSymbol === "string" ? tokenXSymbol : "",
    name: tokenXName,
    poolAddress,
    pairLabel,
    source,
  });
  addToken(tokenByMint, {
    mint: tokenYMint,
    symbol: typeof tokenYSymbol === "string" ? tokenYSymbol : "",
    name: tokenYName,
    poolAddress,
    pairLabel,
    source,
  });
}

async function main() {
  const wallet = process.argv[2]?.trim();
  if (!wallet) {
    console.error("Usage: node scan_meteora_positions.mjs <WALLET_BASE58>");
    process.exit(2);
  }
  if (!BASE58_RE.test(wallet)) {
    console.log(JSON.stringify({ ok: false, error: "invalid_wallet", wallet }));
    process.exit(2);
  }

  const daysBack = parseDaysBack();
  const tokenByMint = new Map();
  const pools = [];

  try {
    const open = await fetchAllPages(
      (page) =>
        `${API_BASE}/portfolio/open?user=${encodeURIComponent(wallet)}&page=${page}&page_size=50`,
    );
    for (const pool of open.pools) ingestPool(tokenByMint, pools, pool, "open");

    const closed = await fetchAllPages(
      (page) =>
        `${API_BASE}/portfolio?user=${encodeURIComponent(wallet)}&page=${page}&page_size=50&days_back=${daysBack}`,
    );
    for (const pool of closed.pools) ingestPool(tokenByMint, pools, pool, "closed");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(
      JSON.stringify({
        ok: false,
        error: "scan_failed",
        message,
        status: err?.status ?? null,
        wallet,
        api: API_BASE,
      }),
    );
    process.exit(1);
  }

  const result = {
    ok: true,
    wallet,
    api: API_BASE,
    daysBack,
    scannedAt: new Date().toISOString(),
    poolCount: pools.length,
    pools,
    tokens: [...tokenByMint.values()],
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.log(JSON.stringify({ ok: false, error: "unhandled", message }));
  process.exit(1);
});
