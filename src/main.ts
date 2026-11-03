import "./styles/main.css";
import { DEFAULT_SECTORS, STORAGE_KEYS } from "./core/constants.ts";
import { SoundEngine } from "./audio/sound-engine.ts";
import { WheelCanvas } from "./engine/wheel-canvas.ts";
import { SpinController } from "./engine/spin-controller.ts";
import { HistoryManager } from "./ui/history-manager.ts";
import { ModalManager } from "./ui/modal-manager.ts";
import { SpinResult, SpinStatus } from "./types/wheel.ts";

/**
 * Bootstrap the Spin Matapadi editorial application.
 * Enforces business rule: "Kalau Zonk tidak boleh putar lagi".
 */
function initApplication(): void {
  const canvasElement = document.getElementById("wheel-canvas") as HTMLCanvasElement | null;
  const spinButton = document.getElementById("btn-spin") as HTMLButtonElement | null;
  const spinText = document.getElementById("spin-text") as HTMLElement | null;
  const spinHelperText = document.getElementById("spin-helper-text") as HTMLElement | null;
  const soundToggleBtn = document.getElementById("btn-toggle-sound") as HTMLButtonElement | null;
  const svgSoundOn = document.getElementById("svg-sound-on") as HTMLElement | null;
  const svgSoundOff = document.getElementById("svg-sound-off") as HTMLElement | null;
  const soundLabel = document.getElementById("sound-label") as HTMLElement | null;
  const clearHistoryBtn = document.getElementById("btn-clear-history") as HTMLButtonElement | null;
  const resetKioskBtn = document.getElementById("btn-reset-kiosk") as HTMLButtonElement | null;

  if (
    !canvasElement ||
    !spinButton ||
    !spinText ||
    !spinHelperText ||
    !soundToggleBtn ||
    !svgSoundOn ||
    !svgSoundOff ||
    !soundLabel ||
    !clearHistoryBtn ||
    !resetKioskBtn
  ) {
    console.error("Failed to initialize: Missing essential DOM elements");
    return;
  }

  // 1. Initialize Subsystems
  const soundEngine = new SoundEngine();
  const historyManager = new HistoryManager("history-list", "history-empty");
  const modalManager = new ModalManager();

  // 2. Initialize Canvas Wheel Engine
  const wheelCanvas = new WheelCanvas({
    canvas: canvasElement,
    sectors: DEFAULT_SECTORS,
    onPegHit: (velocityRatio) => {
      soundEngine.playTick(velocityRatio);
    },
  });

  // 3. Lockout State Management ("Kalau Zonk tidak boleh putar lagi")
  const checkLockoutState = (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LOCKOUT_STATE) !== null;
    } catch {
      return false;
    }
  };

  const applyLockoutUI = (reason: string) => {
    spinButton.disabled = true;
    if (reason === "ZONK") {
      spinText.textContent = "KESEMPATAN HABIS (ZONK)";
      spinHelperText.textContent = "Hasil Zonk mengakhiri sesi. Terima kasih telah berpartisipasi.";
      spinHelperText.className = "text-xs text-rose-700 font-medium";
    } else {
      spinText.textContent = "HADIAH TELAH DIDAPATKAN";
      spinHelperText.textContent = "Klaim hadiah Anda ke petugas booth.";
      spinHelperText.className = "text-xs text-emerald-800 font-medium";
    }
  };

  // Toast feedback notification for operator actions
  let toastTimer: number | undefined;
  const showToast = (message: string, durationMs: number = 1800): void => {
    const toast = document.getElementById("operator-toast");
    const toastMsg = document.getElementById("toast-message");
    if (!toast || !toastMsg) return;

    window.clearTimeout(toastTimer);
    toastMsg.textContent = message;
    toast.classList.remove("opacity-0", "-translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "-translate-y-2");
    }, durationMs);
  };

  const resetLockout = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_STATE);
    } catch (err) {
      console.error("Failed to clear lockout state:", err);
    }
    spinButton.disabled = false;
    spinText.textContent = "PUTAR RODA KEBERUNTUNGAN";
    spinHelperText.textContent = "1 kesempatan per pengunjung booth";
    spinHelperText.className = "text-xs text-[#786E5E] font-normal";
    modalManager.hide();
  };

  // 4. Initialize Spin Controller
  const spinController = new SpinController(wheelCanvas, DEFAULT_SECTORS, {
    onStatusChange: (status: SpinStatus) => {
      const isSpinning = status === "SPINNING";
      spinButton.disabled = isSpinning;
      spinText.textContent = isSpinning ? "MEMUTAR..." : "PUTAR RODA";
    },
    onSpinComplete: (result: SpinResult) => {
      historyManager.addResult(result);

      if (result.category === "zonk") {
        soundEngine.playZonkSound();
        // Enforce rule: Persist lockout state for Zonk
        try {
          localStorage.setItem(STORAGE_KEYS.LOCKOUT_STATE, "ZONK");
        } catch {
          // ignore
        }
        applyLockoutUI("ZONK");
      } else {
        soundEngine.playWinFanfare();
        // Persist prize claimed state
        try {
          localStorage.setItem(STORAGE_KEYS.LOCKOUT_STATE, result.label);
        } catch {
          // ignore
        }
        applyLockoutUI(result.label);
      }

      modalManager.showResult(result);
    },
  });

  // Verify existing lockout state on page load
  const existingLockout = checkLockoutState();
  if (existingLockout) {
    const reason = localStorage.getItem(STORAGE_KEYS.LOCKOUT_STATE) || "ZONK";
    applyLockoutUI(reason);
  }

  // 5. Trigger Spin Action with Fail-Safe Check
  const triggerSpin = async (): Promise<void> => {
    if (spinController.isBusy() || checkLockoutState()) return;

    await soundEngine.ensureContext();

    try {
      await spinController.spin();
    } catch (error) {
      console.warn("Spin execution interrupted:", error);
    }
  };

  // 6. Wire Event Handlers
  spinButton.addEventListener("click", () => {
    void triggerSpin();
  });

  // Global Keyboard Shortcuts
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const isKeyB = e.code === "KeyB" || e.key === "b" || e.key === "B";

    // Operator Hotkey: CTRL + B (or CMD + B) resets session for next visitor
    if (isCtrlOrMeta && isKeyB) {
      e.preventDefault();

      if (spinController.isBusy()) {
        showToast("⚠️ Tunggu putaran roda selesai");
        return;
      }

      resetLockout();
      showToast("✓ Sesi direset untuk peserta baru (Ctrl+B)");
      return;
    }

    // Visitor Shortcut: Spacebar triggers spin when eligible
    if (e.code === "Space" && e.target === document.body && !spinController.isBusy() && !checkLockoutState()) {
      e.preventDefault();
      void triggerSpin();
    }
  });

  // Booth Operator Reset Button (Click Handler)
  resetKioskBtn.addEventListener("click", () => {
    if (spinController.isBusy()) {
      showToast("⚠️ Tunggu putaran roda selesai");
      return;
    }

    resetLockout();
    showToast("✓ Sesi direset untuk peserta baru");
  });

  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Kosongkan semua riwayat putaran?")) {
      historyManager.clear();
    }
  });

  // Sound toggle button & state update
  const updateSoundUI = (isMuted: boolean) => {
    if (isMuted) {
      svgSoundOn.classList.add("hidden");
      svgSoundOff.classList.remove("hidden");
      soundLabel.textContent = "Bisu";
    } else {
      svgSoundOn.classList.remove("hidden");
      svgSoundOff.classList.add("hidden");
      soundLabel.textContent = "Suara";
    }
  };

  updateSoundUI(soundEngine.getIsMuted());

  soundToggleBtn.addEventListener("click", () => {
    const isMuted = soundEngine.toggleMute();
    updateSoundUI(isMuted);
  });

  // Resize handler for Retina & Responsive displays
  let resizeTimeout: number | undefined;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      wheelCanvas.setupHighDpi();
    }, 150);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApplication);
} else {
  initApplication();
}
