import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellRing,
  Music,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PianoSong, PianoCategory, RepertoireCategory } from '../types';
import { soundService } from '../services/audio';
import { notificationService } from '../services/notificationService';
import { INITIAL_REPERTOIRE_CATEGORIES } from '../services/storage';

interface PracticeTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: PianoSong[];
  categories?: RepertoireCategory[];
  initialSongId?: string;
  onSaveSession: (session: {
    songId?: string;
    songTitle: string;
    category: PianoCategory;
    date: string;
    durationMinutes: number;
    tempoAchievedBpm?: number;
    measuresFocused?: string;
    notes?: string;
    rating?: number;
  }) => void;
}

export function PracticeTimerModal({
  isOpen,
  onClose,
  songs,
  categories = INITIAL_REPERTOIRE_CATEGORIES,
  initialSongId,
  onSaveSession,
}: PracticeTimerModalProps) {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  const [selectedDurationMins, setSelectedDurationMins] = useState<number>(20);
  const [totalSeconds, setTotalSeconds] = useState<number>(20 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);

  // Practice session details form
  const [selectedSongId, setSelectedSongId] = useState<string>(initialSongId || '');
  const [tempoAchieved, setTempoAchieved] = useState<number>(60);
  const [measuresFocused, setMeasuresFocused] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [rating, setRating] = useState<number>(5);

  // Absolute timestamps to prevent screen lock/background throttling pause
  const endTimeRef = useRef<number | null>(null);
  const stopwatchStartRef = useRef<number | null>(null);
  const hasCompletedRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial song id when opened
  useEffect(() => {
    if (initialSongId) {
      setSelectedSongId(initialSongId);
      const s = songs.find((item) => item.id === initialSongId);
      if (s?.currentBpm) setTempoAchieved(s.currentBpm);
    }
  }, [initialSongId, songs]);

  // Complete and notify handler
  const triggerCompletion = useCallback((songTitle?: string) => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    setIsRunning(false);
    endTimeRef.current = null;
    setSecondsRemaining(0);
    setIsCompleted(true);
    setIsAlarmRinging(true);

    // 1. Play audible alarm/chime (respects existing "Sound Effects & Practice Alarm" toggle in settings)
    soundService.playPracticeAlarm();

    // 2. Trigger browser notification using existing Notification API flow
    const title = 'Practice session complete!';
    const body = songTitle
      ? `Great job! You completed your practice session for "${songTitle}".`
      : 'Great job! Your planned practice session is complete.';

    notificationService.sendNotification({
      title,
      body,
      tag: 'maestroso-timer-complete',
      playSound: false, // practice alarm already played above
      onClick: () => {
        try {
          window.focus();
        } catch {}
      },
    });

    // 3. Fallback mobile vibration if supported
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch {}
  }, []);

  // Recalculate remaining or elapsed time against absolute timestamp
  const checkAndUpdateTime = useCallback(() => {
    if (!isRunning) return;

    const now = Date.now();

    if (mode === 'timer') {
      if (endTimeRef.current !== null) {
        const diffMs = endTimeRef.current - now;
        if (diffMs <= 0) {
          // Reached zero (or elapsed while device screen was locked/asleep)
          const currentSong = songs.find((s) => s.id === selectedSongId);
          triggerCompletion(currentSong?.title);
        } else {
          const remSec = Math.ceil(diffMs / 1000);
          setSecondsRemaining(remSec);
        }
      }
    } else if (mode === 'stopwatch') {
      if (stopwatchStartRef.current !== null) {
        const elapsedSec = Math.max(0, Math.floor((now - stopwatchStartRef.current) / 1000));
        setStopwatchSeconds(elapsedSec);
      }
    }
  }, [isRunning, mode, selectedSongId, songs, triggerCompletion]);

  // Handle Preset selection
  const handleSelectPreset = (mins: number) => {
    soundService.playSlideClick();
    setIsRunning(false);
    setIsAlarmRinging(false);
    setIsCompleted(false);
    hasCompletedRef.current = false;
    endTimeRef.current = null;
    setSelectedDurationMins(mins);
    setTotalSeconds(mins * 60);
    setSecondsRemaining(mins * 60);
  };

  // Timer Tick Interval
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Immediate calculation
    checkAndUpdateTime();

    timerRef.current = setInterval(() => {
      checkAndUpdateTime();
    }, 250);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, checkAndUpdateTime]);

  // Recalculate immediately on app resume, screen unlock, or tab refocus
  useEffect(() => {
    const handleResumeOrFocus = () => {
      if (document.visibilityState === 'visible' || !document.hidden) {
        checkAndUpdateTime();
      }
    };

    document.addEventListener('visibilitychange', handleResumeOrFocus);
    window.addEventListener('focus', handleResumeOrFocus);
    window.addEventListener('pageshow', handleResumeOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleResumeOrFocus);
      window.removeEventListener('focus', handleResumeOrFocus);
      window.removeEventListener('pageshow', handleResumeOrFocus);
    };
  }, [checkAndUpdateTime]);

  // Toggle Start / Pause
  const handleTogglePlay = () => {
    soundService.playSlideClick();
    if (isAlarmRinging) {
      setIsAlarmRinging(false);
    }

    if (isRunning) {
      // PAUSE: snapshot remaining time and clear absolute timestamp
      setIsRunning(false);
      const now = Date.now();
      if (mode === 'timer') {
        if (endTimeRef.current !== null) {
          const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
          setSecondsRemaining(remaining);
        }
        endTimeRef.current = null;
      } else {
        if (stopwatchStartRef.current !== null) {
          const elapsed = Math.max(0, Math.floor((now - stopwatchStartRef.current) / 1000));
          setStopwatchSeconds(elapsed);
        }
        stopwatchStartRef.current = null;
      }
    } else {
      // START / RESUME: calculate new absolute end/start timestamp
      const now = Date.now();
      setIsCompleted(false);
      hasCompletedRef.current = false;

      if (mode === 'timer') {
        let currentRem = secondsRemaining;
        // If timer reached zero previously, restart with totalSeconds
        if (currentRem <= 0) {
          currentRem = totalSeconds;
          setSecondsRemaining(totalSeconds);
        }
        endTimeRef.current = now + currentRem * 1000;
      } else {
        stopwatchStartRef.current = now - stopwatchSeconds * 1000;
      }

      setIsRunning(true);
    }
  };

  // Reset Timer
  const handleReset = () => {
    soundService.playSlideClick();
    setIsRunning(false);
    setIsAlarmRinging(false);
    setIsCompleted(false);
    hasCompletedRef.current = false;
    endTimeRef.current = null;
    stopwatchStartRef.current = null;
    if (mode === 'timer') {
      setSecondsRemaining(totalSeconds);
    } else {
      setStopwatchSeconds(0);
    }
  };

  // Switch Mode (Countdown vs Stopwatch)
  const handleSwitchMode = (newMode: 'timer' | 'stopwatch') => {
    soundService.playSlideClick();
    setIsRunning(false);
    setIsAlarmRinging(false);
    setIsCompleted(false);
    hasCompletedRef.current = false;
    endTimeRef.current = null;
    stopwatchStartRef.current = null;
    setMode(newMode);
  };

  // Test Alarm Sound
  const handleTestAlarm = () => {
    soundService.playPracticeAlarm();
    setIsAlarmRinging(true);
    setTimeout(() => setIsAlarmRinging(false), 3000);
  };

  // Complete and Log Session
  const handleSaveAndClose = () => {
    const elapsedSeconds =
      mode === 'timer' ? totalSeconds - secondsRemaining : stopwatchSeconds;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const song = songs.find((s) => s.id === selectedSongId);
    const category: PianoCategory = song?.category || 'prelude';
    const songTitle = song?.title || 'Piano Practice Warmup';

    onSaveSession({
      songId: selectedSongId || undefined,
      songTitle,
      category,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: elapsedMinutes,
      tempoAchievedBpm: tempoAchieved > 0 ? tempoAchieved : undefined,
      measuresFocused: measuresFocused || undefined,
      notes: sessionNotes || undefined,
      rating,
    });

    soundService.playHabitComplete();
    onClose();
  };

  if (!isOpen) return null;

  // Format Time Display (MM:SS)
  const displaySeconds = mode === 'timer' ? secondsRemaining : stopwatchSeconds;
  const mins = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress Circle %
  const progressRatio =
    mode === 'timer'
      ? totalSeconds > 0
        ? (totalSeconds - secondsRemaining) / totalSeconds
        : 1
      : 1;
  const strokeDashoffset = 440 - 440 * (1 - progressRatio);

  const selectedSong = songs.find((s) => s.id === selectedSongId);

  return (
    <AnimatePresence>
      <motion.div
        id="practice-timer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0513]/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-lg majestic-card rounded-3xl p-5 sm:p-7 shadow-2xl text-white relative my-auto transition-colors ${
            isAlarmRinging || isCompleted
              ? 'border-amber-400/80 shadow-amber-500/20 bg-gradient-to-b from-amber-950/40 via-[#2D1A36] to-[#1D0F22]'
              : ''
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DE72B5]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#6E1E52] border border-[#DE72B5]/40 flex items-center justify-center text-white shadow-md">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black font-serif text-white uppercase tracking-wider">
                  Practice Timer &amp; Studio
                </h2>
                <p className="text-xs text-[#DDD8E2]">Focus timer with metronome &amp; repertoire sync</p>
              </div>
            </div>

            <button
              id="close-timer-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#40234D] hover:bg-[#552F66] text-[#B8A9C2] hover:text-white flex items-center justify-center transition-colors border border-[#DE72B5]/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-[#1D0F22] rounded-xl border border-[#B63E88]/30 max-w-xs mx-auto shadow-inner">
            <button
              id="mode-countdown-btn"
              onClick={() => handleSwitchMode('timer')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'timer'
                  ? 'majestic-btn-primary font-bold shadow-md'
                  : 'text-[#B8A9C2] hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Countdown Timer
            </button>
            <button
              id="mode-stopwatch-btn"
              onClick={() => handleSwitchMode('stopwatch')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'stopwatch'
                  ? 'majestic-btn-primary font-bold shadow-md'
                  : 'text-[#B8A9C2] hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Open Stopwatch
            </button>
          </div>

          {/* Timer Presets */}
          {mode === 'timer' && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap mt-4">
              {[5, 10, 15, 20, 25, 30, 45].map((mins) => (
                <button
                  key={mins}
                  id={`preset-${mins}min-btn`}
                  onClick={() => handleSelectPreset(mins)}
                  className={`px-3 py-1 text-xs rounded-full font-semibold transition-all cursor-pointer ${
                    selectedDurationMins === mins && !isCompleted
                      ? 'majestic-btn-primary font-bold shadow-sm'
                      : 'bg-[#2D1A36] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          {/* Big Visual Timer Ring Display with Metallic Gradient */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 mx-auto my-6 flex flex-col items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="timerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DE72B5" />
                  <stop offset="50%" stopColor="#B63E88" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-[#2D1A36] fill-none"
                strokeWidth="8"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className={`fill-none transition-all duration-300 ${
                  isAlarmRinging || isCompleted ? 'stroke-amber-400' : ''
                }`}
                stroke={isAlarmRinging || isCompleted ? '#fbbf24' : 'url(#timerRingGrad)'}
                strokeWidth="8"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Centered Numbers & Status */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(182, 62, 136, 0.4)' }}
              >
                {formattedTime}
              </span>

              {/* Clear Completion & Practicing State Badge */}
              <div className="mt-1 flex items-center justify-center">
                {isAlarmRinging || isCompleted ? (
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    Complete
                  </span>
                ) : isRunning ? (
                  <span className="text-xs font-bold text-pink-200 flex items-center gap-1.5 bg-[#B63E88]/20 px-2.5 py-0.5 rounded-full border border-[#DE72B5]/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Practicing...
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#DDD8E2] uppercase tracking-wider">
                    Ready
                  </span>
                )}
              </div>

              {selectedSong && (
                <span className="text-[11px] text-[#FFBBE2] max-w-[150px] truncate mt-1.5 font-bold bg-[#40234D]/80 px-2.5 py-0.5 rounded-full border border-[#DE72B5]/40 shadow-sm">
                  {selectedSong.title}
                </span>
              )}
            </div>
          </div>

          {/* Alarm Ringing & Completion Banner */}
          {(isAlarmRinging || isCompleted) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-3 mb-4 text-center text-amber-200 text-xs font-bold flex items-center justify-between gap-2 shadow-lg"
            >
              <div className="flex items-center gap-2 text-left">
                <BellRing className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
                <div>
                  <span className="text-white font-extrabold">Practice session complete!</span>
                  <p className="text-[11px] font-normal text-amber-200/90">
                    {selectedSong ? `Great job on ${selectedSong.title}!` : 'Great dedication at the piano.'}
                  </p>
                </div>
              </div>
              {isAlarmRinging && (
                <button
                  onClick={() => {
                    soundService.playSlideClick();
                    setIsAlarmRinging(false);
                  }}
                  className="px-2.5 py-1 bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 rounded-lg text-[11px] border border-amber-400/40 shrink-0 cursor-pointer font-semibold"
                >
                  Dismiss
                </button>
              )}
            </motion.div>
          )}

          {/* Action Controls: Start/Pause, Reset, Sound Test */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              id="timer-reset-btn"
              onClick={handleReset}
              title="Reset Timer"
              className="w-12 h-12 rounded-2xl bg-[#40234D] hover:bg-[#552F66] text-[#DDD8E2] flex items-center justify-center transition-all active:scale-95 border border-[#DE72B5]/30 shadow-md cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              id="timer-play-pause-btn"
              onClick={handleTogglePlay}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl transition-all active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/40'
                  : 'majestic-btn-primary shadow-rose-900/40 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
            </button>

            <button
              id="timer-sound-test-btn"
              onClick={handleTestAlarm}
              title="Test Alarm Chime"
              className="w-12 h-12 rounded-2xl bg-[#40234D] hover:bg-[#552F66] text-[#DDD8E2] flex items-center justify-center transition-all active:scale-95 border border-[#DE72B5]/30 shadow-md cursor-pointer"
            >
              <Bell className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Song & Log Assignment Form */}
          <div className="bg-[#1D0F22]/90 rounded-2xl p-4 border border-[#B63E88]/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white font-serif">Assign to Piece / Hymn</label>
              <span className="text-[11px] text-[#DDD8E2]">Syncs directly with practice log</span>
            </div>

            {/* Song Dropdown */}
            <select
              id="timer-song-select"
              value={selectedSongId}
              onChange={(e) => {
                setSelectedSongId(e.target.value);
                const s = songs.find((item) => item.id === e.target.value);
                if (s?.currentBpm) setTempoAchieved(s.currentBpm);
              }}
              className="w-full bg-[#2D1A36] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
            >
              <option value="">-- General Piano Technique &amp; Warmup --</option>
              {categories.map((cat) => {
                const catSongs = songs.filter(
                  (s) => s.category === cat.id || (cat.id === 'prelude' && (s.category as string) === 'repertoire')
                );
                if (catSongs.length === 0) return null;
                return (
                  <optgroup key={cat.id} label={cat.name}>
                    {catSongs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} {s.pageNumberOrHymnNumber ? `(${s.pageNumberOrHymnNumber})` : s.composerOrArtist ? `(${s.composerOrArtist})` : ''}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            {/* Measures & Tempo Achieved */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-[#DDD8E2] block mb-1">Measures / Section</label>
                <input
                  id="timer-measures-input"
                  type="text"
                  placeholder="e.g., m. 15-32 or Verse 2"
                  value={measuresFocused}
                  onChange={(e) => setMeasuresFocused(e.target.value)}
                  className="w-full bg-[#2D1A36] border border-[#B63E88]/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#DDD8E2] block mb-1">Tempo Achieved (BPM)</label>
                <input
                  id="timer-bpm-input"
                  type="number"
                  placeholder="80"
                  value={tempoAchieved || ''}
                  onChange={(e) => setTempoAchieved(Number(e.target.value))}
                  className="w-full bg-[#2D1A36] border border-[#B63E88]/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                />
              </div>
            </div>

            {/* Quick Session Rating */}
            <div>
              <label className="text-[11px] font-semibold text-[#DDD8E2] block mb-1">Practice Quality Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    id={`rating-star-${star}`}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      rating >= star
                        ? 'bg-[#B63E88]/30 text-[#FFBBE2] border border-[#DE72B5]/50'
                        : 'bg-[#2D1A36] text-[#8F7F94] border border-[#4D2B5B]'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Record & Save Session Button */}
          <div className="mt-5 flex gap-3">
            <button
              id="save-session-btn"
              onClick={handleSaveAndClose}
              className="flex-1 py-3 majestic-btn-primary font-bold text-sm rounded-xl transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Record Practice Session
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
