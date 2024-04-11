import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewsAPI } from '../../api/interviews';
import { useAuth } from '../../context/AuthContext';
import TranscriptPanel from '../../components/interview/TranscriptPanel';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function InterviewDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const interviewId = Number(id);

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewsAPI.get(interviewId),
    enabled: !!id,
  });

  if (isLoading) return <Spinner size="lg" label="Loading interview..." className="py-20" />;
  if (!interview) return <div className="text-center py-20 text-gray-500">Interview not found</div>;

  const isCandidate = user?.role === 'candidate';
  const canResume = isCandidate && (interview.status === 'scheduled' || interview.status === 'in_progress');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Interview #{interview.id}</h1>
          <Badge status={interview.status} />
        </div>
        <div className="flex items-center gap-3">
          {canResume && (
            <Link
              to={`/interviews/${interview.id}/room`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {interview.status === 'in_progress' ? 'Continue Interview' : 'Start Interview'}
            </Link>
          )}
          <Link
            to="/interviews"
            className="inline-flex items-center px-4 py-2 border border-white/[0.15] text-gray-300 text-sm font-medium rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-4">
          <p className="text-xs text-gray-400 uppercase font-medium">Type</p>
          <p className="text-lg font-semibold text-white capitalize mt-1">{interview.interview_type.replace('_', ' ')}</p>
        </div>
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-4">
          <p className="text-xs text-gray-400 uppercase font-medium">Duration</p>
          <p className="text-lg font-semibold text-white mt-1">{interview.duration_limit_min} min</p>
        </div>
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-4">
          <p className="text-xs text-gray-400 uppercase font-medium">Questions Answered</p>
          <p className="text-lg font-semibold text-white mt-1">{interview.questions_asked} / {interview.total_questions}</p>
        </div>
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-4">
          <p className="text-xs text-gray-400 uppercase font-medium">Language</p>
          <p className="text-lg font-semibold text-white uppercase mt-1">{interview.language}</p>
        </div>
      </div>

      {/* Recording Playback */}
      {interview.recording_url && (
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recording</h2>
          <video
            src={interview.recording_url}
            controls
            className="w-full max-h-[480px] rounded-lg bg-black"
          />
        </div>
      )}

      {/* Transcript */}
      {interview.transcripts && interview.transcripts.length > 0 && (
        <TranscriptPanel transcripts={interview.transcripts} />
      )}

      {/* Q&A List */}
      {interview.questions && interview.questions.length > 0 && (
        <div className="bg-white/[0.05] rounded-xl border border-white/[0.08]">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Questions & Answers</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {interview.questions
              .sort((a, b) => a.question_order - b.question_order)
              .map((question) => {
                const answer = interview.answers?.find(a => a.question_id === question.id);
                return (
                  <div key={question.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-semibold">
                        Q{question.question_order}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{question.question_text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 capitalize">{question.question_type}</span>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs text-gray-400 capitalize">{question.difficulty}</span>
                        </div>
                        {answer ? (
                          <div className="mt-3 pl-4 border-l-2 border-green-500/30">
                            <p className="text-sm text-gray-300">{answer.answer_text || '(Voice answer)'}</p>
                            {answer.confidence_score != null && (
                              <span className="text-xs text-gray-400 mt-1 inline-block">
                                Confidence: {Math.round(answer.confidence_score * 100)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-gray-400 italic">Not answered</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
