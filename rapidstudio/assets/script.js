(() => {
  'use strict';

  /* ---------- utils ---------- */
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (p, e0, e1) => {
    const t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  function rng(seed) {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  document.body.classList.toggle('reduced', reduceMQ.matches);

  /* ---------- text splitting for hero headlines ---------- */
  function splitBand(el, mode, seed) {
    const full = el.textContent.trim();
    el.setAttribute('aria-hidden', 'false');
    const words = full.split(/\s+/);
    const visible = document.createElement('span');
    visible.setAttribute('aria-hidden', 'true');
    const r = rng(seed);
    let ci = 0;
    const totalChars = words.join('').length || 1;
    words.forEach((word, wi) => {
      const wSpan = document.createElement('span');
      wSpan.className = 'w';
      if (mode === 'punch') {
        const th = (wi / words.length) * 0.5 + r() * 0.08;
        wSpan.style.setProperty('--th', th.toFixed(3));
      }
      [...word].forEach((ch) => {
        const cSpan = document.createElement('span');
        cSpan.className = 'c';
        cSpan.textContent = ch;
        if (mode === 'rise') {
          const th = (ci / totalChars) * 0.6 + r() * 0.12;
          cSpan.style.setProperty('--th', th.toFixed(3));
          cSpan.style.setProperty('--jy', '14px');
        } else if (mode === 'scatter') {
          const th = r() * 0.55;
          cSpan.style.setProperty('--th', th.toFixed(3));
          cSpan.style.setProperty('--jx', ((r() * 2 - 1) * 20).toFixed(1) + 'px');
          cSpan.style.setProperty('--jy', ((r() * 2 - 1) * 20).toFixed(1) + 'px');
          cSpan.style.setProperty('--jr', ((r() * 2 - 1) * 14).toFixed(1) + 'deg');
        } else {
          cSpan.style.setProperty('--jy', '0px');
        }
        ci++;
        wSpan.appendChild(cSpan);
      });
      visible.appendChild(wSpan);
      visible.appendChild(document.createTextNode(' '));
    });
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = full;
    el.innerHTML = '';
    el.appendChild(sr);
    el.appendChild(visible);
  }

  document.querySelectorAll('.band [data-split]').forEach((el, i) => {
    splitBand(el, el.dataset.split, 1000 + i * 77);
  });

  /* ---------- hero scroll-scrub driver ---------- */
  const heroPin = document.querySelector('.hero-pin');
  const stage = document.querySelector('.stage');
  const scrollCue = document.querySelector('.scroll-cue');

  const BANDS = [
    { id: 'band1', a: 0.0, b: 0.16, first: true },
    { id: 'band2', a: 0.2, b: 0.4 },
    { id: 'band3', a: 0.46, b: 0.66 },
    { id: 'band4', a: 0.74, b: 0.97, last: true },
  ].map((b) => ({ ...b, el: document.getElementById(b.id) }));

  const BLOBS = [
    { el: document.getElementById('blob1'), x0: 46, x1: 60, delay: 0.0, r: 15 },
    { el: document.getElementById('blob2'), x0: 62, x1: 52, delay: 0.06, r: 12 },
    { el: document.getElementById('blob3'), x0: 40, x1: 56, delay: 0.12, r: 13 },
    { el: document.getElementById('blob4'), x0: 68, x1: 50, delay: 0.18, r: 11 },
  ].filter((b) => b.el);
  const poolEl = document.getElementById('pool');
  const pourSvg = document.querySelector('.pour-svg');

  const POUR_FALL_END = 0.55;
  const POOL_FADE_START = 0.48;
  const POOL_FADE_END = 0.68;

  let target = 0;
  let shown = -1;
  let rafId = null;
  let lastTick = 0;
  let heroOnScreen = false;
  let lastSettled = null;
  let lastCue = null;
  const lastBandVals = {};

  function heroProgress() {
    if (!heroPin) return 0;
    const rect = heroPin.getBoundingClientRect();
    const total = heroPin.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }

  function armLoop() {
    if (rafId === null && heroOnScreen && !document.body.classList.contains('reduced')) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function onScroll() {
    target = heroProgress();
    armLoop();
  }

  const loadStart = performance.now();

  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const k = 0.16;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    if (Math.abs(target - shown) < 0.0005) {
      shown = target;
      rafId = null;
      lastTick = 0;
    } else {
      rafId = requestAnimationFrame(tick);
    }
    update(shown, now);
  }

  function update(p, now) {
    const showCue = p < 0.04;
    if (showCue !== lastCue) {
      scrollCue && scrollCue.classList.toggle('show', showCue);
      lastCue = showCue;
    }

    BANDS.forEach((b) => {
      if (!b.el) return;
      const ramp = Math.min(0.025, (b.b - b.a) * 0.35);
      let k = clamp((p - b.a) / ramp, 0, 1);
      if (b.first) {
        const loadK = clamp((now - loadStart) / 900, 0, 1);
        k = Math.max(k, loadK);
      }
      const f = Math.min(0.02, (b.b - b.a) / 3);
      let op;
      if (b.first) op = 1 - smoothstep(p, b.b - f, b.b);
      else if (b.last) op = smoothstep(p, b.a, b.a + f);
      else op = smoothstep(p, b.a, b.a + f) * (1 - smoothstep(p, b.b - f, b.b));

      const kKey = b.id + 'k';
      const opKey = b.id + 'op';
      if (lastBandVals[kKey] !== k) {
        b.el.style.setProperty('--k', k.toFixed(4));
        lastBandVals[kKey] = k;
      }
      if (lastBandVals[opKey] !== op) {
        b.el.style.opacity = op.toFixed(3);
        lastBandVals[opKey] = op;
      }
    });

    updatePour(p);
  }

  function updatePour(p) {
    BLOBS.forEach((b) => {
      const span = Math.max(0.01, POUR_FALL_END - b.delay);
      const localP = clamp((p - b.delay) / span, 0, 1);
      const eased = localP * localP * (3 - 2 * localP);
      const cy = lerp(-10, 78, eased);
      const wob = Math.sin(p * 18 + b.delay * 12) * 4 * (1 - eased * 0.7);
      const cx = lerp(b.x0, b.x1, eased) + wob;
      const op = p < 0.015 ? 0 : 1 - smoothstep(p, POOL_FADE_START, POOL_FADE_END);
      b.el.setAttribute('cy', cy.toFixed(1));
      b.el.setAttribute('cx', cx.toFixed(1));
      b.el.style.opacity = Math.max(0, op).toFixed(2);
    });
    if (poolEl) {
      const poolOp = smoothstep(p, POOL_FADE_START, POOL_FADE_END);
      poolEl.style.opacity = poolOp.toFixed(2);
    }
    const settled = p > 0.82;
    if (settled !== lastSettled) {
      stage && stage.classList.toggle('pool-settled', settled);
      lastSettled = settled;
    }
  }

  function pinPourToEnd() {
    BLOBS.forEach((b) => {
      b.el.setAttribute('cy', '78');
      b.el.setAttribute('cx', String(b.x1));
      b.el.style.opacity = '0';
    });
    if (poolEl) poolEl.style.opacity = '1';
    stage && stage.classList.add('pool-settled');
  }

  if (heroPin) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          heroOnScreen = e.isIntersecting;
          if (heroOnScreen) armLoop();
        });
      },
      { threshold: 0 }
    );
    io.observe(heroPin);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- reduced motion, live, both directions ---------- */
  function applyReducedState(isReduced) {
    document.body.classList.toggle('reduced', isReduced);
    if (isReduced) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (pourSvg) pinPourToEnd();
    } else {
      lastTick = 0;
      target = heroProgress();
      shown = target;
      armLoop();
    }
  }
  reduceMQ.addEventListener('change', (e) => applyReducedState(e.matches));
  if (reduceMQ.matches && pourSvg) pinPourToEnd();

  /* ---------- pause offscreen loops on hidden tab ---------- */
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('paused', document.hidden);
  });

  /* ---------- generic scroll-entrance for below-fold content ---------- */
  const entranceTargets = document.querySelectorAll(
    '[data-io], .service-card, .step, .promise-card, .process-line'
  );
  if (entranceTargets.length) {
    const eio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            eio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    entranceTargets.forEach((el) => eio.observe(el));
  }

  /* ---------- staggered children (services / promises / steps) ---------- */
  document.querySelectorAll('.services-grid, .promise-grid, .steps').forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.style.transitionDelay = Math.min(i * 80, 480) + 'ms';
    });
  });

  /* ---------- nav mobile toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      document.querySelectorAll('.faq-item[data-open="true"]').forEach((other) => {
        if (other !== item) {
          other.setAttribute('data-open', 'false');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-a').style.maxHeight = '0px';
        }
      });
      item.setAttribute('data-open', String(!isOpen));
      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = isOpen ? '0px' : a.scrollHeight + 'px';
    });
  });

  /* ---------- the interactive moment: build your plan ---------- */
  const chips = document.querySelectorAll('.chip');
  const pourBtn = document.querySelector('.pour-btn');
  const fillCircle = document.querySelector('.pour-btn .fill');
  const resultEl = document.querySelector('.mixer-result');
  const CIRC = 307;

  if (pourBtn && fillCircle) {
    let holdProgress = 0;
    let holdRaf = null;
    let holding = false;

    function selectedLabels() {
      return [...chips]
        .filter((c) => c.getAttribute('aria-pressed') === 'true')
        .map((c) => c.textContent.trim());
    }

    function renderResult(done) {
      if (!done) {
        resultEl.textContent = '';
        return;
      }
      const picked = selectedLabels();
      if (!picked.length) {
        resultEl.textContent = 'Pick at least one channel first.';
        return;
      }
      resultEl.textContent = 'Your plan: ' + picked.join(' + ') + ', poured into one campaign.';
    }

    function setFill(p) {
      fillCircle.style.strokeDashoffset = String(CIRC * (1 - p));
    }

    function stepHold() {
      holdProgress = clamp(holdProgress + (holding ? 0.018 : -0.03), 0, 1);
      setFill(holdProgress);
      if (holdProgress >= 1) {
        renderResult(true);
        holdRaf = null;
        return;
      }
      if (holdProgress <= 0 && !holding) {
        renderResult(false);
        holdRaf = null;
        return;
      }
      holdRaf = requestAnimationFrame(stepHold);
    }

    function startHold(e) {
      e.preventDefault();
      if (document.body.classList.contains('reduced')) {
        holdProgress = 1;
        setFill(1);
        renderResult(true);
        return;
      }
      holding = true;
      if (holdRaf === null) holdRaf = requestAnimationFrame(stepHold);
    }
    function endHold() {
      holding = false;
      if (holdRaf === null) holdRaf = requestAnimationFrame(stepHold);
    }

    pourBtn.addEventListener('pointerdown', startHold);
    pourBtn.addEventListener('pointerup', endHold);
    pourBtn.addEventListener('pointerleave', endHold);
    pourBtn.addEventListener('pointercancel', endHold);
    pourBtn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') startHold(e);
    });
    pourBtn.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') endHold();
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const pressed = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', String(!pressed));
      });
    });
  }

  /* ---------- contact form: mailto handoff ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const site = form.elements['website'].value.trim();
      const message = form.elements['message'].value.trim();
      const subject = encodeURIComponent('New project inquiry from ' + (name || 'your site'));
      const body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nWebsite: ' + site + '\n\n' + message
      );
      window.location.href = 'mailto:info@rapidsolutions.live?subject=' + subject + '&body=' + body;
      const success = document.querySelector('.form-success');
      if (success) success.classList.add('show');
    });
  }
})();
