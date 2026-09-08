/* Excello Developers — boot script
   Lenis (smooth scroll) -> GSAP ticker -> ScrollTrigger, one rail, one ticker. */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => matchMedia('(min-width: 981px)').matches && matchMedia('(pointer: fine)').matches;
const smoothstep = (p, e0, e1) => {
  const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ---------------------------------------------------------------------
   1. Lenis + GSAP ticker wiring
--------------------------------------------------------------------- */
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);
gsap.set('.hero-headline .reveal', { yPercent: 112 });

let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  window.__lenis = lenis;
} else {
  gsap.ticker.add(() => ScrollTrigger.update());
}

function scrollToEl(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    document.documentElement.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    scrollToEl(id);
  });
});

/* ---------------------------------------------------------------------
   2. Scroll-scrubbed video engine, shared by the hero and the journey
   canvas. Both are all-intra (GOP 1) footage: every frame is its own
   keyframe, so a scroll seek always decodes exactly one frame, no matter
   how far or fast the scrub jumps.

   Loading tries the plain, native route first — `src` + `load()` — which
   lets the browser stream the file progressively over HTTP Range requests
   instead of blocking on the whole download; that's what makes scrubbing
   feel immediate rather than waiting on a multi-megabyte fetch to finish.
   Only when that native route actually fails (a host that answers a Range
   request with a plain 200, which Chrome then aborts) does it fall back to
   fetching the whole file as a Blob, which works against any host at the
   cost of that upfront wait. `fetch` itself throws under file://, so that
   case never attempts the Blob path — native loading already works there
   since there's no HTTP Range involved in reading a local file. */
function createScrubVideo(video, opts) {
  const onFrame = (opts && opts.onFrame) || null;
  let duration = 0, target = 0, shown = 0, seekBusy = false, pendingTime = null;
  let rafId = null, lastTick = 0, latestP = 0, primed = false;
  const readyCbs = [];

  function requestSeek(t) {
    if (!duration) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    try { video.currentTime = t; } catch { seekBusy = false; }
  }
  video.addEventListener('seeked', () => {
    seekBusy = false;
    if (onFrame) onFrame();
    if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
  });

  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const k = 0.18;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    if (Math.abs(target - shown) < 0.01) { shown = target; rafId = null; lastTick = 0; }
    else rafId = requestAnimationFrame(tick);
    requestSeek(Math.min(duration - 0.03, Math.max(0, shown)));
  }

  function prime() {
    if (primed) return;
    primed = true;
    const p = video.play();
    if (p && typeof p.then === 'function') p.then(() => video.pause()).catch(() => {});
  }

  function onReady() {
    duration = video.duration || 0;
    prime();
    requestSeek(Math.min(duration - 0.03, Math.max(0, latestP * duration)));
    readyCbs.splice(0).forEach((cb) => cb());
  }

  function load(primaryUrl, fallbackUrl) {
    let settled = false;
    function toBlob() {
      if (settled) return;
      settled = true;
      fetch(primaryUrl)
        .then((res) => { if (!res.ok) throw new Error(String(res.status)); return res.blob(); })
        .then((blob) => {
          video.addEventListener('loadedmetadata', onReady, { once: true });
          video.preload = 'auto';
          video.src = URL.createObjectURL(blob);
          video.load();
        })
        .catch(() => {
          if (fallbackUrl && fallbackUrl !== primaryUrl) load(fallbackUrl, null);
          else video.style.display = 'none';
        });
    }
    function nativeReady() {
      if (settled) return;
      /* Metadata alone isn't proof the host actually supports Range
         requests: a host that ignores Range and just answers 200 can still
         parse a valid duration while leaving `seekable` empty, with no
         `error` event to catch it by. That combination means scrubbing
         would silently never move, so it's treated the same as a load
         failure and falls back to the Blob route. */
      const sk = video.seekable;
      if (sk.length === 0 || sk.end(sk.length - 1) < video.duration - 0.5) { toBlob(); return; }
      settled = true;
      onReady();
    }
    video.addEventListener('loadedmetadata', nativeReady, { once: true });
    video.addEventListener('error', () => {
      if (location.protocol === 'file:') video.style.display = 'none';
      else toBlob();
    }, { once: true });
    video.preload = 'auto';
    video.src = primaryUrl;
    video.load();
  }

  return {
    load,
    prime,
    seekProgress(p) { latestP = p; target = p * (duration || 0); if (rafId === null) rafId = requestAnimationFrame(tick); },
    onReady(cb) { if (duration) cb(); else readyCbs.push(cb); },
    get duration() { return duration; },
  };
}

