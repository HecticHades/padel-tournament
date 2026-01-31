'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface FewerMatchesNotificationProps {
  players: { name: string; matchesPlayed: number; maxMatches: number; difference: number }[];
}

export function FewerMatchesNotification({ players }: FewerMatchesNotificationProps) {
  if (players.length === 0) return null;

  const maxMatches = players[0]?.maxMatches || 0;

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent>
        <div className="flex items-start gap-3">
          {/* Warning Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-warning mb-1">
              Spieler mit weniger Spielen
            </p>
            <p className="text-xs text-txt-secondary mb-3 leading-relaxed">
              Diese Spieler haben weniger Spiele als andere ({maxMatches} Spiele).
              Ihre Punkte werden am Turnierende auf {maxMatches} Spiele hochgerechnet.
            </p>

            {/* Player Badges */}
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <Badge
                  key={player.name}
                  variant="warning"
                >
                  <span className="font-semibold">{player.name}</span>
                  <span className="ml-1.5 opacity-75">
                    {player.matchesPlayed}/{maxMatches}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
