---
name: cinematic-scroll
description: >
  Build a premium, 60fps "cinematic scroll" website — a scroll-scrubbed
  all-intra video hero, Lenis + GSAP frame-locked smooth scrolling, a
  spatial-grid canvas particle field, a scroll-driven sticky card reel with
  cursor parallax, and an aperture (View Transitions) page change. Use this when
  building an agency/portfolio/marketing site with scrubbed video, parallax and
  buttery scroll, OR when an existing scroll site is janky/shaky/stuttery and
  needs the performance patterns and the video-encoding fix. Framework-agnostic
  (plain JS/canvas + GSAP + Lenis); works with any backend (PHP, static, Next).
---

# Cinematic scroll system

A field-tested recipe for a smooth, GPU-friendly "scroll is the timeline" site.
Every rule here was learned by fixing real jank. Follow the **Performance
commandments** first — they are what separate 60fps from a shaking page.

## The stack

- **Lenis** — smooth scroll (the one virtual scroll position everything reads).
- **GSAP + ScrollTrigger** — scroll-linked timelines; ONE ticker drives Lenis.
- **Canvas 2D** — the particle/constellation field (no library).
- **A scroll-scrubbed `<video>`** — the hero, seeked by scroll position.
- Load GSAP/Lenis from a CDN or bundle with esbuild; pin exact versions.

## Performance commandments (read first)

1. **Only animate compositor-cheap properties every frame:** `transform` and
   `opacity`. NEVER animate `filter`, `box-shadow`, `width/height/top/left`, or
   `border-radius` per frame — each forces a layout/paint/filter pass. To dim
   something per frame, fade a **dark overlay's opacity**, don't use
   `filter: brightness()`.
2. **Idle every rAF loop when nothing changed.** A loop that rewrites the DOM
   every frame at rest keeps repainting. Track the last scroll position + whether
   an ease is still settling; if neither moved, write nothing.
3. **Idle offscreen work.** Pause a canvas field / effect when its section is
   scrolled away or the tab is hidden (`document.hidden`, IntersectionObserver).
   Behind a full-bleed hero, pause the background field entirely.
4. **Batch canvas draws.** One `stroke()`/`fill()` per *colour or alpha bucket*,
   never per line/dot. Building a Path2D of thousands of segments and stroking
   once is ~100× cheaper than stroking each.
5. **Never do O(n²) per frame.** For particle links use a **spatial grid**
   (cell = link distance) so each point only checks its neighbours.
6. **Disable heavy effects on mobile / reduced-motion.** Gate the reel, cursor
   parallax and scrubbing behind `matchMedia('(min-width:761px)')` and
   `prefers-reduced-motion`. Small screens then Just Work.
7. **Clip overflow on `html`, using `clip` not `hidden`.** Decorative bleed
   (glows, oversized seals) otherwise widens the mobile layout viewport and the
   whole page zooms out. `overflow-x: clip` does NOT break `position: sticky`;
   `hidden`/`auto` do.
8. **Never read a sticky element's `offsetTop` for geometry** — it reports the
   *stuck* (scroll-following) position. Measure from a non-sticky ancestor.

## 1 — Frame-locked smooth scroll (Lenis + GSAP)

One ticker, lerp-based so the scroll interpolates toward the target **every
frame** (this is "catch every frame"), not eased per wheel event.

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, syncTouch: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));  // ONE loop drives Lenis
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis;                        // so other modules can scrollTo()
```

- `lerp` lower = heavier/smoother, higher = snappier. `0.08–0.12` is the useful
  band. Use the SAME config on every page.
- Anchor jumps: `lenis.scrollTo(target, { offset: -64, duration: 1 })`.

## 2 — Scroll-scrubbed video hero

The single biggest smoothness lever is the **video encoding**, then a queued,
eased seek.

### Encode the clip ALL-INTRA (a keyframe on every frame)

A scrub seek decodes from the nearest keyframe to the target. All-intra = 1
frame per seek = perfectly smooth. Cost: ~2× file size (worth it for a hero).

```bash
# H.264 mp4 (primary; every browser plays it muted+inline)
ffmpeg -y -i src.mp4 -an -c:v libx264 -crf 20 -preset slow \
  -g 1 -keyint_min 1 -x264-params scenecut=0 \
  -pix_fmt yuv420p -movflags +faststart hero-720.mp4

