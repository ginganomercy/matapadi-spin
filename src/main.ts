import "./styles/main.css";
import { DEFAULT_SECTORS } from "./core/constants.ts";
import { SoundEngine } from "./audio/sound-engine.ts";
import { WheelCanvas } from "./engine/wheel-canvas.ts";
import { SpinController } from "./engine/spin-controller.ts";
import { HistoryManager } from "./ui/history-manager.ts";
import { ModalManager } from "./ui/modal-manager.ts";
import { SpinResult, SpinStatus } from "./types/wheel.ts";

/**
 * Bootstrap the Spin Matapadi interactive application.
 */
function initApplication(): void {
  const canvasElement = document.getElementById("wheel-canvas") as HTMLCanvasElement | null;
  const spinButton = document.getElementById("btn-spin") as HTMLButtonElement | null;
  const spinText = document.getElementById("spin-text") as HTMLElement | null;
  const soundToggleBtn = document.getElementById("btn-toggle-sound") as HTMLButtonElement | null;
  const svgSoundOn = document.getElementById("svg-sound-on") as HTMLElement | null;
  const svgSoundOff = document.getElementById("svg-sound-off") as HTMLElement | null;
  const soundLabel = document.getElementById("sound-label") as HTMLElement | null;
  const clearHistoryBtn = document.getElementById("btn-clear-history") as HTMLButtonElement | null;

  if (!canvasElement || !spinButton || !spinText || !soundToggleBtn || !svgSoundOn || !svgSoundOff || !soundLabel || !clearHistoryBtn) {
    console.error("Failed to initialize: Missing essential DOM elements");
    return;
  }

  // 1. Initialize Subsystems
  const soundEngine = new SoundEngine();
  const historyManager = new HistoryManager("history-list", "history-empty");
  const modalManager = new ModalManager();

  // 2. Initialize Wheel Canvas Engine
  const wheelCanvas = new WheelCanvas({
    canvas: canvasElement,
    sectors: DEFAULT_SECTORS,
    onPegHit: (velocityRatio) => {
      soundEngine.playTick(velocityRatio);
    },
  });

  // 3. Initialize Spin Controller
  const spinController = new SpinController(wheelCanvas, DEFAULT_SECTORS, {
    onStatusChange: (status: SpinStatus) => {
      const isSpinning = status === "SPINNING";
      spinButton.disabled = isSpinning;
      spinText.textContent = isSpinning ? "MEMUTAR RODA..." : "PUTAR RODA SEKARANG";

      if (isSpinning) {
        spinButton.classList.remove("animate-pulse-glow");
      } else {
        spinButton.classList.add("animate-pulse-glow");
      }
    },
    onSpinComplete: (result: SpinResult) => {
      historyManager.addResult(result);

      if (result.category === "zonk") {
        soundEngine.playZonkSound();
      } else {
        soundEngine.playWinFanfare();
      }

      modalManager.showResult(result);
    },
  });

  // 4. Trigger Spin Action
  const triggerSpin = async (): Promise<void> => {
    if (spinController.isBusy()) return;

    await soundEngine.ensureContext();

    try {
      await spinController.spin();
    } catch (error) {
      console.warn("Spin execution interrupted:", error);
    }
  };

  // 5. Wire Event Handlers
  spinButton.addEventListener("click", () => {
    void triggerSpin();
  });

  // Keyboard shortcut: Spacebar triggers spin when not typing in input
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target === document.body && !spinController.isBusy()) {
      e.preventDefault();
      void triggerSpin();
    }
  });

  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Kosongkan semua riwayat putaran?")) {
      historyManager.clear();
    }
  });

  // Sound toggle button with Tailwind SVG icon toggle
  const updateSoundUI = (isMuted: boolean) => {
    if (isMuted) {
      svgSoundOn.classList.add("hidden");
      svgSoundOff.classList.remove("hidden");
      soundLabel.textContent = "Suara Bisu";
    } else {
      svgSoundOn.classList.remove("hidden");
      svgSoundOff.classList.add("hidden");
      soundLabel.textContent = "Suara Aktif";
    }
  };

  updateSoundUI(soundEngine.getIsMuted());

  soundToggleBtn.addEventListener("click", () => {
    const isMuted = soundEngine.toggleMute();
    updateSoundUI(isMuted);
  });

  // Responsive resize handler
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
