import confetti from 'canvas-confetti';
import { PianoPracticeLog, PianoSong, Habit, HabitCompletionRecord } from '../types';
import { soundService } from './audio';

export type MilestoneCategory = 'minutes' | 'streak' | 'repertoire' | 'sessions' | 'routine';

export interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: MilestoneCategory;
  targetValue: number;
  unit: string;
  badgeName: string;
  iconName: string;
  gradient: string;
  borderGlow: string;
  rewardTier: 'Bronze' | 'Silver' | 'Gold' | 'Royal Diamond';
}

const CLAIMED_MILESTONES_KEY = 'maestroso_claimed_milestones_v1';

export const ALL_MILESTONES: Milestone[] = [
  // Total Practice Minutes Milestones
  {
    id: 'minutes_60',
    title: 'First Hour of Mastery',
    subtitle: '60 Total Practice Minutes',
    description: 'You have invested a full hour of deliberate piano practice at the keys.',
    category: 'minutes',
    targetValue: 60,
    unit: 'mins',
    badgeName: 'Hour One Pioneer',
    iconName: 'Clock',
    gradient: 'from-amber-600 to-amber-800',
    borderGlow: '#D97706',
    rewardTier: 'Bronze',
  },
  {
    id: 'minutes_100',
    title: '100 Total Practice Minutes',
    subtitle: 'Centurion Pianist',
    description: 'A major milestone! Triple-digit deliberate practice minutes logged on your piano journey.',
    category: 'minutes',
    targetValue: 100,
    unit: 'mins',
    badgeName: 'Centurion Virtuoso',
    iconName: 'Sparkles',
    gradient: 'from-[#B63E88] to-[#6A1A4E]',
    borderGlow: '#DE72B5',
    rewardTier: 'Silver',
  },
  {
    id: 'minutes_250',
    title: '250 Practice Minutes',
    subtitle: 'Dedicated Musician',
    description: 'Over 4 hours of musical discipline, refining touch, dynamics, and musical phrasing.',
    category: 'minutes',
    targetValue: 250,
    unit: 'mins',
    badgeName: 'Dedicated Virtuoso',
    iconName: 'Music',
    gradient: 'from-fuchsia-600 to-purple-900',
    borderGlow: '#E879F9',
    rewardTier: 'Silver',
  },
  {
    id: 'minutes_500',
    title: '500 Practice Minutes',
    subtitle: 'Virtuoso in Training',
    description: 'Half a thousand minutes! Your consistency is transforming technical challenge into musical expression.',
    category: 'minutes',
    targetValue: 500,
    unit: 'mins',
    badgeName: 'Artisan of Sound',
    iconName: 'Award',
    gradient: 'from-violet-600 to-indigo-950',
    borderGlow: '#818CF8',
    rewardTier: 'Gold',
  },
  {
    id: 'minutes_1000',
    title: '1,000 Practice Minutes',
    subtitle: 'Grand Concert Virtuoso',
    description: 'A thousand minutes of pure musical dedication. True artistry crafted through disciplined repetition.',
    category: 'minutes',
    targetValue: 1000,
    unit: 'mins',
    badgeName: 'Grand Maestro Crown',
    iconName: 'Crown',
    gradient: 'from-amber-400 via-rose-500 to-purple-900',
    borderGlow: '#F59E0B',
    rewardTier: 'Royal Diamond',
  },

  // Streak Milestones
  {
    id: 'streak_3',
    title: '3-Day Practice Streak',
    subtitle: 'Momentum Spark',
    description: 'Three consecutive days of practice! Habits are forming into unbreakable daily rhythms.',
    category: 'streak',
    targetValue: 3,
    unit: 'days',
    badgeName: 'Flame of Habit',
    iconName: 'Flame',
    gradient: 'from-orange-500 to-amber-700',
    borderGlow: '#F97316',
    rewardTier: 'Bronze',
  },
  {
    id: 'streak_7',
    title: '7-Day Practice Streak!',
    subtitle: 'Full Week of Focus',
    description: 'A complete 7-day week of musical devotion without missing a single day. Magnificent discipline!',
    category: 'streak',
    targetValue: 7,
    unit: 'days',
    badgeName: 'Week of Gold',
    iconName: 'Flame',
    gradient: 'from-[#B63E88] via-[#DE72B5] to-amber-500',
    borderGlow: '#FBBF24',
    rewardTier: 'Silver',
  },
  {
    id: 'streak_14',
    title: '14-Day Practice Streak',
    subtitle: 'Fortnight of Focus',
    description: 'Two full weeks unbroken! Your muscle memory and repertoire stamina are flourishing.',
    category: 'streak',
    targetValue: 14,
    unit: 'days',
    badgeName: 'Fortnight Champion',
    iconName: 'Flame',
    gradient: 'from-purple-600 to-pink-800',
    borderGlow: '#C084FC',
    rewardTier: 'Gold',
  },
  {
    id: 'streak_30',
    title: '30-Day Master Streak',
    subtitle: 'Monthly Legend',
    description: 'An entire month of daily piano devotion. You have entered the echelon of dedicated artists.',
    category: 'streak',
    targetValue: 30,
    unit: 'days',
    badgeName: '30-Day Royal Sovereign',
    iconName: 'Crown',
    gradient: 'from-amber-400 via-pink-600 to-indigo-900',
    borderGlow: '#F59E0B',
    rewardTier: 'Royal Diamond',
  },

  // Practice Sessions Count Milestones
  {
    id: 'sessions_5',
    title: '5 Practice Sessions Logged',
    subtitle: 'Taking Flight',
    description: 'Your practice log is officially alive with dedicated focus notes and tempo records.',
    category: 'sessions',
    targetValue: 5,
    unit: 'sessions',
    badgeName: 'Apprentice Note',
    iconName: 'Music',
    gradient: 'from-teal-600 to-emerald-900',
    borderGlow: '#2DD4BF',
    rewardTier: 'Bronze',
  },
  {
    id: 'sessions_20',
    title: '20 Practice Sessions Logged',
    subtitle: 'Deliberate Craftsman',
    description: 'Twenty sessions of targeted practice, tempo refinement, and structured repertoire growth.',
    category: 'sessions',
    targetValue: 20,
    unit: 'sessions',
    badgeName: 'Studio Veteran',
    iconName: 'Award',
    gradient: 'from-cyan-600 to-blue-900',
    borderGlow: '#38BDF8',
    rewardTier: 'Silver',
  },
  {
    id: 'sessions_50',
    title: '50 Practice Sessions Logged',
    subtitle: 'Maestro Heritage',
    description: 'Fifty distinct sessions captured! A testament to deliberate, patient, enduring craftsmanship.',
    category: 'sessions',
    targetValue: 50,
    unit: 'sessions',
    badgeName: 'Grand Archivist',
    iconName: 'Crown',
    gradient: 'from-[#B63E88] via-purple-700 to-indigo-950',
    borderGlow: '#DE72B5',
    rewardTier: 'Gold',
  },

  // Repertoire Milestones
  {
    id: 'repertoire_1',
    title: 'First Mastered Piece',
    subtitle: 'Repertoire Masterpiece',
    description: 'You polished and mastered your first piano piece to performance readiness!',
    category: 'repertoire',
    targetValue: 1,
    unit: 'pieces',
    badgeName: 'Debut Performer',
    iconName: 'Music',
    gradient: 'from-emerald-600 to-teal-950',
    borderGlow: '#34D399',
    rewardTier: 'Silver',
  },
  {
    id: 'repertoire_3',
    title: '3 Mastered Pieces',
    subtitle: 'Concert Repertoire Builder',
    description: 'Three complete pieces ready for concert, church worship, recital, or quiet joy.',
    category: 'repertoire',
    targetValue: 3,
    unit: 'pieces',
    badgeName: 'Concert Trio',
    iconName: 'Award',
    gradient: 'from-indigo-600 to-violet-950',
    borderGlow: '#A78BFA',
    rewardTier: 'Gold',
  },
  {
    id: 'repertoire_5',
    title: '5 Mastered Pieces',
    subtitle: 'Grand Repertoire Virtuoso',
    description: 'Five fully mastered repertoire pieces! A versatile recital-ready concert set.',
    category: 'repertoire',
    targetValue: 5,
    unit: 'pieces',
    badgeName: 'Royal Recitalist',
    iconName: 'Crown',
    gradient: 'from-amber-500 via-rose-600 to-purple-950',
    borderGlow: '#FBBF24',
    rewardTier: 'Royal Diamond',
  },
];

