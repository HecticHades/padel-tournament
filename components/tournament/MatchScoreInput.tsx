'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Match, Player } from '@/lib/types';
import { labels } from '@/lib/labels';

interface MatchScoreInputProps {
  match: Match;
  players: Player[];
  pointsPerMatch: number;
  onSubmit: (score1: number, score2: number) => void;
  disabled?: boolean;
}

export function MatchScoreInput({
  match,
  players,
  pointsPerMatch,
  onSubmit,
  disabled = false,
}: MatchScoreInputProps) {
  const [score1, setScore1] = useState<number | ''>(match.score1 ?? '');
  const [score2, setScore2] = useState<number | ''>(match.score2 ?? '');
  const [error, setError] = useState<string | null>(null);

  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Unbekannt';
  };

  // Auto-calculate score2 when score1 changes
  useEffect(() => {
    if (typeof score1 === 'number' && score1 >= 0 && score1 <= pointsPerMatch) {
      setScore2(pointsPerMatch - score1);
    }
  }, [score1, pointsPerMatch]);

  const handleScore1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setScore1('');
      setScore2('');
    } else {
      const num = parseInt(value);
      if (!isNaN(num) && num >= 0 && num <= pointsPerMatch) {
        setScore1(num);
      }
    }
    setError(null);
  };

  const handleSubmit = () => {
    if (typeof score1 !== 'number' || typeof score2 !== 'number') {
      setError('Bitte Punktzahl eingeben');
      return;
    }

    if (score1 + score2 !== pointsPerMatch) {
      setError(labels.scoreError.replace('{total}', pointsPerMatch.toString()));
      return;
    }

    onSubmit(score1, score2);
  };

  const isComplete = match.completed;

  return (
    <Card className={isComplete ? 'opacity-75' : ''}>
      <CardContent>
        {/* Court badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="default">
            {labels.court} {match.court}
          </Badge>
          {isComplete && (
            <Badge variant="success">{labels.matchComplete}</Badge>
          )}
        </div>

        {/* Teams and scores */}
        <div className="space-y-4">
          {/* Team 1 */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {labels.team} 1
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {getPlayerName(match.team1[0])}
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {getPlayerName(match.team1[1])}
              </div>
            </div>
            <div className="w-24">
              <NumberInput
                value={score1}
                onChange={handleScore1Change}
                min={0}
                max={pointsPerMatch}
                disabled={disabled || isComplete}
                aria-label={`Punkte ${labels.team} 1`}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm">
            {labels.vs}
          </div>

          {/* Team 2 */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {labels.team} 2
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {getPlayerName(match.team2[0])}
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {getPlayerName(match.team2[1])}
              </div>
            </div>
            <div className="w-24">
              <NumberInput
                value={score2}
                onChange={() => {}} // Read-only, auto-calculated
                min={0}
                max={pointsPerMatch}
                disabled={true}
                aria-label={`Punkte ${labels.team} 2`}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit button */}
        {!isComplete && !disabled && (
          <Button
            className="mt-4"
            fullWidth
            onClick={handleSubmit}
            disabled={typeof score1 !== 'number'}
          >
            {labels.submit}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
