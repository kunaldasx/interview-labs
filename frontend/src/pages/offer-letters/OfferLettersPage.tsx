import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { offerLettersAPI } from '../../api/offerLetters';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/formatters';
import type { OfferLetterStatus } from '../../types/offerLetter';

const STATUS_TABS: { label: string; value: OfferLetterStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Sent', value: 'sent' },
  { label: 'Rejected', value: 'rejected' },
];

export default function OfferLettersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OfferLetterStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['offer-letters', page, statusFilter],
    queryFn: () =>
      offerLettersAPI.list({
        page,
        page_size: 20,
        status: statusFilter || undefined,
      }),
  });

  if (isLoading) return <Spinner size="lg" label="Loading offer letters..." className="py-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Offer Letters</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and track offer letters</p>
        </div>
      </div>

      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              statusFilter === tab.value
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] overflow-hidden shadow-card">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {data?.items?.map((offer) => (
              <tr key={offer.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <Link
                    to={`/offer-letters/${offer.id}`}
                    className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {offer.candidate_name || `Candidate #${offer.candidate_id}`}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {offer.job_title || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 font-medium">
                  {offer.currency} {offer.salary.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {formatDate(offer.start_date)}
                </td>
                <td className="px-6 py-4">
                  <Badge status={offer.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {formatDate(offer.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/offer-letters/${offer.id}`}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data?.items || data.items.length === 0) && (
          <div className="text-center py-8 text-sm text-gray-500">No offer letters found</div>
        )}
      </div>

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-400 py-2">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(data.total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
