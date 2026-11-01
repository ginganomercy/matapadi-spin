import { CANVAS_CONFIG, PHYSICS_CONFIG } from "../core/constants.ts";
import { WheelSector } from "../types/wheel.ts";

export interface WheelCanvasOptions {
  readonly canvas: HTMLCanvasElement;
  readonly sectors: readonly WheelSector[];
  readonly onPegHit?: (velocityRatio: number) => void;
}

/**
 * Nordic Botanical Print Canvas Wheel Engine.
 * Features:
 * - 8 balanced botanical sectors (4 items x 2 alternating)
 * - Automatic 180-degree flip correction (Zero inverted / upside-down text)
 * - Natural tactile materials: Light Birch Wood, Matte Brass, Porcelain Center Hub
 * - Elegant editorial serif typography
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

  public setupHighDpi(): void {
    const dpr = Math.max(window.devicePixelRatio || 1, CANVAS_CONFIG.DEFAULT_SCALE_DPR);
    const parent = this.canvas.parentElement;
    const availableWidth = parent ? parent.clientWidth : CANVAS_CONFIG.BASE_SIZE_PX;

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

    const pegAngleStep = (Math.PI * 2) / CANVAS_CONFIG.PEG_COUNT;
    const normalizedPointerAngle = ((PHYSICS_CONFIG.POINTER_ANGLE_OFFSET_RAD - angleRad) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const currentPegIndex = Math.floor(normalizedPointerAngle / pegAngleStep);

    if (currentPegIndex !== this.lastPegPassedIndex) {
      this.lastPegPassedIndex = currentPegIndex;
      const normalizedVelocity = Math.min(1.0, Math.abs(angularVelocity) / 12);
      this.pointerDeflectionAngleRad = -0.28 * Math.min(1.0, 0.40 + normalizedVelocity);
      this.onPegHit?.(normalizedVelocity);
    } else {
      this.pointerDeflectionAngleRad *= 0.82;
      if (Math.abs(this.pointerDeflectionAngleRad) < 0.005) {
        this.pointerDeflectionAngleRad = 0;
      }
    }

    this.render();
  }

  public getAngle(): number {
    return this.currentAngleRad;
  }

  public render(): void {
    const size = this.displaySizePx;
    const center = size / 2;
    const radius = center - CANVAS_CONFIG.RIM_WIDTH_PX - 8;

    this.ctx.clearRect(0, 0, size, size);

    // 1. Soft Diffuse Shadow (Natural Linen Shadow)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center + 5, radius + CANVAS_CONFIG.RIM_WIDTH_PX, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(40, 36, 30, 0.08)";
    this.ctx.filter = "blur(12px)";
    this.ctx.fill();
    this.ctx.restore();

    // 2. Rotated Wheel Disc
    this.ctx.save();
    this.ctx.translate(center, center);
    this.ctx.rotate(this.currentAngleRad);

    this.drawWheelSlices(radius);
    this.drawSliceDividers(radius);
    this.drawOuterRim(radius);
    this.drawRivets(radius);

    this.ctx.restore();

    // 3. Porcelain & Brass Center Hub
    this.drawCenterHub(center);

    // 4. Teardrop Brass Pointer
    this.drawPointer(center, radius);
  }

  private drawWheelSlices(radius: number): void {
    const totalSectors = this.sectors.length;
    const arcStep = (Math.PI * 2) / totalSectors;

    for (let i = 0; i < totalSectors; i++) {
      const sector = this.sectors[i];
      if (!sector) continue;

      const startAngle = i * arcStep;
      const endAngle = startAngle + arcStep;

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, startAngle, endAngle);
      this.ctx.closePath();

      this.ctx.fillStyle = sector.backgroundColor;
      this.ctx.fill();

      // Tactile organic depth sheen
      const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.25, 0, 0, radius);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.10)");
      gradient.addColorStop(0.75, "rgba(0, 0, 0, 0.0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.16)");
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      this.drawSectorContent(sector, startAngle + arcStep / 2, radius);
    }
  }

  /**
   * Editorial Typography with Automatic 180-Degree Flip Correction.
   * Ensures letters are ALWAYS upright and readable from any angle.
   */
  private drawSectorContent(sector: WheelSector, midAngle: number, radius: number): void {
    const textRadius = radius * 0.66;
    const iconRadius = radius * 0.82;

    // Normalize midAngle to [0, 2PI)
    const normAngle = ((midAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    // Bottom hemisphere is between PI/2 (90 deg) and 3PI/2 (270 deg)
    const isBottomHalf = normAngle > Math.PI * 0.5 && normAngle < Math.PI * 1.5;

    // 1. Draw Sector Icon
    this.ctx.save();
    this.ctx.rotate(midAngle);
    this.ctx.translate(iconRadius, 0);
    this.ctx.rotate(isBottomHalf ? -Math.PI / 2 : Math.PI / 2);
    this.drawSectorIcon(sector.category);
    this.ctx.restore();

    // 2. Draw Tangential Label with Flip Correction
    this.ctx.save();
    this.ctx.rotate(midAngle);
    this.ctx.translate(textRadius, 0);

    // Tangential rotation: flip 180 degrees if in bottom half so text is upright
    this.ctx.rotate(isBottomHalf ? -Math.PI / 2 : Math.PI / 2);

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Editorial Serif Font Stack (Georgia, Charter, Serif)
    this.ctx.font = "bold 13.5px Georgia, Charter, 'Times New Roman', serif";
    this.ctx.letterSpacing = "1.2px";
    this.ctx.fillStyle = sector.textColor;
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    this.ctx.shadowBlur = 3;
    this.ctx.fillText(sector.label, 0, 0);

    // Subtle subtext
    this.ctx.shadowBlur = 0;
    this.ctx.font = "600 7.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    this.ctx.letterSpacing = "0.8px";
    this.ctx.fillStyle = sector.accentColor;

    if (sector.category === "ganci") {
      this.ctx.fillText("SOUVENIR", 0, 14);
    } else if (sector.category === "stiker") {
      this.ctx.fillText("KOLEKSI", 0, 14);
    } else if (sector.category === "refreshment") {
      this.ctx.fillText("KONSUMSI", 0, 14);
    } else {
      this.ctx.fillText("SELESAI", 0, 14);
    }

    this.ctx.restore();
  }

  private drawSectorIcon(category: string): void {
    this.ctx.font = "20px system-ui, -apple-system, sans-serif";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    this.ctx.shadowBlur = 3;

    if (category === "ganci") {
      this.ctx.fillText("🏷️", 0, 0);
    } else if (category === "stiker") {
      this.ctx.fillText("🔖", 0, 0);
    } else if (category === "refreshment") {
      this.ctx.fillText("☕", 0, 0);
    } else {
      this.ctx.fillText("🌾", 0, 0);
    }
  }

  private drawSliceDividers(radius: number): void {
    const totalSectors = this.sectors.length;
    const arcStep = (Math.PI * 2) / totalSectors;

    for (let i = 0; i < totalSectors; i++) {
      const angle = i * arcStep;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(cosA * radius, sinA * radius);
      this.ctx.strokeStyle = "rgba(250, 248, 245, 0.75)"; // Warm Oat Linen divider
      this.ctx.lineWidth = 1.8;
      this.ctx.stroke();
    }
  }

  private drawOuterRim(radius: number): void {
    const rimWidth = CANVAS_CONFIG.RIM_WIDTH_PX;
    const outerRadius = radius + rimWidth;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
    this.ctx.closePath();

    // Natural Birch Wood & Warm Brass Gradient
    const rimGradient = this.ctx.createRadialGradient(0, 0, radius, 0, 0, outerRadius);
    rimGradient.addColorStop(0, "#735E43");
    rimGradient.addColorStop(0.3, "#B39F7D");
    rimGradient.addColorStop(0.6, "#D4C5A9");
    rimGradient.addColorStop(0.85, "#9C8564");
    rimGradient.addColorStop(1, "#52422E");
    this.ctx.fillStyle = rimGradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#B39F7D";
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();
  }

  private drawRivets(radius: number): void {
    const pegCount = CANVAS_CONFIG.PEG_COUNT;
    const pegRadius = CANVAS_CONFIG.PEG_RADIUS_PX;
    const distance = radius + CANVAS_CONFIG.RIM_WIDTH_PX / 2;
    const step = (Math.PI * 2) / pegCount;

    for (let i = 0; i < pegCount; i++) {
      const angle = i * step;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      this.ctx.beginPath();
      this.ctx.arc(x, y + 1, pegRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
      const pegGrad = this.ctx.createRadialGradient(x - 1, y - 1, 0.4, x, y, pegRadius);
      pegGrad.addColorStop(0, "#FAF8F5");
      pegGrad.addColorStop(0.4, "#E8DFD1");
      pegGrad.addColorStop(0.8, "#B39F7D");
      pegGrad.addColorStop(1, "#5C4A32");
      this.ctx.fillStyle = pegGrad;
      this.ctx.fill();

      this.ctx.strokeStyle = "#3E301F";
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    }
  }

  private drawCenterHub(center: number): void {
    const hubRadius = CANVAS_CONFIG.CENTER_HUB_RADIUS_PX;

    // Hub drop shadow
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center + 3, hubRadius + 1, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    this.ctx.filter = "blur(5px)";
    this.ctx.fill();
    this.ctx.restore();

    // Matte Brass Rim
    this.ctx.beginPath();
    this.ctx.arc(center, center, hubRadius, 0, Math.PI * 2);
    const ringGrad = this.ctx.createLinearGradient(center - hubRadius, center - hubRadius, center + hubRadius, center + hubRadius);
    ringGrad.addColorStop(0, "#D4C5A9");
    ringGrad.addColorStop(0.5, "#B39F7D");
    ringGrad.addColorStop(1, "#6B583E");
    this.ctx.fillStyle = ringGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#FAF8F5";
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Inner Porcelain White Medallion
    const innerRadius = hubRadius - 5;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fill();

    this.ctx.clip();
    if (this.isLogoLoaded && this.logoImage) {
      const logoPadding = 4;
      const logoDrawSize = (innerRadius - logoPadding) * 2;
      this.ctx.drawImage(
        this.logoImage,
        center - innerRadius + logoPadding,
        center - innerRadius + logoPadding,
        logoDrawSize,
        logoDrawSize
      );
    }
    this.ctx.restore();

    // Subtle porcelain rim ring
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = "rgba(179, 159, 125, 0.4)";
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawPointer(center: number, radius: number): void {
    const pointerW = CANVAS_CONFIG.POINTER_WIDTH_PX;
    const pointerH = CANVAS_CONFIG.POINTER_HEIGHT_PX;
    const pointerTipY = center - radius + 12;
    const pointerBaseY = pointerTipY - pointerH;

    this.ctx.save();
    this.ctx.translate(center, pointerBaseY);
    this.ctx.rotate(this.pointerDeflectionAngleRad);

    // Shadow
    this.ctx.beginPath();
    this.ctx.moveTo(0, pointerH + 2);
    this.ctx.lineTo(-pointerW / 2 - 2, 2);
    this.ctx.lineTo(pointerW / 2 + 2, 2);
    this.ctx.closePath();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
    this.ctx.filter = "blur(3px)";
    this.ctx.fill();
    this.ctx.filter = "none";

    // Teardrop Brass Needle
    this.ctx.beginPath();
    this.ctx.moveTo(0, pointerH);
    this.ctx.lineTo(-pointerW / 2, 0);
    this.ctx.lineTo(pointerW / 2, 0);
    this.ctx.closePath();

    const arrowGrad = this.ctx.createLinearGradient(-pointerW / 2, 0, pointerW / 2, pointerH);
    arrowGrad.addColorStop(0, "#FAF8F5");
    arrowGrad.addColorStop(0.3, "#D4C5A9");
    arrowGrad.addColorStop(0.8, "#B39F7D");
    arrowGrad.addColorStop(1, "#5C4A32");
    this.ctx.fillStyle = arrowGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#3E301F";
    this.ctx.lineWidth = 1.0;
    this.ctx.stroke();

    // Emerald Pivot Jewel
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 7.0, 0, Math.PI * 2);
    this.ctx.fillStyle = "#4E6554";
    this.ctx.fill();
    this.ctx.strokeStyle = "#D4C5A9";
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();

    this.ctx.restore();
  }
}
