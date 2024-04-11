import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesAPI } from '../../api/candidates';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatDate } from '../../lib/formatters';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'registered', label: 'Registered' },
  { value: 'screened', label: 'Screened' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'evaluated', label: 'Evaluated' },
  { value: 'offered', label: 'Offered' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CandidateDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [statusChanging, setStatusChanging] = useState(false);

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidatesAPI.get(Number(id)),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => candidatesAPI.updateStatus(Number(id), newStatus),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      const credentialStatuses = ['screened', 'shortlisted'];
      if (credentialStatuses.includes(updated.status)) {
        toast.success(`Credentials emailed to ${updated.email}`);
      } else {
        toast.success(`Status updated to ${updated.status}`);
      }
      setStatusChanging(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update status');
      setStatusChanging(false);
    },
  });

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (!candidate) return <div className="text-center py-20 text-gray-500">Candidate not found</div>;

  const skills = candidate.skills?.skills as string[] | undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/candidates" className="text-sm text-indigo-600 hover:text-indigo-800">Back to Candidates</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-gray-900">{candidate.full_name}</h1>
          <div className="flex items-center gap-3">
            <Badge status={candidate.status} />
            {!statusChanging ? (
              <button
                onClick={() => setStatusChanging(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
              >
                Change
              </button>
            ) : (
              <select
                defaultValue={candidate.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <Card title="Personal Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm text-gray-900">{candidate.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-sm text-gray-900">{candidate.phone || 'Not provided'}</p>
          </div>
          {candidate.address && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-sm text-gray-900">{candidate.address}</p>
            </div>
          )}
          {candidate.date_of_birth && (
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="text-sm text-gray-900">{candidate.date_of_birth}</p>
            </div>
          )}
          {candidate.linkedin_url && (
            <div>
              <p className="text-sm font-medium text-gray-500">LinkedIn</p>
              <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 break-all">{candidate.linkedin_url}</a>
            </div>
          )}
          {candidate.portfolio_url && (
            <div>
              <p className="text-sm font-medium text-gray-500">Portfolio</p>
              <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 break-all">{candidate.portfolio_url}</a>
            </div>
          )}
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

      <Card title="Professional Details">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Experience</p>
              <p className="text-sm text-gray-900">{candidate.experience_years ? `${candidate.experience_years} years` : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Education</p>
              <p className="text-sm text-gray-900">{candidate.education || 'Not specified'}</p>
            </div>
          </div>

          {skills && skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {candidate.work_experiences && candidate.work_experiences.length > 0 && (
        <Card title="Work Experience">
          <div className="space-y-4">
            {candidate.work_experiences.map((exp) => (
              <div key={exp.id || exp.company_name} className="border-l-2 border-indigo-200 pl-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{exp.job_title}</h3>
                    <p className="text-sm text-indigo-600">{exp.company_name}</p>
                  </div>
                  {exp.is_current && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Current</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  {(exp.start_date || exp.end_date) && (
                    <span>{exp.start_date}{exp.start_date && exp.end_date ? ' — ' : ''}{exp.end_date}</span>
                  )}
                  {exp.location && <span>{exp.location}</span>}
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-600">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

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
