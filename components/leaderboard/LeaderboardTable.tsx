'use client';

import { MedalBadge, Badge } from '@/components/ui/Badge';
import type { Standing, AdjustedStanding } from '@/lib/types';
import { labels } from '@/lib/labels';
import { formatDecimal } from '@/lib/utils';
import { hasFewerMatches } from '@/lib/fairness';

interface LeaderboardTableProps {
  standings: Standing[] | AdjustedStanding[];
  showAdjusted: boolean;
}

export function LeaderboardTable({ standings, showAdjusted }: LeaderboardTableProps) {
  const isAdjusted = (s: Standing | AdjustedStanding): s is AdjustedStanding => {
    return 'adjustedPoints' in s;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {labels.rank}
            </th>
            <th className="text-left py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {labels.player}
            </th>
            <th className="text-right py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {showAdjusted ? labels.adjustedPoints : labels.points}
            </th>
            <th className="text-right py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {labels.matches}
            </th>
            <th className="text-right py-3 px-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {labels.average}
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => {
            const rank = index + 1;
            const showMedal = rank <= 3 && standing.matchesPlayed > 0;
            const fewerMatches = hasFewerMatches(standing, standings);

            return (
              <tr
                key={standing.playerId}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {showMedal ? (
                      <MedalBadge rank={rank as 1 | 2 | 3} />
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {rank}.
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {standing.playerName}
                    </span>
                    {fewerMatches && (
                      <Badge variant="warning" size="sm">
                        {labels.fewerMatches}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                  {showAdjusted && isAdjusted(standing)
                    ? formatDecimal(standing.adjustedPoints, 1)
                    : standing.points}
                </td>
                <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                  {standing.matchesPlayed}
                  {standing.byes > 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                      (+{standing.byes})
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                  {formatDecimal(
                    showAdjusted && isAdjusted(standing)
                      ? standing.adjustedAverage
                      : standing.average,
                    1
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {standings.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Noch keine Ergebnisse
        </div>
      )}
    </div>
  );
}
