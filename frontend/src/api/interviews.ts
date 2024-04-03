import apiClient from './client';
import type { Interview, InterviewListResponse, InterviewCreateRequest, InterviewDetail } from '../types/interview';

export const interviewsAPI = {
  list: (params?: Record<string, any>) =>
    apiClient.get<InterviewListResponse>('/interviews/', { params }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<InterviewDetail>(`/interviews/${id}`).then(r => r.data),

  create: (data: InterviewCreateRequest) =>
    apiClient.post<Interview>('/interviews/', data).then(r => r.data),

  start: (id: number) =>
    apiClient.post(`/interviews/${id}/start`).then(r => r.data),

  sendMessage: (id: number, content: string) =>
    apiClient.post(`/interviews/${id}/message`, { content, message_type: 'text' }).then(r => r.data),

  end: (id: number) =>
    apiClient.post(`/interviews/${id}/end`).then(r => r.data),
};
