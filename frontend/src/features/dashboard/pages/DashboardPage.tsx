import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  IndianRupee,
  Clock,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Calendar,
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboard';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '../components/MetricCard';
import { RevenueOverview } from '../components/RevenueOverview';
import { SubscriptionOverview } from '../components/SubscriptionOverview';
import { RecentInvoicesTable } from '../components/RecentInvoicesTable';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { QuickActions } from '../components/QuickActions';
import { MetricCardSkeleton, TableSkeleton } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Dashboard"
          description="Monitor subscriptions, revenue, and billing activity."
        />
        <div className="kpi-grid">
          {[1, 2, 3, 4].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TableSkeleton rows={4} />
          </div>
          <div>
            <TableSkeleton rows={3} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Dashboard"
          description="Monitor subscriptions, revenue, and billing activity."
        />
        <ErrorState
          title="Failed to Load Dashboard Data"
          message="Could not retrieve subscription and billing metrics from the server. Please check that the Brightloop backend is running."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const { metrics, revenueTrend, subscriptionOverview, recentInvoices, recentActivities } = data;

  return (
    <div className="page-container space-y-6">
      {/* Section 1: Page Header */}
      <PageHeader
        title="Dashboard"
        description="Monitor subscriptions, revenue, and billing activity."
        actions={
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <Calendar size={13} className="text-slate-400" />
              <span>Oct 2026 (Live)</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-xs"
              title="Refresh dashboard metrics"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/app/subscriptions')}
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <PlusCircle size={13} />
              <span>New Subscription</span>
            </Button>
          </div>
        }
      />

      {/* Section 2: Four Core Financial & Lifecycle KPI Cards */}
      <div className="kpi-grid">
        {/* Card 1: Active Subscriptions */}
        <MetricCard
          metric={metrics.activeSubscriptions}
          icon={<Repeat size={20} />}
          colorVar="#16a34a"
        />

        {/* Card 2: Revenue Received */}
        <MetricCard
          metric={metrics.revenueReceived}
          icon={<IndianRupee size={20} />}
          colorVar="#4f6ef7"
        />

        {/* Card 3: Outstanding Amount */}
        <MetricCard
          metric={metrics.outstandingAmount}
          icon={<Clock size={20} />}
          colorVar="#0284c7"
        />

        {/* Card 4: Overdue Invoices */}
        <MetricCard
          metric={metrics.overdueInvoices}
          icon={<AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />}
          colorVar="#ef4444"
        />
      </div>

      {/* Section 3 & 4: Revenue Trend & Subscription Lifecycle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueOverview data={revenueTrend} />
        </div>
        <div>
          <SubscriptionOverview data={subscriptionOverview} />
        </div>
      </div>

      {/* Section 5, 6 & 7: Recent Invoices, Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentInvoicesTable invoices={recentInvoices} />
        </div>

        <div className="space-y-6">
          <QuickActions />
          <RecentActivityFeed activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

