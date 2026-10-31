import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Repeat,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: plans = [] } = usePlans();

  const [userSelectedVariantId, setUserSelectedVariantId] = useState<string | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('PLAN-BIZ-M');

  const selectedVariant =
    product?.variants.find((v) => v.id === userSelectedVariantId) ||
    product?.variants[0] ||
    null;
  const selectedVariantId = selectedVariant?.id || null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
          <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Product Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The product you are looking for does not exist or has been retired from the catalog.
        </p>
        <Button onClick={() => navigate('/products')} size="sm" className="text-xs">
          Back to Catalog
        </Button>
      </div>
    );
  }

  const variantAdjustment = selectedVariant ? selectedVariant.priceAdjustment : 0;
  const unitPrice = product.salesPrice + variantAdjustment;
  const estimatedTax = unitPrice * 0.18; // 18% standard Indian GST
  const estimatedTotal = unitPrice + estimatedTax;

  const relevantPlans = plans.filter((pl) =>
    product.supportedBillingFrequencies.includes(pl.billingFrequency)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <Link to="/products" className="hover:text-indigo-600 transition-colors">
          Products
        </Link>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): Product Overview & Variant Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {product.productType.replace('_', ' ')}
              </span>
              <span className="font-mono text-xs text-slate-400">
                SKU: {product.sku}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 ml-auto">
                <ShieldCheck size={14} />
                <span>Active Catalog Item</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Features Checklist */}
            {product.features && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Included Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Variant Selection */}
          {product.variants.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers size={18} className="text-indigo-600" />
                    <span>Select Product Variant</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose your edition, tier, or brand integration. Price updates dynamically.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {product.variants.length} available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setUserSelectedVariantId(variant.id)}
                      className={`text-left p-4 rounded-xl border transition-all relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {variant.name}
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {variant.value}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 size={13} />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Variant Adjustment:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {variant.priceAdjustment > 0
                            ? `+${formatINR(variant.priceAdjustment)}`
                            : 'Included (+₹0)'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supported Plans Selection */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Repeat size={18} className="text-indigo-600" />
                <span>Compatible Subscription Cadences</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your preferred recurring billing interval for this product.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {relevantPlans.map((plan) => {
                const isSelected = selectedPlanCode === plan.code;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanCode(plan.code)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {plan.name}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {plan.billingFrequency}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 line-clamp-2">
                      {plan.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Sticky Pricing Calculator */}
        <div className="space-y-6 sticky top-24">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Subscription Cost Summary
            </h3>

            <div className="space-y-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Product Base Rate:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatINR(product.salesPrice)}
                </span>
              </div>

              {selectedVariant && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Variant ({selectedVariant.value}):</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    +{formatINR(selectedVariant.priceAdjustment)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Applicable Cadence:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {plans.find((p) => p.code === selectedPlanCode)?.name || 'Monthly'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-slate-700 dark:text-slate-300">
                <span>Taxable Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatINR(unitPrice)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Estimated Indian GST (18%):</span>
                <span>{formatINR(estimatedTax)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  Estimated Total
                </span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatINR(estimatedTotal)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                INR / interval
              </span>
            </div>

            <Button
              onClick={() => {
                const variantQuery = selectedVariantId ? `&variant=${selectedVariantId}` : '';
                const planQuery = selectedPlanCode ? `&plan=${selectedPlanCode}` : '';
                const target = `/portal/catalog?product=${product.id}${variantQuery}${planQuery}`;
                if (isAuthenticated && role === 'CUSTOMER') {
                  navigate(target);
                } else {
                  navigate(`/login?redirect=${encodeURIComponent(target)}`);
                }
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-11 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>{isAuthenticated && role === 'CUSTOMER' ? 'Configure in Customer Workspace' : 'Sign In to Subscribe'}</span>
              <ArrowRight size={14} />
            </Button>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Quotation &amp; Confirmation Policy
              </p>
              <p className="leading-relaxed">
                Per WF-06 and WF-07, subscription requests generate a commercial quotation with fixed line items. Once accepted, your active subscription commences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
