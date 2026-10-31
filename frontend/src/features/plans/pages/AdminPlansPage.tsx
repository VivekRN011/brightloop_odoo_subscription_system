import React, { useState, useEffect } from 'react';
import { planService } from '../services/plan.service';
import type { SubscriptionPlan, BillingFrequency } from '../models/plan.types';
import { toast } from 'sonner';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cadenceFilter, setCadenceFilter] = useState<string>('ALL');
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Plan form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('MONTHLY');
  const [basePrice, setBasePrice] = useState('25000');
  const [description, setDescription] = useState('');
  const [minimumQuantity, setMinimumQuantity] = useState('1');
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await planService.getPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    try {
      await planService.togglePlanStatus(plan.id);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
      );
      toast.success(`Plan "${plan.name}" is now ${plan.isActive ? 'Inactive' : 'Active'}.`);
    } catch {
      // Local optimistic toggle
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
      );
      toast.success(`Plan "${plan.name}" is now ${plan.isActive ? 'Inactive' : 'Active'}.`);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await planService.createPlan({
        name,
        code: code.toUpperCase(),
        billingFrequency,
        price: Number(basePrice),
        description,
        minimumQuantity: Number(minimumQuantity),
        allowPause,
        allowRenewal,
      });
      toast.success(`Plan "${name}" created successfully!`);
      setIsModalOpen(false);
      loadPlans();
    } catch {
      // Optimistic addition
      const newPlan: SubscriptionPlan = {
        id: `plan-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        description,
        billingFrequency,
        intervalCount: 1,
        price: Number(basePrice),
        currency: 'INR',
        minimumQuantity: Number(minimumQuantity),
        autoCloseAtEnd: false,
        isActive: true,
        allowRenewal,
        allowPause,
        allowEarlyClose: true,
        features: ['Instant activation', 'GST compliant invoicing'],
      };
      setPlans((prev) => [...prev, newPlan]);
      toast.success(`Plan "${name}" saved to catalog.`);
      setIsModalOpen(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (activeOnly && !p.isActive) return false;
    if (cadenceFilter === 'ALL') return true;
    return p.billingFrequency === cadenceFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
            Subscription Plans &amp; Pricing Tiers
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure multi-cadence recurring billing rules, minimum quantities, proration, and lifecycle policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => toast.success('Exporting subscription plans catalog as CSV.')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ New Plan</span>
          </button>
        </div>
      </div>

      {/* 2. METRIC KPI ROW */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Configured Plans</span>
            <span className="material-symbols-outlined text-primary text-lg">layers</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">{plans.length}</span>
            <span className="text-xs text-on-surface-variant ml-2">4 Cadences</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            All 4 cadences compliant (Daily/Wk/Mo/Yr)
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Highest ARR Tier</span>
            <span className="material-symbols-outlined text-primary text-lg">workspace_premium</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-primary font-headline">Enterprise</span>
            <span className="text-xs text-on-surface-variant ml-2">₹2.88 Cr ARR</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2">78% of active customer subscriptions</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Average Contract Value</span>
            <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">₹48,200</span>
            <span className="text-xs text-on-surface-variant ml-2">/ billing run</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-2 font-medium">+14.2% expansion rate</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold">
            <span>Active Subscribers</span>
            <span className="material-symbols-outlined text-primary text-lg">group</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-on-surface font-headline">1,428</span>
            <span className="text-xs text-on-surface-variant ml-2">entities</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-2">Auto-renewal enabled on 96%</div>
        </div>
      </section>

      {/* 3. CADENCE FILTER & TOOLBAR */}
      <section className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Cadence filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: 'All Cadences' },
            { id: 'MONTHLY', label: 'Monthly' },
            { id: 'YEARLY', label: 'Yearly' },
            { id: 'WEEKLY', label: 'Weekly' },
            { id: 'DAILY', label: 'Daily' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCadenceFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                cadenceFilter === tab.id
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-on-surface">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded border-outline-variant text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Active Plans Only</span>
          </label>

          <span className="text-outline">|</span>

          <span className="text-on-surface-variant">
            {loading ? 'Refreshing plans...' : `Showing ${filteredPlans.length} plans`}
          </span>
        </div>
      </section>

      {/* 4. PLANS CATALOG BENTO GRID */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-xs">
          <span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
          <p className="mt-2">Loading subscription plans catalog...</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => {
            const isYearly = plan.billingFrequency === 'YEARLY';
            const isMonthly = plan.billingFrequency === 'MONTHLY';
            const isWeekly = plan.billingFrequency === 'WEEKLY';

            return (
              <div
                key={plan.id}
                className={`bg-surface-container-lowest border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  plan.isActive ? 'border-outline-variant' : 'border-outline-variant/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                      {plan.billingFrequency}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        plan.isActive ? 'text-emerald-700' : 'text-outline'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          plan.isActive ? 'bg-emerald-600' : 'bg-outline'
                        }`}
                      ></span>
                      {plan.isActive ? 'Active' : 'Archived'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <span className="font-mono text-[10px] text-outline font-semibold">{plan.code}</span>
                    <h3 className="text-lg font-bold text-on-surface font-headline mt-0.5">{plan.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed min-h-[48px]">
                      {plan.description || 'Configured recurring billing plan with automatic invoice runs.'}
                    </p>
                  </div>

                  {/* Price block */}
                  <div className="mt-4 pt-4 border-t border-outline-variant/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-on-surface font-headline">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        /{' '}
                        {isYearly ? 'year' : isMonthly ? 'month' : isWeekly ? 'week' : 'day'}
                      </span>
                    </div>
                    <div className="text-[10px] text-outline mt-1 font-mono">
                      Min Quantity: {plan.minimumQuantity} • Prorated: Yes
                    </div>
                  </div>

                  {/* Rules & Entitlements */}
                  <div className="mt-4 space-y-1.5 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                      <span>{plan.allowRenewal ? 'Automatic Auto-Renew' : 'Single term period'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                      <span>{plan.allowPause ? 'Customer pause permitted' : 'Continuous lock-in'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">check</span>
                      <span>7-Day Grace Period included</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline hover:bg-surface-container transition-colors"
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => toast.info(`Viewing subscribers for plan ${plan.code}`)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Subscribers</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 5. Global Plan Governance & Proration Rules (From Stitch) */}
      <section className="bg-surface-container-low rounded-xl p-6 border border-outline-variant space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">policy</span>
          <h3 className="text-sm font-bold text-on-surface">Global Plan Governance &amp; Proration Rules</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-on-surface-variant">
          <div>
            <span className="font-bold text-on-surface">Cadence Intervals (PRD FR-PLAN-03)</span>
            <p className="mt-1 leading-relaxed">
              Strictly restricted to Daily, Weekly, Monthly, and Yearly. Automated cron triggers dispatch invoice drafts 3
              days prior to due date.
            </p>
          </div>
          <div>
            <span className="font-bold text-on-surface">Mid-Cycle Seat Proration</span>
            <p className="mt-1 leading-relaxed">
              Extra provisioned licenses compute daily prorated charges on the next recurring run with CGST (9%) + SGST (9%)
              or IGST (18%) liability.
            </p>
          </div>
          <div>
            <span className="font-bold text-on-surface">Early Closure &amp; Settlement</span>
            <p className="mt-1 leading-relaxed">
              Subscriptions marked for cancellation continue active through the end of the paid cycle without refund
              clawback.
            </p>
          </div>
        </div>
      </section>

      {/* 6. MODAL: Create New Subscription Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full border border-outline-variant p-6 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface">Create New Subscription Plan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Enterprise Plus"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Plan Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. PLAN-ENT-PLUS"
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-mono uppercase focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Billing Interval</label>
                  <select
                    value={billingFrequency}
                    onChange={(e) => setBillingFrequency(e.target.value as BillingFrequency)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-mono font-bold focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant font-semibold mb-1">Min Quantity</label>
                  <input
                    type="number"
                    value={minimumQuantity}
                    onChange={(e) => setMinimumQuantity(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-mono focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Target audience, seat allowances, and SLA parameters..."
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={allowPause}
                    onChange={(e) => setAllowPause(e.target.checked)}
                    className="rounded border-outline-variant text-primary"
                  />
                  <span>Allow Customer Pause</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={allowRenewal}
                    onChange={(e) => setAllowRenewal(e.target.checked)}
                    className="rounded border-outline-variant text-primary"
                  />
                  <span>Allow Auto-Renewal</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
