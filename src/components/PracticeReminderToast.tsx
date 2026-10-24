import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Play, Clock, Sparkles } from 'lucide-react';
import { PracticeReminderEvent } from '../services/notificationService';
import { soundService } from '../services/audio';

interface PracticeReminderToastProps {
  reminder: PracticeReminderEvent | null;
  onClose: () => void;
  onStartPracticeTimer?: () => void;
}

export function PracticeReminderToast({
  reminder,
  onClose,
  onStartPracticeTimer,
}: PracticeReminderToastProps) {
  if (!reminder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-auto"
      >
        <div
          className="majestic-card p-4 rounded-2xl shadow-2xl border border-[#DE72B5]/50 backdrop-blur-xl relative overflow-hidden text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(29, 15, 34, 0.96) 0%, rgba(45, 20, 52, 0.96) 100%)',
            boxShadow: '0 20px 40px -15px rgba(182, 62, 136, 0.35)',
          }}
        >
          {/* Subtle glowing accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B63E88] via-[#DE72B5] to-[#FFBBE2]" />

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B63E88] to-[#6A1A4E] border border-[#DE72B5]/40 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bell className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#B63E88]/30 text-[#FFBBE2] border border-[#DE72B5]/30">
                  {reminder.routineTime} routine
                </span>
                <span className="text-[10px] text-[#B8A9C2] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Scheduled Reminder
                </span>
              </div>

              <h4 className="font-serif font-bold text-sm text-white mt-1 leading-snug">
                {reminder.title}
              </h4>
              <p className="text-xs text-[#DDD8E2] mt-0.5 leading-relaxed">
                {reminder.body}
              </p>

              {/* Routine Habits Chips */}
              {reminder.habits.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {reminder.habits.map((h) => (
                    <span
                      key={h.id}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-[#100713]/70 text-[#FFBBE2] border border-[#4D2B5B] flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#DE72B5]" />
                      {h.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2 pt-1">
                {onStartPracticeTimer && (
                  <button
                    onClick={() => {
                      soundService.playSlideClick();
                      onStartPracticeTimer();
                      onClose();
                    }}
                    className="majestic-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Practice Timer
                  </button>
                )}

                <button
                  onClick={() => {
                    soundService.playSlideClick();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#B8A9C2] hover:text-white bg-[#100713]/60 hover:bg-[#2D1A36] border border-[#4D2B5B] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playSlideClick();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-[#100713]/60 hover:bg-[#2D1A36] text-[#B8A9C2] hover:text-white flex items-center justify-center shrink-0 border border-[#4D2B5B] transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
