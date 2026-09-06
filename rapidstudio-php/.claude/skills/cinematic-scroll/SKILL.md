---
name: cinematic-scroll
description: >
  Build a premium, 60fps "cinematic scroll" website — a scroll-scrubbed
  all-intra video hero, Lenis + GSAP frame-locked smooth scrolling, a
  spatial-grid canvas particle field, a scroll-driven sticky card reel with
  cursor parallax, a fixed rolling caption, and an aperture (View Transitions)
  page change. Use when building an agency/portfolio/marketing site with
  scrubbed video, parallax and buttery scroll, OR when an existing scroll site
  is janky/shaky/stuttery and needs the performance patterns and the
  video-encoding fix. Framework-agnostic (plain JS + canvas + GSAP + Lenis);
  works with any backend (PHP, static, Next, Astro).
---

# Cinematic scroll system

A complete, field-tested recipe for a smooth "scroll is the timeline" site.
Every rule here was learned by fixing real jank on production hardware. The
`reference/` folder holds the **actual working modules** — copy them in and wire
them up; don't rewrite from scratch.

## Files in this skill

| File | What it is | Copy to |
|---|---|---|
| `reference/boot.js` | Wires everything: Lenis + GSAP ticker, then mounts each module | your JS entry |
| `reference/heroVideo.js` | The scrubbed-`<video>` rig: queued eased seeks, priming, idle scale-breath | src |
| `reference/hero.js` | The hero controller: loader, one ScrollTrigger driving seek + overlay fades + aperture reveal | src |
| `reference/reel.js` | The sticky pile reel: scroll-driven transforms, overlay dim, cursor tilt, centre-snap, rail, rolling caption | src (exports `mountStack`) |
| `reference/particles.js` | Canvas field: water physics, **spatial grid** links, **alpha-bucket** draw, idle when hidden | src |
| `reference/styles.css` | The CSS the modules depend on (structure + the perf-critical rules) | your css |
| `reference/markup.html` | The exact ids/classes the JS binds to | your template |
| `reference/router.php` | Byte-range (206) dev server for `php -S` so the hero can scrub locally | project root |
| `reference/encode-hero.sh` | ffmpeg → all-intra (GOP 1) hero clips at 720p + 480p, mp4 + webm | run once on the master |

## Build order

1. **Encode the hero** with `encode-hero.sh master.mp4 hero` → four files. This
   is the single biggest smoothness lever (see §Hero).
2. **Drop in the CSS + markup** (`styles.css`, `markup.html`) — keep the ids.
3. **Copy the four JS modules** and `boot.js`; bundle (esbuild) or load GSAP +
   ScrollTrigger + Lenis as UMD from a CDN before `boot.js`.
4. **Serve with byte-range.** Apache/Nginx/most hosts do it natively; for the
   PHP dev server use `php -S localhost:8000 router.php`.
5. Verify on a real machine, then run the §Debugging checklist.

---

## Performance commandments (the whole point)

1. **Per frame, only touch `transform` and `opacity`.** NEVER animate `filter`,
   `box-shadow`, `width/height/top/left`, or `border-radius` every frame — each
   forces layout/paint/filter passes. To dim per frame, fade a **dark overlay's
   opacity** (see `.reel-dim`), not `filter: brightness()`.
2. **Idle every rAF loop when nothing changed.** Track the last scroll value and
   whether an ease is still settling; if neither moved, write nothing. (`reel.js`
   does exactly this.)
3. **Idle offscreen / hidden work.** Pause a canvas field when its section is
   scrolled away or `document.hidden`; pause the page-wide field behind a
   full-bleed hero. (`particles.js` `schedule()` + the `isVisible` predicate in
   `boot.js`.)
4. **Batch canvas draws** — one `stroke()`/`fill()` per colour/alpha bucket, not
   per line/dot.
5. **No O(n²) per frame** — particle links use a **spatial grid** (cell = link
   distance) so each point checks only its neighbours.
6. **Gate heavy effects to desktop + motion.** The reel, cursor parallax and
   scrub float check `matchMedia('(min-width:761px)')` and
   `prefers-reduced-motion`. Mobile then Just Works (and stays smooth).
7. **`html { overflow-x: clip }`** (not `hidden`). Decorative bleed otherwise
   widens the mobile layout viewport and the page zooms out. `clip` doesn't
   break `position: sticky`; `hidden`/`auto` do.
8. **Never read a sticky element's `offsetTop` for geometry** — it reports the
   stuck position. Measure from a non-sticky ancestor (`reel.js` measures `#reel`,
   never `#reel-stage`).
9. **One scroll rail, one ticker.** Lenis drives GSAP via a single
   `gsap.ticker.add` (never a second rAF). `lerp`, not `duration`, so the scroll
   interpolates toward target **every frame**.
10. **`dpr = Math.min(devicePixelRatio, 2)`** on canvases — never 3× on phones.

---

## Hero — scroll-scrubbed video

**Encoding is 80% of the smoothness.** A scrub seek decodes from the nearest
keyframe to the target, so:

