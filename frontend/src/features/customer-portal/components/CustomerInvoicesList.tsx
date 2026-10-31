import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  ChevronRight,
  Download,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
} from 'lucide-react';
import type { CustomerInvoice } from '../models/customerPortal.types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatINR, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export interface CustomerInvoicesListProps {
  invoices: CustomerInvoice[];
  showViewAll?: boolean;
}

export const CustomerInvoicesList: React.FC<CustomerInvoicesListProps> = ({
  invoices,
  showViewAll = true,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenPay = (inv: CustomerInvoice) => {
    setSelectedInvoice(inv);
    setPaymentSuccess(false);
  };

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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Receipt size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Invoices
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tax invoices, payment receipts, and billing settlement status
            </p>
          </div>
        </div>

        {showViewAll && invoices.length > 0 && (
          <Link
            to="/portal/invoices"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={<Receipt size={22} />}
            title="No Invoices Yet"
            description="Your tax invoices will be generated here automatically when a recurring billing interval executes."
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
                <th className="py-3 px-4 text-right">Total (INR)</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => {
                const canPay = inv.status === 'confirmed' && inv.outstandingAmount > 0;
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span>{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={
                          inv.isOverdue
                            ? 'font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        {inv.isOverdue && <AlertTriangle size={12} />}
                        {formatDate(inv.dueDate)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      {inv.outstandingAmount > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {formatINR(inv.outstandingAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">₹0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={inv.status} type="invoice" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canPay ? (
                          <Button
                            size="sm"
                            onClick={() => handleOpenPay(inv)}
                            className="h-7 text-xs px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs"
                          >
                            <CreditCard size={12} />
                            <span>Pay</span>
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => alert(`Downloading GST Invoice ${inv.invoiceNumber} (PDF format)`)}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download Tax Invoice (PDF)"
                          >
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Razorpay Test Mode Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
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

            {/* Modal Body */}
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
                    Transaction ID <span className="font-mono font-semibold">pay_test_09a47b19e</span> has been recorded. Your invoice status is now updated to Paid.
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

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Payment Method
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                      <button
                        type="button"
                        className="py-2.5 px-3 rounded-lg border border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex flex-col items-center justify-center gap-1 transition-all"
                      >
                        <CreditCard size={15} />
                        <span>UPI / Card</span>
                      </button>
                      <button
                        type="button"
                        className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex flex-col items-center justify-center gap-1 transition-all opacity-70"
                        title="Net Banking"
                      >
                        <span>Net Banking</span>
                      </button>
                      <button
                        type="button"
                        className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex flex-col items-center justify-center gap-1 transition-all opacity-70"
                        title="Corporate Wallet"
                      >
                        <span>Wallet</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                    By confirming this test transaction, Brightloop simulates receipt generation and automatic reconciliation against your subscription account.
                  </p>

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
                      {isProcessing ? 'Authorizing...' : `Pay ${formatINR(selectedInvoice.outstandingAmount)}`}
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
