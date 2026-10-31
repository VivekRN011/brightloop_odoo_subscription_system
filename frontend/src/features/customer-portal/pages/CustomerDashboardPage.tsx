import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Repeat,
  Calendar,
  AlertCircle,
  Receipt,
  Building,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { CustomerMetricCard } from '../components/CustomerMetricCard';
import { OutstandingAlert } from '../components/OutstandingAlert';
import { CustomerSubscriptionsList } from '../components/CustomerSubscriptionsList';
import { CustomerInvoicesList } from '../components/CustomerInvoicesList';
import { InPortalSubscribeModal } from '../components/InPortalSubscribeModal';
import { formatINR, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: summary, isLoading, isError, error, refetch } = useCustomerSummary();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: plans = [] } = usePlans();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | undefined>(undefined);
  const [selectedPlanCodeForModal, setSelectedPlanCodeForModal] = useState<string | undefined>(undefined);

  useEffect(() => {
    const queryProduct = searchParams.get('product');
    const queryPlan = searchParams.get('plan');
    const queryAction = searchParams.get('action');

    if (queryAction === 'subscribe' || queryProduct || queryPlan) {
      setSelectedProductIdForModal(queryProduct || undefined);
      setSelectedPlanCodeForModal(queryPlan || undefined);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenSubscribe = (productId?: string, planCode?: string) => {
    setSelectedProductIdForModal(productId);
    setSelectedPlanCodeForModal(planCode);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
          Unable to Load Subscriber Profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {error instanceof Error ? error.message : 'An error occurred while fetching your customer workspace data.'}
        </p>
        <Button
          onClick={() => refetch()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-2"
        >
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  const {
    profile,
    activeSubscriptionsCount,
    nextRenewalDate,
    nextRenewalPlan,
    totalOutstandingAmount,
    totalPaidAmount,
    paidInvoicesCount,
    subscriptions,
    recentInvoices,
    outstandingInvoices,
  } = summary;

  return (
    <div className="space-y-8">
      {/* 1. REFINED WELCOME & WORKSPACE HERO BANNER */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none rounded-tr-2xl" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Welcome back, {user?.name || profile.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={12} />
              Verified Account
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
              <Building size={13} className="text-slate-400" />
              {profile.companyName}
            </span>
            <span>•</span>
            <span>Customer ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{profile.customerCode}</strong></span>
            {profile.gstin && (
              <>
                <span>•</span>
                <span>GSTIN: <strong className="font-mono text-slate-700 dark:text-slate-300">{profile.gstin}</strong></span>
              </>
            )}
            <span>•</span>
            <span>{profile.city}, {profile.state}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto relative z-10">
          <Button
            size="sm"
            onClick={() => handleOpenSubscribe()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>New Subscription</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-9 px-3 flex items-center gap-1.5 border-slate-200 dark:border-slate-800"
            title="Refresh data"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>

      {/* 2. OUTSTANDING PAYMENT ALERT (CONDITIONAL) */}
      <OutstandingAlert
        outstandingAmount={totalOutstandingAmount}
        invoices={outstandingInvoices.length > 0 ? outstandingInvoices : recentInvoices}
      />

      {/* 3. VITAL ADMIN OVERVIEW KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscriptions */}
        <CustomerMetricCard
          label="Active Subscriptions"
          value={activeSubscriptionsCount}
          subtext={
            activeSubscriptionsCount === 1
              ? '1 active recurring plan'
              : `${activeSubscriptionsCount} active recurring plans`
          }
          icon={<Repeat size={20} />}
          badge={{
            text: activeSubscriptionsCount > 0 ? 'Live' : 'None',
            variant: activeSubscriptionsCount > 0 ? 'info' : 'neutral',
          }}
        />

        {/* Card 2: Upcoming Renewal */}
        <CustomerMetricCard
          label="Next Plan Renewal"
          value={nextRenewalDate ? formatDate(nextRenewalDate) : 'None scheduled'}
          subtext={nextRenewalPlan || 'No upcoming scheduled renewal'}
          icon={<Calendar size={20} />}
          badge={{
            text: nextRenewalDate ? 'Upcoming' : 'None',
            variant: nextRenewalDate ? 'warning' : 'neutral',
          }}
        />

        {/* Card 3: Total Outstanding Balance */}
        <CustomerMetricCard
          label="Outstanding Balance"
          value={formatINR(totalOutstandingAmount)}
          subtext={
            totalOutstandingAmount > 0
              ? 'Invoice awaiting settlement'
              : 'All invoices settled in full'
          }
          icon={<AlertCircle size={20} />}
          badge={{
            text: totalOutstandingAmount > 0 ? 'Pending' : 'Clear',
            variant: totalOutstandingAmount > 0 ? 'warning' : 'success',
          }}
        />

        {/* Card 4: Paid Invoices & Lifetime Spend */}
        <CustomerMetricCard
          label="Paid Invoices"
          value={paidInvoicesCount}
          subtext={`Lifetime settled: ${formatINR(totalPaidAmount)}`}
          icon={<Receipt size={20} />}
          badge={{
            text: 'Settled',
            variant: 'success',
          }}
        />
      </div>

      {/* 4. FEATURED PRODUCTS & SERVICES (DIRECTLY INSIDE CUSTOMER HOME PAGE!) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Layers size={14} />
              <span>Catalog &amp; Subscription Services</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              Available Products &amp; Add-ons
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any software license, variant edition, or SLA support package to configure and add to your active subscriptions.
            </p>
          </div>

          <Link
            to="/portal/catalog"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Services</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const typeLabel =
                product.productType === 'SOFTWARE_SERVICE'
                  ? 'Software'
                  : product.productType === 'ADDON'
                  ? 'Add-on'
                  : 'SLA Support';

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                        {typeLabel}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {product.sku}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Variant preview */}
                    {product.variants.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                        <span className="font-bold text-slate-600 dark:text-slate-300 text-[10px] uppercase block">
                          Variants:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              {v.value}
                              {v.priceAdjustment > 0 && (
                                <strong className="text-indigo-600 ml-1">+{formatINR(v.priceAdjustment)}</strong>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        Base Rate
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {formatINR(product.salesPrice)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOpenSubscribe(product.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 px-3 shadow-xs flex items-center gap-1"
                    >
                      <span>Subscribe</span>
                      <ArrowRight size={12} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. MAIN CONTENT REGION: SUBSCRIPTIONS & RECENT INVOICES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Active Subscriptions & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscriptions List */}
          <CustomerSubscriptionsList
            subscriptions={subscriptions}
            showViewAll={true}
          />

          {/* Invoices List */}
          <div id="invoices-section">
            <CustomerInvoicesList
              invoices={recentInvoices}
              showViewAll={true}
            />
          </div>
        </div>

        {/* Right Column (1 col): Cadences & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Subscribe by Cadence Card */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" />
                <span>Subscription Cadences</span>
              </h3>
              <span className="text-[10px] text-slate-400">4 PRD Intervals</span>
            </div>

            <div className="space-y-2">
              {plans.map((pl) => (
                <button
                  key={pl.code}
                  type="button"
                  onClick={() => handleOpenSubscribe(undefined, pl.code)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {pl.name}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {pl.billingFrequency.toLowerCase()} billing • {formatINR(pl.price)}
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 text-indigo-600 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Account Profile Card */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Corporate Account
            </h3>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <div><strong>Company:</strong> {profile.companyName}</div>
              <div><strong>Code:</strong> <span className="font-mono">{profile.customerCode}</span></div>
              {profile.gstin && <div><strong>GSTIN:</strong> <span className="font-mono">{profile.gstin}</span></div>}
              <div><strong>Place of Supply:</strong> {profile.state}</div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link to="/portal/profile" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs flex items-center gap-1">
                <span>Edit Tax &amp; Billing Profile</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* In-Portal Subscription Configurator Modal */}
      <InPortalSubscribeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProductId={selectedProductIdForModal}
        initialPlanCode={selectedPlanCodeForModal}
      />
    </div>
  );
};
