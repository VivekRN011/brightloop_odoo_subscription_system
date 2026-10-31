import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDashboardData } from '../hooks/useDashboard';
import { subscriptionService } from '@/features/subscriptions/services/subscription.service';
import { formatINR } from '@/lib/format';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [chartView, setChartView] = useState<'monthly' | 'weekly'>('monthly');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'past_due' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch live metrics from real database analytics API
  const { data: dashboardData } = useDashboardData();

  // 2. Fetch live subscriptions from real database
  const { data: rawSubscriptions = [], isLoading: isSubsLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', 'dashboard'],
    queryFn: () => subscriptionService.getSubscriptions(),
    staleTime: 30 * 1000,
  });

  const subscriptions = rawSubscriptions.map((s, idx) => {
    const initials = s.customerName
      ? s.customerName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'AC';

    const bgPalettes = [
      'bg-secondary-container text-primary',
      'bg-surface-container-high text-primary',
      'bg-emerald-50 text-emerald-800',
      'bg-indigo-50 text-indigo-800',
    ];

    let statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    let statusDot = 'bg-emerald-600';
    if (s.status === 'PAUSED') {
      statusClass = 'bg-amber-50 text-amber-800 border-amber-200';
      statusDot = 'bg-amber-600';
    } else if (s.status === 'CLOSED') {
      statusClass = 'bg-slate-100 text-slate-800 border-slate-200';
      statusDot = 'bg-slate-500';
    } else if (s.status === 'DRAFT' || s.status === 'CONFIRMED') {
      statusClass = 'bg-blue-50 text-blue-800 border-blue-200';
      statusDot = 'bg-blue-600';
    }

    return {
      id: s.subscriptionNumber || s.id,
      realId: s.id,
      avatar: initials,
      avatarBg: bgPalettes[idx % bgPalettes.length],
      customer: s.customerName,
      code: s.customerCode || 'CORPORATE',
      plan: s.planName,
      planNote: `${s.quantity} seat${s.quantity > 1 ? 's' : ''} • Auto-renew active`,
      amount: formatINR(s.amount),
      cadence: `/ ${s.billingFrequency ? s.billingFrequency.toLowerCase() : 'mo'}`,
      nextBilling: s.nextBillingAt ? new Date(s.nextBillingAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Continuous',
      status: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
      rawStatus: s.status,
      statusClass,
      statusDot,
    };
  });

  const filtered = subscriptions.filter((s) => {
    const matchesSearch =
      s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'active') return s.rawStatus === 'ACTIVE';
    if (filterTab === 'paused') return s.rawStatus === 'PAUSED';
    if (filterTab === 'past_due') return s.rawStatus === 'PAUSED' || s.rawStatus === 'CLOSED';
    return true;
  });

  // KPI Metrics with safe real-time values
  const activeSubsCount = dashboardData?.metrics.activeSubscriptions.value ?? subscriptions.filter(s => s.rawStatus === 'ACTIVE').length;
  const mrrFormatted = dashboardData?.metrics.revenueReceived.formattedValue ?? '₹0';
  const outstandingFormatted = dashboardData?.metrics.outstandingAmount.formattedValue ?? '₹0';
  const overdueFormatted = dashboardData?.metrics.overdueInvoices.formattedValue ?? '0 Invoices';
  const overdueCount = dashboardData?.metrics.overdueInvoices.value ?? 0;

  // Breakdown percentages
  const totalSubs = subscriptions.length || 1;
  const activeCount = subscriptions.filter(s => s.rawStatus === 'ACTIVE').length;
  const pausedCount = subscriptions.filter(s => s.rawStatus === 'PAUSED').length;
  const closedCount = subscriptions.filter(s => s.rawStatus === 'CLOSED').length;
  const draftCount = subscriptions.filter(s => s.rawStatus === 'DRAFT' || s.rawStatus === 'CONFIRMED').length;

  const activePct = Math.round((activeCount / totalSubs) * 100);
  const pausedPct = Math.round((pausedCount / totalSubs) * 100);
  const closedPct = Math.round((closedCount / totalSubs) * 100);
  const draftPct = Math.round((draftCount / totalSubs) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* 1. Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
            Subscription Operations Overview
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Monitor live recurring cash flow, lifecycle churn, and billing health in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant self-start shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-primary" data-icon="calendar_today">
            calendar_today
          </span>
          <span className="font-medium text-on-surface">Real-Time Database Feed</span>
          <span className="text-[10px] text-on-surface-variant">• Live Synced</span>
        </div>
      </div>

      {/* 2. KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscriptions */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Active Subscriptions</span>
            <span className="p-1.5 rounded-md bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]" data-icon="autorenew">
                autorenew
              </span>
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">
              {activeSubsCount}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="material-symbols-outlined text-[12px]" data-icon="trending_up">
                trending_up
              </span>
              Active
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Live contracts</span>
            <svg className="w-16 h-5" fill="none" viewBox="0 0 64 20">
              <path
                d="M 1 18 Q 12 15 20 12 T 38 9 T 52 4 T 63 2"
                stroke="#10b981"
                strokeLinecap="round"
                strokeWidth="1.75"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Revenue Received / Settled */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Revenue Received</span>
            <span className="p-1.5 rounded-md bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]" data-icon="payments">
                payments
              </span>
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">
              {mrrFormatted}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="material-symbols-outlined text-[12px]" data-icon="trending_up">
                trending_up
              </span>
              Settled
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Verified collections</span>
            <svg className="w-16 h-5" fill="none" viewBox="0 0 64 20">
              <path
                d="M 1 17 Q 14 14 24 10 T 42 7 T 54 4 T 63 2"
                stroke="#743746"
                strokeLinecap="round"
                strokeWidth="1.75"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Outstanding Collections */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Outstanding Collections</span>
            <span className="p-1.5 rounded-md bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]" data-icon="account_balance_wallet">
                account_balance_wallet
              </span>
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">
              {outstandingFormatted}
            </span>
            <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="truncate">Unsettled invoices</span>
            <span className="material-symbols-outlined text-[16px] text-outline" data-icon="sync">
              sync
            </span>
          </div>
        </div>

        {/* Card 4: Overdue Invoices */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Overdue Invoices</span>
            <span className="p-1.5 rounded-md bg-error-container text-error">
              <span className="material-symbols-outlined text-[18px]" data-icon="warning">
                warning
              </span>
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-headline tracking-tight text-error">
              {overdueFormatted}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${overdueCount > 0 ? 'text-error bg-error-container/60 border-error/20' : 'text-emerald-800 bg-emerald-50 border-emerald-200'}`}>
              {overdueCount > 0 ? 'Action Req.' : 'Clear'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-error font-medium">
            <button
              onClick={() => navigate('/app/invoices')}
              className="hover:underline flex items-center gap-1"
            >
              <span>View Unpaid Invoices</span>
              <span className="material-symbols-outlined text-[12px]" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart Card (65% -> 8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/70 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">Revenue &amp; Invoicing Trend</h3>
              <p className="text-xs text-on-surface-variant">
                Comparison of invoiced total versus settled cash inflow
              </p>
            </div>
            {/* Toggles */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-xs mr-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-primary"></span>
                  <span className="text-on-surface-variant text-[11px] font-medium">Billed MRR</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-secondary-container border border-primary/20"></span>
                  <span className="text-on-surface-variant text-[11px] font-medium">Collections</span>
                </div>
              </div>
              <div className="flex bg-surface-container rounded-lg p-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => setChartView('monthly')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartView === 'monthly'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setChartView('weekly')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartView === 'weekly'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>

          {/* Stylized Vector Chart */}
          <div className="relative pt-6 pb-2">
            <svg className="w-full h-56" fill="none" preserveAspectRatio="none" viewBox="0 0 600 200">
              <line stroke="#F3E5E7" strokeDasharray="4 4" x1="0" x2="600" y1="20" y2="20" />
              <line stroke="#F3E5E7" strokeDasharray="4 4" x1="0" x2="600" y1="70" y2="70" />
              <line stroke="#F3E5E7" strokeDasharray="4 4" x1="0" x2="600" y1="120" y2="120" />
              <line stroke="#F3E5E7" strokeWidth="1.5" x1="0" x2="600" y1="170" y2="170" />

              <defs>
                <linearGradient id="roseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#904E5D" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#904E5D" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 0 140 Q 60 130 120 115 T 240 90 T 360 75 T 480 45 T 600 30 L 600 170 L 0 170 Z"
                fill="url(#roseGradient)"
              />

              <rect fill="#FAD7D9" height="25" opacity="0.8" rx="3" width="22" x="35" y="145" />
              <rect fill="#FAD7D9" height="45" opacity="0.8" rx="3" width="22" x="135" y="125" />
              <rect fill="#FAD7D9" height="65" opacity="0.8" rx="3" width="22" x="235" y="105" />
              <rect fill="#FAD7D9" height="85" opacity="0.8" rx="3" width="22" x="335" y="85" />
              <rect fill="#FAD7D9" height="115" opacity="0.8" rx="3" width="22" x="435" y="55" />
              <rect fill="#FAD7D9" height="130" opacity="0.8" rx="3" width="22" x="535" y="40" />

              <path
                d="M 0 140 Q 60 130 120 115 T 240 90 T 360 75 T 480 45 T 600 30"
                stroke="#743746"
                strokeLinecap="round"
                strokeWidth="3"
              />

              <circle cx="120" cy="115" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />
              <circle cx="240" cy="90" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />
              <circle cx="360" cy="75" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />
              <circle cx="480" cy="45" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />
              <circle cx="600" cy="30" fill="#743746" r="6" stroke="#FFFFFF" strokeWidth="3" />
            </svg>

            <div className="flex justify-between text-[11px] text-on-surface-variant font-medium pt-2 px-2">
              <span>May 2026</span>
              <span>Jun 2026</span>
              <span>Jul 2026</span>
              <span>Aug 2026</span>
              <span>Sep 2026</span>
              <span className="font-bold text-primary">Current Cycle</span>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-800" data-icon="check_circle">
                check_circle
              </span>
              Connected to Razorpay Gateway &amp; Automated Bank Allocations.
            </span>
            <button
              onClick={() => navigate('/app/invoices')}
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1 self-start"
            >
              <span>Manage Invoices</span>
              <span className="material-symbols-outlined text-[13px]" data-icon="arrow_forward">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Right Status Distribution Card (35% -> 4 cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <h3 className="font-headline font-bold text-base text-on-surface">Lifecycle Breakdown</h3>
              <span className="text-[11px] text-on-surface-variant font-medium">Total: {subscriptions.length}</span>
            </div>

            {/* Circular representation */}
            <div className="my-5 flex flex-col items-center justify-center relative">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${activePct}, 100`}
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold font-headline text-on-surface">{activePct}%</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Active Rate</span>
              </div>
            </div>

            {/* Dynamic Segment List from Real Database */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-on-surface font-medium">Active Accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">{activeCount}</span>
                  <span className="text-on-surface-variant text-[11px]">({activePct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-on-surface font-medium">Paused</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">{pausedCount}</span>
                  <span className="text-on-surface-variant text-[11px]">({pausedPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-on-surface font-medium">Draft / Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">{draftCount}</span>
                  <span className="text-on-surface-variant text-[11px]">({draftPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-on-surface font-medium">Closed / Expired</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">{closedCount}</span>
                  <span className="text-on-surface-variant text-[11px]">({closedPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/subscriptions')}
            className="mt-4 w-full py-2 bg-surface-container-low text-primary text-xs font-semibold rounded-lg border border-outline-variant hover:bg-secondary-container transition-colors"
          >
            Manage All Subscriptions
          </button>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: RECENT SUBSCRIPTION ACTIVITY DATA TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/70 shadow-sm overflow-hidden flex flex-col">
        {/* Table Controls Header */}
        <div className="p-5 border-b border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline font-bold text-base text-on-surface">Recent Subscription Activity</h2>
            <p className="text-xs text-on-surface-variant">
              Live recurring contracts queried in real time from database.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant text-xs">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 font-semibold rounded transition-all ${
                  filterTab === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All ({subscriptions.length})
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1 font-medium rounded transition-all ${
                  filterTab === 'active'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilterTab('paused')}
                className={`px-3 py-1 font-medium rounded transition-all ${
                  filterTab === 'paused'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Paused ({pausedCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscriptions..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                search
              </span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">
              {isSubsLoading ? 'Loading subscriptions from database...' : 'No subscriptions found matching your query.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5" scope="col">
                    Subscription ID
                  </th>
                  <th className="py-3 px-5" scope="col">
                    Customer &amp; Account
                  </th>
                  <th className="py-3 px-5" scope="col">
                    Billing Plan
                  </th>
                  <th className="py-3 px-5" scope="col">
                    Recurring Amount
                  </th>
                  <th className="py-3 px-5" scope="col">
                    Next Billing
                  </th>
                  <th className="py-3 px-5" scope="col">
                    Status
                  </th>
                  <th className="py-3 px-5 text-right" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((sub) => (
                  <tr
                    key={sub.realId}
                    onClick={() => navigate(`/app/subscriptions/${sub.realId}`)}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 font-semibold font-headline text-primary hover:underline">
                      #{sub.id}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full ${sub.avatarBg} flex items-center justify-center font-bold text-xs`}
                        >
                          {sub.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface">{sub.customer}</span>
                          <span className="text-[11px] text-on-surface-variant font-mono">{sub.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-medium text-on-surface">{sub.plan}</span>
                      <span className="block text-[11px] text-on-surface-variant">{sub.planNote}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-on-surface font-headline">{sub.amount}</span>
                      <span className="text-on-surface-variant text-[11px]">{sub.cadence}</span>
                    </td>
                    <td className="py-4 px-5 text-on-surface-variant">{sub.nextBilling}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sub.statusClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.statusDot}`}></span>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/app/subscriptions/${sub.realId}`)}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-outline-variant text-primary hover:bg-secondary-container transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant bg-surface">
          <span>Showing {filtered.length} of {subscriptions.length} contracts in database</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/app/subscriptions')}
              className="px-3 py-1 rounded border border-outline-variant bg-surface-container-lowest text-primary font-semibold hover:bg-secondary-container"
            >
              View All Subscriptions &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
