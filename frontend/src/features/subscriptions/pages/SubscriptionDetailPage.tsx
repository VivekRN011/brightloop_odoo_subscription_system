import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const SubscriptionDetailPage: React.FC = () => {
  const { id = 'SUB-8941' } = useParams();
  const navigate = useNavigate();

  // Interactive states
  const [activeTab, setActiveTab] = useState<'invoices' | 'addons' | 'payment' | 'audit'>('invoices');
  const [status, setStatus] = useState<'Active' | 'Paused' | 'Closed'>('Active');
  const allocatedSeats = 25;
  const [extraSeats, setExtraSeats] = useState<number>(5);
  const [isAddingSeats, setIsAddingSeats] = useState<boolean>(false);
  const [newSeatsInput, setNewSeatsInput] = useState<number>(5);
  const [filterStatus, setFilterStatus] = useState<string>('All Statuses');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);

  // Financial calculations
  const basePrice = 240000;
  const addonPerSeat = 4800;
  const addonPrice = extraSeats * addonPerSeat;
  const subtotal = basePrice + addonPrice;
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const totalRecurring = subtotal + cgst + sgst;

  const handleTogglePause = () => {
    if (status === 'Active') {
      setStatus('Paused');
      toast.warning(`Subscription ${id} is now Paused. Automated billing runs suspended.`);
    } else {
      setStatus('Active');
      toast.success(`Subscription ${id} has been Resumed to Active status.`);
    }
  };

  const handleGenerateInvoice = () => {
    toast.success(`Immediate billing invoice INV-2026-1049 generated for ₹${totalRecurring.toLocaleString('en-IN')}`);
  };

  const handleSaveSeats = () => {
    setExtraSeats(newSeatsInput);
    setIsAddingSeats(false);
    toast.success(`Allocated extra licenses updated to ${newSeatsInput} seats.`);
  };

  const invoices = [
    {
      id: 'INV-2026-1048',
      date: 'Oct 14, 2026',
      period: 'Oct 14, 2026 – Oct 13, 2027',
      total: '₹2,83,200',
      paid: '₹2,83,200',
      status: 'Paid',
    },
    {
      id: 'INV-2025-0812',
      date: 'Oct 14, 2025',
      period: 'Oct 14, 2025 – Oct 13, 2026',
      total: '₹2,83,200',
      paid: '₹2,83,200',
      status: 'Paid',
    },
    {
      id: 'INV-2024-0391',
      date: 'Oct 14, 2024',
      period: 'Oct 14, 2024 – Oct 13, 2025',
      total: '₹2,83,200',
      paid: '₹2,83,200',
      status: 'Paid',
    },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === 'Paid Only') return inv.status === 'Paid';
    if (filterStatus === 'Pending') return inv.status === 'Pending';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/app/subscriptions" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Subscriptions
          </Link>
          <span>/</span>
          <span className="text-on-surface font-semibold">{id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-outline font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            GSTN &amp; IRN Verified
          </span>
        </div>
      </div>

      {/* 1. SCREEN HEADER */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
              <span className="font-headline text-lg font-bold tracking-tight text-on-surface">{id}</span>

              {/* Status Pill */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  status === 'Active'
                    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                    : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                {status}
              </span>

              {/* Auto Renew Indicator */}
              <button
                type="button"
                onClick={() => {
                  setAutoRenew(!autoRenew);
                  toast.info(`Auto-renew ${!autoRenew ? 'enabled' : 'disabled'}`);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${autoRenew ? 'bg-emerald-500' : 'bg-outline'}`}></span>
                {autoRenew ? 'Auto-renew enabled' : 'Auto-renew off'}
              </button>

              <span className="text-xs text-outline font-normal">Created on Oct 14, 2024</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline">
              Nexarise Enterprise Platform Contract
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Multi-region deployment cluster • Managed billing entity registered in India
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleTogglePause}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors duration-150 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">
                {status === 'Active' ? 'pause_circle' : 'play_circle'}
              </span>
              <span>{status === 'Active' ? 'Pause Subscription' : 'Resume Subscription'}</span>
            </button>

            <button
              onClick={() => navigate('/app/plans')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors duration-150 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">sync_alt</span>
              <span>Change Plan</span>
            </button>

            <button
              onClick={handleGenerateInvoice}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all duration-150 shadow-sm flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-base fill">bolt</span>
              <span>Generate Immediate Invoice</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. TOP OVERVIEW METRICS (3 COLUMNS) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Plan & Frequency */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary-container transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Plan &amp; Frequency</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container">
              TIER 3
            </span>
          </div>
          <div className="mt-3">
            <h2 className="text-lg font-bold text-on-surface">Enterprise Annual</h2>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface tracking-tight">₹2,40,000</span>
              <span className="text-xs text-on-surface-variant font-medium">/ year</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">event_repeat</span>
              Billed annually on Oct 14
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
            <span className="text-outline">Includes {allocatedSeats} user seats</span>
            <button
              onClick={() => {
                setActiveTab('addons');
                setIsAddingSeats(true);
              }}
              className="text-primary font-semibold hover:underline"
            >
              Manage Add-ons
            </button>
          </div>
        </div>

        {/* Card 2: Customer & Billing Contact */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary-container transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Customer &amp; Contact</span>
            <span className="material-symbols-outlined text-outline text-lg">corporate_fare</span>
          </div>
          <div className="mt-3">
            <h2 className="text-base font-bold text-on-surface truncate">Nexarise Technologies Pvt Ltd</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Key Contact: <span className="text-on-surface font-semibold">Arjun Nair</span>
            </p>
            <p className="text-xs text-primary font-medium mt-1 truncate hover:underline cursor-pointer">billing@nexarise.io</p>
            <div className="mt-2.5 inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/70">
              GSTIN: 27AABCN1234F1Z8
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
            <span className="text-outline">Tax Location: Maharashtra (27)</span>
            <Link to="/app/customers" className="text-primary font-semibold hover:underline">
              View Client CRM
            </Link>
          </div>
        </div>

        {/* Card 3: Next Billing & Renewal */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:border-primary-container transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Next Billing &amp; Renewal</span>
            <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-on-surface">Oct 14, 2027</h2>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">In 238 days</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-on-surface tracking-tight">₹2,83,200</span>
              <span className="text-xs text-on-surface-variant">(incl. 18% GST)</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-outline">credit_card</span>
              HDFC Bank Auto-Debit (•••• 4921)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
            <span className="text-outline">Mandate ID: NACH-9920148</span>
            <button onClick={() => setActiveTab('payment')} className="text-primary font-semibold hover:underline">
              Update Payment
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT SPLIT LAYOUT (2/3 Left Content, 1/3 Right Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT SECTION (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Detail Navigation Tabs */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center border-b border-outline-variant px-6 pt-2 bg-surface overflow-x-auto">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-3 px-4 text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === 'invoices'
                    ? 'font-bold text-primary border-b-2 border-primary -mb-px'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                Invoice &amp; Payment History
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container">
                  {invoices.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addons')}
                className={`py-3 px-4 text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === 'addons'
                    ? 'font-bold text-primary border-b-2 border-primary -mb-px'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">extension</span>
                Plan &amp; Add-on Items
              </button>

              <button
                onClick={() => setActiveTab('payment')}
                className={`py-3 px-4 text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === 'payment'
                    ? 'font-bold text-primary border-b-2 border-primary -mb-px'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                Payment Methods
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-4 text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'font-bold text-primary border-b-2 border-primary -mb-px'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">history</span>
                Audit Log
              </button>
            </div>

            {/* TAB CONTENT: Invoices */}
            {activeTab === 'invoices' && (
              <>
                {/* Table Filter Toolbar */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-low border-b border-outline-variant">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-sm">
                        filter_list
                      </span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-8 pr-6 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option>All Statuses</option>
                        <option>Paid Only</option>
                        <option>Pending</option>
                      </select>
                    </div>

                    <div className="relative">
                      <select className="px-3 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary">
                        <option>Fiscal Year 2024–2026</option>
                        <option>Current Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span>Showing {filteredInvoices.length} historical billing cycles</span>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container/60 border-b border-outline-variant text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                        <th className="py-3 px-5">Invoice #</th>
                        <th className="py-3 px-4">Invoice Date</th>
                        <th className="py-3 px-4">Period Covered</th>
                        <th className="py-3 px-4 text-right">Total Amount</th>
                        <th className="py-3 px-4 text-right">Paid Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60 text-xs">
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 px-5 font-semibold text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-outline text-sm">description</span>
                            {inv.id}
                          </td>
                          <td className="py-4 px-4 text-on-surface">{inv.date}</td>
                          <td className="py-4 px-4 text-on-surface-variant">{inv.period}</td>
                          <td className="py-4 px-4 text-right font-semibold text-on-surface">{inv.total}</td>
                          <td className="py-4 px-4 text-right font-medium text-emerald-800">{inv.paid}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => toast.success(`Downloading PDF for ${inv.id}`)}
                                className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
                                title="Download PDF"
                              >
                                <span className="material-symbols-outlined text-lg">download</span>
                              </button>
                              <button
                                onClick={() => toast.info(`Viewing official tax receipt for ${inv.id}`)}
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                Receipt
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="p-4 bg-surface flex items-center justify-between border-t border-outline-variant text-xs text-on-surface-variant">
                  <span>Showing 1 to {filteredInvoices.length} of {filteredInvoices.length} entries</span>
                  <div className="flex items-center gap-1">
                    <button className="px-2.5 py-1 rounded border border-outline-variant bg-surface-container-lowest text-outline cursor-not-allowed">
                      Previous
                    </button>
                    <button className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-semibold">
                      1
                    </button>
                    <button className="px-2.5 py-1 rounded border border-outline-variant bg-surface-container-lowest text-outline cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB CONTENT: Plan & Add-ons */}
            {activeTab === 'addons' && (
              <div className="p-6 space-y-4">
                <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-lowest">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-on-surface">Base License Tier: Enterprise Annual</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-secondary-container text-on-secondary-container">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Allocated user seats: <span className="font-semibold text-on-surface">{allocatedSeats} seats</span> included in base tier.
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Base cost: ₹2,40,000 / year (₹20,000 / month equivalent billed annually)
                  </p>
                </div>

                <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-lowest">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">Provisioned Extra User Licenses</h3>
                      <p className="text-xs text-on-surface-variant">Rate: ₹4,800/yr per seat</p>
                    </div>
                    <span className="text-sm font-bold text-primary">₹{(extraSeats * 4800).toLocaleString('en-IN')}/yr</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-on-surface font-medium">Extra seats currently active:</span>
                    <span className="px-2.5 py-1 bg-surface-container rounded-md font-mono text-xs font-bold text-primary">
                      {extraSeats} seats
                    </span>
                    <button
                      onClick={() => setIsAddingSeats(true)}
                      className="ml-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors"
                    >
                      Modify Seat Allocation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Payment Methods */}
            {activeTab === 'payment' && (
              <div className="p-6 space-y-4">
                <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-lowest flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                      <span className="material-symbols-outlined text-xl">account_balance</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-on-surface">HDFC Bank Auto-Debit (NACH)</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Primary
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">Account ending in •••• 4921 • Mandate ID: NACH-9920148</p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">RBI e-Mandate Active • Max Limit ₹5,00,000</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info('e-Mandate details are managed through corporate banking gateway.')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline hover:bg-surface-container"
                  >
                    View Mandate
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Audit Log */}
            {activeTab === 'audit' && (
              <div className="p-6 space-y-3">
                {[
                  { title: 'Annual Recurring Invoice Generated', time: 'Oct 14, 2026, 00:01 IST', user: 'Automated Billing Bot', ref: 'INV-2026-1048' },
                  { title: 'Payment Collected via HDFC NACH', time: 'Oct 14, 2026, 04:15 IST', user: 'Bank Gateway Webhook', ref: 'TXN-991823' },
                  { title: '5 Extra Seats Provisioned', time: 'Nov 02, 2026, 11:24 IST', user: 'Arjun Mehta (Admin)', ref: 'AM-MOD-01' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-xs">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">history_toggle_off</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-on-surface">{log.title}</span>
                        <span className="text-[11px] text-outline">{log.time}</span>
                      </div>
                      <p className="text-on-surface-variant mt-0.5">Triggered by: {log.user} • Ref: {log.ref}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Add-on summary bento banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-on-surface">Provision Extra Licenses</h3>
                <p className="text-[11px] text-on-surface-variant">
                  Currently {allocatedSeats + extraSeats} allocated • Scalable up to 100 on demand.
                </p>
              </div>
              <button
                onClick={() => setIsAddingSeats(true)}
                className="px-2.5 py-1 text-xs font-semibold text-primary border border-outline-variant rounded-lg hover:bg-surface-container"
              >
                + Add Seats
              </button>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">receipt</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-on-surface">Consolidated Tax Invoicing</h3>
                <p className="text-[11px] text-on-surface-variant">Annual statement certified for Indian GST filing.</p>
              </div>
              <button
                onClick={() => toast.success('Downloaded Consolidated FY Tax Statement (GSTR-1 compliant).')}
                className="px-2.5 py-1 text-xs font-semibold text-on-surface border border-outline-variant rounded-lg hover:bg-surface-container"
              >
                Download FY
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR PANEL (1/3 width) */}
        <div className="space-y-5">
          {/* 1. Billing Breakdown & Tax Summary Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-sm font-bold text-on-surface">Billing Breakdown &amp; Tax</h3>
              <span className="text-[11px] font-mono font-medium text-on-surface-variant">INR (₹)</span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Base Subscription (Annual)</span>
                <span className="font-medium text-on-surface">₹{basePrice.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="flex items-center gap-1">
                  Add-on Seats ({extraSeats} extra)
                  <span className="material-symbols-outlined text-[13px] text-outline" title="₹4,800/yr per seat">
                    info
                  </span>
                </span>
                <span className="font-medium text-on-surface">₹{addonPrice.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between text-on-surface-variant">
                <span>CGST (9.0%)</span>
                <span className="font-medium text-on-surface">₹{cgst.toLocaleString('en-IN')}.00</span>
              </div>

              <div className="flex items-center justify-between text-on-surface-variant">
                <span>SGST (9.0%)</span>
                <span className="font-medium text-on-surface">₹{sgst.toLocaleString('en-IN')}.00</span>
              </div>

              {/* Divider */}
              <div className="pt-3 border-t border-outline-variant"></div>

              {/* Total Recurring */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wide">Total Recurring</span>
                  <p className="text-[10px] text-on-surface-variant">Next invoice scheduled: Oct 14, 2027</p>
                </div>
                <span className="text-xl font-black text-primary tracking-tight">
                  ₹{totalRecurring.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                <span className="text-on-surface font-medium">HSN / SAC Code</span>
              </div>
              <span className="font-mono text-on-surface-variant font-semibold">998313</span>
            </div>
          </div>

          {/* 2. Dunning & Grace Period Policy Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary text-base">policy</span>
              <h3 className="text-sm font-bold text-on-surface">Dunning &amp; Grace Period Policy</h3>
            </div>

            {/* Soft rose callout highlight */}
            <div className="mt-4 p-3.5 rounded-lg bg-secondary-container/60 border border-outline-variant/80">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">notification_important</span>
                <div>
                  <p className="text-xs font-semibold text-primary">7-Day Automatic Grace Period</p>
                  <p className="text-[11px] text-on-secondary-container mt-1 leading-relaxed">
                    Should an automated charge fail, service access continues unabated. Intelligent retries execute on Day 2, 4, and 7.
                  </p>
                </div>
              </div>
            </div>

            <ul className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">check_circle</span>
                <span>Smart Retry Cadence: Multi-rail fallback via alternate card if primary fails.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">check_circle</span>
                <span>Automated Invoice Escalation: Email alerts dispatched to accounts payable on Day 3.</span>
              </li>
            </ul>
          </div>

          {/* 3. Contract Details & SLA Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-sm font-bold text-on-surface">Contract Details &amp; SLA</h3>
              <span className="material-symbols-outlined text-outline text-base">handshake</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Service Level Agreement</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Support Tier</span>
                <span className="font-semibold text-on-surface">Enterprise Dedicated (24/7)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Contract Sign Date</span>
                <span className="font-medium text-on-surface">Oct 14, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Jurisdiction</span>
                <span className="font-medium text-on-surface">Mumbai, India</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-xs">
              <span className="text-outline">Master Agreement v2.4</span>
              <button
                onClick={() => toast.info('Opening master corporate agreement PDF viewer.')}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Contract PDF</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Modify Extra Licenses */}
      {isAddingSeats && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">Provision Extra User Licenses</h3>
              <button
                onClick={() => setIsAddingSeats(false)}
                className="text-outline hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>
            <div className="py-4 space-y-4">
              <p className="text-xs text-on-surface-variant">
                Configure additional team licenses beyond the {allocatedSeats} base seats. Each extra seat adds ₹4,800/yr.
              </p>
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setNewSeatsInput((s) => Math.max(0, s - 1))}
                  className="w-10 h-10 rounded-lg border border-outline flex items-center justify-center text-lg font-bold hover:bg-surface-container"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-primary">{newSeatsInput}</span>
                  <div className="text-[11px] text-on-surface-variant uppercase font-medium">Extra Seats</div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewSeatsInput((s) => s + 1)}
                  className="w-10 h-10 rounded-lg border border-outline flex items-center justify-center text-lg font-bold hover:bg-surface-container"
                >
                  +
                </button>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Extra seats cost:</span>
                  <span className="font-semibold text-on-surface">₹{(newSeatsInput * 4800).toLocaleString('en-IN')}/yr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">GST (18%):</span>
                  <span className="font-semibold text-on-surface">₹{(newSeatsInput * 4800 * 0.18).toLocaleString('en-IN')}/yr</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-outline-variant font-bold text-primary">
                  <span>New Annual Recurring Total:</span>
                  <span>₹{(basePrice + newSeatsInput * 4800 * 1.18).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setIsAddingSeats(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSeats}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
