import { AdminSubscriptionsPage } from '@/features/subscriptions/pages/AdminSubscriptionsPage';
import { AdminInvoicesPage } from '@/features/invoices/pages/AdminInvoicesPage';
import { AdminCustomersPage } from '@/features/customers/pages/AdminCustomersPage';
import { AdminPaymentsPage } from '@/features/payments/pages/AdminPaymentsPage';
import { AdminProductsPage } from '@/features/products/pages/AdminProductsPage';
import { AdminPlansPage } from '@/features/plans/pages/AdminPlansPage';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LoginPage, RegisterPage, ResetPasswordPage } from '@/features/auth';
import { HomePage } from '@/features/public';
import { ProductListPage, ProductDetailsPage } from '@/features/products';
import {
  CustomerDashboardPage,
  CustomerCatalogPage,
  CustomerSubscriptionsPage,
  CustomerSubscriptionDetailPage,
  CustomerInvoicesPage,
  CustomerInvoiceDetailPage,
  CustomerPaymentsPage,
  CustomerProfilePage,
} from '@/features/customer-portal';
import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { NotFoundPage } from './NotFoundPage';
import { PortalLayout } from '@/features/portal/PortalLayout';
import { SubscribeRouteGuard } from './SubscribeRouteGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailsPage />,
      },
      {
        path: 'subscribe',
        element: <SubscribeRouteGuard />,
      },
      {
        path: 'subscribe/:productId',
        element: <SubscribeRouteGuard />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />,
  },
  {
    path: '/portal',
    element: <PortalLayout />,
    children: [
      {
        index: true,
        element: <CustomerDashboardPage />,
      },
      {
        path: 'catalog',
        element: <CustomerCatalogPage />,
      },
      {
        path: 'subscriptions',
        element: <CustomerSubscriptionsPage />,
      },
      {
        path: 'subscriptions/:id',
        element: <CustomerSubscriptionDetailPage />,
      },
      {
        path: 'invoices',
        element: <CustomerInvoicesPage />,
      },
      {
        path: 'invoices/:id',
        element: <CustomerInvoiceDetailPage />,
      },
      {
        path: 'payments',
        element: <CustomerPaymentsPage />,
      },
      {
        path: 'profile',
        element: <CustomerProfilePage />,
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
        element: <AdminCustomersPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'plans',
        element: <AdminPlansPage />,
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
        element: <AdminSubscriptionsPage />,
      },
      {
        path: 'invoices',
        element: <AdminInvoicesPage />,
      },
      {
        path: 'invoices/overdue',
        element: <AdminInvoicesPage />,
      },
      {
        path: 'payments',
        element: <AdminPaymentsPage />,
      },
      {
        path: 'discounts',
        element: (
          <PlaceholderPage
            title="Discounts & Promotions"
            description="Manage promotional coupons, partner discount codes, and customer-specific concessions."
            category="Business Management"
            adminOnly={true}
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
            adminOnly={true}
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
            adminOnly={true}
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
