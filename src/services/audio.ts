/**
 * Web Audio Synthesizer for UI feedback, habit completions, and timer alarms.
 * Works completely offline with zero external audio assets.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  private getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Crisp celebratory chime when a habit is completed via slide
   */
  public playHabitComplete() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Multi-tone cheerful chime (E5 -> G#5 -> B5 -> E6)
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch {
      // Ignore audio failure gracefully
    }
  }

  /**
   * Tactile slide snap sound
   */
  public playSlideClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  /**
   * Subtle tick for countdown timer
   */
  public playTimerTick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  /**
   * Rich Piano practice timer alarm / bell that rings when practice session finishes
   */
  public playPracticeAlarm() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Repeating warm bell pattern (like a cathedral / studio bell chime)
      const repetitions = 3;
      for (let r = 0; r < repetitions; r++) {
        const start = now + r * 0.9;
        
        // Bell fundamental and harmonic overtones
        const freqs = [523.25, 1046.5, 1318.51, 1567.98]; // C5, C6, E6, G6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, start);

          const vol = idx === 0 ? 0.25 : 0.08 / (idx + 1);
          gain.gain.setValueAtTime(0.001, start);
          gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.85);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.9);
        });
      }
    } catch {}
  }

  /**
   * Gentle, soothing musical chime for scheduled practice reminders
   */
  public playReminderChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Elegant arpeggiated piano-like reminder chord (C5, G5, C6, E6)
      const freqs = [523.25, 783.99, 1046.50, 1318.51];
      freqs.forEach((freq, idx) => {
        const start = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.14, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.95);
      });
    } catch {}
  }

  /**
   * Triumphant, sparkling royal celebration fanfare when a milestone is achieved
   */
  public playMilestoneCelebration() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Step 1: Upward soaring arpeggio (C5 -> E5 -> G5 -> B5 -> C6 -> E6 -> G6)
      const arpeggio = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
      arpeggio.forEach((f, idx) => {
        const start = now + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.65);
      });

      // Step 2: Final grand sustained celebratory chord
      const chordStart = now + 0.52;
      const finalChord = [523.25, 659.25, 783.99, 1046.50, 1318.51, 2093.00]; // C5, E5, G5, C6, E6, C7
      finalChord.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, chordStart);

        gain.gain.setValueAtTime(0.001, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.12, chordStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordStart);
        osc.stop(chordStart + 1.85);
      });
    } catch {}
  }
}

export const soundService = new AudioService();
