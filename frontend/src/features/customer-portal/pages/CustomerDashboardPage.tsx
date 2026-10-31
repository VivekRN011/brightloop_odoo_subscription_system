import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { InPortalSubscribeModal } from '../components/InPortalSubscribeModal';
import { formatINR, formatDate } from '@/lib/format';
import { toast } from 'sonner';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: summary, isLoading, refetch } = useCustomerSummary();

  const [modalOpen, setModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [seatInput, setSeatInput] = useState(5);

  useEffect(() => {
    const queryProduct = searchParams.get('product');
    const queryPlan = searchParams.get('plan');
    const queryAction = searchParams.get('action');

    if (queryAction === 'subscribe' || queryProduct || queryPlan) {
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleUpdateSeats = () => {
    setIsSeatModalOpen(false);
    toast.success(`Successfully updated license configuration.`);
  };

  const activeSub = summary?.subscriptions?.find((s) => s.status === 'active') || summary?.subscriptions?.[0];
  const recentInvoices = summary?.recentInvoices || [];
  const totalSubSpend = summary?.subscriptions?.reduce((sum, s) => sum + (s.price || 0), 0) || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* 1. Page Welcome & Status Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                Subscriber Workspace
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Active RBI e-Mandate
              </span>
            </div>
            <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
              Welcome back, {isLoading ? 'Subscriber' : summary?.profile?.name || user?.name || 'Valued Subscriber'}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {summary?.profile?.companyName || user?.companyName || 'Corporate Entity'} • Customer ID: #{summary?.profile?.customerCode || 'CUST-0001'} • GSTIN: {summary?.profile?.gstin || 'Not Registered'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                refetch();
                toast.success('Synchronized subscriber workspace data with live billing engine.');
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">sync</span>
              <span>Sync Account</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ New Subscription</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Clean Summary Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Active Contracts</span>
            <span className="material-symbols-outlined text-primary text-lg">autorenew</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">
              {summary?.activeSubscriptionsCount ?? (summary?.subscriptions?.filter((s) => s.status === 'active').length ?? 0)}
            </span>
            <span className="text-xs text-emerald-700 font-semibold ml-2">Active</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2">
            {activeSub ? activeSub.planName : 'No active contract'}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Recurring Commitment</span>
            <span className="material-symbols-outlined text-primary text-lg">payments</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-primary font-headline">
              {formatINR(totalSubSpend)}
            </span>
            <span className="text-xs text-on-surface-variant ml-1">/ cycle</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">Active recurring software tiers</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Next Renewal</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">
              {summary?.nextRenewalDate ? formatDate(summary.nextRenewalDate) : 'None scheduled'}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">Auto-renewal enabled</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Outstanding Balance</span>
            <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-700 font-headline">
              {formatINR(summary?.totalOutstandingAmount || 0)}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">
            {(summary?.totalOutstandingAmount || 0) === 0 ? 'All invoices settled in full' : 'Pending payment'}
          </div>
        </div>
      </section>

      {/* 3. Split Workspace Layout (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 65% width (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Plan Details Card */}
          {activeSub ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Active Contract #{activeSub.subscriptionNumber}
                  </span>
                  <h2 className="text-xl font-bold font-headline text-on-surface mt-0.5">
                    {activeSub.productName} • {activeSub.planName}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Active Contract • {activeSub.billingInterval} Cadence
                </span>
              </div>

              {/* Cost Breakdown Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-low text-xs">
                <div>
                  <span className="text-outline text-[11px] block">Base Rate</span>
                  <span className="font-bold text-on-surface text-sm">{formatINR(activeSub.price)}</span>
                  <span className="text-[10px] text-outline block">/ {activeSub.billingInterval.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-outline text-[11px] block">Licenses Provisioned</span>
                  <span className="font-bold text-on-surface text-sm">{activeSub.quantity} User{activeSub.quantity > 1 ? 's' : ''}</span>
                  <span className="text-[10px] text-outline block">Active seats</span>
                </div>
                <div>
                  <span className="text-outline text-[11px] block">Indian GST (18%)</span>
                  <span className="font-bold text-on-surface text-sm">{formatINR(activeSub.price * 0.18)}</span>
                  <span className="text-[10px] text-outline block">CGST + SGST (9%+9%)</span>
                </div>
                <div>
                  <span className="text-outline text-[11px] block">Total per Cadence</span>
                  <span className="font-bold text-primary text-sm">{formatINR(activeSub.price * 1.18)}</span>
                  <span className="text-[10px] text-outline block">Tax Inclusive</span>
                </div>
              </div>

              {/* Plan Capabilities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-on-surface">
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-outline-variant/60">
                  <span className="material-symbols-outlined text-primary text-base">group</span>
                  <span>{activeSub.quantity} User Licenses</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-outline-variant/60">
                  <span className="material-symbols-outlined text-primary text-base">speed</span>
                  <span>99.9% Uptime SLA</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-outline-variant/60">
                  <span className="material-symbols-outlined text-primary text-base">support_agent</span>
                  <span>Dedicated Support</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-outline-variant flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={() => setIsSeatModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  <span>Modify / Add Seats</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to="/portal/catalog"
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Browse Add-on Services
                  </Link>
                  <Link
                    to={`/portal/subscriptions/${activeSub.id}`}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Contract Details
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">layers</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">No Active Subscriptions</h3>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1">
                  You currently do not have any active subscriptions. Explore our product catalog to subscribe to software platforms and add-on services.
                </p>
              </div>
              <Link
                to="/portal/catalog"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all"
              >
                <span>Browse Products &amp; Services</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* Recent Invoices & Tax Receipts Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-headline text-on-surface">Recent Invoices &amp; Tax Receipts</h2>
                <p className="text-xs text-on-surface-variant">Tax invoices compliant with Indian GST &amp; CBIC standards.</p>
              </div>
              <Link to="/portal/invoices" className="text-xs font-semibold text-primary hover:underline">
                View All Invoices
              </Link>
            </div>

            <div className="overflow-x-auto">
              {recentInvoices.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <th className="py-3 px-5">Invoice #</th>
                      <th className="py-3 px-4">Invoice Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-4 px-5 font-semibold text-primary font-mono">{inv.invoiceNumber}</td>
                        <td className="py-4 px-4 text-on-surface">{inv.issueDate ? formatDate(inv.issueDate) : '-'}</td>
                        <td className="py-4 px-4 text-on-surface-variant">{inv.dueDate ? formatDate(inv.dueDate) : '-'}</td>
                        <td className="py-4 px-4 text-right font-bold text-on-surface font-headline">{formatINR(inv.totalAmount)}</td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-600' : 'bg-amber-600'}`}
                            ></span>
                            {inv.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Link
                            to={`/portal/invoices/${inv.id}`}
                            className="px-2.5 py-1 text-xs font-semibold rounded border border-outline-variant hover:bg-surface-container text-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-on-surface-variant">
                  No invoices generated yet. Subscribe to a product from the catalog to generate an invoice.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 35% width (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Payment Mandate Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-sm font-bold text-on-surface">Active Payment Mandate</h3>
              <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>
            <div className="flex items-start gap-3 pt-1">
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-xl">account_balance</span>
              </div>
              <div>
                <div className="font-bold text-on-surface text-xs">Online Razorpay / Bank Debit</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Automated settlement gateway</div>
                <div className="text-[11px] text-outline font-mono mt-1">Status: Active &amp; Verified</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Currency:</span>
                <span className="font-semibold text-on-surface">INR (Indian Rupee)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Settlement Rail:</span>
                <span className="font-semibold text-on-surface">Razorpay UPI &amp; Cards</span>
              </div>
            </div>
            <Link
              to="/portal/payments"
              className="w-full py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors text-center block"
            >
              View Payment History
            </Link>
          </div>

          {/* GST Details & Compliance Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-sm font-bold text-on-surface">GST Details &amp; Compliance</h3>
              <span className="material-symbols-outlined text-outline text-base">receipt_long</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-outline text-[11px] block">Corporate Legal Entity</span>
                <span className="font-bold text-on-surface">{summary?.profile?.companyName || user?.companyName || 'Corporate Entity'}</span>
              </div>
              <div>
                <span className="text-outline text-[11px] block">GSTIN / Tax ID</span>
                <span className="font-mono font-bold text-primary">{summary?.profile?.gstin || 'Not Registered'}</span>
              </div>
              <div>
                <span className="text-outline text-[11px] block">Place of Supply</span>
                <span className="font-medium text-on-surface">
                  {summary?.profile?.state || 'Maharashtra'} • {summary?.profile?.state === 'Maharashtra' ? 'Intra-State (CGST 9% + SGST 9%)' : 'Inter-State (IGST 18%)'}
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated Account Support Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-sm font-bold text-on-surface">Dedicated Account Support</h3>
              <span className="material-symbols-outlined text-primary text-base">handshake</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-xs shrink-0">
                BL
              </div>
              <div>
                <div className="font-bold text-on-surface text-xs">Brightloop Enterprise Support</div>
                <div className="text-[11px] text-on-surface-variant">SLA Support Desk</div>
                <a href="mailto:support@brightloop.io" className="text-[11px] text-primary hover:underline block mt-0.5">
                  support@brightloop.io
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Modify Seats */}
      {isSeatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">Adjust Allocated User Licenses</h3>
              <button
                onClick={() => setIsSeatModalOpen(false)}
                className="text-outline hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>
            <div className="py-2 space-y-3 text-center">
              <p className="text-on-surface-variant">Current licenses configured. Modify provisioned seats:</p>
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setSeatInput((s) => Math.max(1, s - 1))}
                  className="w-10 h-10 rounded-lg border border-outline font-bold text-lg hover:bg-surface-container"
                >
                  -
                </button>
                <div>
                  <span className="text-3xl font-extrabold text-primary font-headline">{seatInput}</span>
                  <div className="text-[10px] text-outline uppercase font-semibold">User Licenses</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSeatInput((s) => s + 1)}
                  className="w-10 h-10 rounded-lg border border-outline font-bold text-lg hover:bg-surface-container"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setIsSeatModalOpen(false)}
                className="px-4 py-2 font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateSeats}
                className="px-4 py-2 font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Portal Subscribe Modal */}
      <InPortalSubscribeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProductId={undefined}
        initialPlanCode={undefined}
        onSuccess={() => {
          refetch();
          toast.success('Subscription configured successfully.');
        }}
      />
    </div>
  );
};
