import { Link } from 'react-router-dom';
import type { Job } from '../../types/job';

interface PipelineToolbarProps {
  jobs: Job[];
  selectedJobId: number | null;
  onJobChange: (jobId: number | null) => void;
  totalCount: number;
}

export default function PipelineToolbar({ jobs, selectedJobId, onJobChange, totalCount }: PipelineToolbarProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Candidate Pipeline</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Drag candidates between stages &middot; {totalCount} total
        </p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedJobId ?? ''}
          onChange={(e) => onJobChange(e.target.value ? Number(e.target.value) : null)}
          className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40
                     appearance-none cursor-pointer min-w-[180px]"
        >
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <Link
          to="/candidates"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300
                     bg-white/[0.05] border border-white/[0.1] rounded-lg
                     hover:bg-white/[0.1] hover:text-white transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
          List View
        </Link>
      </div>
    </div>
  );
}
