'use client';

import { Button } from '@/components/ui/Button';
import { TrashIcon } from '@/components/ui/Icons';
import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlayerListProps {
  players: Player[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function PlayerList({ players, onRemove, disabled = false }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-10 text-txt-muted">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center">
          <svg className="w-6 h-6 text-txt-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        Noch keine Spieler hinzugefügt
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <div
          key={player.id}
          className={cn(
            'flex items-center justify-between p-3 rounded-xl',
            'bg-dark-surface/50 border border-dark-border/50',
            'transition-all duration-200 hover:bg-dark-surface/80'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-display">
              {index + 1}
            </span>
            <span className="text-txt font-medium">{player.name}</span>
          </div>
          {!disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(player.id)}
              aria-label={`${player.name} entfernen`}
              className="text-txt-muted hover:text-danger"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
