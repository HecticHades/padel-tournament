'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, disabled, children, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold',
      'rounded-xl transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
      'touch-target btn-glow'
    );

    const variants = {
      primary: cn(
        'bg-accent text-dark font-bold',
        'hover:bg-accent/90 hover:shadow-glow-sm',
        'active:scale-[0.98]'
      ),
      secondary: cn(
        'glass text-txt',
        'hover:bg-dark-surface/80',
        'active:scale-[0.98]'
      ),
      danger: cn(
        'bg-danger text-white',
        'hover:bg-danger/90',
        'active:scale-[0.98]'
      ),
      ghost: cn(
        'bg-transparent text-txt-secondary',
        'hover:bg-dark-surface/50 hover:text-txt',
        'active:scale-[0.98]'
      ),
      accent: cn(
        'bg-transparent border-2 border-accent text-accent font-bold',
        'hover:bg-accent/10 hover:shadow-glow-sm',
        'active:scale-[0.98]'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-4 text-lg tracking-wide',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
