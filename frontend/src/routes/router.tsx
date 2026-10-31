import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { NotFoundPage } from './NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/portal',
    element: (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <PlaceholderPage
            title="Customer Self-Service Portal"
            description="Dedicated external portal for Brightloop subscribers to view their subscriptions, download invoices, and initiate payments."
            category="Customer Portal"
            plannedFeatures={[
              'Separate customer session boundary',
              'View active and past subscriptions',
              'Download GST-compliant invoice PDFs',
              'Integrated Razorpay Test Mode checkout',
              'Update payment preferences and billing contact',
            ]}
          />
        </div>
      </div>
    ),
  },
  {
    path: '/app',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'customers',
        element: (
          <PlaceholderPage
            title="Customers"
            description="Manage corporate subscriber accounts, billing addresses, and tax identifiers."
            category="Customer Management"
            plannedFeatures={[
              'Customer listing with search and status filtering',
              'Company profiles with GSTIN, PAN, and contact details',
              'Billing and shipping address management',
              'Customer-specific payment terms and discount rules',
              'Complete subscription and invoice audit timeline',
            ]}
          />
        ),
      },
      {
        path: 'products',
        element: (
          <PlaceholderPage
            title="Products & Offerings"
            description="Configure subscription products, recurring service items, and catalog items."
            category="Catalog"
            plannedFeatures={[
              'Product catalog management with active/inactive toggles',
              'Product variant combinations (e.g. Seats, Storage, Tiers)',
              'Recurring billing cycle configurations',
              'HSN/SAC tax code classification',
            ]}
          />
        ),
      },
      {
        path: 'plans',
        element: (
          <PlaceholderPage
            title="Subscription Plans"
            description="Define recurring pricing tiers, billing cadences, and subscription terms."
            category="Catalog"
            plannedFeatures={[
              'Monthly, Quarterly, Biannual, and Annual billing intervals',
              'Trial period and grace period configuration',
              'Setup fee and upfront deposit parameters',
              'Proration rules for mid-cycle plan changes',
            ]}
          />
        ),
      },
      {
        path: 'quotations',
        element: (
          <PlaceholderPage
            title="Quotations"
            description="Prepare commercial subscription proposals and convert approved quotes into active subscriptions."
            category="Subscriptions"
            plannedFeatures={[
              'Draft quotation generator with automated tax calculations',
              'Customer discount code application',
              'Quotation expiration and revision history',
              'One-click conversion into confirmed subscription',
            ]}
          />
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <PlaceholderPage
            title="Subscriptions"
            description="Manage the complete lifecycle of customer subscriptions from Draft to Closed."
            category="Subscriptions"
            plannedFeatures={[
              'Lifecycle states: Draft, Confirmed, Active, Closed',
              'Pause, resume, renew, and terminate workflows',
              'Next billing date and renewal schedule tracking',
              'Automated recurring invoice generation triggers',
            ]}
          />
        ),
      },
      {
        path: 'invoices',
        element: (
          <PlaceholderPage
            title="Invoices"
            description="Issue, track, and reconcile recurring billing invoices and overdue notices."
            category="Billing"
            plannedFeatures={[
              'Invoice states: Draft, Confirmed, Paid, Cancelled',
              'Automated overdue detection based on payment due dates',
              'Itemized line items, GST breakdown, and discounts',
              'One-click payment recording and receipt issuance',
            ]}
          />
        ),
      },
      {
        path: 'payments',
        element: (
          <PlaceholderPage
            title="Payments"
            description="Record manual collections and review automated online transactions."
            category="Billing"
            plannedFeatures={[
              'Manual payment recording (NEFT, RTGS, UPI, Cheque, Cash)',
              'Automatic invoice outstanding balance reconciliation',
              'Razorpay Test Mode online payment capture and webhook sync',
              'Payment receipt generation and verification logs',
            ]}
          />
        ),
      },
      {
        path: 'discounts',
        element: (
          <PlaceholderPage
            title="Discounts & Promotions"
            description="Manage promotional coupons, partner discount codes, and customer-specific concessions."
            category="Business Management"
            plannedFeatures={[
              'Percentage-based and flat INR discount codes',
              'Validity date ranges and maximum redemption caps',
              'Plan-specific or customer-tier eligibility rules',
              'Redemption analytics and revenue impact tracking',
            ]}
          />
        ),
      },
      {
        path: 'reports',
        element: (
          <PlaceholderPage
            title="Reports & Analytics"
            description="Financial metrics, recurring revenue analytics, customer churn, and tax reports."
            category="Business Management"
            plannedFeatures={[
              'Monthly Recurring Revenue (MRR) and Annual Recurring Revenue (ARR)',
              'Cohort retention and churn rate calculations',
              'Accounts receivable aging report (Current, 30d, 60d, 90d+)',
              'GST output tax liability summary for accounting export',
            ]}
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <PlaceholderPage
            title="Workspace Settings"
            description="General application settings, company profile, and billing parameters."
            category="Configuration"
            plannedFeatures={[
              'Company legal name, GSTIN, PAN, and registered address',
              'Default billing currency (INR) and payment terms (e.g. Net 15, Net 30)',
              'Automated reminder email schedule for upcoming/overdue invoices',
              'Webhook endpoints and integration API keys',
            ]}
          />
        ),
      },
      {
        path: 'settings/staff',
        element: (
          <PlaceholderPage
            title="Staff Management"
            description="Admin-only team user management, role assignments, and access privileges."
            category="Configuration"
            plannedFeatures={[
              'Staff member accounts with ADMIN and STAFF role assignments',
              'Granular operational permissions for quotations and payments',
              'Activity audit trail by team member',
              'Account suspension and password reset tools',
            ]}
          />
        ),
      },
      {
        path: 'settings/taxes',
        element: (
          <PlaceholderPage
            title="Tax Settings"
            description="Configure Indian GST tax slabs, HSN/SAC codes, and inter-state tax rules."
            category="Configuration"
            plannedFeatures={[
              'Standard GST tax rates (5%, 12%, 18%, 28%) and nil-rated slabs',
              'Automatic CGST + SGST vs IGST calculation based on state of supply',
              'HSN/SAC service classification code mapping',
              'Tax invoice numbering sequence configuration',
            ]}
          />
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
