import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { taxesService, TaxRule } from '../services/taxes.service';
import { formatDate } from '@/lib/format';

const mockTaxRules: TaxRule[] = [
  { id: 'tax-1', name: 'GST 18% (Intra-State)', code: 'GST_18_INTRA', rate: 18, isActive: true, createdAt: new Date().toISOString() },
  { id: 'tax-2', name: 'GST 18% (Inter-State)', code: 'GST_18_INTER', rate: 18, isActive: true, createdAt: new Date().toISOString() },
  { id: 'tax-3', name: 'GST 12% (Intra-State)', code: 'GST_12_INTRA', rate: 12, isActive: true, createdAt: new Date().toISOString() },
  { id: 'tax-4', name: 'GST 5%', code: 'GST_5', rate: 5, isActive: false, createdAt: new Date().toISOString() },
  { id: 'tax-5', name: 'GST 28%', code: 'GST_28', rate: 28, isActive: true, createdAt: new Date().toISOString() },
];

type TaxType = 'Intra-State' | 'Inter-State' | 'General';

function getTaxType(code: string): TaxType {
  const upper = code.toUpperCase();
  if (upper.includes('CGST') || upper.includes('SGST') || upper.includes('INTRA')) return 'Intra-State';
  if (upper.includes('IGST') || upper.includes('INTER')) return 'Inter-State';
  return 'General';
}

interface ModalForm {
  name: string;
  code: string;
  rate: number | '';
  isActive: boolean;
}

const emptyForm: ModalForm = { name: '', code: '', rate: '', isActive: true };

export function AdminTaxesPage() {
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRule | null>(null);
  const [form, setForm] = useState<ModalForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadTaxes = useCallback(async () => {
    setLoading(true);
    const data = await taxesService.list();
    setTaxes(data.length > 0 ? data : mockTaxRules);
    setLoading(false);
  }, []);

  useEffect(() => { loadTaxes(); }, [loadTaxes]);

  const activeRules = taxes.filter(t => t.isActive);
  const avgRate = activeRules.length > 0
    ? (activeRules.reduce((sum, t) => sum + t.rate, 0) / activeRules.length).toFixed(1)
    : '0';

  const openAdd = () => {
    setEditingTax(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (tax: TaxRule) => {
    setEditingTax(tax);
    setForm({ name: tax.name, code: tax.code, rate: tax.rate, isActive: tax.isActive });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTax(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (!form.code.trim()) { setFormError('Code is required.'); return; }
    if (form.rate === '' || Number(form.rate) < 0 || Number(form.rate) > 100) {
      setFormError('Rate must be between 0 and 100.'); return;
    }
    setSaving(true);
    try {
      const body = { name: form.name.trim(), code: form.code.trim().toUpperCase(), rate: Number(form.rate), isActive: form.isActive };
      if (editingTax) {
        const updated = await taxesService.update(editingTax.id, body);
        setTaxes(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success('Tax rule updated successfully.');
      } else {
        const created = await taxesService.create(body);
        setTaxes(prev => [...prev, created]);
        toast.success('Tax rule created successfully.');
      }
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to save tax rule.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const metricCards = [
    { label: 'Total Tax Rules', value: taxes.length, icon: 'percent' },
    { label: 'Active Rules', value: activeRules.length, icon: 'check_circle' },
    { label: 'Standard GST Rates', value: '5% / 12% / 18% / 28%', icon: 'account_balance' },
    { label: 'Avg Rate (Active)', value: `${avgRate}%`, icon: 'trending_up' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Tax Configuration</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage Indian GST tax rules applied to subscription plans and invoices.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Tax Rule
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(card => (
          <div key={card.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-xl">{card.icon}</span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{card.label}</p>
              <p className="text-lg font-bold text-on-surface mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant">
          <h2 className="text-sm font-semibold text-on-surface">Tax Rules</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">{taxes.length} rule{taxes.length !== 1 ? 's' : ''} configured</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 font-semibold">Tax Name</th>
                <th className="py-3 px-5 font-semibold">Code</th>
                <th className="py-3 px-5 font-semibold">Rate (%)</th>
                <th className="py-3 px-5 font-semibold">Type</th>
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold">Created</th>
                <th className="py-3 px-5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
                  </td>
                </tr>
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-on-surface-variant">No tax rules found.</td>
                </tr>
              ) : (
                taxes.map(tax => {
                  const taxType = getTaxType(tax.code);
                  return (
                    <tr key={tax.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-5 font-medium text-on-surface">{tax.name}</td>
                      <td className="py-3 px-5 font-mono text-on-surface-variant">{tax.code}</td>
                      <td className="py-3 px-5 text-on-surface font-semibold">{tax.rate}%</td>
                      <td className="py-3 px-5 text-on-surface-variant">{taxType}</td>
                      <td className="py-3 px-5">
                        {tax.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="material-symbols-outlined text-[10px]">circle</span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">
                            <span className="material-symbols-outlined text-[10px]">circle</span> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-on-surface-variant">{formatDate(tax.createdAt)}</td>
                      <td className="py-3 px-5">
                        <button
                          onClick={() => openEdit(tax)}
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-on-surface font-headline">
                {editingTax ? 'Edit Tax Rule' : 'Add Tax Rule'}
              </h3>
              <button onClick={closeModal} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. GST 18% (Intra-State)"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. GST_18_INTRA"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.rate}
                  onChange={e => setForm(f => ({ ...f, rate: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="0 – 100"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tax-active"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="accent-primary h-4 w-4"
                />
                <label htmlFor="tax-active" className="text-xs font-semibold text-on-surface">Active</label>
              </div>

              {formError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span> {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60">
                  {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  {editingTax ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
