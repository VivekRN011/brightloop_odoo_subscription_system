import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

export const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { data: products = [], isLoading } = useProducts();

  const handleSubscribeClick = (productId?: string) => {
    if (isAuthenticated && role === 'CUSTOMER') {
      navigate(productId ? `/portal/catalog?product=${productId}` : '/portal/catalog');
    } else {
      const redirectUrl = productId ? `/portal/catalog?product=${productId}` : '/portal/catalog';
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || p.productType === selectedType;

    return matchesSearch && matchesType;
  });

  const filterTabs: { label: string; value: string }[] = [
    { label: 'All Products', value: 'ALL' },
    { label: 'Software Services', value: 'SOFTWARE_SERVICE' },
    { label: 'Add-ons', value: 'ADDON' },
    { label: 'SLA Support', value: 'SUPPORT_SERVICE' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Products &amp; Services
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Products &amp; Subscription Services
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Explore enterprise software platforms, add-on intelligence modules, and mission-critical support agreements configured with dynamic variants.
            </p>
          </div>

          <Button
            onClick={() => handleSubscribeClick()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
          >
            <span>{isAuthenticated && role === 'CUSTOMER' ? 'Open Customer Catalog' : 'Plan Configurator'}</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Type Filter Pills */}
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

        {/* Search input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <EmptyState
            icon={<Package size={28} />}
            title="No Products Found"
            description="No products match your search query or filter criteria. Please try resetting your search."
          />
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
              }}
              className="text-xs"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const typeLabel =
              product.productType === 'SOFTWARE_SERVICE'
                ? 'Software Service'
                : product.productType === 'ADDON'
                ? 'Add-on Feature'
                : 'SLA Support';

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {typeLabel}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {product.sku}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Variants display */}
                  {product.variants.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">
                        Available Variants:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.variants.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center gap-1 text-[11px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <span>{v.value}</span>
                            {v.priceAdjustment > 0 && (
                              <strong className="text-indigo-600 dark:text-indigo-400">
                                (+{formatINR(v.priceAdjustment)})
                              </strong>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capabilities */}
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {product.features.slice(0, 3).map((f, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Base Rate
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        {formatINR(product.salesPrice)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      INR • Excl. Taxes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="w-full text-xs"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubscribeClick(product.id)}
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
    </div>
  );
};
