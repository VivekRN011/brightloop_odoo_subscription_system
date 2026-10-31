import React from 'react';
import { cn } from '@/lib/utils';
import type { SubscriptionStatus, InvoiceStatus } from '@/features/dashboard/models/dashboard.types';

export interface StatusBadgeProps {
  status: SubscriptionStatus | InvoiceStatus | string;
  type?: 'subscription' | 'invoice' | 'general';
  isOverdue?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type: _type = 'general',
  isOverdue = false,
  className,
}) => {
  const normalized = status.toLowerCase();

  // If marked as overdue
  if (isOverdue) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
          'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
        Overdue
      </span>
    );
  }

  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-500';

  if (normalized === 'active' || normalized === 'paid') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
    dotColor = 'bg-emerald-600';
  } else if (normalized === 'confirmed') {
    badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800';
    dotColor = 'bg-indigo-600';
  } else if (normalized === 'draft') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    dotColor = 'bg-amber-600';
  } else if (normalized === 'cancelled' || normalized === 'closed') {
    badgeStyle = 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700';
    dotColor = 'bg-zinc-500';
  }

  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        badgeStyle,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      {label}
    </span>
  );
};
