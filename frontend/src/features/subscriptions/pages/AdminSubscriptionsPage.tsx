import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Play,
  Pause,
  XCircle,
  FileText,
  RefreshCw,
  Plus,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import {
  subscriptionService,
  type AdminSubscriptionItem,
} from '../services/subscription.service';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const AdminSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await subscriptionService.getSubscriptions();
      setSubscriptions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePause = async (id: string, num: string) => {
    await subscriptionService.pauseSubscription(id);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'PAUSED' } : s))
    );
    setActionMessage(`Subscription ${num} has been paused.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleResume = async (id: string, num: string) => {
    await subscriptionService.resumeSubscription(id);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'ACTIVE' } : s))
    );
    setActionMessage(`Subscription ${num} resumed to Active status.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleClose = async (id: string, num: string) => {
    await subscriptionService.closeSubscription(id, 'Early closure by admin');
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'CLOSED' } : s))
    );
    setActionMessage(`Subscription ${num} closed successfully.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleGenerateInvoice = async (id: string, num: string) => {
    await subscriptionService.generateInvoice(id);
    setActionMessage(`Invoice triggered for ${num}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const filtered = subscriptions.filter((s) => {
    const matchesSearch =
      s.subscriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.planName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || s.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const activeCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'PAUSED').length;
  const draftCount = subscriptions.filter((s) => s.status === 'DRAFT' || s.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Subscription Lifecycle
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage corporate recurring contracts across Draft, Confirmed, Active, Paused, and Closed states (FR-SUB-07).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </Button>
          <Button
            size="sm"
            onClick={() => window.location.href = '/subscribe'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>New Subscription</span>
          </Button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Subscriptions</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{subscriptions.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Active</span>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20">
          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Paused</span>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">{pausedCount}</div>
        </div>
        <div className="p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20">
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Draft / Quotation</span>
          <div className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">{draftCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'ACTIVE', 'PAUSED', 'CONFIRMED', 'DRAFT', 'CLOSED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan &amp; Interval</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Recurring Value</th>
                <th className="py-3 px-4">Next Billing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching subscriptions found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  const statusColors: Record<string, string> = {
                    ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                    PAUSED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
                    DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                    CLOSED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                  };

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary hover:underline">
                        <Link to={`/app/subscriptions/${sub.subscriptionNumber}`}>
                          {sub.subscriptionNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {sub.customerName}
                        </div>
                        {sub.customerCode && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {sub.customerCode}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {sub.planName}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {sub.billingFrequency.toLowerCase()} ({sub.quantity} units)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            statusColors[sub.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(sub.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {sub.nextBillingAt ? sub.nextBillingAt.slice(0, 10) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/app/subscriptions/${sub.subscriptionNumber}`}
                            title="View Subscription Details"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 transition-colors"
                          >
                            <Eye size={12} />
                          </Link>
                          {sub.status === 'ACTIVE' && (
                            <>
                              <button
                                type="button"
                                title="Pause Subscription"
                                onClick={() => handlePause(sub.id, sub.subscriptionNumber)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 transition-colors"
                              >
                                <Pause size={12} />
                              </button>
                              <button
                                type="button"
                                title="Generate Invoice Now"
                                onClick={() => handleGenerateInvoice(sub.id, sub.subscriptionNumber)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 transition-colors"
                              >
                                <FileText size={12} />
                              </button>
                            </>
                          )}
                          {sub.status === 'PAUSED' && (
                            <button
                              type="button"
                              title="Resume Subscription"
                              onClick={() => handleResume(sub.id, sub.subscriptionNumber)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 transition-colors"
                            >
                              <Play size={12} />
                            </button>
                          )}
                          {sub.status !== 'CLOSED' && (
                            <button
                              type="button"
                              title="Close Subscription"
                              onClick={() => handleClose(sub.id, sub.subscriptionNumber)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors"
                            >
                              <XCircle size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
