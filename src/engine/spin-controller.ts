import { PHYSICS_CONFIG } from "../core/constants.ts";
import { SpinResult, SpinStatus, WheelSector } from "../types/wheel.ts";
import { WheelCanvas } from "./wheel-canvas.ts";

export interface SpinControllerCallbacks {
  readonly onStatusChange?: (status: SpinStatus) => void;
  readonly onSpinComplete?: (result: SpinResult) => void;
}

/**
 * Manages game state, deterministic angle calculation, and physics deceleration loop.
 */
export class SpinController {
  private readonly wheelCanvas: WheelCanvas;
  private sectors: readonly WheelSector[];
  private readonly callbacks: SpinControllerCallbacks;

  private status: SpinStatus = "IDLE";
  private animationFrameId: number | null = null;
  private currentAngleRad: number = 0;

  constructor(
    wheelCanvas: WheelCanvas,
    sectors: readonly WheelSector[],
    callbacks: SpinControllerCallbacks = {}
  ) {
    this.wheelCanvas = wheelCanvas;
    this.sectors = sectors;
    this.callbacks = callbacks;
  }

  public getStatus(): SpinStatus {
    return this.status;
  }

  public isBusy(): boolean {
    return this.status === "SPINNING";
  }

  /**
   * Updates sector list.
   */
  public updateSectors(newSectors: readonly WheelSector[]): void {
    if (this.status === "SPINNING") return;
    this.sectors = newSectors;
    this.wheelCanvas.updateSectors(newSectors);
  }

  /**
   * Initiates the spin sequence.
   * Resolves with the deterministic SpinResult upon completion.
   */
  public spin(): Promise<SpinResult> {
    if (this.status === "SPINNING") {
      return Promise.reject(new Error("Wheel is currently in motion"));
    }

    this.setStatus("SPINNING");

    // 1. Determine winning sector via Weighted Random Selection
    const winningSectorIndex = this.selectWinningSectorIndex();
    const winningSector = this.sectors[winningSectorIndex];
    if (!winningSector) {
      throw new Error(`Invalid winning sector index: ${winningSectorIndex}`);
    }

    // 2. Compute exact deterministic target angle
    const targetAngleRad = this.calculateTargetAngle(winningSectorIndex);
    const startAngleRad = this.currentAngleRad;
    const totalRotationRad = targetAngleRad - startAngleRad;

    // 3. Prepare result data
    const now = new Date();
    const result: SpinResult = {
      id: `spin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sectorId: winningSector.id,
      category: winningSector.category,
      label: winningSector.label,
      description: winningSector.description,
      timestamp: Date.now(),
      formattedTime: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    return new Promise((resolve) => {
      const startTime = performance.now();
      const durationMs = PHYSICS_CONFIG.SPIN_DURATION_MS;
      const exponent = PHYSICS_CONFIG.DECELERATION_EXPONENT;

      const animate = (currentTime: number) => {
        const elapsedMs = currentTime - startTime;
        const progressT = Math.min(1, elapsedMs / durationMs);

        // easeOutQuart curve: 1 - (1 - t)^4
        const easedProgress = 1 - Math.pow(1 - progressT, exponent);
        this.currentAngleRad = startAngleRad + totalRotationRad * easedProgress;

        // Instantaneous angular velocity for pointer deflection & audio pitch
        const instantaneousVelocity = progressT < 1
          ? (totalRotationRad / (durationMs / 1000)) * exponent * Math.pow(1 - progressT, exponent - 1)
          : 0;

        this.wheelCanvas.setAngle(this.currentAngleRad, instantaneousVelocity);

        if (progressT < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          // Snap exact target and conclude spin
          this.currentAngleRad = targetAngleRad;
          this.wheelCanvas.setAngle(this.currentAngleRad, 0);
          this.setStatus("COMPLETED");
          this.callbacks.onSpinComplete?.(result);
          resolve(result);
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  /**
   * Weighted random selection algorithm (O(N)).
   */
  private selectWinningSectorIndex(): number {
    const totalWeight = this.sectors.reduce((acc, sector) => acc + sector.weight, 0);
    if (totalWeight <= 0) {
      return 0;
    }

    const randomThreshold = Math.random() * totalWeight;
    let cumulative = 0;

    for (let i = 0; i < this.sectors.length; i++) {
      const sector = this.sectors[i];
      if (!sector) continue;
      cumulative += sector.weight;
      if (randomThreshold <= cumulative) {
        return i;
      }
    }

    return this.sectors.length - 1;
  }

  /**
   * Calculates the exact final radian angle so that the top needle rests safely within the winning sector.
   */
  private calculateTargetAngle(targetSectorIndex: number): number {
    const totalSectors = this.sectors.length;
    const arcStep = (Math.PI * 2) / totalSectors;

    // Safety margin to prevent stopping awkwardly on the divider line
    const maxOffset = (arcStep / 2) - PHYSICS_CONFIG.SAFETY_MARGIN_RAD;
    const randomInSectorOffset = (Math.random() * 2 - 1) * Math.max(0.01, maxOffset * 0.7);

    // Relative angle of the center of target sector on the wheel disc
    const sectorCenterAngle = (targetSectorIndex + 0.5) * arcStep + randomInSectorOffset;

    // Pointer is located at POINTER_ANGLE_OFFSET_RAD (-PI/2)
    const pointerAngle = PHYSICS_CONFIG.POINTER_ANGLE_OFFSET_RAD;

    // Wheel angle needed so that wheelAngle + sectorCenterAngle == pointerAngle (mod 2PI)
    // wheelAngle = pointerAngle - sectorCenterAngle
    const baseTargetNormalized = (pointerAngle - sectorCenterAngle) % (Math.PI * 2);

    // Number of full rotations
    const fullRounds = PHYSICS_CONFIG.MIN_FULL_ROUNDS + Math.floor(Math.random() * (PHYSICS_CONFIG.MAX_ADDITIONAL_ROUNDS + 1));
    const extraRotationsRad = fullRounds * Math.PI * 2;

    // Ensure forward progression relative to current angle
    const currentNormalized = this.currentAngleRad % (Math.PI * 2);
    let delta = baseTargetNormalized - currentNormalized;
    while (delta <= 0) {
      delta += Math.PI * 2;
    }

    return this.currentAngleRad + delta + extraRotationsRad;
  }

  private setStatus(newStatus: SpinStatus): void {
    this.status = newStatus;
    this.callbacks.onStatusChange?.(newStatus);
  }

  /**
   * Cleanup animation frame on destroy.
   */
  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

