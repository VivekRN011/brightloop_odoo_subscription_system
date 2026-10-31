import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileText,
  Repeat,
  Receipt,
  CreditCard,
  Percent,
  BarChart3,
  UserCheck,
  PercentCircle,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  adminOnly?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        to: '/app/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'customer_management',
    label: 'Customer Management',
    items: [
      {
        label: 'Customers',
        to: '/app/customers',
        icon: Users,
      },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: [
      {
        label: 'Products',
        to: '/app/products',
        icon: Package,
      },
      {
        label: 'Subscription Plans',
        to: '/app/plans',
        icon: Layers,
      },
    ],
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    items: [
      {
        label: 'Quotations',
        to: '/app/quotations',
        icon: FileText,
      },
      {
        label: 'Subscriptions',
        to: '/app/subscriptions',
        icon: Repeat,
        badge: '142',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    items: [
      {
        label: 'Invoices',
        to: '/app/invoices',
        icon: Receipt,
      },
      {
        label: 'Payments',
        to: '/app/payments',
        icon: CreditCard,
      },
    ],
  },
  {
    id: 'business_management',
    label: 'Business Management',
    items: [
      {
        label: 'Discounts',
        to: '/app/discounts',
        icon: Percent,
      },
      {
        label: 'Reports & Analytics',
        to: '/app/reports',
        icon: BarChart3,
      },
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    items: [
      {
        label: 'Staff Management',
        to: '/app/settings/staff',
        icon: UserCheck,
        adminOnly: true,
      },
      {
        label: 'Tax Settings',
        to: '/app/settings/taxes',
        icon: PercentCircle,
        adminOnly: true,
      },
      {
        label: 'Settings',
        to: '/app/settings',
        icon: Settings,
      },
    ],
  },
];

