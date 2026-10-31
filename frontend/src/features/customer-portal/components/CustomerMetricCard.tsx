import React from 'react';
import { cn } from '@/lib/utils';

export interface CustomerMetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'success' | 'info' | 'warning' | 'neutral';
  };
  className?: string;
}

export const CustomerMetricCard: React.FC<CustomerMetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  badge,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </span>
          </div>
        </div>

        {icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {subtext && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {subtext}
          </span>
        )}

        {badge && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider',
              badge.variant === 'success' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
              badge.variant === 'info' && 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400',
              badge.variant === 'warning' && 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
              badge.variant === 'neutral' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            )}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};

