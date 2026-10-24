import { Habit, HabitCompletionRecord, PianoSong, PianoPracticeLog, PracticeQuickNote, AppSettings, PianoCategory, RepertoireCategory } from '../types';

const HABITS_KEY = 'habits_data_v1';
const COMPLETIONS_KEY = 'habit_completions_v1';
const PIANO_SONGS_KEY = 'piano_songs_v1';
const PIANO_LOGS_KEY = 'piano_logs_v1';
const QUICK_NOTES_KEY = 'piano_quick_notes_v1';
const REPERTOIRE_CATEGORIES_KEY = 'repertoire_categories_v1';
const SETTINGS_KEY = 'app_settings_v1';
const PENDING_SYNC_KEY = 'pending_sync_queue_v1';
const HAS_SEEN_WELCOME_KEY = 'maestroso_has_seen_welcome_v1';

export const DEFAULT_SPREADSHEET_ID = '1NX2T9FN97xh4TzpZniYfIg6l7eJqNd1CpJ-v2X8Dnps';

export const INITIAL_QUICK_NOTES: PracticeQuickNote[] = [
  {
    id: 'note_1',
    songId: 'song_rep_1',
    songTitle: 'Clair de Lune',
    category: 'prelude',
    text: 'Measure 27-36: Keep wrist very loose and fluid. Use 5-3-2-1 fingering for the ascending left-hand arpeggios to avoid thumbs bumping.',
    tags: ['Fingering', 'Measures', 'Technique'],
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    pinned: true,
  },
  {
    id: 'note_2',
    songId: 'song_hymn_1',
    songTitle: 'Amazing Grace (My Chains Are Gone)',
    category: 'hymn',
    text: 'Check modulation into E-flat Major before choir enters on verse 3. Keep pedal clean across the transition bar.',
    tags: ['Pedal', 'Choir Prep'],
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    pinned: true,
  },
  {
    id: 'note_3',
    songId: 'song_ls_1',
    songTitle: 'As the Deer (Communion Meditation)',
    category: 'lords_supper',
    text: 'Use una corda (soft pedal) throughout the quiet second repeat. Don’t rush the fermata before the final cadence.',
    tags: ['Pedal', 'Dynamics'],
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    pinned: false,
  },
  {
    id: 'note_4',
    text: 'Metronome practice tip: Bump tempo by only +2 BPM per successful clean run through the tricky coda section.',
    tags: ['Tempo', 'General Practice'],
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    pinned: false,
  },
];

