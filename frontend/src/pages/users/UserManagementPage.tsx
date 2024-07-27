import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../api/users';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { formatDate } from '../../lib/formatters';
import toast from 'react-hot-toast';

const ALL_ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'interviewer', label: 'Interviewer' },
  { value: 'candidate', label: 'Candidate' },
  { value: 'placement_officer', label: 'Placement Officer' },
];

const ASSIGNABLE_ROLES = ALL_ROLES.filter(r => r.value !== 'super_admin');

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'hr_manager',
    phone: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () => usersAPI.list({
      page,
      page_size: 20,
      search: search || undefined,
      role: roleFilter || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setForm({ full_name: '', email: '', password: '', role: 'hr_manager', phone: '' });
      toast.success('User created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      usersAPI.updateStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      full_name: form.full_name,
      email: form.email,
      password: form.password,
      role: form.role,
      phone: form.phone || undefined,
    });
  };

  if (isLoading) return <Spinner size="lg" label="Loading users..." className="py-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage team members and user accounts</p>
        </div>
        <Button onClick={() => setShowModal(true)}>Add User</Button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-gray-100 placeholder-gray-500 transition-all duration-200 hover:border-white/[0.2] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-gray-100 transition-all duration-200 hover:border-white/[0.2] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="">All Roles</option>
          {ALL_ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] overflow-hidden shadow-card">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {data?.items?.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-white">{user.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                <td className="px-6 py-4">
                  <Badge status={user.role} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{user.phone || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => statusMutation.mutate({ id: user.id, is_active: !user.is_active })}
                    className={`text-sm font-medium transition-colors ${
                      user.is_active
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-green-400 hover:text-green-300'
                    }`}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data?.items || data.items.length === 0) && (
          <div className="text-center py-8 text-sm text-gray-500">No users found</div>
        )}
      </div>

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-400 py-2">Page {page}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add User">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            id="full_name"
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-gray-100 transition-all duration-200 hover:border-white/[0.2] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              {ASSIGNABLE_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <Input
            id="phone"
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
