import apiClient from './client';
import type {
  OfferLetter,
  OfferLetterCreate,
  OfferLetterUpdate,
  OfferLetterApproval,
  OfferLetterListResponse,
} from '../types/offerLetter';

export const offerLettersAPI = {
  list: (params?: { status?: string; candidate_id?: number; job_id?: number; interview_id?: number; page?: number; page_size?: number }) =>
    apiClient.get<OfferLetterListResponse>('/offer-letters/', { params }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<OfferLetter>(`/offer-letters/${id}`).then(r => r.data),

  getByInterview: (interviewId: number) =>
    apiClient.get<OfferLetter>(`/offer-letters/interview/${interviewId}`).then(r => r.data),

  create: (data: OfferLetterCreate) =>
    apiClient.post<OfferLetter>('/offer-letters/', data).then(r => r.data),

  update: (id: number, data: OfferLetterUpdate) =>
    apiClient.put<OfferLetter>(`/offer-letters/${id}`, data).then(r => r.data),

  submitForApproval: (id: number) =>
    apiClient.post<OfferLetter>(`/offer-letters/${id}/submit`).then(r => r.data),

  approve: (id: number, data: OfferLetterApproval) =>
    apiClient.post<OfferLetter>(`/offer-letters/${id}/approve`, data).then(r => r.data),

  send: (id: number) =>
    apiClient.post<OfferLetter>(`/offer-letters/${id}/send`).then(r => r.data),
};
