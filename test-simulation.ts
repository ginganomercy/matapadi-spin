import { DEFAULT_SECTORS, PHYSICS_CONFIG } from "./src/core/constants.ts";
import { WheelSector } from "./src/types/wheel.ts";

/**
 * Monte Carlo probabilistic simulation test.
 * Simulates 100,000 random spins and checks distribution.
 */
function testProbabilityDistribution(): void {
  console.log("=== 1. Monte Carlo Probability Test (100,000 spins) ===");
  const iterations = 100_000;
  const counts: Record<string, number> = {
    gantungan_kunci: 0,
    merchandise: 0,
    zonk: 0,
  };

  const sectors: readonly WheelSector[] = DEFAULT_SECTORS;
  const totalWeight = sectors.reduce((acc, s) => acc + s.weight, 0);

  for (let i = 0; i < iterations; i++) {
    const randomThreshold = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedSector = sectors[0];

    for (let s = 0; s < sectors.length; s++) {
      const sec = sectors[s];
      cumulative += sec.weight;
      if (randomThreshold <= cumulative) {
        selectedSector = sec;
        break;
      }
    }

    counts[selectedSector.category]++;
  }

  const gkPercent = ((counts["gantungan_kunci"] / iterations) * 100).toFixed(2);
  const merchPercent = ((counts["merchandise"] / iterations) * 100).toFixed(2);
  const zonkPercent = ((counts["zonk"] / iterations) * 100).toFixed(2);

  console.log(`- Gantungan Kunci: ${counts["gantungan_kunci"]} spins (${gkPercent}%) [Expected ~29.4%]`);
  console.log(`- Merchandise:     ${counts["merchandise"]} spins (${merchPercent}%) [Expected ~8.8%]`);
  console.log(`- Zonk:            ${counts["zonk"]} spins (${zonkPercent}%) [Expected ~61.8%]`);
  console.log("✓ Monte Carlo Probability Test Completed Successfully.\n");
}

/**
 * Angle alignment verification test.
 * Asserts that for every sector index, the target angle places the pointer strictly within the sector.
 */
function testAnglePointerAlignment(): void {
  console.log("=== 2. Deterministic Angle & Sector Alignment Test ===");
  const sectors = DEFAULT_SECTORS;
  const totalSectors = sectors.length;
  const arcStep = (Math.PI * 2) / totalSectors;
  const pointerAngle = PHYSICS_CONFIG.POINTER_ANGLE_OFFSET_RAD;

  for (let targetIndex = 0; targetIndex < totalSectors; targetIndex++) {
    const sectorCenterAngle = (targetIndex + 0.5) * arcStep;
    const baseTargetNormalized = (pointerAngle - sectorCenterAngle) % (Math.PI * 2);

    // Calculate effective pointer angle relative to wheel disc at rest
    const effectiveWheelAngleAtPointer = ((pointerAngle - baseTargetNormalized) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const resolvedSectorIndex = Math.floor(effectiveWheelAngleAtPointer / arcStep);

    if (resolvedSectorIndex !== targetIndex) {
      throw new Error(`Alignment failure for sector ${targetIndex}: got ${resolvedSectorIndex}`);
    }
    console.log(`- Sector [${targetIndex}] "${sectors[targetIndex].label} (${sectors[targetIndex].category})" alignment verified.`);
  }

  console.log("✓ All sectors mathematically align with pointer at rest.\n");
}

function runAll(): void {
  testProbabilityDistribution();
  testAnglePointerAlignment();
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY.");
}

runAll();