# VP9 webm (optional, list FIRST in <source> so it's preferred; keep it <= mp4)
ffmpeg -y -i src.mp4 -an -c:v libvpx-vp9 -crf 35 -b:v 0 \
  -g 1 -keyint_min 1 -deadline good -cpu-used 2 -row-mt 1 \
  -pix_fmt yuv420p hero-720.webm
```

Ship a 720p and a 480p; load the small one on narrow/low-power screens.
Verify: `ffprobe -select_streams v:0 -show_entries frame=key_frame ... | grep -c 1`
should equal the total frame count. GOP 2 (`-g 2`) is a lighter middle ground.

### Serve with HTTP byte-range (206)

Scrubbing needs range requests or `video.seekable` is empty and it freezes on
frame one. Apache/Nginx/most hosts do this natively. The PHP built-in dev
server does NOT — use a router that emits 206 (see `reference/` in this skill's
project, or use `php -S host:port router.php`). Set `preload="auto"`.

### The seek rig (queue + ease + prime)

```js
let dur = 0, target = 0, shown = 0, seeking = false, running = false;
const EPS = 1 / 60;                          // don't chase < 1 frame
video.addEventListener('seeked', () => { seeking = false; pump(); });
function pump() {                            // issue the newest target, one at a time
  if (seeking || !dur) return;
  const t = Math.min(dur - 0.05, Math.max(0, shown));
  if (Math.abs(video.currentTime - t) < EPS) return;
  seeking = true; try { video.currentTime = t; } catch { seeking = false; }
}
function tick() {                            // ease shown -> target so jumps travel
  if (!running) return;
  const gap = target - shown;
  if (Math.abs(gap) < EPS / 2) { shown = target; running = false; }
  else { shown += gap * 0.22; requestAnimationFrame(tick); }
  pump();
}
function seek(p) { target = p * dur; if (!running) { running = true; requestAnimationFrame(tick); } }
// iOS: one silent play()/pause() on first touch unlocks decoding.
```

Drive it and the copy overlays from ONE ScrollTrigger over a tall pinned
section (`#top { height: 300vh }`), `scrub: true` (Lenis already smooths input;
adding a scrub number stacks a second lag — avoid unless you want float):

```js
ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom bottom',
  scrub: true, onUpdate: (s) => { rig.seek(s.progress); paintCopy(s.progress); } });
```

`paintCopy(p)` maps `p` (0→1) to opacity/transform of every overlay through
smoothstep windows, so text and picture can never drift apart. Cache last
values and only write on change.

### Idle "breath" — scale, never translate

A gentle idle float keeps the plate alive. Use a **slow scale about the
subject** (set `transform-origin` to the focal point). Pixel translations of a
near-static frame read as a *shake*.

```js
fs = 1 + 0.009 * (1 + Math.sin(now / 7200));   // that's it — no fx/fy translate
```

## 3 — Canvas particle field (spatial grid + batched draw + idle)

```js
const COUNT = Math.min(500, Math.max(180, Math.round(w * h / 2700)));
const LINK = 138, LINK2 = LINK * LINK, CELL = LINK;   // grid cell == link range
// build grid of empty arrays sized ceil(w/CELL) * ceil(h/CELL) on resize.

function frame() {
  // physics: drift + cursor-repel + spring-home + viscosity (water feel)
  // 1) bin particle indices into grid cells
  // 2) link each particle only against its cell + 4 forward-neighbour cells
  //    (so each pair once) → O(n) not O(n²)
  // 3) push each linked segment [ax,ay,bx,by] into one of ~6 ALPHA BUCKETS
  // 4) draw: one beginPath+stroke per bucket (fixed rgba); dots in 2 fills
  schedule();
}
function schedule() {                          // idle when unseen
  if (document.hidden || (isVisible && !isVisible())) setTimeout(schedule, 250);
  else requestAnimationFrame(frame);
}
```

