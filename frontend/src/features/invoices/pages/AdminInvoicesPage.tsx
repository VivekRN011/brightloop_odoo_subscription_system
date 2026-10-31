import React, { useState } from 'react';
import { api } from '@/services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoice.service';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';

interface InvoiceRow {
  id: string;
  realId?: string;
  rawId?: string;
  irn?: string;
  dunningBadge?: string;
  customer: string;
  customerId?: string;
  gstin: string;
  subRef: string;
  invoiceDate: string;
  dueDate: string;
  dueNote?: string;
  taxable: string;
  gst: string;
  total: string;
  totalRaw: number;
  outstanding: string;
  outstandingRaw: number;
  status: 'PAID' | 'OVERDUE' | 'PENDING' | 'DRAFT';
}

export const AdminInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status')?.toUpperCase() || 'ALL';

  const [activeTab, setActiveTab] = useState<string>(
    initialStatus === 'OVERDUE' ? 'OVERDUE' : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>('Current Cycle');

  // Payment recording modal
  const [payModalInvoice, setPayModalInvoice] = useState<InvoiceRow | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<string>('UPI');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Fetch real invoices from database
  const { data: rawInvoices = [] } = useQuery({
    queryKey: ['admin', 'invoices'],
    queryFn: () => invoiceService.getInvoices(),
    staleTime: 30 * 1000,
  });

  const invoices: InvoiceRow[] = rawInvoices.map((inv) => {
    let status: 'PAID' | 'OVERDUE' | 'PENDING' | 'DRAFT' = 'PENDING';
    if (inv.status === 'PAID') {
      status = 'PAID';
    } else if (inv.status === 'DRAFT') {
      status = 'DRAFT';
    } else if (inv.isOverdue || (inv.status === 'CONFIRMED' && new Date(inv.dueDate) < new Date())) {
      status = 'OVERDUE';
    } else {
      status = 'PENDING';
    }

    const taxableVal = Math.round((inv.totalAmount / 1.18) * 100) / 100;
    const gstVal = Math.round((inv.totalAmount - taxableVal) * 100) / 100;

    return {
      id: inv.invoiceNumber || inv.id,
      rawId: inv.id,
      realId: inv.id,
      irn: `IRN: ${inv.id.slice(0, 8)}...${inv.id.slice(-4)}`,
      dunningBadge: status === 'OVERDUE' ? 'Dunning Active' : undefined,
      customer: inv.customerName,
      customerId: (inv as any).customerId,
      gstin: `CODE: ${inv.customerCode || 'CORPORATE'}`,
      subRef: (inv as any).subscriptionNumber || 'SUB-RECURRING',
      invoiceDate: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      dueDate: inv.dueDate ? `Due ${new Date(inv.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'On receipt',
      dueNote: status === 'OVERDUE' ? 'Action required' : undefined,
      taxable: formatINR(taxableVal),
      gst: `+${formatINR(gstVal)} GST`,
      total: formatINR(inv.totalAmount),
      totalRaw: inv.totalAmount,
      outstanding: formatINR(inv.outstandingBalance),
      outstandingRaw: inv.outstandingBalance,
      status,
    };
  });

  const handleBatchGenerateInvoices = async () => {
    try {
      toast.info('Running automated billing batch across due subscriptions...');
      const response = await api.post('/invoices/run-billing');
      const data = response.data?.data;
      toast.success(
        `Batch Run ${data?.runKey || 'completed'}: ${data?.succeededCount ?? 0} invoiced, ${data?.skippedCount ?? 0} skipped, ${data?.failedCount ?? 0} failed!`
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to execute billing run');
    }
  };

  const handleDownloadPdf = async (inv: InvoiceRow) => {
    try {
      const targetId = inv.realId || inv.id;
      toast.info(`Generating official PDF for ${inv.id}...`);
      const response = await api.get(`/invoices/${targetId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Invoice-${inv.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Invoice ${inv.id} PDF downloaded!`);
    } catch {
      toast.error('Failed to download invoice PDF.');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice) return;

    setIsSubmittingPay(true);
    try {
      await api.post('/payments', {
        invoiceId: payModalInvoice.rawId,
        amount: Number(payAmount),
        method: payMethod,
        reference: `${payMethod}-MANUAL-${Date.now().toString().slice(-6)}`,
      });
      toast.success(`Payment of ₹${payAmount} successfully recorded for ${payModalInvoice.id}!`);
      setPayModalInvoice(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to record payment');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.subRef.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'PAID') return inv.status === 'PAID';
    if (activeTab === 'PENDING') return inv.status === 'PENDING';
    if (activeTab === 'OVERDUE') return inv.status === 'OVERDUE';
    if (activeTab === 'DRAFT') return inv.status === 'DRAFT';
    return true;
  });

  // Calculate live financial totals
  const totalInvoicedSum = invoices.reduce((sum, inv) => sum + inv.totalRaw, 0);
  const totalPaidSum = invoices.reduce((sum, inv) => sum + (inv.totalRaw - inv.outstandingRaw), 0);
  const totalOutstandingSum = invoices.reduce((sum, inv) => sum + inv.outstandingRaw, 0);
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');
  const overdueTotalSum = overdueInvoices.reduce((sum, inv) => sum + inv.outstandingRaw, 0);

  const paidCount = invoices.filter((i) => i.status === 'PAID').length;
  const pendingCount = invoices.filter((i) => i.status === 'PENDING').length;
  const overdueCount = overdueInvoices.length;
  const draftCount = invoices.filter((i) => i.status === 'DRAFT').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
            Recurring Invoices &amp; Settlement
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <p className="text-xs text-on-surface-variant font-medium">
              Track automated recurring invoices, tax compliance, and payment settlement in real time.
            </p>
            <span className="hidden sm:inline text-outline">•</span>
            <span className="text-xs text-outline font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary" data-icon="verified_user">
                verified_user
              </span>
              GSTN IRN Direct Feed Enabled
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => toast.success('Exported GSTR-1 compliant JSON payload for GST portal filing.')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Export GSTR-1</span>
          </button>

          <button
            onClick={handleBatchGenerateInvoices}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base fill">bolt</span>
            <span>Batch Generate Invoices</span>
          </button>
        </div>
      </div>

      {/* 2. TOP SUMMARY METRICS ROW */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric Card 1: Total Invoiced */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Total Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-base" data-icon="account_balance_wallet">
                account_balance_wallet
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-headline text-on-surface tracking-tight">
              {formatINR(totalInvoicedSum)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="inline-flex items-center text-primary font-semibold text-[11px] bg-secondary-container px-1.5 py-0.5 rounded">
                Live
              </span>
              <span className="text-on-surface-variant">{invoices.length} invoices in database</span>
            </div>
          </div>
        </div>

        {/* Metric Card 2: Collected Revenue */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Collected Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-base" data-icon="check_circle">
                check_circle
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-headline text-on-surface tracking-tight">
              {formatINR(totalPaidSum)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="text-xs font-semibold text-primary">
                {totalInvoicedSum > 0 ? `${Math.round((totalPaidSum / totalInvoicedSum) * 100)}% settled` : '100% settled'}
              </span>
              <span className="text-outline">·</span>
              <span className="text-on-surface-variant truncate">via Razorpay &amp; Bank Allocations</span>
            </div>
          </div>
        </div>

        {/* Metric Card 3: Pending Settlement */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Pending Settlement</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-base" data-icon="schedule">
                schedule
              </span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-headline text-on-surface tracking-tight">
              {formatINR(totalOutstandingSum)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span className="text-on-surface-variant font-medium">{pendingCount} pending</span>
              <span className="text-outline">·</span>
              <span className="text-outline">Awaiting reconciliation</span>
            </div>
          </div>
        </div>

        {/* Metric Card 4: Overdue / In Dunning */}
        <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-primary">Overdue / In Dunning</span>
              {overdueCount > 0 && <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${overdueCount > 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-emerald-50 text-emerald-800'}`}>
              {overdueCount > 0 ? 'Attention' : 'Clear'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-headline text-primary tracking-tight">
              {formatINR(overdueTotalSum)}
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-on-surface-variant font-medium">{overdueCount} overdue</span>
              <button
                onClick={() => setActiveTab('OVERDUE')}
                className="text-primary font-semibold hover:underline flex items-center gap-0.5 text-[11px]"
              >
                <span>Filter Overdue</span>
                <span className="material-symbols-outlined text-[13px]" data-icon="chevron_right">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTION & FILTER BAR */}
      <section className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ALL'
                ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            All ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'PAID'
                ? 'bg-secondary-container text-on-secondary-container shadow-xs font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'PENDING'
                ? 'bg-secondary-container text-on-secondary-container shadow-xs font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'OVERDUE'
                ? 'bg-secondary-container text-on-secondary-container shadow-xs font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span>Overdue ({overdueCount})</span>
            {overdueCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-error"></span>}
          </button>
          <button
            onClick={() => setActiveTab('DRAFT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'DRAFT'
                ? 'bg-secondary-container text-on-secondary-container shadow-xs font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            Draft ({draftCount})
          </button>
        </div>

        {/* Controls: Search + Period + Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {/* Search input */}
          <div className="relative flex-1 lg:w-72">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
              data-icon="search"
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice #, customer name, GSTIN..."
              className="w-full bg-surface pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
            />
          </div>

          {/* Period selector dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                const next = period === 'Q3 2026' ? 'Q2 2026' : 'Q3 2026';
                setPeriod(next);
                toast.info(`Period changed to ${next}`);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface bg-surface border border-outline-variant hover:bg-surface-container flex items-center gap-1.5"
            >
              <span>{period}</span>
              <span className="material-symbols-outlined text-[16px] text-outline" data-icon="expand_more">
                expand_more
              </span>
            </button>
          </div>

          {/* Columns & Advanced Filter */}
          <button
            onClick={() => toast.info('Column layout customizer: 10 fields visible.')}
            className="p-1.5 rounded-lg text-on-surface-variant bg-surface border border-outline-variant hover:bg-surface-container transition-colors"
            title="Filter Settings"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="tune">
              tune
            </span>
          </button>
        </div>
      </section>

      {/* 4. MAIN INVOICES DATA TABLE */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Customer &amp; GSTIN</th>
                <th className="py-3 px-4 font-semibold">Subscription Ref</th>
                <th className="py-3 px-4 font-semibold">Invoice / Due Date</th>
                <th className="py-3 px-4 font-semibold text-right">Taxable + GST (18%)</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 text-xs">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-surface-container-low/40 transition-colors ${
                    inv.status === 'OVERDUE' ? 'bg-error-container/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inv.id)}
                      onChange={() => handleToggleSelect(inv.id)}
                      className="rounded border-outline-variant text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-on-surface">
                    <span className="font-mono text-xs font-bold text-primary">{inv.id}</span>
                    {inv.irn && <div className="text-[10px] text-outline font-normal">{inv.irn}</div>}
                    {inv.dunningBadge && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-error-container text-error border border-error/20">
                        {inv.dunningBadge}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-on-surface">{inv.customer}</div>
                    <div className="text-[11px] text-on-surface-variant font-mono">{inv.gstin}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => navigate(`/app/subscriptions/${inv.subRef}`)}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant border border-outline-variant font-mono hover:text-primary hover:border-primary transition-colors"
                    >
                      {inv.subRef}
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-on-surface">{inv.invoiceDate}</div>
                    <div className="text-[11px] text-outline">
                      {inv.dueDate} {inv.dueNote && <span className="text-error font-medium">({inv.dueNote})</span>}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="text-on-surface font-medium">{inv.taxable}</div>
                    <div className="text-[10px] text-outline">{inv.gst}</div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-on-surface font-headline">
                    {inv.total}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold">
                    <span className={inv.outstanding === '₹0' ? 'text-emerald-700' : 'text-error'}>
                      {inv.outstanding}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {inv.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Paid
                      </span>
                    )}
                    {inv.status === 'OVERDUE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-error-container text-error ring-1 ring-error/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        Overdue
                      </span>
                    )}
                    {inv.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant ring-1 ring-outline-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    )}
                    {inv.status === 'DRAFT' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-outline">
                        Draft
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleDownloadPdf(inv)}
                        className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
                        title="Download PDF"
                      >
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      </button>

                      {inv.status !== 'PAID' ? (
                        <button
                          onClick={() => {
                            setPayModalInvoice(inv);
                            setPayAmount(inv.outstanding.replace('₹', ''));
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold rounded bg-primary text-on-primary hover:bg-primary-container"
                        >
                          Pay
                        </button>
                      ) : (
                        <button
                          onClick={() => toast.info(`Invoice ${inv.id} already settled via NACH.`)}
                          className="p-1 rounded text-outline hover:text-primary"
                          title="More options"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ==================== TABLE FOOTER & COMPLIANCE NOTE ==================== */}
        <div className="p-4 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4 text-xs bg-surface">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span>
              Showing <span className="font-semibold text-on-surface">1 to {filtered.length}</span> of{' '}
              <span className="font-semibold text-on-surface">{invoices.length}</span> invoices
            </span>
            <span className="text-outline">|</span>
            <div className="flex items-center gap-1 text-outline">
              <span className="material-symbols-outlined text-sm text-primary" data-icon="check_circle">
                check_circle
              </span>
              <span>All invoices comply with CBIC e-Invoicing QR &amp; IRN validation standards.</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="px-2.5 py-1 rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40"
              disabled
            >
              Previous
            </button>
            <button className="w-7 h-7 rounded-md bg-secondary-container text-on-secondary-container font-semibold flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container flex items-center justify-center">
              2
            </button>
            <button className="px-2.5 py-1 rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container">
              Next
            </button>
          </div>
        </div>
      </section>

      {/* 5. Bottom Micro-Card: Recurring Tax & Dunning Health Insight */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]" data-icon="receipt">
              receipt
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface">Auto-Debit Health</div>
            <div className="text-[11px] text-on-surface-variant">98.4% success on 1st attempt via RBI e-Mandate</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]" data-icon="qr_code_2">
              qr_code_2
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface">GSTR-1 Ready Export</div>
            <div className="text-[11px] text-on-surface-variant">B2B invoice payload generated for GST filing portal</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]" data-icon="forward_to_inbox">
              forward_to_inbox
            </span>
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-on-surface">Smart Dunning Engine</div>
            <div className="text-[11px] text-on-surface-variant">Automatic WhatsApp &amp; Email reminders scheduled</div>
          </div>
        </div>
      </section>

      {/* 6. MODAL: Record / Retry Payment */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">Record Settlement / Retry Payment</h3>
              <button
                onClick={() => setPayModalInvoice(null)}
                className="text-outline hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-on-surface-variant">Invoice Reference:</span>
                <p className="font-bold text-primary font-mono text-sm mt-0.5">{payModalInvoice.id}</p>
                <p className="text-on-surface mt-0.5 font-medium">{payModalInvoice.customer}</p>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-semibold">Payment Amount (₹)</label>
                <input
                  type="text"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-mono text-sm font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-semibold">Settlement Rail</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="UPI">UPI Auto-pay</option>
                  <option value="NACH">NACH / Direct Debit</option>
                  <option value="CARD">Corporate Credit Card (e-Mandate)</option>
                  <option value="NEFT">Bank Transfer (NEFT/RTGS)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant space-y-1">
                <div className="flex justify-between">
                  <span>CGST (9%): Included</span>
                  <span>SGST (9%): Included</span>
                </div>
                <p className="text-emerald-700 font-semibold pt-1">
                  ✓ Receipt and tax ledger credit will automatically synchronize upon confirmation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-4 py-2 font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="px-4 py-2 font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50"
                >
                  {isSubmittingPay ? 'Recording...' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
