import { WheelSector } from "../types/wheel.ts";

/**
 * Global constant definitions.
 * Follows Rule: All numeric thresholds must be named constants — never hardcoded inline.
 */

export const CANVAS_CONFIG = {
  // Ergonomic base size ensuring wheel & button both fit on laptop screens without scrolling
  BASE_SIZE_PX: 460,
  DEFAULT_SCALE_DPR: 2,
  RIM_WIDTH_PX: 22,
  CENTER_HUB_RADIUS_PX: 58,
  POINTER_WIDTH_PX: 32,
  POINTER_HEIGHT_PX: 46,
  PEG_COUNT: 24,
  PEG_RADIUS_PX: 5.0,
} as const;

export const PHYSICS_CONFIG = {
  MIN_FULL_ROUNDS: 6,
  MAX_ADDITIONAL_ROUNDS: 3,
  SPIN_DURATION_MS: 5000,
  DECELERATION_EXPONENT: 4, // easeOutQuart curve exponent
  POINTER_ANGLE_OFFSET_RAD: -Math.PI / 2, // Top pointer at 12 o'clock (-90 deg)
  SAFETY_MARGIN_RAD: 0.09, // Keep pointer safely inside sector slice borders
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
 * High-Vibrancy Agricultural Palette (Matapadi "Kuat & Terang").
 * Strong, bright, luminous colors with clear visual distinction:
 * - Gantungan Kunci: Vibrant Emerald / Bright Leaf Green (#10b981 / #059669)
 * - Merchandise (Hadiah Utama): Radiant Sun Gold / Vivid Amber (#f59e0b / #fbbf24)
 * - Zonk: Bright Punchy Coral / Vivid Vermilion (#ef4444 / #f43f5e)
 */
export const DEFAULT_SECTORS: readonly WheelSector[] = [
  {
    id: "sec-gk-1",
    category: "gantungan_kunci",
    label: "GANTUNGAN KUNCI",
    description: "Souvenir Gantungan Kunci Eksklusif Matapadi",
    weight: 25,
    backgroundColor: "#10b981", // Vibrant Emerald Green
    textColor: "#ffffff",
    accentColor: "#fde047",     // Bright Golden Yellow
  },
  {
    id: "sec-zonk-1",
    category: "zonk",
    label: "ZONK",
    description: "Belum beruntung! Tetap semangat, ladang rezeki masih luas.",
    weight: 35,
    backgroundColor: "#ef4444", // Bright Punchy Coral Red
    textColor: "#ffffff",
    accentColor: "#fef08a",     // Light Gold
  },
  {
    id: "sec-merch-1",
    category: "merchandise",
    label: "MERCHANDISE",
    description: "Paket Merchandise Spesial Eksklusif Matapadi",
    weight: 15,
    backgroundColor: "#f59e0b", // Radiant Sun Gold / Vivid Amber
    textColor: "#1e293b",       // Deep Slate for maximum contrast against gold
    accentColor: "#ffffff",     // Crisp White
  },
  {
    id: "sec-zonk-2",
    category: "zonk",
    label: "ZONK",
    description: "Coba lagi! Panen keberuntungan masih menanti Anda.",
    weight: 35,
    backgroundColor: "#f43f5e", // Vivid Rose Vermilion
    textColor: "#ffffff",
    accentColor: "#fef08a",     // Light Gold
  },
  {
    id: "sec-gk-2",
    category: "gantungan_kunci",
    label: "GANTUNGAN KUNCI",
    description: "Souvenir Gantungan Kunci Eksklusif Matapadi",
    weight: 25,
    backgroundColor: "#059669", // Deep Emerald
    textColor: "#ffffff",
    accentColor: "#fde047",     // Bright Golden Yellow
  },
  {
    id: "sec-zonk-3",
    category: "zonk",
    label: "ZONK",
    description: "Belum rezeki! Putar sekali lagi untuk hadiah impian.",
    weight: 35,
    backgroundColor: "#dc2626", // Bright Electric Red
    textColor: "#ffffff",
    accentColor: "#fef08a",     // Light Gold
  },
] as const;
