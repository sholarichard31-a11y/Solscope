import express from 'express';

const app = express();
app.use(express.json({ limit: '1mb' }));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── RPC endpoints to try in order ───────────────────────────────────────────
const RPC_ENDPOINTS = [
  'https://rpc.ankr.com/solana',
  'https://api.mainnet-beta.solana.com',
];

// ─── Solana RPC proxy ─────────────────────────────────────────────────────────
app.post('/api/rpc', async (req, res) => {
  const body = JSON.stringify(req.body);
  for (const endpoint of RPC_ENDPOINTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[RPC] ${endpoint} failed:`, err.message);
    }
  }
  res.status(502).json({ error: 'All RPC endpoints failed' });
});

// ─── Token list cache ─────────────────────────────────────────────────────────
let tokenListCache = null;
let tokenListCacheTs = 0;
const TOKEN_LIST_TTL = 60 * 60 * 1000;

const TOKEN_LIST_SOURCES = [
  'https://token.jup.ag/strict',
  'https://tokens.jup.ag/tokens?tags=verified',
];

const FALLBACK_TOKENS = [
  { address: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', decimals: 9, logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
  { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
  { address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', symbol: 'JUP', name: 'Jupiter', decimals: 6, logoURI: 'https://static.jup.ag/jup/icon.png' },
  { address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', symbol: 'mSOL', name: 'Marinade staked SOL', decimals: 9 },
  { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', decimals: 5 },
  { address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', symbol: 'ETH', name: 'Ether (Wormhole)', decimals: 8 },
  { address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol: 'RAY', name: 'Raydium', decimals: 6 },
  { address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', symbol: 'ORCA', name: 'Orca', decimals: 6 },
];

app.get('/api/token-list', async (req, res) => {
  const now = Date.now();
  if (tokenListCache && now - tokenListCacheTs < TOKEN_LIST_TTL) {
    return res.json(tokenListCache);
  }

  for (const url of TOKEN_LIST_SOURCES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) {
        const data = await response.json();
        tokenListCache = Array.isArray(data) ? data : [];
        tokenListCacheTs = now;
        return res.json(tokenListCache);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[TokenList] ${url} failed:`, err.message);
    }
  }

  // Return cached or fallback
  if (tokenListCache) return res.json(tokenListCache);
  res.json(FALLBACK_TOKENS);
});

// ─── Jupiter price proxy (v4) ─────────────────────────────────────────────────
const priceCache = {};
const PRICE_TTL = 30_000;

app.get('/api/price', async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.json({ data: {} });

  const mints = ids.split(',').filter(Boolean);
  const now = Date.now();
  const needed = mints.filter(m => !priceCache[m] || now - priceCache[m].ts > PRICE_TTL);
  const result = {};

  for (const m of mints) {
    if (priceCache[m] && now - priceCache[m].ts <= PRICE_TTL) {
      result[m] = priceCache[m].data;
    }
  }

  if (needed.length > 0) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const url = `https://price.jup.ag/v4/price?ids=${needed.join(',')}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          for (const [mint, info] of Object.entries(json.data)) {
            priceCache[mint] = { ts: now, data: info };
            result[mint] = info;
          }
        }
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn('[Price] Jupiter v4 failed:', err.message);
    }
  }

  res.json({ data: result });
});

// ─── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`[SolScope] backend :${PORT}`));
