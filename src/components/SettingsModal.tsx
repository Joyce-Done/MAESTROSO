import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Palette,
  Shield,
  Check,
  RefreshCw,
  Bell,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';
import { AppSettings, Habit, RoutineTime } from '../types';
import { soundService } from '../services/audio';
import {
  notificationService,
  NotificationPermissionState,
} from '../services/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  habits?: Habit[];
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSetPinModal: () => void;
  onResetToDefaults: () => void;
  onTestReminder?: (routineTime: RoutineTime) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  habits = [],
  onUpdateSettings,
  onOpenSetPinModal,
  onResetToDefaults,
  onTestReminder,
}: SettingsModalProps) {
  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>('default');
  const [testSentSlot, setTestSentSlot] = useState<RoutineTime | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermissionState(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    soundService.playSlideClick();
    const perm = await notificationService.requestPermission();
    setPermissionState(perm);
    if (perm === 'granted') {
      onUpdateSettings({ notificationsEnabled: true });
    }
  };

  const handleToggleNotifications = async () => {
    soundService.playSlideClick();
    if (!settings.notificationsEnabled) {
      if (permissionState !== 'granted') {
        const perm = await notificationService.requestPermission();
        setPermissionState(perm);
        if (perm === 'granted') {
          onUpdateSettings({ notificationsEnabled: true });
        }
      } else {
        onUpdateSettings({ notificationsEnabled: true });
      }
    } else {
      onUpdateSettings({ notificationsEnabled: false });
    }
  };

  const handleTimeChange = (slot: keyof NonNullable<AppSettings['routineReminderTimes']>, value: string) => {
    const currentTimes = settings.routineReminderTimes || {
      morning: '09:00',
      afternoon: '14:00',
      evening: '19:30',
    };
    onUpdateSettings({
      routineReminderTimes: {
        ...currentTimes,
        [slot]: value,
      },
    });
  };

  const handleTriggerTest = (slot: RoutineTime) => {
    soundService.playSlideClick();
    setTestSentSlot(slot);
    if (onTestReminder) {
      onTestReminder(slot);
    } else {
      notificationService.sendTestReminder(slot, habits);
    }
    setTimeout(() => setTestSentSlot(null), 3000);
  };

  const themes: Array<{ id: AppSettings['theme']; label: string; bgClass: string; accentColor: string }> = [
    { id: 'neutral', label: 'Maestroso Majestic (Plum & Silver)', bgClass: 'bg-[#1D0F22]', accentColor: '#B63E88' },
    { id: 'warm-stone', label: 'Concert Hall Mahogany', bgClass: 'bg-stone-900', accentColor: '#d97706' },
    { id: 'minimal-dark', label: 'Pure Obsidian', bgClass: 'bg-zinc-950', accentColor: '#f43f5e' },
    { id: 'forest-slate', label: 'Symphony Emerald', bgClass: 'bg-emerald-950', accentColor: '#10b981' },
    { id: 'nordic-sky', label: 'Sonata Blue', bgClass: 'bg-slate-900', accentColor: '#0284c7' },
  ];

  // Group routine habits
  const morningHabits = habits.filter((h) => !h.archived && h.isRoutine && h.routineTime === 'morning');
  const afternoonHabits = habits.filter((h) => !h.archived && h.isRoutine && h.routineTime === 'afternoon');
  const eveningHabits = habits.filter((h) => !h.archived && h.isRoutine && h.routineTime === 'evening');

  const reminderTimes = settings.routineReminderTimes || {
    morning: '09:00',
    afternoon: '14:00',
    evening: '19:30',
  };

  return (
    <AnimatePresence>
      <motion.div
        id="settings-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#100713]/85 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg majestic-card rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative my-auto space-y-5 border border-[#DE72B5]/30 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#DE72B5]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#4A1037] border border-[#DE72B5]/40 flex items-center justify-center text-white shadow-md">
                <Settings className="w-5 h-5 text-[#FFBBE2]" />
              </div>
              <h2 className="text-lg font-bold text-white font-serif uppercase tracking-wider">Maestroso Settings</h2>
            </div>

            <button
              id="close-settings-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#2D1A36] hover:bg-[#40234D] text-[#B8A9C2] hover:text-white flex items-center justify-center transition-colors border border-[#4D2B5B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Routine Practice Reminders (Notification API) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#DE72B5]" />
                Routine Practice Reminders (Notification API)
              </label>

              {/* Status Badge */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  permissionState === 'granted'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : permissionState === 'denied'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                }`}
              >
                {permissionState === 'granted'
                  ? 'Active'
                  : permissionState === 'denied'
                  ? 'Permission Blocked'
                  : 'Needs Permission'}
              </span>
            </div>

            <div className="bg-[#1D0F22]/90 rounded-2xl p-3.5 border border-[#4D2B5B] space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white block">
                    Browser Practice Reminders
                  </span>
                  <span className="text-[11px] text-[#B8A9C2]">
                    Gentle prompts for scheduled Morning, Afternoon &amp; Evening routines
                  </span>
                </div>

                <button
                  id="toggle-notifications-btn"
                  onClick={handleToggleNotifications}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    settings.notificationsEnabled && permissionState === 'granted'
                      ? 'bg-[#B63E88]'
                      : 'bg-[#2D1A36] border border-[#4D2B5B]'
                  }`}
                  title={settings.notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.notificationsEnabled && permissionState === 'granted'
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {permissionState !== 'granted' && (
                <div className="bg-[#2D1A36]/70 rounded-xl p-2.5 border border-[#DE72B5]/30 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#DDD8E2]">
                    Grant browser notification access to receive practice alerts.
                  </span>
                  <button
                    onClick={handleRequestPermission}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#B63E88] text-white hover:bg-[#DE72B5] transition-colors shrink-0 shadow-sm"
                  >
                    Allow
                  </button>
                </div>
              )}

              {/* Time Schedule Matrix */}
              <div className="space-y-2 pt-1 border-t border-[#4D2B5B]/60">
                <div className="text-[11px] font-semibold text-[#DDD8E2] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#DE72B5]" />
                  Scheduled Practice Routine Times
                </div>

                {/* Morning Slot */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#170C1B] border border-[#3A1F45]">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-200">🌅 Morning</span>
                      <span className="text-[10px] text-[#B8A9C2]">
                        ({morningHabits.length} {morningHabits.length === 1 ? 'routine' : 'routines'})
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8F7D99] truncate">
                      {morningHabits.map((h) => h.name).join(', ') || 'No routine habits assigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="time"
                      value={reminderTimes.morning}
                      onChange={(e) => handleTimeChange('morning', e.target.value)}
                      className="bg-[#2D1A36] text-white text-xs font-semibold px-2 py-1 rounded-lg border border-[#4D2B5B] focus:border-[#DE72B5] focus:outline-none"
                    />
                    <button
                      onClick={() => handleTriggerTest('morning')}
                      title="Send test morning reminder"
                      className="p-1 rounded-lg bg-[#2D1A36] hover:bg-[#40234D] text-[#DE72B5] hover:text-white border border-[#4D2B5B] transition-colors text-[10px] flex items-center gap-1 px-2"
                    >
                      <Send className="w-2.5 h-2.5" />
                      {testSentSlot === 'morning' ? 'Sent!' : 'Test'}
                    </button>
                  </div>
                </div>

                {/* Afternoon Slot */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#170C1B] border border-[#3A1F45]">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-sky-200">☀️ Afternoon</span>
                      <span className="text-[10px] text-[#B8A9C2]">
                        ({afternoonHabits.length} {afternoonHabits.length === 1 ? 'routine' : 'routines'})
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8F7D99] truncate">
                      {afternoonHabits.map((h) => h.name).join(', ') || 'No routine habits assigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="time"
                      value={reminderTimes.afternoon}
                      onChange={(e) => handleTimeChange('afternoon', e.target.value)}
                      className="bg-[#2D1A36] text-white text-xs font-semibold px-2 py-1 rounded-lg border border-[#4D2B5B] focus:border-[#DE72B5] focus:outline-none"
                    />
                    <button
                      onClick={() => handleTriggerTest('afternoon')}
                      title="Send test afternoon reminder"
                      className="p-1 rounded-lg bg-[#2D1A36] hover:bg-[#40234D] text-[#DE72B5] hover:text-white border border-[#4D2B5B] transition-colors text-[10px] flex items-center gap-1 px-2"
                    >
                      <Send className="w-2.5 h-2.5" />
                      {testSentSlot === 'afternoon' ? 'Sent!' : 'Test'}
                    </button>
                  </div>
                </div>

                {/* Evening Slot */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#170C1B] border border-[#3A1F45]">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-purple-200">🌙 Evening</span>
                      <span className="text-[10px] text-[#B8A9C2]">
                        ({eveningHabits.length} {eveningHabits.length === 1 ? 'routine' : 'routines'})
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8F7D99] truncate">
                      {eveningHabits.map((h) => h.name).join(', ') || 'No routine habits assigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="time"
                      value={reminderTimes.evening}
                      onChange={(e) => handleTimeChange('evening', e.target.value)}
                      className="bg-[#2D1A36] text-white text-xs font-semibold px-2 py-1 rounded-lg border border-[#4D2B5B] focus:border-[#DE72B5] focus:outline-none"
                    />
                    <button
                      onClick={() => handleTriggerTest('evening')}
                      title="Send test evening reminder"
                      className="p-1 rounded-lg bg-[#2D1A36] hover:bg-[#40234D] text-[#DE72B5] hover:text-white border border-[#4D2B5B] transition-colors text-[10px] flex items-center gap-1 px-2"
                    >
                      <Send className="w-2.5 h-2.5" />
                      {testSentSlot === 'evening' ? 'Sent!' : 'Test'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Palette / Theme selection */}
          <div className="pt-2 border-t border-[#DE72B5]/20">
            <label className="text-xs font-semibold text-white block mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#DE72B5]" />
              Studio Theme &amp; Accent
            </label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => {
                    soundService.playSlideClick();
                    onUpdateSettings({ theme: t.id });
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                    settings.theme === t.id
                      ? 'bg-[#40234D] border-[#DE72B5] text-white font-bold shadow-sm'
                      : 'bg-[#1D0F22]/90 border-[#4D2B5B] text-[#B8A9C2] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <span>{t.label}</span>
                  </div>
                  {settings.theme === t.id && <Check className="w-4 h-4 text-[#DE72B5]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Security & Passcode Lock */}
          <div className="pt-2 border-t border-[#DE72B5]/20">
            <label className="text-xs font-semibold text-white block mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#DE72B5]" />
              PIN Passcode Security
            </label>

            <div className="bg-[#1D0F22]/90 rounded-2xl p-3.5 border border-[#4D2B5B] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white block">4-Digit Passcode Lock</span>
                  <span className="text-[11px] text-[#B8A9C2]">
                    {settings.pinEnabled ? 'Enabled • Data locked on idle' : 'Disabled'}
                  </span>
                </div>

                <button
                  id="toggle-pin-btn"
                  onClick={() => {
                    if (settings.pinEnabled) {
                      onUpdateSettings({ pinEnabled: false, pinCode: '' });
                    } else {
                      onOpenSetPinModal();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    settings.pinEnabled
                      ? 'bg-[#40234D] text-[#DE72B5] border border-[#DE72B5]/40'
                      : 'majestic-btn-primary shadow-sm'
                  }`}
                >
                  {settings.pinEnabled ? 'Disable PIN' : 'Set Up PIN'}
                </button>
              </div>

              {settings.pinEnabled && (
                <button
                  id="change-pin-btn"
                  onClick={onOpenSetPinModal}
                  className="text-xs text-[#DE72B5] hover:text-[#FFBBE2] underline underline-offset-2 font-medium"
                >
                  Change existing 4-digit PIN
                </button>
              )}
            </div>
          </div>

          {/* Sound & Audio Feedback */}
          <div className="pt-2 border-t border-[#DE72B5]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#DE72B5]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#8F7D99]" />
              )}
              <div>
                <span className="text-xs font-medium text-white block">Sound Effects &amp; Practice Alarm</span>
                <span className="text-[11px] text-[#B8A9C2]">Metronome ticks, practice alarm &amp; chimes</span>
              </div>
            </div>

            <button
              id="toggle-sound-btn"
              onClick={() => {
                const next = !settings.soundEnabled;
                soundService.setSoundEnabled(next);
                onUpdateSettings({ soundEnabled: next });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-[#B63E88]' : 'bg-[#2D1A36] border border-[#4D2B5B]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset Data */}
          <div className="pt-2 border-t border-[#DE72B5]/20 flex items-center justify-between">
            <span className="text-xs text-[#DDD8E2]">Restore Default Repertoire &amp; Samples</span>
            <button
              id="reset-defaults-btn"
              onClick={() => {
                if (confirm('Reset all piano repertoire and sample logs to initial templates?')) {
                  onResetToDefaults();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-[#2D1A36] hover:bg-[#40234D] text-[#DDD8E2] hover:text-white text-xs font-medium rounded-xl border border-[#4D2B5B] transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-[#DE72B5]" />
              Reset Defaults
            </button>
          </div>

          {/* App Brand & Logo Badge */}
          <div className="pt-3 border-t border-[#DE72B5]/20 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Maestroso Logo"
                referrerPolicy="no-referrer"
                className="w-7 h-7 object-contain rounded-lg shadow"
              />
              <div>
                <p className="text-[11px] font-bold text-white font-serif tracking-wider uppercase leading-none">
                  MAESTROSO
                </p>
                <p className="text-[9px] text-[#B8A9C2] mt-0.5">
                  Piano Practice Tracker • v2.4
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-[#DE72B5] bg-[#DE72B5]/10 px-2 py-0.5 rounded-full border border-[#DE72B5]/30">
              Active
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

