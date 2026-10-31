import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  CreditCard,
} from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { launchRazorpayCheckout } from '../services/razorpayClient.service';
import type { CustomerSubscription } from '../models/customerPortal.types';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export interface InPortalSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
  initialPlanCode?: string;
  onSuccess?: () => void;
}

export const InPortalSubscribeModal: React.FC<InPortalSubscribeModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
  initialPlanCode,
  onSuccess,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: products = [] } = useProducts();
  const { data: plans = [] } = usePlans();

  const [step, setStep] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscountPct, setAppliedDiscountPct] = useState<number>(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);
  const [createdSubscription, setCreatedSubscription] = useState<CustomerSubscription | null>(null);

  // Initialize selections when modal opens or initialProductId changes
  useEffect(() => {
    if (isOpen && products.length > 0) {
      const prod = initialProductId
        ? products.find((p) => p.id === initialProductId || p.sku === initialProductId) || products[0]
        : products[0];

      setSelectedProductId(prod.id);
      if (prod.variants.length > 0) {
        setSelectedVariantId(prod.variants[0].id);
      } else {
        setSelectedVariantId('');
      }

      if (plans.length > 0) {
        const matchedPlan = initialPlanCode
          ? plans.find((pl) => pl.code === initialPlanCode || pl.id === initialPlanCode)
          : plans.find((pl) => pl.billingFrequency === 'MONTHLY') || plans[0];
        setSelectedPlanId(matchedPlan ? matchedPlan.id : plans[0].id);
      }

      setStep(1);
      setQuantity(1);
      setAppliedDiscountPct(0);
      setDiscountError(null);
      setPaymentError(null);
      setVerifiedPaymentId(null);
      setCreatedSubscription(null);
    }
  }, [isOpen, initialProductId, initialPlanCode, products, plans]);

  if (!isOpen) return null;

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const activeVariant = activeProduct?.variants.find((v) => v.id === selectedVariantId);
  const activePlan = plans.find((p) => p.id === selectedPlanId || p.code === selectedPlanId) || plans[0];

  const basePrice = activeProduct?.salesPrice || 0;
  const variantAdj = activeVariant?.priceAdjustment || 0;
  const unitPrice = basePrice + variantAdj;
  const subtotal = unitPrice * quantity;
  const discountAmount = subtotal * (appliedDiscountPct / 100);
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const gstTax = taxableSubtotal * 0.18;
  const grandTotal = taxableSubtotal + gstTax;

  const handleApplyDiscount = () => {
    setDiscountError(null);
    if (!discountCode.trim()) return;
    if (discountCode.trim().toUpperCase() === 'EARLY10') {
      setAppliedDiscountPct(10);
    } else if (discountCode.trim().toUpperCase() === 'HACKATHON2026') {
      setAppliedDiscountPct(15);
    } else {
      setDiscountError('Invalid code. Try "EARLY10".');
    }
  };

  const handleConfirmSubscription = async () => {
    if (!activeProduct || !activePlan) return;
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      // 1. Create subscription & initial invoice on backend
      const res = await api.post('/portal/subscriptions', {
        productId: activeProduct.id,
        planId: activePlan.id,
        variantId: activeVariant?.id || undefined,
        quantity,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
      });

const responseData = res.data?.data;
      const sub = responseData?.sub || responseData?.subscription || responseData;
      const invoice = responseData?.invoice;

      if (!invoice || !invoice.id) {
        throw new Error('Initial invoice could not be generated for this subscription.');
      }

      // 2. Open Razorpay Checkout modal immediately for the generated invoice
      await launchRazorpayCheckout({
        invoiceId: invoice.id,
        onSuccess: (result) => {
          setIsSubmitting(false);
          setCreatedSubscription({
            id: sub.id,
            subscriptionNumber: sub.subscriptionNumber,
            planName: activePlan.name,
            productName: activeProduct.name,
            status: 'active',
            quantity,
            billingInterval: activePlan.billingFrequency,
            price: Number(invoice.grandTotal),
            currency: 'INR',
            startDate: new Date().toISOString(),
            expiryDate: '',
            nextBillingDate: sub.nextBillingAt,
          });
          setVerifiedPaymentId(
            result.payment?.gatewayPaymentId || result.payment?.reference || 'Verified'
          );
          queryClient.invalidateQueries({ queryKey: ['portal'] });
          onSuccess?.();
          setStep(3); // Success step
        },
        onError: (err) => {
          setIsSubmitting(false);
          setPaymentError(err);
          queryClient.invalidateQueries({ queryKey: ['portal'] });
        },
        onDismiss: () => {
          setIsSubmitting(false);
          setPaymentError(
            `Razorpay checkout was dismissed. Invoice ${invoice.invoiceNumber} has been generated and is awaiting payment in your Invoices tab.`
          );
          queryClient.invalidateQueries({ queryKey: ['portal'] });
        },
      });
    } catch (err: any) {

      setIsSubmitting(false);
      setPaymentError(
        err.response?.data?.message || err.message || 'Failed to initialize subscription checkout.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Configure Subscription
              </h3>
              <p className="text-[11px] text-slate-400">
                Customer Self-Service • Add plan to {user?.companyName || 'your corporate account'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Select Software Product / Add-on
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {products.map((p) => {
                    const isSelected = selectedProductId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(p.id);
                          if (p.variants.length > 0) {
                            setSelectedVariantId(p.variants[0].id);
                          } else {
                            setSelectedVariantId('');
                          }
                        }}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          <span>{p.productType.replace('_', ' ')}</span>
                          <span className="font-mono">{p.sku}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                          From {formatINR(p.salesPrice)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variant Selector */}
              {activeProduct && activeProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    2. Select Variant Edition
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeProduct.variants.map((v) => {
                      const isSelected = selectedVariantId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-600'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                              {v.name}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {v.value}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {v.priceAdjustment > 0 ? `+${formatINR(v.priceAdjustment)}` : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Plan Cadence & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    3. Billing Cadence
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {plans.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} ({pl.billingFrequency.toLowerCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    4. Quantity / User Licenses
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-sm">
                      {quantity} License{quantity > 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Continue to Review */}
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Review Commercial Summary</span>
                  <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {paymentError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Review Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Product:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {activeProduct?.name}
                  </span>
                </div>

                {activeVariant && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Variant:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {activeVariant.value} (+{formatINR(activeVariant.priceAdjustment)})
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Billing Cadence:</span>
                  <span className="font-semibold capitalize text-indigo-600">
                    {activePlan?.billingFrequency.toLowerCase()} ({activePlan?.name})
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Allocated Quantity:</span>
                  <span className="font-semibold">{quantity} seat{quantity > 1 ? 's' : ''}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span className="font-bold">{formatINR(taxableSubtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Indian GST (18.0%):</span>
                  <span>{formatINR(gstTax)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-bold">
                  <span className="text-slate-900 dark:text-slate-100">Total Recurring Price:</span>
                  <span className="text-lg text-indigo-600 dark:text-indigo-400">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Promo code */}
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code (e.g. EARLY10)"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono uppercase bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <Button variant="outline" size="sm" onClick={handleApplyDiscount} className="text-xs">
                    Apply
                  </Button>
                </div>
                {appliedDiscountPct > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    ✓ Applied {appliedDiscountPct}% promotional discount.
                  </p>
                )}
                {discountError && (
                  <p className="text-[11px] text-rose-600 font-medium">{discountError}</p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs flex items-center gap-1">
                  <ArrowLeft size={13} />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={handleConfirmSubscription}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Opening Razorpay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      <span>Confirm &amp; Pay with Razorpay</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && createdSubscription && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Payment Verified &amp; Subscription Live!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Subscription <strong className="font-mono text-slate-800 dark:text-slate-200">{createdSubscription.subscriptionNumber}</strong> has been confirmed and activated.
                </p>
                {verifiedPaymentId && (
                  <p className="text-[11px] text-emerald-600 font-mono mt-1 font-semibold">
                    Razorpay Reference: {verifiedPaymentId}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-xs space-y-1.5 text-left">
                <div className="flex justify-between text-slate-500">
                  <span>Product:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{createdSubscription.productName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cadence:</span>
                  <span className="capitalize">{createdSubscription.billingInterval.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Amount Settled:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(createdSubscription.price)} (PAID)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Status:</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={onClose} className="w-full max-w-xs bg-slate-900 text-white text-xs font-semibold">
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
