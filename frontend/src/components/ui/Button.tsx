import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] focus:ring-primary-500 shadow-md',
      secondary: 'bg-white/[0.1] text-gray-200 hover:bg-white/[0.15] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] focus:ring-gray-500',
      outline: 'border border-white/[0.15] text-gray-300 hover:bg-white/[0.05] hover:border-white/[0.25] focus:ring-primary-500',
      ghost: 'text-gray-300 hover:bg-white/[0.08] focus:ring-primary-500',
      danger: 'bg-gradient-to-r from-red-600 to-rose-500 text-white hover:from-red-700 hover:to-rose-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] focus:ring-red-500 shadow-md',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
