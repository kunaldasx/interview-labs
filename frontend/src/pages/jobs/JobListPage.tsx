import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../lib/formatters';

export default function JobListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', page, search],
    queryFn: () => jobsAPI.list({ page, page_size: 20, search: search || undefined }),
  });

  if (isLoading) return <Spinner size="lg" label="Loading jobs..." className="py-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Descriptions</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your open positions and requirements</p>
        </div>
        <Link to="/jobs/create">
          <Button>Create Job</Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-gray-100 placeholder-gray-500 transition-all duration-200 hover:border-white/[0.2] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
      </div>

      <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] overflow-hidden shadow-card">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {data?.items?.map((job) => (
              <tr key={job.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                    {job.title}
                  </Link>
                </td>
                <td className="px-6 py-4"><Badge status={job.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-400">{job.experience_min}-{job.experience_max} yrs</td>
                <td className="px-6 py-4 text-sm text-gray-400">{formatDate(job.created_at)}</td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/jobs/${job.id}`} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data?.items || data.items.length === 0) && (
          <div className="text-center py-8 text-sm text-gray-500">No jobs found</div>
        )}
      </div>

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-400 py-2">Page {page} of {Math.ceil(data.total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
