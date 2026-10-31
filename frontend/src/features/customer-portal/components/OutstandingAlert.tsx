import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatINR, formatDate } from '@/lib/format';
import type { CustomerInvoice } from '../models/customerPortal.types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface OutstandingAlertProps {
  outstandingAmount: number;
  invoices: CustomerInvoice[];
}

export const OutstandingAlert: React.FC<OutstandingAlertProps> = ({
  outstandingAmount,
  invoices,
}) => {
  const navigate = useNavigate();

  if (outstandingAmount <= 0) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Account in Good Standing
            </h3>
            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400">
              You're all caught up. There are no outstanding payments or overdue invoices on your account.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck size={14} />
          Zero Balance
        </span>
      </div>
    );
  }

  const primaryPendingInvoice = invoices.find((inv) => inv.outstandingAmount > 0) || invoices[0];

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Payment Awaiting Settlement: {formatINR(outstandingAmount)}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300">
                Pending
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 max-w-xl leading-relaxed">
              {primaryPendingInvoice
                ? `Invoice ${primaryPendingInvoice.invoiceNumber} is due by ${formatDate(primaryPendingInvoice.dueDate)}. Payments are automatically matched and confirmed against verified bank transfers or payment gateway receipts.`
                : 'You have an outstanding invoice balance on your account.'}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/portal/invoices')}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>View Invoice Details</span>
          <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  );
};

