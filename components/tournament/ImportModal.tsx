'use client';

import { useState, useRef } from 'react';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { labels } from '@/lib/labels';
import { importTournament } from '@/lib/storage';
import type { TournamentData } from '@/lib/types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: TournamentData) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<TournamentData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = importTournament(content);

      if (data) {
        setPreview(data);
        setError(null);
      } else {
        setPreview(null);
        setError('Ungültige Turnierdatei');
      }
    };
    reader.onerror = () => {
      setError('Fehler beim Lesen der Datei');
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview) {
      onImport(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setError(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={labels.importJson}>
      <div className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 dark:text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-primary-50 file:text-primary-700
              dark:file:bg-primary-900 dark:file:text-primary-300
              hover:file:bg-primary-100 dark:hover:file:bg-primary-800
              file:cursor-pointer"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {preview && (
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Turnier:</strong> {preview.name}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Spieler:</strong> {preview.players.length}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Status:</strong> {labels.tournamentStatus[preview.status]}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Spiele:</strong> {preview.matches.filter(m => m.completed).length} / {preview.matches.length}
            </p>
          </div>
        )}
      </div>

      <ModalActions>
        <Button type="button" variant="secondary" onClick={handleClose}>
          {labels.cancel}
        </Button>
        <Button type="button" onClick={handleImport} disabled={!preview}>
          Importieren
        </Button>
      </ModalActions>
    </Modal>
  );
}