let confettiRunner: ((opts: confetti.Options) => Promise<null> | null) | null = null;

function getSafeConfettiRunner() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (!confettiRunner) {
    try {
      // Explicitly use useWorker: false to prevent worker canvas detachment in iframes and Safari
      confettiRunner = confetti.create(undefined, {
        resize: true,
        useWorker: false,
      });
    } catch (e) {
      try {
        confettiRunner = confetti;
      } catch {}
    }
  }
  return confettiRunner;
}

export function fireSafeConfetti(options: confetti.Options) {
  try {
    const runner = getSafeConfettiRunner();
    if (runner) {
      runner(options);
    }
  } catch (err) {
    console.debug('Confetti effect bypassed safely:', err);
  }
}

/**
 * Triggers a multi-stage celebratory confetti explosion
 * with Maestroso royal plum, rose, gold, and silver colors.
 */
export function triggerCelebrationConfetti(options?: { countMultiplier?: number }) {
  const count = (options?.countMultiplier || 1);

  // Play fanfare sound
  try {
    soundService.playMilestoneCelebration();
  } catch {}

  const colors = ['#B63E88', '#DE72B5', '#FFBBE2', '#F59E0B', '#FBBF24', '#FFFFFF', '#C8A2DA', '#6366F1'];

  // Burst 1: Center blast
  fireSafeConfetti({
    particleCount: Math.floor(70 * count),
    spread: 80,
    origin: { y: 0.6, x: 0.5 },
    colors,
    startVelocity: 45,
    scalar: 1.2,
    ticks: 250,
  });

  // Burst 2: Left cannon
  setTimeout(() => {
    fireSafeConfetti({
      particleCount: Math.floor(50 * count),
      angle: 60,
      spread: 65,
      origin: { x: 0.05, y: 0.75 },
      colors,
      startVelocity: 55,
      scalar: 1.1,
      ticks: 280,
    });
  }, 200);

  // Burst 3: Right cannon
  setTimeout(() => {
    fireSafeConfetti({
      particleCount: Math.floor(50 * count),
      angle: 120,
      spread: 65,
      origin: { x: 0.95, y: 0.75 },
      colors,
      startVelocity: 55,
      scalar: 1.1,
      ticks: 280,
    });
  }, 350);

  // Burst 4: Falling stars / gentle shower
  setTimeout(() => {
    fireSafeConfetti({
      particleCount: Math.floor(40 * count),
      spread: 120,
      origin: { y: 0.25, x: 0.5 },
      colors: ['#FBBF24', '#F59E0B', '#FFFFFF', '#DE72B5'],
      startVelocity: 25,
      gravity: 0.7,
      scalar: 0.9,
      ticks: 350,
    });
  }, 500);
}

