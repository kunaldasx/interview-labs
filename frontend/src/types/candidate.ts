export interface Candidate {
  id: number;
  user_id?: number;
  full_name: string;
  email: string;
  phone?: string;
  resume_path?: string;
  resume_text?: string;
  job_id?: number;
  experience_years?: number;
  education?: string;
  skills?: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateListResponse {
  items: Candidate[];
  total: number;
  page: number;
  page_size: number;
}

export interface CandidateCreateRequest {
  full_name: string;
  email: string;
  phone?: string;
  job_id?: number;
  experience_years?: number;
  education?: string;
  skills?: Record<string, any>;
}
