'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTournamentContext } from '@/context/TournamentContext';
import { checkLockout } from '@/lib/auth';

export function useAuth() {
  const { state, login, loginReadOnly, logout } = useTournamentContext();
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check and update lockout status
  useEffect(() => {
    const { isLocked, remainingSeconds } = checkLockout(state.auth);

    if (isLocked) {
      setLockoutSeconds(remainingSeconds);

      const interval = setInterval(() => {
        const { isLocked: stillLocked, remainingSeconds: remaining } = checkLockout(state.auth);
        if (stillLocked) {
          setLockoutSeconds(remaining);
        } else {
          setLockoutSeconds(0);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setLockoutSeconds(0);
    }
  }, [state.auth]);

  const attemptLogin = useCallback(
    (pin: string): boolean => {
      if (lockoutSeconds > 0) return false;
      return login(pin);
    },
    [login, lockoutSeconds]
  );

  return {
    isAuthenticated: state.auth.isAuthenticated,
    isReadOnly: state.auth.isReadOnly,
    failedAttempts: state.auth.failedAttempts,
    isLockedOut: lockoutSeconds > 0,
    lockoutSeconds,
    login: attemptLogin,
    loginReadOnly,
    logout,
  };
}
