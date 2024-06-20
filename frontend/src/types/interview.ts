export interface Interview {
  id: number;
  candidate_id: number;
  job_id: number;
  interview_type: 'ai_chat' | 'ai_voice' | 'ai_both';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  duration_limit_min: number;
  language: string;
  total_questions: number;
  questions_asked: number;
  recording_url?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewListResponse {
  items: Interview[];
  total: number;
  page: number;
  page_size: number;
}

export interface InterviewCreateRequest {
  candidate_id: number;
  job_id: number;
  interview_type?: string;
  scheduled_at?: string;
  duration_limit_min?: number;
  language?: string;
}

export interface TranscriptEntry {
  id: number;
  speaker: 'ai' | 'candidate' | 'system';
  message_type: 'text' | 'audio' | 'system';
  content: string;
  sequence_order: number;
  timestamp: string;
}

export interface ChatMessage {
  type: 'start' | 'message' | 'end' | 'ping' | 'reconnect';
  content: string;
}

export interface ChatResponse {
  type:
    | 'greeting' | 'response' | 'complete' | 'ended' | 'error' | 'candidate'
    | 'stream_start' | 'stream_chunk' | 'stream_end'
    | 'thinking' | 'pong' | 'reconnected';
  content: string;
  code?: string;
  is_complete?: boolean;
  question_number?: number;
  total_questions?: number;
  time_remaining_min?: number;
  conversation_history?: { role: string; content: string }[];
  current_question_index?: number;
  isStreaming?: boolean;
}

export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface InterviewDetail extends Interview {
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  transcripts: TranscriptEntry[];
}

export interface InterviewQuestion {
  id: number;
  question_text: string;
  question_type: string;
  difficulty: string;
  question_order: number;
  is_follow_up: boolean;
  asked_at?: string;
}

export interface InterviewAnswer {
  id: number;
  question_id: number;
  answer_text?: string;
  answer_mode: 'text' | 'voice';
  confidence_score?: number;
  answered_at: string;
}
