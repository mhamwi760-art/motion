import type { FormatId } from "./types";

export interface Format {
  id: FormatId;
  width: number;
  height: number;
  label: string;
  /**
   * Safe-area padding (px) where platform UI sits on top of the video
   * (captions, buttons, usernames). Content stays inside it.
   */
  safe: { top: number; right: number; bottom: number; left: number };
}

export const FORMATS: Record<FormatId, Format> = {
  "9x16": {
    id: "9x16",
    width: 1080,
    height: 1920,
    label: "Reels / TikTok / Shorts / Stories",
    safe: { top: 240, right: 110, bottom: 380, left: 90 },
  },
  "4x5": {
    id: "4x5",
    width: 1080,
    height: 1350,
    label: "Instagram / LinkedIn feed",
    safe: { top: 110, right: 100, bottom: 130, left: 100 },
  },
  "1x1": {
    id: "1x1",
    width: 1080,
    height: 1080,
    label: "Square feed",
    safe: { top: 100, right: 100, bottom: 100, left: 100 },
  },
  "16x9": {
    id: "16x9",
    width: 1920,
    height: 1080,
    label: "YouTube / X / LinkedIn / web",
    safe: { top: 110, right: 160, bottom: 120, left: 160 },
  },
};

export const FORMAT_IDS = Object.keys(FORMATS) as FormatId[];
