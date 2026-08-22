(() => {
  'use strict';

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  document.body.classList.toggle('reduced', reduceMQ.matches);

  /* =========================================================
     Lenis-style smooth scroll (conservative, self-contained)
     - wheel only; touch + keyboard stay native
     - disabled under reduced motion
     - drives real window scroll so sticky/getBoundingClientRect stay correct
     ========================================================= */
  const smooth = (() => {
    let targetY = window.scrollY;
    let raf = null;
    let enabled = !reduceMQ.matches && !matchMedia('(pointer: coarse)').matches;

    function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
    function step() {
      const cur = window.scrollY;
      const next = lerp(cur, targetY, 0.14);
      if (Math.abs(targetY - next) < 0.4) { window.scrollTo(0, targetY); raf = null; return; }
      window.scrollTo(0, next);
      raf = requestAnimationFrame(step);
    }
    function onWheel(e) {
      if (!enabled || e.ctrlKey) return;               // ctrl+wheel is zoom, leave it
      e.preventDefault();
      targetY = clamp(targetY + e.deltaY, 0, maxScroll());
      if (raf === null) raf = requestAnimationFrame(step);
    }
    // keep target synced when the user scrolls by other means (keyboard, bar, touch)
    function resync() { if (raf === null) targetY = window.scrollY; }

    addEventListener('wheel', onWheel, { passive: false });
    addEventListener('keydown', resync);
    addEventListener('touchstart', resync, { passive: true });
    addEventListener('resize', () => { targetY = clamp(targetY, 0, maxScroll()); });

    return {
      scrollTo(y) { targetY = clamp(y, 0, maxScroll()); if (enabled) { if (raf === null) raf = requestAnimationFrame(step); } else window.scrollTo({ top: y, behavior: 'smooth' }); },
      setEnabled(v) { enabled = v; resync(); }
    };
  })();

  // smooth anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 8;
      smooth.scrollTo(y);
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) navLinks.classList.remove('open');
    });
  });

  /* =========================================================
     THE APERTURE / LENS HERO
     ========================================================= */
  const lensPin = document.querySelector('.lens-pin');
  const lensWrap = document.querySelector('.lens-wrap');
  const lensScale = document.querySelector('.lens-scale');
  const lensReadouts = document.querySelector('.lens-readouts');
  const lensHint = document.querySelector('.lens-hint');
  const irisPath = document.getElementById('iris-path');
  const seamGroup = document.getElementById('iris-seams');
  const glassPhoto = document.getElementById('glass-photo');
  const irisGlow = document.getElementById('iris-glow');
  const rf = document.querySelector('.lens-readout.rf');
  const riso = document.querySelector('.lens-readout.riso');
  const rsh = document.querySelector('.lens-readout.rshutter');

  const N = 7;                 // aperture blades
  const CX = 250, CY = 250;    // svg viewBox center
  const R = 250;               // outer lens radius (viewBox units)
  const R_MIN = 26;            // closed opening radius
  const R_MAX = 236;           // fully-open opening radius

  // f-stop labels from closed -> open
  const FSTOPS = ['f / 16', 'f / 11', 'f / 8', 'f / 5.6', 'f / 4', 'f / 2.8', 'f / 2', 'f / 1.4'];
  const SHUTTERS = ['1/60 s', '1/125 s', '1/250 s', '1/500 s', '1/1000 s'];

  function irisPathD(r, rot) {
    // outer full circle
    let d = `M ${CX - R},${CY} a ${R},${R} 0 1,0 ${2 * R},0 a ${R},${R} 0 1,0 ${-2 * R},0 Z `;
    // inner N-gon with edges bowing inward (blade curvature), traced as a hole (evenodd)
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = rot + (i * 2 * Math.PI) / N;
      pts.push([CX + r * Math.cos(a), CY + r * Math.sin(a)]);
    }
    d += `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} `;
    for (let i = 0; i < N; i++) {
      const cur = pts[i], nxt = pts[(i + 1) % N];
      const mid = rot + ((i + 0.5) * 2 * Math.PI) / N;
      const cr = r * 0.82; // control radius inside -> concave edge
      const ctrl = [CX + cr * Math.cos(mid), CY + cr * Math.sin(mid)];
      d += `Q ${ctrl[0].toFixed(1)},${ctrl[1].toFixed(1)} ${nxt[0].toFixed(1)},${nxt[1].toFixed(1)} `;
    }
    d += 'Z';
    return d;
  }

  function buildSeams(r, rot) {
    let s = '';
    for (let i = 0; i < N; i++) {
      const a = rot + (i * 2 * Math.PI) / N;
      const x1 = CX + r * Math.cos(a), y1 = CY + r * Math.sin(a);
      const x2 = CX + R * Math.cos(a), y2 = CY + R * Math.sin(a);
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(0,0,0,.55)" stroke-width="2"/>`;
    }
    return s;
  }

  let lastIris = -1, lastF = '', lastSh = '', lastHint = null;

  function paintLens(p) {
    // p: 0 closed -> 1 fully open + zoomed
    // Phase 1 (0 -> 0.62): aperture opens
    const openP = smoothstep(p, 0, 0.62);
    const r = lerp(R_MIN, R_MAX, openP);
    const rot = lerp(-0.18, 0.28, openP); // slight iris rotation while opening

    if (Math.abs(r - lastIris) > 0.4 || lastIris < 0) {
      lastIris = r;
      irisPath.setAttribute('d', irisPathD(r, rot));
      seamGroup.innerHTML = buildSeams(r, rot);
      if (irisGlow) irisGlow.setAttribute('r', (r * 0.92).toFixed(1));
    }

    // readouts
    const fIdx = Math.min(FSTOPS.length - 1, Math.round(openP * (FSTOPS.length - 1)));
    if (FSTOPS[fIdx] !== lastF) { lastF = FSTOPS[fIdx]; if (rf) rf.textContent = FSTOPS[fIdx]; }
    const shIdx = Math.min(SHUTTERS.length - 1, Math.round(openP * (SHUTTERS.length - 1)));
    if (SHUTTERS[shIdx] !== lastSh) { lastSh = SHUTTERS[shIdx]; if (rsh) rsh.textContent = SHUTTERS[shIdx]; }
    if (riso) riso.style.opacity = (0.5 + 0.5 * openP).toFixed(2);

    // Phase 2 (0.62 -> 1): zoom the lens toward the viewer and fade the barrel
    const zoomP = smoothstep(p, 0.62, 1);
    const scale = lerp(1, 3.4, zoomP);
    const fade = 1 - smoothstep(p, 0.86, 1);
    lensScale.style.transform = `scale(${scale.toFixed(3)})`;
    lensScale.style.opacity = fade.toFixed(3);

    // readouts belong to the opening phase; fade them before the zoom balloons them
    if (lensReadouts) lensReadouts.style.opacity = (1 - smoothstep(p, 0.55, 0.72)).toFixed(2);

    // photo brightens as the aperture lets light in
    if (glassPhoto) glassPhoto.style.opacity = (0.15 + 0.85 * openP).toFixed(2);

    const showHint = p < 0.05;
    if (showHint !== lastHint) { lensHint && lensHint.classList.toggle('show', showHint); lastHint = showHint; }
  }

  // scroll drive for the lens (rAF lerp so it stays buttery)
  let target = 0, shown = -1, rafId = null, lastTick = 0, onScreen = false;
  function heroProgress() {
    if (!lensPin) return 0;
    const total = lensPin.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-lensPin.getBoundingClientRect().top / total, 0, 1);
  }
  function arm() { if (rafId === null && onScreen && !document.body.classList.contains('reduced')) rafId = requestAnimationFrame(tick); }
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    shown += (target - shown) * (1 - Math.pow(1 - 0.18, dt / 16.667));
    if (Math.abs(target - shown) < 0.0004) { shown = target; rafId = null; lastTick = 0; }
    else rafId = requestAnimationFrame(tick);
    paintLens(shown);
  }
  function onScroll() { target = heroProgress(); arm(); }

  if (lensPin) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { onScreen = e.isIntersecting; if (onScreen) arm(); }), { threshold: 0 });
    io.observe(lensPin);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    // paint the closed state immediately so the hero is never blank
    paintLens(0);
    onScroll();
  }

  function pinLensOpen() {
    // reduced-motion / static: show a pleasant half-open composed frame
    paintLens(0.5);
    lensScale.style.transform = 'scale(1)';
    lensScale.style.opacity = '1';
  }

  /* reduced motion, live both directions */
  function applyReduced(isR) {
    document.body.classList.toggle('reduced', isR);
    smooth.setEnabled(!isR && !matchMedia('(pointer: coarse)').matches);
    if (isR) { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } pinLensOpen(); }
    else { lastTick = 0; target = heroProgress(); shown = target; arm(); }
  }
  reduceMQ.addEventListener('change', (e) => applyReduced(e.matches));
  if (reduceMQ.matches) pinLensOpen();

  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

  /* =========================================================
     entrances, nav, faq, mixer, form (shared)
     ========================================================= */
  const entrances = document.querySelectorAll('[data-io], .service-card, .step, .promise-card, .process-line, .tile');
  if (entrances.length) {
    const eio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); eio.unobserve(e.target); } }), { threshold: 0.18 });
    entrances.forEach((el) => eio.observe(el));
  }
  document.querySelectorAll('.services-grid, .promise-grid, .steps, .gallery').forEach((g) => {
    [...g.children].forEach((c, i) => { c.style.transitionDelay = Math.min(i * 70, 420) + 'ms'; });
  });

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      document.querySelectorAll('.faq-item[data-open="true"]').forEach((o) => {
        if (o !== item) { o.setAttribute('data-open', 'false'); o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); o.querySelector('.faq-a').style.maxHeight = '0px'; }
      });
      item.setAttribute('data-open', String(!isOpen));
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = isOpen ? '0px' : a.scrollHeight + 'px';
    });
  });

  const chips = document.querySelectorAll('.chip');
  const pourBtn = document.querySelector('.pour-btn');
  const fillCircle = document.querySelector('.pour-btn .fill');
  const resultEl = document.querySelector('.mixer-result');
  const CIRC = 307;
  if (pourBtn && fillCircle) {
    let prog = 0, holdRaf = null, holding = false;
    const picked = () => [...chips].filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.textContent.trim());
    function render(done) {
      if (!done) { resultEl.textContent = ''; return; }
      const p = picked();
      resultEl.textContent = p.length ? 'Your plan: ' + p.join(' + ') + ', poured into one campaign.' : 'Pick at least one channel first.';
    }
    const setFill = (p) => fillCircle.style.strokeDashoffset = String(CIRC * (1 - p));
    function stepHold() {
      prog = clamp(prog + (holding ? 0.018 : -0.03), 0, 1);
      setFill(prog);
      if (prog >= 1) { render(true); holdRaf = null; return; }
      if (prog <= 0 && !holding) { render(false); holdRaf = null; return; }
      holdRaf = requestAnimationFrame(stepHold);
    }
    function start(e) {
      e.preventDefault();
      if (document.body.classList.contains('reduced')) { prog = 1; setFill(1); render(true); return; }
      holding = true; if (holdRaf === null) holdRaf = requestAnimationFrame(stepHold);
    }
    function end() { holding = false; if (holdRaf === null) holdRaf = requestAnimationFrame(stepHold); }
    pourBtn.addEventListener('pointerdown', start);
    pourBtn.addEventListener('pointerup', end);
    pourBtn.addEventListener('pointerleave', end);
    pourBtn.addEventListener('pointercancel', end);
    pourBtn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') start(e); });
    pourBtn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') end(); });
    chips.forEach((c) => c.addEventListener('click', () => c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'))));
  }

  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const g = (n) => form.elements[n].value.trim();
    const subject = encodeURIComponent('New project inquiry from ' + (g('name') || 'your site'));
    const body = encodeURIComponent('Name: ' + g('name') + '\nEmail: ' + g('email') + '\nWebsite: ' + g('website') + '\n\n' + g('message'));
    window.location.href = 'mailto:info@rapidsolutions.live?subject=' + subject + '&body=' + body;
    const s = document.querySelector('.form-success'); if (s) s.classList.add('show');
  });
})();
