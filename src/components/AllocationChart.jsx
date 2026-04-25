import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const CHART_COLORS = [
  '#9945FF', '#14F195', '#F0C040', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#FFA07A', '#98D8C8', '#DDA0DD', '#90EE90',
];

function formatUsd(val) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-sol-surface border border-sol-border rounded-lg p-3 shadow-xl text-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
        <span className="font-medium text-sol-text">{item.name}</span>
      </div>
      <div className="text-sol-subtext">{formatUsd(item.value)}</div>
      <div className="text-sol-accent">{item.percentage.toFixed(1)}%</div>
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-sol-subtext truncate">{entry.value}</span>
          </div>
          <span className="text-sol-text font-mono font-medium flex-shrink-0">
            {entry.payload.percentage.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AllocationChart({ portfolio }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!portfolio) return null;

  // Build chart data
  const chartData = [];

  // SOL
  chartData.push({
    name: 'SOL',
    value: portfolio.solBalanceUsd,
    percentage: (portfolio.solBalanceUsd / portfolio.totalUsd) * 100,
    color: CHART_COLORS[0],
  });

  // Tokens
  portfolio.tokens.forEach((token, i) => {
    if (token.valueUsd > 0) {
      chartData.push({
        name: token.symbol,
        value: token.valueUsd,
        percentage: (token.valueUsd / portfolio.totalUsd) * 100,
        color: CHART_COLORS[(i + 1) % CHART_COLORS.length],
      });
    }
  });

  // Sort descending, keep top 8, group rest as "Other"
  chartData.sort((a, b) => b.value - a.value);
  let finalData = chartData;
  if (chartData.length > 8) {
    const top7 = chartData.slice(0, 7);
    const others = chartData.slice(7);
    const otherValue = others.reduce((s, d) => s + d.value, 0);
    finalData = [
      ...top7,
      {
        name: 'Other',
        value: otherValue,
        percentage: (otherValue / portfolio.totalUsd) * 100,
        color: '#4b5e7a',
      },
    ];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl bg-sol-card border border-sol-border p-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-sol-accent/20 flex items-center justify-center">
          <PieIcon size={16} className="text-sol-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-sol-text">Allocation</h3>
          <p className="text-xs text-sol-subtext">Portfolio breakdown</p>
        </div>
      </div>

      {/* Donut chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={finalData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              stroke="none"
            >
              {finalData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Center label */}
      <div className="text-center -mt-2 mb-4">
        <div className="text-xs text-sol-subtext">Total Value</div>
        <div className="text-lg font-bold text-sol-text font-mono">{formatUsd(portfolio.totalUsd)}</div>
      </div>

      {/* Legend */}
      <div className="border-t border-sol-border pt-4">
        <CustomLegend payload={finalData.map(d => ({ value: d.name, color: d.color, payload: d }))} />
      </div>
    </motion.div>
  );
}

export function AllocationChartSkeleton() {
  return (
    <div className="rounded-xl bg-sol-card border border-sol-border p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg shimmer" />
        <div className="space-y-1">
          <div className="w-20 h-4 rounded shimmer" />
          <div className="w-28 h-3 rounded shimmer" />
        </div>
      </div>
      <div className="h-52 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full shimmer" />
      </div>
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shimmer" />
              <div className="w-16 h-3 rounded shimmer" />
            </div>
            <div className="w-10 h-3 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
