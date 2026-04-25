import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ExternalLink, Gem, CircleDollarSign, BarChart2, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard, { StatCardSkeleton } from '../components/StatCard';
import PortfolioChart, { PortfolioChartSkeleton } from '../components/PortfolioChart';
import AllocationChart, { AllocationChartSkeleton } from '../components/AllocationChart';
import TokenTable, { TokenTableSkeleton } from '../components/TokenTable';
import TransactionHistory, { TransactionHistorySkeleton } from '../components/TransactionHistory';
import { useWallet } from '../context/WalletContext';
import { usePortfolio } from '../hooks/usePortfolio';

function formatUsd(val) {
  if (!val && val !== 0) return '$—';
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
}

function formatSol(val) {
  if (!val && val !== 0) return '—';
  return `${val.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
}

export default function DashboardPage() {
  const { connectedWallet } = useWallet();
  const { portfolio, loading, error, refresh } = usePortfolio(connectedWallet?.address);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="min-h-screen bg-sol-bg">
      <Navbar onRefresh={handleRefresh} refreshing={refreshing || loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-sol-red/10 border border-sol-red/30 text-sm text-sol-red"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="ml-auto flex items-center gap-1.5 text-xs underline hover:no-underline"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </motion.div>
        )}

        {/* Wallet info bar */}
        {connectedWallet && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-sol-subtext"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-sol-green animate-pulse" />
            <span>Viewing:</span>
            <span className="font-mono text-sol-text">{connectedWallet.address}</span>
            <a
              href={`https://solscan.io/account/${connectedWallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sol-accent hover:text-sol-accent/80"
            >
              <ExternalLink size={11} />
            </a>
            {portfolio && (
              <span className="ml-auto text-sol-muted">
                Updated {new Date(portfolio.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          ) : portfolio ? (
            <>
              <StatCard
                icon={<Gem />}
                label="Total Value"
                value={formatUsd(portfolio.totalUsd)}
                change={portfolio.solChange24h}
                changeLabel={`${portfolio.tokens.length + 1} assets`}
                accent="#9945FF"
                delay={0}
              />
              <StatCard
                icon={<CircleDollarSign />}
                label="SOL Balance"
                value={formatSol(portfolio.solBalance)}
                subValue={formatUsd(portfolio.solBalanceUsd)}
                change={portfolio.solChange24h}
                accent="#14F195"
                delay={0.05}
              />
              <StatCard
                icon={<BarChart2 />}
                label="Token Value"
                value={formatUsd(portfolio.tokens.reduce((s, t) => s + t.valueUsd, 0))}
                subValue={`${portfolio.tokens.length} SPL tokens`}
                accent="#F0C040"
                delay={0.1}
              />
              <StatCard
                icon={<TrendingUp />}
                label="SOL Price"
                value={`$${portfolio.solPrice.toFixed(2)}`}
                subValue="CoinGecko live"
                change={portfolio.solChange24h}
                accent="#FF6B6B"
                delay={0.15}
              />
            </>
          ) : null}
        </div>

        {/* Chart + Allocation row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            {loading ? <PortfolioChartSkeleton /> : portfolio ? <PortfolioChart totalUsd={portfolio.totalUsd} /> : null}
          </div>
          <div>
            {loading ? <AllocationChartSkeleton /> : portfolio ? <AllocationChart portfolio={portfolio} /> : null}
          </div>
        </div>

        {/* Token table */}
        {loading ? <TokenTableSkeleton /> : portfolio ? <TokenTable portfolio={portfolio} /> : null}

        {/* Transactions */}
        {loading ? <TransactionHistorySkeleton /> : portfolio ? <TransactionHistory portfolio={portfolio} /> : null}
      </main>
    </div>
  );
}
