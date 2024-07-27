import apiClient from './client';
import type { ResumeScreening, ScreeningRequest } from '../types/screening';

export const screeningAPI = {
  screen: (data: ScreeningRequest) =>
    apiClient.post<ResumeScreening>('/screening/', data).then(r => r.data),

  screenAsync: (data: ScreeningRequest) =>
    apiClient.post<{ task_id: string; status: string }>('/screening/async', data).then(r => r.data),

  get: (id: number) =>
    apiClient.get<ResumeScreening>(`/screening/${id}`).then(r => r.data),

  getByJob: (jobId: number) =>
    apiClient.get<ResumeScreening[]>(`/screening/job/${jobId}`).then(r => r.data),
};
