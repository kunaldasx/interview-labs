import apiClient from './client';

export const dashboardAPI = {
  getKPIs: () =>
    apiClient.get('/dashboard/kpis').then(r => r.data),

  getUpcomingInterviews: (limit = 10) =>
    apiClient.get('/dashboard/upcoming-interviews', { params: { limit } }).then(r => r.data),

  getPendingReviews: (limit = 10) =>
    apiClient.get('/dashboard/pending-reviews', { params: { limit } }).then(r => r.data),

  getHiringTrends: (days = 30) =>
    apiClient.get('/dashboard/hiring-trends', { params: { days } }).then(r => r.data),

  getStatusDistribution: () =>
    apiClient.get('/dashboard/status-distribution').then(r => r.data),

  getTimeToHire: () =>
    apiClient.get('/dashboard/time-to-hire').then(r => r.data),

  getInterviewCompletion: () =>
    apiClient.get('/dashboard/interview-completion').then(r => r.data),

  getScoreDistribution: (jobId?: number) =>
    apiClient.get('/dashboard/score-distribution', { params: jobId ? { job_id: jobId } : {} }).then(r => r.data),
};
