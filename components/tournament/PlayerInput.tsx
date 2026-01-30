'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { labels } from '@/lib/labels';

interface PlayerInputProps {
  onAdd: (name: string) => void;
  existingNames: string[];
}

export function PlayerInput({ onAdd, existingNames }: PlayerInputProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name erforderlich');
      return;
    }

    if (existingNames.some(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError(labels.duplicatePlayerError);
      return;
    }

    onAdd(trimmedName);
    setName('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder={labels.playerNamePlaceholder}
          error={error || undefined}
        />
      </div>
      <Button type="submit" disabled={!name.trim()}>
        {labels.addPlayer}
      </Button>
    </form>
  );
}
