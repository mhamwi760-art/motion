/**
 * The video spec: a plain JSON document that describes a whole clip.
 * Everything the engine renders comes from this — write a spec, render it
 * in any format. Durations are in SECONDS.
 */

export type FormatId = "9x16" | "4x5" | "1x1" | "16x9";

export type FontFamily =
  | "Inter"
  | "Space Grotesk"
  | "Bricolage Grotesque"
  | "DM Serif Display"
  | "JetBrains Mono";

export type ThemePreset = "midnight" | "paper" | "neon" | "sunset" | "mono" | "ocean";

export interface ThemeColors {
  bg: string;
  bg2: string;
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
  /** text colour used on top of `accent` (buttons, highlight pills) */
  onAccent: string;
}

export interface ThemeInput {
  preset?: ThemePreset;
  colors?: Partial<ThemeColors>;
  fonts?: { display?: FontFamily; body?: FontFamily; mono?: FontFamily };
  /** corner radius in px at 1080 scale */
  radius?: number;
  /** brand logo used by `logo` and `cta` scenes when they don't set one */
  logo?: LogoInput;
}

export interface LogoInput {
  /** image in /public (e.g. "logo.svg") or an https URL */
  src?: string;
  /** a text wordmark, used when there is no src */
  text?: string;
  /** logo width as a fraction of the frame's short side (default 0.42) */
  size?: number;
}

export type TextAnim = "rise" | "pop" | "slide" | "blur" | "typewriter" | "drop";
export type SplitBy = "word" | "char" | "line";
export type Align = "center" | "left";

export type BackgroundInput =
  | { type: "orbs"; intensity?: number }
  | { type: "grid"; perspective?: boolean }
  | { type: "gradient"; angle?: number }
  | { type: "dots" }
  | { type: "solid" }
  | { type: "image"; src: string; dim?: number };

export type TransitionType =
  | "fade"
  | "slide"
  | "slide-up"
  | "wipe"
  | "flip"
  | "clock"
  | "zoom"
  | "none";

export interface TransitionInput {
  type: TransitionType;
  /** seconds, default 0.5 */
  duration?: number;
}

interface SceneBase {
  /** seconds */
  duration?: number;
  /** override the global transition INTO this scene */
  transition?: TransitionInput;
  /** override the background for this scene only */
  background?: BackgroundInput;
}

/* Text supports *highlight* (accent colour + marker sweep) and line breaks with \n */

export interface TitleScene extends SceneBase {
  type: "title";
  text: string;
  kicker?: string;
  subtitle?: string;
  anim?: TextAnim;
  split?: SplitBy;
  align?: Align;
}

export interface LogoScene extends SceneBase {
  type: "logo";
  logo?: LogoInput;
  style?: "burst" | "mask" | "scale" | "slices" | "type";
  tagline?: string;
}

export interface ListScene extends SceneBase {
  type: "list";
  title?: string;
  items: string[];
  numbered?: boolean;
}

export interface StatScene extends SceneBase {
  type: "stat";
  value: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  /** draws a progress ring when 0-100 */
  ring?: boolean;
}

export interface QuoteScene extends SceneBase {
  type: "quote";
  text: string;
  author?: string;
  role?: string;
}

export interface CaptionWord {
  text: string;
  /** seconds from scene start */
  start: number;
  end: number;
}

export interface CaptionsScene extends SceneBase {
  type: "captions";
  /** either precise word timings (e.g. from Whisper) … */
  words?: CaptionWord[];
  /** … or plain text, auto-timed at `wpm` */
  text?: string;
  wpm?: number;
  /** words per caption page (default 4 portrait / 6 landscape) */
  perPage?: number;
  style?: "pill" | "bold" | "karaoke";
  /** optional voice-over / audio for this scene, in /public */
  audio?: string;
  position?: "center" | "lower";
}

export interface ImageScene extends SceneBase {
  type: "image";
  src: string;
  caption?: string;
  fit?: "cover" | "contain";
  kenBurns?: boolean;
}

export interface CtaScene extends SceneBase {
  type: "cta";
  text: string;
  button?: string;
  url?: string;
  handle?: string;
  showLogo?: boolean;
}

export type Scene =
  | TitleScene
  | LogoScene
  | ListScene
  | StatScene
  | QuoteScene
  | CaptionsScene
  | ImageScene
  | CtaScene;

export interface VideoSpec {
  title?: string;
  fps?: number;
  /** formats rendered by `npm run make` when --formats isn't passed */
  formats?: FormatId[];
  theme?: ThemeInput;
  background?: BackgroundInput;
  transition?: TransitionInput;
  music?: { src: string; volume?: number; fadeOut?: number };
  /** thin progress bar along the top edge (nice for social) */
  progressBar?: boolean;
  /** subtle film grain overlay */
  grain?: boolean;
  scenes: Scene[];
}
