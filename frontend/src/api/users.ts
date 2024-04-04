import apiClient from './client';
import type { User, UserListResponse, UserCreateRequest, UserUpdateRequest } from '../types/user';

export const usersAPI = {
  list: (params?: Record<string, any>) =>
    apiClient.get<UserListResponse>('/users/', { params }).then(r => r.data),

  get: (id: number) =>
    apiClient.get<User>(`/users/${id}`).then(r => r.data),

  create: (data: UserCreateRequest) =>
    apiClient.post<User>('/users/', data).then(r => r.data),

  update: (id: number, data: UserUpdateRequest) =>
    apiClient.put<User>(`/users/${id}`, data).then(r => r.data),

  updateStatus: (id: number, is_active: boolean) =>
    apiClient.patch<User>(`/users/${id}/status`, { is_active }).then(r => r.data),
};
