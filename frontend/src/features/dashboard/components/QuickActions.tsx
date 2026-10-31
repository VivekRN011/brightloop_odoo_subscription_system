import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, PlusCircle, PackagePlus, ReceiptText, Sparkles } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Customer',
      desc: 'Register a new business account',
      icon: UserPlus,
      to: '/app/customers',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60',
    },
    {
      label: 'Create Subscription',
      desc: 'Initiate recurring plan contract',
      icon: PlusCircle,
      to: '/app/subscriptions',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60',
    },
    {
      label: 'Add Product',
      desc: 'Create new catalog offering',
      icon: PackagePlus,
      to: '/app/products',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60',
    },
    {
      label: 'Create Invoice',
      desc: 'Generate quotation or bill',
      icon: ReceiptText,
      to: '/app/invoices',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Sparkles size={16} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Quick Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Frequent recurring billing workflows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              type="button"
              onClick={() => navigate(act.to)}
              className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 text-left transition-all ${act.bg} flex items-start gap-3 group`}
            >
              <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 shadow-xs ${act.color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                  {act.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                  {act.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

