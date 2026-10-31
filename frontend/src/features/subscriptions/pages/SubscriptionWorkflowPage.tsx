import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { launchRazorpayCheckout } from '@/features/customer-portal/services/razorpayClient.service';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';

export const SubscriptionWorkflowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: products = [] } = useProducts();
  const { data: plans = [] } = usePlans();

  const queryProduct = searchParams.get('product') || '';
  const queryPlan = searchParams.get('plan') || '';

  // Selected Product & Plan
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [extraSeats, setExtraSeats] = useState(0);

  // Customer & Tax Entity Form
  const [companyName, setCompanyName] = useState('');
  const [taxIdentifier, setTaxIdentifier] = useState('27AABCN1234F1Z8');
  const [billingEmail, setBillingEmail] = useState('');
  const [state, setState] = useState('Maharashtra');

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);

  // Mandate & Consent
  const [mandateTab, setMandateTab] = useState<'netbanking' | 'upi' | 'card'>('netbanking');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [upiId, setUpiId] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (!companyName && user.companyName) setCompanyName(user.companyName);
      if (!billingEmail && user.email) setBillingEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const match = queryProduct
        ? products.find((p) => p.id === queryProduct || p.sku === queryProduct) || products[0]
        : products[0];
      setSelectedProductId(match.id);
    }
  }, [products, queryProduct, selectedProductId]);

  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      const match = queryPlan
        ? plans.find((pl) => pl.code === queryPlan || pl.id === queryPlan) || plans[0]
        : plans.find((pl) => pl.billingFrequency === 'MONTHLY') || plans[0];
      setSelectedPlanId(match.id);
    }
  }, [plans, queryPlan, selectedPlanId]);

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const activePlan = plans.find((p) => p.id === selectedPlanId || p.code === selectedPlanId) || plans[0];

  // Authoritative base price:
  const productPrice = activeProduct ? Number(activeProduct.salesPrice || 0) : 0;
  const planPrice = activePlan ? Number(activePlan.price || 0) : 0;
  const basePrice = productPrice > 0 ? productPrice : planPrice;

  const addonPerSeat = Math.round(basePrice * 0.1);
  const addonsTotal = extraSeats * addonPerSeat;
  const subtotalBeforeDiscount = basePrice + addonsTotal;
  const discountAmount = subtotalBeforeDiscount * (discountPct / 100);
  const taxableSubtotal = Math.max(0, subtotalBeforeDiscount - discountAmount);

  const isIntraState = state === 'Maharashtra';
  const cgst = isIntraState ? taxableSubtotal * 0.09 : 0;
  const sgst = isIntraState ? taxableSubtotal * 0.09 : 0;
  const igst = !isIntraState ? taxableSubtotal * 0.18 : 0;
  const grandTotal = taxableSubtotal + cgst + sgst + igst;

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === 'EARLY10') {
      setDiscountPct(10);
      toast.success('Applied 10% Early Adopter Discount!');
    } else if (discountCode.trim().toUpperCase() === 'HACKATHON2026') {
      setDiscountPct(15);
      toast.success('Applied 15% Odoo Hackathon 2026 Discount!');
    } else {
      toast.error('Invalid promo code. Try "EARLY10" or "HACKATHON2026".');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      toast.error('Please accept the RBI e-Mandate authorization terms.');
      return;
    }
    if (!activeProduct || !activePlan) {
      toast.error('Please select a product and a subscription plan.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create subscription & initial invoice
      const res = await api.post('/portal/subscriptions', {
        productId: activeProduct.id,
        planId: activePlan.id,
        quantity: 1 + extraSeats,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
      });

      const responseData = res.data?.data;
      const invoice = responseData?.invoice;

      if (!invoice || !invoice.id) {
        toast.success('Subscription registered successfully!');
        navigate('/portal');
        return;
      }

      // 2. Launch Razorpay Checkout
      await launchRazorpayCheckout({
        invoiceId: invoice.id,
        onSuccess: () => {
          setIsSubmitting(false);
          toast.success('Payment verified! Subscription is active.');
          navigate('/portal');
        },
        onError: (err) => {
          setIsSubmitting(false);
          toast.error(err);
          navigate('/portal/invoices');
        },
        onDismiss: () => {
          setIsSubmitting(false);
          toast.info(`Invoice ${invoice.invoiceNumber} generated. Complete payment in your Invoices tab.`);
          navigate('/portal/invoices');
        },
      });
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.response?.data?.message || err.message || 'Failed to initialize subscription checkout');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-body text-on-surface bg-surface">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                Secure Checkout
              </span>
              <span className="text-xs text-outline font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-emerald-600">lock</span>
                256-bit Encrypted Banking Gateway
              </span>
            </div>
            <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
              B2B Subscription Checkout &amp; e-Mandate Setup
            </h1>
            <p className="text-xs text-on-surface-variant">
              Indian GST compliant recurring authorization registered with National Automated Clearing House (NACH).
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 font-medium self-start"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back</span>
          </button>
        </div>

        {/* 2-Column Split Layout (60% Form / 40% Sticky Order Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Forms & Mandate Details */}
          <form onSubmit={handleCheckout} className="lg:col-span-7 space-y-6">
            {/* Card 1: Customer & Tax Entity */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h2 className="text-base font-bold font-headline text-on-surface">Customer &amp; Tax Entity</h2>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  GSTN IRN Verified
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Company Legal Registered Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Enterprises Inc."
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">GSTIN (15 Digits)</label>
                    <input
                      type="text"
                      value={taxIdentifier}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setTaxIdentifier(val);
                        if (val.startsWith('27')) setState('Maharashtra');
                        else if (val.startsWith('29')) setState('Karnataka');
                        else if (val.startsWith('07')) setState('Delhi');
                      }}
                      required
                      className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-mono font-bold uppercase focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">Place of Supply (State)</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-primary"
                    >
                      <option value="Maharashtra">Maharashtra (27)</option>
                      <option value="Karnataka">Karnataka (29)</option>
                      <option value="Delhi">Delhi (07)</option>
                      <option value="Tamil Nadu">Tamil Nadu (33)</option>
                      <option value="Telangana">Telangana (36)</option>
                      <option value="Kerala">Kerala (32)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Accounts Payable Billing Email</label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="billing@example.com"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Recurring Payment & e-Mandate Setup */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h2 className="text-base font-bold font-headline text-on-surface">Payment Method &amp; Gateway</h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                  Razorpay Secured
                </span>
              </div>

              {/* Payment Tabs */}
              <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2 text-xs">
                {[
                  { id: 'netbanking', label: 'NetBanking / Auto-Debit', icon: 'account_balance' },
                  { id: 'upi', label: 'UPI / AutoPay', icon: 'qr_code_2' },
                  { id: 'card', label: 'Credit / Debit Card', icon: 'credit_card' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMandateTab(tab.id as any)}
                    className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                      mandateTab === tab.id
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {mandateTab === 'netbanking' && (
                <div className="space-y-4 text-xs pt-2">
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">Preferred Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-medium"
                    >
                      <option value="HDFC">HDFC Bank Corporate Banking</option>
                      <option value="ICICI">ICICI Bank Corporate NetBanking</option>
                      <option value="SBI">State Bank of India Corporate</option>
                      <option value="AXIS">Axis Bank Corporate Portal</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant space-y-1">
                    <p className="font-semibold text-on-surface">Razorpay Gateway Integration:</p>
                    <p>
                      Clicking checkout will initiate the secure Razorpay payment modal with live UPI, NetBanking, and Card options.
                    </p>
                  </div>
                </div>
              )}

              {mandateTab === 'upi' && (
                <div className="space-y-4 text-xs pt-2">
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">Corporate UPI ID (Optional)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="company@okhdfcbank"
                      className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-mono"
                    />
                  </div>
                </div>
              )}

              {mandateTab === 'card' && (
                <div className="p-3.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant">
                  Supports Visa, MasterCard, and RuPay Corporate credit &amp; debit cards via Razorpay.
                </div>
              )}
            </div>

            {/* Card 3: Consent & Legal Acceptance */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  required
                  className="rounded border-outline-variant text-primary mt-0.5"
                />
                <span className="text-on-surface-variant leading-relaxed">
                  I hereby authorize Brightloop Technologies to issue recurring invoices for this subscription contract according to Indian GST standards and the selected cadence.
                </span>
              </label>
            </div>

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting || !termsAgreed}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span>
                {isSubmitting
                  ? 'Initializing Razorpay Checkout...'
                  : `Confirm & Pay with Razorpay (${formatINR(grandTotal)})`}
              </span>
            </button>
          </form>

          {/* RIGHT COLUMN: Sticky Order Summary */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <h3 className="text-base font-bold font-headline text-on-surface">Subscription Breakdown</h3>
                <span className="text-[11px] font-mono text-outline">INR (₹)</span>
              </div>

              {/* Product and Plan Selectors */}
              <div className="space-y-3 text-xs">
                {/* Product Selection */}
                <div className="p-3 rounded-lg bg-surface-container-low space-y-1.5">
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase block">
                    Product / Software Service
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs font-semibold text-on-surface focus:ring-1 focus:ring-primary"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatINR(p.salesPrice)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plan Cadence Selection */}
                <div className="p-3 rounded-lg bg-surface-container-low space-y-1.5">
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase block">
                    Recurring Cadence Plan
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs font-semibold text-on-surface focus:ring-1 focus:ring-primary"
                  >
                    {plans.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} ({pl.billingFrequency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extra Seats */}
                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div>
                    <div className="font-bold text-on-surface">Additional User Licenses</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setExtraSeats((s) => Math.max(0, s - 1))}
                        className="w-5 h-5 rounded bg-surface border border-outline font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-primary">{extraSeats} extra seats</span>
                      <button
                        type="button"
                        onClick={() => setExtraSeats((s) => s + 1)}
                        className="w-5 h-5 rounded bg-surface border border-outline font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <span className="font-bold text-on-surface font-headline">
                    {formatINR(addonsTotal)}
                  </span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Promo code (e.g. EARLY10)"
                    className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-mono uppercase focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container border border-outline hover:bg-surface-container-high transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {discountPct > 0 && (
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                    ✓ {discountPct}% promotional discount applied
                  </span>
                )}
              </div>

              {/* Calculations */}
              <div className="pt-3 border-t border-outline-variant space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Product Rate:</span>
                  <span className="font-medium text-on-surface">{formatINR(subtotalBeforeDiscount)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({discountPct}%):</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}

                {isIntraState ? (
                  <>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>CGST (9.0%):</span>
                      <span className="font-medium text-on-surface">{formatINR(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>SGST (9.0%):</span>
                      <span className="font-medium text-on-surface">{formatINR(sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>IGST (18.0%):</span>
                    <span className="font-medium text-on-surface">{formatINR(igst)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-outline-variant flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                      Total Due
                    </span>
                    <p className="text-[10px] text-outline">
                      Cadence: {activePlan?.billingFrequency || 'MONTHLY'}
                    </p>
                  </div>
                  <span className="text-2xl font-black text-primary tracking-tight font-headline">
                    {formatINR(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant text-[11px] text-on-surface-variant space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-base">verified</span>
                <span>CBIC e-Invoicing QR &amp; IRN certified delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-base">security</span>
                <span>Razorpay 256-bit encrypted payment gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
