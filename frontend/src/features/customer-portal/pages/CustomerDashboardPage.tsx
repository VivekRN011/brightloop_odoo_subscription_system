import React from 'react';
import { Link } from 'react-router-dom';
import {
  Repeat,
  Calendar,
  AlertCircle,
  Receipt,
  CreditCard,
  FileCheck,
  Building,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { CustomerMetricCard } from '../components/CustomerMetricCard';
import { OutstandingAlert } from '../components/OutstandingAlert';
import { CustomerSubscriptionsList } from '../components/CustomerSubscriptionsList';
import { CustomerInvoicesList } from '../components/CustomerInvoicesList';
import { formatINR, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: summary, isLoading, isError, error, refetch } = useCustomerSummary();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
        </div>

        {/* 4 Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
            >
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded mb-3"></div>
              <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>

        {/* Content Region Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"></div>
            <div className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
          Unable to Load Subscriber Profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {error instanceof Error ? error.message : 'An error occurred while fetching your customer workspace data.'}
        </p>
        <Button
          onClick={() => refetch()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-2"
        >
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </Button>
      </div>
    );
  }

  const {
    profile,
    activeSubscriptionsCount,
    nextRenewalDate,
    nextRenewalPlan,
    totalOutstandingAmount,
    totalPaidAmount,
    paidInvoicesCount,
    subscriptions,
    recentInvoices,
    outstandingInvoices,
  } = summary;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {user?.name || profile.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={12} />
              Verified Account
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <Building size={13} />
              {profile.companyName}
            </span>
            {profile.customerCode && (
              <>
                <span>•</span>
                <span>Customer ID: <strong className="text-slate-700 dark:text-slate-300">{profile.customerCode}</strong></span>
              </>
            )}
            {profile.gstin && (
              <>
                <span>•</span>
                <span>GSTIN: <strong className="font-mono text-slate-700 dark:text-slate-300">{profile.gstin}</strong></span>
              </>
            )}
            {profile.city && profile.state && (
              <>
                <span>•</span>
                <span>{profile.city}, {profile.state}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-8 flex items-center gap-1.5"
            title="Refresh subscription data"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </Button>
          <Link to="/portal/profile">
            <Button
              size="sm"
              className="text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold"
            >
              Account Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Outstanding Payment Alert Section */}
      <OutstandingAlert
        outstandingAmount={totalOutstandingAmount}
        invoices={outstandingInvoices.length > 0 ? outstandingInvoices : recentInvoices}
      />

      {/* 4 Customer Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Subscriptions */}
        <CustomerMetricCard
          label="Active Subscriptions"
          value={activeSubscriptionsCount}
          subtext={
            activeSubscriptionsCount === 1
              ? '1 active recurring plan'
              : `${activeSubscriptionsCount} active recurring plans`
          }
          icon={<Repeat size={20} />}
          badge={{
            text: 'Live',
            variant: 'info',
          }}
        />

        {/* Card 2: Upcoming Renewal */}
        <CustomerMetricCard
          label="Next Plan Renewal"
          value={nextRenewalDate ? formatDate(nextRenewalDate) : 'None scheduled'}
          subtext={nextRenewalPlan || 'No upcoming scheduled renewal'}
          icon={<Calendar size={20} />}
          badge={{
            text: nextRenewalDate ? 'Upcoming' : 'None',
            variant: nextRenewalDate ? 'warning' : 'neutral',
          }}
        />

        {/* Card 3: Total Outstanding Balance */}
        <CustomerMetricCard
          label="Outstanding Balance"
          value={formatINR(totalOutstandingAmount)}
          subtext={
            totalOutstandingAmount > 0
              ? 'Invoice awaiting settlement'
              : 'All invoices settled in full'
          }
          icon={<AlertCircle size={20} />}
          badge={{
            text: totalOutstandingAmount > 0 ? 'Pending' : 'Clear',
            variant: totalOutstandingAmount > 0 ? 'warning' : 'success',
          }}
        />

        {/* Card 4: Paid Invoices & Lifetime Spend */}
        <CustomerMetricCard
          label="Paid Invoices"
          value={paidInvoicesCount}
          subtext={`Lifetime settled: ${formatINR(totalPaidAmount)}`}
          icon={<Receipt size={20} />}
          badge={{
            text: 'Settled',
            variant: 'success',
          }}
        />
      </div>

      {/* Main Grid: Subscriptions & Invoices with Sidebar Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Subscriptions & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscriptions List */}
          <CustomerSubscriptionsList
            subscriptions={subscriptions}
            showViewAll={true}
          />

          {/* Invoices List */}
          <div id="invoices-section">
            <CustomerInvoicesList
              invoices={recentInvoices}
              showViewAll={true}
            />
          </div>
        </div>

        {/* Right Column (1 col): Quick Actions & Support */}
        <div className="space-y-6">
          {/* Subscriber Quick Actions Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
              Quick Actions
            </h3>

            <div className="space-y-2">
              <Link
                to="/portal/subscriptions"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Repeat size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Manage Subscriptions</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/portal/invoices"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Download Invoices &amp; Receipts</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/portal/payments"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Review Payment Receipts</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/portal/profile"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Building size={15} className="text-blue-600 dark:text-blue-400" />
                  <span>Update Tax Details &amp; GSTIN</span>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Billing Contact & Support Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle size={16} className="text-slate-500" />
              Billing Assistance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Need to add more user seats, upgrade to an Enterprise tier, or update your registered state of supply?
            </p>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Brightloop Accounts Desk
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                billing@brightloop.io
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                Mon - Fri, 9:00 AM - 6:00 PM IST
              </div>
            </div>
            <a
              href="mailto:billing@brightloop.io?subject=Billing%20Assistance%20Inquiry"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              <span>Contact Support Desk</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
