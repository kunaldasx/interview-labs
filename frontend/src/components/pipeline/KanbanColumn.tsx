import { useDroppable } from '@dnd-kit/core';
import type { Candidate } from '../../types/candidate';
import KanbanCard from './KanbanCard';

const STATUS_COLORS: Record<string, { dot: string; border: string }> = {
  registered:          { dot: 'bg-gray-400',    border: 'border-gray-500/20' },
  screened:            { dot: 'bg-blue-400',    border: 'border-blue-500/20' },
  shortlisted:         { dot: 'bg-indigo-400',  border: 'border-indigo-500/20' },
  interview_scheduled: { dot: 'bg-yellow-400',  border: 'border-yellow-500/20' },
  interviewed:         { dot: 'bg-purple-400',  border: 'border-purple-500/20' },
  evaluated:           { dot: 'bg-orange-400',  border: 'border-orange-500/20' },
  offered:             { dot: 'bg-green-400',   border: 'border-green-500/20' },
  hired:               { dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
  rejected:            { dot: 'bg-red-400',     border: 'border-red-500/20' },
};

const STATUS_LABELS: Record<string, string> = {
  registered: 'Registered',
  screened: 'Screened',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  interviewed: 'Interviewed',
  evaluated: 'Evaluated',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
};

interface KanbanColumnProps {
  status: string;
  candidates: Candidate[];
  jobMap: Record<number, string>;
  activeId: number | null;
}

export default function KanbanColumn({ status, candidates, jobMap, activeId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const colors = STATUS_COLORS[status] || STATUS_COLORS.registered;

  return (
    <div
      ref={setNodeRef}
      className={`
        min-w-[280px] w-[280px] flex flex-col rounded-xl border transition-colors duration-200
        bg-white/[0.02]
        ${isOver ? 'border-primary-500/40 bg-primary-500/[0.05]' : colors.border}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
        <span className="text-sm font-medium text-gray-200 truncate">
          {STATUS_LABELS[status] || status}
        </span>
        <span className="ml-auto text-xs text-gray-500 bg-white/[0.06] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {candidates.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] kanban-scroll">
        {candidates.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-8">No candidates</p>
        ) : (
          candidates.map((c) => (
            <KanbanCard
              key={c.id}
              candidate={c}
              jobMap={jobMap}
              isBeingDragged={activeId === c.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
