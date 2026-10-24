import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MaestrosoLogo } from './MaestrosoLogo';
import { soundService } from '../services/audio';

interface WelcomeModalProps {
  isOpen: boolean;
  onBegin: () => void;
}

export function WelcomeModal({ isOpen, onBegin }: WelcomeModalProps) {
  if (!isOpen) return null;

  const handleBeginClick = () => {
    soundService.playHabitComplete();
    onBegin();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
      >
        <motion.div
          key="welcome-modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 text-center shadow-2xl border border-[#B63E88]/35 overflow-hidden"
          style={{
            backgroundColor: '#2B1B33',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(182, 62, 136, 0.25)',
          }}
        >
          {/* Subtle decorative background light glow */}
          <div
            className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: '#B63E88' }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: '#DE72B5' }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Maestroso Emblem & Brand Logo */}
            <div className="mb-4">
              <MaestrosoLogo size="lg" align="center" showSubtitle />
            </div>

            {/* Headline */}
            <h2
              id="welcome-modal-title"
              className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-white mb-3"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              Welcome to Maestroso
            </h2>

            {/* Silver Accent Divider */}
            <div className="w-16 h-0.5 rounded-full mb-4 opacity-70" style={{ backgroundColor: '#C7C4CC' }} />

            {/* Body Text */}
            <p
              className="text-sm sm:text-base leading-relaxed mb-6 px-1 sm:px-2 font-normal"
              style={{ color: '#C7C4CC' }}
            >
              Every masterpiece starts with a single practice session. Track your pieces, watch your tempo climb, and build the kind of consistency that turns &lsquo;practicing&rsquo; into &lsquo;mastering.&rsquo; Let&rsquo;s get started.
            </p>

            {/* 3 Value Pillars */}
            <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 mb-7 text-left">
              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-[#C7C4CC]/15 flex flex-col justify-between">
                <Music className="w-4 h-4 text-[#DE72B5] mb-1.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Repertoire</div>
                  <div className="text-[10px] sm:text-[11px] text-[#C7C4CC]/80">Track pieces</div>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-[#C7C4CC]/15 flex flex-col justify-between">
                <Sparkles className="w-4 h-4 text-amber-400 mb-1.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Tempo & BPM</div>
                  <div className="text-[10px] sm:text-[11px] text-[#C7C4CC]/80">Watch speed climb</div>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-[#C7C4CC]/15 flex flex-col justify-between">
                <CheckCircle2 className="w-4 h-4 text-teal-400 mb-1.5" />
                <div>
                  <div className="text-xs font-semibold text-white">Daily Routine</div>
                  <div className="text-[10px] sm:text-[11px] text-[#C7C4CC]/80">Master consistency</div>
                </div>
              </div>
            </div>

            {/* Begin Button */}
            <motion.button
              id="welcome-begin-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBeginClick}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-base text-white tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #B63E88 0%, #85225E 100%)',
                boxShadow: '0 4px 20px rgba(182, 62, 136, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <span>Begin</span>
              <ArrowRight className="w-5 h-5 ml-1 text-white/90" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
