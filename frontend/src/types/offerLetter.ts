export type OfferLetterStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sent';

export interface OfferLetter {
  id: number;
  interview_id: number;
  candidate_id: number;
  job_id: number;
  created_by: number;
  approved_by?: number | null;
  status: OfferLetterStatus;
  salary: number;
  currency: string;
  start_date: string;
  end_date?: string | null;
  benefits: string;
  reporting_manager: string;
  department: string;
  location: string;
  additional_terms?: string | null;
  rejection_reason?: string | null;
  sent_at?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  candidate_name?: string | null;
  candidate_email?: string | null;
  job_title?: string | null;
}

export interface OfferLetterCreate {
  interview_id: number;
  salary: number;
  currency: string;
  start_date: string;
  end_date?: string;
  benefits: string;
  reporting_manager: string;
  department: string;
  location: string;
  additional_terms?: string;
}

export interface OfferLetterUpdate {
  salary?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  benefits?: string;
  reporting_manager?: string;
  department?: string;
  location?: string;
  additional_terms?: string;
}

export interface OfferLetterApproval {
  approved: boolean;
  rejection_reason?: string;
}

export interface OfferLetterListResponse {
  items: OfferLetter[];
  total: number;
  page: number;
  page_size: number;
}
