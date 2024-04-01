import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  variant?: 'default' | 'glass' | 'gradient-border';
  hover?: boolean;
}

export default function Card({ children, className, title, action, variant = 'default', hover = true }: CardProps) {
  const variants = {
    default: 'bg-white border border-gray-200/80 shadow-card',
    glass: 'glass shadow-card',
    'gradient-border': 'bg-white border border-transparent bg-clip-padding shadow-card relative before:absolute before:inset-0 before:-z-10 before:rounded-xl before:p-[1px] before:bg-gradient-to-r before:from-primary-500 before:to-purple-500',
  };

  return (
    <div
      className={cn(
        'rounded-xl',
        variants[variant],
        hover && 'hover-lift',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
