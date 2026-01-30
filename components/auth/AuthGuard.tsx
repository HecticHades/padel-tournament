'use client';

import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTournament } from '@/hooks/useTournament';
import { labels } from '@/lib/labels';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowReadOnly?: boolean;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  allowReadOnly = false,
  fallback,
}: AuthGuardProps) {
  const { isAuthenticated, isReadOnly } = useAuth();
  const { isLoading, isInitialized } = useTournament();

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-slate-500 dark:text-slate-400">{labels.loading}</div>
      </div>
    );
  }

  // Check auth requirements
  if (requireAuth) {
    if (!isAuthenticated) {
      return fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-slate-500 dark:text-slate-400">
            Bitte melde dich an, um fortzufahren.
          </div>
        </div>
      );
    }

    // If read-only is not allowed and user is read-only
    if (!allowReadOnly && isReadOnly) {
      return fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-slate-500 dark:text-slate-400">
            Diese Seite erfordert Schreibzugriff.
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Component that shows content only when user has write access
interface WriteAccessOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WriteAccessOnly({ children, fallback }: WriteAccessOnlyProps) {
  const { isAuthenticated, isReadOnly } = useAuth();

  if (!isAuthenticated || isReadOnly) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// Component that shows different content based on auth state
interface AuthSwitchProps {
  authenticated: ReactNode;
  unauthenticated: ReactNode;
}

export function AuthSwitch({ authenticated, unauthenticated }: AuthSwitchProps) {
  const { isAuthenticated } = useAuth();
  const { isLoading, isInitialized } = useTournament();

  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-slate-500 dark:text-slate-400">{labels.loading}</div>
      </div>
    );
  }

  return <>{isAuthenticated ? authenticated : unauthenticated}</>;
}
