'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { DownloadIcon } from '@/components/ui/Icons';
import type { Standing, AdjustedStanding, TournamentData } from '@/lib/types';
import { labels } from '@/lib/labels';
import { downloadCsv, downloadJson } from '@/lib/utils';
import { generateLeaderboardCsv } from '@/lib/fairness';

interface ExportButtonsProps {
  standings: Standing[] | AdjustedStanding[];
  showAdjusted: boolean;
  tournament: TournamentData | null;
  maxMatches: number;
}

export function ExportButtons({
  standings,
  showAdjusted,
  tournament,
  maxMatches,
}: ExportButtonsProps) {
  const handleExportCsv = useCallback(() => {
    if (!tournament) return;

    const { headers, rows } = generateLeaderboardCsv(standings, showAdjusted, maxMatches);
    const filename = `${tournament.name.replace(/[^a-zA-Z0-9]/g, '_')}_rangliste.csv`;
    downloadCsv(headers, rows, filename);
  }, [tournament, standings, showAdjusted, maxMatches]);

  const handleExportJson = useCallback(() => {
    if (!tournament) return;

    const filename = `${tournament.name.replace(/[^a-zA-Z0-9]/g, '_')}_turnier.json`;
    downloadJson(tournament, filename);
  }, [tournament]);

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={handleExportCsv}>
        <DownloadIcon className="w-4 h-4 mr-1" />
        {labels.exportCsv}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleExportJson}>
        {labels.exportJson}
      </Button>
    </div>
  );
}
