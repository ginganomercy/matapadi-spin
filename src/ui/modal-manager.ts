import confetti from "canvas-confetti";
import { SpinResult } from "../types/wheel.ts";

/**
 * Manages modal announcement dialog and celebratory confetti effects.
 */
export class ModalManager {
  private readonly modalBackdrop: HTMLElement;
  private readonly modalBox: HTMLElement;
  private readonly titleElement: HTMLElement;
  private readonly labelElement: HTMLElement;
  private readonly descElement: HTMLElement;
  private readonly closeButton: HTMLButtonElement;
  private readonly actionButton: HTMLButtonElement;
  private onCloseCallback?: () => void;

  constructor() {
    this.modalBackdrop = document.getElementById("result-modal") as HTMLElement;
    this.modalBox = document.getElementById("modal-box") as HTMLElement;
    this.titleElement = document.getElementById("modal-title") as HTMLElement;
    this.labelElement = document.getElementById("modal-label") as HTMLElement;
    this.descElement = document.getElementById("modal-desc") as HTMLElement;
    this.closeButton = document.getElementById("btn-close-modal") as HTMLButtonElement;
    this.actionButton = document.getElementById("btn-modal-action") as HTMLButtonElement;

    this.bindEvents();
  }

  public showResult(result: SpinResult, onClose?: () => void): void {
    this.onCloseCallback = onClose;

    const isWin = result.category !== "zonk";

    if (isWin) {
      this.titleElement.textContent = "Selamat! Anda Beruntung!";
      this.titleElement.className = "text-xl font-black text-emerald-950";
      this.labelElement.textContent = result.label;
      this.labelElement.className =
        result.category === "merchandise"
          ? "text-2xl font-black text-amber-600 tracking-tight my-2"
          : "text-2xl font-black text-emerald-600 tracking-tight my-2";
      this.descElement.textContent = result.description;
      this.actionButton.textContent = "Klaim & Putar Lagi";
      this.actionButton.className = "w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95";

      this.fireAgriculturalConfetti();
    } else {
      this.titleElement.textContent = "Tetap Semangat!";
      this.titleElement.className = "text-xl font-black text-slate-900";
      this.labelElement.textContent = result.label;
      this.labelElement.className = "text-2xl font-black text-rose-600 tracking-tight my-2";
      this.descElement.textContent = result.description;
      this.actionButton.textContent = "Coba Putar Lagi";
      this.actionButton.className = "w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-black text-sm tracking-wide shadow-lg transition cursor-pointer active:scale-95";
    }

    this.modalBackdrop.classList.remove("hidden");
    requestAnimationFrame(() => {
      this.modalBackdrop.classList.remove("opacity-0");
      this.modalBox.classList.remove("scale-95", "opacity-0");
      this.modalBox.classList.add("scale-100", "opacity-100");
      this.actionButton.focus();
    });
  }

  public hide(): void {
    this.modalBackdrop.classList.add("opacity-0");
    this.modalBox.classList.remove("scale-100", "opacity-100");
    this.modalBox.classList.add("scale-95", "opacity-0");

    setTimeout(() => {
      this.modalBackdrop.classList.add("hidden");
      this.onCloseCallback?.();
    }, 250);
  }

  private bindEvents(): void {
    this.closeButton.addEventListener("click", () => this.hide());
    this.actionButton.addEventListener("click", () => this.hide());

    this.modalBackdrop.addEventListener("click", (e) => {
      if (e.target === this.modalBackdrop) {
        this.hide();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modalBackdrop.classList.contains("hidden")) {
        this.hide();
      }
    });
  }

  /**
   * Celebratory confetti particles with vivid emerald, harvest gold, and radiant white tones.
   */
  private fireAgriculturalConfetti(): void {
    const end = Date.now() + 1800;
    const colors = ["#10b981", "#34d399", "#f59e0b", "#fbbf24", "#ffffff"];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }
}
