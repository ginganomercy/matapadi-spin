import { CANVAS_CONFIG, PHYSICS_CONFIG } from "../core/constants.ts";
import { WheelSector } from "../types/wheel.ts";

export interface WheelCanvasOptions {
  readonly canvas: HTMLCanvasElement;
  readonly sectors: readonly WheelSector[];
  readonly onPegHit?: (velocityRatio: number) => void;
}

/**
 * Ultra-Vibrant High-Performance Canvas Wheel Renderer.
 * Features:
 * - Direct embedding of the official Matapadi Smart Agriculture Logo inside the center hub
 * - Bright, high-contrast, luminous agricultural aesthetic
 * - 3D Metallic golden outer rim with shiny chrome/gold rivets
 * - Radial high-legibility typography with dual-stroke contrast
 * - High-DPI auto-scaling & elastic pointer deflection
 */
export class WheelCanvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private sectors: readonly WheelSector[];
  private readonly onPegHit?: (velocityRatio: number) => void;

  private currentAngleRad: number = 0;
  private pointerDeflectionAngleRad: number = 0;
  private lastPegPassedIndex: number = -1;
  private displaySizePx: number = CANVAS_CONFIG.BASE_SIZE_PX;

  // Matapadi Brand Logo
  private logoImage: HTMLImageElement | null = null;
  private isLogoLoaded: boolean = false;

  constructor(options: WheelCanvasOptions) {
    this.canvas = options.canvas;
    const context = this.canvas.getContext("2d", { alpha: true });
    if (!context) {
      throw new Error("Unable to obtain 2D rendering context for Canvas");
    }
    this.ctx = context;
    this.sectors = options.sectors;
    this.onPegHit = options.onPegHit;

    this.initLogoImage();
    this.setupHighDpi();
    this.render();
  }

  private initLogoImage(): void {
    this.logoImage = new Image();
    this.logoImage.src = "/logo-matapadi-smart-agriculture.png";
    this.logoImage.onload = () => {
      this.isLogoLoaded = true;
      this.render();
    };
  }

  public updateSectors(newSectors: readonly WheelSector[]): void {
    this.sectors = newSectors;
    this.render();
  }

  /**
   * Resizes canvas buffer according to container and DPR for ultra-sharp rendering.
   */
  public setupHighDpi(): void {
    const dpr = Math.max(window.devicePixelRatio || 1, CANVAS_CONFIG.DEFAULT_SCALE_DPR);
    const parent = this.canvas.parentElement;
    const availableWidth = parent ? parent.clientWidth : CANVAS_CONFIG.BASE_SIZE_PX;

    // Scale responsively: fits gracefully on laptop screens without pushing spin button below fold
    this.displaySizePx = Math.min(CANVAS_CONFIG.BASE_SIZE_PX, Math.max(280, availableWidth - 20));

    this.canvas.width = this.displaySizePx * dpr;
    this.canvas.height = this.displaySizePx * dpr;
    this.canvas.style.width = `${this.displaySizePx}px`;
    this.canvas.style.height = `${this.displaySizePx}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  public setAngle(angleRad: number, angularVelocity: number = 0): void {
    this.currentAngleRad = angleRad;

    // Detect peg collision for sound & needle deflection
    const pegAngleStep = (Math.PI * 2) / CANVAS_CONFIG.PEG_COUNT;
    const normalizedPointerAngle = ((PHYSICS_CONFIG.POINTER_ANGLE_OFFSET_RAD - angleRad) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const currentPegIndex = Math.floor(normalizedPointerAngle / pegAngleStep);

    if (currentPegIndex !== this.lastPegPassedIndex) {
      this.lastPegPassedIndex = currentPegIndex;
      const normalizedVelocity = Math.min(1.0, Math.abs(angularVelocity) / 12);
      this.pointerDeflectionAngleRad = -0.35 * Math.min(1.0, 0.45 + normalizedVelocity);
      this.onPegHit?.(normalizedVelocity);
    } else {
      // Elastic snap-back
      this.pointerDeflectionAngleRad *= 0.80;
      if (Math.abs(this.pointerDeflectionAngleRad) < 0.005) {
        this.pointerDeflectionAngleRad = 0;
      }
    }

    this.render();
  }

  public getAngle(): number {
    return this.currentAngleRad;
  }

  /**
   * Master render sequence.
   */
  public render(): void {
    const size = this.displaySizePx;
    const center = size / 2;
    const radius = center - CANVAS_CONFIG.RIM_WIDTH_PX - 8;

    this.ctx.clearRect(0, 0, size, size);

    // 1. Ambient Golden-Green Glow behind the entire wheel
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center + 4, radius + CANVAS_CONFIG.RIM_WIDTH_PX + 4, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(16, 185, 129, 0.28)";
    this.ctx.filter = "blur(18px)";
    this.ctx.fill();
    this.ctx.restore();

    // 2. Rotated Disc Layer
    this.ctx.save();
    this.ctx.translate(center, center);
    this.ctx.rotate(this.currentAngleRad);

    this.drawWheelSlices(radius);
    this.drawSliceDividers(radius);
    this.drawOuterRim(radius);
    this.drawRivets(radius);

    this.ctx.restore();

    // 3. Center Hub with official Matapadi Logo
    this.drawCenterHub(center);

    // 4. Top Pointer Needle with 3D Bevel & Drop Shadow
    this.drawPointer(center, radius);
  }

  /**
   * Draws vibrant, high-contrast sector slices with subtle convex sheen.
   */
  private drawWheelSlices(radius: number): void {
    const totalSectors = this.sectors.length;
    const arcStep = (Math.PI * 2) / totalSectors;

    for (let i = 0; i < totalSectors; i++) {
      const sector = this.sectors[i];
      if (!sector) continue;

      const startAngle = i * arcStep;
      const endAngle = startAngle + arcStep;

      // Slice sector geometry
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, startAngle, endAngle);
      this.ctx.closePath();

      // Strong vivid base color
      this.ctx.fillStyle = sector.backgroundColor;
      this.ctx.fill();

      // Radiant radial gloss highlight
      const radialGloss = this.ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
      radialGloss.addColorStop(0, "rgba(255, 255, 255, 0.30)");
      radialGloss.addColorStop(0.55, "rgba(255, 255, 255, 0.06)");
      radialGloss.addColorStop(0.92, "rgba(0, 0, 0, 0.0)");
      radialGloss.addColorStop(1, "rgba(0, 0, 0, 0.22)");
      this.ctx.fillStyle = radialGloss;
      this.ctx.fill();

      // Content (Large Icons & High-Contrast Radial Text)
      this.drawSectorContent(sector, startAngle + arcStep / 2, radius);
    }
  }

  /**
   * Radial high-legibility typography & icons.
   */
  private drawSectorContent(sector: WheelSector, midAngle: number, radius: number): void {
    this.ctx.save();
    this.ctx.rotate(midAngle);

    // Position along radial axis (facing inward from rim towards center)
    const iconPosR = radius * 0.82;
    const textStartR = radius * 0.63;

    // 1. Draw Sector Icon
    this.ctx.save();
    this.ctx.translate(iconPosR, 0);
    this.ctx.rotate(Math.PI / 2);
    this.drawSectorVectorIcon(sector.category);
    this.ctx.restore();

    // 2. Draw Strong Bold Radial Typography
    this.ctx.save();
    this.ctx.translate(textStartR, 0);

    const isGoldMerch = sector.category === "merchandise";
    const primaryTextColor = isGoldMerch ? "#0f172a" : "#ffffff";
    const strokeOutlineColor = isGoldMerch ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)";

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    if (sector.category === "zonk") {
      this.ctx.font = "900 24px 'Inter', system-ui, sans-serif";
      this.ctx.letterSpacing = "2px";
      this.ctx.lineWidth = 3.5;
      this.ctx.strokeStyle = strokeOutlineColor;
      this.ctx.strokeText("ZONK", 0, 0);
      this.ctx.fillStyle = primaryTextColor;
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      this.ctx.shadowBlur = 4;
      this.ctx.fillText("ZONK", 0, 0);

      this.ctx.shadowBlur = 0;
      this.ctx.font = "bold 9.5px 'Inter', sans-serif";
      this.ctx.fillStyle = "#fef08a";
      this.ctx.fillText("COBA LAGI", 0, 18);

    } else if (sector.category === "gantungan_kunci") {
      this.ctx.font = "900 13px 'Inter', system-ui, sans-serif";
      this.ctx.lineWidth = 2.8;
      this.ctx.strokeStyle = strokeOutlineColor;
      this.ctx.strokeText("GANTUNGAN", 0, -8);
      this.ctx.strokeText("KUNCI", 0, 8);

      this.ctx.fillStyle = primaryTextColor;
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      this.ctx.shadowBlur = 4;
      this.ctx.fillText("GANTUNGAN", 0, -8);
      this.ctx.fillText("KUNCI", 0, 8);

      this.ctx.shadowBlur = 0;
      this.ctx.font = "bold 9px 'Inter', sans-serif";
      this.ctx.fillStyle = "#fde047";
      this.ctx.fillText("SOUVENIR", 0, 22);

    } else {
      this.ctx.font = "900 13.5px 'Inter', system-ui, sans-serif";
      this.ctx.letterSpacing = "0.5px";
      this.ctx.lineWidth = 2.8;
      this.ctx.strokeStyle = strokeOutlineColor;
      this.ctx.strokeText("MERCHANDISE", 0, -4);

      this.ctx.fillStyle = primaryTextColor;
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      this.ctx.shadowBlur = 3;
      this.ctx.fillText("MERCHANDISE", 0, -4);

      this.ctx.shadowBlur = 0;
      this.ctx.font = "900 9.5px 'Inter', sans-serif";
      this.ctx.fillStyle = "#78350f";
      this.ctx.fillText("★ HADIAH UTAMA ★", 0, 12);
    }

    this.ctx.restore();
    this.ctx.restore();
  }

  /**
   * Draws vector icons on canvas slices with crisp high-DPI rendering.
   */
  private drawSectorVectorIcon(category: string): void {
    if (category === "merchandise") {
      // 3D Gift Box
      this.ctx.font = "24px system-ui";
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      this.ctx.shadowBlur = 6;
      this.ctx.fillText("🎁", 0, 0);
    } else if (category === "gantungan_kunci") {
      // Keychain / Tag
      this.ctx.font = "24px system-ui";
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      this.ctx.shadowBlur = 6;
      this.ctx.fillText("🏷️", 0, 0);
    } else {
      // Agricultural Leaf / Sprout
      this.ctx.font = "24px system-ui";
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      this.ctx.shadowBlur = 6;
      this.ctx.fillText("🌱", 0, 0);
    }
  }

  /**
   * Draws decorative golden dual-line dividers between sectors.
   */
  private drawSliceDividers(radius: number): void {
    const totalSectors = this.sectors.length;
    const arcStep = (Math.PI * 2) / totalSectors;

    for (let i = 0; i < totalSectors; i++) {
      const angle = i * arcStep;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Gold core divider
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(cosA * radius, sinA * radius);
      this.ctx.strokeStyle = "#fde047";
      this.ctx.lineWidth = 3.5;
      this.ctx.stroke();

      // Crisp white highlight centerline
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(cosA * radius, sinA * radius);
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();
    }
  }

  /**
   * Draws the outer rim with brilliant metallic gold sheen and bevels.
   */
  private drawOuterRim(radius: number): void {
    const rimWidth = CANVAS_CONFIG.RIM_WIDTH_PX;
    const outerRadius = radius + rimWidth;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
    this.ctx.closePath();

    // Metallic Gold Gradient
    const rimGradient = this.ctx.createRadialGradient(0, 0, radius, 0, 0, outerRadius);
    rimGradient.addColorStop(0, "#b45309");
    rimGradient.addColorStop(0.25, "#f59e0b");
    rimGradient.addColorStop(0.5, "#fef08a");
    rimGradient.addColorStop(0.75, "#d97706");
    rimGradient.addColorStop(1, "#78350f");
    this.ctx.fillStyle = rimGradient;
    this.ctx.fill();

    // Inner bright gold contour ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#fef08a";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Outer boundary gold ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, outerRadius - 1, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#fde047";
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();
  }

  /**
   * Draws shiny 3D brass/chrome rivets (pegs) around the rim.
   */
  private drawRivets(radius: number): void {
    const pegCount = CANVAS_CONFIG.PEG_COUNT;
    const pegRadius = CANVAS_CONFIG.PEG_RADIUS_PX;
    const distance = radius + CANVAS_CONFIG.RIM_WIDTH_PX / 2;
    const step = (Math.PI * 2) / pegCount;

    for (let i = 0; i < pegCount; i++) {
      const angle = i * step;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      // Drop shadow for rivet
      this.ctx.beginPath();
      this.ctx.arc(x, y + 1.2, pegRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      this.ctx.fill();

      // Shiny Rivet Sphere
      this.ctx.beginPath();
      this.ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
      const pegGrad = this.ctx.createRadialGradient(x - 1.2, y - 1.2, 0.4, x, y, pegRadius);
      pegGrad.addColorStop(0, "#ffffff"); // Specular glint
      pegGrad.addColorStop(0.35, "#fef08a");
      pegGrad.addColorStop(0.7, "#f59e0b");
      pegGrad.addColorStop(1, "#92400e");
      this.ctx.fillStyle = pegGrad;
      this.ctx.fill();

      this.ctx.strokeStyle = "#78350f";
      this.ctx.lineWidth = 0.8;
      this.ctx.stroke();
    }
  }

  /**
   * Draws the prominent 3D Center Hub with official Matapadi Logo.
   */
  private drawCenterHub(center: number): void {
    const hubRadius = CANVAS_CONFIG.CENTER_HUB_RADIUS_PX;

    // 1. Heavy drop shadow for center dome
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center + 4, hubRadius + 2, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    this.ctx.filter = "blur(8px)";
    this.ctx.fill();
    this.ctx.restore();

    // 2. Beveled Golden Outer Frame
    this.ctx.beginPath();
    this.ctx.arc(center, center, hubRadius, 0, Math.PI * 2);
    const ringGrad = this.ctx.createLinearGradient(center - hubRadius, center - hubRadius, center + hubRadius, center + hubRadius);
    ringGrad.addColorStop(0, "#fef08a");
    ringGrad.addColorStop(0.3, "#f59e0b");
    ringGrad.addColorStop(0.7, "#d97706");
    ringGrad.addColorStop(1, "#78350f");
    this.ctx.fillStyle = ringGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2.2;
    this.ctx.stroke();

    // 3. Inner Circular Disc for Logo
    const innerRadius = hubRadius - 6;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fill();

    // Clip to circle and draw official logo if loaded
    this.ctx.clip();
    if (this.isLogoLoaded && this.logoImage) {
      // Draw logo with crisp padding
      const logoPadding = 4;
      const logoDrawSize = (innerRadius - logoPadding) * 2;
      this.ctx.drawImage(
        this.logoImage,
        center - innerRadius + logoPadding,
        center - innerRadius + logoPadding,
        logoDrawSize,
        logoDrawSize
      );
    } else {
      // Clean fallback if image is still loading
      this.ctx.fillStyle = "#064e3b";
      this.ctx.fill();
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = "26px system-ui";
      this.ctx.fillText("🌾", center, center - 6);
      this.ctx.fillStyle = "#fef08a";
      this.ctx.font = "bold 10px sans-serif";
      this.ctx.fillText("MATAPADI", center, center + 14);
    }
    this.ctx.restore();

    // 4. Subtle Convex Glass Highlight overlay across hub
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    const glassSheen = this.ctx.createLinearGradient(center, center - innerRadius, center, center + innerRadius);
    glassSheen.addColorStop(0, "rgba(255, 255, 255, 0.40)");
    glassSheen.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
    glassSheen.addColorStop(0.6, "rgba(0, 0, 0, 0.0)");
    glassSheen.addColorStop(1, "rgba(0, 0, 0, 0.15)");
    this.ctx.fillStyle = glassSheen;
    this.ctx.fill();

    // Gold inner border ring
    this.ctx.strokeStyle = "#f59e0b";
    this.ctx.lineWidth = 1.8;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Draws the prominent 3D Golden Pointer (Needle) at 12 o'clock with jewel pivot.
   */
  private drawPointer(center: number, radius: number): void {
    const pointerW = CANVAS_CONFIG.POINTER_WIDTH_PX;
    const pointerH = CANVAS_CONFIG.POINTER_HEIGHT_PX;
    const pointerTipY = center - radius + 14;
    const pointerBaseY = pointerTipY - pointerH;

    this.ctx.save();
    this.ctx.translate(center, pointerBaseY);
    this.ctx.rotate(this.pointerDeflectionAngleRad);

    // 1. Pointer Drop Shadow
    this.ctx.beginPath();
    this.ctx.moveTo(0, pointerH + 2);
    this.ctx.lineTo(-pointerW / 2 - 2, 2);
    this.ctx.lineTo(pointerW / 2 + 2, 2);
    this.ctx.closePath();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.filter = "blur(4px)";
    this.ctx.fill();
    this.ctx.filter = "none";

    // 2. Shiny 3D Metallic Golden Needle
    this.ctx.beginPath();
    this.ctx.moveTo(0, pointerH);
    this.ctx.lineTo(-pointerW / 2, 0);
    this.ctx.lineTo(pointerW / 2, 0);
    this.ctx.closePath();

    const arrowGrad = this.ctx.createLinearGradient(-pointerW / 2, 0, pointerW / 2, pointerH);
    arrowGrad.addColorStop(0, "#ffffff");
    arrowGrad.addColorStop(0.2, "#fef08a");
    arrowGrad.addColorStop(0.6, "#f59e0b");
    arrowGrad.addColorStop(1, "#b45309");
    this.ctx.fillStyle = arrowGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 3. Center Spine Highlight
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, pointerH - 2);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    this.ctx.lineWidth = 1.8;
    this.ctx.stroke();

    // 4. Pivot Jewel at Top
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 9, 0, Math.PI * 2);
    const jewelGrad = this.ctx.createRadialGradient(-2, -3, 1, 0, 0, 9);
    jewelGrad.addColorStop(0, "#34d399");
    jewelGrad.addColorStop(0.5, "#059669");
    jewelGrad.addColorStop(1, "#022c22");
    this.ctx.fillStyle = jewelGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#fef08a";
    this.ctx.lineWidth = 2.2;
    this.ctx.stroke();

    this.ctx.restore();
  }
}
