'use client';

import { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, ByeBadge, StatusBadge } from '@/components/ui/Badge';
import type { Match, Player } from '@/lib/types';
import { labels } from '@/lib/labels';

interface RoundCardProps {
  round: number;
  matches: Match[];
  byePlayers: string[];
  players: Player[];
  isCurrentRound?: boolean;
  onMatchClick?: (matchId: string) => void;
}

export function RoundCard({
  round,
  matches,
  byePlayers,
  players,
  isCurrentRound = false,
  onMatchClick,
}: RoundCardProps) {
  // O(1) player lookup instead of O(n) find
  const playerMap = useMemo(
    () => new Map(players.map(p => [p.id, p.name])),
    [players]
  );

  const getPlayerName = useCallback(
    (id: string) => playerMap.get(id) || 'Unbekannt',
    [playerMap]
  );

  const byePlayerNames = useMemo(
    () => byePlayers.map(id => playerMap.get(id) || 'Unbekannt'),
    [byePlayers, playerMap]
  );

  return (
    <Card className={isCurrentRound ? 'ring-2 ring-primary-500' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {labels.round} {round}
          </CardTitle>
          {isCurrentRound && (
            <Badge variant="primary" size="sm">
              Aktuell
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Matches */}
        {matches.map((match) => (
          <div
            key={match.id}
            className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 ${
              onMatchClick
                ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:ring-2 hover:ring-primary-300 dark:hover:ring-primary-600 transition-all'
                : ''
            }`}
            onClick={() => onMatchClick?.(match.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {labels.court} {match.court}
              </span>
              <div className="flex items-center gap-2">
                {onMatchClick && (
                  <span className="text-xs text-primary-500 dark:text-primary-400">
                    ✎
                  </span>
                )}
                <StatusBadge completed={match.completed} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {getPlayerName(match.team1[0])} & {getPlayerName(match.team1[1])}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {labels.vs}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {getPlayerName(match.team2[0])} & {getPlayerName(match.team2[1])}
                </div>
              </div>
              {match.completed && match.score1 !== null && match.score2 !== null && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {match.score1}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">-</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {match.score2}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Bye players */}
        {byePlayerNames.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <ByeBadge />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {byePlayerNames.join(', ')}
              </span>
            </div>
          </div>
        )}

        {matches.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            {labels.noMatches}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
