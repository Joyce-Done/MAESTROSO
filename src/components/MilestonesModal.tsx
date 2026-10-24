import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Clock,
  Crown,
  Music,
  X,
  PartyPopper,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  ALL_MILESTONES,
  Milestone,
  MilestoneCategory,
  MilestoneEvaluationResult,
  triggerCelebrationConfetti,
} from '../services/celebration';
import { soundService } from '../services/audio';

interface MilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: MilestoneEvaluationResult;
  onCelebrateMilestone: (milestone: Milestone) => void;
}

export function MilestonesModal({
  isOpen,
  onClose,
  evaluation,
  onCelebrateMilestone,
}: MilestonesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory | 'all'>('all');

  if (!isOpen) return null;

  const { unlockedMilestones, stats } = evaluation;
  const unlockedIds = unlockedMilestones.map((m) => m.id);

  const filteredMilestones = ALL_MILESTONES.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const renderIcon = (name: string, className: string = 'w-5 h-5') => {
    switch (name) {
      case 'Flame':
        return <Flame className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Music':
        return <Music className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Sparkles':
      default:
        return <Sparkles className={className} />;
    }
  };

  const getProgressForMilestone = (m: Milestone) => {
    let current = 0;
    switch (m.category) {
      case 'minutes':
        current = stats.totalMinutes;
        break;
      case 'streak':
        current = stats.currentStreak;
        break;
      case 'sessions':
        current = stats.totalSessions;
        break;
      case 'repertoire':
        current = stats.masteredCount;
        break;
    }
    const percent = Math.min(100, Math.round((current / m.targetValue) * 100));
    return { current, target: m.targetValue, percent, isUnlocked: current >= m.targetValue };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="w-full max-w-2xl majestic-card rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col border border-[#DE72B5]/30 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #240F2A 0%, #17091B 100%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DE72B5]/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B63E88] to-amber-500 border border-[#DE72B5]/50 flex items-center justify-center text-white shadow-md">
                <Trophy className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                  Milestones &amp; Honors
                </h3>
                <p className="text-xs text-[#B8A9C2]">
                  {unlockedMilestones.length} of {ALL_MILESTONES.length} achievements unlocked
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playSlideClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-[#100713]/60 hover:bg-[#2D1A36] text-[#B8A9C2] hover:text-white flex items-center justify-center border border-[#4D2B5B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 shrink-0">
            <div className="p-3 rounded-2xl bg-[#170C1B] border border-[#3A1F45] text-center">
              <span className="text-[10px] text-[#B8A9C2] uppercase tracking-wider font-semibold block">
                Total Practice
              </span>
              <div className="text-lg font-serif font-black text-[#FFBBE2] mt-0.5">
                {stats.totalMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#170C1B] border border-[#3A1F45] text-center">
              <span className="text-[10px] text-[#B8A9C2] uppercase tracking-wider font-semibold block">
                Active Streak
              </span>
              <div className="text-lg font-serif font-black text-amber-300 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                {stats.currentStreak} <span className="text-xs font-normal text-slate-400">days</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#170C1B] border border-[#3A1F45] text-center">
              <span className="text-[10px] text-[#B8A9C2] uppercase tracking-wider font-semibold block">
                Logged Sessions
              </span>
              <div className="text-lg font-serif font-black text-sky-300 mt-0.5">
                {stats.totalSessions} <span className="text-xs font-normal text-slate-400">times</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#170C1B] border border-[#3A1F45] text-center">
              <span className="text-[10px] text-[#B8A9C2] uppercase tracking-wider font-semibold block">
                Mastered Pieces
              </span>
              <div className="text-lg font-serif font-black text-emerald-300 mt-0.5">
                {stats.masteredCount} <span className="text-xs font-normal text-slate-400">pieces</span>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 pb-3 overflow-x-auto shrink-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Milestones' },
              { id: 'minutes', label: 'Practice Time (100m+)' },
              { id: 'streak', label: 'Streaks (7d+)' },
              { id: 'repertoire', label: 'Repertoire' },
              { id: 'sessions', label: 'Sessions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundService.playSlideClick();
                  setSelectedCategory(tab.id as MilestoneCategory | 'all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-[#B63E88] text-white shadow-md'
                    : 'bg-[#1D0F22] text-[#B8A9C2] hover:text-white border border-[#4D2B5B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Milestones Scrollable Grid */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {filteredMilestones.map((milestone) => {
              const { current, target, percent, isUnlocked } = getProgressForMilestone(milestone);

              return (
                <div
                  key={milestone.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-[#200F26] border-[#DE72B5]/40 shadow-md'
                      : 'bg-[#150918]/70 border-[#33173D] opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md border ${
                        isUnlocked
                          ? `bg-gradient-to-br ${milestone.gradient} border-[#DE72B5]`
                          : 'bg-[#25132B] border-[#44234E] text-[#8F7D99]'
                      }`}
                    >
                      {isUnlocked ? (
                        renderIcon(milestone.iconName, 'w-6 h-6 text-white')
                      ) : (
                        <Lock className="w-5 h-5 text-[#8F7D99]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                            {milestone.title}
                          </h4>
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              milestone.rewardTier === 'Royal Diamond'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : milestone.rewardTier === 'Gold'
                                ? 'bg-amber-600/20 text-amber-200 border-amber-600/30'
                                : 'bg-[#B63E88]/20 text-[#FFBBE2] border-[#DE72B5]/30'
                            }`}
                          >
                            {milestone.rewardTier}
                          </span>
                        </div>

                        {isUnlocked && (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Unlocked
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#DE72B5] font-medium mt-0.5">
                        {milestone.subtitle}
                      </p>

                      <p className="text-xs text-[#B8A9C2] mt-1 leading-relaxed">
                        {milestone.description}
                      </p>

                      {/* Progress Bar or Action */}
                      <div className="mt-3 pt-2 border-t border-[#3A1F45] flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[10px] text-[#DDD8E2] mb-1 font-medium">
                            <span>
                              {current} / {target} {milestone.unit}
                            </span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#120715] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isUnlocked
                                  ? 'bg-gradient-to-r from-[#B63E88] via-[#DE72B5] to-amber-400'
                                  : 'bg-[#B63E88]/60'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => {
                              onCelebrateMilestone(milestone);
                            }}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#B63E88] text-white hover:bg-[#DE72B5] flex items-center gap-1 shrink-0 transition-colors shadow-sm active:scale-95"
                            title="Re-trigger celebratory confetti effect!"
                          >
                            <PartyPopper className="w-3 h-3 text-amber-300" />
                            Celebrate
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8F7D99] font-medium shrink-0">
                            {target - current} {milestone.unit} remaining
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Controls: Test Confetti Celebration */}
          <div className="pt-3.5 border-t border-[#DE72B5]/20 flex items-center justify-between gap-2 shrink-0">
            <button
              onClick={() => {
                triggerCelebrationConfetti({ countMultiplier: 1.3 });
              }}
              className="px-3 py-1.5 rounded-xl bg-[#2A1330] hover:bg-[#3B1C43] border border-[#DE72B5]/40 text-xs font-semibold text-[#FFBBE2] flex items-center gap-1.5 transition-colors active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Test Celebration Confetti</span>
            </button>

            <button
              onClick={() => {
                soundService.playSlideClick();
                onClose();
              }}
              className="majestic-btn-primary px-4 py-1.5 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