export const INITIAL_REPERTOIRE_CATEGORIES: RepertoireCategory[] = [
  {
    id: 'prelude',
    name: 'Preludes',
    iconName: 'Music',
    color: '#B63E88',
    description: 'Classical masterworks, service preludes, and recital solos',
    isDefault: true,
  },
  {
    id: 'hymn',
    name: 'Hymns',
    iconName: 'BookOpen',
    color: '#7B4D8A',
    description: '4-part congregational hymns and worship songs',
    isDefault: true,
  },
  {
    id: 'lords_supper',
    name: "Lord's Supper",
    iconName: 'Church',
    color: '#C7A252',
    description: 'Communion meditations, solemn offertories, and peaceful devotionals',
    isDefault: true,
  },
  {
    id: 'choir_song',
    name: 'Choir Songs',
    iconName: 'Users',
    color: '#9B51E0',
    description: 'Anthems, choral accompaniments, and ensemble works',
    isDefault: true,
  },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit_devotion',
    name: 'Morning Devotional & Prayer',
    category: 'faith',
    description: 'Scripture reading, prayer & morning reflection',
    targetCount: 1,
    unit: 'session',
    frequency: 'daily',
    color: '#6366f1',
    iconName: 'BookOpen',
    createdAt: '2026-01-01',
    order: 1,
    isRoutine: true,
    routineTime: 'morning',
    difficulty: 'beginner',
  },
  {
    id: 'habit_piano',
    name: 'Piano Practice Routine',
    category: 'creativity',
    description: '30 mins repertoire, hymns, or communion pieces',
    targetCount: 1,
    unit: 'session',
    frequency: 'daily',
    color: '#0d9488',
    iconName: 'Music',
    createdAt: '2026-01-01',
    order: 2,
    isRoutine: true,
    routineTime: 'morning',
    difficulty: 'intermediate',
  },
  {
    id: 'habit_water',
    name: 'Hydration Goal (8 Glasses)',
    category: 'health',
    description: 'Drink 2.5 Liters of water throughout the day',
    targetCount: 8,
    unit: 'glasses',
    frequency: 'daily',
    color: '#0284c7',
    iconName: 'Droplets',
    createdAt: '2026-01-01',
    order: 3,
    isRoutine: true,
    routineTime: 'anytime',
    difficulty: 'beginner',
  },
  {
    id: 'habit_walk',
    name: 'Daily Walk or Exercise',
    category: 'fitness',
    description: '30 minutes brisk walk or strength workout',
    targetCount: 1,
    unit: 'walk',
    frequency: 'daily',
    color: '#16a34a',
    iconName: 'Activity',
    createdAt: '2026-01-01',
    order: 4,
    isRoutine: true,
    routineTime: 'afternoon',
    difficulty: 'beginner',
  },
  {
    id: 'habit_deep_work',
    name: 'Deep Focus Work Block',
    category: 'productivity',
    description: 'Uninterrupted creative/analytical focus',
    targetCount: 1,
    unit: 'block',
    frequency: 'weekdays',
    color: '#ea580c',
    iconName: 'Zap',
    createdAt: '2026-01-01',
    order: 5,
    isRoutine: true,
    routineTime: 'afternoon',
    difficulty: 'intermediate',
  },
  {
    id: 'habit_reading',
    name: 'Read 20 Pages',
    category: 'mindset',
    description: 'Inspirational or educational reading',
    targetCount: 20,
    unit: 'pages',
    frequency: 'daily',
    color: '#9333ea',
    iconName: 'Book',
    createdAt: '2026-01-01',
    order: 6,
    isRoutine: true,
    routineTime: 'evening',
    difficulty: 'beginner',
  },
  {
    id: 'habit_evening_winddown',
    name: 'Evening Screen-Free Wind Down',
    category: 'health',
    description: 'Lights dimmed and no phones 45 mins before bed',
    targetCount: 1,
    unit: 'routine',
    frequency: 'daily',
    color: '#475569',
    iconName: 'Moon',
    createdAt: '2026-01-01',
    order: 7,
    isRoutine: true,
    routineTime: 'evening',
    difficulty: 'beginner',
  },
];

export interface RoutinePreset {
  id: string;
  title: string;
  badge: string;
  description: string;
  recommendedDailyGoal: number;
  habits: Omit<Habit, 'id' | 'createdAt'>[];
}

