import type { TranscriptEntry } from '../../types/interview';
import { formatDateTime } from '../../lib/formatters';

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[];
}

export default function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Transcript</h3>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto space-y-3">
        {transcripts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No transcript available</p>
        ) : (
          transcripts.map((entry) => (
            <div key={entry.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                entry.speaker === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
              }`}>
                <span className="text-xs font-medium">
                  {entry.speaker === 'ai' ? 'AI' : 'C'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 capitalize">{entry.speaker}</span>
                  <span className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{entry.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
