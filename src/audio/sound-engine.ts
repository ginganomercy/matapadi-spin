import { AUDIO_CONFIG, STORAGE_KEYS } from "../core/constants.ts";

/**
 * Procedural Sound Engine using Native Web Audio API.
 * Generates all sound effects dynamically without loading any external .mp3 files.
 */
export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.restoreMuteState();
  }

  /**
   * Initializes or resumes the AudioContext on user interaction to comply with browser autoplay policies.
   */
  public async ensureContext(): Promise<void> {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  /**
   * Plays a crisp mechanical tick sound when a peg passes the pointer.
   * Pitch varies slightly based on angular velocity for enhanced realism.
   */
  public playTick(velocityRatio: number): void {
    if (this.isMuted) return;
    void this.ensureContext().then(() => {
      if (!this.audioContext) return;

      const currentTime = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      // Bandpass filter to simulate mechanical plastic/wooden peg contact
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, currentTime);
      filter.Q.setValueAtTime(3.0, currentTime);

      const normalizedVelocity = Math.max(0.1, Math.min(1.0, velocityRatio));
      const targetFrequency = AUDIO_CONFIG.TICK_BASE_FREQ_HZ + (normalizedVelocity * AUDIO_CONFIG.TICK_FREQ_VARIANCE_HZ);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(targetFrequency, currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, currentTime + AUDIO_CONFIG.TICK_DURATION_SEC);

      const dynamicVolume = AUDIO_CONFIG.DEFAULT_VOLUME * (0.4 + 0.6 * normalizedVelocity);
      gain.gain.setValueAtTime(dynamicVolume, currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, currentTime + AUDIO_CONFIG.TICK_DURATION_SEC);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(currentTime);
      osc.stop(currentTime + AUDIO_CONFIG.TICK_DURATION_SEC);
    });
  }

  /**
   * Plays a celebratory golden fanfare arpeggio on prize win.
   */
  public playWinFanfare(): void {
    if (this.isMuted) return;
    void this.ensureContext().then(() => {
      if (!this.audioContext) return;

      const notes = AUDIO_CONFIG.WIN_CHIME_FREQUENCIES;
      const noteDurationSec = 0.16;

      notes.forEach((freq, index) => {
        if (!this.audioContext) return;
        const noteStartTime = this.audioContext.currentTime + (index * noteDurationSec);
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStartTime);

        const decayDuration = index === notes.length - 1 ? 0.8 : 0.25;
        gain.gain.setValueAtTime(0, noteStartTime);
        gain.gain.linearRampToValueAtTime(AUDIO_CONFIG.DEFAULT_VOLUME * 0.9, noteStartTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + decayDuration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(noteStartTime);
        osc.stop(noteStartTime + decayDuration);
      });
    });
  }

  /**
   * Plays a lighthearted descending comedic tone on Zonk.
   */
  public playZonkSound(): void {
    if (this.isMuted) return;
    void this.ensureContext().then(() => {
      if (!this.audioContext) return;

      const notes = AUDIO_CONFIG.ZONK_FREQUENCIES;
      const noteDurationSec = 0.18;

      notes.forEach((freq, index) => {
        if (!this.audioContext) return;
        const noteStartTime = this.audioContext.currentTime + (index * noteDurationSec);
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, noteStartTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, noteStartTime + noteDurationSec);

        gain.gain.setValueAtTime(AUDIO_CONFIG.DEFAULT_VOLUME * 0.5, noteStartTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStartTime + noteDurationSec);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(noteStartTime);
        osc.stop(noteStartTime + noteDurationSec);
      });
    });
  }

  /**
   * Toggles mute state and persists preference in localStorage.
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIO_MUTED, JSON.stringify(this.isMuted));
    } catch {
      // LocalStorage access might be restricted in private/sandbox mode
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private restoreMuteState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIO_MUTED);
      if (stored !== null) {
        this.isMuted = JSON.parse(stored) === true;
      }
    } catch {
      this.isMuted = false;
    }
  }
}

