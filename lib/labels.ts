// Swiss German (de-CH) labels
// All UI text in one place for consistency

export const labels = {
  // App
  appTitle: 'Padel Americano Turnier',
  appDescription: 'Verwalte dein Padel Americano Turnier',

  // Navigation
  home: 'Start',
  setup: 'Einstellungen',
  schedule: 'Spielplan',
  play: 'Spiel',
  leaderboard: 'Rangliste',

  // Auth
  createTournament: 'Turnier erstellen',
  enterPin: 'PIN eingeben',
  setPin: 'PIN festlegen',
  confirmPin: 'PIN bestätigen',
  pinPlaceholder: '4-6 Ziffern',
  pinMismatch: 'PINs stimmen nicht überein',
  pinInvalid: 'PIN muss 4-6 Ziffern haben',
  wrongPin: 'Falscher PIN',
  lockedOut: 'Gesperrt für {seconds} Sekunden',
  login: 'Anmelden',
  logout: 'Abmelden',
  viewOnly: 'Nur Ansicht',

  // Landing page
  welcomeTitle: 'Willkommen zum Padel Americano',
  welcomeSubtitle: 'Das faire Turniersystem für alle',
  americanoExplanation: 'Beim Americano-System spielt jeder mit jedem als Partner. Nach jeder Runde werden die Teams neu gemischt. So spielst du mit allen Teilnehmern zusammen und lernst verschiedene Spielstile kennen.',
  continueTournament: 'Turnier fortsetzen',
  viewLeaderboard: 'Rangliste ansehen',
  resetTournament: 'Turnier zurücksetzen',
  noTournament: 'Noch kein Turnier vorhanden',
  existingTournament: 'Bestehendes Turnier gefunden',

  // Setup
  tournamentName: 'Turniername',
  tournamentNamePlaceholder: 'z.B. Sommer Turnier 2024',
  players: 'Spieler',
  addPlayer: 'Spieler hinzufügen',
  removePlayer: 'Spieler entfernen',
  playerName: 'Spielername',
  playerNamePlaceholder: 'Name eingeben',
  minPlayersError: 'Mindestens 4 Spieler erforderlich',
  duplicatePlayerError: 'Spielername bereits vergeben',

  // Config
  pointsPerMatch: 'Punkte pro Spiel',
  courts: 'Anzahl Plätze',
  court: 'Platz',
  rounds: 'Runden',
  roundsEstimate: '{rounds} Runden (ca. {matches} Spiele pro Spieler)',
  generateSchedule: 'Spielplan erstellen',
  startTournament: 'Turnier starten',

  // Schedule
  round: 'Runde',
  roundOf: 'Runde {current} von {total}',
  vs: 'vs',
  bye: 'Pause',
  byePlayers: 'Pause in dieser Runde',
  noMatches: 'Keine Spiele in dieser Runde',

  // Scoring
  currentRound: 'Aktuelle Runde',
  enterScores: 'Punkte eingeben',
  score: 'Punkte',
  team: 'Team',
  submit: 'Speichern',
  nextRound: 'Nächste Runde',
  finishTournament: 'Turnier beenden',
  matchComplete: 'Spiel abgeschlossen',
  allMatchesComplete: 'Alle Spiele abgeschlossen',
  scoreError: 'Punkte müssen zusammen {total} ergeben',

  // Leaderboard
  rank: 'Rang',
  player: 'Spieler',
  points: 'Punkte',
  matches: 'Spiele',
  average: 'Schnitt',
  adjustedPoints: 'Angepasste Punkte',
  showAdjusted: 'Fairness-Anpassung anzeigen',
  adjustedExplanation: 'Angepasste Punkte berücksichtigen unterschiedliche Spielanzahlen durch Hochrechnung auf Durchschnittswerte.',
  fewerMatches: 'Weniger Spiele',
  exportCsv: 'CSV exportieren',
  exportJson: 'Daten exportieren',
  importJson: 'Daten importieren',

  // Medals
  gold: 'Gold',
  silver: 'Silber',
  bronze: 'Bronze',

  // Reset
  resetConfirmTitle: 'Turnier zurücksetzen?',
  resetConfirmMessage: 'Alle Daten werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
  resetConfirm: 'Ja, zurücksetzen',
  cancel: 'Abbrechen',

  // Restart tournament
  restartTournament: 'Neuer Durchlauf',
  restartConfirmTitle: 'Neuen Durchlauf starten?',
  restartConfirmMessage: 'Das Turnier wird mit denselben Spielern aber neuen, zufälligen Paarungen neu gestartet. Die aktuelle Rangliste wird zurückgesetzt.',
  restartConfirm: 'Ja, neu starten',

  // Fewer matches warning
  fewerMatchesWarning: 'Bei {count} Spielern haben einige Spieler weniger Spiele',
  fewerMatchesNote: 'Diese Spieler werden am Turnierende auf die maximale Spielanzahl hochgerechnet.',

  // Status
  tournamentStatus: {
    setup: 'Vorbereitung',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
  },

  // Dark mode
  darkMode: 'Dunkelmodus',
  lightMode: 'Hellmodus',

  // General
  save: 'Speichern',
  edit: 'Bearbeiten',
  delete: 'Löschen',
  back: 'Zurück',
  next: 'Weiter',
  loading: 'Laden...',
  error: 'Fehler',
  success: 'Erfolgreich',
} as const;

export type LabelKey = keyof typeof labels;
