import { STORAGE_KEYS } from "../core/constants.ts";
import { SpinResult } from "../types/wheel.ts";

const MAX_HISTORY_ITEMS = 30;

/**
 * Editorial History Manager.
 * Renders a clean, human-designed ledger of previous spins.
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
      // LocalStorage error handling
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

        const badge = isWin
          ? `<span class="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">Hadiah</span>`
          : `<span class="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">Zonk</span>`;

        return `
          <div class="flex items-center justify-between py-2 px-3 bg-stone-50/70 hover:bg-white rounded-lg border border-stone-200/60 transition">
            <div class="flex items-center gap-2.5">
              <span class="w-1.5 h-1.5 rounded-full ${isWin ? "bg-emerald-600" : "bg-stone-400"}"></span>
              <div>
                <p class="text-xs font-semibold text-stone-900">${this.escapeHtml(item.label)}</p>
                <p class="text-[10px] text-stone-400 font-mono">${item.formattedTime}</p>
              </div>
            </div>
            ${badge}
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
