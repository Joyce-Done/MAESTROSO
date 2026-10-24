import { useState, useEffect, useCallback, useMemo } from 'react';
import { Habit, HabitCompletionRecord, PianoSong, PianoPracticeLog, SyncState, AppSettings, UserAuthProfile, RepertoireCategory, PracticeQuickNote } from './types';
import {
  LocalStorageManager,
  INITIAL_HABITS,
  INITIAL_PIANO_SONGS,
  INITIAL_REPERTOIRE_CATEGORIES,
  DEFAULT_SPREADSHEET_ID,
  ROUTINE_PRESETS,
  RoutinePreset,
} from './services/storage';
import { initAuth, signInWithGoogle, logOutUser, getCachedAccessToken } from './services/firebase';
import { syncAllToGoogleSheets } from './services/sheets';
import { soundService } from './services/audio';
import { CelebrationManager, Milestone } from './services/celebration';

import { Navbar } from './components/Navbar';
import { HabitList } from './components/HabitList';
import { PianoPractice } from './components/PianoPractice';
import { VisualDashboard } from './components/VisualDashboard';
import { PracticeTimerModal } from './components/PracticeTimerModal';
import { SheetSyncModal } from './components/SheetSyncModal';
import { SettingsModal } from './components/SettingsModal';
import { PinLockModal } from './components/PinLockModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { QuickNotesModal } from './components/QuickNotesModal';
import { PracticeReminderToast } from './components/PracticeReminderToast';
import { MilestoneCelebrationModal } from './components/MilestoneCelebrationModal';
import { MilestonesModal } from './components/MilestonesModal';
import { WelcomeModal } from './components/WelcomeModal';
import { notificationService, PracticeReminderEvent } from './services/notificationService';
import { AgentAction } from './services/aiAgent';
import { Sparkles, StickyNote } from 'lucide-react';

