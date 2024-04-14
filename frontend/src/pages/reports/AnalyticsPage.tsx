import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { jobsAPI } from '../../api/jobs';
import apiClient from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import TimeToHireChart from '../../components/charts/TimeToHireChart';
import InterviewCompletionChart from '../../components/charts/InterviewCompletionChart';
import ScoreDistributionChart from '../../components/charts/ScoreDistributionChart';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: timeToHire, isLoading: tthLoading } = useQuery({
    queryKey: ['analytics-time-to-hire'],
    queryFn: dashboardAPI.getTimeToHire,
  });

  const { data: completion, isLoading: compLoading } = useQuery({
    queryKey: ['analytics-completion'],
    queryFn: dashboardAPI.getInterviewCompletion,
  });

  const { data: scores, isLoading: scoresLoading } = useQuery({
    queryKey: ['analytics-scores', selectedJobId],
    queryFn: () => dashboardAPI.getScoreDistribution(selectedJobId),
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs-list-analytics'],
    queryFn: () => jobsAPI.list(),
  });

  const jobs = (jobsData as any)?.items || jobsData || [];

  const downloadPipelineExcel = async () => {
    setIsDownloading(true);
    try {
      const url = selectedJobId ? `/reports/pipeline/excel?job_id=${selectedJobId}` : '/reports/pipeline/excel';
      const response = await apiClient.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'pipeline_report.xlsx';
      a.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success('Downloaded pipeline_report.xlsx');
    } catch {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  if (tthLoading && compLoading && scoresLoading) {
    return <Spinner size="lg" label="Loading analytics..." className="py-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <Button onClick={downloadPipelineExcel} isLoading={isDownloading} variant="primary">
          Export Pipeline
        </Button>
      </div>

      <Card title="Time to Hire by Job">
        {timeToHire && timeToHire.length > 0 ? (
          <TimeToHireChart data={timeToHire} />
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No hire data available yet</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Interview Completion">
          {completion && completion.total > 0 ? (
            <InterviewCompletionChart data={completion} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No interview data available</p>
          )}
        </Card>

        <Card
          title="Score Distribution"
          action={
            <select
              value={selectedJobId ?? ''}
              onChange={e => setSelectedJobId(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">All Jobs</option>
              {Array.isArray(jobs) && jobs.map((job: any) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          }
        >
          {scores && scores.length > 0 ? (
            <ScoreDistributionChart data={scores} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No evaluation data available</p>
          )}
        </Card>
      </div>
    </div>
  );
}