/**
 * Calculates current streak across dates
 */
export function calculateCurrentStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;

  const uniqueSortedDates = Array.from(new Set(dates)).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Must have practiced today or yesterday to have an active streak
  const mostRecent = uniqueSortedDates[0];
  if (mostRecent !== today && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(mostRecent + 'T00:00:00');

  for (const dateStr of uniqueSortedDates) {
    const expectedStr = checkDate.toISOString().split('T')[0];
    if (dateStr === expectedStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < expectedStr) {
      break;
    }
  }

  return streak;
}

export interface MilestoneEvaluationResult {
  unlockedMilestones: Milestone[];
  claimedMilestoneIds: string[];
  newlyAchievedMilestones: Milestone[];
  stats: {
    totalMinutes: number;
    totalSessions: number;
    masteredCount: number;
    currentStreak: number;
    nextMilestoneMinutes?: Milestone;
    nextMilestoneStreak?: Milestone;
    nextMilestoneRepertoire?: Milestone;
    nextMilestoneSessions?: Milestone;
  };
}

export class CelebrationManager {
  private static getScopedKey(userId?: string | null): string {
    if (userId && typeof userId === 'string' && userId.trim() !== '') {
      return `${CLAIMED_MILESTONES_KEY}_${userId.trim()}`;
    }
    return CLAIMED_MILESTONES_KEY;
  }

