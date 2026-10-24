import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Check,
  Star,
  Music,
  BookOpen,
  Droplets,
  Activity,
  Zap,
  Moon,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ROUTINE_PRESETS, RoutinePreset } from '../services/storage';
import { Habit } from '../types';
import { soundService } from '../services/audio';

interface RoutinePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (preset: RoutinePreset, mode: 'replace' | 'append') => void;
  currentHabitsCount: number;
}

export function RoutinePresetsModal({
  isOpen,
  onClose,
  onApplyPreset,
  currentHabitsCount,
}: RoutinePresetsModalProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('beginner_starter');
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');

  if (!isOpen) return null;

  const selectedPreset = ROUTINE_PRESETS.find((p) => p.id === selectedPresetId) || ROUTINE_PRESETS[0];

  const handleApply = () => {
    soundService.playHabitComplete();
    onApplyPreset(selectedPreset, applyMode);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="routine-presets-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 my-auto space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Routine Presets &amp; Starter Packs</h2>
                <p className="text-xs text-slate-400">Quickly set up structured routines with 1 - 20 ordering</p>
              </div>
            </div>

            <button
              id="close-presets-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Selection Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ROUTINE_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  id={`preset-tab-${preset.id}`}
                  onClick={() => {
                    soundService.playSlideClick();
                    setSelectedPresetId(preset.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold truncate text-slate-200">{preset.title}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-medium inline-block">
                    {preset.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Preset Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {selectedPreset.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPreset.description}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Recommended Daily Goal</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {selectedPreset.recommendedDailyGoal} habits / day
                </span>
              </div>
            </div>

            {/* Habit Cards in this preset */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {selectedPreset.habits.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono font-bold flex items-center justify-center text-[11px]">
                      #{h.order || i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-200 block truncate">{h.name}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{h.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium capitalize border border-slate-700">
                      {h.routineTime || 'anytime'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium capitalize">
                      {h.difficulty || 'beginner'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">How would you like to apply this routine?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApplyMode('replace')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  applyMode === 'replace'
                    ? 'bg-teal-900/40 border-teal-500 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                <span className="font-bold block text-slate-200">Replace Habit List</span>
                <span className="text-[11px] text-slate-400">Set clean 1-{selectedPreset.habits.length} routine</span>
              </button>

              <button
                type="button"
                onClick={() => setApplyMode('append')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                  applyMode === 'append'
                    ? 'bg-teal-900/40 border-teal-500 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                <span className="font-bold block text-slate-200">Append to Existing</span>
                <span className="text-[11px] text-slate-400">Add to current ({currentHabitsCount}) habits</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="cancel-apply-preset-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              id="confirm-apply-preset-btn"
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Apply {selectedPreset.title}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
