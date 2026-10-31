import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { RevenueMonthlyPoint } from '../models/dashboard.types';
import { formatINR } from '@/lib/format';
import { EmptyState } from '@/components/shared/EmptyState';
import { BarChart3 } from 'lucide-react';

export interface RevenueOverviewProps {
  data: RevenueMonthlyPoint[];
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ data }) => {
  const [period, setPeriod] = useState<'6m' | '1y'>('6m');

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <EmptyState
          icon={<BarChart3 size={24} />}
          title="No Revenue Data"
          description="Revenue analytics will populate once invoices and payment allocations are recorded."
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Revenue & Billing Trend
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified received revenue vs confirmed invoice billings over time (in INR)
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setPeriod('6m')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              period === '6m'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Last 6 Months
          </button>
          <button
            type="button"
            onClick={() => setPeriod('1y')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              period === '1y'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            FY 2026-27
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--bl-border, #e2e8f0)"
              opacity={0.6}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--bl-muted-foreground, #64748b)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--bl-muted-foreground, #64748b)' }}
              tickFormatter={(value) => formatINR(value, true)}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                formatINR(Number(value) || 0),
                name === 'revenueReceived'
                  ? 'Revenue Received (Allocated)'
                  : 'Invoiced Amount (Confirmed)',
              ]}
              labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.96)',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              formatter={(value) =>
                value === 'revenueReceived'
                  ? 'Revenue Received'
                  : 'Total Invoiced'
              }
            />
            <Area
              type="monotone"
              dataKey="revenueReceived"
              name="revenueReceived"
              stroke="#4f6ef7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="invoicedAmount"
              name="invoicedAmount"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorInvoiced)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

