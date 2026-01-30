'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrashIcon } from '@/components/ui/Icons';
import type { Player } from '@/lib/types';

interface PlayerListProps {
  players: Player[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function PlayerList({ players, onRemove, disabled = false }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        Noch keine Spieler hinzugefügt
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <Card key={player.id} padding="sm" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <span className="text-slate-900 dark:text-slate-100">{player.name}</span>
          </div>
          {!disabled ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(player.id)}
              aria-label={`${player.name} entfernen`}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
