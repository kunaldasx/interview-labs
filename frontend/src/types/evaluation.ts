export interface Evaluation {
  id: number;
  interview_id: number;
  candidate_id: number;
  communication_score: number;
  technical_score: number;
  confidence_score: number;
  domain_knowledge_score: number;
  problem_solving_score: number;
  overall_score: number;
  strengths?: Record<string, any>;
  weaknesses?: Record<string, any>;
  detailed_feedback?: string;
  ai_recommendation: 'strongly_hire' | 'hire' | 'maybe' | 'no_hire';
  hr_decision: 'pending' | 'approved' | 'rejected' | 'on_hold';
  hr_notes?: string;
  evaluated_at: string;
  created_at: string;
  updated_at: string;
}

export interface HRDecisionRequest {
  hr_decision: string;
  hr_notes?: string;
}
