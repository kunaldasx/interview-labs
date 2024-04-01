import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { interviewsAPI } from '../../api/interviews';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatDateTime } from '../../lib/formatters';

export default function InterviewListPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const candidateId = searchParams.get('candidate_id');
  const jobId = searchParams.get('job_id');

  const { data, isLoading } = useQuery({
    queryKey: ['interviews', page, candidateId, jobId],
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
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage scheduled interviews</p>
        </div>
        <Link to="/interviews/schedule">
          <Button>Schedule Interview</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.items?.map((interview) => (
              <tr key={interview.id} className="hover:bg-primary-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{interview.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{interview.interview_type.replace('_', ' ')}</td>
                <td className="px-6 py-4"><Badge status={interview.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{interview.scheduled_at ? formatDateTime(interview.scheduled_at) : '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{interview.duration_limit_min} min</td>
                <td className="px-6 py-4 text-sm text-gray-500">{interview.questions_asked}/{interview.total_questions}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  {interview.status === 'scheduled' && (
                    <Link to={`/interviews/${interview.id}/room`} className="text-sm text-green-600 hover:text-green-800 transition-colors">Start</Link>
                  )}
                  {interview.status === 'in_progress' && (
                    <Link to={`/interviews/${interview.id}/room`} className="text-sm text-blue-600 hover:text-blue-800 transition-colors">Continue</Link>
                  )}
                  <Link to={`/interviews/${interview.id}`} className="text-sm text-primary-600 hover:text-primary-800 transition-colors">View</Link>
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
