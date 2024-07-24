import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactAPI, DemoRequestResponse } from '../../api/contact';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/formatters';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  contacted: 'bg-blue-500/15 text-blue-400',
  closed: 'bg-gray-500/15 text-gray-400',
};

const PAGE_SIZE = 20;

export default function DemoRequestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['demoRequests', page, statusFilter],
    queryFn: () => contactAPI.listDemoRequests({
      page,
      page_size: PAGE_SIZE,
      status: statusFilter || undefined,
    }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      contactAPI.updateDemoRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demoRequests'] });
      toast.success('Status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    },
  });

  function nextStatus(current: string): { label: string; status: string } | null {
    if (current === 'pending') return { label: 'Mark Contacted', status: 'contacted' };
    if (current === 'contacted') return { label: 'Mark Closed', status: 'closed' };
    return null;
  }

  if (isLoading) return <Spinner size="lg" label="Loading demo requests..." className="py-20" />;

  const items: DemoRequestResponse[] = data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Demo Requests</h1>
        <p className="text-sm text-gray-400 mt-1">Manage contact form submissions and demo requests</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-gray-100 transition-all duration-200 hover:border-white/[0.2] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] overflow-hidden shadow-card">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {items.map((req) => {
              const next = nextStatus(req.status);
              return (
                <tr key={req.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{req.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{req.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{req.company || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{req.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-[200px] truncate" title={req.message || ''}>
                    {req.message || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[req.status] || 'bg-gray-500/15 text-gray-400'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(req.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    {next ? (
                      <button
                        onClick={() => statusMutation.mutate({ id: req.id, status: next.status })}
                        disabled={statusMutation.isPending}
                        className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50"
                      >
                        {next.label}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">No demo requests found</div>
        )}
      </div>

      {(page > 1 || items.length === PAGE_SIZE) && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-400 py-2">Page {page}</span>
          <Button variant="outline" size="sm" disabled={items.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
