'use client';

import { useState } from 'react';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { labels } from '@/lib/labels';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string, tournamentName: string) => void;
}

export function PinSetupModal({ isOpen, onClose, onSubmit }: PinSetupModalProps) {
  const [tournamentName, setTournamentName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validatePin = (value: string): boolean => {
    return /^\d{4,6}$/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tournamentName.trim()) {
      setError('Turniername erforderlich');
      return;
    }

    if (!validatePin(pin)) {
      setError(labels.pinInvalid);
      return;
    }

    if (pin !== confirmPin) {
      setError(labels.pinMismatch);
      return;
    }

    onSubmit(pin, tournamentName.trim());

    // Reset form
    setTournamentName('');
    setPin('');
    setConfirmPin('');
    setError(null);
  };

  const handleClose = () => {
    setTournamentName('');
    setPin('');
    setConfirmPin('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={labels.createTournament}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label={labels.tournamentName}
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder={labels.tournamentNamePlaceholder}
            autoFocus
          />

          <Input
            label={labels.setPin}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder={labels.pinPlaceholder}
          />

          <Input
            label={labels.confirmPin}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder={labels.pinPlaceholder}
            error={error || undefined}
          />
        </div>

        <ModalActions>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {labels.cancel}
          </Button>
          <Button type="submit">
            {labels.createTournament}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
