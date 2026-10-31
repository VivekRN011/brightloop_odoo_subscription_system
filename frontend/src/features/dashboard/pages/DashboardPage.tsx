import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [chartView, setChartView] = useState<'monthly' | 'weekly'>('monthly');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'past_due' | 'trial'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const subscriptions = [
    {
      id: 'SUB-8941',
      avatar: 'NL',
      avatarBg: 'bg-secondary-container text-primary',
      customer: 'Nexarise Labs',
      email: 'billing@nexarise.io',
      plan: 'Enterprise Annual',
      planNote: 'Auto-renew active',
      amount: '₹2,40,000',
      cadence: '/ year',
      nextBilling: 'Nov 14, 2026',
      status: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      statusDot: 'bg-emerald-600',
    },
    {
      id: 'SUB-8940',
      avatar: 'KT',
      avatarBg: 'bg-surface-container-high text-primary',
      customer: 'Kore Technologies',
      email: 'finance@kore.tech',
      plan: 'Growth Monthly',
      planNote: 'Tier-2 Seat add-on',
      amount: '₹45,000',
      cadence: '/ mo',
      nextBilling: 'Nov 02, 2026',
      status: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      statusDot: 'bg-emerald-600',
    },
    {
      id: 'SUB-8939',
      avatar: 'VL',
      avatarBg: 'bg-error-container text-on-error-container',
      customer: 'Vertex Logistics',
      email: 'accounts@vertexlog.in',
      plan: 'Business Quarterly',
      planNote: 'Retry cycle 2 of 3',
      amount: '₹85,000',
      cadence: '/ qtr',
      nextBilling: 'Oct 28, 2026',
      status: 'Past Due (Grace)',
      statusClass: 'bg-error-container text-error border-error/30',
      statusDot: 'bg-error',
    },
    {
      id: 'SUB-8938',
      avatar: 'FT',
      avatarBg: 'bg-surface-container-high text-primary',
      customer: 'FinTech Matrix India',
      email: 'ops@finmatrix.co',
      plan: 'Starter Monthly',
      planNote: 'Standard base tier',
      amount: '₹32,000',
      cadence: '/ mo',
      nextBilling: 'Nov 08, 2026',
      status: 'Active',
      statusClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      statusDot: 'bg-emerald-600',
    },
    {
      id: 'SUB-8937',
      avatar: 'DC',
      avatarBg: 'bg-secondary-container text-primary',
      customer: 'DataCore Global Labs',
      email: 'billing@datacore.ai',
      plan: 'Enterprise Multi-Year',
      planNote: 'Paused by customer',
      amount: '₹5,10,000',
      cadence: '/ yr',
      nextBilling: 'Dec 01, 2026',
      status: 'Paused',
      statusClass: 'bg-surface-container text-on-surface-variant border-outline-variant',
      statusDot: 'bg-outline',
    },
  ];

  const filtered = subscriptions.filter((s) => {
    const matchesSearch =
      s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'active') return s.status === 'Active';
    if (filterTab === 'past_due') return s.status.includes('Past Due');
    if (filterTab === 'trial') return s.status === 'In Trial';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* 1. Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
            Subscription Operations Overview
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Monitor recurring cash flow, lifecycle churn, and billing health in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant self-start shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-primary" data-icon="calendar_today">
            calendar_today
          </span>
          <span className="font-medium text-on-surface">Oct 1 – Oct 31, 2026</span>
          <span className="text-[10px] text-on-surface-variant">• Updated 4m ago</span>
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
            <span className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">1,428</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="material-symbols-outlined text-[12px]" data-icon="trending_up">
                trending_up
              </span>
              +12%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>vs. last month</span>
            {/* Sparkline SVG */}
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

        {/* Card 2: Monthly Recurring Revenue */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/70 shadow-sm flex flex-col justify-between hover:border-outline transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Monthly Recurring Revenue</span>
            <span className="p-1.5 rounded-md bg-surface-container-low text-primary">
              <span className="material-symbols-outlined text-[18px]" data-icon="payments">
                payments
              </span>
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">₹38,45,200</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="material-symbols-outlined text-[12px]" data-icon="trending_up">
                trending_up
              </span>
              +8.4%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>vs. last month</span>
            {/* Sparkline SVG */}
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

        {/* Card 3: Outstanding Balance */}
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
            <span className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">₹4,12,500</span>
            <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              4.8% of MRR
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="truncate">Reconciling via Auto-debit</span>
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
            <span className="text-2xl font-extrabold font-headline tracking-tight text-error">9 invoices</span>
            <span className="text-[11px] font-bold text-error bg-error-container/60 px-2 py-0.5 rounded-full border border-error/20">
              Action Req.
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-error font-medium">
            <button
              onClick={() => navigate('/app/invoices?status=overdue')}
              className="hover:underline flex items-center gap-1"
            >
              <span>Trigger Smart Dunning Run</span>
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
                Six-month comparison of billed MRR versus settled cash inflow
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

          {/* Stylized SVG Vector Chart */}
          <div className="relative pt-6 pb-2">
            <svg className="w-full h-56" fill="none" preserveAspectRatio="none" viewBox="0 0 600 200">
              {/* Grid Lines */}
              <line stroke="#F3E5E7" strokeDasharray="4 4" x1="0" x2="600" y1="20" y2="20" />
              <line stroke="#F3E5E7" strokeDasharray="4 4" x1="0" x2="600" y1="70" y2="70" />
              <line stroke="#F3E5E7" strokeDasharray="4 4" x1="0" x2="600" y1="120" y2="120" />
              <line stroke="#F3E5E7" strokeWidth="1.5" x1="0" x2="600" y1="170" y2="170" />

              {/* Gradient Fill Under MRR */}
              <defs>
                <linearGradient id="roseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#904E5D" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#904E5D" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path
                d="M 0 140 Q 60 130 120 115 T 240 90 T 360 75 T 480 45 T 600 30 L 600 170 L 0 170 Z"
                fill="url(#roseGradient)"
              />

              {/* Collections Bar Series (Underlay) */}
              <rect fill="#FAD7D9" height="25" opacity="0.8" rx="3" width="22" x="35" y="145" />
              <rect fill="#FAD7D9" height="45" opacity="0.8" rx="3" width="22" x="135" y="125" />
              <rect fill="#FAD7D9" height="65" opacity="0.8" rx="3" width="22" x="235" y="105" />
              <rect fill="#FAD7D9" height="85" opacity="0.8" rx="3" width="22" x="335" y="85" />
              <rect fill="#FAD7D9" height="115" opacity="0.8" rx="3" width="22" x="435" y="55" />
              <rect fill="#FAD7D9" height="130" opacity="0.8" rx="3" width="22" x="535" y="40" />

              {/* MRR Spline Curve */}
              <path
                d="M 0 140 Q 60 130 120 115 T 240 90 T 360 75 T 480 45 T 600 30"
                stroke="#743746"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Node Markers */}
              <circle cx="120" cy="115" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />
              <circle cx="240" cy="90" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />
              <circle cx="360" cy="75" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />
              <circle cx="480" cy="45" fill="#FFFFFF" r="4" stroke="#743746" strokeWidth="2.5" />

              {/* Tooltip Highlight Marker on Oct */}
              <circle cx="600" cy="30" fill="#743746" r="6" stroke="#FFFFFF" strokeWidth="3" />
            </svg>

            {/* Chart X Axis Labels */}
            <div className="flex justify-between text-[11px] text-on-surface-variant font-medium pt-2 px-2">
              <span>May 2026</span>
              <span>Jun 2026</span>
              <span>Jul 2026</span>
              <span>Aug 2026</span>
              <span>Sep 2026</span>
              <span className="font-bold text-primary">Oct 2026 (Peak)</span>
            </div>
          </div>

          {/* Chart Footer Metrics Note */}
          <div className="pt-4 mt-2 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-emerald-800" data-icon="check_circle">
                check_circle
              </span>
              Dunning recovery rate averaged 94.2% over Q3.
            </span>
            <button
              onClick={() => navigate('/app/reports')}
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1 self-start"
            >
              <span>Deep-dive cohort analysis</span>
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
              <span className="text-[11px] text-on-surface-variant font-medium">Total: 1,830</span>
            </div>

            {/* Circular representation with SVG donut */}
            <div className="my-5 flex flex-col items-center justify-center relative">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Circle */}
                <path
                  className="text-surface-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                {/* Active: 78% */}
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="78, 100"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                {/* Trialing: 11% offset */}
                <path
                  className="text-primary-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="11, 100"
                  strokeDashoffset="-78"
                  strokeWidth="4"
                />
                {/* Past Due: 7% offset */}
                <path
                  className="text-error"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="7, 100"
                  strokeDashoffset="-89"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold font-headline text-on-surface">78%</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Active Rate</span>
              </div>
            </div>

            {/* Detailed Segment List */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-on-surface font-medium">Active Accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">1,428</span>
                  <span className="text-on-surface-variant text-[11px]">(78%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                  <span className="text-on-surface font-medium">In Trial Window</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">201</span>
                  <span className="text-on-surface-variant text-[11px]">(11%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                  <span className="text-on-surface font-medium">Past Due / Grace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-error">128</span>
                  <span className="text-on-surface-variant text-[11px]">(7%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                  <span className="text-on-surface font-medium">Canceled / Paused</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">73</span>
                  <span className="text-on-surface-variant text-[11px]">(4%)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              toast.info('Dunning automation policy: 3 retries scheduled via NACH/e-Mandate with 7-day grace period.');
            }}
            className="mt-4 w-full py-2 bg-surface-container-low text-primary text-xs font-semibold rounded-lg border border-outline-variant hover:bg-secondary-container transition-colors"
          >
            Manage Dunning Automation
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
              Live recurring payment contracts across enterprise and mid-market accounts.
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
                All (1,428)
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1 font-medium rounded transition-all ${
                  filterTab === 'active'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterTab('past_due')}
                className={`px-3 py-1 font-medium rounded transition-all ${
                  filterTab === 'past_due'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Past Due (9)
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
                  key={sub.id}
                  onClick={() => navigate(`/app/subscriptions/${sub.id}`)}
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
                        <span className="text-[11px] text-on-surface-variant">{sub.email}</span>
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
                      onClick={() => navigate(`/app/subscriptions/${sub.id}`)}
                      className="px-2.5 py-1 text-xs font-semibold rounded border border-outline-variant text-primary hover:bg-secondary-container transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant bg-surface">
          <span>Showing 1 to {filtered.length} of 1,428 active contracts</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-outline-variant bg-surface-container-lowest text-outline cursor-not-allowed">
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-secondary-container text-on-secondary-container font-semibold">
              1
            </button>
            <button className="px-2.5 py-1 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container">
              2
            </button>
            <button className="px-2.5 py-1 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
