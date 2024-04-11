import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import type { Candidate } from '../../types/candidate';

interface KanbanCardProps {
  candidate: Candidate;
  jobMap: Record<number, string>;
  isDragging?: boolean;
  isBeingDragged?: boolean;
}

export default function KanbanCard({ candidate, jobMap, isDragging, isBeingDragged }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  const style = transform && !isDragging
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const dragOverlayStyle = isDragging
    ? 'shadow-2xl shadow-primary-500/20 rotate-[2deg] scale-105'
    : '';

  return (
    <div
      ref={!isDragging ? setNodeRef : undefined}
      style={style}
      {...(!isDragging ? { ...attributes, ...listeners } : {})}
      className={`
        bg-white/[0.05] border border-white/[0.08] rounded-lg p-3 cursor-grab active:cursor-grabbing
        transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.12]
        ${dragOverlayStyle}
        ${isBeingDragged ? 'opacity-30' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          to={`/candidates/${candidate.id}`}
          className="text-sm font-medium text-white hover:text-primary-400 transition-colors truncate"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {candidate.full_name}
        </Link>
      </div>

      <p className="text-xs text-gray-400 truncate mb-2">{candidate.email}</p>

      <div className="flex items-center gap-2 flex-wrap">
        {candidate.job_id && jobMap[candidate.job_id] && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-500/15 text-primary-400 truncate max-w-[160px]">
            {jobMap[candidate.job_id]}
          </span>
        )}
        {candidate.experience_years != null && (
          <span className="text-[10px] text-gray-500">
            {candidate.experience_years}y exp
          </span>
        )}
      </div>
    </div>
  );
}
