export interface WorkExperience {
  id?: number;
  candidate_id?: number;
  company_name: string;
  job_title: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description?: string;
  created_at?: string;
}

export interface Candidate {
  id: number;
  user_id?: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_path?: string;
  resume_text?: string;
  job_id?: number;
  experience_years?: number;
  education?: string;
  skills?: Record<string, any>;
  status: string;
  work_experiences: WorkExperience[];
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
  address?: string;
  date_of_birth?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  job_id?: number;
  experience_years?: number;
  education?: string;
  skills?: Record<string, any>;
  work_experiences?: WorkExperience[];
}

export interface ResumeParseResponse {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  linkedin_url: string;
  portfolio_url: string;
  experience_years: number;
  education: string;
  skills: string[];
  work_experiences: WorkExperience[];
  resume_path: string;
  resume_text: string;
}
