import { Habit, RoutineTime, AppSettings } from '../types';
import { soundService } from './audio';

const REMINDER_LOG_KEY = 'maestroso_routine_reminders_log_v1';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

export interface PracticeReminderEvent {
  routineTime: RoutineTime;
  title: string;
  body: string;
  habits: Habit[];
  timestamp: string;
}

class NotificationService {
  /**
   * Check if browser Notification API is available in this environment
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current permission status
   */
  public getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    try {
      return Notification.permission;
    } catch {
      return 'unsupported';
    }
  }

  /**
   * Request permission from user
   */
  public async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Could not request notification permission:', e);
      return 'denied';
    }
  }

  /**
   * Send a browser notification with icon, tag, and sound feedback
   */
  public sendNotification(options: {
    title: string;
    body: string;
    tag?: string;
    onClick?: () => void;
    playSound?: boolean;
  }): boolean {
    if (!this.isSupported()) return false;

    // Play audio reminder chime alongside notification if requested
    if (options.playSound !== false) {
      soundService.playReminderChime();
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notificationOptions: NotificationOptions & { renotify?: boolean } = {
        body: options.body,
        icon: '/logo.png',
        badge: '/favicon.png',
        tag: options.tag || 'maestroso-reminder',
        renotify: true,
      };
      const notification = new Notification(options.title, notificationOptions);

      if (options.onClick) {
        notification.onclick = () => {
          try {
            window.focus();
          } catch {}
          options.onClick?.();
          notification.close();
        };
      }

      // Auto close after 10 seconds
      setTimeout(() => {
        try {
          notification.close();
        } catch {}
      }, 10000);

      return true;
    } catch (e) {
      console.warn('Failed to dispatch Notification:', e);
      return false;
    }
  }

  /**
   * Construct gentle reminder title and body text for a given routine time slot
   */
  public buildRoutineReminderContent(
    routineTime: RoutineTime,
    habits: Habit[]
  ): { title: string; body: string } {
    const routineHabits = habits.filter(
      (h) => !h.archived && h.isRoutine && h.routineTime === routineTime
    );

    const habitNames = routineHabits.map((h) => h.name);
    const hasPianoHabit = routineHabits.some((h) =>
      h.name.toLowerCase().includes('piano') || h.category === 'creativity'
    );

    switch (routineTime) {
      case 'morning':
        return {
          title: '🌅 Morning Practice & Routine Reminder',
          body: habitNames.length > 0
            ? `Ready to start your day? Today's morning routine: ${habitNames.slice(0, 3).join(', ')}.`
            : 'Gentle morning reminder: Take a few peaceful moments for your morning practice routine.',
        };

      case 'afternoon':
        return {
          title: hasPianoHabit ? '🎹 Afternoon Piano Practice Time' : '☀️ Afternoon Routine Reminder',
          body: habitNames.length > 0
            ? `Time for your afternoon focus session: ${habitNames.slice(0, 3).join(', ')}.`
            : 'Take a mindful musical break and revisit your practice goals for today.',
        };

      case 'evening':
        return {
          title: '🌙 Evening Repertoire Polish & Wind Down',
          body: habitNames.length > 0
            ? `Unwind with your evening routine: ${habitNames.slice(0, 3).join(', ')}.`
            : 'Time for your evening music session and peaceful wind-down routine.',
        };

      case 'anytime':
      default:
        return {
          title: '✨ Maestroso Daily Practice Reminder',
          body: habitNames.length > 0
            ? `Keep your daily rhythm strong: ${habitNames.slice(0, 3).join(', ')}.`
            : 'Time for your deliberate daily piano practice session!',
        };
    }
  }

  /**
   * Check if a reminder for this date + slot has already fired
   */
  private hasReminderFiredToday(dateStr: string, routineTime: RoutineTime): boolean {
    try {
      const raw = localStorage.getItem(REMINDER_LOG_KEY);
      if (!raw) return false;
      const log = JSON.parse(raw);
      return Boolean(log[`${dateStr}_${routineTime}`]);
    } catch {
      return false;
    }
  }

  /**
   * Record that a reminder fired for this date + slot
   */
  private markReminderFired(dateStr: string, routineTime: RoutineTime) {
    try {
      const raw = localStorage.getItem(REMINDER_LOG_KEY);
      const log = raw ? JSON.parse(raw) : {};
      log[`${dateStr}_${routineTime}`] = Date.now();
      localStorage.setItem(REMINDER_LOG_KEY, JSON.stringify(log));
    } catch (e) {
      console.warn('Could not record reminder log:', e);
    }
  }

  /**
   * Check schedule and trigger reminders if current time matches scheduled routine time
   */
  public checkAndTriggerScheduledReminders(
    habits: Habit[],
    settings: AppSettings,
    onReminderTriggered?: (event: PracticeReminderEvent) => void
  ) {
    if (!settings.notificationsEnabled) return;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const dateStr = now.toISOString().split('T')[0];

    const routineSlots: Array<{ slot: RoutineTime; timeString: string }> = [
      { slot: 'morning', timeString: settings.routineReminderTimes?.morning || '09:00' },
      { slot: 'afternoon', timeString: settings.routineReminderTimes?.afternoon || '14:00' },
      { slot: 'evening', timeString: settings.routineReminderTimes?.evening || '19:30' },
    ];

    for (const { slot, timeString } of routineSlots) {
      const [hStr, mStr] = timeString.split(':');
      const scheduledMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);

      // Check if current time is within a 4-minute window of the scheduled time
      // and hasn't fired yet today
      const diff = Math.abs(currentTimeInMinutes - scheduledMinutes);
      if (diff <= 3) {
        if (!this.hasReminderFiredToday(dateStr, slot)) {
          const slotHabits = habits.filter(
            (h) => !h.archived && h.isRoutine && h.routineTime === slot
          );

          // Build notification message
          const { title, body } = this.buildRoutineReminderContent(slot, habits);

          // Mark as fired first to avoid race conditions
          this.markReminderFired(dateStr, slot);

          // Dispatch browser notification
          this.sendNotification({
            title,
            body,
            tag: `maestroso-${dateStr}-${slot}`,
          });

          // Callback for in-app alert/toast if listener is provided
          onReminderTriggered?.({
            routineTime: slot,
            title,
            body,
            habits: slotHabits,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  /**
   * Manually trigger a test notification for preview and verification
   */
  public sendTestReminder(
    routineTime: RoutineTime,
    habits: Habit[],
    onReminderTriggered?: (event: PracticeReminderEvent) => void
  ): boolean {
    const { title, body } = this.buildRoutineReminderContent(routineTime, habits);
    const slotHabits = habits.filter(
      (h) => !h.archived && h.isRoutine && h.routineTime === routineTime
    );

    const sent = this.sendNotification({
      title: `[Test] ${title}`,
      body,
      tag: `maestroso-test-${Date.now()}`,
    });

    onReminderTriggered?.({
      routineTime,
      title: `[Test] ${title}`,
      body,
      habits: slotHabits,
      timestamp: new Date().toISOString(),
    });

    return sent;
  }
}

export const notificationService = new NotificationService();
