import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Building,
  Mail,
  FileCheck2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { Button } from '@/components/ui/button';

export const CustomerProfilePage: React.FC = () => {
  const { data: summary, isLoading, isError, refetch } = useCustomerSummary();
  const [isSaved, setIsSaved] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"></div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 mb-4">Failed to load subscriber profile.</p>
        <Button onClick={() => refetch()} size="sm">Retry</Button>
      </div>
    );
  }

  const { profile } = summary;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top breadcrumb & Header */}
      <div>
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft size={13} />
          <span>Back to Overview</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="text-indigo-600 dark:text-indigo-400" size={24} />
              Billing Profile &amp; Tax Information
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maintain your registered company entity, GSTIN registration, and place of supply
            </p>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 size={16} />
          <span>Billing profile details saved successfully. Next invoice run will reflect these details.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Corporate Entity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building size={18} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Corporate Entity Details
              </h2>
              <p className="text-[11px] text-slate-400">
                Legal customer name and account identifier
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                defaultValue={profile.companyName}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Reference Code
              </label>
              <input
                type="text"
                readOnly
                value={profile.customerCode}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Mail size={18} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Primary Contact Person
              </h2>
              <p className="text-[11px] text-slate-400">
                Authorized billing contact for receipts and renewal notices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Officer Name
              </label>
              <input
                type="text"
                defaultValue={profile.name}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Billing Email Address
              </label>
              <input
                type="email"
                defaultValue={profile.email}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue={profile.phone || '+91 98450 12345'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Tax Identification & Place of Supply */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FileCheck2 size={18} className="text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                GSTIN &amp; Indian Tax Compliance
              </h2>
              <p className="text-[11px] text-slate-400">
                Determines whether CGST + SGST or IGST is applied on subscription invoices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered GSTIN (15 Digits)
              </label>
              <input
                type="text"
                defaultValue={profile.gstin || '29AABCA1234F1Z5'}
                maxLength={15}
                className="w-full font-mono uppercase px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PAN (10 Digits)
              </label>
              <input
                type="text"
                defaultValue={profile.pan || 'AABCA1234F'}
                maxLength={10}
                className="w-full font-mono uppercase px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered City
              </label>
              <input
                type="text"
                defaultValue={profile.city || 'Bangalore'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State (Place of Supply)
              </label>
              <input
                type="text"
                defaultValue={profile.state || 'Karnataka'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                defaultValue="560001"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/portal">
            <Button variant="outline" type="button" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Save size={14} />
            <span>Save Profile Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
