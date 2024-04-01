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
    registered: 'bg-gray-100 text-gray-800',
    screened: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-indigo-100 text-indigo-800',
    interview_scheduled: 'bg-yellow-100 text-yellow-800',
    interviewed: 'bg-purple-100 text-purple-800',
    evaluated: 'bg-orange-100 text-orange-800',
    offered: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    on_hold: 'bg-orange-100 text-orange-800',
    strongly_hire: 'bg-emerald-100 text-emerald-800',
    hire: 'bg-green-100 text-green-800',
    maybe: 'bg-yellow-100 text-yellow-800',
    no_hire: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
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
