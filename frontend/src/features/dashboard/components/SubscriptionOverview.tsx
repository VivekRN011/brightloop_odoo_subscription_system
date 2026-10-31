import React from 'react';
import type { SubscriptionStatusBreakdown } from '../models/dashboard.types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SubscriptionOverviewProps {
  data: SubscriptionStatusBreakdown[];
}

export const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Repeat size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Subscription Lifecycle
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total {total} managed subscriptions
              </p>
            </div>
          </div>

          <Link
            to="/app/subscriptions"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all
          </Link>
        </div>

        {/* Stacked Visual Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden my-4 gap-0.5">
          {data.map((item) => (
            <div
              key={item.status}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
              title={`${item.label}: ${item.count} (${item.percentage}%)`}
            />
          ))}
        </div>

        {/* Breakdown List */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.map((item) => (
            <div
              key={item.status}
              className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {item.percentage}% of total
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Retention Rate: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">94.2%</strong></span>
        <StatusBadge status="active" type="subscription" />
      </div>
    </div>
  );
};

