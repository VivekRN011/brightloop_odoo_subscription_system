import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Shield,
  Receipt,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatINR, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const CustomerSubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: summary, isLoading, isError, refetch } = useCustomerSummary();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 mb-4">Failed to load subscription details.</p>
        <Button onClick={() => refetch()} size="sm">Retry</Button>
      </div>
    );
  }

  const subscription = summary.subscriptions.find(
    (s) => s.id === id || s.subscriptionNumber === id
  );

  if (!subscription) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Subscription Not Found
        </h3>
        <p className="text-xs text-slate-500">
          No subscription matching identifier "{id}" was found in your customer records.
        </p>
        <Button onClick={() => navigate('/portal/subscriptions')} size="sm">
          Return to My Subscriptions
        </Button>
      </div>
    );
  }

  // Related invoices for this customer
  const relatedInvoices = summary.recentInvoices;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          to="/portal/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft size={13} />
          <span>Back to Subscriptions</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {subscription.subscriptionNumber}
              </span>
              <StatusBadge status={subscription.status} type="subscription" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subscription.planName} • Billed {subscription.billingInterval.toLowerCase()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Plan modification request sent to Brightloop Accounts Desk.')}
              className="text-xs"
            >
              Request Plan Change
            </Button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Core Subscription Parameters */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers size={16} className="text-indigo-600" />
              Service &amp; Plan Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Subscribed Product</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {subscription.productName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Subscription Plan</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {subscription.planName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Allocated Seats</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {subscription.quantity} User License{subscription.quantity > 1 ? 's' : ''}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Billing Interval</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 capitalize">
                  {subscription.billingInterval.toLowerCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Related Invoices */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt size={16} className="text-emerald-600" />
              Related Invoices for this Account
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {relatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={inv.status} type="invoice" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/portal/invoices/${inv.id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Key Dates & Commercial Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Billing Timeline
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} />
                  Start Date:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(subscription.startDate)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock size={14} />
                  Next Billing Run:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {formatDate(subscription.nextBillingDate)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Shield size={14} />
                  Contract Expiry:
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(subscription.expiryDate)}
                </span>
              </div>

              <div className="pt-2 flex items-baseline justify-between">
                <span className="text-slate-500">Recurring Price:</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {formatINR(subscription.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation / Pause Policy Notice */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Plan Lifecycle Policies (FR-PLAN-07 to 09)
            </span>
            <p className="leading-relaxed text-[11px]">
              Pauses and terminations are governed by the terms of your agreed plan. Changes take effect on the next recurring billing boundary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
