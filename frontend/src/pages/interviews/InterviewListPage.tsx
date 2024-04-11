import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { interviewsAPI } from '../../api/interviews';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../lib/formatters';

export default function InterviewListPage() {
  const { user } = useAuth();
  const canSchedule = user?.role === 'super_admin' || user?.role === 'hr_manager';
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const candidateId = searchParams.get('candidate_id');
  const jobId = searchParams.get('job_id');

  const { data, isLoading } = useQuery({
    queryKey: ['interviews', page, candidateId, jobId, user?.id],
    queryFn: () => interviewsAPI.list({
      page,
      page_size: 20,
      candidate_id: candidateId || undefined,
      job_id: jobId || undefined,
    }),
  });

  if (isLoading) return <Spinner size="lg" label="Loading interviews..." className="py-20" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Interviews</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage scheduled interviews</p>
        </div>
        {canSchedule && (
          <Link to="/interviews/schedule">
            <Button>Schedule Interview</Button>
          </Link>
        )}
      </div>

      <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] overflow-hidden shadow-card">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Questions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {data?.items?.map((interview) => (
              <tr key={interview.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-white">#{interview.id}</td>
                <td className="px-6 py-4 text-sm text-gray-400 capitalize">{interview.interview_type.replace('_', ' ')}</td>
                <td className="px-6 py-4"><Badge status={interview.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-400">{interview.scheduled_at ? formatDateTime(interview.scheduled_at) : '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{interview.duration_limit_min} min</td>
                <td className="px-6 py-4 text-sm text-gray-400">{interview.questions_asked}/{interview.total_questions}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  {user?.role === 'candidate' && interview.status === 'scheduled' && (
                    <Link to={`/interviews/${interview.id}/room`} className="text-sm text-green-400 hover:text-green-300 transition-colors">Start</Link>
                  )}
                  {user?.role === 'candidate' && interview.status === 'in_progress' && (
                    <Link to={`/interviews/${interview.id}/room`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Continue</Link>
                  )}
                  {user?.role !== 'candidate' && (
                    <Link to={`/interviews/${interview.id}`} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">View</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!data?.items || data.items.length === 0) && (
          <div className="text-center py-8 text-sm text-gray-500">No interviews found</div>
        )}
      </div>
    </div>
  );
}
