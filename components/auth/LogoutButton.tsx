'use client';

import { Button, type ButtonProps } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { labels } from '@/lib/labels';

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  onLogout?: () => void;
}

export function LogoutButton({ onLogout, ...props }: LogoutButtonProps) {
  const { logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} {...props}>
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {labels.logout}
    </Button>
  );
}
