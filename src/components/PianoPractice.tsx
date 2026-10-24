import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  BookOpen,
  Church,
  Users,
  BarChart3,
  Award,
  Layers,
  Settings2,
  Activity,
  Zap,
  Target,
  ArrowRight,
  StickyNote,
  Pin,
  Copy,
  Check,
} from 'lucide-react';
import {
  PianoSong,
  PianoPracticeLog,
  PianoCategory,
  SongStatus,
  RepertoireCategory,
  PracticeQuickNote,
} from '../types';
import { soundService } from '../services/audio';
import { PianoPracticeCharts } from './PianoPracticeCharts';
import {
  CategoryManagerModal,
  renderCategoryIcon,
} from './CategoryManagerModal';
import { INITIAL_REPERTOIRE_CATEGORIES } from '../services/storage';

interface PianoPracticeProps {
  songs: PianoSong[];
  logs: PianoPracticeLog[];
  quickNotes?: PracticeQuickNote[];
  categories?: RepertoireCategory[];
  navTab?: 'repertoire' | 'history' | 'analytics';
  onSelectNavTab?: (tab: 'repertoire' | 'history' | 'analytics') => void;
  onOpenTimer: (songId?: string) => void;
  onOpenQuickNotes?: (songId?: string) => void;
  onDeleteQuickNote?: (id: string) => void;
  onTogglePinQuickNote?: (id: string) => void;
  onAddSong: (song: Omit<PianoSong, 'id' | 'createdAt'>) => void;
  onUpdateSong: (song: PianoSong) => void;
  onDeleteSong: (songId: string) => void;
  onAddManualLog: (log: Omit<PianoPracticeLog, 'id' | 'timestamp'>) => void;
  onAddCategory?: (category: RepertoireCategory) => void;
  onUpdateCategory?: (category: RepertoireCategory) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onReorderCategories?: (categories: RepertoireCategory[]) => void;
  onResetCategories?: () => void;
}

