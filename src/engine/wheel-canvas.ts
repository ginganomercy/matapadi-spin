import { CANVAS_CONFIG, PHYSICS_CONFIG } from "../core/constants.ts";
import { WheelSector } from "../types/wheel.ts";

export interface WheelCanvasOptions {
  readonly canvas: HTMLCanvasElement;
  readonly sectors: readonly WheelSector[];
  readonly onPegHit?: (velocityRatio: number) => void;
}

/**
 * Editorial Agritech Canvas Wheel Renderer.
 * Designed with restrained craftsmanship, organic earth tones, and tactile physical feedback.
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
      this.pointerDeflectionAngleRad = -0.30 * Math.min(1.0, 0.40 + normalizedVelocity);
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

    // 1. Soft Warm Ambient Shadow
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center + 6, radius + CANVAS_CONFIG.RIM_WIDTH_PX, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(20, 40, 30, 0.12)";
    this.ctx.filter = "blur(14px)";
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

    // 4. Top Needle with tactile brass shading
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

      // Subtle warm organic radial gradient
      const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.12)");
      gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.20)");
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      this.drawSectorContent(sector, startAngle + arcStep / 2, radius);
    }
  }

  private drawSectorContent(sector: WheelSector, midAngle: number, radius: number): void {
    this.ctx.save();
    this.ctx.rotate(midAngle);

    const iconPosR = radius * 0.80;
    const textStartR = radius * 0.58;

    // 1. Draw Sector Icon
    this.ctx.save();
    this.ctx.translate(iconPosR, 0);
    this.ctx.rotate(Math.PI / 2);
    this.drawSectorIcon(sector.category);
    this.ctx.restore();

    // 2. Draw Editorial Radial Typography
    this.ctx.save();
    this.ctx.translate(textStartR, 0);

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Text with soft shadow
    this.ctx.font = "800 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    this.ctx.letterSpacing = "1.5px";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    this.ctx.shadowBlur = 4;
    this.ctx.fillStyle = sector.textColor;
    this.ctx.fillText(sector.label, 0, -2);

    // Subtle sub-label
    this.ctx.shadowBlur = 0;
    this.ctx.font = "600 8.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    this.ctx.letterSpacing = "0.5px";
    this.ctx.fillStyle = sector.accentColor;

    if (sector.category === "ganci") {
      this.ctx.fillText("SOUVENIR", 0, 16);
    } else if (sector.category === "stiker") {
      this.ctx.fillText("EXCLUSIVE", 0, 16);
    } else if (sector.category === "refreshment") {
      this.ctx.fillText("BOOTH DRINK", 0, 16);
    } else {
      this.ctx.fillText("SELESAI", 0, 16);
    }

    this.ctx.restore();
    this.ctx.restore();
  }

  private drawSectorIcon(category: string): void {
    this.ctx.font = "24px system-ui, -apple-system, sans-serif";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    this.ctx.shadowBlur = 4;

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
      this.ctx.strokeStyle = "rgba(233, 196, 106, 0.65)"; // Warm brushed brass
      this.ctx.lineWidth = 2.5;
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

    // Brushed Brass Rim Gradient
    const rimGradient = this.ctx.createRadialGradient(0, 0, radius, 0, 0, outerRadius);
    rimGradient.addColorStop(0, "#78350f");
    rimGradient.addColorStop(0.3, "#c58940");
    rimGradient.addColorStop(0.6, "#e9c46a");
    rimGradient.addColorStop(0.85, "#b45309");
    rimGradient.addColorStop(1, "#451a03");
    this.ctx.fillStyle = rimGradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = "#d4a373";
    this.ctx.lineWidth = 1.5;
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
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
      const pegGrad = this.ctx.createRadialGradient(x - 1, y - 1, 0.4, x, y, pegRadius);
      pegGrad.addColorStop(0, "#ffffff");
      pegGrad.addColorStop(0.4, "#fefae0");
      pegGrad.addColorStop(0.8, "#c58940");
      pegGrad.addColorStop(1, "#78350f");
      this.ctx.fillStyle = pegGrad;
      this.ctx.fill();

      this.ctx.strokeStyle = "#451a03";
      this.ctx.lineWidth = 0.6;
      this.ctx.stroke();
    }
  }

  private drawCenterHub(center: number): void {
    const hubRadius = CANVAS_CONFIG.CENTER_HUB_RADIUS_PX;

    // Hub drop shadow
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center + 3, hubRadius + 1, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    this.ctx.filter = "blur(6px)";
    this.ctx.fill();
    this.ctx.restore();

    // Brushed Gold Frame
    this.ctx.beginPath();
    this.ctx.arc(center, center, hubRadius, 0, Math.PI * 2);
    const ringGrad = this.ctx.createLinearGradient(center - hubRadius, center - hubRadius, center + hubRadius, center + hubRadius);
    ringGrad.addColorStop(0, "#e9c46a");
    ringGrad.addColorStop(0.5, "#c58940");
    ringGrad.addColorStop(1, "#78350f");
    this.ctx.fillStyle = ringGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1.8;
    this.ctx.stroke();

    // Inner Disc with Logo
    const innerRadius = hubRadius - 5;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffffff";
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

    // Subtle glass bevel
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = "rgba(197, 137, 64, 0.4)";
    this.ctx.lineWidth = 1.5;
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

    // Pointer shadow
    this.ctx.beginPath();
    this.ctx.moveTo(0, pointerH + 2);
    this.ctx.lineTo(-pointerW / 2 - 2, 2);
    this.ctx.lineTo(pointerW / 2 + 2, 2);
    this.ctx.closePath();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    this.ctx.filter = "blur(3px)";
    this.ctx.fill();
    this.ctx.filter = "none";

    // Tactile Brass Needle
    this.ctx.beginPath();
    this.ctx.moveTo(0, pointerH);
    this.ctx.lineTo(-pointerW / 2, 0);
    this.ctx.lineTo(pointerW / 2, 0);
    this.ctx.closePath();

    const arrowGrad = this.ctx.createLinearGradient(-pointerW / 2, 0, pointerW / 2, pointerH);
    arrowGrad.addColorStop(0, "#fefae0");
    arrowGrad.addColorStop(0.3, "#e9c46a");
    arrowGrad.addColorStop(0.8, "#c58940");
    arrowGrad.addColorStop(1, "#78350f");
    this.ctx.fillStyle = arrowGrad;
    this.ctx.fill();

    this.ctx.strokeStyle = "#451a03";
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    // Pivot Bead
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    this.ctx.fillStyle = "#1b4332";
    this.ctx.fill();
    this.ctx.strokeStyle = "#e9c46a";
    this.ctx.lineWidth = 1.8;
    this.ctx.stroke();

    this.ctx.restore();
  }
}
