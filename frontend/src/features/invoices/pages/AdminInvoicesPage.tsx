import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { invoiceService, type AdminInvoiceItem } from '../services/invoice.service';
import { paymentService } from '@/features/payments/services/payment.service';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const AdminInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<AdminInvoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Quick Payment Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<AdminInvoiceItem | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('UPI');
  const [payRef, setPayRef] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirm = async (id: string, num: string) => {
    await invoiceService.confirmInvoice(id);
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'CONFIRMED' } : i))
    );
    setActionMessage(`Invoice ${num} confirmed and locked.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCancel = async (id: string, num: string) => {
    await invoiceService.cancelInvoice(id);
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'CANCELLED' } : i))
    );
    setActionMessage(`Invoice ${num} cancelled.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    try {
      await paymentService.recordPayment({
        invoiceId: paymentModalInvoice.id,
        customerId: 'customer-id',
        amount: payAmount,
        method: payMethod,
        reference: payRef,
      });

      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === paymentModalInvoice.id) {
            const newPaid = inv.paidAmount + payAmount;
            const newBalance = Math.max(0, inv.totalAmount - newPaid);
            return {
              ...inv,
              paidAmount: newPaid,
              outstandingBalance: newBalance,
              status: newBalance === 0 ? 'PAID' : 'CONFIRMED',
            };
          }
          return inv;
        })
      );

      setActionMessage(
        `Recorded ${formatINR(payAmount)} payment for ${paymentModalInvoice.invoiceNumber}.`
      );
      setPaymentModalInvoice(null);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'OVERDUE'
        ? inv.isOverdue
        : inv.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.outstandingBalance, 0);
  const overdueCount = invoices.filter((i) => i.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Invoices &amp; Billing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track recurring billing cycles, confirmed receivables, and allocate payment settlements (FR-BILL-10).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{formatINR(totalInvoiced)}</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Collected</span>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{formatINR(totalPaid)}</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Outstanding Balance</span>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">{formatINR(totalOutstanding)}</div>
        </div>
        <div className="p-4 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20">
          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Overdue Invoices</span>
          <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">{overdueCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'CONFIRMED', 'PAID', 'OVERDUE', 'DRAFT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {inv.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{inv.issueDate.slice(0, 10)}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <span>{inv.dueDate.slice(0, 10)}</span>
                          {inv.isOverdue && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : inv.status === 'DRAFT'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {formatINR(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        {formatINR(inv.outstandingBalance)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'DRAFT' && (
                            <button
                              type="button"
                              title="Confirm Invoice"
                              onClick={() => handleConfirm(inv.id, inv.invoiceNumber)}
                              className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-semibold"
                            >
                              Confirm
                            </button>
                          )}
                          {inv.status === 'CONFIRMED' && inv.outstandingBalance > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPayAmount(inv.outstandingBalance);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                            >
                              <CreditCard size={12} />
                              <span>Collect</span>
                            </button>
                          )}
                          {inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                            <button
                              type="button"
                              title="Cancel Invoice"
                              onClick={() => handleCancel(inv.id, inv.invoiceNumber)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Record Payment Collection
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Settling invoice <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{paymentModalInvoice.invoiceNumber}</span> ({paymentModalInvoice.customerName})
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Settlement Amount (INR)
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalInvoice.outstandingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
                <span className="text-[10px] text-slate-400">
                  Maximum outstanding: {formatINR(paymentModalInvoice.outstandingBalance)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="CHEQUE">Corporate Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank / UPI Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/28391823/HDFC"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentModalInvoice(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4"
                >
                  Confirm Settlement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
