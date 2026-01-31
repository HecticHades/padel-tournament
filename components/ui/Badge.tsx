'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gold' | 'silver' | 'bronze' | 'accent';
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
    default: 'bg-dark-surface text-txt-secondary border-dark-border/50',
    primary: 'bg-court/30 text-court-light border-court/50',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    danger: 'bg-danger/20 text-danger border-danger/30',
    gold: 'bg-gold/20 text-gold border-gold/40',
    silver: 'bg-silver/20 text-silver border-silver/40',
    bronze: 'bg-bronze/20 text-bronze border-bronze/40',
    accent: 'bg-accent/20 text-accent border-accent/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-lg border',
        'transition-colors duration-200',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Medal badge with premium styling
interface MedalBadgeProps {
  rank: 1 | 2 | 3;
  className?: string;
}

export function MedalBadge({ rank, className }: MedalBadgeProps) {
  const medals = {
    1: {
      variant: 'gold' as const,
      label: 'Gold',
      bg: 'from-yellow-400 via-yellow-300 to-yellow-500',
      shadow: 'shadow-[0_0_12px_rgba(255,200,50,0.5)]',
    },
    2: {
      variant: 'silver' as const,
      label: 'Silber',
      bg: 'from-slate-300 via-slate-200 to-slate-400',
      shadow: 'shadow-[0_0_12px_rgba(192,192,210,0.4)]',
    },
    3: {
      variant: 'bronze' as const,
      label: 'Bronze',
      bg: 'from-orange-400 via-orange-300 to-orange-500',
      shadow: 'shadow-[0_0_12px_rgba(205,127,50,0.4)]',
    },
  };

  const { label, bg, shadow } = medals[rank];

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center',
        'w-8 h-8 rounded-full font-display text-lg',
        'bg-gradient-to-br',
        bg,
        shadow,
        'text-dark',
        'medal-shine',
        className
      )}
      aria-label={label}
    >
      {rank}
    </span>
  );
}

// Bye badge
export function ByeBadge({ className }: { className?: string }) {
  return (
    <Badge variant="warning" size="sm" className={cn('gap-1.5', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
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
      className={cn('gap-1.5', className)}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        completed ? 'bg-success' : 'bg-txt-muted'
      )} />
      {completed ? 'Fertig' : 'Ausstehend'}
    </Badge>
  );
}