export const ROUTINE_PRESETS: RoutinePreset[] = [
  {
    id: 'beginner_starter',
    title: 'Beginner Starter Routine',
    badge: 'Beginner Friendly 🌟',
    description: 'Gentle, foundational habits designed to build daily consistency without overwhelm.',
    recommendedDailyGoal: 4,
    habits: [
      {
        name: 'Morning Devotional & Prayer',
        category: 'faith',
        description: '5-10 mins scripture & morning reflection',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        color: '#6366f1',
        iconName: 'BookOpen',
        order: 1,
        isRoutine: true,
        routineTime: 'morning',
        difficulty: 'beginner',
      },
      {
        name: '15-Minute Piano Warm-up',
        category: 'creativity',
        description: 'Easy hymns or 5-finger technique patterns',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        color: '#0d9488',
        iconName: 'Music',
        order: 2,
        isRoutine: true,
        routineTime: 'morning',
        difficulty: 'beginner',
      },
      {
        name: 'Drink 6-8 Glasses of Water',
        category: 'health',
        description: 'Stay hydrated throughout the day',
        targetCount: 6,
        unit: 'glasses',
        frequency: 'daily',
        color: '#0284c7',
        iconName: 'Droplets',
        order: 3,
        isRoutine: true,
        routineTime: 'anytime',
        difficulty: 'beginner',
      },
      {
        name: '15-Minute Gentle Walk',
        category: 'fitness',
        description: 'Get fresh air and light movement',
        targetCount: 1,
        unit: 'walk',
        frequency: 'daily',
        color: '#16a34a',
        iconName: 'Activity',
        order: 4,
        isRoutine: true,
        routineTime: 'afternoon',
        difficulty: 'beginner',
      },
      {
        name: 'Evening Screen-Free Wind Down',
        category: 'health',
        description: 'Disconnect from screens 30 mins before sleep',
        targetCount: 1,
        unit: 'routine',
        frequency: 'daily',
        color: '#475569',
        iconName: 'Moon',
        order: 5,
        isRoutine: true,
        routineTime: 'evening',
        difficulty: 'beginner',
      },
    ],
  },
  {
    id: 'piano_musician',
    title: 'Pianist & Worship Musician Routine',
    badge: 'Music Focused 🎹',
    description: 'Structured drills for technical growth, hymn mastery, and communion preparation.',
    recommendedDailyGoal: 5,
    habits: [
      {
        name: 'Scales & Arpeggios Warm-Up',
        category: 'creativity',
        description: '10 mins metronome drills across major/minor keys',
        targetCount: 1,
        unit: 'drill',
        frequency: 'daily',
        color: '#0d9488',
        iconName: 'Zap',
        order: 1,
        isRoutine: true,
        routineTime: 'morning',
        difficulty: 'intermediate',
      },
      {
        name: 'Hymn Repertoire Practice',
        category: 'creativity',
        description: '20 mins 4-part harmony voicing and hymn playing',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        color: '#6366f1',
        iconName: 'Music',
        order: 2,
        isRoutine: true,
        routineTime: 'morning',
        difficulty: 'intermediate',
      },
      {
        name: 'Communion & Lord\'s Supper Prep',
        category: 'faith',
        description: '15 mins meditative preludes & offertories',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        color: '#8b5cf6',
        iconName: 'BookOpen',
        order: 3,
        isRoutine: true,
        routineTime: 'afternoon',
        difficulty: 'intermediate',
      },
      {
        name: 'Classical Solo Masterpiece Polish',
        category: 'creativity',
        description: 'Debussy / Chopin / Beethoven phrase polishing',
        targetCount: 1,
        unit: 'piece',
        frequency: 'daily',
        color: '#ea580c',
        iconName: 'Sparkles',
        order: 4,
        isRoutine: true,
        routineTime: 'afternoon',
        difficulty: 'advanced',
      },
      {
        name: 'Sight-Reading New Piece',
        category: 'creativity',
        description: '10 mins fresh sheet music reading',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        color: '#0284c7',
        iconName: 'Book',
        order: 5,
        isRoutine: true,
        routineTime: 'evening',
        difficulty: 'intermediate',
      },
    ],
  },
  {
    id: 'spiritual_devotion',
    title: 'Faith & Spiritual Growth Routine',
    badge: 'Spiritual Life 🙏',
    description: 'Deep scripture study, psalm meditation, gratitude, and worship praise.',
    recommendedDailyGoal: 4,
    habits: [
      {
        name: 'Morning Prayer & Scripture Devotion',
        category: 'faith',
        description: 'Read chapter of the day + silent contemplation',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        color: '#6366f1',
        iconName: 'BookOpen',
        order: 1,
        isRoutine: true,
        routineTime: 'morning',
        difficulty: 'beginner',
      },
      {
        name: 'Read 1 Psalm or Proverb',
        category: 'faith',
        description: 'Midday reflection on God\'s wisdom and promises',
        targetCount: 1,
        unit: 'chapter',
        frequency: 'daily',
        color: '#0d9488',
        iconName: 'Book',
        order: 2,
        isRoutine: true,
        routineTime: 'afternoon',
        difficulty: 'beginner',
      },
      {
        name: 'Praise & Worship Piano Session',
        category: 'creativity',
        description: 'Play 2 favorite hymns of adoration',
        targetCount: 1,
        unit: 'session',
        frequency: 'daily',
        color: '#d97706',
        iconName: 'Music',
        order: 3,
        isRoutine: true,
        routineTime: 'afternoon',
        difficulty: 'beginner',
      },
      {
        name: 'Evening Gratitude & Intercession',
        category: 'faith',
        description: 'Write 3 blessings and pray for family/community',
        targetCount: 1,
        unit: 'prayer',
        frequency: 'daily',
        color: '#475569',
        iconName: 'Moon',
        order: 4,
        isRoutine: true,
        routineTime: 'evening',
        difficulty: 'beginner',
      },
    ],
  },
];

