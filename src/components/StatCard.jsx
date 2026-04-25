import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon, label, value, subValue, change, changeLabel, accent, delay = 0 }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-xl bg-sol-card border border-sol-border p-5 hover:border-sol-accent/30 transition-all group"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, ${accent || '#9945FF'}15 0%, transparent 60%)`,
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${accent || '#9945FF'}20` }}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon, { size: 15, style: { color: accent || '#9945FF' } })
                : icon}
            </div>
            <span className="text-xs text-sol-subtext font-medium uppercase tracking-wider">{label}</span>
          </div>

          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-sol-green' : 'text-sol-red'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="text-2xl font-bold text-sol-text font-mono">{value}</div>

        {/* Sub value */}
        {subValue && (
          <div className="text-xs text-sol-subtext mt-1">{subValue}</div>
        )}

        {changeLabel && (
          <div className="text-xs text-sol-subtext mt-1">{changeLabel}</div>
        )}
      </div>
    </motion.div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl bg-sol-card border border-sol-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg shimmer" />
        <div className="w-20 h-3 rounded shimmer" />
      </div>
      <div className="w-32 h-7 rounded shimmer mb-2" />
      <div className="w-24 h-3 rounded shimmer" />
    </div>
  );
}