/* ---------------------------------------------------------------------
   Boot loader — tracks real readiness (fonts + both scrub videos), eased
   toward the true figure so the number never stalls dead or jumps, capped
   short of 100 until everything actually clears. A hard ceiling means a
   stalled network can never lock a visitor out.
--------------------------------------------------------------------- */
const loaderEl = document.getElementById('loader');
const loaderPct = document.getElementById('loader-pct');
const loaderBarFill = document.getElementById('loader-bar-fill');
const bootSignals = { fonts: false, hero: false, journey: false };

function bootProgress() {
  const w = { fonts: 0.15, hero: 0.45, journey: 0.4 };
  return (bootSignals.fonts ? w.fonts : 0) + (bootSignals.hero ? w.hero : 0) + (bootSignals.journey ? w.journey : 0);
}
function runLoader() {
  return new Promise((resolve) => {
    let shown = 0, done = false, raf;
    const allReady = () => bootSignals.fonts && bootSignals.hero && bootSignals.journey;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      loaderPct.textContent = '100';
      loaderBarFill.style.width = '100%';
      resolve();
    };
    const tick = () => {
      shown += (bootProgress() - shown) * 0.09;
      const n = Math.min(99, Math.round(shown * 100));
      loaderPct.textContent = String(n);
      loaderBarFill.style.width = n + '%';
      if (!done) raf = requestAnimationFrame(tick);
      if (allReady() && shown > 0.97) finish();
    };
    raf = requestAnimationFrame(tick);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { bootSignals.fonts = true; });
    else bootSignals.fonts = true;
    setTimeout(finish, 8000);
  });
}

/* ---------------------------------------------------------------------
   3. Custom cursor (desktop, fine pointer only)
--------------------------------------------------------------------- */
const cursor = document.getElementById('cursor');
const cursorLabel = document.getElementById('cursor-label');
function initCursor() {
  if (!isDesktop() || reduceMotion) return;
  document.documentElement.classList.add('has-cursor');
  let cx = -100, cy = -100, tx = -100, ty = -100;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  gsap.ticker.add(() => {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  });
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-grow');
      cursorLabel.textContent = el.getAttribute('data-cursor');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-grow');
      cursorLabel.textContent = '';
    });
  });
}

/* ---------------------------------------------------------------------
   4. Nav — scroll chrome + mobile toggle + light/dark section swap
--------------------------------------------------------------------- */
const nav = document.getElementById('site-nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const open = document.documentElement.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('no-scroll', open);
});
navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  document.documentElement.classList.remove('nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}));

function initNavChrome() {
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => nav.classList.toggle('scrolled', self.scroll() > 40),
  });
  document.querySelectorAll('#philosophy, #developments, #consult').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 90px', end: 'bottom 90px',
      onEnter: () => nav.classList.add('on-light'),
      onEnterBack: () => nav.classList.add('on-light'),
      onLeave: () => nav.classList.remove('on-light'),
      onLeaveBack: () => nav.classList.remove('on-light'),
    });
  });
}

