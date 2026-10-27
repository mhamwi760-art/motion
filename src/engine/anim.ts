import type { CSSProperties } from "react";
import { Easing, interpolate, spring, type SpringConfig } from "remotion";
import type { TextAnim } from "./types";

export const SPRINGS = {
  /** crisp, no overshoot — UI-like */
  snappy: { damping: 200, stiffness: 180, mass: 0.7 } as Partial<SpringConfig>,
  /** soft settle */
  smooth: { damping: 30, stiffness: 90, mass: 1 } as Partial<SpringConfig>,
  /** playful overshoot */
  bouncy: { damping: 11, stiffness: 140, mass: 0.8 } as Partial<SpringConfig>,
  /** heavy, cinematic */
  heavy: { damping: 26, stiffness: 60, mass: 1.6 } as Partial<SpringConfig>,
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 spring starting at `delay` frames */
export const springAt = (
  frame: number,
  fps: number,
  delay = 0,
  config: keyof typeof SPRINGS = "snappy",
  durationInFrames?: number,
) => spring({ frame: frame - delay, fps, config: SPRINGS[config], durationInFrames });

/** eased 0→1 progress between two frames */
export const progress = (
  frame: number,
  start: number,
  end: number,
  ease: (t: number) => number = Easing.bezier(0.22, 1, 0.36, 1),
) => interpolate(frame, [start, end], [0, 1], { ...clamp, easing: ease });

/**
 * Entrance style for one text unit (word / char / line).
 * `u` is the layout unit so distances scale with the format.
 */
export const enterStyle = (
  anim: TextAnim,
  frame: number,
  fps: number,
  delay: number,
  u: number,
): CSSProperties => {
  switch (anim) {
    case "rise": {
      const p = springAt(frame, fps, delay, "smooth");
      return {
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${(1 - p) * 70 * u}px) rotate(${(1 - p) * 4}deg)`,
      };
    }
    case "pop": {
      const p = springAt(frame, fps, delay, "bouncy");
      return {
        opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
        transform: `scale(${0.3 + p * 0.7})`,
      };
    }
    case "slide": {
      const p = springAt(frame, fps, delay, "snappy");
      return {
        opacity: p,
        transform: `translateX(${(1 - p) * -60 * u}px)`,
      };
    }
    case "blur": {
      const p = progress(frame, delay, delay + 0.6 * fps);
      return {
        opacity: p,
        filter: `blur(${(1 - p) * 24 * u}px)`,
        transform: `scale(${1.15 - p * 0.15})`,
      };
    }
    case "drop": {
      const p = springAt(frame, fps, delay, "bouncy");
      return {
        opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
        transform: `translateY(${(1 - p) * -120 * u}px)`,
      };
    }
    case "typewriter": {
      return { opacity: frame >= delay ? 1 : 0 };
    }
  }
};

/** stagger (frames) between units for a given animation & split */
export const staggerFor = (anim: TextAnim, split: "word" | "char" | "line", fps: number) => {
  if (anim === "typewriter") return split === "char" ? fps * 0.035 : fps * 0.12;
  if (split === "char") return fps * 0.025;
  if (split === "line") return fps * 0.18;
  return fps * 0.07;
};

/** gentle constant drift so nothing is ever fully static */
export const drift = (frame: number, fps: number, amount = 1) =>
  1 + (frame / fps) * 0.012 * amount;
