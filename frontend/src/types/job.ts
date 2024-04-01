export interface Job {
  id: number;
  title: string;
  department_id?: number;
  domain_id?: number;
  description: string;
  requirements?: string;
  required_skills?: Record<string, any>;
  preferred_skills?: Record<string, any>;
  experience_min: number;
  experience_max: number;
  education_level?: string;
  location?: string;
  salary_range?: string;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'archived';
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface JobListResponse {
  items: Job[];
  total: number;
  page: number;
  page_size: number;
}

export interface JobCreateRequest {
  title: string;
  department_id?: number;
  domain_id?: number;
  description: string;
  requirements?: string;
  required_skills?: Record<string, any>;
  preferred_skills?: Record<string, any>;
  experience_min?: number;
  experience_max?: number;
  education_level?: string;
  location?: string;
  salary_range?: string;
}
