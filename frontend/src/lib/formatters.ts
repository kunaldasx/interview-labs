export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    registered: 'bg-gray-500/15 text-gray-400',
    screened: 'bg-blue-500/15 text-blue-400',
    shortlisted: 'bg-indigo-500/15 text-indigo-400',
    interview_scheduled: 'bg-yellow-500/15 text-yellow-400',
    interviewed: 'bg-purple-500/15 text-purple-400',
    evaluated: 'bg-orange-500/15 text-orange-400',
    offered: 'bg-green-500/15 text-green-400',
    hired: 'bg-emerald-500/15 text-emerald-400',
    rejected: 'bg-red-500/15 text-red-400',
    scheduled: 'bg-yellow-500/15 text-yellow-400',
    in_progress: 'bg-blue-500/15 text-blue-400',
    completed: 'bg-green-500/15 text-green-400',
    cancelled: 'bg-red-500/15 text-red-400',
    draft: 'bg-gray-500/15 text-gray-400',
    active: 'bg-green-500/15 text-green-400',
    paused: 'bg-yellow-500/15 text-yellow-400',
    closed: 'bg-red-500/15 text-red-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    approved: 'bg-green-500/15 text-green-400',
    on_hold: 'bg-orange-500/15 text-orange-400',
    pending_approval: 'bg-amber-500/15 text-amber-400',
    sent: 'bg-cyan-500/15 text-cyan-400',
    strongly_hire: 'bg-emerald-500/15 text-emerald-400',
    hire: 'bg-green-500/15 text-green-400',
    maybe: 'bg-yellow-500/15 text-yellow-400',
    no_hire: 'bg-red-500/15 text-red-400',
  };
  return colors[status] || 'bg-gray-500/15 text-gray-400';
}

export function getRecommendationLabel(rec: string): string {
  const labels: Record<string, string> = {
    strongly_hire: 'Strongly Hire',
    hire: 'Hire',
    maybe: 'Maybe',
    no_hire: 'No Hire',
  };
  return labels[rec] || rec;
}
