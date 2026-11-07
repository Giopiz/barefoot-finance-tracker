import { type BarefootState, type ExpenseRecord } from '../store/useBarefootStore';

/**
 * Formats a timestamp into an ISO date string (YYYY-MM-DD)
 */
function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Formats a timestamp into a 12-hour or 24-hour time string (HH:MM:SS)
 */
function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toTimeString().split(' ')[0] || '00:00:00';
}

/**
 * Escapes CSV field text to conform to RFC 4180
 */
function escapeCSV(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '""';
  const str = String(text);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Triggers a browser file download from a string or blob
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * One-Click Export of all expenses to clean CSV format
 */
export function exportExpensesToCSV(expenses: ExpenseRecord[], framework = 'barefoot') {
  const headers = ['Date', 'Time', 'Category', 'Bucket Type', 'Amount (AUD)', 'Note / Description'];

  const rows = expenses.map((e) => {
    const bucketLabel =
      e.category === 'splurge'
        ? framework === '50-30-20'
          ? 'Wants'
          : 'Splurge'
        : framework === '50-30-20'
        ? 'Needs'
        : 'Bills';

    return [
      escapeCSV(formatDate(e.timestamp)),
      escapeCSV(formatTime(e.timestamp)),
      escapeCSV(e.category),
      escapeCSV(bucketLabel),
      e.amount.toFixed(2),
      escapeCSV(e.note || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const today = formatDate(Date.now());
  triggerDownload(blob, `barefoot-finance-expenses-${today}.csv`);
}

/**
 * One-Click Full Vault Backup to structured JSON format
 */
export function exportVaultToJSON(state: Partial<BarefootState>) {
  const backupData = {
    app: 'Barefoot Finance Tracker',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    paycheck: state.paycheck || {
      amount: 0,
      frequency: 'fortnightly',
      framework: 'barefoot',
      isConfigured: false,
    },
    balances: {
      splurgeBalance: state.splurgeBalance || 0,
      billsBalance: state.billsBalance || 0,
      fireBalance: state.fireBalance || 0,
      smileBalance: state.smileBalance || 0,
    },
    customSplits: state.customSplits,
    expenses: state.expenses || [],
    paydayCount: state.paydayCount || 0,
    streakCount: state.streakCount || 1,
    readLessonIds: state.readLessonIds || [],
    isProUser: Boolean(state.isProUser),
  };

  const jsonContent = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const today = formatDate(Date.now());
  triggerDownload(blob, `barefoot-vault-backup-${today}.json`);
}

/**
 * Validates and parses a JSON backup file
 */
export function validateAndParseBackup(jsonString: string): any {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format: could not parse file.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid backup structure: root must be an object.');
  }

  // Verify core fields
  if (!parsed.paycheck && !parsed.balances && !Array.isArray(parsed.expenses)) {
    throw new Error('Invalid backup: missing required financial data.');
  }

  return parsed;
}
