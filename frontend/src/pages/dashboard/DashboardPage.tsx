import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { jobsAPI } from '../../api/jobs';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import HiringTrendChart from '../../components/charts/HiringTrendChart';
import DepartmentBarChart from '../../components/charts/DepartmentBarChart';
import InterviewCompletionChart from '../../components/charts/InterviewCompletionChart';
import TimeToHireChart from '../../components/charts/TimeToHireChart';
import ScoreDistributionChart from '../../components/charts/ScoreDistributionChart';
import { formatDateTime } from '../../lib/formatters';
import toast from 'react-hot-toast';

const kpiConfig = [
  { key: 'total_candidates', label: 'Total Candidates', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', bg: 'bg-blue-500/[0.08]', iconBg: 'bg-blue-500/20', color: 'text-blue-400', glow: 'shadow-glow-blue' },
  { key: 'active_jobs', label: 'Active Jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', bg: 'bg-emerald-500/[0.08]', iconBg: 'bg-emerald-500/20', color: 'text-emerald-400', glow: 'shadow-glow-emerald' },
  { key: 'completed_interviews', label: 'Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-purple-500/[0.08]', iconBg: 'bg-purple-500/20', color: 'text-purple-400', glow: 'shadow-glow-purple' },
  { key: 'pending_evaluations', label: 'Pending Reviews', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-amber-500/[0.08]', iconBg: 'bg-amber-500/20', color: 'text-amber-400', glow: 'shadow-glow-amber' },
  { key: 'average_score', label: 'Avg. Score', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', bg: 'bg-indigo-500/[0.08]', iconBg: 'bg-indigo-500/20', color: 'text-indigo-400', glow: 'shadow-glow-purple' },
  { key: 'completion_rate', label: 'Completion %', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', bg: 'bg-teal-500/[0.08]', iconBg: 'bg-teal-500/20', color: 'text-teal-400', glow: 'shadow-glow-emerald' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: kpis, isLoading: kpisLoading } = useQuery({ queryKey: ['dashboard-kpis'], queryFn: dashboardAPI.getKPIs });
  const { data: upcoming } = useQuery({ queryKey: ['dashboard-upcoming'], queryFn: () => dashboardAPI.getUpcomingInterviews() });
  const { data: trends } = useQuery({ queryKey: ['dashboard-trends'], queryFn: () => dashboardAPI.getHiringTrends() });
  const { data: distribution } = useQuery({ queryKey: ['dashboard-distribution'], queryFn: dashboardAPI.getStatusDistribution });
  const { data: completion } = useQuery({ queryKey: ['dashboard-completion'], queryFn: dashboardAPI.getInterviewCompletion });
  const { data: timeToHire } = useQuery({ queryKey: ['dashboard-time-to-hire'], queryFn: dashboardAPI.getTimeToHire });
  const { data: scores } = useQuery({ queryKey: ['dashboard-scores', selectedJobId], queryFn: () => dashboardAPI.getScoreDistribution(selectedJobId) });
  const { data: jobsData } = useQuery({ queryKey: ['jobs-list-dashboard'], queryFn: () => jobsAPI.list() });

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

  if (kpisLoading) return <Spinner size="lg" label="Loading dashboard..." className="py-20" />;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient">{user?.full_name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">{today}</p>
        </div>
        <Button onClick={downloadPipelineExcel} isLoading={isDownloading} variant="primary">
          Export Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiConfig.map((kpi, index) => (
          <div
            key={kpi.key}
            className={`rounded-xl border border-white/[0.08] p-4 hover-lift shadow-card animate-fade-in-up ${kpi.bg} ${kpi.glow}`}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${kpi.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={kpi.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${kpi.color}`}>
                  {kpi.key === 'completion_rate'
                    ? `${(completion as any)?.completion_rate ?? 0}%`
                    : (kpis as any)?.[kpi.key] || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Hiring Trends (30 days)">
          {trends && trends.length > 0 ? (
            <HiringTrendChart data={trends} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>

        <Card title="Candidate Status Distribution">
          {distribution && distribution.length > 0 ? (
            <DepartmentBarChart data={distribution} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Interview Completion">
          {completion && completion.total > 0 ? (
            <InterviewCompletionChart data={completion} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>

        <Card title="Time to Hire by Job">
          {timeToHire && timeToHire.length > 0 ? (
            <TimeToHireChart data={timeToHire} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>

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

      <Card title="Upcoming Interviews">
        {upcoming?.items?.length > 0 ? (
          <div className="space-y-3">
            {upcoming.items.map((interview: any) => (
              <div key={interview.id} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.03] -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">Interview #{interview.id}</p>
                  <p className="text-xs text-gray-400">{interview.scheduled_at ? formatDateTime(interview.scheduled_at) : 'Not scheduled'}</p>
                </div>
                <Badge status={interview.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming interviews</p>
        )}
      </Card>
    </div>
  );
}
