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
    <Button variant="ghost" onClick={handleLogout} {...props}>
      {labels.logout}
    </Button>
  );
}
