import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { screeningAPI } from '../../api/screening';
import { jobsAPI } from '../../api/jobs';
import { candidatesAPI } from '../../api/candidates';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatScore, getScreeningRecommendationLabel } from '../../lib/formatters';
import toast from 'react-hot-toast';

function scoreBarColor(score: number): string {
  if (score >= 8) return 'bg-emerald-500';
  if (score >= 6) return 'bg-green-500';
  if (score >= 4) return 'bg-yellow-500';
  if (score >= 2) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function ScreeningResultsPage() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const [screeningInProgress, setScreeningInProgress] = useState(false);

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsAPI.get(Number(jobId)),
    enabled: !!jobId,
  });

  const { data: screenings, isLoading } = useQuery({
    queryKey: ['screenings', 'job', jobId],
    queryFn: () => screeningAPI.getByJob(Number(jobId)),
    enabled: !!jobId,
  });

  const { data: candidates } = useQuery({
    queryKey: ['candidates', 'job', jobId],
    queryFn: () => candidatesAPI.list({ job_id: Number(jobId), page_size: 200 }),
    enabled: !!jobId,
  });

  const screenMutation = useMutation({
    mutationFn: (candidateId: number) =>
      screeningAPI.screen({ candidate_id: candidateId, job_id: Number(jobId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenings', 'job', jobId] });
    },
  });

  const handleScreenAll = async () => {
    if (!candidates?.items || !screenings) return;
    const screenedCandidateIds = new Set(screenings.map(s => s.candidate_id));
    const unscreened = candidates.items.filter(
      c => !screenedCandidateIds.has(c.id) && c.resume_text
    );

    if (unscreened.length === 0) {
      toast('All candidates with resumes have been screened');
      return;
    }

    setScreeningInProgress(true);
    let successCount = 0;
    let failCount = 0;

    for (const candidate of unscreened) {
      try {
        await screenMutation.mutateAsync(candidate.id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setScreeningInProgress(false);
    queryClient.invalidateQueries({ queryKey: ['screenings', 'job', jobId] });
    if (successCount > 0) toast.success(`Screened ${successCount} candidate${successCount > 1 ? 's' : ''}`);
    if (failCount > 0) toast.error(`Failed to screen ${failCount} candidate${failCount > 1 ? 's' : ''}`);
  };

  const unscreenedCount = (() => {
    if (!candidates?.items || !screenings) return 0;
    const screenedIds = new Set(screenings.map(s => s.candidate_id));
    return candidates.items.filter(c => !screenedIds.has(c.id) && c.resume_text).length;
  })();

  if (isLoading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link to={`/jobs/${jobId}`} className="text-sm text-indigo-400 hover:text-indigo-300">Back to Job</Link>
        <div className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-2xl font-bold text-white">Screening Results</h1>
            {job && <p className="text-sm text-gray-400 mt-0.5">{job.title}</p>}
          </div>
          {unscreenedCount > 0 && (
            <Button onClick={handleScreenAll} isLoading={screeningInProgress}>
              Screen All ({unscreenedCount})
            </Button>
          )}
        </div>
      </div>

      {!screenings || screenings.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400">No candidates have been screened for this job yet.</p>
            {unscreenedCount > 0 && (
              <Button className="mt-4" onClick={handleScreenAll} isLoading={screeningInProgress}>
                Screen {unscreenedCount} Candidate{unscreenedCount > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3 pl-2 w-12">#</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">Candidate</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">Overall Score</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">Recommendation</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">Skills Match</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider pb-3 pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {screenings.map((screening, index) => (
                  <tr key={screening.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-3">
                      <Link to={`/candidates/${screening.candidate_id}`} className="text-sm font-medium text-white hover:text-indigo-400">
                        Candidate #{screening.candidate_id}
                      </Link>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBarColor(screening.overall_score)}`} style={{ width: `${(screening.overall_score / 10) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium text-white">{formatScore(screening.overall_score)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge status={screening.recommendation} label={getScreeningRecommendationLabel(screening.recommendation)} />
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-400">
                        {screening.matched_skills?.skills?.length || 0} matched
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <Link to={`/candidates/${screening.candidate_id}`} className="text-sm text-indigo-400 hover:text-indigo-300">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