  /**
   * Get all milestone IDs that have already been celebrated/claimed
   */
  static getClaimedMilestoneIds(userId?: string | null): string[] {
    try {
      const data = localStorage.getItem(this.getScopedKey(userId));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Mark a milestone as acknowledged/claimed
   */
  static markMilestoneClaimed(id: string, userId?: string | null) {
    try {
      const current = this.getClaimedMilestoneIds(userId);
      if (!current.includes(id)) {
        current.push(id);
        localStorage.setItem(this.getScopedKey(userId), JSON.stringify(current));
      }
    } catch (e) {
      console.error('Failed to save claimed milestone:', e);
    }
  }

  /**
   * Reset claimed milestones (for testing/replay)
   */
  static resetClaimedMilestones(userId?: string | null) {
    try {
      localStorage.removeItem(this.getScopedKey(userId));
    } catch {}
  }

  /**
   * Evaluates current user practice stats against all milestones
   */
  static evaluateMilestones(
    pianoLogs: PianoPracticeLog[] = [],
    pianoSongs: PianoSong[] = [],
    habits: Habit[] = [],
    completions: HabitCompletionRecord[] = [],
    userId?: string | null
  ): MilestoneEvaluationResult {
    const claimedIds = this.getClaimedMilestoneIds(userId);

    // 1. Total practice minutes (strictly calculated from current profile's pianoLogs)
    const totalMinutes = (pianoLogs || []).reduce((sum, log) => sum + (log.durationMinutes || 0), 0);

    // 2. Total practice sessions logged
    const totalSessions = (pianoLogs || []).length;

    // 3. Mastered repertoire pieces
    const masteredCount = (pianoSongs || []).filter((s) => s.status === 'mastered').length;

    // 4. Consecutive days practice streak
    const pianoDates = (pianoLogs || []).map((l) => l.date);
    const pianoStreak = calculateCurrentStreak(pianoDates);

    // Also factor in completed habit dates if active
    const habitCompletedDates = (completions || []).filter((c) => c.completed).map((c) => c.date);
    const combinedDates = Array.from(new Set([...pianoDates, ...habitCompletedDates]));
    const currentStreak = Math.max(pianoStreak, calculateCurrentStreak(combinedDates));

    // Evaluate each milestone
    const unlockedMilestones: Milestone[] = [];
    const newlyAchievedMilestones: Milestone[] = [];

    for (const milestone of ALL_MILESTONES) {
      let currentValue = 0;

      switch (milestone.category) {
        case 'minutes':
          currentValue = totalMinutes;
          break;
        case 'streak':
          currentValue = currentStreak;
          break;
        case 'sessions':
          currentValue = totalSessions;
          break;
        case 'repertoire':
          currentValue = masteredCount;
          break;
        default:
          currentValue = 0;
      }

      if (currentValue >= milestone.targetValue) {
        unlockedMilestones.push(milestone);
        if (!claimedIds.includes(milestone.id)) {
          newlyAchievedMilestones.push(milestone);
        }
      }
    }

    // Find next upcoming milestone in each category
    const upcomingMinutes = ALL_MILESTONES
      .filter((m) => m.category === 'minutes' && totalMinutes < m.targetValue)
      .sort((a, b) => a.targetValue - b.targetValue)[0];

    const upcomingStreak = ALL_MILESTONES
      .filter((m) => m.category === 'streak' && currentStreak < m.targetValue)
      .sort((a, b) => a.targetValue - b.targetValue)[0];

    const upcomingRepertoire = ALL_MILESTONES
      .filter((m) => m.category === 'repertoire' && masteredCount < m.targetValue)
      .sort((a, b) => a.targetValue - b.targetValue)[0];

    const upcomingSessions = ALL_MILESTONES
      .filter((m) => m.category === 'sessions' && totalSessions < m.targetValue)
      .sort((a, b) => a.targetValue - b.targetValue)[0];

    return {
      unlockedMilestones,
      claimedMilestoneIds: claimedIds,
      newlyAchievedMilestones,
      stats: {
        totalMinutes,
        totalSessions,
        masteredCount,
        currentStreak,
        nextMilestoneMinutes: upcomingMinutes,
        nextMilestoneStreak: upcomingStreak,
        nextMilestoneRepertoire: upcomingRepertoire,
        nextMilestoneSessions: upcomingSessions,
      },
    };
  }
}
