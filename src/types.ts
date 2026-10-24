export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';
export type HabitCategory = 'health' | 'productivity' | 'mindset' | 'faith' | 'creativity' | 'fitness' | 'other';
export type RoutineTime = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type HabitDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  description?: string;
  targetCount: number; // e.g., 1 time per day
  unit?: string; // e.g., "times", "mins", "pages"
  frequency: HabitFrequency;
  color?: string;
  iconName?: string;
  createdAt: string;
  archived?: boolean;
  order?: number; // 1 to 20 position/priority
  isRoutine?: boolean; // Set as routine habit
  routineTime?: RoutineTime; // Morning, Afternoon, Evening, Anytime
  difficulty?: HabitDifficulty;
}

export interface HabitCompletionRecord {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number;
  completedAt?: string;
  notes?: string;
}

export type PianoCategory = string;
export type SongStatus = 'not_started' | 'learning' | 'practicing' | 'polishing' | 'mastered';

export interface RepertoireCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description?: string;
  isDefault?: boolean;
}

export interface PianoSong {
  id: string;
  title: string;
  composerOrArtist: string;
  category: PianoCategory;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Early Advanced';
  targetBpm?: number;
  currentBpm?: number;
  keySignature?: string;
  timeSignature?: string;
  status: SongStatus;
  notes?: string;
  pageNumberOrHymnNumber?: string;
  totalPracticeMinutes: number;
  timesPracticed: number;
  lastPracticedAt?: string;
}

export interface PianoPracticeLog {
  id: string;
  songId?: string;
  songTitle: string;
  category: PianoCategory;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  tempoAchievedBpm?: number;
  measuresFocused?: string;
  notes?: string;
  rating?: number; // 1-5 stars
  timestamp: string;
}

export interface PracticeQuickNote {
  id: string;
  songId?: string; // Optional piece association
  songTitle?: string;
  category?: PianoCategory;
  text: string; // The quick thought / note
  tags?: string[]; // e.g. "Fingering", "Pedal", "Tempo", "Measures", "Dynamics", "Teacher Note"
  timestamp: string; // ISO datetime
  pinned?: boolean;
}

export interface SyncState {
  spreadsheetId: string;
  sheetUrl: string;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error' | 'offline';
  pendingChangesCount: number;
  errorMessage?: string;
  autoSyncEnabled: boolean;
}

export interface UserAuthProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface RoutineReminderTimes {
  morning: string; // e.g. "09:00"
  afternoon: string; // e.g. "14:00"
  evening: string; // e.g. "19:30"
}

export interface AppSettings {
  pinEnabled: boolean;
  pinCode?: string;
  theme: 'neutral' | 'warm-stone' | 'minimal-dark' | 'forest-slate' | 'nordic-sky';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  spreadsheetId: string;
  autoLockMinutes: number;
  dailyHabitGoal?: number; // Daily goal tasks target (1 to 20, default 5)
  notificationsEnabled?: boolean; // Browser Notification API enabled
  routineReminderTimes?: RoutineReminderTimes;
}
