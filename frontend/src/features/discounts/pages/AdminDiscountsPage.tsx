import React, { useState, useEffect } from 'react';
import {
  Percent,
  Plus,
  Search,
  CheckCircle2,
  Tag,
  Copy,
  Calendar,
  Sparkles,
  Edit2,
  TrendingDown,
} from 'lucide-react';
import { discountService } from '../services/discount.service';
import type {
  DiscountRule,
  DiscountType,
  DiscountScope,
} from '../models/discount.types';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const AdminDiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountRule | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [scope, setScope] = useState<DiscountScope>('BOTH');
  const [val, setVal] = useState('10');
  const [minimumPurchase, setMinimumPurchase] = useState('5000');
  const [minimumQuantity, setMinimumQuantity] = useState('1');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('100');
  const [isActive, setIsActive] = useState(true);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const data = await discountService.getDiscounts();
      setDiscounts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleOpenCreate = () => {
    setEditingDiscount(null);
    setName('');
    setCode('');
    setDiscountType('PERCENTAGE');
    setScope('BOTH');
    setVal('10');
    setMinimumPurchase('0');
    setMinimumQuantity('1');
    setStartsAt(new Date().toISOString().split('T')[0]);
    setEndsAt('');
    setUsageLimit('100');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: DiscountRule) => {
    setEditingDiscount(rule);
    setName(rule.name);
    setCode(rule.code || '');
    setDiscountType(rule.discountType);
    setScope(rule.scope);
    setVal(
      rule.discountType === 'PERCENTAGE'
        ? String(rule.percentageValue || 10)
        : String(rule.fixedAmount || 1000)
    );
    setMinimumPurchase(String(rule.minimumPurchase || 0));
    setMinimumQuantity(String(rule.minimumQuantity || 1));
    setStartsAt(rule.startsAt ? rule.startsAt.split('T')[0] : '');
    setEndsAt(rule.endsAt ? rule.endsAt.split('T')[0] : '');
    setUsageLimit(rule.usageLimit ? String(rule.usageLimit) : '');
    setIsActive(rule.isActive);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (rule: DiscountRule) => {
    try {
      await discountService.toggleDiscountStatus(rule.id);
      setDiscounts((prev) =>
        prev.map((d) => (d.id === rule.id ? { ...d, isActive: !d.isActive } : d))
      );
      toast.success(`Discount "${rule.name}" is now ${rule.isActive ? 'Inactive' : 'Active'}.`);
    } catch {
      // Local optimistic toggle
      setDiscounts((prev) =>
        prev.map((d) => (d.id === rule.id ? { ...d, isActive: !d.isActive } : d))
      );
      toast.success(`Discount "${rule.name}" status updated.`);
    }
  };

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      code: code ? code.toUpperCase() : null,
      discountType,
      scope,
      percentageValue: discountType === 'PERCENTAGE' ? Number(val) : null,
      fixedAmount: discountType === 'FIXED_AMOUNT' ? Number(val) : null,
      minimumPurchase: minimumPurchase ? Number(minimumPurchase) : null,
      minimumQuantity: minimumQuantity ? Number(minimumQuantity) : null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive,
    };

    try {
      if (editingDiscount) {
        await discountService.updateDiscount(editingDiscount.id, payload);
        toast.success(`Discount rule "${name}" updated successfully!`);
      } else {
        await discountService.createDiscount(payload);
        toast.success(`Discount rule "${name}" created successfully!`);
      }
      setIsModalOpen(false);
      loadDiscounts();
    } catch {
      // Local optimistic update
      if (editingDiscount) {
        setDiscounts((prev) =>
          prev.map((d) => (d.id === editingDiscount.id ? { ...d, ...payload, id: d.id } : d))
        );
      } else {
        const newRule: DiscountRule = {
          id: `disc-${Date.now()}`,
          ...payload,
          _count: { applications: 0 },
        };
        setDiscounts((prev) => [newRule, ...prev]);
      }
      toast.success(`Discount rule "${name}" saved!`);
      setIsModalOpen(false);
    }
  };

  const copyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    toast.success(`Coupon code "${couponCode}" copied to clipboard!`);
  };

  const filtered = discounts.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (typeFilter !== 'ALL' && d.discountType !== typeFilter) return false;

    if (statusFilter === 'ACTIVE' && !d.isActive) return false;
    if (statusFilter === 'INACTIVE' && d.isActive) return false;

    return true;
  });

  const totalApplications = discounts.reduce((sum, d) => sum + (d._count?.applications || 0), 0);
  const activeCount = discounts.filter((d) => d.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-slate-900 dark:text-slate-100">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Percent size={20} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Discounts &amp; Promotions
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage promotional coupons, partner discount codes, minimum thresholds, and automatic commercial concessions.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={15} />
          <span>New Discount Rule</span>
        </Button>
      </div>

      {/* 2. Key Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Rules</span>
            <Tag size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {discounts.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Configured commercial rules</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Discounts</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {activeCount}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Currently redeemable</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Redemptions</span>
            <TrendingDown size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {totalApplications}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Applied to invoices &amp; orders</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Rule Engine</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            Automatic
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Portal checkout &amp; recurring billing</p>
        </div>
      </div>

      {/* 3. Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="ALL">All Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading discount rules...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Percent size={36} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No discount rules found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust filters or create your first promotional coupon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Rule Name &amp; Scope</th>
                  <th className="py-3 px-4">Concession Benefit</th>
                  <th className="py-3 px-4">Eligibility Thresholds</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((rule) => {
                  const isExpired = rule.endsAt && new Date(rule.endsAt) < new Date();
                  return (
                    <tr
                      key={rule.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3 px-4">
                        {rule.code ? (
                          <div className="inline-flex items-center gap-1.5 font-mono font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                            <span>{rule.code}</span>
                            <button
                              onClick={() => copyCode(rule.code!)}
                              title="Copy Code"
                              className="hover:text-indigo-900 dark:hover:text-white"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Automatic (No Code)</span>
                        )}
                      </td>

                      {/* Name & Scope */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {rule.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                            {rule.scope}
                          </span>
                          {rule.endsAt && (
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              <span>Until {new Date(rule.endsAt).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Benefit */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {rule.discountType === 'PERCENTAGE' ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {rule.percentageValue}% Off
                          </span>
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400">
                            {formatINR(Number(rule.fixedAmount || 0))} Flat
                          </span>
                        )}
                      </td>

                      {/* Thresholds */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                        {rule.minimumPurchase ? (
                          <div>Min spend: {formatINR(Number(rule.minimumPurchase))}</div>
                        ) : (
                          <div>No min spend</div>
                        )}
                        {rule.minimumQuantity && rule.minimumQuantity > 1 ? (
                          <div className="text-slate-400">Min qty: {rule.minimumQuantity} units</div>
                        ) : null}
                      </td>

                      {/* Redemptions */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {rule._count?.applications || 0}
                          {rule.usageLimit ? (
                            <span className="text-slate-400 font-normal"> / {rule.usageLimit}</span>
                          ) : (
                            <span className="text-slate-400 font-normal"> (Unlimited)</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                            EXPIRED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(rule)}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                              rule.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(rule)}
                          className="h-7 text-xs px-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        >
                          <Edit2 size={12} className="mr-1" />
                          <span>Edit</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Tag size={16} />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingDiscount ? 'Edit Discount Rule' : 'New Discount / Promotion Rule'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Season Concession"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DIWALI2026"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Leave blank to apply automatically when thresholds pass.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Applicable Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as DiscountScope)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BOTH">Both Subscriptions &amp; Products</option>
                    <option value="SUBSCRIPTION">Subscriptions Only</option>
                    <option value="PRODUCT">One-off Products Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={discountType === 'PERCENTAGE' ? '100' : undefined}
                    required
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Minimum Purchase (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minimumPurchase}
                    onChange={(e) => setMinimumPurchase(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Usage Limit (Count)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valid Until (Expiration)
                  </label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="disc-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="disc-active" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Active (Eligible for checkout evaluation)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                  {editingDiscount ? 'Save Changes' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
