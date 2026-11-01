/**
 * Core type definitions for the Matapadi Wheel Spin application.
 * Strictly typed with 4 distinct prize categories.
 */

export type PrizeCategory = "ganci" | "stiker" | "refreshment" | "zonk";

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
