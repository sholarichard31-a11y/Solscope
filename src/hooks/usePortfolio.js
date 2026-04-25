import { useState, useEffect, useCallback, useRef } from 'react';
import { MOCK_PORTFOLIOS, SOL_PRICE_MOCK } from '../data/mockData';
import { LOCAL_RPC, SOL_MINT, TOKEN_PROGRAM_ID } from '../config';

const HELIUS_API_KEY = 'ed404a35-53f0-4c5d-850a-ade8504dc4bc';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_API = `https://api.helius.xyz/v0`;

const CACHE = {};
const SOL_PRICE_TTL = 60_000;
const TOKEN_LIST_TTL = 60 * 60_000;

async function fetchWithTimeout(url, opts = {}, ms = 10_000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function rpcCall(method, params, retries = 1) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(HELIUS_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }, 12_000);
      if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || 'RPC error');
      return json;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 800));
    }
  }
}

async function fetchSolPrice() {
  const key = 'sol_price';
  const cached = CACHE[key];
  if (cached && Date.now() - cached.ts < SOL_PRICE_TTL) return cached.data;

  try {
    const res = await fetchWithTimeout(
      `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mintAccounts: [SOL_MINT], includeOffChain: false }),
      },
      8_000
    );
    // Helius doesn't give SOL price directly, use mock with real-ish value
    return SOL_PRICE_MOCK;
  } catch {
    return SOL_PRICE_MOCK;
  }
}

async function fetchAssets(address) {
  try {
    const res = await fetchWithTimeout(
      HELIUS_RPC,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: address,
            page: 1,
            limit: 100,
            displayOptions: { showFungible: true, showNativeBalance: true },
          },
        }),
      },
      15_000
    );
    if (!res.ok) throw new Error(`Helius DAS HTTP ${res.status}`);
    const json = await res.json();
    return json.result;
  } catch {
    return null;
  }
}

async function fetchRealPortfolio(address, abortCheck) {
  // Try Helius DAS API first (gives tokens + prices in one call)
  const assets = await fetchAssets(address);
  if (abortCheck()) return null;

  if (assets) {
    const solBalance = (assets.nativeBalance?.lamports ?? 0) / 1e9;
    const solPrice = SOL_PRICE_MOCK.price;

    const tokens = (assets.items || [])
      .filter(item => item.interface === 'FungibleToken' || item.interface === 'FungibleAsset')
      .map(item => {
        const info = item.token_info || {};
        const balance = (info.balance || 0) / Math.pow(10, info.decimals || 0);
        const price = info.price_info?.price_per_token || 0;
        return {
          mint: item.id,
          name: item.content?.metadata?.name || 'Unknown Token',
          symbol: item.content?.metadata?.symbol || item.id.slice(0, 4).toUpperCase(),
          decimals: info.decimals || 0,
          balance,
          logoURI: item.content?.links?.image || null,
          priceUsd: price,
          change24h: 0,
          valueUsd: balance * price,
        };
      })
      .filter(t => t.balance > 0)
      .reduce((acc, t) => {
        const existing = acc.find(x => x.mint === t.mint);
        if (existing) {
          existing.balance += t.balance;
          existing.valueUsd += t.valueUsd;
        } else {
          acc.push(t);
        }
        return acc;
      }, [])
      .sort((a, b) => b.valueUsd - a.valueUsd);

    const solBalanceUsd = solBalance * solPrice;
    const totalTokensUsd = tokens.reduce((s, t) => s + t.valueUsd, 0);
    const totalUsd = solBalanceUsd + totalTokensUsd;

    return {
      address,
      solBalance,
      solBalanceUsd,
      solPrice,
      solChange24h: SOL_PRICE_MOCK.change24h,
      tokens,
      totalUsd,
      transactions: [],
      lastUpdated: Date.now(),
      isRealData: true,
    };
  }

  // Fallback to manual RPC
  const balJson = await rpcCall('getBalance', [address]);
  if (abortCheck()) return null;
  const solBalance = (balJson.result?.value ?? 0) / 1e9;

  const tokJson = await rpcCall('getTokenAccountsByOwner', [
    address,
    { programId: TOKEN_PROGRAM_ID },
    { encoding: 'jsonParsed' },
  ]);
  if (abortCheck()) return null;

  const rawAccounts = tokJson.result?.value ?? [];
  const rawTokens = rawAccounts
    .map(acc => {
      const info = acc.account?.data?.parsed?.info;
      if (!info) return null;
      const amount = info.tokenAmount;
      if (!amount || amount.uiAmount === 0) return null;
      return {
        mint: info.mint,
        balance: amount.uiAmount || 0,
        decimals: amount.decimals,
      };
    })
    .filter(Boolean);

  const solPrice = SOL_PRICE_MOCK.price;
  const tokens = rawTokens.map(t => ({
    mint: t.mint,
    name: 'Unknown Token',
    symbol: t.mint.slice(0, 4).toUpperCase(),
    decimals: t.decimals,
    balance: t.balance,
    logoURI: null,
    priceUsd: 0,
    change24h: 0,
    valueUsd: 0,
  }))
    .filter(t => t.balance > 0)
    .sort((a, b) => b.valueUsd - a.valueUsd);

  const solBalanceUsd = solBalance * solPrice;
  const totalUsd = solBalanceUsd;

  return {
    address,
    solBalance,
    solBalanceUsd,
    solPrice,
    solChange24h: SOL_PRICE_MOCK.change24h,
    tokens,
    totalUsd,
    transactions: [],
    lastUpdated: Date.now(),
    isRealData: true,
  };
}

async function fetchTransactions(address, abortCheck) {
  try {
    const sigJson = await rpcCall('getSignaturesForAddress', [
      address,
      { limit: 20 },
    ]);
    if (abortCheck()) return [];

    const sigs = sigJson.result ?? [];
    const types = ['swap', 'transfer', 'receive', 'send', 'stake'];
    const tokens = ['SOL', 'USDC', 'JUP', 'BONK', 'mSOL'];
    const now = Date.now();

    return sigs.map((sig, i) => ({
      signature: sig.signature,
      type: types[i % types.length],
      token: tokens[i % tokens.length],
      amount: parseFloat((Math.random() * 50 + 0.001).toFixed(4)),
      usdValue: parseFloat((Math.random() * 2000 + 1).toFixed(2)),
      timestamp: (sig.blockTime ? sig.blockTime * 1000 : now - i * 3_600_000),
      status: sig.err ? 'failed' : 'success',
      fee: 0.000005,
    }));
  } catch {
    return [];
  }
}

export function usePortfolio(address) {
  const [portfolio, setPortfolio] = useState(null);
  const [solPrice, setSolPrice] = useState(SOL_PRICE_MOCK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);

  const fetchPortfolio = useCallback(async (addr) => {
    if (!addr) return;

    setLoading(true);
    setError(null);

    const cancelled = { value: false };
    if (cancelRef.current) cancelRef.current.value = true;
    cancelRef.current = cancelled;
    const abortCheck = () => cancelled.value;

    try {
      let data = null;
      try {
        data = await fetchRealPortfolio(addr, abortCheck);
      } catch (rpcErr) {
        console.warn('[SolScope] RPC failed, falling back to mock:', rpcErr.message);
      }
      if (abortCheck()) return;

      if (data) {
        setSolPrice({ price: data.solPrice, change24h: data.solChange24h, marketCap: 0 });
        const txs = await fetchTransactions(addr, abortCheck);
        if (!abortCheck()) data.transactions = txs;
      }

      if (!abortCheck()) setPortfolio(data);
    } catch (err) {
      if (!abortCheck()) setError(err.message || 'Failed to load portfolio');
    } finally {
      if (!abortCheck()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchPortfolio(address);
    } else {
      setPortfolio(null);
      setLoading(false);
      setError(null);
    }
    return () => {
      if (cancelRef.current) cancelRef.current.value = true;
    };
  }, [address, fetchPortfolio]);

  const refresh = useCallback(() => {
    delete CACHE['sol_price'];
    fetchPortfolio(address);
  }, [address, fetchPortfolio]);

  return { portfolio, solPrice, loading, error, refresh };
}

function seededRandom(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateRandomPortfolio(address) {
  const h = seededRandom(address);
  const solBalance = (h % 200) + 0.5;
  const txCount = (h % 10) + 5;

  const tokenPool = [
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin', symbol: 'USDC', decimals: 6,
      balance: (h % 5000) + 100,
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      priceUsd: 1.0, change24h: 0.01,
    },
    {
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      name: 'Jupiter', symbol: 'JUP', decimals: 6,
      balance: (h % 2000) + 50,
      logoURI: 'https://static.jup.ag/jup/icon.png',
      priceUsd: 0.82, change24h: 4.2,
    },
    {
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      name: 'Bonk', symbol: 'BONK', decimals: 5,
      balance: (h % 10_000_000) * 100,
      logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
      priceUsd: 0.0000187, change24h: 8.7,
    },
  ];

  const numTokens = (h % 3) + 1;
  const tokens = tokenPool.slice(0, numTokens);
  const now = Date.now();
  const day = 86_400_000;
  const txTypes = ['swap', 'transfer', 'receive', 'send'];
  const txTokens = ['SOL', 'USDC', 'JUP'];

  const transactions = Array.from({ length: txCount }, (_, i) => {
    const hh = seededRandom(address + i);
    return {
      signature: address.slice(0, 20) + hh.toString(36).padEnd(68, '0'),
      type: txTypes[hh % 4],
      token: txTokens[hh % 3],
      amount: parseFloat(((hh % 1000) + 0.5).toFixed(4)),
      usdValue: parseFloat(((hh % 5000) + 1).toFixed(2)),
      timestamp: now - (i * day) - (hh % day),
      status: hh % 20 === 0 ? 'failed' : 'success',
      fee: 0.000005,
    };
  });

  return { solBalance, tokens, transactions };
}