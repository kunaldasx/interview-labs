import apiClient from './client';
import type { Job, JobListResponse, JobCreateRequest } from '../types/job';

export const jobsAPI = {
  list: (params?: Record<string, any>) =>
    apiClient.get<JobListResponse>('/jobs/', { params }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<Job>(`/jobs/${id}`).then(r => r.data),

  create: (data: JobCreateRequest) =>
    apiClient.post<Job>('/jobs/', data).then(r => r.data),

  update: (id: number, data: Partial<JobCreateRequest>) =>
    apiClient.put<Job>(`/jobs/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete(`/jobs/${id}`).then(r => r.data),
};
