import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export default function Spinner({ size = 'md', label, className }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <svg
        className={cn('animate-spin', sizes[size])}
        viewBox="0 0 24 24"
        fill="none"
      >
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#4f46e5" strokeWidth="4" />
        <path stroke="url(#spinner-gradient)" strokeWidth="4" strokeLinecap="round" d="M4 12a8 8 0 018-8" />
      </svg>
      {label && <span className="text-sm text-gray-500 font-medium">{label}</span>}
    </div>
  );
}
