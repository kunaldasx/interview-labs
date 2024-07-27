export interface ResumeScreening {
  id: number;
  candidate_id: number;
  job_id: number;
  keyword_match_score: number;
  skill_relevance_score: number;
  experience_match_score: number;
  education_match_score: number;
  overall_score: number;
  recommendation: 'strongly_recommend' | 'recommend' | 'maybe' | 'not_recommend';
  matched_skills: { skills: string[] } | null;
  missing_skills: { skills: string[] } | null;
  strengths: { items: string[] } | null;
  concerns: { items: string[] } | null;
  summary: string | null;
  screened_at: string;
  created_at: string;
}

export interface ScreeningRequest {
  candidate_id: number;
  job_id: number;
}