export default function App() {
  // Navigation - pure piano tracking
  const [activeTab, setActiveTab] = useState<'repertoire' | 'history' | 'analytics'>('repertoire');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Core Data
  const [habits, setHabits] = useState<Habit[]>(() => LocalStorageManager.getHabits());
  const [completions, setCompletions] = useState<HabitCompletionRecord[]>(() =>
    LocalStorageManager.getCompletions()
  );
  const [pianoSongs, setPianoSongs] = useState<PianoSong[]>(() =>
    LocalStorageManager.getPianoSongs()
  );
  const [pianoLogs, setPianoLogs] = useState<PianoPracticeLog[]>(() =>
    LocalStorageManager.getPianoLogs()
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    LocalStorageManager.getSettings()
  );
  const [repertoireCategories, setRepertoireCategories] = useState<RepertoireCategory[]>(() =>
    LocalStorageManager.getRepertoireCategories()
  );
  const [quickNotes, setQuickNotes] = useState<PracticeQuickNote[]>(() =>
    LocalStorageManager.getQuickNotes()
  );

  // Auth & Sync State
  const [userProfile, setUserProfile] = useState<UserAuthProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncState, setSyncState] = useState<SyncState>({
    spreadsheetId: settings.spreadsheetId || DEFAULT_SPREADSHEET_ID,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${settings.spreadsheetId || DEFAULT_SPREADSHEET_ID}/edit`,
    isSyncing: false,
    lastSyncedAt: null,
    syncStatus: 'idle',
    pendingChangesCount: 0,
    autoSyncEnabled: true,
  });

  // Modal Dialogs
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => !LocalStorageManager.hasSeenWelcome());
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSongId, setTimerSongId] = useState<string | undefined>(undefined);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);
  const [quickNotesInitialSongId, setQuickNotesInitialSongId] = useState<string | undefined>(undefined);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isMilestonesModalOpen, setIsMilestonesModalOpen] = useState(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [celebratingMilestones, setCelebratingMilestones] = useState<Milestone[]>([]);

  // Dismiss welcome modal and persist flag
  const handleBeginWelcome = () => {
    LocalStorageManager.setHasSeenWelcome(true);
    setIsWelcomeModalOpen(false);
  };

  // Calculate & evaluate all milestones strictly for current profile
  const milestoneEvaluation = useMemo(() => {
    return CelebrationManager.evaluateMilestones(pianoLogs, pianoSongs, habits, completions, userProfile?.uid);
  }, [pianoLogs, pianoSongs, habits, completions, userProfile?.uid]);

  // Helper to evaluate and trigger newly achieved milestones strictly after deliberate user practice actions
  const checkMilestonesAfterAction = (
    currentLogs: PianoPracticeLog[],
    currentSongs: PianoSong[],
    currentHabits: Habit[],
    currentCompletions: HabitCompletionRecord[]
  ) => {
    const evaluation = CelebrationManager.evaluateMilestones(
      currentLogs,
      currentSongs,
      currentHabits,
      currentCompletions,
      userProfile?.uid
    );

    if (evaluation.newlyAchievedMilestones.length > 0) {
      setCelebratingMilestones(evaluation.newlyAchievedMilestones);
      setIsCelebrationModalOpen(true);
      evaluation.newlyAchievedMilestones.forEach((m) => {
        CelebrationManager.markMilestoneClaimed(m.id, userProfile?.uid);
      });
    }
  };

  // PIN Lock Protection
  const [isLocked, setIsLocked] = useState<boolean>(() => settings.pinEnabled);
  const [isSettingPinModalOpen, setIsSettingPinModalOpen] = useState(false);

  // Active Practice Reminder Toast state
  const [activeReminder, setActiveReminder] = useState<PracticeReminderEvent | null>(null);

  // Routine Practice Reminders Notification Scheduler
  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    // Run immediate check
    notificationService.checkAndTriggerScheduledReminders(
      habits,
      settings,
      (reminder) => {
        setActiveReminder(reminder);
      }
    );

    // Periodic check every 30 seconds
    const intervalId = setInterval(() => {
      notificationService.checkAndTriggerScheduledReminders(
        habits,
        settings,
        (reminder) => {
          setActiveReminder(reminder);
        }
      );
    }, 30000);

    return () => clearInterval(intervalId);
  }, [habits, settings]);

  // Sound service initialization
  useEffect(() => {
    soundService.setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync pending items when back online
      if (syncState.autoSyncEnabled && getCachedAccessToken()) {
        triggerSync();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncState.autoSyncEnabled]);

  // Firebase Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (profile, token) => {
        setUserProfile(profile);
        if (profile?.uid) {
          setHabits(LocalStorageManager.getHabits(profile.uid));
          setCompletions(LocalStorageManager.getCompletions(profile.uid));
          setPianoSongs(LocalStorageManager.getPianoSongs(profile.uid));
          setPianoLogs(LocalStorageManager.getPianoLogs(profile.uid));
          setRepertoireCategories(LocalStorageManager.getRepertoireCategories(profile.uid));
          setQuickNotes(LocalStorageManager.getQuickNotes(profile.uid));
        }
      },
      () => {
        setUserProfile(null);
        setHabits(LocalStorageManager.getHabits(null));
        setCompletions(LocalStorageManager.getCompletions(null));
        setPianoSongs(LocalStorageManager.getPianoSongs(null));
        setPianoLogs(LocalStorageManager.getPianoLogs(null));
        setRepertoireCategories(LocalStorageManager.getRepertoireCategories(null));
        setQuickNotes(LocalStorageManager.getQuickNotes(null));
      }
    );
    return () => unsubscribe();
  }, []);

  // Save changes to LocalStorage automatically
  useEffect(() => {
    LocalStorageManager.saveHabits(habits, userProfile?.uid);
  }, [habits, userProfile?.uid]);

  useEffect(() => {
    LocalStorageManager.saveCompletions(completions, userProfile?.uid);
  }, [completions, userProfile?.uid]);

  useEffect(() => {
    LocalStorageManager.savePianoSongs(pianoSongs, userProfile?.uid);
  }, [pianoSongs, userProfile?.uid]);

  useEffect(() => {
    LocalStorageManager.savePianoLogs(pianoLogs, userProfile?.uid);
  }, [pianoLogs, userProfile?.uid]);

  useEffect(() => {
    LocalStorageManager.saveRepertoireCategories(repertoireCategories, userProfile?.uid);
  }, [repertoireCategories, userProfile?.uid]);

  useEffect(() => {
    LocalStorageManager.saveQuickNotes(quickNotes, userProfile?.uid);
  }, [quickNotes, userProfile?.uid]);

  useEffect(() => {
    LocalStorageManager.saveSettings(settings);
  }, [settings]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithGoogle();
      if (res) {
        setUserProfile(res.profile);
        soundService.playHabitComplete();
      }
    } catch {
      // Ignored - cancellations and popup handling are caught safely inside signInWithGoogle
    }
  };

  // Handle Google Sign Out
  const handleGoogleSignOut = async () => {
    await logOutUser();
    setUserProfile(null);
    soundService.playSlideClick();
  };

  // Perform Google Sheets Sync
  const triggerSync = useCallback(async () => {
    const token = getCachedAccessToken();
    if (!token) {
      setIsSyncModalOpen(true);
      return;
    }

    setSyncState((prev) => ({ ...prev, isSyncing: true, syncStatus: 'syncing' }));

    try {
      const result = await syncAllToGoogleSheets(
        syncState.spreadsheetId,
        token,
        habits,
        completions,
        pianoSongs,
        pianoLogs
      );

      if (result.success) {
        LocalStorageManager.clearSyncQueue();
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          syncStatus: 'success',
          lastSyncedAt: new Date().toLocaleTimeString(),
          pendingChangesCount: 0,
          errorMessage: undefined,
        }));
        soundService.playHabitComplete();
      } else {
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          syncStatus: 'error',
          errorMessage: result.message,
        }));
      }
    } catch (err: unknown) {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncStatus: 'error',
        errorMessage: err instanceof Error ? err.message : 'Sync failed',
      }));
    }
  }, [syncState.spreadsheetId, habits, completions, pianoSongs, pianoLogs]);

  // Toggle Habit completion for a date
  const handleToggleHabit = (habitId: string, completed: boolean, date: string) => {
    setCompletions((prev) => {
      const existingIdx = prev.findIndex((c) => c.habitId === habitId && c.date === date);
      let updated: HabitCompletionRecord[];

      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        };
      } else {
        const h = habits.find((item) => item.id === habitId);
        updated = [
          ...prev,
          {
            habitId,
            date,
            completed,
            value: h?.targetCount || 1,
            completedAt: completed ? new Date().toISOString() : undefined,
          },
        ];
      }

      LocalStorageManager.enqueueSyncAction('toggle_habit', { habitId, date, completed });
      setSyncState((s) => ({ ...s, pendingChangesCount: s.pendingChangesCount + 1 }));

      if (completed) {
        checkMilestonesAfterAction(pianoLogs, pianoSongs, habits, updated);
      }

      return updated;
    });
  };

  // Add new Habit
  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit_${Date.now()}`,
      order: newHabitData.order || habits.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setHabits((prev) => [...prev, newHabit]);
    LocalStorageManager.enqueueSyncAction('add_habit', newHabit);
  };

  // Reorder habits state
  const handleReorderHabits = (reorderedHabits: Habit[]) => {
    setHabits(reorderedHabits);
    LocalStorageManager.saveHabits(reorderedHabits, userProfile?.uid);
  };

  // Apply a routine preset (replace or append)
  const handleApplyRoutinePreset = (
    preset: RoutinePreset,
    mode: 'replace' | 'append'
  ) => {
    if (mode === 'replace') {
      const newHabits: Habit[] = preset.habits.map((h, i) => ({
        ...h,
        id: `habit_${Date.now()}_${i}`,
        order: i + 1,
        createdAt: new Date().toISOString().split('T')[0],
      }));
      setHabits(newHabits);
      LocalStorageManager.saveHabits(newHabits, userProfile?.uid);
      setSettings((s) => ({ ...s, dailyHabitGoal: preset.recommendedDailyGoal }));
    } else {
      const existingCount = habits.length;
      const appended: Habit[] = preset.habits.map((h, i) => ({
        ...h,
        id: `habit_${Date.now()}_${i}`,
        order: existingCount + i + 1,
        createdAt: new Date().toISOString().split('T')[0],
      }));
      const combined = [...habits, ...appended];
      setHabits(combined);
      LocalStorageManager.saveHabits(combined, userProfile?.uid);
    }
  };

  // Update Daily Habit Goal
  const handleUpdateDailyGoal = (goal: number) => {
    const validGoal = Math.min(20, Math.max(1, goal));
    setSettings((s) => ({ ...s, dailyHabitGoal: validGoal }));
  };

  // Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => {
      const remaining = prev.filter((h) => h.id !== habitId);
      const reindexed = remaining.map((h, i) => ({ ...h, order: i + 1 }));
      LocalStorageManager.saveHabits(reindexed, userProfile?.uid);
      return reindexed;
    });
  };

  // Add Piano Song
  const handleAddPianoSong = (
    songData: Omit<PianoSong, 'id' | 'totalPracticeMinutes' | 'timesPracticed'>
  ) => {
    const newSong: PianoSong = {
      ...songData,
      id: `song_${Date.now()}`,
      totalPracticeMinutes: 0,
      timesPracticed: 0,
    };
    setPianoSongs((prev) => [...prev, newSong]);
    LocalStorageManager.enqueueSyncAction('add_song', newSong);
  };

  // Update Piano Song
  const handleUpdatePianoSong = (updatedSong: PianoSong) => {
    const updatedSongs = pianoSongs.map((s) => (s.id === updatedSong.id ? updatedSong : s));
    setPianoSongs(updatedSongs);
    LocalStorageManager.enqueueSyncAction('update_song', updatedSong);

    if (updatedSong.status === 'mastered') {
      checkMilestonesAfterAction(pianoLogs, updatedSongs, habits, completions);
    }
  };

  // Delete Piano Song
  const handleDeletePianoSong = (songId: string) => {
    setPianoSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  // Save Piano Practice Session Log
  const handleSavePracticeSession = (
    logData: Omit<PianoPracticeLog, 'id' | 'timestamp'>
  ) => {
    const newLog: PianoPracticeLog = {
      ...logData,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...pianoLogs];
    setPianoLogs(updatedLogs);

    // Also update song's total time and times practiced
    let updatedSongs = pianoSongs;
    if (logData.songId) {
      updatedSongs = pianoSongs.map((s) => {
        if (s.id === logData.songId) {
          return {
            ...s,
            totalPracticeMinutes: s.totalPracticeMinutes + logData.durationMinutes,
            timesPracticed: s.timesPracticed + 1,
            currentBpm: logData.tempoAchievedBpm || s.currentBpm,
            lastPracticedAt: logData.date,
          };
        }
        return s;
      });
      setPianoSongs(updatedSongs);
    }

    // Mark today's Piano Habit as complete automatically!
    const pianoHabit = habits.find(
      (h) => h.id === 'habit_piano' || h.name.toLowerCase().includes('piano')
    );
    if (pianoHabit) {
      handleToggleHabit(pianoHabit.id, true, logData.date);
    }

    LocalStorageManager.enqueueSyncAction('add_piano_log', newLog);

    // Evaluate newly crossed thresholds & celebrate immediately
    checkMilestonesAfterAction(updatedLogs, updatedSongs, habits, completions);
  };

  // Category Handlers
  const handleAddCategory = (category: RepertoireCategory) => {
    setRepertoireCategories((prev) => [...prev, category]);
  };

  const handleUpdateCategory = (category: RepertoireCategory) => {
    setRepertoireCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c))
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    setRepertoireCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const handleReorderCategories = (newCategories: RepertoireCategory[]) => {
    setRepertoireCategories(newCategories);
  };

  const handleResetCategories = () => {
    setRepertoireCategories(INITIAL_REPERTOIRE_CATEGORIES);
  };

  // Reset to initial clean defaults
  const handleResetToDefaults = () => {
    setHabits(INITIAL_HABITS);
    setCompletions([]);
    setPianoSongs(INITIAL_PIANO_SONGS);
    setPianoLogs([]);
    setRepertoireCategories(INITIAL_REPERTOIRE_CATEGORIES);
    LocalStorageManager.saveHabits(INITIAL_HABITS, userProfile?.uid);
    LocalStorageManager.saveCompletions([], userProfile?.uid);
    LocalStorageManager.savePianoSongs(INITIAL_PIANO_SONGS, userProfile?.uid);
    LocalStorageManager.savePianoLogs([], userProfile?.uid);
    LocalStorageManager.saveRepertoireCategories(INITIAL_REPERTOIRE_CATEGORIES, userProfile?.uid);
    LocalStorageManager.resetWelcome();
    CelebrationManager.resetClaimedMilestones(userProfile?.uid);
    setIsWelcomeModalOpen(true);
    soundService.playHabitComplete();
  };

  // Export local JSON backup file
  const handleExportBackup = () => {
    const data = {
      habits,
      completions,
      pianoSongs,
      pianoLogs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-piano-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open Timer for specific song
  const handleOpenTimerForSong = (songId?: string) => {
    setTimerSongId(songId);
    setIsTimerOpen(true);
  };

  // Open Quick Notes Modal
  const handleOpenQuickNotes = (songId?: string) => {
    setQuickNotesInitialSongId(songId);
    setIsQuickNotesOpen(true);
  };

  // Add Quick Note
  const handleAddQuickNote = (noteData: Omit<PracticeQuickNote, 'id' | 'timestamp'>) => {
    const newNote: PracticeQuickNote = {
      ...noteData,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setQuickNotes((prev) => [newNote, ...prev]);
  };

  // Update Quick Note
  const handleUpdateQuickNote = (updatedNote: PracticeQuickNote) => {
    setQuickNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );
  };

  // Delete Quick Note
  const handleDeleteQuickNote = (id: string) => {
    setQuickNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Toggle Pin on Quick Note
  const handleTogglePinQuickNote = (id: string) => {
    setQuickNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // AI Agent Action Execution Handler
  const handleExecuteAgentAction = (action: AgentAction) => {
    switch (action.type) {
      case 'TOGGLE_HABIT': {
        const { habitId, habitName, completed, date } = action.payload;
        let targetHabitId = habitId;
        if (!targetHabitId && habitName) {
          const found = habits.find(
            (h) => h.name.toLowerCase() === habitName.toLowerCase() ||
                   h.name.toLowerCase().includes(habitName.toLowerCase())
          );
          if (found) targetHabitId = found.id;
        }
        if (targetHabitId) {
          handleToggleHabit(targetHabitId, completed ?? true, date || selectedDate);
        }
        break;
      }
      case 'LOG_PRACTICE': {
        const { songId, songTitle, durationMinutes, tempoAchievedBpm, notes, rating, date } = action.payload;
        let targetSong = pianoSongs.find((s) => s.id === songId);
        if (!targetSong && songTitle) {
          targetSong = pianoSongs.find((s) =>
            s.title.toLowerCase().includes(songTitle.toLowerCase())
          );
        }
        
        const finalTitle = targetSong ? targetSong.title : (songTitle || 'General Practice');
        const finalCategory = targetSong ? targetSong.category : 'repertoire';

        handleSavePracticeSession({
          songId: targetSong?.id,
          songTitle: finalTitle,
          category: finalCategory,
          durationMinutes: durationMinutes || 20,
          tempoAchievedBpm: tempoAchievedBpm || targetSong?.currentBpm || 72,
          notes: notes || 'Logged via AI Assistant',
          rating: rating || 4,
          date: date || selectedDate,
        });
        break;
      }
      case 'ADD_SONG': {
        const { title, composerOrHymnNumber, category, keySignature, targetBpm, difficulty, notes } = action.payload;
        let songCategory: 'repertoire' | 'hymn' | 'lords_supper' = 'repertoire';
        if (category === 'hymn' || (composerOrHymnNumber && composerOrHymnNumber.toLowerCase().includes('hymn'))) {
          songCategory = 'hymn';
        } else if (category === 'lords_supper' || category === 'communion') {
          songCategory = 'lords_supper';
        }

        handleAddPianoSong({
          title: title || 'New Piece',
          composerOrArtist: composerOrHymnNumber || 'Traditional',
          pageNumberOrHymnNumber: composerOrHymnNumber || '',
          category: songCategory,
          status: 'learning',
          keySignature: keySignature || 'C Major',
          targetBpm: targetBpm || 80,
          currentBpm: 60,
          difficulty: difficulty || 'Intermediate',
          notes: notes || '',
        });
        break;
      }
      case 'CREATE_HABIT': {
        const { name, description, frequency, targetCount, unit, color, order, isRoutine, routineTime, difficulty } = action.payload;
        handleAddHabit({
          name: name || 'New Habit',
          description: description || '',
          category: 'other',
          frequency: (frequency as any) || 'daily',
          targetCount: targetCount || 1,
          unit: unit || 'times',
          color: color || '#14b8a6',
          order: order || habits.length + 1,
          isRoutine: isRoutine !== undefined ? isRoutine : true,
          routineTime: routineTime || 'morning',
          difficulty: difficulty || 'beginner',
        });
        break;
      }
      case 'SET_DAILY_GOAL': {
        const { goal } = action.payload;
        if (goal) {
          handleUpdateDailyGoal(goal);
        }
        break;
      }
      case 'SET_BEGINNER_ROUTINE': {
        const { mode } = action.payload;
        const beginner = ROUTINE_PRESETS.find((p) => p.id === 'beginner_starter');
        if (beginner) {
          handleApplyRoutinePreset(beginner, mode || 'replace');
        }
        break;
      }
      case 'REORDER_HABIT': {
        const { habitId, habitName, targetOrder } = action.payload;
        let id = habitId;
        if (!id && habitName) {
          const found = habits.find((h) => h.name.toLowerCase().includes(habitName.toLowerCase()));
          if (found) id = found.id;
        }
        if (id && targetOrder) {
          const current = [...habits].sort((a, b) => (a.order || 0) - (b.order || 0));
          const idx = current.findIndex((h) => h.id === id);
          if (idx !== -1) {
            const [item] = current.splice(idx, 1);
            const insertIdx = Math.min(Math.max(0, targetOrder - 1), current.length);
            current.splice(insertIdx, 0, item);
            const reordered = current.map((h, i) => ({ ...h, order: i + 1 }));
            handleReorderHabits(reordered);
          }
        }
        break;
      }
      case 'DELETE_HABIT': {
        const { habitId, habitName } = action.payload;
        let id = habitId;
        if (!id && habitName) {
          const found = habits.find((h) => h.name.toLowerCase().includes(habitName.toLowerCase()));
          if (found) id = found.id;
        }
        if (id) {
          handleDeleteHabit(id);
        }
        break;
      }
      case 'SET_ROUTINE_HABIT': {
        const { habitId, habitName, isRoutine, routineTime } = action.payload;
        let id = habitId;
        if (!id && habitName) {
          const found = habits.find((h) => h.name.toLowerCase().includes(habitName.toLowerCase()));
          if (found) id = found.id;
        }
        if (id) {
          const updated = habits.map((h) => {
            if (h.id === id) {
              return {
                ...h,
                isRoutine: isRoutine !== undefined ? isRoutine : true,
                routineTime: routineTime || h.routineTime || 'morning',
              };
            }
            return h;
          });
          handleReorderHabits(updated);
        }
        break;
      }
    }
  };

  // Theme root classes
  const getThemeClass = () => {
    switch (settings.theme) {
      case 'warm-stone':
        return 'text-[#F5F0F5]';
      case 'minimal-dark':
        return 'text-[#F5F0F5]';
      case 'forest-slate':
        return 'text-[#F5F0F5]';
      case 'nordic-sky':
        return 'text-[#F5F0F5]';
      default:
        return 'text-[#F5F0F5]';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-white transition-colors duration-300">
      {/* Top App Bar & Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        syncState={syncState}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onTriggerSync={triggerSync}
        isOnline={isOnline}
        userProfile={userProfile}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        onOpenSettings={() => setIsSettingsOpen(true)}
        pinEnabled={settings.pinEnabled}
        onLockApp={() => setIsLocked(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenTimer={() => handleOpenTimerForSong()}
        onOpenQuickNotes={() => handleOpenQuickNotes()}
        quickNotesCount={quickNotes.length}
        onOpenMilestones={() => setIsMilestonesModalOpen(true)}
        unlockedMilestonesCount={milestoneEvaluation.unlockedMilestones.length}
      />

      {/* Main Content Area: Pure Maestroso Piano Practice Tracker */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 pb-20">
        <PianoPractice
          songs={pianoSongs}
          logs={pianoLogs}
          quickNotes={quickNotes}
          categories={repertoireCategories}
          navTab={activeTab}
          onSelectNavTab={setActiveTab}
          onOpenTimer={handleOpenTimerForSong}
          onOpenQuickNotes={handleOpenQuickNotes}
          onDeleteQuickNote={handleDeleteQuickNote}
          onTogglePinQuickNote={handleTogglePinQuickNote}
          onAddSong={handleAddPianoSong}
          onUpdateSong={handleUpdatePianoSong}
          onDeleteSong={handleDeletePianoSong}
          onAddManualLog={handleSavePracticeSession}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
          onResetCategories={handleResetCategories}
        />
      </main>

      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2.5 sm:gap-3">
        {/* Floating Quick Note Button */}
        <button
          id="global-floating-quick-notes-btn"
          onClick={() => {
            soundService.playSlideClick();
            handleOpenQuickNotes();
          }}
          className="majestic-card px-3.5 py-3 font-bold rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center gap-2 border-amber-500/40 text-amber-200 hover:text-white hover:border-amber-400"
          title="Capture Practice Quick Note"
        >
          <StickyNote className="w-4 h-4 text-amber-300" />
          <span className="text-xs sm:text-sm hidden sm:inline">Quick Note</span>
          {quickNotes.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#B63E88] text-white text-[10px] font-bold">
              {quickNotes.length}
            </span>
          )}
        </button>

        {/* Floating Action Button for Quick Timer */}
        <button
          id="global-floating-timer-btn"
          onClick={() => handleOpenTimerForSong()}
          className="majestic-btn-silver px-4 py-3 font-bold rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center gap-2"
          title="Open Piano Practice Timer"
        >
          <span className="text-sm">⏱️</span>
          <span className="text-xs sm:text-sm hidden sm:inline">Timer</span>
        </button>
      </div>

      {/* Quick Notes Modal / Slide-over */}
      {isQuickNotesOpen && (
        <QuickNotesModal
          isOpen={isQuickNotesOpen}
          onClose={() => setIsQuickNotesOpen(false)}
          quickNotes={quickNotes}
          songs={pianoSongs}
          categories={repertoireCategories}
          initialSongId={quickNotesInitialSongId}
          onAddNote={handleAddQuickNote}
          onUpdateNote={handleUpdateQuickNote}
          onDeleteNote={handleDeleteQuickNote}
          onTogglePin={handleTogglePinQuickNote}
          onOpenTimerForSong={(songId) => {
            setIsQuickNotesOpen(false);
            handleOpenTimerForSong(songId);
          }}
        />
      )}

      {/* First-Launch Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onBegin={handleBeginWelcome}
      />

      {/* Grand Milestone Celebration Modal (Confetti & Fanfare) */}
      <MilestoneCelebrationModal
        isOpen={isCelebrationModalOpen}
        milestones={celebratingMilestones}
        onClose={() => setIsCelebrationModalOpen(false)}
        onViewAchievementsList={() => setIsMilestonesModalOpen(true)}
      />

      {/* Milestones & Honors Trophy Dashboard Modal */}
      <MilestonesModal
        isOpen={isMilestonesModalOpen}
        onClose={() => setIsMilestonesModalOpen(false)}
        evaluation={milestoneEvaluation}
        onCelebrateMilestone={(m) => {
          setCelebratingMilestones([m]);
          setIsCelebrationModalOpen(true);
        }}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        habits={habits}
        songs={pianoSongs}
        selectedDate={selectedDate}
        onExecuteAction={handleExecuteAgentAction}
      />

      {/* Practice Timer & Alarm Modal */}
      <PracticeTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        songs={pianoSongs}
        categories={repertoireCategories}
        initialSongId={timerSongId}
        onSaveSession={handleSavePracticeSession}
      />

      {/* Google Sheets Sync Modal */}
      <SheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncState={syncState}
        onUpdateSpreadsheetId={(id) => {
          setSettings((s) => ({ ...s, spreadsheetId: id }));
          setSyncState((s) => ({
            ...s,
            spreadsheetId: id,
            sheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
          }));
        }}
        onTriggerSync={triggerSync}
        userProfile={userProfile}
        onSignInWithGoogle={handleGoogleSignIn}
        isOnline={isOnline}
        onExportLocalBackup={handleExportBackup}
      />

      {/* Practice Routine Reminder In-App Toast */}
      <PracticeReminderToast
        reminder={activeReminder}
        onClose={() => setActiveReminder(null)}
        onStartPracticeTimer={() => {
          setIsTimerOpen(true);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        habits={habits}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onOpenSetPinModal={() => {
          setIsSettingsOpen(false);
          setIsSettingPinModalOpen(true);
        }}
        onResetToDefaults={handleResetToDefaults}
        onTestReminder={(slot) => {
          notificationService.sendTestReminder(slot, habits, (reminder) => {
            setActiveReminder(reminder);
          });
        }}
      />

      {/* PIN Unlock Modal (When locked) */}
      <PinLockModal
        isOpen={isLocked}
        onUnlock={() => setIsLocked(false)}
        correctPin={settings.pinCode || ''}
      />

      {/* Set New PIN Modal */}
      <PinLockModal
        isOpen={isSettingPinModalOpen}
        onUnlock={() => setIsSettingPinModalOpen(false)}
        correctPin=""
        isSettingNewPin={true}
        onPinConfigured={(newPin) => {
          setSettings((prev) => ({ ...prev, pinEnabled: true, pinCode: newPin }));
          setIsSettingPinModalOpen(false);
        }}
        onCloseModal={() => setIsSettingPinModalOpen(false)}
      />
    </div>
  );
}