- Pass an `isVisible()` predicate: for a fixed full-page field behind a hero,
  return `false` while the hero covers it (`scrollY <= heroHeight - 1.5*vh`).
- Keep the field's `<canvas>` `position: fixed; z-index: -1; pointer-events:none`.
- `dpr = Math.min(devicePixelRatio, 2)` — never render at 3× on phones.

## 4 — The sticky "pile" reel (scroll-driven, not scrubbed tweens)

One pinned stage, cards absolutely stacked, look computed directly from scroll —
no fragile ScrollTrigger start/end strings, no sticky-offset math.

- `.reel` is a tall track (`height = (N-1)*step + 100vh`, `step = vh * SPEED`).
- `.reel-stage` is `position: sticky; top:0; height:100vh`.
- Each `.reel-item` is `position:absolute; inset:0`, centred.
- A rAF loop (running only while the section intersects) computes, per card,
  its `d = p - i` (p = fractional scroll index) → `scale`, `opacity`, `y`,
  `zIndex`, and a **dim-overlay opacity** (NOT a filter). Incoming slides up from
  below; outgoing recedes.
- **Idle the loop** unless `p` changed or the cursor-tilt ease is still moving.
- Cursor parallax: tilt the centred card in `perspective()` + drift its image
  inside an overflow-clipped frame; ease `curX += (tgX-curX)*0.12`.
- Title lives ON the card (or a single fixed caption with a masked roll swap);
  never a separate element that can drift.
- Mobile/reduced-motion: bail early → plain vertical list.

## 5 — Aperture page transition (branded, MPA)

Cross-document View Transitions; the new page irises open from the centre,
echoing a lens — cheap and distinctive.

```css
@view-transition { navigation: auto; }
@keyframes vt-dim  { to { opacity: 0; transform: scale(.97); filter: blur(3px); } }
@keyframes vt-iris { from { clip-path: circle(0% at 50% 46%); }
                     to   { clip-path: circle(150% at 50% 46%); } }
::view-transition-old(root) { animation: vt-dim .4s cubic-bezier(.4,0,.2,1) both; }
::view-transition-new(root) { animation: vt-iris .7s cubic-bezier(.83,0,.17,1) both; }
::view-transition-old(nav), ::view-transition-new(nav) { animation: none; } /* nav holds still */
```

Name the nav (`view-transition-name: nav`) so it doesn't move. Provide a JS
curtain fallback where View Transitions are unsupported.

## Mobile

- Hamburger nav: on ≤760px collapse the link pill into a tap-to-open sheet
  (absolute, `right:0`, opacity/visibility toggled by a class). A tiny inline
  script in the shared layout covers every page.
- Everything heavy (reel, tilt, scrub float) is already gated to desktop, so
  phones stay smooth.

## Deployment notes (if PHP/Apache shared hosting)

- SQLite needs no DB server; make the `data/` dir writable (755).
- Clean URLs + the sensitive-dir denials go in `.htaccess`; add
  `RewriteBase /subfolder/` if the site lives in a subfolder, and set the app's
  `base` path to match so asset URLs resolve.
- Cache-bust built assets with `?v=<filemtime>` so redeploys are never stale.

## Debugging a "not smooth" report

1. Is it mobile or desktop? Desktop-only jank ⇒ a desktop-only effect (reel /
   cursor parallax / bigger field). Both ⇒ scroll config or a global loop.
2. Measure: `let t0=performance.now(); …30 rAFs…; ms=(now-t0)/30`. >16.7ms ⇒
   dropping frames ⇒ apply commandments 1–5.
3. Hero specifically rough ⇒ re-encode all-intra (§2) and confirm byte-range.
4. "Shaking" static image ⇒ a per-frame pixel translation; make it scale-only.
5. Horizontal scroll / zoomed-out mobile ⇒ commandment 7 (`html{overflow-x:clip}`)
   and find the offender: scan for elements whose `getBoundingClientRect().right
   > innerWidth`.