export const INITIAL_PIANO_SONGS: PianoSong[] = [
  // Prelude Pieces (Classical & Worship Preludes)
  {
    id: 'song_rep_1',
    title: 'Clair de Lune',
    composerOrArtist: 'Claude Debussy',
    category: 'prelude',
    difficulty: 'Advanced',
    targetBpm: 56,
    currentBpm: 48,
    keySignature: 'D♭ Major',
    timeSignature: '9/8',
    status: 'learning',
    notes: 'Work on delicate pp voicing in measure 27-36 and arpeggiated flow',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_rep_2',
    title: 'Nocturne in E-flat Major, Op. 9 No. 2',
    composerOrArtist: 'Frédéric Chopin',
    category: 'prelude',
    difficulty: 'Advanced',
    targetBpm: 66,
    currentBpm: 60,
    keySignature: 'E♭ Major',
    timeSignature: '12/8',
    status: 'learning',
    notes: 'Rubato control in the right-hand fiorituras; steady left-hand waltz base',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_rep_3',
    title: 'Moonlight Sonata (1st Mvt - Adagio Sostenuto)',
    composerOrArtist: 'Ludwig van Beethoven',
    category: 'prelude',
    difficulty: 'Intermediate',
    targetBpm: 54,
    currentBpm: 54,
    keySignature: 'C♯ Minor',
    timeSignature: '2/2',
    status: 'learning',
    notes: 'Keep triplet accompaniment subdued while melody sings on top',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_rep_4',
    title: 'Für Elise (Complete Bagatelle)',
    composerOrArtist: 'Ludwig van Beethoven',
    category: 'prelude',
    difficulty: 'Intermediate',
    targetBpm: 120,
    currentBpm: 110,
    keySignature: 'A Minor',
    timeSignature: '3/8',
    status: 'learning',
    notes: 'Middle B section 32nd notes and descending chromatic cadenza',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_rep_5',
    title: 'Prelude in C Major, BWV 846 (WTC I)',
    composerOrArtist: 'Johann Sebastian Bach',
    category: 'prelude',
    difficulty: 'Intermediate',
    targetBpm: 72,
    currentBpm: 72,
    keySignature: 'C Major',
    timeSignature: '4/4',
    status: 'learning',
    notes: 'Even finger articulation with gentle legato, clear harmonic color shifts',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_rep_6',
    title: 'Gymnopédie No. 1',
    composerOrArtist: 'Erik Satie',
    category: 'prelude',
    difficulty: 'Intermediate',
    targetBpm: 66,
    currentBpm: 66,
    keySignature: 'D Major',
    timeSignature: '3/4',
    status: 'learning',
    notes: 'Lent et douloureux - gentle chord pedal changes on beat 1',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_rep_7',
    title: 'Rêverie',
    composerOrArtist: 'Claude Debussy',
    category: 'prelude',
    difficulty: 'Early Advanced',
    targetBpm: 68,
    currentBpm: 58,
    keySignature: 'F Major',
    timeSignature: '4/4',
    status: 'learning',
    notes: 'Triplet against duplet cross-rhythms in measure 15-28',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_rep_8',
    title: 'Waltz in A Minor, B. 150',
    composerOrArtist: 'Frédéric Chopin',
    category: 'prelude',
    difficulty: 'Intermediate',
    targetBpm: 126,
    currentBpm: 112,
    keySignature: 'A Minor',
    timeSignature: '3/4',
    status: 'learning',
    notes: 'Polishing ornamentation turns and expressive rubato dynamic curve',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },

  // Hymns
  {
    id: 'song_hymn_1',
    title: 'Great Is Thy Faithfulness',
    composerOrArtist: 'William M. Runyan / Thomas Chisholm',
    category: 'hymn',
    difficulty: 'Intermediate',
    targetBpm: 84,
    currentBpm: 80,
    keySignature: 'E♭ Major',
    timeSignature: '3/4',
    pageNumberOrHymnNumber: 'Hymn #139',
    status: 'learning',
    notes: 'Rich 4-part harmony voicing and flowing left hand arpeggios for verse 3',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_hymn_2',
    title: 'It Is Well With My Soul',
    composerOrArtist: 'Philip Bliss / Horatio Spafford',
    category: 'hymn',
    difficulty: 'Intermediate',
    targetBpm: 76,
    currentBpm: 72,
    keySignature: 'C Major',
    timeSignature: '4/4',
    pageNumberOrHymnNumber: 'Hymn #493',
    status: 'learning',
    notes: 'Sustained chords, peaceful intro and triumphal final chorus modulation',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_hymn_3',
    title: 'How Great Thou Art',
    composerOrArtist: 'Carl Boberg / Stuart K. Hine',
    category: 'hymn',
    difficulty: 'Early Advanced',
    targetBpm: 80,
    currentBpm: 74,
    keySignature: 'B♭ Major',
    timeSignature: '4/4',
    pageNumberOrHymnNumber: 'Hymn #77',
    status: 'learning',
    notes: 'Concert arrangement with dynamic crescendo into the chorus',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_hymn_4',
    title: 'Amazing Grace (Concert Meditation)',
    composerOrArtist: 'Traditional / arr. Mark Hayes',
    category: 'hymn',
    difficulty: 'Intermediate',
    targetBpm: 68,
    currentBpm: 68,
    keySignature: 'F Major -> G Major',
    timeSignature: '3/4',
    pageNumberOrHymnNumber: 'Hymn #330',
    status: 'learning',
    notes: 'Gently expressive intro with key change transition into majestic finale',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },

  // Lord's Supper Special Music (Communion Preludes & Offertories)
  {
    id: 'song_communion_1',
    title: 'When I Survey the Wondrous Cross',
    composerOrArtist: 'Lowell Mason / Isaac Watts',
    category: 'lords_supper',
    difficulty: 'Intermediate',
    targetBpm: 64,
    currentBpm: 64,
    keySignature: 'F Major',
    timeSignature: '3/4',
    pageNumberOrHymnNumber: 'Communion #182',
    status: 'learning',
    notes: 'Reverent and contemplative tempo; soft pedal on verse 2',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_communion_2',
    title: 'Were You There? (Quiet Communion Prelude)',
    composerOrArtist: 'African American Spiritual / arr. Meditation',
    category: 'lords_supper',
    difficulty: 'Intermediate',
    targetBpm: 58,
    currentBpm: 54,
    keySignature: 'E♭ Major',
    timeSignature: '4/4',
    pageNumberOrHymnNumber: 'Communion #201',
    status: 'learning',
    notes: 'Deep resonant lower octaves; delicate upper register echo on "causes me to tremble"',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_communion_3',
    title: 'Lead Me to Calvary',
    composerOrArtist: 'William J. Kirkpatrick / Jennie E. Hussey',
    category: 'lords_supper',
    difficulty: 'Intermediate',
    targetBpm: 72,
    currentBpm: 68,
    keySignature: 'E♭ Major',
    timeSignature: '4/4',
    pageNumberOrHymnNumber: 'Communion #176',
    status: 'learning',
    notes: 'Lest I forget Gethsemane - soulful phrasing, smooth legato ties',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_communion_4',
    title: 'Jesus Paid It All',
    composerOrArtist: 'John T. Grape / Elvina Hall',
    category: 'lords_supper',
    difficulty: 'Intermediate',
    targetBpm: 70,
    currentBpm: 68,
    keySignature: 'E♭ Major',
    timeSignature: '3/4',
    pageNumberOrHymnNumber: 'Communion #210',
    status: 'learning',
    notes: 'Gentle bell-like chords during distribution of the bread and cup',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },

  // Choir Songs (Anthems & Ensemble Choral Accompaniments)
  {
    id: 'song_choir_1',
    title: 'Total Praise',
    composerOrArtist: 'Richard Smallwood',
    category: 'choir_song',
    difficulty: 'Intermediate',
    targetBpm: 66,
    currentBpm: 62,
    keySignature: 'C Major -> D♭ Major',
    timeSignature: '4/4',
    pageNumberOrHymnNumber: 'Choir Anthem #12',
    status: 'learning',
    notes: 'Choir anthem accompaniment; rich gospel chord voicings and climactic modulation',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_choir_2',
    title: 'The Majesty and Glory of Your Name',
    composerOrArtist: 'Tom Fettke',
    category: 'choir_song',
    difficulty: 'Intermediate',
    targetBpm: 68,
    currentBpm: 68,
    keySignature: 'E♭ Major',
    timeSignature: '4/4',
    pageNumberOrHymnNumber: 'Choir Anthem #04',
    status: 'learning',
    notes: 'When I consider the heavens - delicate starlight intro into full choral crescendo',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_choir_3',
    title: 'For the Beauty of the Earth',
    composerOrArtist: 'John Rutter',
    category: 'choir_song',
    difficulty: 'Early Advanced',
    targetBpm: 92,
    currentBpm: 88,
    keySignature: 'F Major',
    timeSignature: '2/2',
    pageNumberOrHymnNumber: 'Choir Anthem #29',
    status: 'learning',
    notes: 'Lilting pastoral rhythm with crisp right-hand flute counterpoint and light pedal',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
  {
    id: 'song_choir_4',
    title: 'Hallelujah Chorus (Accompaniment)',
    composerOrArtist: 'G.F. Handel',
    category: 'choir_song',
    difficulty: 'Advanced',
    targetBpm: 104,
    currentBpm: 96,
    keySignature: 'D Major',
    timeSignature: '4/4',
    pageNumberOrHymnNumber: 'Choir Special #01',
    status: 'learning',
    notes: 'Crisp orchestral octave leaps and driving baroque rhythmic tempo',
    totalPracticeMinutes: 0,
    timesPracticed: 0,
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  pinEnabled: false,
  pinCode: '',
  theme: 'neutral',
  soundEnabled: true,
  vibrationEnabled: true,
  spreadsheetId: DEFAULT_SPREADSHEET_ID,
  autoLockMinutes: 5,
  dailyHabitGoal: 5,
  notificationsEnabled: false,
  routineReminderTimes: {
    morning: '09:00',
    afternoon: '14:00',
    evening: '19:30',
  },
};

// Seed realistic historical habit completions for the last 30 days so dashboard has meaningful charts immediately
export function generateSeedCompletions(): HabitCompletionRecord[] {
  const records: HabitCompletionRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic completions
    INITIAL_HABITS.forEach((h, index) => {
      // Deterministic completion pattern with high adherence
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      let completed = true;

      if (h.frequency === 'weekdays' && isWeekend) {
        completed = false;
      } else {
        // High consistency (80%-90%)
        const pseudoRandom = Math.sin(i * 13 + index * 7);
        completed = pseudoRandom > -0.65;
      }

      if (completed) {
        records.push({
          habitId: h.id,
          date: dateStr,
          completed: true,
          value: h.targetCount,
          completedAt: `${dateStr}T18:30:00.000Z`,
        });
      }
    });
  }

  return records;
}

export function generateSeedPianoLogs(): PianoPracticeLog[] {
  const logs: PianoPracticeLog[] = [];
  const today = new Date();

  const sessionTemplates = [
    { songId: 'song_rep_1', title: 'Clair de Lune', category: 'repertoire' as const, duration: 25, bpm: 48, measures: 'm. 27-42', rating: 4, notes: 'Polished arpeggio rubato' },
    { songId: 'song_hymn_1', title: 'Great Is Thy Faithfulness', category: 'hymn' as const, duration: 20, bpm: 80, measures: 'Verses 2-3', rating: 5, notes: 'Full chords felt solid' },
    { songId: 'song_communion_1', title: 'When I Survey the Wondrous Cross', category: 'lords_supper' as const, duration: 15, bpm: 64, measures: 'Complete run-through', rating: 5, notes: 'Very reverent touch' },
    { songId: 'song_rep_2', title: 'Nocturne Op. 9 No. 2', category: 'repertoire' as const, duration: 30, bpm: 60, measures: 'm. 13-24 cadenza', rating: 4, notes: 'Right hand fingering clear' },
    { songId: 'song_hymn_2', title: 'It Is Well With My Soul', category: 'hymn' as const, duration: 20, bpm: 72, measures: 'Chorus & key shift', rating: 5, notes: 'Ready for Sunday service' },
    { songId: 'song_communion_2', title: 'Were You There?', category: 'lords_supper' as const, duration: 20, bpm: 54, measures: 'Intro and coda', rating: 4, notes: 'Soft pedal balance worked well' },
    { songId: 'song_rep_4', title: 'Für Elise', category: 'repertoire' as const, duration: 15, bpm: 110, measures: 'B section 32nd notes', rating: 4, notes: 'Tempo up 5 BPM from last week' },
  ];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 2);
    const dateStr = d.toISOString().split('T')[0];
    const template = sessionTemplates[i % sessionTemplates.length];

    logs.push({
      id: `log_${i}_${Date.now()}`,
      songId: template.songId,
      songTitle: template.title,
      category: template.category,
      date: dateStr,
      durationMinutes: template.duration,
      tempoAchievedBpm: template.bpm,
      measuresFocused: template.measures,
      notes: template.notes,
      rating: template.rating,
      timestamp: `${dateStr}T19:15:00.000Z`,
    });
  }

  return logs;
}

