import React, { useState, useMemo } from 'react';
import {
  X,
  StickyNote,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Copy,
  Check,
  Search,
  Music,
  Clock,
  Edit2,
  Tag,
  Sparkles,
} from 'lucide-react';
import { PianoSong, PracticeQuickNote, RepertoireCategory } from '../types';
import { soundService } from '../services/audio';

interface QuickNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickNotes: PracticeQuickNote[];
  songs: PianoSong[];
  categories: RepertoireCategory[];
  onAddNote: (note: Omit<PracticeQuickNote, 'id' | 'timestamp'>) => void;
  onUpdateNote: (note: PracticeQuickNote) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpenTimerForSong?: (songId: string) => void;
  initialSongId?: string;
}

const COMMON_TAGS = [
  'Fingering',
  'Pedal',
  'Tempo',
  'Measures',
  'Dynamics',
  'Technique',
  'Memory',
  'Teacher Note',
];

export function QuickNotesModal({
  isOpen,
  onClose,
  quickNotes,
  songs,
  categories,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  onOpenTimerForSong,
  initialSongId,
}: QuickNotesModalProps) {
  // Input state
  const [newText, setNewText] = useState('');
  const [selectedSongId, setSelectedSongId] = useState<string>(initialSongId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTag, setShowCustomTag] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterSongId, setFilterSongId] = useState<string>('all');

  // Edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync initialSongId whenever prop changes
  React.useEffect(() => {
    if (initialSongId) {
      setSelectedSongId(initialSongId);
    }
  }, [initialSongId]);

  // Filter and sort quick notes (pinned first, then chronological) - MUST be before any return
  const filteredNotes = useMemo(() => {
    return quickNotes
      .filter((note) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesText = note.text.toLowerCase().includes(q);
          const matchesSong = note.songTitle?.toLowerCase().includes(q);
          const matchesTag = note.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesText && !matchesSong && !matchesTag) return false;
        }

        // Tag filter
        if (filterTag !== 'all') {
          if (filterTag === 'pinned') {
            if (!note.pinned) return false;
          } else {
            if (!note.tags?.includes(filterTag)) return false;
          }
        }

        // Song filter
        if (filterSongId !== 'all') {
          if (filterSongId === 'general') {
            if (note.songId) return false;
          } else {
            if (note.songId !== filterSongId) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [quickNotes, searchQuery, filterTag, filterSongId]);

  // Unique tags across all notes - MUST be before any return
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    quickNotes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [quickNotes]);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    soundService.playSlideClick();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setCustomTagInput('');
      setShowCustomTag(false);
    }
  };

  const handleSaveNewNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    soundService.playHabitComplete();

    const linkedSong = songs.find((s) => s.id === selectedSongId);

    onAddNote({
      text: trimmed,
      songId: linkedSong?.id,
      songTitle: linkedSong?.title,
      category: linkedSong?.category,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      pinned: isPinned,
    });

    // Reset input
    setNewText('');
    setSelectedTags([]);
    setIsPinned(false);
  };

  const handleStartEdit = (note: PracticeQuickNote) => {
    soundService.playSlideClick();
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = (note: PracticeQuickNote) => {
    if (!editText.trim()) return;
    soundService.playSlideClick();
    onUpdateNote({
      ...note,
      text: editText.trim(),
    });
    setEditingNoteId(null);
    setEditText('');
  };

  const handleCopyNote = (note: PracticeQuickNote) => {
    soundService.playSlideClick();
    const fullText = note.songTitle
      ? `[${note.songTitle}] ${note.text}`
      : note.text;
    navigator.clipboard.writeText(fullText);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format relative timestamp
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="majestic-card w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-[#DE72B5]/30 shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1D0F22 0%, #170C1B 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DE72B5]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B63E88] to-[#6A1A4E] flex items-center justify-center text-white shadow-lg border border-[#DE72B5]/40">
              <StickyNote className="w-5 h-5 text-amber-200 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg sm:text-xl text-white tracking-wider uppercase">
                  Practice Quick Notes
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DE72B5]/20 text-[#DE72B5] border border-[#DE72B5]/30">
                  {quickNotes.length}
                </span>
              </div>
              <p className="text-xs text-[#B8A9C2]">
                Ephemeral practice thoughts, fingering tips &amp; measure reminders
              </p>
            </div>
          </div>

          <button
            id="close-quick-notes-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47] transition-colors"
            title="Close Quick Notes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
          {/* Quick Capture Input Card */}
          <div className="p-4 rounded-2xl bg-[#281430]/90 border border-[#DE72B5]/30 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#DE72B5]" />
                Capture Quick Thought
              </span>

              <button
                type="button"
                onClick={() => {
                  soundService.playSlideClick();
                  setIsPinned(!isPinned);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  isPinned
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-[#B8A9C2] hover:text-white hover:bg-[#3E1E49]'
                }`}
                title="Pin this note to top"
              >
                <Pin className="w-3 h-3" />
                <span>{isPinned ? 'Pinned ⭐' : 'Pin note'}</span>
              </button>
            </div>

            <textarea
              id="quick-note-textarea"
              rows={3}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSaveNewNote();
                }
              }}
              placeholder="Jot down a quick thought, fingering idea, measure reminder, or pedal tip... (Cmd+Enter to save)"
              className="w-full bg-[#180B1C] border border-[#DE72B5]/30 rounded-xl p-3 text-sm text-white placeholder-[#8A7996] focus:outline-none focus:border-[#DE72B5] focus:ring-1 focus:ring-[#DE72B5] resize-none transition-colors"
            />

            {/* Association & Tagging Controls */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
              {/* Piece association dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                <Music className="w-3.5 h-3.5 text-[#DE72B5] shrink-0" />
                <select
                  id="quick-note-song-select"
                  value={selectedSongId}
                  onChange={(e) => setSelectedSongId(e.target.value)}
                  className="bg-[#1D0F22] border border-[#DE72B5]/30 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#DE72B5] max-w-[200px] truncate"
                >
                  <option value="">General Thought (No Piece)</option>
                  <optgroup label="Repertoire Pieces">
                    {songs.map((song) => (
                      <option key={song.id} value={song.id}>
                        {song.title} ({song.composerOrArtist})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Quick Tag Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {COMMON_TAGS.slice(0, 5).map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-[11px] px-2 py-0.5 rounded-md transition-all ${
                        isSelected
                          ? 'bg-[#B63E88] text-white font-bold shadow-sm'
                          : 'bg-[#180B1C] text-[#B8A9C2] hover:text-white border border-[#4B2758]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}

                {/* Custom tag add */}
                {showCustomTag ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="tag name..."
                      className="bg-[#180B1C] border border-[#DE72B5] rounded px-2 py-0.5 text-xs text-white w-20 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="p-1 rounded bg-[#B63E88] text-white text-[10px]"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomTag(true)}
                    className="text-[11px] px-1.5 py-0.5 rounded text-[#DE72B5] hover:bg-[#3D1E47] border border-[#DE72B5]/30 flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    Tag
                  </button>
                )}
              </div>

              {/* Save Button */}
              <button
                id="save-quick-note-btn"
                type="button"
                onClick={() => handleSaveNewNote()}
                disabled={!newText.trim()}
                className="majestic-btn-primary px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Save Note
              </button>
            </div>
          </div>

          {/* Search, Filter & History Header */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-[#DE72B5]" />
                Note History Feed ({filteredNotes.length})
              </span>

              {/* Tag filters */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
                <button
                  onClick={() => {
                    soundService.playSlideClick();
                    setFilterTag('all');
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                    filterTag === 'all'
                      ? 'bg-[#B63E88] text-white font-bold'
                      : 'bg-[#281430] text-[#B8A9C2] hover:text-white border border-[#44234F]'
                  }`}
                >
                  All Notes
                </button>

                <button
                  onClick={() => {
                    soundService.playSlideClick();
                    setFilterTag('pinned');
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    filterTag === 'pinned'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-[#281430] text-amber-300 hover:text-white border border-amber-500/30'
                  }`}
                >
                  <Pin className="w-2.5 h-2.5" />
                  Pinned
                </button>

                {allAvailableTags.slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      soundService.playSlideClick();
                      setFilterTag(tag === filterTag ? 'all' : tag);
                    }}
                    className={`text-[11px] px-2 py-1 rounded-lg transition-all ${
                      filterTag === tag
                        ? 'bg-[#B63E88] text-white font-bold'
                        : 'bg-[#281430] text-[#B8A9C2] hover:text-white border border-[#44234F]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar & Song Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#B8A9C2] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thoughts, measures, pieces..."
                  className="w-full bg-[#201026] border border-[#DE72B5]/25 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8A7996] focus:outline-none focus:border-[#DE72B5]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B8A9C2] hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter by Piece */}
              <select
                value={filterSongId}
                onChange={(e) => setFilterSongId(e.target.value)}
                className="bg-[#201026] border border-[#DE72B5]/25 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none max-w-[150px] truncate"
              >
                <option value="all">All Pieces</option>
                <option value="general">General (No Piece)</option>
                {songs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* History Feed List */}
          <div className="space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#201026]/50 border border-dashed border-[#DE72B5]/30 text-center space-y-2">
                <StickyNote className="w-8 h-8 text-[#B8A9C2]/40 mx-auto" />
                <p className="text-sm font-semibold text-white">No quick notes found</p>
                <p className="text-xs text-[#B8A9C2] max-w-sm mx-auto">
                  {searchQuery || filterTag !== 'all' || filterSongId !== 'all'
                    ? 'No notes match your current search filters. Try clearing the filter.'
                    : 'Capture quick fingering tips, tempo reminders, or thoughts above without logging a full practice session.'}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isEditing = editingNoteId === note.id;
                const isCopied = copiedId === note.id;

                return (
                  <div
                    key={note.id}
                    className={`p-3.5 sm:p-4 rounded-2xl transition-all border ${
                      note.pinned
                        ? 'bg-gradient-to-r from-[#2F1538] to-[#25102D] border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-[#221128]/90 hover:bg-[#2A1532] border-[#DE72B5]/20'
                    }`}
                  >
                    {/* Top Row: Song association, Pinned Badge, Timestamp & Action Buttons */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        {note.pinned && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                            <Pin className="w-2.5 h-2.5 fill-amber-400" />
                            Pinned
                          </span>
                        )}

                        {note.songTitle ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B63E88]/20 border border-[#DE72B5]/30 text-xs font-semibold text-[#F1B8DF] truncate">
                            <Music className="w-3 h-3 text-[#DE72B5] shrink-0" />
                            <span className="truncate">{note.songTitle}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#A594B0] font-medium">
                            General Thought
                          </span>
                        )}

                        <span className="text-[10px] text-[#8E7E9A] shrink-0">
                          • {formatTimestamp(note.timestamp)}
                        </span>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-1 shrink-0 ml-auto">
                        {/* Start Timer Shortcut (if linked to song) */}
                        {note.songId && onOpenTimerForSong && (
                          <button
                            onClick={() => {
                              soundService.playSlideClick();
                              onClose();
                              onOpenTimerForSong(note.songId!);
                            }}
                            className="p-1.5 rounded-lg text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47] transition-colors"
                            title="Start Practice Timer for this piece"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#DE72B5]" />
                          </button>
                        )}

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyNote(note)}
                          className="p-1.5 rounded-lg text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47] transition-colors"
                          title="Copy note text"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Toggle Pin */}
                        <button
                          onClick={() => {
                            soundService.playSlideClick();
                            onTogglePin(note.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            note.pinned
                              ? 'text-amber-400 hover:text-amber-200'
                              : 'text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47]'
                          }`}
                          title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          {note.pinned ? (
                            <PinOff className="w-3.5 h-3.5" />
                          ) : (
                            <Pin className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1.5 rounded-lg text-[#B8A9C2] hover:text-white hover:bg-[#3D1E47] transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            soundService.playSlideClick();
                            onDeleteNote(note.id);
                          }}
                          className="p-1.5 rounded-lg text-[#B8A9C2] hover:text-rose-400 hover:bg-rose-900/30 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content / Inline Edit Box */}
                    {isEditing ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          rows={2}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-[#180B1C] border border-[#DE72B5] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1 rounded-lg text-xs text-[#B8A9C2] hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(note)}
                            className="majestic-btn-primary px-3 py-1 rounded-lg text-xs font-bold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-[#F0EBF2] leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    )}

                    {/* Note Tags */}
                    {note.tags && note.tags.length > 0 && !isEditing && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-[#DE72B5]/10">
                        <Tag className="w-3 h-3 text-[#A594B0]" />
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
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DE72B5]/20 bg-[#160B1A] flex items-center justify-between text-xs text-[#B8A9C2]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#DE72B5]" />
            Fast note capture during practice sessions
          </span>

          <button
            onClick={onClose}
            className="majestic-btn-secondary px-4 py-1.5 rounded-xl text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
