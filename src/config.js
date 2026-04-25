export const LOCAL_RPC = 'https://mainnet.helius-rpc.com/?api-key=ed404a35-53f0-4c5d-850a-ade8504dc4bc';

export const LOCAL_TOKEN_LIST = '/api/token-list';

export const LOCAL_PRICE = (ids) =>
  `/api/jup-price?ids=${encodeURIComponent(ids.join(','))}`;

export const COINGECKO_SOL_PRICE = () =>
  `/api/coingecko/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

export const JUPITER_PRICE_URL = (mints) =>
  `/api/jup-price?ids=${mints.join(',')}`;

export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';