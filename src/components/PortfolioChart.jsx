import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { format, subDays } from 'date-fns';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

function generateHistoricalData(currentValue, days) {
  const data = [];
  const volatility = 0.035;
  let value = currentValue * (0.75 + Math.random() * 0.2);

  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const change = (Math.random() - 0.46) * volatility;
    value = value * (1 + change);
    if (i === 0) value = currentValue; // pin to current
    data.push({
      date: format(date, 'MMM d'),
      fullDate: date.toISOString(),
      value: Math.max(0, value),
    });
  }
  return data;
}

function formatUsd(val) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-sol-surface border border-sol-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <div className="text-sol-subtext mb-1">{label}</div>
      <div className="font-bold text-sol-text font-mono">{formatUsd(val)}</div>
    </div>
  );
}

export default function PortfolioChart({ totalUsd }) {
  const [range, setRange] = useState(RANGES[0]);

  const data = useMemo(() => generateHistoricalData(totalUsd, range.days), [totalUsd, range.days]);

  const startVal = data[0]?.value ?? 0;
  const endVal = data[data.length - 1]?.value ?? 0;
  const change = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;
  const isPositive = change >= 0;

  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));
  const yDomain = [minVal * 0.95, maxVal * 1.05];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl bg-sol-card border border-sol-border p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sol-green/20 flex items-center justify-center">
            <BarChart2 size={16} className="text-sol-green" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-sol-text">Portfolio Value</h3>
            <div className={`text-xs font-medium ${isPositive ? 'text-sol-green' : 'text-sol-red'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}% in {range.label}
            </div>
          </div>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                range.label === r.label
                  ? 'bg-sol-green text-sol-bg font-semibold'
                  : 'bg-sol-surface text-sol-subtext hover:text-sol-text border border-sol-border'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#14F195' : '#FF4B4B'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isPositive ? '#14F195' : '#FF4B4B'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4520" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#4b5e7a' }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(data.length / 5)}
            />
            <YAxis
              tickFormatter={formatUsd}
              tick={{ fontSize: 11, fill: '#4b5e7a' }}
              tickLine={false}
              axisLine={false}
              domain={yDomain}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#14F195' : '#FF4B4B'}
              strokeWidth={2}
              fill="url(#valueGradient)"
              dot={false}
              activeDot={{ r: 5, fill: isPositive ? '#14F195' : '#FF4B4B', stroke: '#1a2235', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export function PortfolioChartSkeleton() {
  return (
    <div className="rounded-xl bg-sol-card border border-sol-border p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg shimmer" />
          <div className="space-y-1">
            <div className="w-28 h-4 rounded shimmer" />
            <div className="w-20 h-3 rounded shimmer" />
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => <div key={i} className="w-10 h-7 rounded-lg shimmer" />)}
        </div>
      </div>
      <div className="h-48 rounded-lg shimmer" />
    </div>
  );
}
