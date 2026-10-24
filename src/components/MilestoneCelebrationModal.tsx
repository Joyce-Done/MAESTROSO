import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Clock,
  Crown,
  Music,
  Award,
  X,
  Share2,
  ChevronRight,
  PartyPopper,
} from 'lucide-react';
import { Milestone, triggerCelebrationConfetti } from '../services/celebration';
import { soundService } from '../services/audio';

interface MilestoneCelebrationModalProps {
  milestones: Milestone[];
  isOpen: boolean;
  onClose: () => void;
  onViewAchievementsList?: () => void;
}

export function MilestoneCelebrationModal({
  milestones,
  isOpen,
  onClose,
  onViewAchievementsList,
}: MilestoneCelebrationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);

  // Trigger celebratory confetti on initial open or milestone transition
  useEffect(() => {
    if (isOpen && milestones.length > 0) {
      triggerCelebrationConfetti({ countMultiplier: 1.2 });
    }
  }, [isOpen, currentIndex, milestones.length]);

  if (!isOpen || milestones.length === 0) return null;

  const currentMilestone = milestones[currentIndex] || milestones[0];
  const isLast = currentIndex >= milestones.length - 1;

  const handleNextOrClose = () => {
    soundService.playSlideClick();
    if (isLast) {
      onClose();
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleShare = () => {
    soundService.playSlideClick();
    const text = `🏆 I just unlocked the "${currentMilestone.title}" milestone on Maestroso Piano Practice Tracker! 🎹✨ (${currentMilestone.subtitle})`;
    if (navigator.share) {
      navigator.share({
        title: 'Maestroso Piano Milestone',
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  const renderIcon = (name: string, className: string = 'w-10 h-10') => {
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

  return (
    <AnimatePresence>
      <motion.div
        key="milestone-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          key={`milestone-card-${currentMilestone.id}`}
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: -20, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="w-full max-w-md majestic-card rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden border border-[#DE72B5]/50 flex flex-col items-center text-center"
          style={{
            background: 'linear-gradient(180deg, #240E2A 0%, #17091B 100%)',
            boxShadow: '0 25px 60px -15px rgba(182, 62, 136, 0.45)',
          }}
        >
          {/* Background Ambient Radial Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-40 pointer-events-none"
            style={{ backgroundColor: currentMilestone.borderGlow }}
          />

          {/* Close button */}
          <button
            onClick={() => {
              soundService.playSlideClick();
              onClose();
              setCurrentIndex(0);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#100713]/60 hover:bg-[#2D1A36] text-[#B8A9C2] hover:text-white flex items-center justify-center border border-[#4D2B5B] transition-colors z-10"
            title="Dismiss celebration"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Multi-milestone badge counter */}
          {milestones.length > 1 && (
            <div className="mb-3 px-3 py-1 rounded-full bg-[#B63E88]/30 border border-[#DE72B5]/40 text-[#FFBBE2] text-xs font-bold uppercase tracking-wider">
              Achievement {currentIndex + 1} of {milestones.length}
            </div>
          )}

          {/* Reward Tier Pill */}
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-4 shadow-sm">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>{currentMilestone.rewardTier} Milestone</span>
          </div>

          {/* Glowing Animated Icon Badge */}
          <div className="relative my-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="absolute -inset-2.5 rounded-3xl opacity-60 blur-md bg-gradient-to-r from-[#B63E88] via-[#DE72B5] to-amber-400"
            />
            <div
              className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${currentMilestone.gradient} border-2 flex items-center justify-center text-white shadow-xl`}
              style={{ borderColor: currentMilestone.borderGlow }}
            >
              {renderIcon(currentMilestone.iconName, 'w-12 h-12 text-white drop-shadow-md')}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="mt-4 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#DE72B5]">
              {currentMilestone.badgeName}
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-wide leading-tight">
              {currentMilestone.title}
            </h2>
            <p className="text-sm font-medium text-amber-300">
              {currentMilestone.subtitle}
            </p>
          </div>

          {/* Description Card */}
          <div className="my-4 p-4 rounded-2xl bg-[#120715]/80 border border-[#3E1B46] text-xs sm:text-sm text-[#E2DCE6] leading-relaxed max-w-sm">
            {currentMilestone.description}
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2.5 pt-1">
            <button
              onClick={handleNextOrClose}
              className="w-full majestic-btn-primary py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-white"
            >
              <span>{isLast ? 'Keep Practicing!' : 'Next Achievement'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 w-full">
              {/* Celebrate Again / Re-fire Confetti Button */}
              <button
                onClick={() => triggerCelebrationConfetti({ countMultiplier: 1.5 })}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#2A1330] hover:bg-[#3B1C43] border border-[#DE72B5]/30 text-xs font-semibold text-[#FFBBE2] flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                title="Fire confetti animation again!"
              >
                <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
                <span>More Confetti!</span>
              </button>

              {/* Share / Copy Achievement */}
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#2A1330] hover:bg-[#3B1C43] border border-[#DE72B5]/30 text-xs font-semibold text-[#FFBBE2] flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{hasCopied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {onViewAchievementsList && (
              <button
                onClick={() => {
                  soundService.playSlideClick();
                  onClose();
                  onViewAchievementsList();
                }}
                className="text-xs text-[#B8A9C2] hover:text-white transition-colors underline pt-1"
              >
                View all milestones &amp; trophies
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