// Storage Helpers with SSR and LocalStorage safety
export class LocalStorageManager {
  static getScopedKey(baseKey: string, userId?: string | null): string {
    if (userId && typeof userId === 'string' && userId.trim() !== '') {
      return `${baseKey}_${userId.trim()}`;
    }
    return baseKey;
  }

  static getHabits(userId?: string | null): Habit[] {
    try {
      const key = this.getScopedKey(HABITS_KEY, userId);
      const data = localStorage.getItem(key);
      if (!data) {
        this.saveHabits(INITIAL_HABITS, userId);
        return INITIAL_HABITS;
      }
      const parsed: Habit[] = JSON.parse(data);
      // Ensure all habits have order (1..N) and sorting
      const normalized = parsed.map((h, idx) => ({
        ...h,
        order: typeof h.order === 'number' && h.order >= 1 ? h.order : idx + 1,
        isRoutine: h.isRoutine ?? true,
        routineTime: h.routineTime ?? 'anytime',
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      return normalized;
    } catch {
      return INITIAL_HABITS;
    }
  }

  static saveHabits(habits: Habit[], userId?: string | null) {
    try {
      const key = this.getScopedKey(HABITS_KEY, userId);
      localStorage.setItem(key, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits to localStorage', e);
    }
  }

  static getCompletions(userId?: string | null): HabitCompletionRecord[] {
    try {
      const key = this.getScopedKey(COMPLETIONS_KEY, userId);
      const data = localStorage.getItem(key);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveCompletions(completions: HabitCompletionRecord[], userId?: string | null) {
    try {
      const key = this.getScopedKey(COMPLETIONS_KEY, userId);
      localStorage.setItem(key, JSON.stringify(completions));
    } catch (e) {
      console.error('Failed to save completions to localStorage', e);
    }
  }

  static getPianoSongs(userId?: string | null): PianoSong[] {
    try {
      const key = this.getScopedKey(PIANO_SONGS_KEY, userId);
      const data = localStorage.getItem(key);
      if (!data) {
        return [];
      }
      let songs: PianoSong[] = JSON.parse(data);
      if (!Array.isArray(songs)) {
        return [];
      }
      let modified = false;

      // Migrate category 'repertoire' to 'prelude'
      songs = songs.map((s) => {
        if ((s.category as string) === 'repertoire') {
          modified = true;
          return { ...s, category: 'prelude' as PianoCategory };
        }
        return s;
      });

      if (modified) {
        this.savePianoSongs(songs, userId);
      }
      return songs;
    } catch {
      return [];
    }
  }

  static savePianoSongs(songs: PianoSong[], userId?: string | null) {
    try {
      const key = this.getScopedKey(PIANO_SONGS_KEY, userId);
      localStorage.setItem(key, JSON.stringify(songs));
    } catch (e) {
      console.error('Failed to save piano songs to localStorage', e);
    }
  }

  static getRepertoireCategories(userId?: string | null): RepertoireCategory[] {
    try {
      const key = this.getScopedKey(REPERTOIRE_CATEGORIES_KEY, userId);
      const data = localStorage.getItem(key);
      if (!data) {
        this.saveRepertoireCategories(INITIAL_REPERTOIRE_CATEGORIES, userId);
        return INITIAL_REPERTOIRE_CATEGORIES;
      }
      const parsed: RepertoireCategory[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return INITIAL_REPERTOIRE_CATEGORIES;
      }
      return parsed;
    } catch {
      return INITIAL_REPERTOIRE_CATEGORIES;
    }
  }

  static saveRepertoireCategories(categories: RepertoireCategory[], userId?: string | null) {
    try {
      const key = this.getScopedKey(REPERTOIRE_CATEGORIES_KEY, userId);
      localStorage.setItem(key, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save repertoire categories to localStorage', e);
    }
  }

  static getPianoLogs(userId?: string | null): PianoPracticeLog[] {
    try {
      const key = this.getScopedKey(PIANO_LOGS_KEY, userId);
      const data = localStorage.getItem(key);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static savePianoLogs(logs: PianoPracticeLog[], userId?: string | null) {
    try {
      const key = this.getScopedKey(PIANO_LOGS_KEY, userId);
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save piano logs to localStorage', e);
    }
  }

  static getQuickNotes(userId?: string | null): PracticeQuickNote[] {
    try {
      const key = this.getScopedKey(QUICK_NOTES_KEY, userId);
      const data = localStorage.getItem(key);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  }

  static saveQuickNotes(notes: PracticeQuickNote[], userId?: string | null) {
    try {
      const key = this.getScopedKey(QUICK_NOTES_KEY, userId);
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save quick notes to localStorage', e);
    }
  }

  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) {
        return INITIAL_SETTINGS;
      }
      const parsed = JSON.parse(data);
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        routineReminderTimes: {
          ...INITIAL_SETTINGS.routineReminderTimes!,
          ...(parsed.routineReminderTimes || {}),
        },
      };
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  static getPendingSyncQueue(): Array<{ type: string; payload: unknown; timestamp: string }> {
    try {
      const data = localStorage.getItem(PENDING_SYNC_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static enqueueSyncAction(actionType: string, payload: unknown) {
    try {
      const queue = this.getPendingSyncQueue();
      queue.push({
        type: actionType,
        payload,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to queue sync action', e);
    }
  }

  static clearSyncQueue() {
    try {
      localStorage.removeItem(PENDING_SYNC_KEY);
    } catch {}
  }

  static hasSeenWelcome(): boolean {
    try {
      return localStorage.getItem(HAS_SEEN_WELCOME_KEY) === 'true';
    } catch {
      return false;
    }
  }

  static setHasSeenWelcome(seen: boolean = true) {
    try {
      localStorage.setItem(HAS_SEEN_WELCOME_KEY, String(seen));
    } catch (e) {
      console.error('Failed to save hasSeenWelcome flag', e);
    }
  }

  static resetWelcome() {
    try {
      localStorage.removeItem(HAS_SEEN_WELCOME_KEY);
    } catch {}
  }
}
