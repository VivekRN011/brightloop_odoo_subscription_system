import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { NotFoundPage } from './NotFoundPage';
import { PortalLayout } from '@/features/portal/PortalLayout';

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
    element: <PortalLayout />,
    children: [
      {
        index: true,
        element: (
          <PlaceholderPage
            title="Subscriber Dashboard"
            description="Overview of your active subscriptions, current billing period, and pending payments."
            category="Customer Portal"
            plannedFeatures={[
              'Customer session boundary strictly isolated from admin data (PRD G-07, FR-AUTH-09)',
              'Current active subscription details and upcoming renewal dates',
              'Outstanding balance summary and quick pay action',
              'Recent payment history and receipts',
            ]}
          />
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <PlaceholderPage
            title="My Subscriptions"
            description="View your subscribed products, plans, renewal terms, and service agreements."
            category="Customer Portal"
            plannedFeatures={[
              'View only the signed-in customer’s subscriptions (PRD Section 4.3)',
              'Inspect subscription lines, quantities, and plan billing cycles',
              'Request plan change or pause if permitted by plan configuration',
              'Renewal preferences and contract termination notice',
            ]}
          />
        ),
      },
      {
        path: 'invoices',
        element: (
          <PlaceholderPage
            title="My Invoices"
            description="View and download tax invoices for your subscription accounts."
            category="Customer Portal"
            plannedFeatures={[
              'View only own customer invoices (PRD Section 4.3)',
              'Download GST-compliant tax invoice PDFs',
              'Inspect itemized line items, applied discounts, and taxes',
              'View payment settlement status (Paid, Confirmed, Overdue)',
            ]}
          />
        ),
      },
      {
        path: 'profile',
        element: (
          <PlaceholderPage
            title="Billing Profile & Tax Details"
            description="Manage your company details, GSTIN, PAN, and billing address."
            category="Customer Portal"
            plannedFeatures={[
              'Company legal name and primary contact details',
              'Registered GSTIN and PAN verification',
              'Billing address and state of supply configuration',
              'Preferred payment notification contacts',
            ]}
          />
        ),
      },
    ],
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
              'Customer listing with search, sorting, and status filtering',
              'Company profiles with GSTIN, PAN, and contact details',
              'Billing and shipping address management',
              'Customer-specific payment terms and discount overrides',
              'Complete subscription and invoice audit timeline',
            ]}
          />
        ),
      },
      {
        path: 'products',
        element: (
          <PlaceholderPage
            title="Products & Variants"
            description="Configure subscription products, cost prices, sales prices, and product variants."
            category="Catalog"
            plannedFeatures={[
              'Product catalog management storing name, type, sales price, cost price, and notes (PRD FR-PROD-02)',
              'Product variant attributes (e.g. Brand, Tier) with price adjustments (FR-PROD-03/05)',
              'Product activation and deactivation toggles',
              'Historical invoice pricing immutability (FR-PROD-07)',
            ]}
          />
        ),
      },
      {
        path: 'plans',
        element: (
          <PlaceholderPage
            title="Subscription Plans"
            description="Define recurring pricing tiers, billing cadences, and subscription lifecycle rules."
            category="Catalog"
            plannedFeatures={[
              'Strict support for 4 billing intervals: Daily, Weekly, Monthly, and Yearly (PRD FR-PLAN-03)',
              'Minimum subscription quantity and plan availability start/end dates (FR-PLAN-04/05)',
              'Automatic closure at end of plan configuration (FR-PLAN-06)',
              'Early closure, pause, and renewal permission flags (FR-PLAN-07/08/09)',
            ]}
          />
        ),
      },
      {
        path: 'quotation-templates',
        element: (
          <PlaceholderPage
            title="Quotation Templates"
            description="Configure reusable commercial templates with pre-defined plans, products, and validity durations."
            category="Subscriptions"
            plannedFeatures={[
              'Create reusable quotation templates (PRD FR-QUOTE-01)',
              'Pre-populate product lines, subscription plans, and quantities (FR-QUOTE-02)',
              'Configurable validity period in days (FR-QUOTE-03)',
              'Template versioning and activation status',
            ]}
          />
        ),
      },
      {
        path: 'quotations',
        element: (
          <PlaceholderPage
            title="Quotations"
            description="Prepare commercial subscription proposals from templates and convert accepted quotes into active subscriptions."
            category="Subscriptions"
            plannedFeatures={[
              'Create quotations from reusable templates or scratch (PRD FR-QUOTE-04)',
              'Associate quotation with customer and calculate validity expiry date',
              'Automated tax and discount line calculations (FR-QUOTE-06)',
              'One-click conversion into confirmed subscription upon acceptance (FR-QUOTE-07)',
            ]}
          />
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <PlaceholderPage
            title="Subscriptions"
            description="Manage the complete lifecycle of customer recurring subscriptions."
            category="Subscriptions"
            plannedFeatures={[
              'Complete 6 lifecycle states: Draft, Quotation, Confirmed, Active, Paused, Closed (PRD FR-SUB-07, Workflow WF-08)',
              'Unique subscription identifier sequence (FR-SUB-01)',
              'Plan-level permission enforcement for pause, early closure, and renewal (FR-SUB-09 to 12)',
              'Next billing date tracking and automated recurring invoice triggers (FR-BILL-01)',
            ]}
          />
        ),
      },
      {
        path: 'invoices',
        element: (
          <PlaceholderPage
            title="Invoices"
            description="Issue, track, and reconcile recurring billing invoices and payment collections."
            category="Billing"
            plannedFeatures={[
              'Invoice lifecycle states: Draft, Confirmed, Paid, Cancelled (PRD FR-BILL-10)',
              'Duplicate billing prevention for identical subscription periods (FR-BILL-11)',
              'Itemized line items snapshotting product, tax, and discount at billing time (FR-BILL-13)',
              'Confirm, cancel, send, and print invoice actions (FR-BILL-06 to 09)',
            ]}
          />
        ),
      },
      {
        path: 'invoices/overdue',
        element: (
          <PlaceholderPage
            title="Overdue Invoices"
            description="Monitor and prioritize collections for confirmed invoices past their payment due date."
            category="Billing"
            plannedFeatures={[
              'Identify confirmed invoices where outstanding balance > 0 and due date < current date (PRD FR-PAY-08, BR-18)',
              'Overdue aging classification (1-15 days, 16-30 days, 30+ days overdue)',
              'Direct payment recording action with outstanding amount pre-filled',
              'Payment reminder follow-up log',
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
              'Record payments associated with specific invoices (PRD FR-PAY-01/02)',
              'Support payment methods: Cash, Bank Transfer, UPI, Cheque, Card (Database enum PaymentMethod)',
              'Persist amount, date, reference note, and allocation (FR-PAY-03 to 06)',
              'Recalculate invoice paid amount and outstanding balance with partial settlement support (FR-PAY-09)',
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
            adminOnly={true} // Only Admin can create/manage discount rules (PRD FR-DISC-01, BR-14, Table 4.4)
            plannedFeatures={[
              'Admin-only rule configuration (PRD FR-DISC-01, Table 4.4)',
              'Fixed amount and percentage discount types (FR-DISC-02)',
              'Minimum purchase amount or quantity thresholds (FR-DISC-03)',
              'Start/end validity dates and maximum usage limits (FR-DISC-04/05)',
              'Product-level vs subscription-level applicability (FR-DISC-06)',
              'Automatic application to next recurring invoice run (FR-DISC-07)',
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
              'Active subscriptions, revenue received, and outstanding trends (PRD FR-AN-01 to 04)',
              'Customer retention and churn cohort breakdown',
              'GST liability tax reports and CSV export capability',
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
              'Default billing currency (INR) and payment terms',
              'Automated invoice reminder schedules',
              'System audit logs and operational parameters',
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
            adminOnly={true} // Only Admin can create staff accounts (PRD Section 4.1, FR-AUTH-08, BR-03)
            plannedFeatures={[
              'Only Admin can create staff accounts (PRD FR-AUTH-08, BR-03, Table 4.4)',
              'Staff accounts with granular operational permissions',
              'Activity audit trail by staff member',
              'Account suspension and password reset triggers',
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
            adminOnly={true} // Only Admin can configure tax rules (PRD Section 4.1, FR-TAX-01, Table 4.4)
            plannedFeatures={[
              'Admin-only tax rule configuration (PRD FR-TAX-01, Table 4.4)',
              'Standard GST rates (5%, 12%, 18%, 28%) and zero-rated items',
              'Automatic CGST + SGST vs IGST calculation based on place of supply',
              'HSN/SAC service classification code mapping',
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
