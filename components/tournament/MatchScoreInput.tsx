'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Match, Player } from '@/lib/types';
import { labels } from '@/lib/labels';
import { cn } from '@/lib/utils';

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
  const [isEditing, setIsEditing] = useState(false);

  // O(1) player lookup instead of O(n) find
  const playerMap = useMemo(
    () => new Map(players.map(p => [p.id, p.name])),
    [players]
  );

  const getPlayerName = useCallback(
    (id: string) => playerMap.get(id) || 'Unbekannt',
    [playerMap]
  );

  // Sync scores when match data changes (e.g., from external update)
  useEffect(() => {
    if (!isEditing) {
      setScore1(match.score1 ?? '');
      setScore2(match.score2 ?? '');
    }
  }, [match.score1, match.score2, isEditing]);

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
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setScore1(match.score1 ?? '');
    setScore2(match.score2 ?? '');
    setIsEditing(false);
    setError(null);
  };

  const isComplete = match.completed;
  const canEdit = isComplete && !disabled && !isEditing;
  const isInputDisabled = disabled || (isComplete && !isEditing);

  // Determine winner for styling
  const team1Wins = typeof score1 === 'number' && typeof score2 === 'number' && score1 > score2;
  const team2Wins = typeof score1 === 'number' && typeof score2 === 'number' && score2 > score1;

  return (
    <Card className={cn(isComplete && !isEditing && 'opacity-80')} glow={!isComplete}>
      <CardContent>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <Badge variant="primary">
            {labels.court} {match.court}
          </Badge>
          {isComplete && (
            <Badge variant="success">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
              {labels.matchComplete}
            </Badge>
          )}
        </div>

        {/* Match Display */}
        <div className="space-y-3">
          {/* Team 1 */}
          <div className={cn(
            'flex items-center gap-4 p-3 rounded-xl transition-all',
            team1Wins && isComplete ? 'bg-accent/10 border border-accent/20' : 'bg-dark-surface/50 border border-dark-border/30'
          )}>
            <div className="flex-1">
              <div className="text-xs text-txt-muted uppercase tracking-wider mb-1">
                {labels.team} 1
              </div>
              <div className={cn(
                'font-medium',
                team1Wins && isComplete ? 'text-accent' : 'text-txt'
              )}>
                {getPlayerName(match.team1[0])}
              </div>
              <div className={cn(
                'font-medium',
                team1Wins && isComplete ? 'text-accent' : 'text-txt'
              )}>
                {getPlayerName(match.team1[1])}
              </div>
            </div>
            <div className="w-20">
              <NumberInput
                value={score1}
                onChange={handleScore1Change}
                min={0}
                max={pointsPerMatch}
                disabled={isInputDisabled}
                aria-label={`Punkte ${labels.team} 1`}
                className={cn(
                  team1Wins && isComplete && 'border-accent/50 bg-accent/10'
                )}
              />
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center py-1">
            <div className="flex-1 h-px bg-dark-border/30" />
            <span className="px-4 text-sm font-display text-txt-muted tracking-widest">
              {labels.vs}
            </span>
            <div className="flex-1 h-px bg-dark-border/30" />
          </div>

          {/* Team 2 */}
          <div className={cn(
            'flex items-center gap-4 p-3 rounded-xl transition-all',
            team2Wins && isComplete ? 'bg-accent/10 border border-accent/20' : 'bg-dark-surface/50 border border-dark-border/30'
          )}>
            <div className="flex-1">
              <div className="text-xs text-txt-muted uppercase tracking-wider mb-1">
                {labels.team} 2
              </div>
              <div className={cn(
                'font-medium',
                team2Wins && isComplete ? 'text-accent' : 'text-txt'
              )}>
                {getPlayerName(match.team2[0])}
              </div>
              <div className={cn(
                'font-medium',
                team2Wins && isComplete ? 'text-accent' : 'text-txt'
              )}>
                {getPlayerName(match.team2[1])}
              </div>
            </div>
            <div className="w-20">
              <NumberInput
                value={score2}
                readOnly
                min={0}
                max={pointsPerMatch}
                aria-label={`Punkte ${labels.team} 2 (automatisch berechnet)`}
                className={cn(
                  'cursor-not-allowed',
                  team2Wins && isComplete && 'border-accent/50 bg-accent/10'
                )}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 text-sm text-danger flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
            {error}
          </div>
        )}

        {/* Buttons */}
        {!disabled && (
          <div className="mt-5 space-y-2">
            {/* New match or editing */}
            {(!isComplete || isEditing) && (
              <div className="flex gap-2">
                {isEditing && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleCancelEdit}
                  >
                    Abbrechen
                  </Button>
                )}
                <Button
                  fullWidth
                  onClick={handleSubmit}
                  disabled={typeof score1 !== 'number'}
                  className={typeof score1 === 'number' ? 'shadow-glow-sm' : ''}
                >
                  {isEditing ? 'Änderung speichern' : labels.submit}
                </Button>
              </div>
            )}

            {/* Edit button for completed matches */}
            {canEdit && (
              <Button
                variant="ghost"
                fullWidth
                onClick={handleEdit}
              >
                Ergebnis bearbeiten
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
