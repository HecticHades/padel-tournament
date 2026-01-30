'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = 'text', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full px-3 py-2 rounded-lg border transition-colors touch-target',
            'bg-white dark:bg-slate-800',
            'text-slate-900 dark:text-slate-100',
            'placeholder-slate-400 dark:placeholder-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Number input with mobile keyboard support
export interface NumberInputProps extends Omit<InputProps, 'type'> {
  min?: number;
  max?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, min, max, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        max={max}
        className={cn('text-center text-lg font-semibold', className)}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { Input, NumberInput };
