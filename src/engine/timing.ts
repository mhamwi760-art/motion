import type { Scene, TransitionInput, VideoSpec } from "./types";

export const DEFAULT_FPS = 30;

/** default seconds per scene type when `duration` is omitted */
const DEFAULT_SECONDS: Record<Scene["type"], number> = {
  title: 2.6,
  logo: 3,
  list: 4,
  stat: 3,
  quote: 4,
  captions: 0, // computed from words
  image: 3,
  cta: 3.2,
};

export const autoCaptionWords = (text: string, wpm = 170) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const per = 60 / wpm;
  let t = 0.25;
  return words.map((w) => {
    // longer words / punctuation get a little more time
    const len = per * (0.75 + Math.min(w.length, 12) / 16) + (/[.,!?;:]$/.test(w) ? per * 0.6 : 0);
    const word = { text: w, start: t, end: t + len };
    t += len;
    return word;
  });
};

export const sceneSeconds = (scene: Scene) => {
  if (scene.duration) return scene.duration;
  if (scene.type === "captions") {
    const words = scene.words ?? autoCaptionWords(scene.text ?? "", scene.wpm);
    return (words.at(-1)?.end ?? 1) + 0.6;
  }
  if (scene.type === "list") return Math.max(3, 1.2 + scene.items.length * 0.7);
  return DEFAULT_SECONDS[scene.type];
};

export const transitionFor = (spec: VideoSpec, index: number): TransitionInput => {
  if (index === 0) return { type: "none" };
  return spec.scenes[index].transition ?? spec.transition ?? { type: "fade", duration: 0.5 };
};

export const transitionFrames = (t: TransitionInput, fps: number) =>
  t.type === "none" ? 0 : Math.round((t.duration ?? 0.5) * fps);

/** frames for each scene + overall duration (transitions overlap scenes) */
export const computeTimeline = (spec: VideoSpec) => {
  const fps = spec.fps ?? DEFAULT_FPS;
  const scenes = spec.scenes.map((s) => Math.max(1, Math.round(sceneSeconds(s) * fps)));
  const transitions = spec.scenes.map((_, i) => {
    const f = transitionFrames(transitionFor(spec, i), fps);
    // a transition can't be longer than either neighbour
    return i === 0 ? 0 : Math.min(f, scenes[i] - 1, scenes[i - 1] - 1);
  });
  const total = scenes.reduce((a, b) => a + b, 0) - transitions.reduce((a, b) => a + b, 0);
  return { fps, scenes, transitions, total: Math.max(1, total) };
};
