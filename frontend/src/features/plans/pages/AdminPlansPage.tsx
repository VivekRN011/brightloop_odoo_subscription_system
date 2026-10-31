import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/services/api';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';

interface AdminPlanItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  billingFrequency: string;
  intervalCount: number;
  price: number;
  currency: string;
  minimumQuantity: number;
  allowPause: boolean;
  allowEarlyClose: boolean;
  allowRenewal: boolean;
  autoCloseAtEnd: boolean;
  isActive: boolean;
}

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<AdminPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Plan Form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    billingFrequency: 'MONTHLY',
    intervalCount: '1',
    price: '',
    minimumQuantity: '1',
    allowPause: true,
    allowEarlyClose: true,
    allowRenewal: true,
    autoCloseAtEnd: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/plans');
      const items = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.data?.items)
        ? response.data.data.items
        : [];
      setPlans(items);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        billingFrequency: formData.billingFrequency,
        intervalCount: Number(formData.intervalCount) || 1,
        price: Number(formData.price),
        currency: 'INR',
        minimumQuantity: Number(formData.minimumQuantity) || 1,
        allowPause: formData.allowPause,
        allowEarlyClose: formData.allowEarlyClose,
        allowRenewal: formData.allowRenewal,
        autoCloseAtEnd: formData.autoCloseAtEnd,
        isActive: true,
      };

      const res = await api.post('/plans', payload);
      if (res.data?.success && res.data.data) {
        setPlans((prev) => [res.data.data, ...prev]);
      }
      setIsModalOpen(false);
      setFormData({
        code: '',
        name: '',
        description: '',
        billingFrequency: 'MONTHLY',
        intervalCount: '1',
        price: '',
        minimumQuantity: '1',
        allowPause: true,
        allowEarlyClose: true,
        allowRenewal: true,
        autoCloseAtEnd: false,
      });
      setActionMessage(`Subscription plan ${formData.name} created successfully.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create plan');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    try {
      await api.patch(`/plans/${id}/status`);
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
      );
      setActionMessage(`Plan ${name} status updated to ${!currentStatus ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle plan status');
    }
  };

  const filtered = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());

    const matchesFreq = frequencyFilter === 'ALL' || p.billingFrequency === frequencyFilter;
    return matchesSearch && matchesFreq;
  });

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Repeat size={22} className="text-indigo-600" />
            <span>Subscription Plan Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure recurring billing cadences (Daily, Weekly, Monthly, Yearly), pricing tiers and lifecycle permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="text-xs h-9 px-3 gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Create Plan</span>
          </Button>
        </div>
      </div>

      {/* Search & Cadence Filters */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search plans by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFrequencyFilter(freq)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                frequencyFilter === freq
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {freq === 'ALL' ? 'All Cadences' : freq}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Plan Name / Code</th>
                <th className="py-3 px-4">Cadence</th>
                <th className="py-3 px-4">Recurring Price</th>
                <th className="py-3 px-4">Min Quantity</th>
                <th className="py-3 px-4">Lifecycle Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 h-12 bg-slate-50/40 dark:bg-slate-800/20" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No subscription plans found.
                  </td>
                </tr>
              ) : (
                filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{plan.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{plan.code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {plan.billingFrequency} {plan.intervalCount > 1 ? `(${plan.intervalCount})` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(plan.price)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {plan.minimumQuantity} unit
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {plan.allowPause && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Pause</span>}
                        {plan.allowEarlyClose && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Early Close</span>}
                        {plan.allowRenewal && <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Renew</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          plan.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(plan.id, plan.isActive, plan.name)}
                        className="text-xs h-7 px-2"
                      >
                        {plan.isActive ? (
                          <span className="text-rose-600 font-semibold">Deactivate</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Activate</span>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Create Subscription Plan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Annual"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Plan Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PLAN-ENT-Y"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Billing Frequency</label>
                  <select
                    value={formData.billingFrequency}
                    onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Interval Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.intervalCount}
                    onChange={(e) => setFormData({ ...formData, intervalCount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recurring Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 45000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Minimum Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minimumQuantity}
                    onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Plan features, quota inclusions and terms..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              {/* Lifecycle Permission Flags */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Lifecycle Permissions</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowPause}
                      onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                    />
                    <span>Allow Customer Pause</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowEarlyClose}
                      onChange={(e) => setFormData({ ...formData, allowEarlyClose: e.target.checked })}
                    />
                    <span>Allow Early Closure</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowRenewal}
                      onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                    />
                    <span>Allow Renewal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoCloseAtEnd}
                      onChange={(e) => setFormData({ ...formData, autoCloseAtEnd: e.target.checked })}
                    />
                    <span>Auto-close at End</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
