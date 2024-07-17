import apiClient from './client';

export interface DemoRequestData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
}

export interface DemoRequestResponse {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export const contactAPI = {
  submitDemoRequest: (data: DemoRequestData) =>
    apiClient.post<DemoRequestResponse>('/contact/', data).then(r => r.data),
};
