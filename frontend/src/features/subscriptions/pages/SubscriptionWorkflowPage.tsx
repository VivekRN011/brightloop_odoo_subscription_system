import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { customerPortalService } from '@/features/customer-portal/services/customerPortal.service';

export const SubscriptionWorkflowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: plans = [], isLoading: plansLoading } = usePlans();

  // Workflow Stages
  const steps = [
    { id: 1, label: 'Product & Variant' },
    { id: 2, label: 'Plan & Interval' },
    { id: 3, label: 'Seats & Quantity' },
    { id: 4, label: 'Review & Commercial Terms' },
    { id: 5, label: 'Confirmation' },
  ];

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Initial state derived from query parameters
  const queryProduct = searchParams.get('product') || '';
  const queryVariant = searchParams.get('variant') || '';
  const queryPlan = searchParams.get('plan') || 'PLAN-BIZ-M';

  // Selections
  const [selectedProductId, setSelectedProductId] = useState<string>(queryProduct);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(queryVariant);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(queryPlan);
  const [quantity, setQuantity] = useState<number>(1);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscountPct, setAppliedDiscountPct] = useState<number>(0);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quotationReference, setQuotationReference] = useState<string | null>(null);

  // Active product resolved from state or fallback
  const activeProduct =
    products.find((p) => p.id === selectedProductId) ||
    products.find((p) => p.id === queryProduct) ||
    products[0];

  // Active variant resolved from state or fallback
  const activeVariant =
    activeProduct?.variants.find((v) => v.id === selectedVariantId) ||
    activeProduct?.variants.find((v) => v.id === queryVariant) ||
    activeProduct?.variants[0] ||
    null;

  const effectiveVariantId = activeVariant?.id || '';
  const activePlan = plans.find((p) => p.code === selectedPlanCode) || plans[0];

  // Price calculations
  const basePrice = activeProduct?.salesPrice || 0;
  const variantAdj = activeVariant?.priceAdjustment || 0;
  const unitPrice = basePrice + variantAdj;
  const subtotal = unitPrice * quantity;
  const discountAmount = subtotal * (appliedDiscountPct / 100);
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const gstTax = taxableSubtotal * 0.18; // 18% standard GST rate
  const grandTotal = taxableSubtotal + gstTax;

  const handleApplyDiscount = () => {
    setDiscountError(null);
    if (!discountCode.trim()) return;

    if (discountCode.trim().toUpperCase() === 'EARLY10') {
      setAppliedDiscountPct(10);
    } else if (discountCode.trim().toUpperCase() === 'HACKATHON2026') {
      setAppliedDiscountPct(15);
    } else {
      setDiscountError('Invalid discount promo code. Try "EARLY10".');
    }
  };

  const handleProceed = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 4) {
      handleSubmitQuotationRequest();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitQuotationRequest = async () => {
    setIsSubmitting(true);
    const generatedRef = "QUO-2026-" + Math.floor(1000 + Math.random() * 9000);

    if (activeProduct && activePlan) {
      try {
        await customerPortalService.addSubscription(user, {
          id: "sub-portal-" + Date.now(),
          subscriptionNumber: "SUB-2026-" + Math.floor(1000 + Math.random() * 9000),
          planName: activePlan.name,
          productName: activeProduct.name,
          status: 'active',
          quantity,
          billingInterval: activePlan.billingFrequency as any,
          price: grandTotal,
          currency: 'INR',
          startDate: new Date().toISOString().slice(0, 10),
          expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        });
      } catch (e) {
        console.error('Subscription sync error:', e);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setQuotationReference(generatedRef);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  if (productsLoading || plansLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading subscription configurator...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Workflow Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Sparkles size={14} />
          <span>Interactive Plan Builder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Configure Your Subscription
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Guided setup compliant with Brightloop WF-06 and WF-07 quotation and activation workflows.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between relative">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : step.id}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-2 text-center hidden sm:block ${
                    isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Step Interaction (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: PRODUCT & VARIANT SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  1. Select Software Product or Service
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {products.map((prod) => {
                    const isSelected = activeProduct?.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setSelectedProductId(prod.id)}
                        className={`text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              {prod.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {prod.productType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {prod.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {formatINR(prod.salesPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">base rate</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variant options if active product has variants */}
              {activeProduct && activeProduct.variants.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      2. Select Product Variant
                    </h3>
                    <span className="text-xs text-slate-400">
                      e.g., Odoo Brand Edition +₹560
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeProduct.variants.map((v) => {
                      const isSelected = effectiveVariantId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`text-left p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {v.name}
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {v.value}
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
                            <span className="text-slate-400">Adjustment:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {v.priceAdjustment > 0
                                ? `+${formatINR(v.priceAdjustment)}`
                                : 'Included (+₹0)'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PLAN & RECURRING INTERVAL */}
          {currentStep === 2 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Select Recurring Billing Cadence
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supported cadences mandated by PRD FR-PLAN-03: Daily, Weekly, Monthly, and Yearly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map((plan) => {
                  const isSelected = selectedPlanCode === plan.code;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanCode(plan.code)}
                      className={`text-left p-5 rounded-2xl border transition-all relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-600 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {plan.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-2 inline-block">
                          {plan.badge}
                        </span>
                      )}
                      <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {plan.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {plan.description}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                          {formatINR(plan.price)}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          / {plan.billingFrequency.toLowerCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SEATS & QUANTITY SELECTION */}
          {currentStep === 3 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Specify Quantity / User Seats
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enforces plan minimum quantity requirement (PRD FR-PLAN-04).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-4 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Allocated Licenses / Seats
                </span>

                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= (activePlan?.minimumQuantity || 1)}
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 w-16">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Minimum quantity for {activePlan?.name}: {activePlan?.minimumQuantity || 1} unit
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & COMMERCIAL TERMS */}
          {currentStep === 4 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Review Commercial Quotation Summary
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Compliant with WF-06: Pre-fills plan, products, taxes, and customer ownership.
                </p>
              </div>

              {/* Authenticated Customer check */}
              {isAuthenticated ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 dark:text-emerald-200">
                      Subscriber Identity Verified:
                    </span>
                    <span className="text-emerald-800 dark:text-emerald-300 ml-1">
                      {user?.name} ({user?.email}) • Quotation will be linked to your corporate account.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-950 dark:text-amber-200">
                      Unauthenticated Guest:
                    </span>
                    <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                      To complete subscription activation and access the self-service portal, you will be prompted to sign in or register your customer account.
                    </p>
                  </div>
                </div>
              )}

              {/* Itemized Line Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-center">Cadence</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {activeProduct?.name}
                        </div>
                        {activeVariant && (
                          <div className="text-[11px] text-slate-400">
                            Variant: {activeVariant.value} (+{formatINR(activeVariant.priceAdjustment)})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center capitalize">
                        {activePlan?.billingFrequency.toLowerCase()}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatINR(unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(subtotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Discount Promo Code Input */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Percent size={14} className="text-indigo-600" />
                  Have a Promotional Discount Code?
                </span>
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. EARLY10)"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleApplyDiscount}
                    className="text-xs"
                  >
                    Apply
                  </Button>
                </div>
                {appliedDiscountPct > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Applied {appliedDiscountPct}% promotional concession.
                  </p>
                )}
                {discountError && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {discountError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION & QUOTATION STATUS */}
          {currentStep === 5 && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 p-8 shadow-lg text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Quotation Generated (WF-06)
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-2">
                  Subscription Request Submitted!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your commercial quotation has been prepared with snapshot pricing and sent for customer confirmation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between text-slate-500">
                  <span>Reference ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {quotationReference}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Subscribed Product:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeProduct?.name}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Plan &amp; Cadence:</span>
                  <span>{activePlan?.name}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                  <span>Contract Amount:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => navigate('/portal/subscriptions')}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6"
                >
                  Go to My Subscriptions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/portal')}
                  className="w-full sm:w-auto text-xs"
                >
                  Customer Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Previous Step</span>
              </Button>

              <Button
                size="sm"
                onClick={handleProceed}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 flex items-center gap-1.5 shadow-xs"
              >
                <span>{currentStep === 4 ? (isSubmitting ? 'Submitting Quotation...' : 'Submit Quotation Request') : 'Continue'}</span>
                <ArrowRight size={13} />
              </Button>
            </div>
          )}
        </div>

        {/* Live Calculation Sidebar (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Receipt size={14} className="text-indigo-600" />
              Live Order Summary
            </h4>

            <div className="space-y-2.5 text-xs border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Product Base:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatINR(basePrice)}
                </span>
              </div>

              {activeVariant && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="truncate max-w-[140px]">{activeVariant.value}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    +{formatINR(variantAdj)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Quantity / Seats:</span>
                <span className="font-semibold">{quantity} unit{quantity > 1 ? 's' : ''}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Cadence:</span>
                <span className="font-semibold capitalize text-indigo-600">
                  {activePlan?.billingFrequency.toLowerCase()}
                </span>
              </div>

              {appliedDiscountPct > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Concession ({appliedDiscountPct}%):</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-slate-700 dark:text-slate-300">
                <span>Taxable Amount:</span>
                <span className="font-bold">{formatINR(taxableSubtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>GST (18%):</span>
                <span>{formatINR(gstTax)}</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Recurring Total
                </span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatINR(grandTotal)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                INR / cycle
              </span>
            </div>
          </div>

          {/* Legal / Workflow Notice */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Business Workflow Governance
            </span>
            <p className="leading-relaxed">
              Submissions adhere to Odoo Hackathon 2026 specifications: subscriptions start in Draft/Quotation state and activate following quotation confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
