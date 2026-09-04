/*
  Hero rig: real footage, scrubbed by scroll.

  The clip is a single continuous take — the camera turns to face us, then the
  iris opens. Scroll position maps straight onto playback time, so the reader
  drives the move instead of watching it.

  Two things make scrubbing a <video> behave:

  1. The file is encoded with a 4-frame GOP, so any seek decodes at most three
     frames. With a default 250-frame GOP a scrub stutters badly on every seek.
  2. Seeks are queued, not fired. Assigning currentTime while a seek is still in
     flight throws the request away in some browsers and floods the decoder in
     others, so we hold the newest target and issue it from the `seeked` event.

  Playback time is also eased toward the target rather than snapped to it: the
  scroll may jump (a keyboard PageDown, a scrollbar drag) and the footage should
  travel there rather than cut.
*/

const LENS = { x: 49.6, y: 52.5 };   // the aperture's centre, in % of the frame
const EPS = 1 / 60;                  // don't chase differences below one frame

export function createHeroVideo(video, opts = {}) {
  const onFrame = opts.onFrame || (() => {});

  let duration = 0;
  let target = 0;      // where the scroll wants us, in seconds
  let shown = 0;       // where the element actually is
  let seeking = false;
  let running = false;

  // Portrait phones crop a 16:9 frame down to a sliver, so let the footage
  // letterbox there instead — the camera stays whole and the ink surround
  // reads as a deliberate frame.
  video.style.transformOrigin = `${LENS.x}% ${LENS.y}%`;

  function pump() {
    if (seeking || !duration) return;
    const t = Math.min(duration - 0.05, Math.max(0, shown));
    if (Math.abs(video.currentTime - t) < EPS) return;
    seeking = true;
    try {
      video.currentTime = t;
    } catch {
      seeking = false;
    }
  }

  video.addEventListener('seeked', () => {
    seeking = false;
    pump();
  });

  function tick() {
    if (!running) return;
    const gap = target - shown;
    if (Math.abs(gap) < EPS / 2) {
      shown = target;
      running = false;
    } else {
      shown += gap * 0.22;
      requestAnimationFrame(tick);
    }
    pump();
  }

  // On a phone the stage crops the sides off the 16:9 frame, and the camera
  // does not sit still inside it: it starts left of centre and walks right as
  // it turns, settling by the halfway point. A fixed crop clips the lens off
  // the edge, so the crop window follows it.
  const portrait = matchMedia('(max-aspect-ratio: 3/4)');
  let lastPos = -1;
  function reframe(p) {
    if (!portrait.matches) {
      if (lastPos !== -1) { video.style.objectPosition = ''; lastPos = -1; }
      return;
    }
    const u = Math.min(1, p / 0.5);
    const x = Math.round((43 + 7 * u) * 10) / 10;
    if (x !== lastPos) { video.style.objectPosition = `${x}% center`; lastPos = x; }
  }

  function seek(p) {
    reframe(p);
    if (!duration) return;
    target = p * duration;
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  // iOS will not decode a frame until the element has been through play() at
  // least once, even when it is muted and inline. One silent play/pause on the
  // first opportunity unlocks seeking for the rest of the session.
  let primed = false;
  function prime() {
    if (primed) return;
    primed = true;
    const p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(() => video.pause()).catch(() => {});
    } else {
      try { video.pause(); } catch {}
    }
  }

  function start() {
    // Narrow viewports render the frame at a few hundred CSS pixels; the 720p
    // file is a megabyte of detail nobody can see there. The sources carry no
    // src at all until this runs, so exactly one size is ever requested.
    const small = innerWidth < 700;
    video.querySelectorAll('source').forEach((s) => {
      const url = s.dataset.src;
      if (!url) return;
      s.setAttribute('src', small ? url.replace('-720.', '-480.') : url);
    });
    video.preload = 'auto';
    video.load();

    const ready = () => {
      duration = video.duration || 0;
      prime();
      pump();
      onFrame();
    };
    if (video.readyState >= 1) ready();
    else video.addEventListener('loadedmetadata', ready, { once: true });

    addEventListener('pointerdown', prime, { once: true, passive: true });
    addEventListener('touchstart', prime, { once: true, passive: true });
  }

  // ---- transform ----
  // Three things drive it: the entrance that runs once the loader clears, an
  // idle float while the rig is parked at the top, and the closing dive toward
  // the open aperture. They compose into one string so none clobbers another,
  // and it all stays on the compositor — no repaint, no decode — so it holds up
  // while seeks are still landing.
  let scale = 1;                       // the dive
  let fx = 0, fy = 0, fs = 1;          // the float
  let ix = 0, iy = 0, is = 1;          // the entrance
  let lastT = '';

  function applyTransform() {
    const tx = fx + ix, ty = fy + iy, k = scale * fs * is;
    const t = (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01
                ? `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) ` : '') +
              (k > 1.0001 ? `scale(${k.toFixed(4)})` : '');
    if (t !== lastT) { video.style.transform = t; lastT = t; }
  }

  function push(k) { scale = k; applyTransform(); }

  // A locked-off plate is a photograph, not a shot.
  //
  // Sliding the plate moves everything in it — the table edge, the haze at the
  // frame's sides — and that reads as the whole room drifting rather than the
  // camera breathing. So the motion is mostly a slow scale ABOUT THE LENS, which
  // the transform-origin already sits on: the subject swells and settles while
  // the dark, defocused surroundings barely register it. The translation that is
  // left is small, and only there to stop the breath looking mechanical.
  let floatAmp = 1, floating = false;
  function floatTick(now) {
    if (!floating) return;
    fx = Math.sin(now / 4300) * 6 * floatAmp;
    fy = Math.cos(now / 5900) * 4 * floatAmp;
    fs = 1 + 0.013 * (1 + Math.sin(now / 6100)) * floatAmp;
    applyTransform();
    requestAnimationFrame(floatTick);
  }
  function setFloat(amount) {
    floatAmp = amount;
    if (amount > 0.002 && !floating) { floating = true; requestAnimationFrame(floatTick); }
    else if (amount <= 0.002 && floating) {
      floating = false; fx = 0; fy = 0; fs = 1; applyTransform();
    }
  }

  // The entrance. The loader lifts on a frame that has been sitting still behind
  // it, which lands flat; this settles the camera into place instead — a slow
  // release out of a slight push, handed straight over to the float.
  function intro(ms = 2000) {
    const t0 = performance.now();
    const step = (now) => {
      const u = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - u, 4);        // quartic out: fast release, long settle
      is = 1.075 - 0.075 * e;
      iy = 26 * (1 - e);
      ix = -14 * (1 - e);
      applyTransform();
      if (u < 1) requestAnimationFrame(step);
      else { is = 1; ix = 0; iy = 0; applyTransform(); }
    };
    requestAnimationFrame(step);
  }

  return { start, seek, push, setFloat, intro, get duration() { return duration; } };
}
