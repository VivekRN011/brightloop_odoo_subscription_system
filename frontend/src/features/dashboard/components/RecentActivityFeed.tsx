import React from 'react';
import {
  CreditCard,
  Repeat,
  Receipt,
  FileCheck,
  XCircle,
  Activity,
} from 'lucide-react';
import type { DashboardActivityItem } from '../models/dashboard.types';
import { formatRelativeTime } from '@/lib/format';

export interface RecentActivityFeedProps {
  activities: DashboardActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
}) => {
  const getActivityIcon = (type: DashboardActivityItem['type']) => {
    switch (type) {
      case 'payment_recorded':
        return <CreditCard size={14} className="text-emerald-500" />;
      case 'subscription_activated':
        return <Repeat size={14} className="text-indigo-500" />;
      case 'invoice_generated':
        return <Receipt size={14} className="text-blue-500" />;
      case 'subscription_created':
        return <FileCheck size={14} className="text-amber-500" />;
      case 'subscription_closed':
        return <XCircle size={14} className="text-rose-500" />;
      default:
        return <Activity size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Activity size={16} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Recent Activity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit trail of business events & operations
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {activities.map((act) => (
          <div key={act.id} className="relative group">
            <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xs">
              {getActivityIcon(act.type)}
            </span>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {act.title}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                {act.description}
              </p>
              {act.actor && (
                <span className="inline-block mt-1 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                  By {act.actor}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

