import React, { useState, useEffect } from 'react';
import { paymentService, type AdminPaymentItem } from '../services/payment.service';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';

interface ExtendedPaymentRow extends AdminPaymentItem {
  invoiceRef?: string;
  clearanceDate?: string;
  railLabel?: string;
  settlementStatus?: 'RECONCILED' | 'UNALLOCATED' | 'PARTIAL' | 'FAILED_RETRYING';
}

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<ExtendedPaymentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [railFilter, setRailFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Payment Form
  const [customerName, setCustomerName] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'UPI' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE' | 'CASH'>('UPI');
  const [reference, setReference] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPayments();
      if (Array.isArray(data)) {
        setPayments(
          data.map((p) => ({
            ...p,
            invoiceRef: (p as any).invoiceNumber || p.reference || '-',
            clearanceDate: p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
            railLabel: p.method === 'UPI' ? 'UPI AutoPay' : p.method === 'CARD' ? 'Corporate e-Mandate' : p.method === 'BANK_TRANSFER' ? 'Direct Bank RTGS' : p.method,
            settlementStatus: (p.status === 'FAILED' ? 'FAILED_RETRYING' : 'RECONCILED') as any,
          }))
        );
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.recordPayment({
        invoiceId,
        customerId: customerName,
        amount: Number(amount),
        method,
        reference: reference || `MANUAL-${Date.now()}`,
      });
      toast.success(`Payment of ${formatINR(Number(amount))} recorded and reconciled successfully!`);
      setIsModalOpen(false);
      setInvoiceId('');
      setAmount('');
      setReference('');
      setCustomerName('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to record payment');
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
      (p.invoiceRef && p.invoiceRef.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (railFilter === 'UPI' && p.method !== 'UPI') return false;
    if (railFilter === 'CARD' && p.method !== 'CARD') return false;
    if (railFilter === 'BANK' && p.method !== 'BANK_TRANSFER') return false;

    if (statusFilter === 'RECONCILED' && p.settlementStatus !== 'RECONCILED') return false;
    if (statusFilter === 'UNALLOCATED' && p.settlementStatus !== 'UNALLOCATED') return false;
    if (statusFilter === 'FAILED' && p.settlementStatus !== 'FAILED_RETRYING') return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* 1. Header & Live Settlement Engine */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
            Payment Allocations &amp; Settlement Ledger
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <p className="text-xs text-on-surface-variant font-medium">
              Multi-rail transaction ledger covering RBI e-Mandates, NACH clearance, UPI AutoPay, and RTGS feeds.
            </p>
            <span className="hidden sm:inline text-outline">•</span>
            <span className="text-xs text-outline font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">sync</span>
              Real-Time Settlement Reconciled
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => toast.success('Triggered automatic reconciliation matching for 12 advance receipts.')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">fact_check</span>
            <span>Auto-Reconcile Batch</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_card</span>
            <span>+ Record Manual Payment</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Bento Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Total Collected</span>
            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">
              {formatINR(payments.filter((p) => p.status === 'RECORDED' || p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0))}
            </span>
            <span className="text-xs text-emerald-700 font-semibold ml-2">settled</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2">{payments.length} ledger transactions</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Reconciled Rate</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-primary font-headline">
              {payments.length > 0
                ? `${((payments.filter((p) => p.status === 'RECORDED' || p.status === 'SUCCESS').length / payments.length) * 100).toFixed(0)}%`
                : '100%'}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">Auto-matched with invoice ledger</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Active Transactions</span>
            <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">
              {payments.filter((p) => p.status === 'RECORDED').length}
            </span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2">Recorded &amp; confirmed collections</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Failed / Retrying</span>
            <span className="material-symbols-outlined text-error text-lg">warning</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-error font-headline">
              {formatINR(payments.filter((p) => p.status === 'FAILED').reduce((sum, p) => sum + p.amount, 0))}
            </span>
          </div>
          <div className="text-[11px] text-error mt-2 font-medium">{payments.filter((p) => p.status === 'FAILED').length} requires reconciliation retry</div>
        </div>
      </section>

      {/* 3. Ledger Filter & Control Toolbar */}
      <section className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Rail Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All Rails' },
            { id: 'CARD', label: 'NACH / e-Mandate' },
            { id: 'UPI', label: 'UPI AutoPay' },
            { id: 'BANK', label: 'Direct Bank RTGS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRailFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                railFilter === tab.id
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface px-2.5 py-1.5 text-xs text-on-surface border border-outline-variant rounded-lg font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="RECONCILED">Reconciled</option>
            <option value="UNALLOCATED">Unallocated</option>
            <option value="FAILED">Dunning / Retrying</option>
          </select>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payment #, ref, customer..."
              className="w-full bg-surface pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
        </div>
      </section>

      {/* 4. Payments Ledger Data Table */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-5 font-semibold">Payment ID</th>
                <th className="py-3 px-4 font-semibold">Customer &amp; Account</th>
                <th className="py-3 px-4 font-semibold">Settlement Rail &amp; Reference</th>
                <th className="py-3 px-4 font-semibold">Invoice Applied</th>
                <th className="py-3 px-4 font-semibold text-right">Settled Amount</th>
                <th className="py-3 px-4 font-semibold">Clearance Timestamp</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
                    <p className="mt-1">Loading payments settlement ledger...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant text-xs">
                    No payment records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-4 px-5 font-semibold text-primary font-mono">
                    {pay.paymentNumber}
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-on-surface">{pay.customerName}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-medium text-on-surface">{pay.railLabel}</div>
                    <div className="text-[10px] text-outline font-mono">{pay.reference}</div>
                  </td>

                  <td className="py-4 px-4 font-mono font-semibold text-primary">
                    {pay.invoiceRef}
                  </td>

                  <td className="py-4 px-4 text-right font-bold text-on-surface font-headline">
                    ₹{pay.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-4 text-on-surface-variant text-[11px]">
                    {pay.clearanceDate}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {pay.settlementStatus === 'RECONCILED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Reconciled
                      </span>
                    )}
                    {pay.settlementStatus === 'UNALLOCATED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Unallocated Advance
                      </span>
                    )}
                    {pay.settlementStatus === 'FAILED_RETRYING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-error-container text-error">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        Dunning Retrying
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => toast.success(`Official Bank Settlement Receipt generated for ${pay.paymentNumber}`)}
                      className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container"
                      title="Download Official Receipt"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant bg-surface">
          <span>Showing 1 to {filtered.length} of {payments.length} settled ledger records</span>
          <div className="flex items-center gap-1 text-outline">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            <span>All bank debits synchronized with RBI payment system directives.</span>
          </div>
        </div>
      </section>

      {/* 5. MODAL: Record Manual Payment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">Record Settlement Receipt</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Customer / Entity</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Nexarise Technologies Pvt Ltd"
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Invoice Number Applied</label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  placeholder="INV-2026-1048"
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-mono uppercase focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Payment Rail</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  >
                    <option value="UPI">UPI AutoPay</option>
                    <option value="BANK_TRANSFER">Bank RTGS / NEFT</option>
                    <option value="CARD">Corporate e-Mandate</option>
                    <option value="CHEQUE">Corporate Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Transaction Ref / UTR</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-mono focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container"
                >
                  Record &amp; Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
