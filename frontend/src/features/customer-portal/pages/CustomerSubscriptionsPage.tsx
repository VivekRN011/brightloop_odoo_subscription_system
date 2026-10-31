import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Repeat,
  ArrowLeft,
  Shield,
  Filter,
} from 'lucide-react';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatINR, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const CustomerSubscriptionsPage: React.FC = () => {
  const { data: summary, isLoading, isError, refetch } = useCustomerSummary();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'CLOSED'>('ALL');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"></div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 mb-4">Failed to load subscriptions.</p>
        <Button onClick={() => refetch()} size="sm">Retry</Button>
      </div>
    );
  }

  const { subscriptions } = summary;

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (statusFilter === 'ALL') return true;
    return sub.status === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top breadcrumb & Header */}
      <div>
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft size={13} />
          <span>Back to Overview</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Repeat className="text-indigo-600 dark:text-indigo-400" size={24} />
              My Subscriptions
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active recurring product licenses, billing intervals, and renewal schedules
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <Filter size={13} className="text-slate-400 ml-1.5 mr-1" />
            {(['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  statusFilter === filter
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions Card / List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {filteredSubscriptions.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<Repeat size={24} />}
              title="No Subscriptions Found"
              description={
                statusFilter === 'ALL'
                  ? 'You do not have any active subscriptions registered under your account.'
                  : `No subscriptions found with status "${statusFilter.toLowerCase()}".`
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Subscription Code</th>
                  <th className="py-3 px-4">Plan &amp; Product</th>
                  <th className="py-3 px-4">Billing Cadence</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Next Billing Date</th>
                  <th className="py-3 px-4 text-right">Recurring Rate</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      <Link
                        to={`/portal/subscriptions/${sub.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        {sub.subscriptionNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {sub.planName}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {sub.productName} • {sub.quantity} seat{sub.quantity > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize">
                        {sub.billingInterval.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(sub.nextBillingDate)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(sub.price)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={sub.status} type="subscription" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Notice regarding plan changes */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <Shield size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Subscription Modifications &amp; Pause Rules
          </p>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Per Brightloop policy, pauses and cancellations are subject to the terms defined on your subscribed plan. To request license quantity adjustments or tier upgrades, please reach out directly to your account representative or billing support.
          </p>
        </div>
      </div>
    </div>
  );
};
