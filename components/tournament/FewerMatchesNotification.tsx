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
    <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <WarningIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
              Spieler mit weniger Spielen
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
              Diese Spieler haben weniger Spiele als andere ({maxMatches} Spiele).
              Ihre Punkte werden am Turnierende auf {maxMatches} Spiele hochgerechnet.
            </p>
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <Badge
                  key={player.name}
                  variant="warning"
                  className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                >
                  <span className="font-semibold">{player.name}</span>
                  <span className="ml-1 opacity-75">
                    ({player.matchesPlayed}/{maxMatches})
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

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}
