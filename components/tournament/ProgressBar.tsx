'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  variant?: 'default' | 'accent';
}

export function ProgressBar({ current, total, label, variant = 'accent' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current === total && total > 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-txt-secondary font-medium">
            {label}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-display tracking-wide',
              isComplete ? 'text-accent' : 'text-txt'
            )}>
              {current} / {total}
            </span>
            {isComplete && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>
        </div>
      )}
      <div className="h-2.5 bg-dark-surface rounded-full overflow-hidden border border-dark-border/50">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variant === 'accent' && 'progress-fill',
            isComplete && 'shadow-glow-sm'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
