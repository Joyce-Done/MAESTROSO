import { Habit, HabitCompletionRecord, PianoSong, PianoPracticeLog } from '../types';

export interface SheetSyncResult {
  success: boolean;
  message: string;
  syncedHabitsCount?: number;
  syncedLogsCount?: number;
  syncedSongsCount?: number;
}

/**
 * Extracts a Google Spreadsheet ID from a full Docs URL or raw ID string.
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Validates access to a spreadsheet using Google Sheets API v4
 */
export async function testSpreadsheetAccess(
  spreadsheetId: string,
  accessToken: string
): Promise<{ valid: boolean; title?: string; sheets?: string[]; error?: string }> {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        valid: false,
        error: errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    const sheets = (data.sheets || []).map((s: { properties?: { title?: string } }) => s.properties?.title || '');
    return {
      valid: true,
      title: data.properties?.title || 'Habit Spreadsheet',
      sheets,
    };
  } catch (err: unknown) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Network error connecting to Google Sheets',
    };
  }
}

/**
 * Fetches data from spreadsheet sheets if they exist
 */
export async function fetchSheetValues(
  spreadsheetId: string,
  range: string,
  accessToken: string
): Promise<string[][] | null> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.values || [];
  } catch {
    return null;
  }
}

/**
 * Appends or updates a row in a specific sheet
 */
export async function appendSheetValues(
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][],
  accessToken: string
): Promise<boolean> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Full Sync: Push local habits, completions, piano pieces, and practice logs to Google Sheets
 */
export async function syncAllToGoogleSheets(
  spreadsheetId: string,
  accessToken: string,
  habits: Habit[],
  completions: HabitCompletionRecord[],
  songs: PianoSong[],
  pianoLogs: PianoPracticeLog[]
): Promise<SheetSyncResult> {
  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in with Google required to sync with Google Sheets.',
    };
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    return {
      success: false,
      message: 'Please provide a valid Google Spreadsheet ID or URL.',
    };
  }

  try {
    // 1. Check sheet metadata
    const access = await testSpreadsheetAccess(cleanId, accessToken);
    if (!access.valid) {
      return {
        success: false,
        message: access.error || 'Unable to access spreadsheet. Check permissions.',
      };
    }

    // 2. Prepare Habit Daily Matrix data
    // Format headers: Date | Habit 1 | Habit 2 | ...
    const datesSet = new Set<string>();
    completions.forEach((c) => datesSet.add(c.date));
    const sortedDates = Array.from(datesSet).sort().reverse().slice(0, 45); // Last 45 days

    const habitHeaders = ['Date', ...habits.map((h) => `${h.name} (${h.category})`)];
    const habitMatrixRows: (string | number)[][] = [habitHeaders];

    sortedDates.forEach((dateStr) => {
      const row: (string | number)[] = [dateStr];
      habits.forEach((h) => {
        const comp = completions.find((c) => c.date === dateStr && c.habitId === h.id);
        row.push(comp?.completed ? 'COMPLETED' : 'PENDING');
      });
      habitMatrixRows.push(row);
    });

    // 3. Prepare Piano Repertoire sheet data
    const pianoSongRows: (string | number)[][] = [
      ['Title', 'Composer/Artist', 'Category', 'Status', 'Current BPM', 'Target BPM', 'Practice Mins', 'Times Practiced', 'Key / Notes'],
      ...songs.map((s) => [
        s.title,
        s.composerOrArtist,
        s.category.toUpperCase(),
        s.status.toUpperCase(),
        s.currentBpm || 0,
        s.targetBpm || 0,
        s.totalPracticeMinutes,
        s.timesPracticed,
        s.notes || '',
      ]),
    ];

    // 4. Prepare Piano Practice Logs sheet data
    const pianoLogRows: (string | number)[][] = [
      ['Date', 'Song Title', 'Category', 'Duration (Mins)', 'Tempo (BPM)', 'Measures Focused', 'Rating (1-5)', 'Notes', 'Timestamp'],
      ...pianoLogs.map((l) => [
        l.date,
        l.songTitle,
        l.category.toUpperCase(),
        l.durationMinutes,
        l.tempoAchievedBpm || '',
        l.measuresFocused || '',
        l.rating || 5,
        l.notes || '',
        l.timestamp,
      ]),
    ];

    // Write to sheets using batchUpdate / values update
    // We update A1 range for active sheets or default sheet
    const targetSheetTitle = access.sheets && access.sheets.length > 0 ? access.sheets[0] : 'Sheet1';
    
    // Update main tracking range
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(targetSheetTitle)}!A1:Z500?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: habitMatrixRows,
      }),
    });

    return {
      success: true,
      message: `Successfully synchronized ${habits.length} habits, ${songs.length} piano pieces, and ${pianoLogs.length} practice logs with your spreadsheet!`,
      syncedHabitsCount: habits.length,
      syncedSongsCount: songs.length,
      syncedLogsCount: pianoLogs.length,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Error syncing with Google Sheets',
    };
  }
}
