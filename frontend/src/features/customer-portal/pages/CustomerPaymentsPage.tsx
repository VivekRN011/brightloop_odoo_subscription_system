import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { formatINR, formatDate } from '@/lib/format';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export const CustomerPaymentsPage: React.FC = () => {
  const { data: summary, isLoading, isError, refetch } = useCustomerSummary();

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
        <p className="text-sm text-slate-500 mb-4">Failed to load payment history.</p>
        <Button onClick={() => refetch()} size="sm">Retry</Button>
      </div>
    );
  }

  const { payments = [] } = summary;

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'UPI':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'BANK_TRANSFER':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'CARD':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

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
              <CreditCard className="text-indigo-600 dark:text-indigo-400" size={24} />
              Payment History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified payment receipts, bank transfer UTRs, and settlements recorded against your account
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Settled:
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {formatINR(summary.totalPaidAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payments Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<CreditCard size={24} />}
              title="No Payments Recorded"
              description="Your payment history will appear here once invoice settlements or online transactions are registered."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Payment Ref #</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference / Note</th>
                  <th className="py-3 px-4 text-right">Settled Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {pay.paymentNumber}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {pay.invoiceNumber}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(pay.paymentDate)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getMethodBadge(
                          pay.paymentMethod
                        )}`}
                      >
                        {pay.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {pay.referenceNote}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(pay.amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck size={11} />
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