/* ---------------------------------------------------------------------
   5. Hero — pinned, scroll-scrubbed, all-intra video + cloud-bank exit
--------------------------------------------------------------------- */
function playHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.hero-headline .reveal', { yPercent: 0, duration: 1.15, stagger: 0.14 })
    .add(() => document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 90);
    }), '-=0.7');
  gsap.to('#hero-compass', {
    rotate: 8, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
}

const CLOUDS = [
  { start: 0.42, end: 0.76 },
  { start: 0.48, end: 0.82 },
  { start: 0.54, end: 0.88 },
  { start: 0.60, end: 0.94 },
  { start: 0.66, end: 1.00 },
];

function heroUrlForWidth() {
  if (innerWidth < 700) return ['video/hero-480.mp4', null];
  if (innerWidth < 1400) return ['video/hero-720.mp4', 'video/hero-480.mp4'];
  return ['video/hero-1080.mp4', 'video/hero-720.mp4'];
}

function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const clouds = [...document.querySelectorAll('.cloud')];
  const cloudWash = document.getElementById('hero-cloud-wash');
  const heroInner = document.getElementById('hero-inner');
  const scrollCue = document.getElementById('hero-scroll-cue');
  const compass = document.getElementById('hero-compass');

  const rig = createScrubVideo(video);
  const [primaryUrl, fallbackUrl] = heroUrlForWidth();
  rig.load(primaryUrl, fallbackUrl);
  rig.onReady(() => { bootSignals.hero = true; });
  video.addEventListener('error', () => { bootSignals.hero = true; }, { once: true });
  addEventListener('pointerdown', rig.prime, { once: true, passive: true });
  addEventListener('touchstart', rig.prime, { once: true, passive: true });

  /* idle breath while parked at the very top: a slow scale about the frame
     centre only, never a pixel translation, so a near-static plate never reads
     as a shake (see the reference recipe this pipeline is built from) */
  let breathing = false;
  function breathTick(now) {
    if (!breathing) return;
    video.style.transform = `scale(${(1.03 + 0.012 * (1 + Math.sin(now / 3400))).toFixed(4)})`;
    requestAnimationFrame(breathTick);
  }
  function setBreath(on) {
    if (on && !breathing) { breathing = true; requestAnimationFrame(breathTick); }
    else if (!on && breathing) { breathing = false; video.style.transform = 'scale(1.03)'; }
  }

  let lastProgress = -1;
  function paint(p) {
    if (Math.abs(p - lastProgress) < 0.0015) return;
    lastProgress = p;

    rig.seekProgress(p);
    setBreath(!reduceMotion && p < 0.04);

    const contentOp = 1 - smoothstep(p, 0.02, 0.4);
    heroInner.style.opacity = String(contentOp);
    heroInner.style.transform = `translateY(${(-40 * (1 - contentOp)).toFixed(1)}px)`;

    const chromeOp = 1 - smoothstep(p, 0, 0.14);
    scrollCue.style.opacity = String(chromeOp);
    compass.style.opacity = String(chromeOp * 0.7);

    clouds.forEach((cloud, i) => {
      const { start, end } = CLOUDS[i];
      const k = smoothstep(p, start, end);
      cloud.style.opacity = String(k);
      cloud.style.transform = `translateY(${(10 - 10 * k).toFixed(2)}vh) scale(${(0.72 + 0.46 * k).toFixed(3)})`;
    });
    cloudWash.style.opacity = String(smoothstep(p, 0.56, 1));
  }

  paint(0);
  ScrollTrigger.create({
    trigger: '#hero-pin', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => paint(self.progress),
  });
}

/* ---------------------------------------------------------------------
   6. Philosophy — scrubbed word reveal
--------------------------------------------------------------------- */
function initPhilosophy() {
  const words = [...document.querySelectorAll('#philosophy-text .w')];
  const n = words.length;
  let lastProgress = -1;
  ScrollTrigger.create({
    trigger: '#philosophy', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate(self) {
      const p = self.progress;
      if (Math.abs(p - lastProgress) < 0.002) return;
      lastProgress = p;
      words.forEach((w, i) => {
        const threshold = i / n;
        const local = Math.min(1, Math.max(0, (p - threshold) * n * 1.5));
        w.style.opacity = String(0.16 + 0.84 * local);
      });
    },
  });
}

/* Fog-wipe reveal over the elevation drawing: the cursor clears a soft
   circular hole in the fog mask, off-screen (so fully opaque) whenever the
   pointer isn't over the stage — desktop/fine-pointer only, matching every
   other hover-driven nicety on the page. */
function initPhilosophyFog() {
  if (!isDesktop() || reduceMotion) return;
  const stage = document.getElementById('philosophy-stage');
  const fog = document.getElementById('philosophy-fog');
  let raf = null, tx = -9999, ty = -9999;
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      fog.style.setProperty('--fx', tx + 'px');
      fog.style.setProperty('--fy', ty + 'px');
      raf = null;
    });
  }, { passive: true });
  stage.addEventListener('pointerleave', () => {
    fog.style.setProperty('--fx', '-9999px');
    fog.style.setProperty('--fy', '-9999px');
  });
}

