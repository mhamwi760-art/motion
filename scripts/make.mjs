#!/usr/bin/env node
/**
 * Render a spec to every format in one go.
 *
 *   npm run make -- specs/launch-promo.json
 *   npm run make -- specs/launch-promo.json --formats 9x16,16x9 --out renders
 *   npm run still -- specs/launch-promo.json            (one PNG per scene, for review)
 *
 * Options
 *   --formats  comma list of 9x16,4x5,1x1,16x9   (default: spec.formats, else 9x16)
 *   --out      output folder                     (default: out)
 *   --crf      quality, lower = better           (default: 18)
 *   --still    render preview PNGs instead of video
 *   --gif      also export a GIF (lower res) next to each MP4
 */
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
};
const specPath = args.find((a) => a.endsWith(".json"));
if (!specPath) {
  console.error("Usage: npm run make -- path/to/spec.json [--formats 9x16,1x1] [--out out] [--still] [--gif]");
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(path.resolve(specPath), "utf8"));
const formats = String(flag("formats", (spec.formats ?? ["9x16"]).join(","))).split(",").map((s) => s.trim());
const outDir = path.resolve(String(flag("out", "out")));
const crf = Number(flag("crf", 18));
const still = Boolean(flag("still", false));
const gif = Boolean(flag("gif", false));
const name = path.basename(specPath, ".json");
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
fs.mkdirSync(outDir, { recursive: true });

const valid = ["9x16", "4x5", "1x1", "16x9"];
for (const f of formats) if (!valid.includes(f)) throw new Error(`Unknown format "${f}". Use one of ${valid.join(", ")}`);

console.log(`▸ Bundling…`);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });

// scene timing mirrors src/engine/timing.ts so stills land mid-scene
const fps = spec.fps ?? 30;

for (const format of formats) {
  const inputProps = { spec, format };
  const composition = await selectComposition({ serveUrl, id: `Engine-${format}`, inputProps, browserExecutable });

  if (still) {
    const { sceneStarts, sceneLens } = await timeline(serveUrl, inputProps);
    for (let i = 0; i < sceneStarts.length; i++) {
      const frame = Math.min(composition.durationInFrames - 1, Math.round(sceneStarts[i] + sceneLens[i] * 0.72));
      const output = path.join(outDir, `${name}-${format}-scene${i + 1}.png`);
      await renderStill({ composition, serveUrl, output, frame, inputProps, browserExecutable });
      console.log(`  ✓ ${path.relative(process.cwd(), output)}`);
    }
    continue;
  }

  const output = path.join(outDir, `${name}-${format}.mp4`);
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    crf,
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    jpegQuality: 92,
    outputLocation: output,
    inputProps,
    browserExecutable,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== last) {
        last = pct;
        process.stdout.write(`\r▸ ${name} ${format}  ${pct}%   `);
      }
    },
  });
  console.log(`\n  ✓ ${path.relative(process.cwd(), output)}  (${(composition.durationInFrames / fps).toFixed(1)}s, ${composition.width}×${composition.height})`);

  if (gif) {
    const gifOut = output.replace(/\.mp4$/, ".gif");
    await renderMedia({
      composition,
      serveUrl,
      codec: "gif",
      scale: 0.4,
      everyNthFrame: 2,
      outputLocation: gifOut,
      inputProps,
      browserExecutable,
    });
    console.log(`  ✓ ${path.relative(process.cwd(), gifOut)}`);
  }
}

async function timeline(serveUrl, inputProps) {
  // tiny re-implementation to avoid importing TS from Node
  const DEF = { title: 2.6, logo: 3, list: 4, stat: 3, quote: 4, captions: 0, image: 3, cta: 3.2 };
  const secs = spec.scenes.map((s) => {
    if (s.duration) return s.duration;
    if (s.type === "list") return Math.max(3, 1.2 + s.items.length * 0.7);
    if (s.type === "captions") {
      if (s.words) return s.words.at(-1).end + 0.6;
      const per = 60 / (s.wpm ?? 170);
      let end = 0.25;
      for (const w of (s.text ?? "").trim().split(/\s+/).filter(Boolean)) {
        end += per * (0.75 + Math.min(w.length, 12) / 16) + (/[.,!?;:]$/.test(w) ? per * 0.6 : 0);
      }
      return end + 0.6;
    }
    return DEF[s.type];
  });
  const lens = secs.map((s) => Math.round(s * fps));
  const starts = [];
  let t = 0;
  spec.scenes.forEach((s, i) => {
    const tr = i === 0 ? null : s.transition ?? spec.transition ?? { type: "fade", duration: 0.5 };
    const tf = !tr || tr.type === "none" ? 0 : Math.round((tr.duration ?? 0.5) * fps);
    t -= Math.min(tf, i ? lens[i - 1] - 1 : 0);
    starts.push(t);
    t += lens[i];
  });
  void serveUrl;
  void inputProps;
  return { sceneStarts: starts, sceneLens: lens };
}
