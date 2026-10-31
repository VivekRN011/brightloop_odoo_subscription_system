import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '../layout/PageHeader';
import { useAuth } from '@/context/AuthContext';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  category: string;
  plannedFeatures: string[];
  adminOnly?: boolean;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  category,
  plannedFeatures,
  adminOnly = false,
}) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  // If page is admin-only and user is STAFF, enforce restricted view
  if (adminOnly && role !== 'ADMIN') {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title={title}
          description="Access restricted by role permissions."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Button>
          }
        />

        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-8 shadow-sm text-center max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            Administrator Privilege Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Your account is currently signed in with the <strong>{role}</strong> role. Under Brightloop access control rules (PRD Section 4 & Table 4.4), only <strong>ADMIN</strong> users can configure staff accounts, tax rules, or discount policies.
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/app/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Button>
        }
      />

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {category}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/60">
            <Clock size={12} />
            Scheduled for Phase 2 Implementation
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title} Management Workspace
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mb-6">
          This module is part of the Brightloop Subscription Management architecture for the Odoo Hackathon 2026.
          The admin foundation and live dashboard are fully implemented. Next, this module will connect directly to the Express + Prisma API.
        </p>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
            Planned Capabilities in this Module
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
            {plannedFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

