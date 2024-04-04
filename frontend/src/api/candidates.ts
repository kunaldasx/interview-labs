import apiClient from './client';
import type { Candidate, CandidateListResponse, CandidateCreateRequest, ResumeParseResponse } from '../types/candidate';

export const candidatesAPI = {
  list: (params?: Record<string, any>) =>
    apiClient.get<CandidateListResponse>('/candidates/', { params }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<Candidate>(`/candidates/${id}`).then(r => r.data),

  create: (data: CandidateCreateRequest) =>
    apiClient.post<Candidate>('/candidates/', data).then(r => r.data),

  update: (id: number, data: Partial<CandidateCreateRequest>) =>
    apiClient.put<Candidate>(`/candidates/${id}`, data).then(r => r.data),

  uploadResume: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<Candidate>(`/candidates/${id}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  parseResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ResumeParseResponse>('/resume/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  updateStatus: (id: number, status: string) =>
    apiClient.patch<Candidate>(`/candidates/${id}/status`, null, { params: { status } }).then(r => r.data),
};
