import apiClient from './client';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types/auth';

export const authAPI = {
  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<TokenResponse>('/auth/register', data).then(r => r.data),

  getMe: () =>
    apiClient.get<User>('/auth/me').then(r => r.data),

  updateMe: (data: Partial<User>) =>
    apiClient.put<User>('/auth/me', data).then(r => r.data),

  refreshToken: (refreshToken: string) =>
    apiClient.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken }).then(r => r.data),

  demoLogin: () =>
    apiClient.post<TokenResponse>('/auth/demo').then(r => r.data),

  tokenLogin: (token: string) =>
    apiClient.post<TokenResponse>('/auth/token-login', { token }).then(r => r.data),
};
