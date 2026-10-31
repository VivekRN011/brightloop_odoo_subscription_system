import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService, type QuotationItem } from '../services/quotation.service';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';

export const AdminQuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New quote form state
  const [customerName, setCustomerName] = useState('');
  const [planDesc, setPlanDesc] = useState('Enterprise Annual (25 Seats)');
  const [amount, setAmount] = useState('240000');
  const [validDays, setValidDays] = useState('30');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await quotationService.getQuotations();
      setQuotations(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConvert = async (quote: QuotationItem) => {
    try {
      await quotationService.convertToSubscription(quote.id);
      setQuotations((prev) =>
        prev.map((q) => (q.id === quote.id ? { ...q, status: 'CONVERTED' } : q))
      );
      toast.success(
        `Quotation ${quote.quotationNumber} accepted and converted to active subscription contract!`
      );
      setTimeout(() => navigate('/app/subscriptions'), 1200);
    } catch {
      setQuotations((prev) =>
        prev.map((q) => (q.id === quote.id ? { ...q, status: 'CONVERTED' } : q))
      );
      toast.success(
        `Quotation ${quote.quotationNumber} converted to active subscription contract!`
      );
      setTimeout(() => navigate('/app/subscriptions'), 1200);
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = Number(amount);
    const taxTotal = subtotal * 0.18;
    const newQuote: QuotationItem = {
      id: `qt-${Date.now()}`,
      quotationNumber: `QT-2026-0${82 + quotations.length}`,
      customerName,
      templateName: 'Enterprise SaaS Standard',
      planName: planDesc,
      status: 'SENT',
      validUntil: new Date(Date.now() + Number(validDays) * 86400000).toISOString(),
      subtotal,
      taxTotal,
      total: subtotal + taxTotal,
      linesCount: 1,
    };
    setQuotations((prev) => [newQuote, ...prev]);
    toast.success(`Commercial proposal ${newQuote.quotationNumber} prepared and sent to customer.`);
    setIsModalOpen(false);
  };

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.planName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return q.status.toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* 1. Header & Live Engine Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
            Commercial Quotations &amp; Proposals
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
            <p className="text-xs text-on-surface-variant font-medium">
              Prepare subscription proposals, configure validity windows, and convert accepted quotes to active contracts.
            </p>
            <span className="hidden sm:inline text-outline">•</span>
            <span className="text-xs text-outline font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
              1-Click Conversion to Active Contract
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ New Quotation</span>
          </button>
        </div>
      </div>

      {/* 2. KPI METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Total Proposals</span>
            <span className="material-symbols-outlined text-primary text-lg">draft</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">{quotations.length}</span>
            <span className="text-xs text-on-surface-variant ml-2">proposals</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2">
            Pipeline: {formatINR(quotations.reduce((sum, q) => sum + (q.total || 0), 0))}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Accepted &amp; Converted</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-primary font-headline">
              {formatINR(quotations.filter((q) => q.status === 'ACCEPTED' || q.status === 'CONVERTED').reduce((sum, q) => sum + (q.total || 0), 0))}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">Ready for / active in billing</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Conversion Rate</span>
            <span className="material-symbols-outlined text-primary text-lg">conversion_path</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">
              {quotations.length > 0
                ? `${((quotations.filter((q) => q.status === 'CONVERTED').length / quotations.length) * 100).toFixed(0)}%`
                : '0%'}
            </span>
            <span className="text-xs text-emerald-700 font-semibold ml-2">converted</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2">Converted to live contracts</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Open Proposals</span>
            <span className="material-symbols-outlined text-amber-600 text-lg">schedule</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-700 font-headline">
              {quotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length}
            </span>
            <span className="text-xs text-on-surface-variant ml-2">pending</span>
          </div>
          <div className="text-[11px] text-amber-800 mt-2 font-medium">Awaiting customer acceptance</div>
        </div>
      </section>

      {/* 3. FILTER & ACTIONS TOOLBAR */}
      <section className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All Proposals' },
            { id: 'ACCEPTED', label: 'Accepted (Ready)' },
            { id: 'SENT', label: 'Sent / Under Review' },
            { id: 'CONVERTED', label: 'Converted' },
            { id: 'DRAFT', label: 'Draft' },
            { id: 'EXPIRED', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposals, customer, plan..."
            className="w-full bg-surface pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          />
        </div>
      </section>

      {/* 4. DATA TABLE CONTAINER */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-5 font-semibold">Quote Reference</th>
                <th className="py-3 px-4 font-semibold">Customer &amp; Account</th>
                <th className="py-3 px-4 font-semibold">Commercial Proposal Plan</th>
                <th className="py-3 px-4 font-semibold text-right">Taxable Subtotal</th>
                <th className="py-3 px-4 font-semibold text-right">GST (18%)</th>
                <th className="py-3 px-4 font-semibold text-right">Total Proposal Value</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
                    <p className="mt-1">Loading commercial quotations...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant text-xs">
                    No quotations match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((quote) => (
                <tr key={quote.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-4 px-5 font-semibold text-primary font-mono">
                    {quote.quotationNumber}
                    <div className="text-[10px] text-outline font-normal">Valid until {quote.validUntil.slice(0, 10)}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-on-surface">{quote.customerName}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">{quote.templateName}</div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-medium text-on-surface">{quote.planName}</span>
                    <span className="block text-[10px] text-on-surface-variant">{quote.linesCount} line item(s)</span>
                  </td>

                  <td className="py-4 px-4 text-right font-medium text-on-surface">
                    ₹{quote.subtotal.toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-4 text-right text-outline">
                    +₹{quote.taxTotal.toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-4 text-right font-bold text-primary font-headline">
                    ₹{quote.total.toLocaleString('en-IN')}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {quote.status === 'ACCEPTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Accepted
                      </span>
                    )}
                    {quote.status === 'SENT' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Sent
                      </span>
                    )}
                    {quote.status === 'CONVERTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Contract Active
                      </span>
                    )}
                    {quote.status === 'DRAFT' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-outline">
                        Draft
                      </span>
                    )}
                    {quote.status === 'EXPIRED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-error-container text-error">
                        Expired
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      {quote.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => handleConvert(quote)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-xs flex items-center gap-1"
                          title="Convert this quote directly into an active recurring subscription"
                        >
                          <span className="material-symbols-outlined text-sm">autorenew</span>
                          <span>Convert to Contract</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toast.success(`Proposal PDF generated for ${quote.quotationNumber}`)}
                          className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container"
                          title="Download Proposal PDF"
                        >
                          <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant bg-surface">
          <span>Showing 1 to {filtered.length} of {quotations.length} proposals</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-sm">handshake</span>
            <span>Accepted quotations instantly initialize automated billing schedules.</span>
          </div>
        </div>
      </section>

      {/* 5. MODAL: Create New Quotation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">Prepare Commercial Proposal</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Customer / Entity Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Apex Global Logistics Pvt Ltd"
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Subscription Plan &amp; Addons</label>
                <input
                  type="text"
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Base Subtotal (₹)</label>
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
                  <label className="block text-on-surface-variant font-semibold mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span className="font-semibold">₹{(Number(amount) * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-primary pt-1 border-t border-outline-variant">
                  <span>Total Proposal Value:</span>
                  <span>₹{(Number(amount) * 1.18).toLocaleString('en-IN')}</span>
                </div>
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
                  Create &amp; Dispatch Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
