import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesAPI } from '../../api/candidates';
import { screeningAPI } from '../../api/screening';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import ScreeningResultCard from '../../components/screening/ScreeningResultCard';
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

  const { data: candidate, isLoading, isError, error } = useQuery({
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

  // Fetch existing screening result for this candidate's job (if any)
  const { data: screenings } = useQuery({
    queryKey: ['screenings', 'job', candidate?.job_id],
    queryFn: () => screeningAPI.getByJob(candidate!.job_id!),
    enabled: !!candidate?.job_id,
  });

  const existingScreening = screenings?.find(s => s.candidate_id === Number(id)) ?? null;

  const screenMutation = useMutation({
    mutationFn: () => screeningAPI.screen({ candidate_id: Number(id), job_id: candidate!.job_id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenings', 'job', candidate?.job_id] });
      toast.success('Resume screened successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to screen resume');
    },
  });

  const canScreen = !!candidate?.resume_text && !!candidate?.job_id;

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (isError) return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-lg font-semibold text-white mb-1">Failed to load candidate</h2>
        <p className="text-sm text-gray-400">{(error as any)?.response?.data?.detail || 'An unexpected error occurred. Please try again.'}</p>
        <Link to="/candidates" className="inline-block mt-4 text-sm text-primary-400 hover:text-primary-300">Back to Candidates</Link>
      </div>
    </div>
  );
  if (!candidate) return <div className="text-center py-20 text-gray-500">Candidate not found</div>;

  const skills = candidate.skills?.skills as string[] | undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/candidates" className="text-sm text-indigo-400 hover:text-indigo-300">Back to Candidates</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-white">{candidate.full_name}</h1>
          <div className="flex items-center gap-3">
            <Badge status={candidate.status} />
            {!statusChanging ? (
              <button
                onClick={() => setStatusChanging(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Change
              </button>
            ) : (
              <select
                defaultValue={candidate.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                disabled={statusMutation.isPending}
                className="text-sm border border-white/[0.1] bg-white/[0.05] text-gray-100 rounded-md px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
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
            <p className="text-sm font-medium text-gray-400">Email</p>
            <p className="text-sm text-gray-100">{candidate.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Phone</p>
            <p className="text-sm text-gray-100">{candidate.phone || 'Not provided'}</p>
          </div>
          {candidate.address && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-400">Address</p>
              <p className="text-sm text-gray-100">{candidate.address}</p>
            </div>
          )}
          {candidate.date_of_birth && (
            <div>
              <p className="text-sm font-medium text-gray-400">Date of Birth</p>
              <p className="text-sm text-gray-100">{candidate.date_of_birth}</p>
            </div>
          )}
          {candidate.linkedin_url && (
            <div>
              <p className="text-sm font-medium text-gray-400">LinkedIn</p>
              <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 break-all">{candidate.linkedin_url}</a>
            </div>
          )}
          {candidate.portfolio_url && (
            <div>
              <p className="text-sm font-medium text-gray-400">Portfolio</p>
              <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 break-all">{candidate.portfolio_url}</a>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-400">Resume</p>
            <p className="text-sm text-gray-100">{candidate.resume_path ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Registered</p>
            <p className="text-sm text-gray-100">{formatDate(candidate.created_at)}</p>
          </div>
        </div>
      </Card>

      <Card title="Professional Details">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400">Experience</p>
              <p className="text-sm text-gray-100">{candidate.experience_years ? `${candidate.experience_years} years` : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Education</p>
              <p className="text-sm text-gray-100">{candidate.education || 'Not specified'}</p>
            </div>
          </div>

          {skills && skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-400">
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
              <div key={exp.id || exp.company_name} className="border-l-2 border-indigo-500/30 pl-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{exp.job_title}</h3>
                    <p className="text-sm text-indigo-400">{exp.company_name}</p>
                  </div>
                  {exp.is_current && (
                    <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full font-medium">Current</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  {(exp.start_date || exp.end_date) && (
                    <span>{exp.start_date}{exp.start_date && exp.end_date ? ' — ' : ''}{exp.end_date}</span>
                  )}
                  {exp.location && <span>{exp.location}</span>}
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-400">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {candidate.resume_text && (
        <Card title="Resume Text">
          <p className="text-sm text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">{candidate.resume_text}</p>
        </Card>
      )}

      <div className="flex gap-3">
        <Link to={`/interviews?candidate_id=${candidate.id}`}>
          <Button variant="outline">View Interviews</Button>
        </Link>
        {canScreen && (
          <Button
            onClick={() => screenMutation.mutate()}
            isLoading={screenMutation.isPending}
            variant={existingScreening ? 'outline' : 'primary'}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {existingScreening ? 'Re-Screen Resume' : 'Screen Resume'}
          </Button>
        )}
      </div>

      {existingScreening && (
        <ScreeningResultCard screening={existingScreening} />
      )}
    </div>
  );
}
