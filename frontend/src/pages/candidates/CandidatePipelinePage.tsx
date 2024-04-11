import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { candidatesAPI } from '../../api/candidates';
import { jobsAPI } from '../../api/jobs';
import type { Candidate, CandidateListResponse } from '../../types/candidate';
import type { JobListResponse } from '../../types/job';
import KanbanBoard from '../../components/pipeline/KanbanBoard';
import KanbanCard from '../../components/pipeline/KanbanCard';
import PipelineToolbar from '../../components/pipeline/PipelineToolbar';
import StatusChangeConfirmModal from '../../components/pipeline/StatusChangeConfirmModal';
import Spinner from '../../components/ui/Spinner';

const PIPELINE_STATUSES = [
  'registered', 'screened', 'shortlisted', 'interview_scheduled',
  'interviewed', 'evaluated', 'offered', 'hired', 'rejected',
];

export default function CandidatePipelinePage() {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    candidate: Candidate;
    toStatus: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Fetch all candidates
  const { data: candidateData, isLoading: candidatesLoading } = useQuery<CandidateListResponse>({
    queryKey: ['pipeline-candidates', selectedJobId],
    queryFn: () =>
      candidatesAPI.list({
        page_size: 500,
        ...(selectedJobId ? { job_id: selectedJobId } : {}),
      }),
  });

  // Fetch jobs for filter + name map
  const { data: jobData } = useQuery<JobListResponse>({
    queryKey: ['jobs'],
    queryFn: () => jobsAPI.list({ page_size: 100 }),
  });

  const jobMap = useMemo(() => {
    const map: Record<number, string> = {};
    jobData?.items?.forEach((j) => { map[j.id] = j.title; });
    return map;
  }, [jobData]);

  // Group candidates by status
  const columns = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {};
    PIPELINE_STATUSES.forEach((s) => { grouped[s] = []; });
    candidateData?.items?.forEach((c) => {
      const status = c.status || 'registered';
      if (grouped[status]) {
        grouped[status].push(c);
      } else {
        grouped.registered.push(c);
      }
    });
    return grouped;
  }, [candidateData]);

  // Status update mutation with optimistic updates
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      candidatesAPI.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline-candidates', selectedJobId] });
      const prev = queryClient.getQueryData<CandidateListResponse>(['pipeline-candidates', selectedJobId]);

      queryClient.setQueryData<CandidateListResponse>(
        ['pipeline-candidates', selectedJobId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((c) => (c.id === id ? { ...c, status } : c)),
          };
        }
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['pipeline-candidates', selectedJobId], context.prev);
      }
      toast.error('Failed to update candidate status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-candidates', selectedJobId] });
    },
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const candidate = event.active.data.current?.candidate as Candidate | undefined;
    setActiveCandidate(candidate || null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveCandidate(null);

    const { active, over } = event;
    if (!over) return;

    const candidate = active.data.current?.candidate as Candidate | undefined;
    if (!candidate) return;

    const toStatus = over.id as string;
    if (toStatus === candidate.status) return;

    // Show confirmation for rejected status
    if (toStatus === 'rejected') {
      setConfirmModal({ candidate, toStatus });
      return;
    }

    mutation.mutate({ id: candidate.id, status: toStatus });
  }, [mutation]);

  const handleConfirmStatusChange = useCallback(() => {
    if (!confirmModal) return;
    mutation.mutate(
      { id: confirmModal.candidate.id, status: confirmModal.toStatus },
      { onSettled: () => setConfirmModal(null) }
    );
  }, [confirmModal, mutation]);

  if (candidatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PipelineToolbar
        jobs={jobData?.items || []}
        selectedJobId={selectedJobId}
        onJobChange={setSelectedJobId}
        totalCount={candidateData?.total || 0}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <KanbanBoard
          columns={columns}
          jobMap={jobMap}
          activeId={activeCandidate?.id ?? null}
        />

        <DragOverlay dropAnimation={null}>
          {activeCandidate ? (
            <div className="w-[264px]">
              <KanbanCard
                candidate={activeCandidate}
                jobMap={jobMap}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <StatusChangeConfirmModal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmStatusChange}
        candidateName={confirmModal?.candidate.full_name || ''}
        fromStatus={confirmModal?.candidate.status || ''}
        toStatus={confirmModal?.toStatus || ''}
        isLoading={mutation.isPending}
      />
    </div>
  );
}
