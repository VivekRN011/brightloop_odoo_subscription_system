import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');

  const handleStartTrial = (planName: string = 'Scale') => {
    if (isAuthenticated) {
      if (role === 'ADMIN') {
        navigate('/app/dashboard');
      } else {
        navigate('/portal/catalog');
      }
    } else {
      navigate(`/login?redirect=/portal/catalog&plan=${planName}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body text-on-surface bg-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* ================= HERO SECTION ================= */}
      <section className="pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/60 border border-outline-variant/60 text-xs font-semibold text-primary mb-8 tracking-wide shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Odoo Hackathon 2026 • Enterprise Edition</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0F090B] tracking-tight font-headline max-w-5xl mx-auto leading-[1.12]">
            Subscription management engineered for precision and scale.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
            Purpose-built for Indian B2B SaaS. Seamlessly handle multi-cadence billing, native GST compliance, IRN
            e-invoicing, and smart dunning on autopilot.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleStartTrial('Scale')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-all duration-200 shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Start Free 14-Day Trial</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('preview-showcase');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-surface-container-low text-primary font-semibold text-sm hover:bg-surface-container-high transition-colors duration-200 border border-outline-variant flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
              <span>Interactive Product Tour</span>
            </button>
          </div>

          {/* Trust Metrics Under CTA */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-outline font-medium">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
              Dual Indian GST (CGST/SGST + IGST)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
              RBI e-Mandate &amp; NACH Support
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
              CBIC E-Invoicing Ready
            </span>
          </div>
        </div>
      </section>

      {/* ================= PRODUCT PREVIEW SHOWCASE ================= */}
      <section id="preview-showcase" className="pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="bg-card-pure rounded-2xl border border-hairline soft-shadow overflow-hidden">
          {/* Window Chrome / Sub-nav mock */}
          <div className="border-b border-hairline px-6 py-3.5 bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant/60"></span>
              </div>
              <span className="text-xs text-outline font-medium border-l border-hairline pl-3">
                app.brightloop.io/subscriptions/overview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                CBIC E-Invoicing &amp; IRN Compliant
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-xs">verified</span>
                RBI e-Mandate Enabled
              </span>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-8">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-surface-container-low p-4 rounded-xl border border-hairline">
                <div className="text-xs font-medium text-outline uppercase tracking-wider mb-1">
                  Active Subscriptions
                </div>
                <div className="text-2xl font-bold text-on-surface tracking-tight">1,428</div>
                <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +12% from last month
                </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-hairline">
                <div className="text-xs font-medium text-outline uppercase tracking-wider mb-1">Current MRR</div>
                <div className="text-2xl font-bold text-primary tracking-tight">₹38,45,200</div>
                <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +8.4% Net Expansion
                </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-hairline">
                <div className="text-xs font-medium text-outline uppercase tracking-wider mb-1">Outstanding Balance</div>
                <div className="text-2xl font-bold text-on-surface tracking-tight">₹4,12,500</div>
                <div className="text-xs font-medium text-on-surface-variant mt-1">Reconciling via Auto-debit</div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-hairline">
                <div className="text-xs font-medium text-outline uppercase tracking-wider mb-1">Overdue Invoices</div>
                <div className="text-2xl font-bold text-error tracking-tight">9 invoices</div>
                <div className="text-xs font-medium text-error mt-1 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">notification_important</span> Dunning run active
                </div>
              </div>
            </div>

            {/* Split Visualization Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Chart Preview */}
              <div className="lg:col-span-7 bg-surface-container-low/40 rounded-xl p-5 border border-hairline flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <span className="text-xs font-bold text-on-surface">Revenue &amp; Collections Trend</span>
                  <span className="text-[11px] font-mono text-outline">Q3 2026 Fiscal Cycle</span>
                </div>
                <div className="py-4">
                  <svg className="w-full h-36" fill="none" preserveAspectRatio="none" viewBox="0 0 500 120">
                    <defs>
                      <linearGradient id="landingChartGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#743746" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#743746" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 100 Q 50 85 100 75 T 200 65 T 300 45 T 400 30 T 500 15 L 500 120 L 0 120 Z"
                      fill="url(#landingChartGrad)"
                    />
                    <path
                      d="M 0 100 Q 50 85 100 75 T 200 65 T 300 45 T 400 30 T 500 15"
                      stroke="#743746"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="500" cy="15" r="5" fill="#743746" stroke="#ffffff" strokeWidth="2" />
                  </svg>
                  <div className="flex justify-between text-[10px] text-outline pt-2 px-1">
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span className="font-bold text-primary">Oct (Current)</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Dual-mode GST calculation (CGST+SGST / IGST)</span>
                  <button
                    onClick={() => toast.success('Exporting GSTR-1 payload format')}
                    className="text-primary font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-sm">file_download</span> Export GSTR-1 Payload
                  </button>
                </div>
              </div>

              {/* Right Live Run Table Preview */}
              <div className="lg:col-span-5 bg-surface-container-low/40 rounded-xl p-5 border border-hairline flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <span className="text-xs font-bold text-on-surface">Automated Recurring Run</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                    Live
                  </span>
                </div>
                <div className="space-y-3 py-2 text-xs">
                  {[
                    { sub: 'SUB-8941', customer: 'Nexarise Labs', amount: '₹2,40,000', status: 'Settled' },
                    { sub: 'SUB-8940', customer: 'Kore Technologies', amount: '₹45,000', status: 'Settled' },
                    { sub: 'SUB-8939', customer: 'Vertex Logistics', amount: '₹85,000', status: 'In Grace (Day 4)' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-card-pure border border-hairline flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-on-surface">{item.customer}</div>
                        <span className="font-mono text-[10px] text-outline">{item.sub}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary font-headline">{item.amount}</div>
                        <span
                          className={`text-[10px] font-semibold ${
                            item.status === 'Settled' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-hairline text-center">
                  <Link
                    to="/app/dashboard"
                    className="text-primary text-xs font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Live Operations Dashboard</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE CAPABILITIES (4 FEATURE CARDS) ================= */}
      <section className="py-20 bg-[#FBFBFB] border-t border-hairline" id="features">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs uppercase font-bold text-primary tracking-widest">
              Built for modern financial engineering
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F090B] tracking-tight font-headline mt-2">
              Everything required to operate compliant recurring revenue.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-card-pure p-6 rounded-2xl border border-hairline soft-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">autorenew</span>
                </div>
                <h3 className="text-base font-bold text-on-surface font-headline">Automated Recurring Billing</h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Support for Daily, Weekly, Monthly, and Annual cadences with automatic invoice generation and lifecycle
                  status transitions.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-hairline text-[11px] text-outline space-y-1">
                <li>• Flexible prorated upgrades &amp; addons</li>
                <li>• Pause, resume, and renew workflows</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-card-pure p-6 rounded-2xl border border-hairline soft-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <h3 className="text-base font-bold text-on-surface font-headline">Native Indian GST &amp; E-Invoicing</h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Dual tax engine computing CGST (9%) + SGST (9%) for intra-state or IGST (18%) for inter-state supply
                  with HSN/SAC codes.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-hairline text-[11px] text-outline space-y-1">
                <li>• B2B GSTIN validation</li>
                <li>• Direct GSTR-1 payload JSON generation</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-card-pure p-6 rounded-2xl border border-hairline soft-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">policy</span>
                </div>
                <h3 className="text-base font-bold text-on-surface font-headline">Smart Dunning &amp; e-Mandates</h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Intelligent retry cycles on Day 2, 4, and 7 with a 7-day automated grace period ensuring uninterrupted
                  customer access.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-hairline text-[11px] text-outline space-y-1">
                <li>• RBI e-Mandate &amp; NACH debit compliance</li>
                <li>• Automated email &amp; WhatsApp payment alerts</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="bg-card-pure p-6 rounded-2xl border border-hairline soft-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">dashboard</span>
                </div>
                <h3 className="text-base font-bold text-on-surface font-headline">Role-Aware Customer Portal</h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Secure self-service subscriber portal for clients to review invoices, download tax receipts, and
                  manage seat allocations.
                </p>
              </div>
              <ul className="mt-4 pt-4 border-t border-hairline text-[11px] text-outline space-y-1">
                <li>• Instant online payment settlement</li>
                <li>• Complete historical audit trails</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING TIERS ================= */}
      <section className="py-24 bg-card-pure border-t border-hairline" id="pricing">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold text-primary tracking-widest">Predictable Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F090B] tracking-tight font-headline mt-2">
              Fair, transparent pricing for growing SaaS companies.
            </h2>
            <p className="text-xs text-on-surface-variant mt-2">
              No hidden gateway surcharges. All plans include full Indian GST compliance &amp; e-Invoicing.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-card-pure text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'annual'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>Billed Annually</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary-container text-on-secondary-container font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Tier 1: Growth */}
            <div className="bg-surface-container-low p-8 rounded-2xl border border-hairline flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-outline tracking-wider">Early Stage SaaS</span>
                <h3 className="text-xl font-bold text-on-surface font-headline mt-1">Growth</h3>
                <p className="text-xs text-on-surface-variant mt-2">
                  Designed for seed &amp; series-A startups scaling up to their first 250 paying accounts.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-on-surface font-headline">
                    {billingPeriod === 'annual' ? '₹18,000' : '₹22,500'}
                  </span>
                  <span className="text-xs text-outline font-medium">/ month</span>
                </div>
                <div className="text-[11px] text-outline mt-1">
                  {billingPeriod === 'annual' ? 'billed annually (₹2,16,000/yr)' : 'billed monthly'}
                </div>

                <div className="mt-8 space-y-3 text-xs text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Up to 250 active subscriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Dual GST calculation &amp; invoice PDFs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Automated payment reminders</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartTrial('Growth')}
                className="mt-8 w-full py-2.5 rounded-lg border border-outline text-on-surface font-semibold text-xs hover:bg-card-pure transition-colors"
              >
                Start Growth Trial
              </button>
            </div>

            {/* Tier 2: Scale (Highlighted) */}
            <div className="bg-card-pure p-8 rounded-2xl border-2 border-primary soft-shadow flex flex-col justify-between relative">
              <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[11px] font-bold bg-primary text-on-primary uppercase tracking-wider shadow-xs">
                Most Popular
              </span>
              <div>
                <span className="text-xs uppercase font-bold text-primary tracking-wider">Fast Growing</span>
                <h3 className="text-xl font-bold text-on-surface font-headline mt-1">Scale</h3>
                <p className="text-xs text-on-surface-variant mt-2">
                  Comprehensive revenue automation for teams scaling across multiple states.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-primary font-headline">
                    {billingPeriod === 'annual' ? '₹48,000' : '₹60,000'}
                  </span>
                  <span className="text-xs text-outline font-medium">/ month</span>
                </div>
                <div className="text-[11px] text-outline mt-1">
                  {billingPeriod === 'annual' ? 'billed annually (₹5,76,000/yr)' : 'billed monthly'}
                </div>

                <div className="mt-8 space-y-3 text-xs text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span className="font-semibold">Unlimited subscriptions &amp; customers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Native CBIC e-Invoicing with IRN &amp; QR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Smart dunning engine with 7-day grace</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Branded white-label customer portal</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartTrial('Scale')}
                className="mt-8 w-full py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-colors shadow-sm"
              >
                Start Free 14-Day Trial
              </button>
            </div>

            {/* Tier 3: Enterprise */}
            <div className="bg-surface-container-low p-8 rounded-2xl border border-hairline flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-outline tracking-wider">Custom Infrastructure</span>
                <h3 className="text-xl font-bold text-on-surface font-headline mt-1">Enterprise</h3>
                <p className="text-xs text-on-surface-variant mt-2">
                  Tailored deployments with custom ERP integrations and dedicated audit compliance.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-on-surface font-headline">₹1,20,000+</span>
                  <span className="text-xs text-outline font-medium">/ month</span>
                </div>
                <div className="text-[11px] text-outline mt-1">custom SLA &amp; dedicated instance</div>

                <div className="mt-8 space-y-3 text-xs text-on-surface">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Dedicated database cluster</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>99.9% contractual uptime SLA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Direct SAP / Oracle / Odoo ERP bi-directional sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">check</span>
                    <span>Dedicated Technical Account Manager</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast.info('Enterprise sales team will reach out within 2 hours.')}
                className="mt-8 w-full py-2.5 rounded-lg border border-outline text-on-surface font-semibold text-xs hover:bg-card-pure transition-colors"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CLOSING CTA & COMPLIANCE ================= */}
      <section className="py-20 bg-[#FBFBFB] border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-secondary-container/60 border border-outline-variant/60 rounded-3xl p-10 lg:p-14 text-center max-w-4xl mx-auto mb-16 shadow-xs">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F090B] tracking-tight font-headline mb-4">
              Ready to modernize your recurring billing?
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mx-auto mb-8 leading-relaxed">
              Join leading tech startups running high-volume subscription collections with zero reconciliation drift.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleStartTrial('Scale')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 hover:bg-primary-container transition-colors"
              >
                <span>Start Free 14-Day Trial</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
              <button
                onClick={() => toast.info('Interactive demo scheduler opened.')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-card-pure text-on-surface font-semibold text-xs border border-outline hover:bg-surface-container transition-colors"
              >
                Schedule a Demo
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-hairline flex flex-wrap items-center justify-center gap-8 text-xs text-outline">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-sm text-primary">security</span> 256-bit Bank-Grade
              Encryption
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-sm text-primary">verified_user</span> ISO 27001 &amp; SOC2
              Certified
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-sm text-primary">speed</span> 99.9% High Availability
            </span>
          </div>
        </div>
      </section>

      {/* ================= EDITORIAL FOOTER ================= */}
      <footer className="bg-card-pure border-t border-hairline py-12 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                  B
                </div>
                <span className="font-headline text-base font-bold text-[#0F090B]">Brightloop</span>
              </div>
              <p className="text-xs text-outline max-w-sm">
                The all-in-one recurring revenue billing and subscription management platform built for the Indian SaaS
                ecosystem.
              </p>
            </div>
            <div>
              <div className="font-bold text-on-surface uppercase tracking-wider text-[11px] mb-3">Product</div>
              <div className="space-y-2">
                <Link to="/products" className="block text-outline hover:text-primary">
                  Product Catalog
                </Link>
                <Link to="/app/dashboard" className="block text-outline hover:text-primary">
                  Operations Console
                </Link>
                <Link to="/app/invoices" className="block text-outline hover:text-primary">
                  Invoices &amp; Tax
                </Link>
              </div>
            </div>
            <div>
              <div className="font-bold text-on-surface uppercase tracking-wider text-[11px] mb-3">Workspace</div>
              <div className="space-y-2">
                <Link to="/login" className="block text-outline hover:text-primary">
                  Admin Sign In
                </Link>
                <Link to="/register" className="block text-outline hover:text-primary">
                  Subscriber Register
                </Link>
                <Link to="/portal" className="block text-outline hover:text-primary">
                  Customer Workspace
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-outline">
            <span>© 2026 Brightloop Technologies Pvt Ltd. All rights reserved.</span>
            <span>Odoo Hackathon 2026 Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
