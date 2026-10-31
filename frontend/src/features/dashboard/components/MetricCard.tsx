import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MetricSummary, SeriesPoint } from '../models/dashboard.types';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  metric: MetricSummary;
  icon?: React.ReactNode;
  colorVar?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  icon,
  colorVar = '#4f6ef7',
}) => {
  const trendUp = (metric.changePct ?? 0) > 0;
  const trendDown = (metric.changePct ?? 0) < 0;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {metric.label}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {metric.formattedValue}
            </span>
          </div>
        </div>

        {icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          {metric.changePct !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                trendUp
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : trendDown
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              <TrendIcon size={12} />
              {trendUp ? '+' : ''}
              {metric.changePct}%
            </span>
          )}

          {metric.timeframe && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {metric.timeframe}
            </span>
          )}
        </div>

        {metric.series && metric.series.length >= 2 && (
          <div className="w-24 h-9">
            <MiniSparkline data={metric.series} color={colorVar} />
          </div>
        )}
      </div>

      {metric.subtext && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
          {metric.subtext}
        </p>
      )}
    </div>
  );
};

/** Minimal inline SVG sparkline adapted from the Vital Admin template */
function MiniSparkline({
  data,
  color = '#4f6ef7',
}: {
  data: SeriesPoint[];
  color?: string;
}) {
  const width = 96;
  const height = 36;
  const padding = { top: 4, bottom: 4, left: 2, right: 2 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const x = (i: number) => padding.left + (i / (data.length - 1)) * innerWidth;
  const y = (v: number) => padding.top + innerHeight - ((v - min) / range) * innerHeight;

  const points = data.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`);
  const linePath = points.map((pt, i) => (i === 0 ? `M${pt}` : `L${pt}`)).join(' ');

  const areaPath =
    `${linePath} L${x(data.length - 1).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} L${x(0).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} Z`;

  const gradId = `spark-${Math.abs(values.reduce((a, b) => a + b, 0))}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

