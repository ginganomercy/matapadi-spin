import { STORAGE_KEYS } from "../core/constants.ts";
import { SpinResult } from "../types/wheel.ts";

const MAX_HISTORY_ITEMS = 30;

/**
 * Manages the persistence and visual rendering of recent spin results using Tailwind SVG icons.
 */
export class HistoryManager {
  private history: SpinResult[] = [];
  private readonly containerElement: HTMLElement;
  private readonly emptyStateElement: HTMLElement;

  constructor(containerId: string, emptyStateId: string) {
    const container = document.getElementById(containerId);
    const emptyState = document.getElementById(emptyStateId);

    if (!container || !emptyState) {
      throw new Error(`Required DOM elements for history manager not found`);
    }

    this.containerElement = container;
    this.emptyStateElement = emptyState;

    this.loadFromStorage();
    this.render();
  }

  public addResult(result: SpinResult): void {
    this.history.unshift(result);
    if (this.history.length > MAX_HISTORY_ITEMS) {
      this.history.pop();
    }
    this.saveToStorage();
    this.render();
  }

  public clear(): void {
    this.history = [];
    this.saveToStorage();
    this.render();
  }

  public getHistoryCount(): number {
    return this.history.length;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SPIN_HISTORY, JSON.stringify(this.history));
    } catch {
      // LocalStorage access handling
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SPIN_HISTORY);
      if (stored) {
        this.history = JSON.parse(stored) as SpinResult[];
      }
    } catch {
      this.history = [];
    }
  }

  private render(): void {
    if (this.history.length === 0) {
      this.containerElement.innerHTML = "";
      this.emptyStateElement.classList.remove("hidden");
      return;
    }

    this.emptyStateElement.classList.add("hidden");
    this.containerElement.innerHTML = this.history
      .map((item) => {
        const isWin = item.category !== "zonk";

        // Tailwind styling & icons
        let iconSvg = "";
        let badgeClasses = "";
        let borderClass = "";

        if (item.category === "merchandise") {
          iconSvg = `
            <div class="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          `;
          badgeClasses = "bg-amber-100 text-amber-900 border-amber-300 font-black";
          borderClass = "border-amber-400/40 hover:border-amber-400";
        } else if (item.category === "gantungan_kunci") {
          iconSvg = `
            <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          `;
          badgeClasses = "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
          borderClass = "border-emerald-400/40 hover:border-emerald-400";
        } else {
          iconSvg = `
            <div class="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          `;
          badgeClasses = "bg-rose-100 text-rose-900 border-rose-300 font-bold";
          borderClass = "border-rose-300/40 hover:border-rose-400";
        }

        return `
          <div class="flex items-center justify-between p-2.5 bg-white/90 rounded-2xl border ${borderClass} shadow-xs transition hover:shadow-md">
            <div class="flex items-center gap-2.5">
              ${iconSvg}
              <div>
                <p class="text-xs font-black text-slate-900">${this.escapeHtml(item.label)}</p>
                <p class="text-[10px] text-slate-500 font-medium">${item.formattedTime}</p>
              </div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full border ${badgeClasses}">
              ${isWin ? "Menang" : "Zonk"}
            </span>
          </div>
        `;
      })
      .join("");
  }

  private escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}
