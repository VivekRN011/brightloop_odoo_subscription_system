import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { reportsService, type RevenueMonth, type PlanSummary } from '../services/reports.service';
import { formatINR } from '@/lib/format';

const mockRevenueTimeline: RevenueMonth[] = [
  { month: '2026-05', amount: 142000 },
  { month: '2026-06', amount: 198500 },
  { month: '2026-07', amount: 175000 },
  { month: '2026-08', amount: 231000 },
  { month: '2026-09', amount: 189000 },
  { month: '2026-10', amount: 264500 },
];

const mockSubscriptionsByPlan: PlanSummary[] = [
  { planId: 'plan-1', planName: 'Starter Monthly', code: 'STARTER-M', price: 999, billingFrequency: 'MONTHLY', subscriptionCount: 48 },
  { planId: 'plan-2', planName: 'Growth Annual', code: 'GROWTH-A', price: 9999, billingFrequency: 'ANNUAL', subscriptionCount: 72 },
  { planId: 'plan-3', planName: 'Enterprise Monthly', code: 'ENT-M', price: 24999, billingFrequency: 'MONTHLY', subscriptionCount: 22 },
];

function formatMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function generateCSV(revenue: RevenueMonth[], plans: PlanSummary[]): string {
  const lines: string[] = [];
  lines.push('REVENUE TIMELINE');
  lines.push('Month,Amount (INR)');
  for (const r of [...revenue].reverse()) {
    lines.push(`${formatMonth(r.month)},${r.amount}`);
  }
  lines.push('');
  lines.push('SUBSCRIPTIONS BY PLAN');
  lines.push('Plan,Code,Billing Cycle,Price (INR),Subscribers');
  for (const p of plans) {
    lines.push(`"${p.planName}",${p.code},${p.billingFrequency},${p.price},${p.subscriptionCount}`);
  }
  return lines.join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminReportsPage() {
  const [revenue, setRevenue] = useState<RevenueMonth[]>([]);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await reportsService.getReports();
    setRevenue(data.revenueTimeline.length > 0 ? data.revenueTimeline : mockRevenueTimeline);
    setPlans(data.subscriptionsByPlan.length > 0 ? data.subscriptionsByPlan : mockSubscriptionsByPlan);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // KPI calculations
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
  const avgMonthlyRevenue = revenue.length > 0 ? totalRevenue / revenue.length : 0;
  const peakMonth = revenue.length > 0
    ? revenue.reduce((best, r) => r.amount > best.amount ? r : best, revenue[0])
    : null;
  const bestPlan = plans.length > 0
    ? plans.reduce((best, p) => p.subscriptionCount > best.subscriptionCount ? p : best, plans[0])
    : null;
  const totalSubs = plans.reduce((sum, p) => sum + p.subscriptionCount, 0);
  const maxRevenue = revenue.length > 0 ? Math.max(...revenue.map(r => r.amount)) : 1;

  const kpiCards = [
    { label: 'Total Revenue', value: formatINR(totalRevenue), icon: 'currency_rupee' },
    { label: 'Avg Monthly Revenue', value: formatINR(Math.round(avgMonthlyRevenue)), icon: 'trending_up' },
    { label: 'Peak Month', value: peakMonth ? formatMonth(peakMonth.month) : '—', icon: 'star' },
    { label: 'Best Plan', value: bestPlan ? bestPlan.planName : '—', icon: 'workspace_premium' },
  ];

  const handleExportCSV = () => {
    const csv = generateCSV(revenue, plans);
    const today = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `brightloop-reports-${today}.csv`);
    toast.success('CSV exported successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Revenue sorted newest first
  const sortedRevenue = [...revenue].reverse();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Reports &amp; Analytics</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Revenue trends, subscription breakdown, and platform performance insights.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container text-xs flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-xl">{card.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{card.label}</p>
              <p className="text-lg font-bold text-on-surface mt-0.5 truncate">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Timeline Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant">
          <h2 className="text-sm font-semibold text-on-surface">Revenue Timeline</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Monthly revenue across {revenue.length} period{revenue.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 font-semibold">Month</th>
                <th className="py-3 px-5 font-semibold">Revenue</th>
                <th className="py-3 px-5 font-semibold w-48">Bar</th>
                <th className="py-3 px-5 font-semibold">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
                  </td>
                </tr>
              ) : sortedRevenue.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-on-surface-variant">No revenue data available.</td>
                </tr>
              ) : (
                sortedRevenue.map(r => {
                  const pct = totalRevenue > 0 ? ((r.amount / totalRevenue) * 100).toFixed(1) : '0';
                  const barPct = maxRevenue > 0 ? (r.amount / maxRevenue) * 100 : 0;
                  return (
                    <tr key={r.month} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-5 font-medium text-on-surface">{formatMonth(r.month)}</td>
                      <td className="py-3 px-5 font-semibold text-on-surface">{formatINR(r.amount)}</td>
                      <td className="py-3 px-5">
                        <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-5 text-on-surface-variant">{pct}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Plans Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant">
          <h2 className="text-sm font-semibold text-on-surface">Subscriptions by Plan</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">{totalSubs} total subscribers across {plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 font-semibold">Plan</th>
                <th className="py-3 px-5 font-semibold">Code</th>
                <th className="py-3 px-5 font-semibold">Billing Cycle</th>
                <th className="py-3 px-5 font-semibold">Price</th>
                <th className="py-3 px-5 font-semibold">Subscribers</th>
                <th className="py-3 px-5 font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-on-surface-variant">No plan data available.</td>
                </tr>
              ) : (
                plans.map(plan => {
                  const share = totalSubs > 0 ? ((plan.subscriptionCount / totalSubs) * 100).toFixed(1) : '0';
                  return (
                    <tr key={plan.planId} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-5 font-medium text-on-surface">{plan.planName}</td>
                      <td className="py-3 px-5 font-mono text-on-surface-variant">{plan.code}</td>
                      <td className="py-3 px-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          plan.billingFrequency === 'ANNUAL'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                        }`}>
                          {plan.billingFrequency}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-semibold text-on-surface">{formatINR(plan.price)}</td>
                      <td className="py-3 px-5 text-on-surface">{plan.subscriptionCount}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-surface-container rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-primary"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-on-surface-variant">{share}%</span>
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
}