- **All-intra (GOP 1 — a keyframe on EVERY frame)** ⇒ every seek decodes exactly
  one frame ⇒ perfectly smooth. Cost: ~2× file size. Use for the hero.
- GOP 2 is a lighter middle ground; the browser default (~250) stutters badly.
- Verify: keyframe count == total frame count (see `encode-hero.sh`).
- **Serve with HTTP byte-range (206)** or `video.seekable` is empty and the clip
  freezes on frame one. `preload="none"` + let the rig set `src` + `load()`.
- **iOS:** one silent `play()/pause()` on first touch unlocks decoding.

`heroVideo.js` handles the rest: it **queues** seeks (issue the newest target
from the `seeked` event, never mid-flight) and **eases** playback time toward the
target so jumps travel instead of cutting. The idle "breath" is a **slow scale
about the subject only — no pixel translation** (translation on a near-static
frame reads as a shake).

`hero.js` runs one `ScrollTrigger` over the 300vh `#top` with `scrub: true`
(Lenis already smooths the input; a scrub *number* stacks a second lag) whose
`onUpdate` does `rig.seek(progress)` **and** `paintCopy(progress)`. `paintCopy`
maps progress through `smoothstep` windows to the opacity/transform of every
overlay, so copy and picture can't drift apart. It ends by punching a growing
radial mask (the aperture) so the next section shows *through* the hero.

---

## Particle field — `particles.js`

Water-like field behind everything. The three things that make it cheap enough
to run during scroll:

- **Spatial grid** (`CELL == LINK`): bin particles into cells, link each only
  against its cell + four forward neighbours ⇒ O(n), not O(n²).
- **Alpha buckets**: push each link segment into one of ~6 buckets by distance,
  then one `beginPath`+`stroke` per bucket; dots in two `fill()` passes.
- **Idle** via `schedule()` — `setTimeout(250)` instead of rAF when
  `document.hidden` or the `isVisible()` predicate is false.

Mount fixed behind the page: `mountParticles(reduced, isVisible)`. The canvas is
`position:fixed; inset:0; z-index:-1; pointer-events:none`.

---

## Reel — `reel.js` (exports `mountStack`)

One pinned stage, cards `position:absolute; inset:0`, look computed **directly**
from scroll — no fragile ScrollTrigger start/end strings.

- Track height `= (N-1)*step + 100vh`, `step = innerHeight * SPEED`
  (SPEED ≈ 0.5–1.6; higher = more scroll per project).
- Per card: `d = p - i` → `scale`, `opacity`, `y`, `zIndex`, and a **dim-overlay
  opacity** (never a filter). Incoming slides up from below; outgoing recedes.
- **Loop idles** unless `p` changed or the cursor-tilt ease is still moving.
- Cursor parallax: tilt the centred card in `perspective()`, drift its image
  inside the overflow-clipped frame.
- **Centre-snap**: after scroll settles, `lenis.scrollTo` the nearest project.
- Fixed caption over the pile whose text rolls out/in on change (queued so fast
  scrolls always land on the right name).
- Mobile / reduced-motion: `mountStack` bails early ⇒ the markup is a plain list.

---

## Page transition + mobile nav

- **Aperture transition** (cross-document View Transitions) in `styles.css`: old
  page dims, new page irises open from centre; the nav is named so it holds
  still. Ship a JS curtain fallback where unsupported.
- **Mobile nav**: the inline script in `markup.html` toggles a `.nav-open` class;
  `styles.css` turns the link pill into a tap-to-open sheet on ≤760px. One script
  in the shared layout covers every page — no bundle change.

---

## Deploy (PHP / Apache shared hosting)

- SQLite needs no DB server; make `data/` writable (755). Or use any backend.
- `.htaccess`: clean URLs + deny sensitive dirs; add `RewriteBase /subfolder/`
  and set the app's `base` path if the site lives in a subfolder, so asset URLs
  resolve. Cache-bust built assets with `?v=<filemtime>`.
- Apache serves byte-range natively, so the hero scrubs in production; `router.php`
  is only for the local `php -S` dev server.

---

## Debugging "not smooth"

1. **Mobile or desktop?** Desktop-only jank ⇒ a desktop-only effect (reel /
   cursor parallax / bigger field). Both ⇒ scroll config or a global loop.
2. **Measure:** `let t0=performance.now(); …count 30 rAFs…; ms=(now-t0)/30`.
   >16.7ms ⇒ dropping frames ⇒ apply commandments 1–5.
3. **Hero rough** ⇒ re-encode all-intra and confirm 206 byte-range serving.
4. **A static image "shakes"** ⇒ a per-frame pixel translation; make it
   scale-only.
5. **Horizontal scroll / zoomed-out mobile** ⇒ commandment 7; find the offender
   by scanning for `getBoundingClientRect().right > innerWidth`.
6. **Laggy/floaty scroll** ⇒ `lerp` too low, or a scrub *number* stacked on top
   of Lenis; raise `lerp` toward 0.12 or set hero `scrub: true`.
