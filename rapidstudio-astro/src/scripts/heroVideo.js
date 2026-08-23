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
    // file is a megabyte of detail nobody can see there. Rewriting the <source>
    // list before load() means only the chosen size is ever fetched.
    if (innerWidth < 700) {
      video.querySelectorAll('source').forEach((s) => {
        s.setAttribute('src', s.getAttribute('src').replace('-720.', '-480.'));
      });
    }
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
  // Two things drive it: the closing dive toward the open aperture, and an idle
  // float while the rig is parked at the top. They compose into one string so
  // neither clobbers the other, and it all stays on the compositor — no
  // repaint, no decode — so it holds up while seeks are still landing.
  let scale = 1, fx = 0, fy = 0, fs = 1, lastT = '';
  function applyTransform() {
    const t = (fx || fy ? `translate3d(${fx.toFixed(2)}px, ${fy.toFixed(2)}px, 0) ` : '') +
              (scale * fs > 1.0001 ? `scale(${(scale * fs).toFixed(4)})` : '');
    if (t !== lastT) { video.style.transform = t; lastT = t; }
  }

  function push(k) { scale = k; applyTransform(); }

  // A locked-off plate is a photograph, not a shot. A slow, barely-there breath
  // on two different periods keeps it alive while nobody is scrolling, and it
  // gets out of the way the moment the footage has motion of its own.
  let floatAmp = 1, floating = false;
  function floatTick(now) {
    if (!floating) return;
    fx = Math.sin(now / 4100) * 7 * floatAmp;
    fy = Math.cos(now / 5300) * 5 * floatAmp;
    fs = 1 + 0.006 * (1 + Math.sin(now / 6700)) * floatAmp;
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

  return { start, seek, push, setFloat, get duration() { return duration; } };
}
