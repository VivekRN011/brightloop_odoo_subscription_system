import { AdminSubscriptionsPage, SubscriptionDetailPage, SubscriptionWorkflowPage } from '@/features/subscriptions';
import { AdminInvoicesPage } from '@/features/invoices/pages/AdminInvoicesPage';
import { AdminCustomersPage } from '@/features/customers/pages/AdminCustomersPage';
import { AdminPaymentsPage } from '@/features/payments/pages/AdminPaymentsPage';
import { AdminPlansPage } from '@/features/plans';
import { AdminQuotationsPage } from '@/features/quotations';
import { AdminProductsPage } from '@/features/products/pages/AdminProductsPage';
import { AdminTaxesPage } from '@/features/settings/pages/AdminTaxesPage';
import { AdminStaffPage } from '@/features/settings/pages/AdminStaffPage';
import { AdminReportsPage } from '@/features/reports/pages/AdminReportsPage';
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
        element: <SubscriptionWorkflowPage />,
      },
      {
        path: 'subscribe/:productId',
        element: <SubscriptionWorkflowPage />,
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
        path: 'checkout',
        element: <SubscriptionWorkflowPage />,
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
        element: <AdminQuotationsPage />,
      },
      {
        path: 'subscriptions',
        element: <AdminSubscriptionsPage />,
      },
      {
        path: 'subscriptions/:id',
        element: <SubscriptionDetailPage />,
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
        element: <AdminReportsPage />,
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
        element: <AdminStaffPage />,
      },
      {
        path: 'settings/taxes',
        element: <AdminTaxesPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
