import { WheelSector } from "../types/wheel.ts";

/**
 * Global constant definitions for Nordic Botanical Print Theme.
 * Follows Rule: All numeric thresholds must be named constants — never hardcoded inline.
 */

export const CANVAS_CONFIG = {
  BASE_SIZE_PX: 460,
  DEFAULT_SCALE_DPR: 2,
  RIM_WIDTH_PX: 20,
  CENTER_HUB_RADIUS_PX: 56,
  POINTER_WIDTH_PX: 26,
  POINTER_HEIGHT_PX: 40,
  PEG_COUNT: 24, // 24 brass/wood rivets (3 rivets per 45-degree sector)
  PEG_RADIUS_PX: 4.2,
} as const;

export const PHYSICS_CONFIG = {
  MIN_FULL_ROUNDS: 6,
  MAX_ADDITIONAL_ROUNDS: 3,
  SPIN_DURATION_MS: 5000,
  DECELERATION_EXPONENT: 4, // easeOutQuart curve
  POINTER_ANGLE_OFFSET_RAD: -Math.PI / 2, // Top pointer at 12 o'clock (-90 deg)
  SAFETY_MARGIN_RAD: 0.10, // Safe margin within 45-degree sector slice borders
} as const;

export const AUDIO_CONFIG = {
  TICK_BASE_FREQ_HZ: 720,
  TICK_FREQ_VARIANCE_HZ: 160,
  TICK_DURATION_SEC: 0.04,
  WIN_CHIME_FREQUENCIES: [523.25, 659.25, 783.99, 1046.5], // Warm acoustic chime
  ZONK_FREQUENCIES: [260, 220, 180], // Dignified acoustic closure
  DEFAULT_VOLUME: 0.40,
} as const;

export const STORAGE_KEYS = {
  SPIN_HISTORY: "spin_matapadi_history_v1",
  AUDIO_MUTED: "spin_matapadi_muted_v1",
  LOCKOUT_STATE: "spin_matapadi_lockout_v1",
} as const;

/**
 * Nordic Botanical Print Palette — 8 Balanced Sectors (4 Items x 2).
 * Colors inspired by natural herbs, terracotta ceramics, dried oat grains, and peat earth:
 * 1. Ganci: Sage Leaf Green (#4E6554)
 * 2. Stiker: Warm Terracotta Clay (#BD6B42)
 * 3. Refreshment: Dried Oat / Wheat Gold (#CBA258)
 * 4. Zonk: Washed Peat Charcoal (#3A3E3B)
 */
export const DEFAULT_SECTORS: readonly WheelSector[] = [
  {
    id: "sec-ganci-1",
    category: "ganci",
    label: "GANCI",
    description: "Souvenir Gantungan Kunci Eksklusif Matapadi",
    weight: 12.5,
    backgroundColor: "#4E6554", // Sage Leaf Green
    textColor: "#FAF8F5",       // Warm Cotton White
    accentColor: "#E0D7C6",     // Soft Oat
  },
  {
    id: "sec-stiker-1",
    category: "stiker",
    label: "STIKER",
    description: "Paket Stiker Koleksi Smart Agriculture",
    weight: 15.0,
    backgroundColor: "#BD6B42", // Warm Terracotta Clay
    textColor: "#FAF8F5",       // Warm Cotton White
    accentColor: "#F5EBE1",     // Pale Linen
  },
  {
    id: "sec-refreshment-1",
    category: "refreshment",
    label: "REFRESHMENT",
    description: "Voucher Konsumsi & Minuman Segar Booth",
    weight: 7.5,
    backgroundColor: "#CBA258", // Dried Oat / Wheat Gold
    textColor: "#2B2823",       // Deep Slate Brown
    accentColor: "#FAF8F5",     // Warm Cotton White
  },
  {
    id: "sec-zonk-1",
    category: "zonk",
    label: "ZONK",
    description: "Kesempatan Anda telah selesai. Terima kasih telah berpartisipasi.",
    weight: 15.0,
    backgroundColor: "#3A3E3B", // Washed Peat Charcoal
    textColor: "#FAF8F5",       // Warm Cotton White
    accentColor: "#B5B9B6",     // Soft Pebble
  },
  {
    id: "sec-ganci-2",
    category: "ganci",
    label: "GANCI",
    description: "Souvenir Gantungan Kunci Eksklusif Matapadi",
    weight: 12.5,
    backgroundColor: "#4E6554", // Sage Leaf Green
    textColor: "#FAF8F5",       // Warm Cotton White
    accentColor: "#E0D7C6",     // Soft Oat
  },
  {
    id: "sec-stiker-2",
    category: "stiker",
    label: "STIKER",
    description: "Paket Stiker Koleksi Smart Agriculture",
    weight: 15.0,
    backgroundColor: "#BD6B42", // Warm Terracotta Clay
    textColor: "#FAF8F5",       // Warm Cotton White
    accentColor: "#F5EBE1",     // Pale Linen
  },
  {
    id: "sec-refreshment-2",
    category: "refreshment",
    label: "REFRESHMENT",
    description: "Voucher Konsumsi & Minuman Segar Booth",
    weight: 7.5,
    backgroundColor: "#CBA258", // Dried Oat / Wheat Gold
    textColor: "#2B2823",       // Deep Slate Brown
    accentColor: "#FAF8F5",     // Warm Cotton White
  },
  {
    id: "sec-zonk-2",
    category: "zonk",
    label: "ZONK",
    description: "Kesempatan Anda telah selesai. Terima kasih telah berpartisipasi.",
    weight: 15.0,
    backgroundColor: "#3A3E3B", // Washed Peat Charcoal
    textColor: "#FAF8F5",       // Warm Cotton White
    accentColor: "#B5B9B6",     // Soft Pebble
  },
] as const;
