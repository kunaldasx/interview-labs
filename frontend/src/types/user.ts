export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'super_admin' | 'hr_manager' | 'interviewer' | 'candidate';
  department_id?: number;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
  phone?: string;
  department_id?: number;
}

export interface UserUpdateRequest {
  full_name?: string;
  phone?: string;
  department_id?: number;
  is_active?: boolean;
}
