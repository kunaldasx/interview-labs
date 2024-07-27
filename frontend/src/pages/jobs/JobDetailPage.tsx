import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../../api/jobs';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatDate } from '../../lib/formatters';

export default function JobDetailPage() {
  const { id } = useParams();
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsAPI.get(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (!job) return <div className="text-center py-20 text-gray-500">Job not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/jobs" className="text-sm text-indigo-400 hover:text-indigo-300">Back to Jobs</Link>
          <h1 className="text-2xl font-bold text-white mt-1">{job.title}</h1>
        </div>
        <Badge status={job.status} />
      </div>

      <Card title="Details">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-400">Description</p>
            <p className="text-sm text-gray-100 mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
          {job.requirements && (
            <div>
              <p className="text-sm font-medium text-gray-400">Requirements</p>
              <p className="text-sm text-gray-100 mt-1 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-gray-400">Experience</p>
              <p className="text-sm text-gray-100">{job.experience_min}-{job.experience_max} years</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Education</p>
              <p className="text-sm text-gray-100">{job.education_level || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Location</p>
              <p className="text-sm text-gray-100">{job.location || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Salary Range</p>
              <p className="text-sm text-gray-100">{job.salary_range || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Created</p>
              <p className="text-sm text-gray-100">{formatDate(job.created_at)}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Link to={`/candidates?job_id=${job.id}`}>
          <Button variant="outline">View Candidates</Button>
        </Link>
        <Link to={`/interviews?job_id=${job.id}`}>
          <Button variant="outline">View Interviews</Button>
        </Link>
        <Link to={`/jobs/${job.id}/screening`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Screening Results
          </Button>
        </Link>
      </div>
    </div>
  );
}
