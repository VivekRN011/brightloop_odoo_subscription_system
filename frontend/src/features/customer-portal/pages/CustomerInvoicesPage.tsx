import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  ArrowLeft,
  Search,
  Filter,
  Download,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
} from 'lucide-react';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatINR, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import type { CustomerInvoice } from '../models/customerPortal.types';

export const CustomerInvoicesPage: React.FC = () => {
  const { data: summary, isLoading, isError, refetch } = useCustomerSummary();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
        <p className="text-sm text-slate-500 mb-4">Failed to load invoices.</p>
        <Button onClick={() => refetch()} size="sm">Retry</Button>
      </div>
    );
  }

  const { recentInvoices } = summary;

  const filteredInvoices = recentInvoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.planName && inv.planName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'UNPAID') {
      return inv.outstandingAmount > 0;
    }
    if (statusFilter === 'PAID') {
      return inv.status === 'paid';
    }
    return true;
  });

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      if (selectedInvoice) {
        selectedInvoice.status = 'paid';
        selectedInvoice.paidAmount = selectedInvoice.totalAmount;
        selectedInvoice.outstandingAmount = 0;
        selectedInvoice.isOverdue = false;
      }
    }, 1200);
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
              <Receipt className="text-emerald-600 dark:text-emerald-400" size={24} />
              My Invoices
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Itemized billing statements, tax receipts, and payment settlements
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <Filter size={13} className="text-slate-400 ml-1.5 mr-1" />
              {(['ALL', 'UNPAID', 'PAID'] as const).map((filter) => (
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
                  {filter === 'ALL' ? 'All' : filter === 'UNPAID' ? 'Outstanding' : 'Paid'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<Receipt size={24} />}
              title="No Invoices Found"
              description="No matching invoices were found for your current filter criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Subtotal / Total</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => {
                  const canPay = inv.status === 'confirmed' && inv.outstandingAmount > 0;
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <FileText size={15} className="text-slate-400" />
                        <span className="font-mono">{inv.invoiceNumber}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={
                            inv.isOverdue
                              ? 'font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1'
                              : 'text-slate-600 dark:text-slate-400'
                          }
                        >
                          {inv.isOverdue && <AlertTriangle size={12} />}
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold">
                        {inv.outstandingAmount > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            {formatINR(inv.outstandingAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">₹0.00</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={inv.status} type="invoice" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canPay && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentSuccess(false);
                              }}
                              className="h-7 text-xs px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs"
                            >
                              <CreditCard size={12} />
                              <span>Pay Now</span>
                            </Button>
                          )}
                          <button
                            type="button"
                            onClick={() => alert(`Downloading GST Invoice ${inv.invoiceNumber} (PDF format)`)}
                            className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download PDF"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Razorpay Test Mode Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Razorpay Checkout
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      Test Mode
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Brightloop Subscription Settlement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {paymentSuccess ? (
                <div className="py-6 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Payment Succeeded!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                    Transaction ID <span className="font-mono font-semibold">pay_test_09a47b19e</span> recorded. Invoice is now Paid.
                  </p>
                  <Button
                    onClick={() => setSelectedInvoice(null)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold"
                  >
                    Close Window
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Invoice Number:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedInvoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Due Date:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {formatDate(selectedInvoice.dueDate)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Amount to Pay:
                      </span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatINR(selectedInvoice.outstandingAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedInvoice(null)}
                      className="flex-1 text-xs"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSimulatePayment}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : `Confirm Pay ${formatINR(selectedInvoice.outstandingAmount)}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
