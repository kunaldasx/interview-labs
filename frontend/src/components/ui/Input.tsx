import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-all duration-200',
            'bg-white/[0.05] placeholder-gray-500',
            'hover:border-white/[0.2]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            error ? 'border-red-300 text-red-900' : 'border-white/[0.1] text-gray-100',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
