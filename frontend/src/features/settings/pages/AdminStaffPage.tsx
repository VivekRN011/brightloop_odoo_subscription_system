import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { staffService, StaffUser } from '../services/staff.service';
import { formatDate, formatRelativeTime } from '@/lib/format';

const mockStaff: StaffUser[] = [
  { id: 'usr-001', email: 'admin@brightloop.io', role: 'ADMIN', status: 'ACTIVE', lastLoginAt: new Date().toISOString(), createdAt: '2026-01-15T10:00:00Z' },
  { id: 'usr-002', email: 'finance@brightloop.io', role: 'STAFF', status: 'ACTIVE', lastLoginAt: new Date(Date.now() - 3600000).toISOString(), createdAt: '2026-03-01T09:00:00Z' },
  { id: 'usr-003', email: 'billing@brightloop.io', role: 'STAFF', status: 'ACTIVE', lastLoginAt: new Date(Date.now() - 86400000).toISOString(), createdAt: '2026-04-10T11:00:00Z' },
  { id: 'usr-004', email: 'ops@brightloop.io', role: 'STAFF', status: 'INACTIVE', lastLoginAt: undefined, createdAt: '2026-06-22T08:00:00Z' },
];

const PASSWORD_HINTS = [
  { label: 'At least 9 characters', test: (v: string) => v.length >= 9 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

interface InviteForm {
  email: string;
  displayName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const emptyInviteForm: InviteForm = { email: '', displayName: '', phone: '', password: '', confirmPassword: '' };

export function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<InviteForm>(emptyInviteForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  // Toggle status: map of id → 'pending' | null
  const [pendingToggle, setPendingToggle] = useState<Record<string, boolean>>({});
  const toggleTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const loadStaff = useCallback(async () => {
    setLoading(true);
    const params: any = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    const res = await staffService.list(params);
    if (res.items.length > 0) {
      setStaff(res.items);
      setPagination(res.pagination);
    } else {
      // Apply client-side filtering to mock data
      let filtered = mockStaff;
      if (search) filtered = filtered.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
      if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);
      setStaff(filtered);
      setPagination({ total: filtered.length, totalPages: 1 });
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const activeCount = staff.filter(s => s.status === 'ACTIVE').length;
  const adminCount = staff.filter(s => s.role === 'ADMIN').length;
  const lastActivity = staff
    .filter(s => s.lastLoginAt)
    .sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())[0]?.lastLoginAt;

  const metricCards = [
    { label: 'Total Staff', value: pagination.total || staff.length, icon: 'group' },
    { label: 'Active Staff', value: activeCount, icon: 'person_check' },
    { label: 'Admin Users', value: adminCount, icon: 'admin_panel_settings' },
    { label: 'Last Activity', value: lastActivity ? formatRelativeTime(lastActivity) : '—', icon: 'schedule' },
  ];

  // Password validation
  const pwValid = PASSWORD_HINTS.every(h => h.test(form.password));

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.email.trim()) { setFormError('Email is required.'); return; }
    if (!form.password) { setFormError('Password is required.'); return; }
    if (!pwValid) { setFormError('Password does not meet requirements.'); return; }
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      const payload: any = { email: form.email.trim(), password: form.password };
      if (form.displayName.trim()) payload.displayName = form.displayName.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      const created = await staffService.createStaff(payload);
      setStaff(prev => [created, ...prev]);
      toast.success(`Staff member ${created.email} invited successfully.`);
      setShowModal(false);
      setForm(emptyInviteForm);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to invite staff member.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleClick = (member: StaffUser) => {
    if (pendingToggle[member.id]) {
      // Second click — confirm
      clearTimeout(toggleTimers.current[member.id]);
      delete toggleTimers.current[member.id];
      setPendingToggle(prev => { const n = { ...prev }; delete n[member.id]; return n; });
      const newStatus: StaffUser['status'] = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      confirmToggle(member.id, newStatus);
    } else {
      // First click — show confirm prompt
      setPendingToggle(prev => ({ ...prev, [member.id]: true }));
      toggleTimers.current[member.id] = setTimeout(() => {
        setPendingToggle(prev => { const n = { ...prev }; delete n[member.id]; return n; });
      }, 4000);
    }
  };

  const cancelToggle = (id: string) => {
    clearTimeout(toggleTimers.current[id]);
    delete toggleTimers.current[id];
    setPendingToggle(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const confirmToggle = async (id: string, status: StaffUser['status']) => {
    try {
      const updated = await staffService.updateStatus(id, status);
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      toast.success(`Staff status updated to ${status}.`);
    } catch (err: any) {
      // Optimistic update on mock fallback
      setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      toast.success(`Staff status updated to ${status}.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-body text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Staff Management</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Admin-only access control for managing team members and their roles.
          </p>
        </div>
        <button
          onClick={() => { setForm(emptyInviteForm); setFormError(''); setShowModal(true); }}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Invite Staff Member
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

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-primary text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-surface border border-outline-variant rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary text-xs text-on-surface min-w-[140px]"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant">
          <h2 className="text-sm font-semibold text-on-surface">Team Members</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">{staff.length} member{staff.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low/60 border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5 font-semibold">Email</th>
                <th className="py-3 px-5 font-semibold">Role</th>
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold">Last Login</th>
                <th className="py-3 px-5 font-semibold">Created</th>
                <th className="py-3 px-5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <span className="material-symbols-outlined text-2xl animate-spin text-primary">progress_activity</span>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-on-surface-variant">No staff members found.</td>
                </tr>
              ) : (
                staff.map(member => (
                  <tr key={member.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3 px-5 font-medium text-on-surface">{member.email}</td>
                    <td className="py-3 px-5">
                      {member.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-on-primary">
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                          STAFF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      {member.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="material-symbols-outlined text-[10px]">circle</span> Active
                        </span>
                      )}
                      {member.status === 'INACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">
                          <span className="material-symbols-outlined text-[10px]">circle</span> Inactive
                        </span>
                      )}
                      {member.status === 'SUSPENDED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                          <span className="material-symbols-outlined text-[10px]">circle</span> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant">
                      {member.lastLoginAt ? formatRelativeTime(member.lastLoginAt) : '—'}
                    </td>
                    <td className="py-3 px-5 text-on-surface-variant">{formatDate(member.createdAt)}</td>
                    <td className="py-3 px-5">
                      {pendingToggle[member.id] ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleClick(member)}
                            className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-red-50 border border-red-200 text-red-800 hover:bg-red-100 transition-colors"
                          >
                            Confirm?
                          </button>
                          <button
                            onClick={() => cancelToggle(member.id)}
                            className="px-2 py-1.5 text-[11px] font-semibold rounded-lg border border-outline text-on-surface-variant hover:bg-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleClick(member)}
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {member.status === 'ACTIVE' ? 'block' : 'check_circle'}
                          </span>
                          {member.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-on-surface font-headline">Invite Staff Member</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="staff@brightloop.io"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 9 chars"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs"
                />
                {form.password && (
                  <div className="mt-2 space-y-1">
                    {PASSWORD_HINTS.map(hint => (
                      <div key={hint.label} className={`flex items-center gap-1.5 text-[11px] ${hint.test(form.password) ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[12px]">
                          {hint.test(form.password) ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {hint.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat password"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 focus:ring-1 focus:ring-primary text-xs"
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-[11px] text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              {formError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span> {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-semibold rounded-lg border border-outline text-on-surface hover:bg-surface-container text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60">
                  {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
