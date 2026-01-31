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
            className="block text-sm font-medium text-txt-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-200 touch-target',
            'bg-dark-surface/50 backdrop-blur-sm',
            'text-txt placeholder-txt-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
            error
              ? 'border-danger/50 focus:ring-danger/30 focus:border-danger'
              : 'border-dark-border focus:ring-accent/30 focus:border-accent/50',
            'hover:border-dark-border/80',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-danger" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-txt-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Number input with mobile keyboard support - premium score input styling
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
        className={cn(
          'text-center text-2xl font-display tracking-wider',
          'bg-dark-card/80 border-dark-border',
          'focus:bg-dark-surface focus:border-accent/50 focus:shadow-glow-sm',
          className
        )}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { Input, NumberInput };
