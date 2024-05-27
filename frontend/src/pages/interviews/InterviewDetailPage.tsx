import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { interviewsAPI } from '../../api/interviews';
import { evaluationsAPI } from '../../api/evaluations';
import { useAuth } from '../../context/AuthContext';
import TranscriptPanel from '../../components/interview/TranscriptPanel';
import ScoreRadarChart from '../../components/charts/ScoreRadarChart';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatScore, getRecommendationLabel } from '../../lib/formatters';

export default function InterviewDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const interviewId = Number(id);
  const [hrNotes, setHrNotes] = useState('');

  const { data: interview, isLoading } = useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewsAPI.get(interviewId),
    enabled: !!id,
  });

  const isCompleted = interview?.status === 'completed';

  const { data: evaluation, isLoading: evalLoading } = useQuery({
    queryKey: ['evaluation-by-interview', interviewId],
    queryFn: () => evaluationsAPI.getByInterview(interviewId).catch(() => null),
    enabled: !!id && isCompleted,
    refetchInterval: (query) => (!query.state.data && isCompleted ? 5000 : false),
  });

  const decisionMutation = useMutation({
    mutationFn: (decision: string) =>
      evaluationsAPI.updateDecision(evaluation!.id, { hr_decision: decision, hr_notes: hrNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-by-interview', interviewId] });
      toast.success('Decision updated');
    },
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

      {/* Evaluation Section — only for completed interviews */}
      {isCompleted && (
        <>
          {!evaluation && (evalLoading || isCompleted) && (
            <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-6 flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-gray-400">AI evaluation in progress...</span>
            </div>
          )}

          {evaluation && (() => {
            const scores = {
              communication: evaluation.communication_score,
              technical: evaluation.technical_score,
              confidence: evaluation.confidence_score,
              domain_knowledge: evaluation.domain_knowledge_score,
              problem_solving: evaluation.problem_solving_score,
            };

            return (
              <div className="space-y-6">
                {/* Evaluation Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">AI Evaluation</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-indigo-400">{formatScore(evaluation.overall_score)}/10</span>
                    <Badge status={evaluation.ai_recommendation} label={getRecommendationLabel(evaluation.ai_recommendation)} />
                  </div>
                </div>

                {/* Scores Grid: Radar + Bars */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Score Breakdown" hover={false}>
                    <ScoreRadarChart scores={scores} />
                  </Card>

                  <Card title="Scores" hover={false}>
                    <div className="space-y-3">
                      {Object.entries(scores).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(value / 10) * 100}%` }} />
                            </div>
                            <span className="text-sm font-medium text-white w-8 text-right">{formatScore(value)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Overall</span>
                        <span className="text-lg font-bold text-indigo-400">{formatScore(evaluation.overall_score)}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Strengths */}
                {evaluation.strengths?.items && (
                  <Card title="Strengths" hover={false}>
                    <ul className="space-y-1">
                      {evaluation.strengths.items.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">+</span> {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Areas for Improvement */}
                {evaluation.weaknesses?.items && (
                  <Card title="Areas for Improvement" hover={false}>
                    <ul className="space-y-1">
                      {evaluation.weaknesses.items.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">-</span> {w}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Detailed Feedback */}
                {evaluation.detailed_feedback && (
                  <Card title="Detailed Feedback" hover={false}>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{evaluation.detailed_feedback}</p>
                  </Card>
                )}

                {/* HR Decision — hidden for candidates */}
                {!isCandidate && evaluation.hr_decision === 'pending' && (
                  <Card title="HR Decision" hover={false}>
                    <div className="space-y-4">
                      <textarea
                        value={hrNotes}
                        onChange={(e) => setHrNotes(e.target.value)}
                        placeholder="Add notes (optional)..."
                        rows={3}
                        className="block w-full rounded-lg border border-white/[0.1] bg-white/[0.05] text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                      <div className="flex gap-3">
                        <Button onClick={() => decisionMutation.mutate('approved')} isLoading={decisionMutation.isPending}>Approve</Button>
                        <Button variant="outline" onClick={() => decisionMutation.mutate('on_hold')} isLoading={decisionMutation.isPending}>On Hold</Button>
                        <Button variant="danger" onClick={() => decisionMutation.mutate('rejected')} isLoading={decisionMutation.isPending}>Reject</Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Show decision badge if already decided */}
                {!isCandidate && evaluation.hr_decision !== 'pending' && (
                  <div className="bg-white/[0.05] rounded-xl border border-white/[0.08] p-6 flex items-center gap-3">
                    <span className="text-sm text-gray-400">HR Decision:</span>
                    <Badge status={evaluation.hr_decision} />
                    {evaluation.hr_notes && (
                      <span className="text-sm text-gray-300 ml-2">— {evaluation.hr_notes}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
