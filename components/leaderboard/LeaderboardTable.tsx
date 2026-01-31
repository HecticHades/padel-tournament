'use client';

import { MedalBadge, Badge } from '@/components/ui/Badge';
import type { Standing, AdjustedStanding } from '@/lib/types';
import { labels } from '@/lib/labels';
import { formatDecimal } from '@/lib/utils';
import { hasFewerMatches } from '@/lib/fairness';

interface LeaderboardTableProps {
  standings: Standing[] | AdjustedStanding[];
  showAdjusted: boolean;
  maxMatches?: number;
  showCalculationDetails?: boolean;
  calculationType?: 'opponent-based' | 'partner-based';
}

export function LeaderboardTable({ standings, showAdjusted, maxMatches, showCalculationDetails, calculationType }: LeaderboardTableProps) {
  const isAdjusted = (s: Standing | AdjustedStanding): s is AdjustedStanding => {
    return 'adjustedPoints' in s;
  };

  const hasOpponentDetails = (s: Standing | AdjustedStanding): s is AdjustedStanding & { calculationDetails: NonNullable<AdjustedStanding['calculationDetails']> } => {
    return isAdjusted(s) && s.calculationDetails !== undefined;
  };

  const hasPartnerDetails = (s: Standing | AdjustedStanding): s is AdjustedStanding & { partnerCalculationDetails: NonNullable<AdjustedStanding['partnerCalculationDetails']> } => {
    return isAdjusted(s) && s.partnerCalculationDetails !== undefined;
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
              {showAdjusted ? `Hochgerechnet` : labels.points}
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
            const isExtrapolated = showAdjusted && isAdjusted(standing) && fewerMatches;

            return (
              <tr
                key={standing.playerId}
                className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  fewerMatches ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                }`}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {standing.playerName}
                    </span>
                    {fewerMatches && (
                      <Badge variant="warning" size="sm">
                        {standing.matchesPlayed}/{maxMatches || '?'}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  {showAdjusted && isAdjusted(standing) ? (
                    <div>
                      <span className={`font-semibold ${isExtrapolated ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-slate-100'}`}>
                        {formatDecimal(standing.adjustedPoints, 1)}
                      </span>
                      {isExtrapolated && showCalculationDetails && calculationType === 'opponent-based' && hasOpponentDetails(standing) ? (
                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div>
                            {standing.points} + ØVerlustpunkte {standing.calculationDetails.avgOpponentPointsLost}
                          </div>
                          <div className="text-[10px] leading-tight">
                            {standing.calculationDetails.opponentBreakdown
                              .map(o => `${o.name.split(' ')[0]} ${o.avgPointsLost}`)
                              .join(', ')}
                          </div>
                        </div>
                      ) : isExtrapolated && showCalculationDetails && calculationType === 'partner-based' && hasPartnerDetails(standing) ? (
                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div>
                            {standing.points} + ØGewinnpunkte {standing.partnerCalculationDetails.avgPartnerPointsWon}
                          </div>
                          <div className="text-[10px] leading-tight">
                            {standing.partnerCalculationDetails.partnerBreakdown
                              .map(p => `${p.name.split(' ')[0]} ${p.avgPointsWon}`)
                              .join(', ')}
                          </div>
                        </div>
                      ) : isExtrapolated ? (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          (tatsächlich: {standing.points})
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {standing.points}
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                  {standing.matchesPlayed}
                </td>
                <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-400">
                  {formatDecimal(standing.average, 1)}
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
