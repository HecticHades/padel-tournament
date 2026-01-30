// Class value type for cn helper
type ClassValue = string | number | boolean | undefined | null | ClassValue[];

// Simple clsx-like implementation for class merging
function clsx(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ');
}

// Tailwind class merge helper
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

// Swiss number formatting (uses apostrophe as thousand separator)
export function formatNumber(num: number): string {
  return num.toLocaleString('de-CH');
}

// Format decimal with Swiss locale
export function formatDecimal(num: number, decimals: number = 2): string {
  return num.toLocaleString('de-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Generate CSV with semicolon separator (Swiss standard)
export function generateCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.join(';');
  const dataLines = rows.map(row => row.join(';'));
  return [headerLine, ...dataLines].join('\n');
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download CSV
export function downloadCsv(headers: string[], rows: string[][], filename: string): void {
  const csv = generateCsv(headers, rows);
  // Add BOM for Excel compatibility with UTF-8
  const bom = '\uFEFF';
  downloadFile(bom + csv, filename, 'text/csv;charset=utf-8');
}

// Download JSON
export function downloadJson(data: object, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

// Shuffle array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get ordinal suffix (not used in German, but kept for flexibility)
export function getOrdinal(n: number): string {
  return `${n}.`;
}

// Truncate string
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Deep clone
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Check if arrays have same elements (order independent)
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}
