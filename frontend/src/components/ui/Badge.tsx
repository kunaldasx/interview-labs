import { cn } from '../../lib/utils';
import { getStatusColor } from '../../lib/formatters';

interface BadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const dotColors: Record<string, string> = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  pending: 'bg-orange-500',
  scheduled: 'bg-purple-500',
  cancelled: 'bg-red-500',
  rejected: 'bg-red-500',
  hired: 'bg-emerald-500',
  shortlisted: 'bg-teal-500',
};

export default function Badge({ status, label, size = 'sm', className }: BadgeProps) {
  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const dotColor = dotColors[status] || 'bg-gray-400';

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        getStatusColor(status),
        sizes[size],
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      {displayLabel}
    </span>
  );
}
