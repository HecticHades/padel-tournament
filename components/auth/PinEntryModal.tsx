'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { labels } from '@/lib/labels';
import { useAuth } from '@/hooks/useAuth';

interface PinEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PinEntryModal({ isOpen, onClose, onSuccess }: PinEntryModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isLockedOut, lockoutSeconds, failedAttempts } = useAuth();

  // Clear pin and error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
    }
  }, [isOpen]);

  // Update error message during lockout
  useEffect(() => {
    if (isLockedOut) {
      setError(labels.lockedOut.replace('{seconds}', lockoutSeconds.toString()));
    } else if (error?.includes('Gesperrt')) {
      setError(null);
    }
  }, [isLockedOut, lockoutSeconds, error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) return;

    if (!pin || pin.length < 4) {
      setError(labels.pinInvalid);
      return;
    }

    const success = login(pin);

    if (success) {
      setPin('');
      setError(null);
      onSuccess();
    } else {
      setPin('');
      if (!isLockedOut) {
        setError(`${labels.wrongPin} (${3 - failedAttempts - 1} Versuche übrig)`);
      }
    }
  };

  const handleClose = () => {
    setPin('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={labels.enterPin}>
      <form onSubmit={handleSubmit}>
        <Input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder={labels.pinPlaceholder}
          error={error || undefined}
          disabled={isLockedOut}
          autoFocus
        />

        <ModalActions>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {labels.cancel}
          </Button>
          <Button type="submit" disabled={isLockedOut || pin.length < 4}>
            {labels.login}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
