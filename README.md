# Motion Engine

A code-driven motion graphics engine for **social clips, logo reveals and explainers**.
You describe a video as a small JSON spec. The engine renders it to MP4 in every social format, including 9:16, 4:5, 1:1 and 16:9, with the layout reflowing automatically.

Built on **[Remotion](https://www.remotion.dev)**, the most mature framework for programmatic video in React, plus:

| Library | Used for |
|---|---|
| `remotion` + `@remotion/renderer` | frame-accurate rendering to H.264 MP4 / GIF |
| `@remotion/transitions` | scene transitions (fade, slide, wipe, flip, clock-wipe) plus a custom zoom-blur |
| `@remotion/layout-utils` | measuring text so titles auto-fit any format |
| `@remotion/noise` | organic drifting background orbs |
| `@fontsource/*` | five bundled fonts (no network needed at render time) |

---

## Quick start

```bash
npm install
npm run studio                                   # live preview + timeline scrubbing in the browser
npm run make -- specs/launch-promo.json          # render MP4s for every format the spec lists
```

Output lands in `out/`. On first render Remotion downloads its headless browser (one-time, about 100 MB).

Requires Node 18+.

### Render options

```bash
npm run make -- specs/explainer.json --formats 9x16,16x9   # pick formats
npm run make -- specs/explainer.json --out renders --crf 16 # folder, quality (lower = better)
npm run make -- specs/logo-intro.json --gif                 # also export a small GIF
npm run still -- specs/launch-promo.json                    # one PNG per scene, for quick review
```

---

## Writing a spec

```json
{
  "fps": 30,
  "formats": ["9x16", "1x1", "16x9"],
  "theme": { "preset": "midnight", "logo": { "src": "logo.svg" } },
  "background": { "type": "orbs" },
  "transition": { "type": "zoom", "duration": 0.5 },
  "progressBar": true,
  "music": { "src": "track.mp3", "volume": 0.7 },
  "scenes": [
    { "type": "title", "kicker": "New", "text": "Your week,\n*finally* planned." },
    { "type": "stat", "value": 6.5, "suffix": " hrs", "label": "saved every week" },
    { "type": "cta", "text": "Plan *less*. Do more.", "button": "Try it free", "url": "example.com" }
  ]
}
```

- Durations are in **seconds**. Every scene has a sensible default, so you can omit them.
- In any headline text, wrap words in `*asterisks*` to highlight them. Highlighted words get the accent colour and an underline that sweeps in. Use `\n` to force a line break.
- Files such as logos, images and music go in `public/` and are referenced by file name. `https://` URLs also work.

### Scenes

| type | key fields | notes |
|---|---|---|
| `title` | `text`, `kicker`, `subtitle`, `anim`, `split`, `align` | `anim`: rise · pop · slide · blur · drop · typewriter. `split`: word · char · line |
| `logo` | `logo`, `style`, `tagline` | `style`: burst · mask · scale · slices · type (type is for text wordmarks) |
| `list` | `title`, `items[]`, `numbered` | `numbered: false` shows animated check marks |
| `stat` | `value`, `from`, `prefix`, `suffix`, `decimals`, `label`, `ring` | count-up. `ring` draws a 0–100 progress ring |
| `quote` | `text`, `author`, `role` | |
| `captions` | `text` + `wpm`, **or** `words[]` with timings, `style`, `audio`, `position` | `style`: pill · bold · karaoke |
| `image` | `src`, `caption`, `fit`, `kenBurns` | `fit`: contain (floating card) · cover (full bleed) |
| `cta` | `text`, `button`, `url`, `handle`, `showLogo` | button pops in, shimmers, then "clicks" |

Any scene can also override `duration`, `transition` (the transition *into* it) and `background`.

### Themes

Presets: `midnight` · `paper` · `neon` · `sunset` · `mono` · `ocean`. You can override any part of a preset:

```json
"theme": {
  "preset": "neon",
  "colors": { "accent": "#FF5A1F", "accent2": "#FFD400" },
  "fonts": { "display": "Bricolage Grotesque", "body": "Inter" },
  "radius": 16,
  "logo": { "src": "logo.svg", "size": 0.5 }
}
```

Colour keys: `bg`, `bg2`, `fg`, `muted`, `accent`, `accent2`, `onAccent`.
Bundled fonts: Inter, Space Grotesk, Bricolage Grotesque, DM Serif Display, JetBrains Mono.

### Backgrounds

`orbs` (drifting colour blobs) · `grid` (add `"perspective": true` for a floor grid) · `gradient` · `dots` · `solid` · `image` (`src`, `dim`).
Film grain is on by default. Set `"grain": false` to turn it off.

### Transitions

`fade` · `slide` · `slide-up` · `wipe` · `flip` · `clock` · `zoom` · `none`. Each takes a `duration` in seconds.

### Formats and safe areas

| id | size | for |
|---|---|---|
| `9x16` | 1080×1920 | Reels, TikTok, Shorts, Stories |
| `4x5` | 1080×1350 | Instagram and LinkedIn feed |
| `1x1` | 1080×1080 | square feed |
| `16x9` | 1920×1080 | YouTube, X, LinkedIn, web |

Content stays inside each format's safe area, so platform UI (usernames, buttons, captions) never covers it. The margins are in `src/engine/formats.ts`.

---

## Captions from real voice-over

For talking-head clips, transcribe your audio and pass word timings:

```json
{ "type": "captions", "style": "pill", "audio": "voiceover.mp3",
  "words": [ { "text": "Here's", "start": 0.0, "end": 0.32 }, { "text": "the", "start": 0.32, "end": 0.45 } ] }
```

Any transcriber that outputs word timestamps works. Remotion's own `@remotion/install-whisper-cpp` runs Whisper locally and produces this shape with minor mapping.

---

## Project layout

```
specs/              example videos: launch-promo, logo-intro, explainer, social-captions
public/             your logos, images, music
scripts/make.mjs    batch renderer (all formats, stills, GIF)
src/
  Root.tsx          registers compositions (Engine-<format> + examples for Studio)
  engine/
    types.ts        the spec format, fully typed
    Video.tsx       spec → timeline (TransitionSeries), music, progress bar, grain
    RichText.tsx    auto-fitting, staggered, highlight-aware text
    anim.ts         spring presets + entrance styles
    themes.ts       presets & colour helpers
    formats.ts      sizes & safe areas
    timing.ts       durations, transitions, caption auto-timing
    transitions.tsx built-in + custom zoom transition
  scenes/           one component per scene type
  backgrounds/      backgrounds + grain
```

### Adding a scene type

1. Add an interface to `src/engine/types.ts` and add it to the `Scene` union.
2. Write `src/scenes/MyScene.tsx`. Use `useLayout()` for format-aware sizes (multiply px by `u`) and `useTheme()` for colours and fonts.
3. Add a `case` in `src/scenes/index.tsx` and a default duration in `src/engine/timing.ts`.

### Using it from code

Each `Engine-<format>` composition takes `{ spec, format }` as input props. This means you can render from any Node service with `@remotion/renderer`, or from the CLI:

```bash
npx remotion render src/index.ts Engine-9x16 out/clip.mp4 --props='{"format":"9x16","spec":{...}}'
```

---

## License note

Remotion is **free for individuals and companies with up to 3 people**, including commercial use. Larger for-profit companies need a Remotion Company License. See [remotion.dev/license](https://www.remotion.dev/docs/license). Everything else here is MIT or OFL (fonts).
