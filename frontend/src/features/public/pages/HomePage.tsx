import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Users,
  RefreshCw,
  Package,
  FileText,
  Receipt,
  BarChart3,
  Layers,
  FileCheck,
  Search,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();

  // State for interactive elements in the product preview mockup
  const [previewTab, setPreviewTab] = useState<'overview' | 'subscriptions'>('overview');
  const [recentTab, setRecentTab] = useState<'subscriptions' | 'invoices'>('subscriptions');

  // Handle hash scrolling on mount or navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  }, [location]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (role === 'ADMIN') {
        navigate('/app/dashboard');
      } else {
        navigate('/portal/catalog');
      }
    } else {
      navigate('/register');
    }
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className="w-full bg-[#EDEFF4] text-[#040404] font-sans selection:bg-[#2346ED]/15 selection:text-[#2346ED]">
      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E6EE] text-xs font-semibold text-[#040404] mb-8 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2346ED] animate-pulse"></span>
            <span>B2B Subscription Management Workspace</span>
          </div>

          {/* Prominent Hero Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#040404] tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Subscriptions, Simplified.
          </h1>

          {/* Supporting Copy */}
          <p className="mt-5 text-base sm:text-lg text-[#5A6578] max-w-2xl mx-auto leading-relaxed font-normal">
            Manage customers, subscription plans, invoices, and payments from one clear, connected workspace.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2346ED] hover:bg-[#1b37c7] active:bg-[#162fa8] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => handleScrollTo('features')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-[#040404] border border-[#E2E6EE] font-semibold text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Features</span>
            </button>
          </div>

          {/* High-Fidelity Product Preview Mockup */}
          <div className="mt-14 sm:mt-18 w-full max-w-5xl mx-auto text-left">
            <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E2E6EE] shadow-[0_16px_50px_rgba(4,4,4,0.06)] overflow-hidden">
              {/* Window Chrome Header */}
              <div className="border-b border-[#E2E6EE] px-5 py-3.5 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E2E6EE]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E2E6EE]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E2E6EE]"></span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-[#EDEFF4] px-3 py-1 rounded-md text-[11px] font-medium text-[#5A6578]">
                    <Lock size={11} className="text-[#5A6578]" />
                    <span>brightloop.app/workspace/subscriptions</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#2346ED] font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2346ED]"></span>
                    <span>Live Operations Console</span>
                  </span>
                </div>
              </div>

              {/* Mockup Workspace Toolbar */}
              <div className="border-b border-[#E2E6EE] px-5 sm:px-6 py-3 bg-[#FAFBFD] flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewTab('overview')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      previewTab === 'overview'
                        ? 'bg-white text-[#2346ED] shadow-2xs border border-[#E2E6EE]'
                        : 'text-[#5A6578] hover:text-[#040404]'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setPreviewTab('subscriptions')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      previewTab === 'subscriptions'
                        ? 'bg-white text-[#2346ED] shadow-2xs border border-[#E2E6EE]'
                        : 'text-[#5A6578] hover:text-[#040404]'
                    }`}
                  >
                    Subscriptions
                  </button>
                  <span className="hidden md:inline px-3 py-1.5 text-[#A9B6CF] font-medium">Quotations</span>
                  <span className="hidden md:inline px-3 py-1.5 text-[#A9B6CF] font-medium">Invoices</span>
                  <span className="hidden md:inline px-3 py-1.5 text-[#A9B6CF] font-medium">Plans</span>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-2.5 ml-auto">
                  <div className="hidden sm:flex items-center gap-1.5 bg-white border border-[#E2E6EE] rounded-lg px-2.5 py-1 text-[11px] text-[#A9B6CF]">
                    <Search size={12} />
                    <span>Search subscriptions...</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#2346ED] text-white font-semibold text-[11px] shadow-2xs flex items-center gap-1">
                    <span>+ New Subscription</span>
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-5 sm:p-7 space-y-6">
                {/* 4 Metric KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {/* Metric 1 */}
                  <div className="bg-[#EDEFF4]/60 rounded-xl p-4 border border-[#E2E6EE]">
                    <div className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider mb-1">
                      Active Subscriptions
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#040404] tracking-tight">1,428</div>
                    <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">
                        +12% MoM
                      </span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-[#EDEFF4]/60 rounded-xl p-4 border border-[#E2E6EE]">
                    <div className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider mb-1">
                      Monthly Recurring Revenue
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#2346ED] tracking-tight">₹38,45,200</div>
                    <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">
                        +8.4% expansion
                      </span>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-[#EDEFF4]/60 rounded-xl p-4 border border-[#E2E6EE]">
                    <div className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider mb-1">
                      Outstanding Invoices
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#040404] tracking-tight">₹4,12,500</div>
                    <div className="text-[11px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/60">
                        18 pending
                      </span>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-[#EDEFF4]/60 rounded-xl p-4 border border-[#E2E6EE]">
                    <div className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider mb-1">
                      Quote Conversion
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#040404] tracking-tight">84.2%</div>
                    <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200/60">
                        +5.1% this month
                      </span>
                    </div>
                  </div>
                </div>

                {/* Split Visualisation Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left: Revenue Trend Chart */}
                  <div className="lg:col-span-7 bg-[#EDEFF4]/40 rounded-xl p-4 sm:p-5 border border-[#E2E6EE] flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E6EE]">
                      <div>
                        <span className="text-xs font-bold text-[#040404]">Recurring Revenue Trend</span>
                        <p className="text-[10px] text-[#5A6578]">Monthly recognized billing across all active plans</p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#2346ED] bg-white border border-[#E2E6EE] px-2 py-0.5 rounded-md">
                        2026 Fiscal Cycle
                      </span>
                    </div>

                    {/* Chart Canvas */}
                    <div className="py-4">
                      <svg className="w-full h-32 sm:h-36" fill="none" preserveAspectRatio="none" viewBox="0 0 500 120">
                        <defs>
                          <linearGradient id="nextsubChartGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2346ED" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#2346ED" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path
                          d="M 0 95 Q 50 82 100 70 T 200 58 T 300 42 T 400 28 T 500 12 L 500 120 L 0 120 Z"
                          fill="url(#nextsubChartGrad)"
                        />
                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E6EE" strokeDasharray="3 3" />
                        <line x1="0" y1="65" x2="500" y2="65" stroke="#E2E6EE" strokeDasharray="3 3" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#E2E6EE" strokeDasharray="3 3" />
                        {/* Smooth Line */}
                        <path
                          d="M 0 95 Q 50 82 100 70 T 200 58 T 300 42 T 400 28 T 500 12"
                          stroke="#2346ED"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Highlight dot on current month */}
                        <circle cx="500" cy="12" r="5" fill="#2346ED" stroke="#ffffff" strokeWidth="2.5" />
                      </svg>
                      {/* Months */}
                      <div className="flex justify-between text-[10px] text-[#5A6578] pt-2 px-1 font-medium">
                        <span>May (₹28.4L)</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                        <span>Sep</span>
                        <span className="font-bold text-[#2346ED]">Oct (₹38.45L)</span>
                      </div>
                    </div>

                    {/* Cadence Split Bar */}
                    <div className="pt-3 border-t border-[#E2E6EE] flex items-center justify-between text-[11px] text-[#5A6578]">
                      <span>Cadence Mix: Annual (64%) • Monthly (28%) • Quarterly (8%)</span>
                      <span className="font-semibold text-emerald-700">100% Reconciled</span>
                    </div>
                  </div>

                  {/* Right: Subscriptions & Invoices Mini Table */}
                  <div className="lg:col-span-5 bg-[#EDEFF4]/40 rounded-xl p-4 sm:p-5 border border-[#E2E6EE] flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E6EE]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setRecentTab('subscriptions')}
                          className={`text-xs font-bold transition-colors cursor-pointer ${
                            recentTab === 'subscriptions' ? 'text-[#040404]' : 'text-[#A9B6CF]'
                          }`}
                        >
                          Subscriptions
                        </button>
                        <span className="text-[#A9B6CF]">/</span>
                        <button
                          onClick={() => setRecentTab('invoices')}
                          className={`text-xs font-bold transition-colors cursor-pointer ${
                            recentTab === 'invoices' ? 'text-[#040404]' : 'text-[#A9B6CF]'
                          }`}
                        >
                          Invoices
                        </button>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] text-[#2346ED]">
                        Recent
                      </span>
                    </div>

                    <div className="space-y-2.5 py-2 text-xs">
                      {recentTab === 'subscriptions' ? (
                        <>
                          <div className="p-2.5 rounded-lg bg-white border border-[#E2E6EE] flex items-center justify-between shadow-2xs">
                            <div>
                              <div className="font-bold text-[#040404]">Nexarise Labs</div>
                              <span className="font-mono text-[10px] text-[#5A6578]">SUB-8941 • Enterprise Annual</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#040404]">₹2,40,000 / yr</div>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Active
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-[#E2E6EE] flex items-center justify-between shadow-2xs">
                            <div>
                              <div className="font-bold text-[#040404]">Kore Technologies</div>
                              <span className="font-mono text-[10px] text-[#5A6578]">SUB-8940 • Growth Monthly</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#040404]">₹45,000 / mo</div>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Active
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-[#E2E6EE] flex items-center justify-between shadow-2xs">
                            <div>
                              <div className="font-bold text-[#040404]">Vertex Logistics</div>
                              <span className="font-mono text-[10px] text-[#5A6578]">SUB-8939 • Business Quarterly</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#040404]">₹85,000 / qtr</div>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                                Pending Renewal
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2.5 rounded-lg bg-white border border-[#E2E6EE] flex items-center justify-between shadow-2xs">
                            <div>
                              <div className="font-bold text-[#040404]">INV-2026-0084</div>
                              <span className="text-[10px] text-[#5A6578]">Nexarise Labs • GST 18%</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#040404]">₹2,83,200</div>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Settled
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-[#E2E6EE] flex items-center justify-between shadow-2xs">
                            <div>
                              <div className="font-bold text-[#040404]">INV-2026-0083</div>
                              <span className="text-[10px] text-[#5A6578]">Kore Technologies • GST 18%</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#040404]">₹53,100</div>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Settled
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-[#E2E6EE] flex items-center justify-between shadow-2xs">
                            <div>
                              <div className="font-bold text-[#040404]">INV-2026-0082</div>
                              <span className="text-[10px] text-[#5A6578]">Vertex Logistics • GST 18%</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#040404]">₹1,00,300</div>
                              <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                                Pending Payment
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E2E6EE] text-center">
                      <Link
                        to={isAuthenticated ? '/app/dashboard' : '/login'}
                        className="text-[#2346ED] text-xs font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Workspace Operations</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distinguishing illustrative data notice */}
              <div className="px-5 py-2.5 bg-[#FAFBFD] border-t border-[#E2E6EE] text-center text-[11px] text-[#5A6578]">
                * Representative interface preview of the Brightloop subscription management workspace.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TRUST AND VALUE PROPOSITION (BENEFITS)                                    */}
      {/* ========================================================================= */}
      <section className="py-20 border-t border-[#E2E6EE]" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-block text-xs uppercase font-bold text-[#2346ED] tracking-widest mb-2">
              Operational Clarity
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#040404] tracking-tight">
              Built to Bring Order to B2B Recurring Revenue
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5A6578] leading-relaxed">
              Subscription management becomes fragile when contracts, plans, quotes, and billing schedules live in separate tools. Brightloop centralizes your recurring workflows into one coherent, reliable system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Value Card 1 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs flex flex-col justify-between hover:border-[#A9B6CF] transition-colors">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-5">
                  <Layers size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#040404]">
                  One Connected Workspace
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2.5 leading-relaxed">
                  Eliminate disjointed spreadsheets and manual tracking. Maintain customers, plan tiers, quotes, and active subscriptions in a single centralized system with full historical traceability.
                </p>
              </div>
              <ul className="mt-6 pt-5 border-t border-[#E2E6EE] text-xs text-[#5A6578] space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#2346ED] shrink-0" />
                  <span>Unified customer and contract directories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#2346ED] shrink-0" />
                  <span>Eliminates administrative reconciliation drift</span>
                </li>
              </ul>
            </div>

            {/* Value Card 2 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs flex flex-col justify-between hover:border-[#A9B6CF] transition-colors">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-5">
                  <FileCheck size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#040404]">
                  Quotations to Live Subscriptions
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2.5 leading-relaxed">
                  Draft commercial quotes with custom pricing, line items, and cadences. When approved by your customer, convert proposals directly into live recurring subscriptions with a single click.
                </p>
              </div>
              <ul className="mt-6 pt-5 border-t border-[#E2E6EE] text-xs text-[#5A6578] space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#2346ED] shrink-0" />
                  <span>Zero duplicate data entry between sales and billing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#2346ED] shrink-0" />
                  <span>Automated initial invoice &amp; schedule creation</span>
                </li>
              </ul>
            </div>

            {/* Value Card 3 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs flex flex-col justify-between hover:border-[#A9B6CF] transition-colors">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-5">
                  <Receipt size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#040404]">
                  Accurate Invoicing &amp; Tracking
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2.5 leading-relaxed">
                  Generate itemized recurring invoices with accurate GST calculations. Monitor payment statuses, track outstanding receivables, and ensure every billing transaction is fully auditable.
                </p>
              </div>
              <ul className="mt-6 pt-5 border-t border-[#E2E6EE] text-xs text-[#5A6578] space-y-1.5">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#2346ED] shrink-0" />
                  <span>Dual GST computation (CGST+SGST / IGST)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#2346ED] shrink-0" />
                  <span>Clear tracking of settled and overdue balances</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURES SECTION (6 CLEAN PRODUCT CARDS)                                   */}
      {/* ========================================================================= */}
      <section className="py-20 border-t border-[#E2E6EE]" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-block text-xs uppercase font-bold text-[#2346ED] tracking-widest mb-2">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#040404] tracking-tight">
              Everything You Need to Manage Subscriptions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5A6578] leading-relaxed">
              A comprehensive set of tools designed specifically for B2B subscription operations, contract management, and recurring billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Customer Management */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs hover:border-[#A9B6CF] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-4">
                  <Users size={20} />
                </div>
                <h3 className="text-base font-bold text-[#040404]">
                  Customer Management
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2 leading-relaxed">
                  Maintain complete customer profiles, billing contacts, tax identifiers (GSTIN), running subscriptions, and historical interactions in one searchable directory.
                </p>
              </div>
            </div>

            {/* 2. Subscription Management */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs hover:border-[#A9B6CF] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-4">
                  <RefreshCw size={20} />
                </div>
                <h3 className="text-base font-bold text-[#040404]">
                  Subscription Management
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2 leading-relaxed">
                  Oversee contracts across daily, weekly, monthly, and annual cadences. Transition lifecycle states seamlessly through draft, confirmation, active, pause, and closure.
                </p>
              </div>
            </div>

            {/* 3. Plans and Products */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs hover:border-[#A9B6CF] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-4">
                  <Package size={20} />
                </div>
                <h3 className="text-base font-bold text-[#040404]">
                  Plans and Products
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2 leading-relaxed">
                  Configure multi-tier software products, pricing schedules, recurring frequencies, and optional add-on services tailored to your commercial offerings.
                </p>
              </div>
            </div>

            {/* 4. Quotations and Conversions */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs hover:border-[#A9B6CF] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-4">
                  <FileText size={20} />
                </div>
                <h3 className="text-base font-bold text-[#040404]">
                  Quotations and Conversions
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2 leading-relaxed">
                  Create formal commercial quotations with custom line items, validity windows, and pricing terms, then convert accepted quotes directly into active subscriptions.
                </p>
              </div>
            </div>

            {/* 5. Invoices and Payments */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs hover:border-[#A9B6CF] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-4">
                  <Receipt size={20} />
                </div>
                <h3 className="text-base font-bold text-[#040404]">
                  Invoices and Payments
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2 leading-relaxed">
                  Generate itemized tax invoices with integrated GST calculations, log incoming payments, monitor outstanding accounts, and issue payment receipts.
                </p>
              </div>
            </div>

            {/* 6. Revenue Reports */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs hover:border-[#A9B6CF] transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#2346ED] flex items-center justify-center mb-4">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-base font-bold text-[#040404]">
                  Revenue Reports
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6578] mt-2 leading-relaxed">
                  Gain immediate clarity into active subscription counts, monthly recurring revenue, collection statuses, and outstanding receivables through structured dashboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HOW IT WORKS SECTION (3 CLEAR STEPS)                                      */}
      {/* ========================================================================= */}
      <section className="py-20 border-t border-[#E2E6EE]" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="inline-block text-xs uppercase font-bold text-[#2346ED] tracking-widest mb-2">
              Step-by-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#040404] tracking-tight">
              How Brightloop Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5A6578] leading-relaxed">
              From initial plan configuration to ongoing subscription operations in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#2346ED] font-mono font-bold text-xs">
                    01
                  </span>
                  <span className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider">
                    Configuration
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#040404]">
                  Set Up Your Plans
                </h3>
                <p className="text-xs font-semibold text-[#2346ED] mt-1">
                  Configure products, pricing, and subscription plans.
                </p>
                <p className="text-xs text-[#5A6578] mt-3 leading-relaxed">
                  Define your core products and optional add-ons. Set up recurring frequencies (daily, weekly, monthly, annual) and assign pricing tiers to match your go-to-market structure.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#2346ED] font-mono font-bold text-xs">
                    02
                  </span>
                  <span className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider">
                    Workflow
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#040404]">
                  Manage Your Subscriptions
                </h3>
                <p className="text-xs font-semibold text-[#2346ED] mt-1">
                  Manage customers, quotations, subscriptions, and renewals.
                </p>
                <p className="text-xs text-[#5A6578] mt-3 leading-relaxed">
                  Create customer accounts, draft customized commercial quotations, and convert approved quotes into active subscriptions with scheduled recurring billing dates.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-2xl border border-[#E2E6EE] shadow-2xs flex flex-col justify-between relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#2346ED] font-mono font-bold text-xs">
                    03
                  </span>
                  <span className="text-[11px] font-semibold text-[#5A6578] uppercase tracking-wider">
                    Operations
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#040404]">
                  Track Billing and Payments
                </h3>
                <p className="text-xs font-semibold text-[#2346ED] mt-1">
                  Monitor invoices, payments, outstanding balances, and reports.
                </p>
                <p className="text-xs text-[#5A6578] mt-3 leading-relaxed">
                  Review generated tax invoices, record payment receipts, monitor outstanding customer balances, and gain direct visibility into recurring revenue performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CLOSING CALL TO ACTION                                                    */}
      {/* ========================================================================= */}
      <section className="py-20 border-t border-[#E2E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E2E6EE] rounded-2xl md:rounded-3xl p-8 sm:p-12 md:p-16 text-center max-w-4xl mx-auto shadow-2xs">
            <span className="inline-block text-xs uppercase font-bold text-[#2346ED] tracking-widest mb-3">
              Get Started
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#040404] tracking-tight">
              Bring Your Subscription Operations Together.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5A6578] max-w-xl mx-auto leading-relaxed">
              Keep your customers, subscriptions, and billing information organized in one workspace.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#2346ED] hover:bg-[#1b37c7] active:bg-[#162fa8] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#EDEFF4] hover:bg-slate-200 text-[#040404] font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Products</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
