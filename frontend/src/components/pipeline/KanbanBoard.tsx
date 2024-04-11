import type { Candidate } from '../../types/candidate';
import KanbanColumn from './KanbanColumn';

const PIPELINE_ORDER = [
  'registered',
  'screened',
  'shortlisted',
  'interview_scheduled',
  'interviewed',
  'evaluated',
  'offered',
  'hired',
  'rejected',
];

interface KanbanBoardProps {
  columns: Record<string, Candidate[]>;
  jobMap: Record<number, string>;
  activeId: number | null;
}

export default function KanbanBoard({ columns, jobMap, activeId }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll">
      {PIPELINE_ORDER.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          candidates={columns[status] || []}
          jobMap={jobMap}
          activeId={activeId}
        />
      ))}
    </div>
  );
}
