import { WheelSector } from "../types/wheel.ts";

/**
 * Global constant definitions.
 * Follows Rule: All numeric thresholds must be named constants — never hardcoded inline.
 */

export const CANVAS_CONFIG = {
  BASE_SIZE_PX: 460,
  DEFAULT_SCALE_DPR: 2,
  RIM_WIDTH_PX: 22,
  CENTER_HUB_RADIUS_PX: 58,
  POINTER_WIDTH_PX: 32,
  POINTER_HEIGHT_PX: 46,
  PEG_COUNT: 24, // 24 pegs = 6 pegs per 90-degree quadrant
  PEG_RADIUS_PX: 5.0,
} as const;

export const PHYSICS_CONFIG = {
  MIN_FULL_ROUNDS: 6,
  MAX_ADDITIONAL_ROUNDS: 3,
  SPIN_DURATION_MS: 5000,
  DECELERATION_EXPONENT: 4, // easeOutQuart curve exponent
  POINTER_ANGLE_OFFSET_RAD: -Math.PI / 2, // Top pointer at 12 o'clock (-90 deg)
  SAFETY_MARGIN_RAD: 0.12, // Keep pointer safely inside sector slice borders
} as const;

export const AUDIO_CONFIG = {
  TICK_BASE_FREQ_HZ: 880,
  TICK_FREQ_VARIANCE_HZ: 220,
  TICK_DURATION_SEC: 0.045,
  WIN_CHIME_FREQUENCIES: [523.25, 659.25, 783.99, 1046.5, 1318.5], // C5, E5, G5, C6, E6
  ZONK_FREQUENCIES: [320, 270, 220, 175], // Playful descending slide
  DEFAULT_VOLUME: 0.5,
} as const;

export const STORAGE_KEYS = {
  SPIN_HISTORY: "spin_matapadi_history_v1",
  AUDIO_MUTED: "spin_matapadi_muted_v1",
} as const;

/**
 * 4 Core Items Configuration:
 * 1. Ganci (Gantungan Kunci Souvenir)
 * 2. Stiker (Stiker Eksklusif Matapadi)
 * 3. Refreshment (Konsumsi / Minuman Segar Booth)
 * 4. Zonk (Kesempatan Coba Lagi)
 */
export const DEFAULT_SECTORS: readonly WheelSector[] = [
  {
    id: "sec-ganci",
    category: "ganci",
    label: "GANCI",
    description: "Souvenir Gantungan Kunci Eksklusif Matapadi",
    weight: 25,
    backgroundColor: "#10b981", // Vibrant Emerald Green
    textColor: "#ffffff",
    accentColor: "#fde047",     // Bright Golden Yellow
  },
  {
    id: "sec-stiker",
    category: "stiker",
    label: "STIKER",
    description: "Paket Stiker Kreatif Matapadi Smart Agriculture",
    weight: 30,
    backgroundColor: "#0284c7", // Vivid Ocean / Sky Blue
    textColor: "#ffffff",
    accentColor: "#bae6fd",     // Light Sky
  },
  {
    id: "sec-refreshment",
    category: "refreshment",
    label: "REFRESHMENT",
    description: "Voucher Minuman / Snack Segar Booth Matapadi",
    weight: 15,
    backgroundColor: "#f59e0b", // Radiant Sun Gold / Amber
    textColor: "#0f172a",       // High-contrast deep slate
    accentColor: "#ffffff",     // Crisp White
  },
  {
    id: "sec-zonk",
    category: "zonk",
    label: "ZONK",
    description: "Belum beruntung! Tetap semangat bercocok tanam.",
    weight: 30,
    backgroundColor: "#ef4444", // Bright Coral Red
    textColor: "#ffffff",
    accentColor: "#fef08a",     // Light Gold
  },
] as const;
