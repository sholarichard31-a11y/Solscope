export const DEMO_WALLETS = [
  {
    id: 'whale',
    label: 'Whale Wallet',
    address: 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ',
    tag: '🐳 Whale',
    description: 'High-value DeFi portfolio',
    totalUsd: 412850.42,
  },
  {
    id: 'trader',
    label: 'Active Trader',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    tag: '⚡ Trader',
    description: 'Active trading account',
    totalUsd: 28740.18,
  },
  {
    id: 'defi',
    label: 'DeFi Farmer',
    address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    tag: '🌾 DeFi',
    description: 'Yield farming portfolio',
    totalUsd: 86320.95,
  },
];

const now = Date.now();
const day = 86400000;

export const MOCK_PORTFOLIOS = {
  GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ: {
    solBalance: 1842.75,
    tokens: [
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        balance: 95000,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        priceUsd: 1.0,
        change24h: 0.01,
      },
      {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'USDT',
        symbol: 'USDT',
        decimals: 6,
        balance: 42000,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
        priceUsd: 1.0,
        change24h: -0.02,
      },
      {
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        name: 'Jupiter',
        symbol: 'JUP',
        decimals: 6,
        balance: 28500,
        logoURI: 'https://static.jup.ag/jup/icon.png',
        priceUsd: 0.82,
        change24h: 4.2,
      },
      {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        decimals: 5,
        balance: 18500000000,
        logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
        priceUsd: 0.0000187,
        change24h: 8.7,
      },
      {
        mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        name: 'Marinade staked SOL',
        symbol: 'mSOL',
        decimals: 9,
        balance: 120.5,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
        priceUsd: 182.4,
        change24h: 2.1,
      },
      {
        mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
        name: 'Render Token',
        symbol: 'RNDR',
        decimals: 8,
        balance: 1240,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png',
        priceUsd: 7.34,
        change24h: -1.8,
      },
    ],
    transactions: generateTransactions(15, 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ'),
  },
  '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': {
    solBalance: 84.32,
    tokens: [
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        balance: 5200,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        priceUsd: 1.0,
        change24h: 0.01,
      },
      {
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        name: 'Jupiter',
        symbol: 'JUP',
        decimals: 6,
        balance: 4200,
        logoURI: 'https://static.jup.ag/jup/icon.png',
        priceUsd: 0.82,
        change24h: 4.2,
      },
      {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        decimals: 5,
        balance: 950000000,
        logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
        priceUsd: 0.0000187,
        change24h: 8.7,
      },
      {
        mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
        name: 'Orca',
        symbol: 'ORCA',
        decimals: 6,
        balance: 820,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
        priceUsd: 3.12,
        change24h: -3.4,
      },
    ],
    transactions: generateTransactions(20, '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
  },
  HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH: {
    solBalance: 320.18,
    tokens: [
      {
        mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        name: 'Marinade staked SOL',
        symbol: 'mSOL',
        decimals: 9,
        balance: 280.4,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
        priceUsd: 182.4,
        change24h: 2.1,
      },
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        balance: 12800,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        priceUsd: 1.0,
        change24h: 0.01,
      },
      {
        mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        name: 'Jupiter',
        symbol: 'JUP',
        decimals: 6,
        balance: 15000,
        logoURI: 'https://static.jup.ag/jup/icon.png',
        priceUsd: 0.82,
        change24h: 4.2,
      },
      {
        mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
        name: 'Render Token',
        symbol: 'RNDR',
        decimals: 8,
        balance: 640,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof/logo.png',
        priceUsd: 7.34,
        change24h: -1.8,
      },
      {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        name: 'Bonk',
        symbol: 'BONK',
        decimals: 5,
        balance: 5200000000,
        logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
        priceUsd: 0.0000187,
        change24h: 8.7,
      },
    ],
    transactions: generateTransactions(12, 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH'),
  },
};

function generateTransactions(count, address) {
  const types = ['swap', 'transfer', 'stake', 'unstake', 'receive', 'send'];
  const tokens = ['SOL', 'USDC', 'JUP', 'BONK', 'mSOL', 'RNDR', 'ORCA'];
  const txs = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    const amount = parseFloat((Math.random() * 1000 + 1).toFixed(4));
    const usdValue = parseFloat((amount * (Math.random() * 50 + 1)).toFixed(2));
    const timestamp = now - Math.floor(Math.random() * 30) * day - Math.floor(Math.random() * day);

    txs.push({
      signature: generateFakeSignature(),
      type,
      token,
      amount,
      usdValue,
      timestamp,
      status: Math.random() > 0.05 ? 'success' : 'failed',
      fee: 0.000005,
    });
  }

  return txs.sort((a, b) => b.timestamp - a.timestamp);
}

function generateFakeSignature() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const SOL_PRICE_MOCK = {
  price: 172.84,
  change24h: 3.21,
  marketCap: 80420000000,
};
