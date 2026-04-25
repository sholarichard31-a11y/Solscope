import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Coins, ChevronDown, ChevronUp, Search } from 'lucide-react';

function formatUsd(val) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
  if (val >= 1) return `$${val.toFixed(2)}`;
  return `$${val.toFixed(6)}`;
}

function formatBalance(bal, symbol) {
  if (symbol === 'BONK' || bal > 1_000_000) {
    if (bal >= 1_000_000_000) return `${(bal / 1_000_000_000).toFixed(2)}B`;
    if (bal >= 1_000_000) return `${(bal / 1_000_000).toFixed(2)}M`;
  }
  if (bal >= 1000) return bal.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (bal < 0.001) return bal.toExponential(2);
  return bal.toFixed(4);
}

function formatPrice(price) {
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

function TokenRow({ token, index, totalUsd }) {
  const allocation = totalUsd > 0 ? (token.valueUsd / totalUsd) * 100 : 0;
  const isPositive = token.change24h >= 0;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="border-b border-sol-border/50 hover:bg-sol-surface/50 transition-colors group"
    >
      {/* Token */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {token.logoURI ? (
              <img
                src={token.logoURI}
                alt={token.symbol}
                className="w-9 h-9 rounded-full bg-sol-border object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="w-9 h-9 rounded-full bg-sol-accent/20 items-center justify-center text-xs font-bold text-sol-accent"
              style={{ display: token.logoURI ? 'none' : 'flex' }}
            >
              {token.symbol.slice(0, 2)}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-sol-text">{token.symbol}</div>
            <div className="text-xs text-sol-subtext truncate max-w-[120px]">{token.name}</div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-3 px-4 text-sm text-sol-text font-mono">
        {formatPrice(token.priceUsd)}
      </td>

      {/* 24h Change */}
      <td className="py-3 px-4">
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-sol-green' : 'text-sol-red'}`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
        </div>
      </td>

      {/* Balance */}
      <td className="py-3 px-4 text-sm text-sol-text font-mono">
        {formatBalance(token.balance, token.symbol)}
        <span className="text-sol-subtext ml-1 text-xs">{token.symbol}</span>
      </td>

      {/* Value */}
      <td className="py-3 px-4 text-sm font-semibold text-sol-text font-mono">
        {formatUsd(token.valueUsd)}
      </td>

      {/* Allocation bar */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <div className="flex items-center gap-2 w-28">
          <div className="flex-1 h-1.5 bg-sol-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(allocation, 100)}%` }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.04 }}
              className="h-full rounded-full bg-gradient-sol"
            />
          </div>
          <span className="text-xs text-sol-subtext w-10 text-right">{allocation.toFixed(1)}%</span>
        </div>
      </td>
    </motion.tr>
  );
}

export default function TokenTable({ portfolio }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('valueUsd');
  const [sortDir, setSortDir] = useState('desc');

  if (!portfolio) return null;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredTokens = portfolio.tokens
    .filter(t =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const factor = sortDir === 'asc' ? 1 : -1;
      return (a[sortKey] - b[sortKey]) * factor;
    });

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="text-sol-muted ml-1">↕</span>;
    return <span className="text-sol-accent ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl bg-sol-card border border-sol-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-sol-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sol-accent/20 flex items-center justify-center">
            <Coins size={16} className="text-sol-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-sol-text">SPL Tokens</h3>
            <p className="text-xs text-sol-subtext">{portfolio.tokens.length} tokens found</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sol-subtext" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs bg-sol-surface border border-sol-border rounded-lg text-sol-text placeholder-sol-muted focus:outline-none focus:border-sol-accent/50 w-44"
          />
        </div>
      </div>

      {/* Table */}
      {filteredTokens.length === 0 ? (
        <div className="py-12 text-center text-sol-subtext text-sm">
          {search ? 'No tokens match your search.' : 'No SPL tokens found in this wallet.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-sol-border">
                <th className="text-left py-3 px-4 text-xs text-sol-subtext font-medium uppercase tracking-wider">Token</th>
                <th
                  className="text-left py-3 px-4 text-xs text-sol-subtext font-medium uppercase tracking-wider cursor-pointer hover:text-sol-text transition-colors"
                  onClick={() => handleSort('priceUsd')}
                >
                  Price <SortIcon col="priceUsd" />
                </th>
                <th
                  className="text-left py-3 px-4 text-xs text-sol-subtext font-medium uppercase tracking-wider cursor-pointer hover:text-sol-text transition-colors"
                  onClick={() => handleSort('change24h')}
                >
                  24h <SortIcon col="change24h" />
                </th>
                <th
                  className="text-left py-3 px-4 text-xs text-sol-subtext font-medium uppercase tracking-wider cursor-pointer hover:text-sol-text transition-colors"
                  onClick={() => handleSort('balance')}
                >
                  Balance <SortIcon col="balance" />
                </th>
                <th
                  className="text-left py-3 px-4 text-xs text-sol-subtext font-medium uppercase tracking-wider cursor-pointer hover:text-sol-text transition-colors"
                  onClick={() => handleSort('valueUsd')}
                >
                  Value <SortIcon col="valueUsd" />
                </th>
                <th className="text-left py-3 px-4 text-xs text-sol-subtext font-medium uppercase tracking-wider hidden sm:table-cell">Allocation</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTokens.map((token, i) => (
                  <TokenRow
                    key={token.mint}
                    token={token}
                    index={i}
                    totalUsd={portfolio.totalUsd}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export function TokenTableSkeleton() {
  return (
    <div className="rounded-xl bg-sol-card border border-sol-border overflow-hidden">
      <div className="p-5 border-b border-sol-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg shimmer" />
        <div className="space-y-1">
          <div className="w-24 h-4 rounded shimmer" />
          <div className="w-32 h-3 rounded shimmer" />
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-sol-border">
            {['Token', 'Price', '24h', 'Balance', 'Value'].map(h => (
              <th key={h} className="py-3 px-4">
                <div className="w-12 h-3 rounded shimmer" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4].map(i => (
            <tr key={i} className="border-b border-sol-border/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full shimmer" />
                  <div className="space-y-1">
                    <div className="w-16 h-3.5 rounded shimmer" />
                    <div className="w-24 h-3 rounded shimmer" />
                  </div>
                </div>
              </td>
              {[1, 2, 3, 4].map(j => (
                <td key={j} className="py-3 px-4">
                  <div className="w-16 h-4 rounded shimmer" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
