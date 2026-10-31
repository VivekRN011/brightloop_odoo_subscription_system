import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CreditCard,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';
import { useCustomerSummary } from '../hooks/useCustomerPortal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatINR, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { launchRazorpayCheckout } from '../services/razorpayClient.service';
import { api } from '@/services/api';

export const CustomerInvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: summary, isLoading, isError, refetch } = useCustomerSummary();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 mb-4">Failed to load invoice details.</p>
        <Button onClick={() => refetch()} size="sm">Retry</Button>
      </div>
    );
  }

  const invoice = summary.recentInvoices.find(
    (inv) => inv.id === id || inv.invoiceNumber === id
  );

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Invoice Not Found
        </h3>
        <p className="text-xs text-slate-500">
          No invoice matching identifier "{id}" was found in your customer records.
        </p>
        <Button onClick={() => navigate('/portal/invoices')} size="sm">
          Return to Invoices
        </Button>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(`${api.defaults.baseURL}/invoices/${invoice.id}/pdf`, '_blank');
    }
  };

  const handleStartRazorpayCheckout = async () => {
    if (!invoice) return;

    setIsProcessing(true);
    setErrorMessage(null);

    await launchRazorpayCheckout({
      invoiceId: invoice.id,
      onSuccess: (result) => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        setVerifiedPaymentId(
          result.payment?.gatewayPaymentId || result.payment?.reference || 'Verified'
        );
        queryClient.invalidateQueries({ queryKey: ['portal'] });
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMessage(err);
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
    });
  };

  const lines = invoice.lines || [
    {
      id: 'l-default',
      description: invoice.planName || 'Brightloop Recurring Subscription License',
      quantity: 1,
      unitPrice: invoice.totalAmount / 1.18,
      amount: invoice.totalAmount / 1.18,
      taxRate: 0.18,
      taxAmount: invoice.totalAmount - invoice.totalAmount / 1.18,
    },
  ];

  const subtotalBeforeTax = lines.reduce((acc, l) => acc + l.amount, 0);
  const totalTaxAmount = lines.reduce((acc, l) => acc + l.taxAmount, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top breadcrumb & Actions */}
      <div>
        <Link
          to="/portal/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft size={13} />
          <span>Back to Invoices</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {invoice.invoiceNumber}
              </span>
              <StatusBadge status={invoice.status} type="invoice" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tax Invoice Issued on {formatDate(invoice.issueDate)} • Due {formatDate(invoice.dueDate)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              className="text-xs flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </Button>

            {invoice.outstandingAmount > 0 && invoice.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => {
                  setPaymentSuccess(false);
                  setPaymentModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <CreditCard size={13} />
                <span>Pay Outstanding</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Card (Print-ready presentation) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xs space-y-8">
        {/* Header: Issuer and Billed-to */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
              Brightloop Technologies Pvt Ltd
            </span>
            <p className="text-slate-500">Infopark Phase II, Kakkanad</p>
            <p className="text-slate-500">Kochi, Kerala 682042, India</p>
            <p className="font-mono text-slate-600 dark:text-slate-400">
              GSTIN: <strong>32AAACB0981E1Z4</strong>
            </p>
          </div>

          <div className="space-y-1.5 text-xs sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Billed To
            </span>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
              {summary.profile.companyName}
            </span>
            <p className="text-slate-500">{summary.profile.name} ({summary.profile.email})</p>
            {summary.profile.gstin && (
              <p className="font-mono text-slate-600 dark:text-slate-400">
                GSTIN: <strong>{summary.profile.gstin}</strong>
              </p>
            )}
            <p className="text-slate-500">
              State of Supply: {summary.profile.state || 'Kerala'} (Intra-state CGST + SGST)
            </p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Invoice Line Items (Snapshot Pricing)
          </h4>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Item &amp; Service Description</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Taxable Rate</th>
                  <th className="py-2.5 px-4 text-center">GST Rate</th>
                  <th className="py-2.5 px-4 text-right">Tax Amount</th>
                  <th className="py-2.5 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {line.description}
                    </td>
                    <td className="py-3 px-4 text-center">{line.quantity}</td>
                    <td className="py-3 px-4 text-right">{formatINR(line.unitPrice)}</td>
                    <td className="py-3 px-4 text-center font-mono">18.0%</td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                      {formatINR(line.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(line.amount + line.taxAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Settlement Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 space-y-1 max-w-sm">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Payment Terms &amp; Settlement Info
            </span>
            <p className="leading-relaxed">
              Standard commercial invoice terms: Net 15 days. Unpaid confirmed balances automatically generate reminders and reflect in accounts aging metrics.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxable Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatINR(subtotalBeforeTax)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>CGST (9.0%):</span>
              <span>{formatINR(totalTaxAmount / 2)}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>SGST (9.0%):</span>
              <span>{formatINR(totalTaxAmount / 2)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-bold">
              <span className="text-slate-900 dark:text-slate-100">Grand Total:</span>
              <span className="text-base text-slate-900 dark:text-slate-100">
                {formatINR(invoice.totalAmount)}
              </span>
            </div>

            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Paid to Date:</span>
              <span>{formatINR(invoice.paidAmount)}</span>
            </div>

            <div className="pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
              <span className="text-slate-800 dark:text-slate-200">Outstanding:</span>
              <span className={invoice.outstandingAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}>
                {formatINR(invoice.outstandingAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Mode Dialog */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Razorpay Checkout
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      Test Mode
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Brightloop Subscription Settlement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {paymentSuccess ? (
                <div className="py-6 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Payment Verified &amp; Settled!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                    Razorpay transaction <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{verifiedPaymentId}</span> confirmed. Invoice {invoice.invoiceNumber} is settled in full.
                  </p>
                  <Button
                    onClick={() => setPaymentModalOpen(false)}
                    className="w-full bg-slate-900 text-white text-xs font-semibold"
                  >
                    Close Window
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Invoice:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                      <span className="font-semibold">Amount to Pay:</span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatINR(invoice.outstandingAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPaymentModalOpen(false)}
                      className="flex-1 text-xs"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStartRazorpayCheckout}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Authorizing...</span>
                        </>
                      ) : (
                        <span>Pay {formatINR(invoice.outstandingAmount)}</span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
