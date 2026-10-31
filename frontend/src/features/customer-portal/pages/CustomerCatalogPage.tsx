import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Layers,
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Repeat,
  Plus,
} from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { InPortalSubscribeModal } from '../components/InPortalSubscribeModal';

export const CustomerCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: plans = [], isLoading: plansLoading } = usePlans();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedProductForModal, setSelectedProductForModal] = useState<string | undefined>(undefined);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const queryProduct = searchParams.get('product');
    const queryPlan = searchParams.get('plan');
    if (queryProduct || queryPlan) {
      setSelectedProductForModal(queryProduct || undefined);
      setSelectedPlanForModal(queryPlan || undefined);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenSubscribe = (productId?: string, planCode?: string) => {
    setSelectedProductForModal(productId);
    setSelectedPlanForModal(planCode);
    setModalOpen(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || p.productType === selectedType;
    return matchesSearch && matchesType;
  });

  const filterTabs = [
    { label: 'All Services', value: 'ALL' },
    { label: 'Software Licenses', value: 'SOFTWARE_SERVICE' },
    { label: 'Add-ons', value: 'ADDON' },
    { label: 'SLA Support', value: 'SUPPORT_SERVICE' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft size={13} />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Layers size={18} />
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Products &amp; Subscription Services
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse available recurring software products, add-on intelligence modules, and SLA support tiers for your organization
            </p>
          </div>

          <Button
            onClick={() => handleOpenSubscribe()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus size={14} />
            <span>New Subscription</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedType(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === tab.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px] sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalog by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={<Package size={28} />}
            title="No Services Found"
            description="No matching products or add-ons match your search query."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const typeLabel =
              product.productType === 'SOFTWARE_SERVICE'
                ? 'Software License'
                : product.productType === 'ADDON'
                ? 'Add-on Feature'
                : 'SLA Support';

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                      {typeLabel}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {product.sku}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Available variants preview */}
                  {product.variants.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Variants &amp; Options:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center text-[10px] font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <span>{v.value}</span>
                            {v.priceAdjustment > 0 && (
                              <span className="text-indigo-600 ml-1">
                                (+{formatINR(v.priceAdjustment)})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capabilities */}
                  {product.features && (
                    <div className="space-y-1 pt-1">
                      {product.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      Starting Price
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                      {formatINR(product.salesPrice)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenSubscribe(product.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 flex items-center gap-1 shadow-xs"
                  >
                    <span>Subscribe</span>
                    <ArrowRight size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription Cadences Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Repeat size={18} className="text-indigo-600" />
            <span>Supported Subscription Cadences (PRD FR-PLAN-03)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Choose your recurring billing frequency: Daily, Weekly, Monthly, or Yearly.
          </p>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((pl) => (
              <div
                key={pl.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span>{pl.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {pl.billingFrequency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {pl.description}
                  </p>
                  <div className="mt-3 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {formatINR(pl.price)}
                    <span className="text-xs text-slate-400 font-normal"> / {pl.billingFrequency.toLowerCase()}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenSubscribe(undefined, pl.code)}
                  className="w-full text-xs font-semibold mt-3"
                >
                  Choose {pl.billingFrequency}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-Portal Subscription Configurator Modal */}
      <InPortalSubscribeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProductId={selectedProductForModal}
        initialPlanCode={selectedPlanForModal}
      />
    </div>
  );
};
