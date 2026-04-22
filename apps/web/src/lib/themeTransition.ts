/**
 * Drives CSS custom-property transitions using the same exponential-decay
 * formula as the hero wind overlay, ensuring frame-perfect sync.
 *
 * Usage: call `animateThemeTransition("light" | "dark")` on toggle.
 */

type RGBA = [number, number, number, number];

// ── Palette definitions (must match styles.css :root / :root.dark) ──

const LIGHT: Record<string, RGBA> = {
  "--sea-ink": [26, 43, 64, 1],
  "--sea-ink-soft": [69, 96, 122, 1],
  "--lagoon": [107, 157, 186, 1],
  "--lagoon-deep": [61, 122, 145, 1],
  "--palm": [90, 126, 150, 1],
  "--sand": [232, 237, 243, 1],
  "--foam": [240, 243, 248, 1],
  "--surface": [255, 255, 255, 0.74],
  "--surface-strong": [255, 255, 255, 0.9],
  "--line": [30, 45, 61, 0.14],
  "--inset-glint": [255, 255, 255, 0.82],
  "--kicker": [74, 94, 110, 1],
  "--bg-base": [232, 237, 243, 1],
  "--header-bg": [240, 243, 248, 0.84],
  "--chip-bg": [230, 237, 245, 0.55],
  "--chip-line": [180, 195, 220, 0.45],
  "--link-bg-hover": [230, 237, 245, 0.6],
  "--hero-a": [107, 157, 186, 0.25],
  "--hero-b": [90, 126, 150, 0.15],
  "--link-decoration": [61, 122, 145, 0.35],
  "--link-hover": [45, 105, 128, 1],
  "--nav-accent": [138, 184, 204, 1],
  "--selection-bg": [107, 157, 186, 0.24],
  "--shadow-island": [30, 50, 72, 0.1],
  "--shadow-island-sm": [30, 45, 61, 0.08],
  "--duck-feet": [255, 158, 0, 1],
  "--duck-beak": [255, 100, 0, 1],
  "--duck-eye": [240, 243, 248, 1],
  "--duck-body": [26, 45, 82, 1],
  "--duck-body-dark": [15, 30, 58, 1],
  "--duck-body-soft": [45, 63, 106, 1],
  "--umbrella-pole": [192, 206, 216, 1],
  "--umbrella-pole-soft": [210, 221, 229, 1],
  "--umbrella": [181, 84, 122, 1],
  "--umbrella-deep": [158, 66, 104, 1],
  "--umbrella-stripe": [240, 212, 222, 1],
  "--umbrella-stripe-soft": [232, 192, 206, 1],
  "--duck-highlight": [255, 255, 255, 1],
  "--duck-shadow": [0, 0, 0, 1],
};

const DARK: Record<string, RGBA> = {
  "--sea-ink": [200, 218, 235, 1],
  "--sea-ink-soft": [126, 154, 181, 1],
  "--lagoon": [123, 184, 212, 1],
  "--lagoon-deep": [160, 208, 230, 1],
  "--palm": [123, 170, 194, 1],
  "--sand": [14, 21, 28, 1],
  "--foam": [17, 26, 34, 1],
  "--surface": [14, 21, 28, 0.8],
  "--surface-strong": [12, 18, 25, 0.92],
  "--line": [160, 195, 220, 0.16],
  "--inset-glint": [180, 210, 230, 0.1],
  "--kicker": [138, 171, 194, 1],
  "--bg-base": [11, 17, 24, 1],
  "--header-bg": [11, 17, 24, 0.8],
  "--chip-bg": [20, 31, 46, 0.6],
  "--chip-line": [100, 130, 170, 0.3],
  "--link-bg-hover": [31, 41, 56, 0.6],
  "--hero-a": [123, 184, 212, 0.15],
  "--hero-b": [90, 126, 150, 0.1],
  "--link-decoration": [123, 184, 212, 0.3],
  "--link-hover": [160, 208, 230, 1],
  "--nav-accent": [123, 184, 212, 1],
  "--selection-bg": [123, 184, 212, 0.2],
  "--shadow-island": [0, 0, 0, 0.25],
  "--shadow-island-sm": [0, 0, 0, 0.15],
  "--duck-feet": [255, 183, 51, 1],
  "--duck-beak": [255, 133, 51, 1],
  "--duck-eye": [255, 255, 255, 1],
  "--duck-body": [77, 101, 137, 1],
  "--duck-body-dark": [58, 79, 110, 1],
  "--duck-body-soft": [108, 130, 163, 1],
  "--umbrella-pole": [74, 100, 117, 1],
  "--umbrella-pole-soft": [90, 117, 133, 1],
  "--umbrella": [158, 74, 106, 1],
  "--umbrella-deep": [192, 104, 136, 1],
  "--umbrella-stripe": [92, 45, 74, 1],
  "--umbrella-stripe-soft": [110, 56, 88, 1],
  "--duck-highlight": [200, 218, 235, 1],
  "--duck-shadow": [0, 0, 0, 1],
};

const PALETTES = { light: LIGHT, dark: DARK } as const;
const KEYS = Object.keys(LIGHT);

// ── Transition state ──

let frameId = 0;
let current: Record<string, RGBA> = {};
let target: Record<string, RGBA> = {};
let lastTime = 0;

/** Same exponential-decay constant as the hero wind overlay color lerp */
const DECAY_RATE = 6;

/** Stop animating once max channel delta falls below this */
const EPSILON = 0.4;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function toRgba([r, g, b, a]: RGBA): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
}

function tick(now: number) {
  const delta = Math.min((now - lastTime) / 1000, 0.05); // cap to avoid jumps
  lastTime = now;

  const factor = 1 - Math.exp(-DECAY_RATE * delta);
  const style = document.documentElement.style;
  let maxDelta = 0;

  for (const key of KEYS) {
    const c = current[key];
    const t = target[key];
    for (let i = 0; i < 4; i++) {
      c[i] = lerp(c[i], t[i], factor);
      const d = Math.abs(c[i] - t[i]);
      if (d > maxDelta) maxDelta = d;
    }
    style.setProperty(key, toRgba(c));
  }

  if (maxDelta > EPSILON) {
    frameId = requestAnimationFrame(tick);
  } else {
    // Snap to final values and clear inline overrides so CSS takes over
    for (const key of KEYS) {
      style.removeProperty(key);
    }
    document.documentElement.classList.remove("theme-animating");
    frameId = 0;
  }
}

/**
 * Start an animated transition to the given theme.
 * Call this AFTER setting the class on `<html>` so the
 * CSS cascade already reflects the target—our inline styles just
 * temporarily override until convergence.
 */
export function animateThemeTransition(to: "light" | "dark") {
  const from = to === "light" ? "dark" : "light";

  // Snapshot "from" as our starting point
  const fromPalette = PALETTES[from];
  const toPalette = PALETTES[to];

  for (const key of KEYS) {
    current[key] = [...fromPalette[key]];
    target[key] = toPalette[key];
  }

  // Cancel any in-flight animation
  if (frameId) cancelAnimationFrame(frameId);

  // Suppress CSS transitions so only JS drives the interpolation
  document.documentElement.classList.add("theme-animating");

  lastTime = performance.now();
  frameId = requestAnimationFrame(tick);
}
