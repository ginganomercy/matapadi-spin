import { WheelSector } from "../types/wheel.ts";

/**
 * Global constant definitions.
 * Follows Rule: All numeric thresholds must be named constants — never hardcoded inline.
 */

export const CANVAS_CONFIG = {
  BASE_SIZE_PX: 460,
  DEFAULT_SCALE_DPR: 2,
  RIM_WIDTH_PX: 20,
  CENTER_HUB_RADIUS_PX: 56,
  POINTER_WIDTH_PX: 28,
  POINTER_HEIGHT_PX: 42,
  PEG_COUNT: 24, // 24 brass pegs around rim
  PEG_RADIUS_PX: 4.5,
} as const;

export const PHYSICS_CONFIG = {
  MIN_FULL_ROUNDS: 6,
  MAX_ADDITIONAL_ROUNDS: 3,
  SPIN_DURATION_MS: 5000,
  DECELERATION_EXPONENT: 4, // easeOutQuart curve
  POINTER_ANGLE_OFFSET_RAD: -Math.PI / 2, // Top needle at 12 o'clock (-90 deg)
  SAFETY_MARGIN_RAD: 0.14, // Safe margin from slice borders
} as const;

export const AUDIO_CONFIG = {
  TICK_BASE_FREQ_HZ: 760,
  TICK_FREQ_VARIANCE_HZ: 180,
  TICK_DURATION_SEC: 0.04,
  WIN_CHIME_FREQUENCIES: [523.25, 659.25, 783.99, 1046.5], // Harmonic fanfare
  ZONK_FREQUENCIES: [260, 220, 180], // Discreet, dignified closure
  DEFAULT_VOLUME: 0.45,
} as const;

export const STORAGE_KEYS = {
  SPIN_HISTORY: "spin_matapadi_history_v1",
  AUDIO_MUTED: "spin_matapadi_muted_v1",
  LOCKOUT_STATE: "spin_matapadi_lockout_v1",
} as const;

/**
 * Editorial Agritech Palette — Organic, mature, human-crafted.
 * Replaces generic AI candy colors with earthy agricultural tones:
 * 1. Ganci: Deep Cypress Green (#1b4332)
 * 2. Stiker: Fresh Eucalyptus / Sage (#3d7055)
 * 3. Refreshment: Warm Harvest Ochre (#c58940)
 * 4. Zonk: Muted Charcoal Earth (#343a40)
 */
export const DEFAULT_SECTORS: readonly WheelSector[] = [
  {
    id: "sec-ganci",
    category: "ganci",
    label: "GANCI",
    description: "Souvenir Gantungan Kunci Eksklusif Matapadi",
    weight: 25,
    backgroundColor: "#1b4332", // Deep Cypress Green
    textColor: "#fefae0",       // Warm Ivory
    accentColor: "#e9c46a",     // Golden Wheat
  },
  {
    id: "sec-stiker",
    category: "stiker",
    label: "STIKER",
    description: "Paket Stiker Koleksi Smart Agriculture",
    weight: 30,
    backgroundColor: "#3d7055", // Fresh Eucalyptus / Sage
    textColor: "#fefae0",       // Warm Ivory
    accentColor: "#c7f9cc",     // Pale Sprout
  },
  {
    id: "sec-refreshment",
    category: "refreshment",
    label: "REFRESHMENT",
    description: "Voucher Konsumsi & Minuman Segar Booth",
    weight: 15,
    backgroundColor: "#c58940", // Warm Harvest Ochre
    textColor: "#ffffff",       // Clean White
    accentColor: "#fefae0",     // Warm Ivory
  },
  {
    id: "sec-zonk",
    category: "zonk",
    label: "ZONK",
    description: "Kesempatan Anda telah selesai. Terima kasih telah berpartisipasi.",
    weight: 30,
    backgroundColor: "#343a40", // Dignified Charcoal Earth
    textColor: "#e9ecef",       // Soft Slate
    accentColor: "#adb5bd",     // Muted Gray
  },
] as const;
