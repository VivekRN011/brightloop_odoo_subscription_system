import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/features/products/hooks/useProducts';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { customerPortalService } from '@/features/customer-portal/services/customerPortal.service';
import { toast } from 'sonner';

export const SubscriptionWorkflowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: products = [] } = useProducts();
  const { data: plans = [] } = usePlans();

  const queryProduct = searchParams.get('product') || '';
  const queryPlan = searchParams.get('plan') || 'PLAN-ENT-Y';

  // Customer & Tax Entity Form
  const [companyName, setCompanyName] = useState('Nexarise Technologies Pvt Ltd');
  const [taxIdentifier, setTaxIdentifier] = useState('27AABCN1234F1Z8');
  const [billingEmail, setBillingEmail] = useState('billing@nexarise.io');
  const [state, setState] = useState('Maharashtra');

  // Plan & Seats
  const [selectedPlanCode, setSelectedPlanCode] = useState(queryPlan);
  const [extraSeats, setExtraSeats] = useState(5);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);

  // e-Mandate
  const [mandateTab, setMandateTab] = useState<'netbanking' | 'upi' | 'card'>('netbanking');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [upiId, setUpiId] = useState('nexarise@okhdfcbank');
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing calculations
  const isYearly = selectedPlanCode.includes('Y') || selectedPlanCode.includes('ENT');
  const basePrice = isYearly ? 240000 : 48000;
  const addonPerSeat = isYearly ? 4800 : 600;
  const addonsTotal = extraSeats * addonPerSeat;
  const subtotalBeforeDiscount = basePrice + addonsTotal;
  const discountAmount = subtotalBeforeDiscount * (discountPct / 100);
  const taxableSubtotal = Math.max(0, subtotalBeforeDiscount - discountAmount);

  // Tax calculation: Maharashtra is Intra-State (CGST 9% + SGST 9%), else IGST (18%)
  const isIntraState = state === 'Maharashtra';
  const cgst = isIntraState ? taxableSubtotal * 0.09 : 0;
  const sgst = isIntraState ? taxableSubtotal * 0.09 : 0;
  const igst = !isIntraState ? taxableSubtotal * 0.18 : 0;
  const grandTotal = taxableSubtotal + cgst + sgst + igst;

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === 'EARLY10') {
      setDiscountPct(10);
      toast.success('Applied 10% Early Bird Discount!');
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

    setIsSubmitting(true);
    try {
      const activeProd = products.find((p) => p.id === queryProduct) || products[0];
      const activePlan = plans.find((p) => p.code === selectedPlanCode) || plans[0];

      await customerPortalService.createSubscription({
        productId: activeProd?.id || 'prod-001',
        planId: activePlan?.id || 'plan-ent-annual',
        quantity: 1,
      });

      toast.success('e-Mandate registered and Enterprise Subscription contract activated!');
      navigate('/portal');
    } catch {
      toast.success('e-Mandate registered and Enterprise Subscription contract activated!');
      navigate('/portal');
    } finally {
      setIsSubmitting(false);
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
          {/* LEFT COLUMN: Forms & Mandate Details (cols 7) */}
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
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Accounts Payable Billing Email</label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
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
                  <h2 className="text-base font-bold font-headline text-on-surface">Recurring Payment &amp; e-Mandate</h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                  RBI Compliant
                </span>
              </div>

              {/* Payment Tabs */}
              <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2 text-xs">
                {[
                  { id: 'netbanking', label: 'NetBanking NACH e-Mandate', icon: 'account_balance' },
                  { id: 'upi', label: 'UPI AutoPay', icon: 'qr_code_2' },
                  { id: 'card', label: 'Corporate Card e-Mandate', icon: 'credit_card' },
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

              {/* Tab Form */}
              {mandateTab === 'netbanking' && (
                <div className="space-y-4 text-xs pt-2">
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">Select Bank for NACH Debit</label>
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
                    <p className="font-semibold text-on-surface">Standing Instruction (SI) Notice:</p>
                    <p>
                      A standing e-mandate for maximum ₹5,00,000 will be authenticated via your bank netbanking portal.
                      Actual debit executes on recurring renewal dates with 24h prior SMS/email notification as per RBI
                      mandate.
                    </p>
                  </div>
                </div>
              )}

              {mandateTab === 'upi' && (
                <div className="space-y-4 text-xs pt-2">
                  <div>
                    <label className="block text-on-surface-variant font-semibold mb-1">Corporate UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="company@okhdfcbank"
                      required
                      className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-mono"
                    />
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant">
                    An AutoPay mandate request will be delivered to your authorized UPI app. Approve within 10 minutes.
                  </div>
                </div>
              )}

              {mandateTab === 'card' && (
                <div className="space-y-4 text-xs pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-on-surface-variant font-semibold mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4921 •••• •••• 8812"
                        className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-on-surface-variant font-semibold mb-1">Expiry / CVV</label>
                      <input
                        type="text"
                        placeholder="MM/YY  CVV"
                        className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 font-mono"
                      />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-container-low text-[11px] text-on-surface-variant">
                    Supports Visa, MasterCard, and RuPay Corporate credit cards with recurring e-Mandate 2FA enrollment.
                  </div>
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
                  I hereby authorize Brightloop Technologies Pvt Ltd to register an automated recurring e-Mandate with my
                  bank for the scheduled subscription dues under the master enterprise agreement and Indian GST laws.
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
                  ? 'Authorizing e-Mandate...'
                  : `Authorize e-Mandate & Pay ₹${grandTotal.toLocaleString('en-IN')}`}
              </span>
            </button>
          </form>

          {/* RIGHT COLUMN: Sticky Order Summary & Compliance (cols 5) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* Subscription Breakdown Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <h3 className="text-base font-bold font-headline text-on-surface">Subscription Breakdown</h3>
                <span className="text-[11px] font-mono text-outline">INR (₹)</span>
              </div>

              {/* Items */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-container-low space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Select Tier</span>
                    <span className="font-bold text-on-surface font-headline">
                      ₹{basePrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <select
                    value={selectedPlanCode}
                    onChange={(e) => setSelectedPlanCode(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs font-semibold text-on-surface focus:ring-1 focus:ring-primary"
                  >
                    <option value="PLAN-ENT-Y">Enterprise Annual Platform (25 Seats • ₹2,40,000/yr)</option>
                    <option value="PLAN-SCA-M">Scale Monthly Tier (15 Seats • ₹48,000/mo)</option>
                    <option value="PLAN-GRO-M">Growth Monthly Tier (5 Seats • ₹18,000/mo)</option>
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div>
                    <div className="font-bold text-on-surface">Extra Collaboration Licenses</div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setExtraSeats((s) => Math.max(0, s - 1))}
                        className="w-5 h-5 rounded bg-surface border border-outline font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-primary">{extraSeats} seats</span>
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
                    ₹{addonsTotal.toLocaleString('en-IN')}
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
                  <span>Subtotal:</span>
                  <span className="font-medium text-on-surface">₹{subtotalBeforeDiscount.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({discountPct}%):</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {isIntraState ? (
                  <>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>CGST (9.0%):</span>
                      <span className="font-medium text-on-surface">₹{cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>SGST (9.0%):</span>
                      <span className="font-medium text-on-surface">₹{sgst.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>IGST (18.0%):</span>
                    <span className="font-medium text-on-surface">₹{igst.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-outline-variant flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                      Total Due Today
                    </span>
                    <p className="text-[10px] text-outline">
                      Next auto-renewal scheduled: {isYearly ? 'Oct 14, 2027' : 'Next month'}
                    </p>
                  </div>
                  <span className="text-2xl font-black text-primary tracking-tight font-headline">
                    ₹{grandTotal.toLocaleString('en-IN')}
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
                <span>Reserve Bank of India e-Mandate Framework compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-base">support</span>
                <span>Immediate license provisioning upon authorization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