/* ---------------------------------------------------------------------
   7. Journey — pinned canvas scrubber, the six-stage turnkey process
--------------------------------------------------------------------- */
const STAGES = [
  { title: 'Land & Feasibility', copy: "Microclimate, topography and zoning clearances are surveyed along the riverfront site before a single line is drawn.", from: 0.00, to: 0.15 },
  { title: 'Blueprint & Flow', copy: 'Climate-responsive layouts, passive ventilation and courtyard studies translate the survey into a livable plan.', from: 0.15, to: 0.28 },
  { title: '3D BIM & Virtual Simulation', copy: 'Photorealistic lighting studies and material simulations resolve every junction before construction begins.', from: 0.28, to: 0.44 },
  { title: 'Material Curation', copy: 'Raw concrete, honed travertine, kiln-dried Ceylon teak and blackened steel are selected for climate endurance.', from: 0.44, to: 0.60 },
  { title: 'Precision Engineering', copy: 'Structural integrity, MEP synchronization and on-site quality assurance hold the build to its drawings.', from: 0.60, to: 0.83 },
  { title: 'Turnkey Handover', copy: 'Keys, landscape completion and lifelong structural care — we do not build and leave.', from: 0.83, to: 1.001 },
];

const JOURNEY_FRAMES = 240;

function initJourney() {
  const canvas = document.getElementById('journey-canvas');
  const ctx = canvas.getContext('2d');
  const video = document.getElementById('journey-video');
  const frameLabel = document.getElementById('journey-frame-label');
  const stageCount = document.getElementById('stage-count');
  const stageNum = document.getElementById('stage-num');
  const stageTitle = document.getElementById('stage-title');
  const stageCopy = document.getElementById('stage-copy');
  const dots = [...document.querySelectorAll('.stage-dot')];
  const progressFill = document.getElementById('journey-progress-fill');

  let dpr = Math.min(devicePixelRatio || 1, 2);
  let lastP = 0;

  function drawProceduralFallback(p) {
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#0D0E11';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(179,152,114,0.16)';
    ctx.lineWidth = 1;
    const step = 48 * dpr;
    for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const cx = w / 2, cy = h / 2;
    ctx.strokeStyle = '#B39872';
    ctx.lineWidth = 1.4 * dpr;
    const bw = w * 0.34, bh = h * 0.34 * p + h * 0.06;
    ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, cy - bh / 2); ctx.lineTo(cx - bw / 2 - bw * 0.22, cy - bh / 2 + bh * 0.28);
    ctx.moveTo(cx + bw / 2, cy - bh / 2); ctx.lineTo(cx + bw / 2 - bw * 0.22, cy - bh / 2 + bh * 0.28);
    ctx.stroke();
    ctx.fillStyle = 'rgba(247,245,240,0.5)';
    ctx.font = `${20 * dpr}px Plus Jakarta Sans`;
    ctx.fillText(`STAGE ${String(Math.round(p * JOURNEY_FRAMES)).padStart(3, '0')}`, cx - bw / 2, cy + bh / 2 + 32 * dpr);
  }

  /* Drawn straight from the live <video> frame — native source resolution,
     no pre-downscaled JPEGs — onto the canvas every time a seek settles. */
  function drawCurrent() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    if (video.style.display === 'none' || !video.videoWidth) { drawProceduralFallback(lastP); return; }
    const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
    const dw = video.videoWidth * scale, dh = video.videoHeight * scale;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
    frameLabel.textContent = `FRAME ${String(Math.round(lastP * (JOURNEY_FRAMES - 1)) + 1).padStart(3, '0')} / ${JOURNEY_FRAMES}`;
  }

  function resizeCanvas() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    drawCurrent();
  }

  let lastStageIndex = -1;
  function updateHud(p) {
    const stageIndex = STAGES.findIndex((s) => p >= s.from && p < s.to);
    const s = STAGES[Math.max(0, stageIndex)];
    if (stageIndex !== lastStageIndex && stageIndex !== -1) {
      lastStageIndex = stageIndex;
      stageNum.textContent = String(stageIndex + 1).padStart(2, '0');
      stageTitle.textContent = s.title;
      stageCopy.textContent = s.copy;
      stageCount.textContent = `${String(stageIndex + 1).padStart(2, '0')} / 06`;
      dots.forEach((d, i) => d.classList.toggle('active', i === stageIndex));
    }
    progressFill.style.width = `${Math.round(p * 100)}%`;
  }

  const rig = createScrubVideo(video, { onFrame: drawCurrent });
  const [primaryUrl, fallbackUrl] = innerWidth < 900
    ? ['video/journey-720.mp4', null]
    : ['video/journey-1080.mp4', 'video/journey-720.mp4'];
  rig.load(primaryUrl, fallbackUrl);
  rig.onReady(() => { bootSignals.journey = true; resizeCanvas(); });
  video.addEventListener('error', () => { bootSignals.journey = true; drawProceduralFallback(0); }, { once: true });
  addEventListener('pointerdown', rig.prime, { once: true, passive: true });
  addEventListener('touchstart', rig.prime, { once: true, passive: true });

  resizeCanvas();
  drawProceduralFallback(0);
  updateHud(0);

  addEventListener('resize', () => { clearTimeout(window.__jResize); window.__jResize = setTimeout(resizeCanvas, 150); });

  ScrollTrigger.create({
    trigger: '#journey-pin', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate(self) {
      lastP = self.progress;
      rig.seekProgress(lastP);
      updateHud(lastP);
    },
  });
}

