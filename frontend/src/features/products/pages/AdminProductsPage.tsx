import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/services/api';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/button';

interface AdminProductVariant {
  id: string;
  name: string;
  value: string;
  priceAdjustment: number;
  isActive: boolean;
}

interface AdminProductItem {
  id: string;
  sku: string;
  name: string;
  productType: string;
  description?: string;
  salesPrice: number;
  costPrice?: number;
  currency: string;
  isActive: boolean;
  variants: AdminProductVariant[];
}

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<AdminProductItem | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Product Form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    productType: 'SOFTWARE_SERVICE',
    salesPrice: '',
    costPrice: '',
    currency: 'INR',
    description: '',
    notes: '',
  });

  // New Variant Form
  const [variantForm, setVariantForm] = useState({
    name: 'Edition',
    value: '',
    priceAdjustment: '0',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      const items = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.data?.items)
        ? response.data.data.items
        : [];
      setProducts(items);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku || undefined,
        productType: formData.productType,
        salesPrice: Number(formData.salesPrice),
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        currency: formData.currency,
        description: formData.description,
        notes: formData.notes,
        isActive: true,
      };

      const res = await api.post('/products', payload);
      if (res.data?.success && res.data.data) {
        setProducts((prev) => [res.data.data, ...prev]);
      }
      setIsModalOpen(false);
      setFormData({
        name: '',
        sku: '',
        productType: 'SOFTWARE_SERVICE',
        salesPrice: '',
        costPrice: '',
        currency: 'INR',
        description: '',
        notes: '',
      });
      setActionMessage(`Product ${formData.name} created successfully.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to create product');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    try {
      await api.patch(`/products/${id}/status`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentStatus } : p))
      );
      setActionMessage(`Product ${name} status updated to ${!currentStatus ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForVariant) return;

    try {
      const payload = {
        name: variantForm.name,
        value: variantForm.value,
        priceAdjustment: Number(variantForm.priceAdjustment || 0),
      };

      const res = await api.post(`/products/${selectedProductForVariant.id}/variants`, payload);
      if (res.data?.success && res.data.data) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProductForVariant.id
              ? { ...p, variants: [...(p.variants || []), res.data.data] }
              : p
          )
        );
      }
      setIsVariantModalOpen(false);
      setVariantForm({ name: 'Edition', value: '', priceAdjustment: '0' });
      setActionMessage(`Variant ${variantForm.value} added to ${selectedProductForVariant.name}.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to add variant');
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || p.productType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Message */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={15} className="text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header & New Product Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package size={22} className="text-indigo-600" />
            <span>Product &amp; Variant Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure catalog software licenses, variant price adjustments, and cost price visibility
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="text-xs h-9 px-3 gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 gap-1.5 shadow-xs"
          >
            <Plus size={14} />
            <span>Create Product</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by SKU, name, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'SOFTWARE_SERVICE', 'ADDON', 'SUPPORT_SERVICE'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTypeFilter(tf)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === tf
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tf === 'ALL' ? 'All Types' : tf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Sales Price</th>
                <th className="py-3 px-4">Cost Price (Admin)</th>
                <th className="py-3 px-4">Variants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 h-12 bg-slate-50/40 dark:bg-slate-800/20" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{prod.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{prod.sku || 'No SKU'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {prod.productType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(prod.salesPrice)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {prod.costPrice ? formatINR(prod.costPrice) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(prod.variants || []).map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            {v.value}
                            {v.priceAdjustment > 0 && (
                              <strong className="text-indigo-600 ml-1">+{formatINR(v.priceAdjustment)}</strong>
                            )}
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductForVariant(prod);
                            setIsVariantModalOpen(true);
                          }}
                          className="text-[10px] text-indigo-600 hover:underline font-bold ml-1 self-center"
                        >
                          + Add
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          prod.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(prod.id, prod.isActive, prod.name)}
                        className="text-xs h-7 px-2 text-slate-600 dark:text-slate-300"
                        title={prod.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {prod.isActive ? (
                          <span className="text-rose-600 font-semibold">Deactivate</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Activate</span>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Create Catalog Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud ERP"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. PROD-ERP-CORE"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Product Type</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="SOFTWARE_SERVICE">Software Service</option>
                    <option value="ADDON">Add-on Module</option>
                    <option value="SUPPORT_SERVICE">SLA Support Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sales Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={formData.salesPrice}
                    onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cost Price (Admin Only)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 800"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Customer-visible description of features and usage..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Variant Modal */}
      {isVariantModalOpen && selectedProductForVariant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Add Variant to {selectedProductForVariant.name}
              </h3>
              <button onClick={() => setIsVariantModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Variant Type</label>
                <input
                  type="text"
                  required
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Variant Value / Option *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Odoo Edition"
                  value={variantForm.value}
                  onChange={(e) => setVariantForm({ ...variantForm, value: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Price Adjustment (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 560"
                  value={variantForm.priceAdjustment}
                  onChange={(e) => setVariantForm({ ...variantForm, priceAdjustment: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsVariantModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add Variant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
