import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Receipt, Filter } from 'lucide-react';
import type { RecentInvoiceItem } from '../models/dashboard.types';
import { formatINR, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';

export interface RecentInvoicesTableProps {
  invoices: RecentInvoiceItem[];
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({ invoices }) => {
  const navigate = useNavigate();
  type InvoiceFilter = 'all' | 'confirmed' | 'paid' | 'overdue' | 'draft' | 'cancelled';
  const [filter, setFilter] = useState<InvoiceFilter>('all');

  const isInvoiceOverdue = (dueDateStr: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    const dueDate = new Date(dueDateStr);
    // Reference date aligned with current hackathon timestamp: 2026-10-31
    const referenceDate = new Date('2026-10-31T12:00:00Z');
    return dueDate.getTime() < referenceDate.getTime();
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isInvoiceOverdue(inv.dueDate, inv.status) && inv.outstandingAmount > 0;
    return inv.status === filter;
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Receipt size={16} />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Recent Invoices
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time billing transactions, verification status, and payment allocations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['all', 'confirmed', 'paid', 'overdue', 'draft', 'cancelled'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all capitalize ${
                  filter === tab
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/invoices')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
          >
            View all
          </button>
        </div>
      </div>

      {/* Table Content */}
      {filteredInvoices.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={<Filter size={20} />}
            title="No Invoices Found"
            description={`No invoices match the selected filter "${filter}".`}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => {
                const overdue = isInvoiceOverdue(inv.dueDate, inv.status);

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => navigate('/app/invoices')}
                  >
                    <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {inv.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {inv.customerEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={
                          overdue
                            ? 'text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {formatDate(inv.dueDate)}
                        {overdue && <span className="text-[10px] uppercase font-bold">(Overdue)</span>}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge
                        status={inv.status}
                        type="invoice"
                        isOverdue={overdue}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/app/invoices');
                        }}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium p-1 rounded"
                        title="View invoice details"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
