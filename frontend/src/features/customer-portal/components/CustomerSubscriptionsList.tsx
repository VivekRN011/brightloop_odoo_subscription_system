import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, ChevronRight } from 'lucide-react';
import type { CustomerSubscription } from '../models/customerPortal.types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatINR, formatDate } from '@/lib/format';

export interface CustomerSubscriptionsListProps {
  subscriptions: CustomerSubscription[];
  showViewAll?: boolean;
}

export const CustomerSubscriptionsList: React.FC<CustomerSubscriptionsListProps> = ({
  subscriptions,
  showViewAll = true,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Repeat size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              My Subscriptions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active recurring software plans and add-on services
            </p>
          </div>
        </div>

        {showViewAll && subscriptions.length > 0 && (
          <Link
            to="/portal/subscriptions"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={<Repeat size={22} />}
            title="No Subscriptions Active"
            description="Your subscriptions will appear here once an administrator or sales agent activates your agreed plan."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Plan &amp; Service</th>
                <th className="py-3 px-4">Billing Interval</th>
                <th className="py-3 px-4 text-right">Rate (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Next Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    {sub.subscriptionNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {sub.planName}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      {sub.productName} • {sub.quantity} seat{sub.quantity > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                      {sub.billingInterval.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(sub.price)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={sub.status} type="subscription" />
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">
                    {formatDate(sub.nextBillingDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

