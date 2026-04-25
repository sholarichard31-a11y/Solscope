import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Layers, XCircle, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TX_TYPE_META = {
  swap: { icon: ArrowRightLeft, color: '#9945FF', bg: '#9945FF20', label: 'Swap' },
  transfer: { icon: ArrowRightLeft, color: '#F0C040', bg: '#F0C04020', label: 'Transfer' },
  stake: { icon: Layers, color: '#14F195', bg: '#14F19520', label: 'Stake' },
  unstake: { icon: Layers, color: '#FF6B6B', bg: '#FF6B6B20', label: 'Unstake' },
  receive: { icon: ArrowDownLeft, color: '#14F195', bg: '#14F19520', label: 'Receive' },
  send: { icon: ArrowUpRight, color: '#FF6B6B', bg: '#FF6B6B20', label: 'Send' },
};

function shortSig(sig) {
  return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
}

function formatUsd(val) {
  if (val >= 1000) return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${val.toFixed(2)}`;
}

function TxRow({ tx, index }) {
  const meta = TX_TYPE_META[tx.type] || TX_TYPE_META.transfer;
  const Icon = meta.icon;
  const timeAgo = formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="flex items-center gap-4 py-3.5 px-4 border-b border-sol-border/40 hover:bg-sol-surface/40 transition-colors group"
    >
      {/* Type icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: meta.bg }}
      >
        <Icon size={16} style={{ color: meta.color }} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-sol-text">{meta.label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-sol-border/50 text-sol-subtext font-mono">
            {tx.token}
          </span>
          {tx.status === 'failed' ? (
            <XCircle size={12} className="text-sol-red flex-shrink-0" />
          ) : (
            <CheckCircle size={12} className="text-sol-green flex-shrink-0" />
          )}
        </div>
        <div className="text-xs text-sol-subtext mt-0.5 font-mono truncate">
          {shortSig(tx.signature)}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold text-sol-text font-mono">
          {formatUsd(tx.usdValue)}
        </div>
        <div className="text-xs text-sol-subtext">{timeAgo}</div>
      </div>

      {/* Explorer link */}
      <a
        href={`https://solscan.io/tx/${tx.signature}`}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-sol-border text-sol-subtext hover:text-sol-text"
        onClick={e => e.stopPropagation()}
      >
        <ExternalLink size={13} />
      </a>
    </motion.div>
  );
}

export default function TransactionHistory({ portfolio }) {
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  if (!portfolio) return null;

  const txTypes = ['all', ...new Set(portfolio.transactions.map(t => t.type))];

  const filtered = portfolio.transactions.filter(tx =>
    filter === 'all' || tx.type === filter
  );

  const displayed = showAll ? filtered : filtered.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-xl bg-sol-card border border-sol-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-sol-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sol-gold/20 flex items-center justify-center">
              <History size={16} className="text-sol-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-sol-text">Transaction History</h3>
              <p className="text-xs text-sol-subtext">{portfolio.transactions.length} recent transactions</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {txTypes.slice(0, 5).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === type
                    ? 'bg-sol-accent text-white'
                    : 'bg-sol-surface text-sol-subtext hover:text-sol-text border border-sol-border'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      {displayed.length === 0 ? (
        <div className="py-12 text-center text-sol-subtext text-sm">
          No transactions found.
        </div>
      ) : (
        <>
          <AnimatePresence>
            {displayed.map((tx, i) => (
              <TxRow key={tx.signature} tx={tx} index={i} />
            ))}
          </AnimatePresence>

          {filtered.length > 8 && (
            <div className="p-4 text-center border-t border-sol-border">
              <button
                onClick={() => setShowAll(v => !v)}
                className="text-sm text-sol-accent hover:text-sol-accent/80 transition-colors flex items-center gap-1 mx-auto"
              >
                {showAll ? 'Show less' : `Show all ${filtered.length} transactions`}
                <ChevronRight size={14} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export function TransactionHistorySkeleton() {
  return (
    <div className="rounded-xl bg-sol-card border border-sol-border overflow-hidden">
      <div className="p-5 border-b border-sol-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg shimmer" />
        <div className="space-y-1">
          <div className="w-32 h-4 rounded shimmer" />
          <div className="w-24 h-3 rounded shimmer" />
        </div>
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4 py-3.5 px-4 border-b border-sol-border/40">
          <div className="w-9 h-9 rounded-xl shimmer flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="w-28 h-3.5 rounded shimmer" />
            <div className="w-40 h-3 rounded shimmer" />
          </div>
          <div className="space-y-1 text-right">
            <div className="w-16 h-3.5 rounded shimmer" />
            <div className="w-20 h-3 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
