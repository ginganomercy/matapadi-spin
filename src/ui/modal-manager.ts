import confetti from "canvas-confetti";
import { SpinResult } from "../types/wheel.ts";

/**
 * Editorial Modal Announcement Dialog.
 * Enforces rule: "Kalau zonk tidak boleh putar lagi" — no retry option on Zonk.
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

    const isZonk = result.category === "zonk";

    if (isZonk) {
      // ZONK: strictly no retry allowed
      this.titleElement.textContent = "Putaran Selesai";
      this.titleElement.className = "text-base font-semibold text-stone-500 uppercase tracking-wider";
      this.labelElement.textContent = "ZONK";
      this.labelElement.className = "text-3xl font-black text-stone-800 tracking-tight my-2";
      this.descElement.textContent = "Kesempatan memutar Anda telah selesai dan tidak dapat diulang. Terima kasih telah berpartisipasi di booth Matapadi.";
      this.actionButton.textContent = "Selesai";
      this.actionButton.className = "w-full py-3 px-5 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-sm transition cursor-pointer";
    } else {
      // PRIZE WON: Congratulations & claim instruction
      this.titleElement.textContent = "Selamat! Anda Memenangkan";
      this.titleElement.className = "text-base font-semibold text-emerald-800 uppercase tracking-wider";
      this.labelElement.textContent = result.label;
      this.labelElement.className = "text-3xl font-black text-emerald-950 tracking-tight my-2";
      this.descElement.textContent = "Tunjukkan hasil ini kepada petugas booth Matapadi untuk mengklaim hadiah Anda.";
      this.actionButton.textContent = "Klaim Hadiah";
      this.actionButton.className = "w-full py-3 px-5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition cursor-pointer";

      this.fireEditorialConfetti();
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
    }, 200);
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

  private fireEditorialConfetti(): void {
    const end = Date.now() + 1400;
    const colors = ["#1b4332", "#c58940", "#e9c46a", "#ffffff"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 50,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 50,
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