/* ---------------------------------------------------------------------
   8. Developments — parallax drift + 3D tilt
--------------------------------------------------------------------- */
function initDevelopments() {
  if (!reduceMotion) {
    gsap.fromTo('#dev-track', { x: 40 }, {
      x: -40, ease: 'none',
      scrollTrigger: { trigger: '#developments', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  }
  if (!isDesktop() || reduceMotion) return;
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const inner = card.querySelector('.dev-card-inner');
    let raf = null, mx = 0, my = 0;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        inner.style.transform = `perspective(1000px) rotateY(${mx * 6}deg) rotateX(${-my * 6}deg) scale(1.02)`;
        raf = null;
      });
    });
    card.addEventListener('mouseleave', () => { inner.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------------
   9. Materials — tab / swatch toggle
--------------------------------------------------------------------- */
function initMaterials() {
  const tabs = [...document.querySelectorAll('#mat-tabs .tab')];
  const panels = [...document.querySelectorAll('[data-mat-panel]')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.mat;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      panels.forEach((p) => p.classList.toggle('active', p.dataset.matPanel === key));
    });
  });
}

/* ---------------------------------------------------------------------
   10. Consultation form
--------------------------------------------------------------------- */
function initConsultForm() {
  const form = document.getElementById('consult-form');
  const success = document.getElementById('consult-success');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const name = form.querySelector('#f-name').value.trim();
    document.getElementById('consult-success-copy').textContent =
      `Thank you, ${name.split(' ')[0]}. Our studio will be in touch within one business day to schedule your Design Clarity Call.`;
    form.style.display = 'none';
    success.classList.add('show');
  });
}

/* ---------------------------------------------------------------------
   11a. Layered parallax + soft 3D tilt (philosophy, developments,
   materials, consult) — each [data-parallax] layer drifts against scroll
   at its own speed so sections read as depth, not a single flat plane.
--------------------------------------------------------------------- */
function initParallaxLayers() {
  if (reduceMotion) return;
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.2;
    const section = el.closest('.section') || el.parentElement;
    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  });
}

function initSoftTilt() {
  if (!isDesktop() || reduceMotion) return;
  document.querySelectorAll('[data-tilt-soft]').forEach((el) => {
    let raf = null;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1400px) rotateY(${(mx * 3).toFixed(2)}deg) rotateX(${(-my * 3).toFixed(2)}deg)`;
        raf = null;
      });
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------------
   11. Generic reveal-on-scroll + blueprint draw-in
--------------------------------------------------------------------- */
function initReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal-up, .consult-grid').forEach((el) => io.observe(el));

  const lines = document.querySelectorAll('.draw-line');
  const lio = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        lio.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  lines.forEach((l) => lio.observe(l));
}

/* ---------------------------------------------------------------------
   12. Ambient day / night toggle
--------------------------------------------------------------------- */
function initAmbient() {
  const btn = document.getElementById('ambient-toggle');
  btn.addEventListener('click', () => {
    const on = document.body.classList.toggle('night');
    btn.setAttribute('aria-pressed', String(on));
    ScrollTrigger.refresh();
  });
}

/* ---------------------------------------------------------------------
   Boot
--------------------------------------------------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();

initNavChrome();
initCursor();
initHeroVideo();
initPhilosophy();
initPhilosophyFog();
initJourney();
initDevelopments();
initMaterials();
initParallaxLayers();
initSoftTilt();
initConsultForm();
initReveals();
initAmbient();

runLoader().then(() => {
  loaderEl.setAttribute('data-done', 'true');
  loaderEl.setAttribute('aria-hidden', 'true');
  playHeroEntrance();
  ScrollTrigger.refresh();
});

addEventListener('error', () => {}, true);
