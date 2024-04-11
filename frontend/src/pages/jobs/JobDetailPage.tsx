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
      </div>
    </div>
  );
}
