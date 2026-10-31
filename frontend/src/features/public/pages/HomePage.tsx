import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Repeat,
  Layers,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: plans = [], isLoading: plansLoading } = usePlans();

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-xs">
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>Odoo x Make-A-Ton 9.0 Hackathon • Subscription Management System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
            Power Your Business with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
              Smarter Software Subscriptions
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Discover enterprise software products, configure customized variants, choose flexible recurring billing cadences, and manage quotations, invoices, and payments in one unified platform.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/products')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 h-11 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Explore Products &amp; Services</span>
              <ArrowRight size={16} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/subscribe')}
              className="w-full sm:w-auto font-semibold text-sm px-6 h-11 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              Configure Subscription
            </Button>
          </div>

          {/* Value Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              Dual Indian GST Calculation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              Dynamic Product Variants
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              Customer Self-Service Portal
            </span>
          </div>
        </div>

        {/* Live Interactive System Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          {/* Top Mock Window Bar */}
          <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-slate-400 ml-2">brightloop.io/portal/overview</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live Workspace Demo
            </span>
          </div>

          {/* Mock Preview Content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-900/40">
            {/* KPI 1 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Active Plans</span>
                <Repeat size={15} className="text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">2 Active</div>
              <p className="text-[11px] text-emerald-600 font-medium">Enterprise Cloud Core + 1TB Add-on</p>
            </div>

            {/* KPI 2 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Next Billing Date</span>
                <TrendingUp size={15} className="text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nov 10, 2026</div>
              <p className="text-[11px] text-slate-500">Auto-generated tax invoice via scheduler</p>
            </div>

            {/* KPI 3 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">GST Compliance</span>
                <ShieldCheck size={15} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">18.0% GST</div>
              <p className="text-[11px] text-slate-500">Automatic CGST/SGST vs IGST validation</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCTS & SERVICES CATALOG SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Layers size={14} />
              <span>Catalog &amp; Add-ons</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              Explore Brightloop Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enterprise software licenses, business add-ons, and technical SLA packages with configurable variants.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Catalog</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const typeBadge =
                product.productType === 'SOFTWARE_SERVICE'
                  ? 'Software'
                  : product.productType === 'ADDON'
                  ? 'Add-on'
                  : 'SLA Support';

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {typeBadge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {product.sku}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Variant indicator */}
                    {product.variants.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Variants: </span>
                        <span>{product.variants.map((v) => v.value).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        Base Rate
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                          {formatINR(product.salesPrice)}
                        </span>
                        <span className="text-[11px] text-slate-400">/ base unit</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="w-full text-xs"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/subscribe?product=${product.id}`)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                      >
                        Subscribe
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. SUBSCRIPTION PLANS & CADENCES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="plans">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Repeat size={14} />
            <span>Recurring Billing Intervals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Flexible Subscription Plans
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Strictly supporting the 4 PRD billing cadences: Daily, Weekly, Monthly, and Yearly.
          </p>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'border-indigo-600 dark:border-indigo-500 shadow-indigo-500/10 shadow-lg ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      plan.popular
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="py-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                        {formatINR(plan.price)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium capitalize">
                        / {plan.billingFrequency.toLowerCase()}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Min Quantity: {plan.minimumQuantity} unit
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <Button
                    onClick={() => navigate(`/subscribe?plan=${plan.code}`)}
                    className={`w-full text-xs font-semibold ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                    }`}
                  >
                    Select Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS / CUSTOMER JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 rounded-3xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Settings size={14} />
            <span>Customer Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            How Brightloop Subscriptions Work
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Aligned with the official documentation: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Discover Products
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Explore business software, add-on features, and SLA packages in our catalog.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Select Variants
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Customize brand edition (e.g. Odoo Edition +₹560), SLA tiers, and retention rules.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Choose Cadence
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Select Daily, Weekly, Monthly, or Yearly recurring intervals.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
              04
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Quotation Review
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Commercial proposals generated from templates with transparent tax line items.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
              05
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Self-Service Portal
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Manage renewals, download GST invoices, and track settlements online.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Subscription Experience?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Join leading Indian enterprises managing recurring software agreements, GST invoices, and customer self-service with Brightloop.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-6 h-10 shadow-md"
              >
                Create Customer Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/products')}
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-semibold text-xs px-6 h-10"
              >
                Browse Software Products
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
