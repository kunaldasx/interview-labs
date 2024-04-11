import Modal from '../ui/Modal';
import Button from '../ui/Button';

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

interface StatusChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  candidateName: string;
  fromStatus: string;
  toStatus: string;
  isLoading?: boolean;
}

export default function StatusChangeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
  fromStatus,
  toStatus,
  isLoading,
}: StatusChangeConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Status Change">
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          Are you sure you want to move <span className="font-semibold text-white">{candidateName}</span> from{' '}
          <span className="font-medium text-yellow-400">{STATUS_LABELS[fromStatus] || fromStatus}</span> to{' '}
          <span className="font-medium text-red-400">{STATUS_LABELS[toStatus] || toStatus}</span>?
        </p>

        {toStatus === 'rejected' && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-xs text-red-300">
              This will reject the candidate. They will be moved to the Rejected column and removed from the active pipeline.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={toStatus === 'rejected' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
