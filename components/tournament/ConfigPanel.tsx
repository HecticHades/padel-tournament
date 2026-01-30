'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { labels } from '@/lib/labels';
import type { TournamentSettings } from '@/lib/types';
import { estimateSchedule } from '@/lib/scheduler';

interface ConfigPanelProps {
  settings: TournamentSettings;
  numPlayers: number;
  onUpdate: (settings: Partial<TournamentSettings>) => void;
  disabled?: boolean;
}

export function ConfigPanel({
  settings,
  numPlayers,
  onUpdate,
  disabled = false,
}: ConfigPanelProps) {
  const { rounds, matchesPerPlayer } = estimateSchedule(numPlayers, settings.courts);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.setup}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points per match */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {labels.pointsPerMatch}
          </label>
          <div className="flex gap-2">
            {([16, 24, 32] as const).map((points) => (
              <button
                key={points}
                onClick={() => onUpdate({ pointsPerMatch: points })}
                disabled={disabled}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors font-medium ${
                  settings.pointsPerMatch === points
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {points}
              </button>
            ))}
          </div>
        </div>

        {/* Courts */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {labels.courts}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((courtNum) => (
              <button
                key={courtNum}
                onClick={() => onUpdate({ courts: courtNum })}
                disabled={disabled}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors font-medium ${
                  settings.courts === courtNum
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {courtNum}
              </button>
            ))}
          </div>
        </div>

        {/* Estimate */}
        {numPlayers >= 4 && (
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {rounds} {labels.rounds}
              </span>
              {' '}&bull;{' '}
              ca. {matchesPerPlayer} Spiele pro Spieler
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
