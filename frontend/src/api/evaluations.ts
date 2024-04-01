import apiClient from './client';
import type { Evaluation, HRDecisionRequest } from '../types/evaluation';

export const evaluationsAPI = {
  evaluate: (interviewId: number) =>
    apiClient.post<Evaluation>('/evaluations', { interview_id: interviewId }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<Evaluation>(`/evaluations/${id}`).then(r => r.data),

  getByInterview: (interviewId: number) =>
    apiClient.get<Evaluation>(`/evaluations/interview/${interviewId}`).then(r => r.data),

  updateDecision: (id: number, data: HRDecisionRequest) =>
    apiClient.put<Evaluation>(`/evaluations/${id}/decision`, data).then(r => r.data),
};
