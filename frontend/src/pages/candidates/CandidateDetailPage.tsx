import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { candidatesAPI } from '../../api/candidates';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatDate } from '../../lib/formatters';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidatesAPI.get(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (!candidate) return <div className="text-center py-20 text-gray-500">Candidate not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/candidates" className="text-sm text-indigo-600 hover:text-indigo-800">Back to Candidates</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-gray-900">{candidate.full_name}</h1>
          <Badge status={candidate.status} />
        </div>
      </div>

      <Card title="Profile Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{candidate.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-sm text-gray-900">{candidate.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Experience</p>
            <p className="text-sm text-gray-900">{candidate.experience_years ? `${candidate.experience_years} years` : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Education</p>
            <p className="text-sm text-gray-900">{candidate.education || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Resume</p>
            <p className="text-sm text-gray-900">{candidate.resume_path ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Registered</p>
            <p className="text-sm text-gray-900">{formatDate(candidate.created_at)}</p>
          </div>
        </div>
      </Card>

      {candidate.resume_text && (
        <Card title="Resume Text">
          <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">{candidate.resume_text}</p>
        </Card>
      )}

      <div className="flex gap-3">
        <Link to={`/interviews?candidate_id=${candidate.id}`}>
          <Button variant="outline">View Interviews</Button>
        </Link>
      </div>
    </div>
  );
}
