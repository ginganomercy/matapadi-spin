/**
 * Core type definitions for the Matapadi Wheel Spin application.
 * All types are strictly typed with zero use of `any`.
 */

export type PrizeCategory = "gantungan_kunci" | "merchandise" | "zonk";

export interface WheelSector {
  readonly id: string;
  readonly category: PrizeCategory;
  readonly label: string;
  readonly description: string;
  readonly weight: number; // Probability weight
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly accentColor: string;
}

export type SpinStatus = "IDLE" | "SPINNING" | "COMPLETED";

export interface SpinResult {
  readonly id: string;
  readonly sectorId: string;
  readonly category: PrizeCategory;
  readonly label: string;
  readonly description: string;
  readonly timestamp: number;
  readonly formattedTime: string;
}

export interface SoundConfig {
  readonly isMuted: boolean;
  readonly masterVolume: number;
}

