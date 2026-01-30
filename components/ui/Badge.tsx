'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gold' | 'silver' | 'bronze';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    silver: 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200',
    bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Medal badge with emoji
interface MedalBadgeProps {
  rank: 1 | 2 | 3;
  className?: string;
}

export function MedalBadge({ rank, className }: MedalBadgeProps) {
  const medals = {
    1: { emoji: '🥇', variant: 'gold' as const, label: 'Gold' },
    2: { emoji: '🥈', variant: 'silver' as const, label: 'Silber' },
    3: { emoji: '🥉', variant: 'bronze' as const, label: 'Bronze' },
  };

  const medal = medals[rank];

  return (
    <Badge variant={medal.variant} className={cn('gap-1', className)}>
      <span aria-hidden="true">{medal.emoji}</span>
      <span className="sr-only">{medal.label}</span>
    </Badge>
  );
}

// Bye badge
export function ByeBadge({ className }: { className?: string }) {
  return (
    <Badge variant="warning" size="sm" className={className}>
      Pause
    </Badge>
  );
}

// Status badge for match completion
interface StatusBadgeProps {
  completed: boolean;
  className?: string;
}

export function StatusBadge({ completed, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={completed ? 'success' : 'default'}
      size="sm"
      className={className}
    >
      {completed ? 'Abgeschlossen' : 'Ausstehend'}
    </Badge>
  );
}