export function PianoPractice({
  songs,
  logs,
  quickNotes = [],
  categories = INITIAL_REPERTOIRE_CATEGORIES,
  navTab = 'repertoire',
  onSelectNavTab,
  onOpenTimer,
  onOpenQuickNotes,
  onDeleteQuickNote,
  onTogglePinQuickNote,
  onAddSong,
  onUpdateSong,
  onDeleteSong,
  onAddManualLog,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onResetCategories,
}: PianoPracticeProps) {
  const initialCategory = categories[0]?.id || 'prelude';
  const [activeTab, setActiveTab] = useState<string>(
    navTab === 'analytics' ? 'analytics' : navTab === 'history' ? 'history' : initialCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [historySubTab, setHistorySubTab] = useState<'sessions' | 'quick_notes'>('sessions');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Keep internal activeTab synchronized whenever navTab prop updates from Navbar
  useEffect(() => {
    if (navTab === 'analytics') {
      setActiveTab('analytics');
    } else if (navTab === 'history') {
      setActiveTab('history');
    } else if (navTab === 'repertoire') {
      if (activeTab === 'analytics' || activeTab === 'history') {
        setActiveTab(categories[0]?.id || 'prelude');
      }
    }
  }, [navTab, categories]);

  // Tab selection handler ensuring two-way sync
  const handleSelectTab = (tabId: string) => {
    soundService.playSlideClick();
    setActiveTab(tabId);
    if (tabId === 'analytics') {
      onSelectNavTab?.('analytics');
    } else if (tabId === 'history') {
      onSelectNavTab?.('history');
    } else {
      onSelectNavTab?.('repertoire');
    }
  };

  // Modals
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<PianoSong | null>(null);
  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Form states for creating/editing a song
  const [formTitle, setFormTitle] = useState('');
  const [formComposer, setFormComposer] = useState('');
  const [formCategory, setFormCategory] = useState<string>(initialCategory);
  const [formStatus, setFormStatus] = useState<SongStatus>('learning');
  const [formPageNo, setFormPageNo] = useState('');
  const [formKeySig, setFormKeySig] = useState('');
  const [formTargetBpm, setFormTargetBpm] = useState<number>(80);
  const [formCurrentBpm, setFormCurrentBpm] = useState<number>(60);
  const [formNotes, setFormNotes] = useState('');

  // Form states for manual practice log
  const [logSongId, setLogSongId] = useState('');
  const [logMinutes, setLogMinutes] = useState<number>(20);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logNotes, setLogNotes] = useState('');
  const [logBpm, setLogBpm] = useState<number>(60);
  const [logMeasures, setLogMeasures] = useState('');

  // Fallback category handlers if not passed from parent
  const [localCategories, setLocalCategories] = useState<RepertoireCategory[]>(categories);
  const activeCategoriesList = categories.length > 0 ? categories : localCategories;

  const handleCategoryAdd = (cat: RepertoireCategory) => {
    if (onAddCategory) {
      onAddCategory(cat);
    } else {
      setLocalCategories((prev) => [...prev, cat]);
    }
  };

  const handleCategoryUpdate = (cat: RepertoireCategory) => {
    if (onUpdateCategory) {
      onUpdateCategory(cat);
    } else {
      setLocalCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    }
  };

  const handleCategoryDelete = (catId: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(catId);
    } else {
      setLocalCategories((prev) => prev.filter((c) => c.id !== catId));
    }
    if (activeTab === catId) {
      setActiveTab(activeCategoriesList[0]?.id || 'prelude');
    }
  };

  const handleCategoryReorder = (newCats: RepertoireCategory[]) => {
    if (onReorderCategories) {
      onReorderCategories(newCats);
    } else {
      setLocalCategories(newCats);
    }
  };

  const handleCategoryReset = () => {
    if (onResetCategories) {
      onResetCategories();
    } else {
      setLocalCategories(INITIAL_REPERTOIRE_CATEGORIES);
    }
  };

  // Find active category object
  const currentActiveCategoryObj = useMemo(() => {
    return activeCategoriesList.find((c) => c.id === activeTab);
  }, [activeCategoriesList, activeTab]);

  const handleOpenCreate = (categoryToUse?: string) => {
    const targetCat = categoryToUse || (activeTab !== 'analytics' && activeTab !== 'history' ? activeTab : activeCategoriesList[0]?.id || 'prelude');
    setEditingSong(null);
    setFormTitle('');
    setFormComposer('');
    setFormCategory(targetCat);
    setFormStatus('learning');
    setFormPageNo('');
    setFormKeySig('');
    setFormTargetBpm(80);
    setFormCurrentBpm(60);
    setFormNotes('');
    setIsSongModalOpen(true);
  };

  const handleOpenEdit = (song: PianoSong) => {
    setEditingSong(song);
    setFormTitle(song.title);
    setFormComposer(song.composerOrArtist);
    setFormCategory(song.category);
    setFormStatus(song.status);
    setFormPageNo(song.pageNumberOrHymnNumber || '');
    setFormKeySig(song.keySignature || '');
    setFormTargetBpm(song.targetBpm || 80);
    setFormCurrentBpm(song.currentBpm || 60);
    setFormNotes(song.notes || '');
    setIsSongModalOpen(true);
  };

  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingSong) {
      onUpdateSong({
        ...editingSong,
        title: formTitle.trim(),
        composerOrArtist: formComposer.trim(),
        category: formCategory,
        status: formStatus,
        pageNumberOrHymnNumber: formPageNo.trim() || undefined,
        keySignature: formKeySig.trim() || undefined,
        targetBpm: formTargetBpm,
        currentBpm: formCurrentBpm,
        notes: formNotes.trim() || undefined,
      });
    } else {
      onAddSong({
        title: formTitle.trim(),
        composerOrArtist: formComposer.trim() || 'Unknown',
        category: formCategory,
        status: formStatus,
        pageNumberOrHymnNumber: formPageNo.trim() || undefined,
        keySignature: formKeySig.trim() || undefined,
        targetBpm: formTargetBpm,
        currentBpm: formCurrentBpm,
        totalPracticeMinutes: 0,
        timesPracticed: 0,
        notes: formNotes.trim() || undefined,
      });
    }

    setIsSongModalOpen(false);
    soundService.playHabitComplete();
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const song = songs.find((s) => s.id === logSongId);
    if (!song) return;

    onAddManualLog({
      songId: song.id,
      songTitle: song.title,
      category: song.category,
      durationMinutes: logMinutes,
      date: logDate,
      tempoAchievedBpm: logBpm || undefined,
      measuresFocused: logMeasures || undefined,
      notes: logNotes || undefined,
    });

    setIsManualLogModalOpen(false);
    soundService.playHabitComplete();
  };

  // Filter pieces by active category, status, and search query
  const filteredSongs = useMemo(() => {
    if (activeTab === 'history' || activeTab === 'analytics') return [];

    return songs.filter((s) => {
      let matchesCat = false;
      if (activeTab === 'prelude') {
        matchesCat = s.category === 'prelude' || (s.category as string) === 'repertoire';
      } else {
        matchesCat = s.category === activeTab;
      }

      if (!matchesCat) return false;

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(q) ||
        s.composerOrArtist.toLowerCase().includes(q) ||
        (s.pageNumberOrHymnNumber && s.pageNumberOrHymnNumber.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [songs, activeTab, statusFilter, searchQuery]);

  // Total practice metrics
  const totalPracticeHours = useMemo(() => {
    const mins = songs.reduce((sum, s) => sum + (s.totalPracticeMinutes || 0), 0);
    return (mins / 60).toFixed(1);
  }, [songs]);

  const getStatusBadge = (status: SongStatus) => {
    switch (status) {
      case 'learning':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 font-semibold border border-amber-500/30">
            Learning Notes
          </span>
        );
      case 'practicing':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-500/30">
            Practicing
          </span>
        );
      case 'polishing':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-fuchsia-950/80 text-fuchsia-300 font-semibold border border-fuchsia-500/30">
            Polishing
          </span>
        );
      case 'mastered':
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Mastered
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#2D1A36] text-[#DDD8E2] border border-[#4D2B5B]">
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-serif text-white tracking-wide uppercase">
              Piano Repertoire &amp; Service Music
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#B63E88] text-white font-bold uppercase tracking-wider shadow-sm">
              Live Tracker
            </span>
          </div>

          {/* Dynamic Category Counts Summary */}
          <div className="flex items-center gap-2 text-xs text-[#DDD8E2] mt-1 flex-wrap">
            {activeCategoriesList.map((cat, idx) => {
              const count = songs.filter(
                (s) => s.category === cat.id || (cat.id === 'prelude' && (s.category as string) === 'repertoire')
              ).length;
              return (
                <React.Fragment key={cat.id}>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <strong className="text-white font-bold">{count}</strong> {cat.name}
                  </span>
                  {idx < activeCategoriesList.length - 1 && <span className="text-[#DE72B5]/60">•</span>}
                </React.Fragment>
              );
            })}
            <span className="text-[#DE72B5]/60">•</span>
            <span className="text-[#FFBBE2] font-semibold">{totalPracticeHours} hrs logged</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Quick Note Slide-over/Modal Trigger */}
          {onOpenQuickNotes && (
            <button
              id="open-quick-notes-header-btn"
              onClick={() => {
                soundService.playSlideClick();
                onOpenQuickNotes();
              }}
              className="majestic-btn-secondary px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-transform active:scale-95 text-amber-200 border-amber-500/40"
              title="Open Practice Quick Notes & Thoughts"
            >
              <StickyNote className="w-4 h-4 text-amber-300" />
              <span>Quick Note</span>
              {quickNotes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#B63E88] text-white text-[10px] font-bold">
                  {quickNotes.length}
                </span>
              )}
            </button>
          )}

          <button
            id="manage-categories-header-btn"
            onClick={() => {
              soundService.playSlideClick();
              setIsCategoryManagerOpen(true);
            }}
            className="majestic-btn-secondary px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-transform active:scale-95 text-[#FFBBE2]"
            title="Add or Customize Repertoire Categories"
          >
            <Layers className="w-4 h-4 text-[#DE72B5]" />
            <span>Categories ({activeCategoriesList.length})</span>
          </button>

          <button
            id="start-practice-timer-btn"
            onClick={() => onOpenTimer()}
            className="flex-1 sm:flex-none majestic-btn-silver px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Clock className="w-4 h-4 stroke-[2.5] text-[#1D0F22]" />
            Practice Timer
          </button>

          <button
            id="manual-log-btn"
            onClick={() => {
              setLogSongId(songs[0]?.id || '');
              setIsManualLogModalOpen(true);
            }}
            className="majestic-btn-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log Session
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar with Dynamic Categories */}
      <div className="flex items-center justify-between gap-3 border-b border-[#DE72B5]/20 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#2D1A36]/80 border border-[#B63E88]/30 overflow-x-auto max-w-full shadow-inner">
          {/* Dynamic Category Buttons */}
          {activeCategoriesList.map((cat) => {
            const count = songs.filter(
              (s) => s.category === cat.id || (cat.id === 'prelude' && (s.category as string) === 'repertoire')
            ).length;
            const isTabActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                id={`tab-${cat.id}-btn`}
                onClick={() => handleSelectTab(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                  isTabActive
                    ? 'majestic-btn-primary font-bold shadow-md'
                    : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
                }`}
              >
                {renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}

          {/* Analytics / Progress Charts Tab */}
          <button
            id="tab-analytics-btn"
            onClick={() => handleSelectTab('analytics')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'majestic-btn-primary font-bold shadow-md ring-1 ring-[#DE72B5]/50'
                : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#DE72B5]" />
            <span>Progress &amp; Charts</span>
          </button>

          {/* History / Logs Tab */}
          <button
            id="tab-history-btn"
            onClick={() => handleSelectTab('history')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'majestic-btn-primary font-bold shadow-md'
                : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Practice Logs ({logs.length})</span>
          </button>

          {/* + Add Category Button right in the tab bar */}
          <button
            id="manage-categories-tab-btn"
            onClick={() => {
              soundService.playSlideClick();
              setIsCategoryManagerOpen(true);
            }}
            title="Add 2 or more custom categories or edit existing ones"
            className="px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 bg-[#40234D]/80 hover:bg-[#552F66] text-[#FFBBE2] hover:text-white border border-[#DE72B5]/40 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#DE72B5]" />
            <span>+ Category</span>
          </button>
        </div>

        {/* Right Tab Context Actions */}
        {activeTab !== 'history' && activeTab !== 'analytics' && (
          <div className="flex items-center gap-2">
            {/* Quick Category Settings / Edit */}
            {currentActiveCategoryObj && (
              <button
                id="edit-current-category-btn"
                onClick={() => {
                  soundService.playSlideClick();
                  setIsCategoryManagerOpen(true);
                }}
                title={`Edit "${currentActiveCategoryObj.name}" settings`}
                className="p-2 rounded-xl bg-[#2D1A36] hover:bg-[#40234D] text-[#DDD8E2] hover:text-white border border-[#4D2B5B] transition-colors text-xs flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#DE72B5]" />
                <span className="hidden sm:inline">Category Settings</span>
              </button>
            )}

            <button
              id="add-song-to-tab-btn"
              onClick={() => handleOpenCreate(activeTab)}
              className="majestic-btn-secondary px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#DE72B5]" />
              <span>
                Add {currentActiveCategoryObj ? currentActiveCategoryObj.name.replace(/s$/, '') : 'Repertoire'} Piece
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Progress & Charts Quick Summary Banner (Visible on Repertoire Tabs) */}
      {activeTab !== 'history' && activeTab !== 'analytics' && (
        <div className="majestic-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#DE72B5]/25 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#4A1037] border border-[#DE72B5]/40 flex items-center justify-center text-white shrink-0 shadow-md">
              <TrendingUp className="w-5 h-5 text-[#FFBBE2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-serif tracking-wide">
                  Practice Progress &amp; Mastery Overview
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DE72B5]/20 text-[#FFBBE2] font-semibold">
                  {songs.filter((s) => s.status === 'mastered').length} / {songs.length} Mastered
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#DDD8E2] mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#DE72B5]" />
                  <strong className="text-white">{totalPracticeHours} hrs</strong> total logged
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#C7A252]" />
                  <strong className="text-white">{logs.length}</strong> sessions recorded
                </span>
                <span>•</span>
                <span className="text-[#DE72B5]">
                  Avg Tempo:{' '}
                  <strong className="text-white">
                    {songs.length > 0
                      ? Math.round(songs.reduce((acc, s) => acc + (s.currentBpm || 60), 0) / songs.length)
                      : 60}{' '}
                    BPM
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <button
            id="view-full-analytics-banner-btn"
            onClick={() => handleSelectTab('analytics')}
            className="majestic-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shrink-0"
            title="Open comprehensive progress and tempo charts"
          >
            <BarChart3 className="w-4 h-4 text-white" />
            <span>View Full Progress &amp; Charts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar for Piece Lists */}
      {activeTab !== 'history' && activeTab !== 'analytics' && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#B8A9C2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="piano-search-input"
              type="text"
              placeholder={`Search in ${currentActiveCategoryObj?.name || 'pieces'}, composers, hymn numbers...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2D1A36]/90 border border-[#B63E88]/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8F7F94] focus:outline-none focus:border-[#DE72B5] shadow-inner"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['all', 'learning', 'practicing', 'polishing', 'mastered'].map((st) => (
              <button
                key={st}
                id={`status-filter-${st}`}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs rounded-xl capitalize font-medium transition-all ${
                  statusFilter === st
                    ? 'majestic-btn-primary font-bold text-xs'
                    : 'bg-[#2D1A36] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Analytics & Comprehensive Practice Charts */}
      {activeTab === 'analytics' && (
        <PianoPracticeCharts
          songs={songs}
          logs={logs}
          categories={activeCategoriesList}
          onOpenTimer={onOpenTimer}
        />
      )}

      {/* VIEW: Chronological Practice History & Quick Notes Feed */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Sub-tab toggle: Sessions vs Quick Notes */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#2D1A36]/80 border border-[#B63E88]/30 shadow-inner">
              <button
                id="history-subtab-sessions-btn"
                onClick={() => {
                  soundService.playSlideClick();
                  setHistorySubTab('sessions');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  historySubTab === 'sessions'
                    ? 'majestic-btn-primary font-bold shadow-sm'
                    : 'text-[#B8A9C2] hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Practice Sessions ({logs.length})</span>
              </button>

              <button
                id="history-subtab-quicknotes-btn"
                onClick={() => {
                  soundService.playSlideClick();
                  setHistorySubTab('quick_notes');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  historySubTab === 'quick_notes'
                    ? 'majestic-btn-primary font-bold shadow-sm'
                    : 'text-amber-200 hover:text-white'
                }`}
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-300" />
                <span>Quick Notes Feed ({quickNotes.length})</span>
              </button>
            </div>

            {/* Quick Action Button for the active sub-tab */}
            {historySubTab === 'sessions' ? (
              <button
                onClick={() => {
                  setLogSongId(songs[0]?.id || '');
                  setIsManualLogModalOpen(true);
                }}
                className="majestic-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Log New Session
              </button>
            ) : (
              onOpenQuickNotes && (
                <button
                  onClick={() => {
                    soundService.playSlideClick();
                    onOpenQuickNotes();
                  }}
                  className="majestic-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Capture Quick Note
                </button>
              )
            )}
          </div>

          {/* Sub-view: Practice Logs */}
          {historySubTab === 'sessions' && (
            <div className="space-y-2.5">
              {logs.map((log) => {
                const catObj = activeCategoriesList.find((c) => c.id === log.category);
                const catName = catObj ? catObj.name : log.category.replace('_', ' ');
                const catColor = catObj ? catObj.color : '#B63E88';

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl majestic-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm border border-white/20"
                        style={{ backgroundColor: catColor }}
                      >
                        {renderCategoryIcon(catObj?.iconName, 'w-4 h-4')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-serif">{log.songTitle}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#40234D] text-[#FFBBE2] uppercase font-bold border border-[#DE72B5]/30">
                            {catName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#DDD8E2] mt-0.5">
                          <span>{log.date}</span>
                          <span>•</span>
                          <span className="text-[#DE72B5] font-bold">{log.durationMinutes} mins</span>
                          {log.tempoAchievedBpm && <span>• {log.tempoAchievedBpm} BPM</span>}
                          {log.measuresFocused && <span>• {log.measuresFocused}</span>}
                        </div>
                        {log.notes && <p className="text-xs text-[#DDD8E2] mt-1.5 italic">"{log.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onOpenTimer(log.songId)}
                        className="majestic-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Practice Again
                      </button>
                    </div>
                  </div>
                );
              })}

              {logs.length === 0 && (
                <div className="text-center py-16 majestic-card rounded-3xl space-y-3">
                  <Calendar className="w-10 h-10 mx-auto text-[#DE72B5]/40" />
                  <h4 className="text-base font-bold text-white font-serif">No practice sessions logged yet</h4>
                  <p className="text-xs text-[#DDD8E2]">
                    Use the Practice Timer or log a session manually to track your musical growth.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sub-view: Quick Notes Feed */}
          {historySubTab === 'quick_notes' && (
            <div className="space-y-3">
              {quickNotes.length === 0 ? (
                <div className="text-center py-16 majestic-card rounded-3xl space-y-3">
                  <StickyNote className="w-10 h-10 mx-auto text-[#DE72B5]/40" />
                  <h4 className="text-base font-bold text-white font-serif">No quick practice notes yet</h4>
                  <p className="text-xs text-[#DDD8E2] max-w-sm mx-auto">
                    Capture ephemeral fingering tips, measure reminders, and teacher notes without creating a full practice session.
                  </p>
                  {onOpenQuickNotes && (
                    <button
                      onClick={() => onOpenQuickNotes()}
                      className="majestic-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Quick Note
                    </button>
                  )}
                </div>
              ) : (
                quickNotes
                  .sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                  })
                  .map((note) => {
                    const isCopied = copiedNoteId === note.id;
                    const dateFormatted = new Date(note.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={note.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          note.pinned
                            ? 'bg-gradient-to-r from-[#2E1537] to-[#25102E] border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                            : 'majestic-card border-[#DE72B5]/20 hover:border-[#DE72B5]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            {note.pinned && (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                                <Pin className="w-2.5 h-2.5 fill-amber-400" />
                                Pinned
                              </span>
                            )}
                            {note.songTitle ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B63E88]/20 border border-[#DE72B5]/30 text-xs font-semibold text-[#F1B8DF]">
                                <Music className="w-3 h-3 text-[#DE72B5]" />
                                <span>{note.songTitle}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#A594B0] font-medium">General Thought</span>
                            )}
                            <span className="text-[10px] text-[#8E7E9A]">• {dateFormatted}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {note.songId && (
                              <button
                                onClick={() => onOpenTimer(note.songId)}
                                className="p-1.5 rounded-lg text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47] transition-colors"
                                title="Practice this piece"
                              >
                                <Play className="w-3.5 h-3.5 text-[#DE72B5] fill-current" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                soundService.playSlideClick();
                                const text = note.songTitle ? `[${note.songTitle}] ${note.text}` : note.text;
                                navigator.clipboard.writeText(text);
                                setCopiedNoteId(note.id);
                                setTimeout(() => setCopiedNoteId(null), 2000);
                              }}
                              className="p-1.5 rounded-lg text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47] transition-colors"
                              title="Copy note text"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {onTogglePinQuickNote && (
                              <button
                                onClick={() => {
                                  soundService.playSlideClick();
                                  onTogglePinQuickNote(note.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  note.pinned
                                    ? 'text-amber-400 hover:text-amber-200'
                                    : 'text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47]'
                                }`}
                                title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {onDeleteQuickNote && (
                              <button
                                onClick={() => {
                                  soundService.playSlideClick();
                                  onDeleteQuickNote(note.id);
                                }}
                                className="p-1.5 rounded-lg text-[#B8A9C2] hover:text-rose-400 hover:bg-rose-900/30 transition-colors"
                                title="Delete note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#F0EBF2] leading-relaxed whitespace-pre-wrap">
                          {note.text}
                        </p>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-[#DE72B5]/10">
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-[#180B1C] text-[#D8C4E0] border border-[#482855]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW: Repertoire Grid for Active Category Tab */}
      {activeTab !== 'history' && activeTab !== 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSongs.map((song) => {
              const bpmPct =
                song.targetBpm && song.currentBpm
                  ? Math.min(100, Math.round((song.currentBpm / song.targetBpm) * 100))
                  : 0;

              const catObj = activeCategoriesList.find((c) => c.id === song.category);
              const catColor = catObj ? catObj.color : '#B63E88';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  key={song.id}
                  className="majestic-card rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-[#DE72B5]/50 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Header line: Page # & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm border border-white/20"
                          style={{ backgroundColor: catColor }}
                        >
                          {renderCategoryIcon(catObj?.iconName, 'w-3 h-3')}
                        </div>
                        {song.pageNumberOrHymnNumber ? (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#40234D] text-[#FFBBE2] font-bold border border-[#DE72B5]/30">
                            {song.pageNumberOrHymnNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#40234D] text-[#FFBBE2] font-bold border border-[#DE72B5]/30 capitalize">
                            {catObj?.name || song.category}
                          </span>
                        )}
                        {song.keySignature && (
                          <span className="text-[11px] text-[#DDD8E2] bg-[#1D0F22] px-2 py-0.5 rounded-md border border-[#4D2B5B]">
                            {song.keySignature}
                          </span>
                        )}
                      </div>
                      {getStatusBadge(song.status)}
                    </div>

                    {/* Title & Composer */}
                    <div>
                      <h3 className="text-base font-bold text-white font-serif group-hover:text-[#FFBBE2] transition-colors leading-snug">
                        {song.title}
                      </h3>
                      <p className="text-xs text-[#DDD8E2] mt-0.5">{song.composerOrArtist}</p>
                    </div>

                    {/* Tempo and Speed Progress Bar */}
                    {song.targetBpm ? (
                      <div className="space-y-1.5 bg-[#1D0F22]/70 p-3 rounded-2xl border border-[#4D2B5B]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#DDD8E2] font-medium flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-[#DE72B5]" />
                            Tempo Progress:
                          </span>
                          <span className="font-mono font-bold text-white">
                            {song.currentBpm || 60} <span className="text-[#B8A9C2]">/ {song.targetBpm} BPM</span> ({bpmPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#2D1A36] h-2 rounded-full overflow-hidden border border-[#4D2B5B]">
                          <div
                            className="h-full bg-gradient-to-r from-[#B63E88] to-[#DE72B5] rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${bpmPct}%` }}
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* Practice Notes */}
                    {song.notes && (
                      <div className="p-2.5 rounded-xl bg-[#1D0F22]/60 border border-[#DE72B5]/20 text-xs text-[#DDD8E2] italic leading-relaxed">
                        "{song.notes}"
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div className="pt-3 border-t border-[#DE72B5]/20 flex items-center justify-between text-xs">
                    <div className="text-[#DDD8E2] flex items-center gap-3">
                      <span className="font-mono font-bold text-white">
                        {Math.round((song.totalPracticeMinutes || 0))}m
                      </span>
                      <span>•</span>
                      <span>{song.timesPracticed || 0} sessions</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenQuickNotes && (
                        <button
                          id={`quick-note-song-${song.id}`}
                          onClick={() => {
                            soundService.playSlideClick();
                            onOpenQuickNotes(song.id);
                          }}
                          title="Capture Quick Note for this piece"
                          className="p-2 rounded-xl bg-[#40234D] hover:bg-[#552F66] text-amber-300 hover:text-amber-200 transition-colors border border-[#DE72B5]/25 flex items-center gap-1 text-xs"
                        >
                          <StickyNote className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        id={`edit-song-${song.id}`}
                        onClick={() => handleOpenEdit(song)}
                        title="Edit piece"
                        className="p-2 rounded-xl bg-[#40234D] hover:bg-[#552F66] text-[#FFBBE2] hover:text-white transition-colors border border-[#DE72B5]/25"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`delete-song-${song.id}`}
                        onClick={() => {
                          if (confirm(`Delete "${song.title}" from your repertoire?`)) {
                            onDeleteSong(song.id);
                            soundService.playSlideClick();
                          }
                        }}
                        title="Delete piece"
                        className="p-2 rounded-xl bg-[#40234D] hover:bg-rose-950/60 text-[#B8A9C2] hover:text-rose-300 transition-colors border border-[#DE72B5]/25"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`play-song-timer-${song.id}`}
                        onClick={() => onOpenTimer(song.id)}
                        className="majestic-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Practice
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredSongs.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-16 majestic-card rounded-3xl space-y-3">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md border border-white/20"
                style={{ backgroundColor: currentActiveCategoryObj?.color || '#B63E88' }}
              >
                {renderCategoryIcon(currentActiveCategoryObj?.iconName, 'w-6 h-6')}
              </div>
              <h4 className="text-base font-bold text-white font-serif">No pieces found</h4>
              <p className="text-xs text-[#DDD8E2]">
                {searchQuery
                  ? `No pieces match your search "${searchQuery}".`
                  : `You don't have any ${currentActiveCategoryObj?.name || activeTab} pieces registered yet.`}
              </p>
              <button
                onClick={() => handleOpenCreate(activeTab)}
                className="majestic-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                Add First Piece to {currentActiveCategoryObj?.name || 'Repertoire'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={activeCategoriesList}
        songs={songs}
        onAddCategory={handleCategoryAdd}
        onUpdateCategory={handleCategoryUpdate}
        onDeleteCategory={handleCategoryDelete}
        onReorderCategories={handleCategoryReorder}
        onResetCategories={handleCategoryReset}
      />

      {/* Create / Edit Song Modal */}
      {isSongModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0513]/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg majestic-card rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
            <h3 className="text-xl font-black text-white font-serif tracking-wide mb-4 uppercase">
              {editingSong ? 'Edit Repertoire Piece' : 'Add New Repertoire Piece'}
            </h3>

            <form onSubmit={handleSaveSong} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Piece / Song Title *</label>
                <input
                  id="song-form-title"
                  type="text"
                  required
                  placeholder="e.g. Clair de Lune, Great Is Thy Faithfulness"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Composer / Arranger</label>
                  <input
                    id="song-form-composer"
                    type="text"
                    placeholder="e.g. Debussy, W. Runyan"
                    value={formComposer}
                    onChange={(e) => setFormComposer(e.target.value)}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Category *</label>
                  <select
                    id="song-form-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  >
                    {activeCategoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Status</label>
                  <select
                    id="song-form-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as SongStatus)}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  >
                    <option value="learning">Learning Notes</option>
                    <option value="practicing">Practicing</option>
                    <option value="polishing">Polishing</option>
                    <option value="mastered">Mastered</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Page / Hymn #</label>
                  <input
                    id="song-form-page-no"
                    type="text"
                    placeholder="e.g. Hymn #43"
                    value={formPageNo}
                    onChange={(e) => setFormPageNo(e.target.value)}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Key Signature</label>
                  <input
                    id="song-form-key"
                    type="text"
                    placeholder="e.g. Db Major, G minor"
                    value={formKeySig}
                    onChange={(e) => setFormKeySig(e.target.value)}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Current BPM</label>
                  <input
                    id="song-form-cur-bpm"
                    type="number"
                    value={formCurrentBpm}
                    onChange={(e) => setFormCurrentBpm(Number(e.target.value))}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Target BPM</label>
                  <input
                    id="song-form-target-bpm"
                    type="number"
                    value={formTargetBpm}
                    onChange={(e) => setFormTargetBpm(Number(e.target.value))}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Practice Notes / Focus Points</label>
                <textarea
                  id="song-form-notes"
                  rows={2}
                  placeholder="e.g. Focus on soft pedaling in verse 2 and smooth trill in measure 34"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5] resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSongModalOpen(false)}
                  className="flex-1 py-2.5 majestic-btn-secondary text-xs rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="save-song-submit-btn"
                  type="submit"
                  className="flex-1 py-2.5 majestic-btn-primary font-bold text-xs rounded-xl shadow-lg active:scale-95"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Practice Entry Modal */}
      {isManualLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0513]/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md majestic-card rounded-3xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold text-white font-serif tracking-wide mb-4 uppercase">
              Log Practice Session Manually
            </h3>

            <form onSubmit={handleSaveManualLog} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Select Piece / Hymn</label>
                <select
                  id="manual-log-song-select"
                  value={logSongId}
                  onChange={(e) => setLogSongId(e.target.value)}
                  className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                >
                  {songs.map((s) => {
                    const catObj = activeCategoriesList.find((c) => c.id === s.category);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.title} ({catObj?.name || s.category})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Duration (Minutes)</label>
                  <input
                    id="manual-log-duration"
                    type="number"
                    required
                    min={1}
                    value={logMinutes}
                    onChange={(e) => setLogMinutes(Number(e.target.value))}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Date</label>
                  <input
                    id="manual-log-date"
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Tempo Achieved (BPM)</label>
                  <input
                    id="manual-log-bpm"
                    type="number"
                    value={logBpm}
                    onChange={(e) => setLogBpm(Number(e.target.value))}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Measures Practiced</label>
                  <input
                    id="manual-log-measures"
                    type="text"
                    placeholder="e.g. m. 20-40"
                    value={logMeasures}
                    onChange={(e) => setLogMeasures(e.target.value)}
                    className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#DDD8E2] block mb-1">Session Notes</label>
                <textarea
                  id="manual-log-notes"
                  rows={2}
                  placeholder="e.g., Felt comfortable with the left-hand waltz pattern"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full bg-[#1D0F22] border border-[#B63E88]/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5] resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualLogModalOpen(false)}
                  className="flex-1 py-2.5 majestic-btn-secondary font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  id="manual-log-submit-btn"
                  type="submit"
                  className="flex-1 py-2.5 majestic-btn-primary font-bold text-xs rounded-xl shadow-lg active:scale-95"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
