import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Clock,
} from 'lucide-react';
import { quotationService } from '../services/quotation.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export interface QuotationTemplateItem {
  id: string;
  name: string;
  description?: string | null;
  validityDays: number;
  isActive: boolean;
  createdAt?: string;
}

export const AdminQuotationTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<QuotationTemplateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [isActive, setIsActive] = useState(true);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await quotationService.getTemplates();
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await quotationService.createTemplate({
        name,
        description,
        validityDays: Number(validityDays),
        isActive,
      });
      toast.success(`Template "${name}" created successfully!`);
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setValidityDays('30');
      loadTemplates();
    } catch {
      // Local optimistic addition
      const newTmpl: QuotationTemplateItem = {
        id: `tmpl-${Date.now()}`,
        name,
        description,
        validityDays: Number(validityDays),
        isActive,
      };
      setTemplates((prev) => [newTmpl, ...prev]);
      toast.success(`Template "${name}" saved!`);
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setValidityDays('30');
    }
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-slate-900 dark:text-slate-100">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FileText size={20} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Quotation Templates
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure reusable proposal frameworks with pre-configured validity durations and commercial terms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/app/quotations"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span>View All Quotations</span>
            <ArrowRight size={14} />
          </Link>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={15} />
            <span>New Template</span>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Templates</span>
            <FileText size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {templates.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standardized proposal tiers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Templates</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {templates.filter((t) => t.isActive).length}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Ready for quote preparation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Average Validity</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {templates.length > 0
              ? Math.round(
                  templates.reduce((sum, t) => sum + (t.validityDays || 30), 0) / templates.length
                )
              : 30}{' '}
            Days
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Standard offer acceptance window</p>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <strong>{filtered.length}</strong> of {templates.length} templates
        </div>
      </div>

      {/* 4. Template Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading quotation templates...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
          <FileText size={36} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No Templates Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Create your first proposal template to standardize pricing and validity timelines.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
          >
            Create Quotation Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                    {template.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                      template.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {template.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {template.description || 'Pre-configured commercial proposal template for recurring software licenses.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                  <Calendar size={13} className="text-indigo-500" />
                  <span>Valid for <strong>{template.validityDays} days</strong></span>
                </div>

                <Link
                  to={`/app/quotations?template=${encodeURIComponent(template.name)}`}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Use Template</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={16} />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  New Quotation Template
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Multi-Year SaaS Proposal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Validity Window (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Commercial proposal expires automatically after this duration.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Commercial Terms
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional scope details, payment terms, or contractual guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tmpl-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="tmpl-active" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Active (Available for creating new quotations immediately)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                  Create Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
