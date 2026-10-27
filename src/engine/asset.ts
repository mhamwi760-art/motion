import { staticFile } from "remotion";

/** "logo.svg" → file in /public; "https://…" → used as-is */
export const asset = (src: string) =>
  /^(https?:|data:|blob:)/.test(src) ? src : staticFile(src.replace(/^\/?(public\/)?/, ""));
