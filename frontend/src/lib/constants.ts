export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR_MANAGER: 'hr_manager',
  INTERVIEWER: 'interviewer',
  CANDIDATE: 'candidate',
  PLACEMENT_OFFICER: 'placement_officer',
} as const;

export const INTERVIEW_TYPES = {
  AI_CHAT: 'ai_chat',
  AI_VOICE: 'ai_voice',
  AI_BOTH: 'ai_both',
} as const;

export const INTERVIEW_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const CANDIDATE_STATUS = {
  REGISTERED: 'registered',
  SCREENED: 'screened',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEWED: 'interviewed',
  EVALUATED: 'evaluated',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
} as const;
