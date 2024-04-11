import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationsAPI } from '../../api/evaluations';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ScoreRadarChart from '../../components/charts/ScoreRadarChart';
import { formatScore, formatDateTime, getRecommendationLabel } from '../../lib/formatters';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function EvaluationDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [hrNotes, setHrNotes] = useState('');

  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => evaluationsAPI.get(Number(id)),
    enabled: !!id,
  });

  const decisionMutation = useMutation({
    mutationFn: (decision: string) => evaluationsAPI.updateDecision(Number(id), { hr_decision: decision, hr_notes: hrNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      toast.success('Decision updated');
    },
  });

  if (isLoading) return <Spinner size="lg" className="py-20" />;
  if (!evaluation) return <div className="text-center py-20 text-gray-500">Evaluation not found</div>;

  const scores = {
    communication: evaluation.communication_score,
    technical: evaluation.technical_score,
    confidence: evaluation.confidence_score,
    domain_knowledge: evaluation.domain_knowledge_score,
    problem_solving: evaluation.problem_solving_score,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/interviews" className="text-sm text-indigo-400 hover:text-indigo-300">Back to Interviews</Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-bold text-white">Evaluation #{evaluation.id}</h1>
          <div className="flex gap-2">
            <Badge status={evaluation.ai_recommendation} label={getRecommendationLabel(evaluation.ai_recommendation)} />
            <Badge status={evaluation.hr_decision} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Score Breakdown">
          <ScoreRadarChart scores={scores} />
        </Card>

        <Card title="Scores">
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
              <span className="text-lg font-bold text-indigo-600">{formatScore(evaluation.overall_score)}</span>
            </div>
          </div>
        </Card>
      </div>

      {evaluation.strengths?.items && (
        <Card title="Strengths">
          <ul className="space-y-1">
            {evaluation.strengths.items.map((s: string, i: number) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">+</span> {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {evaluation.weaknesses?.items && (
        <Card title="Areas for Improvement">
          <ul className="space-y-1">
            {evaluation.weaknesses.items.map((w: string, i: number) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">-</span> {w}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {evaluation.detailed_feedback && (
        <Card title="Detailed Feedback">
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{evaluation.detailed_feedback}</p>
        </Card>
      )}

      {evaluation.hr_decision === 'pending' && (
        <Card title="HR Decision">
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
    </div>
  );
}
