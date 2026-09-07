/* =====================================================================
   EXCELLO — front-end engine
   One scroll rail (Lenis) drives everything: parallax layers, the film
   chapter captions, and the reveals. Per frame we only ever write
   transform / opacity. Heavy motion is gated to desktop + motion-on.
   Built on the cinematic-scroll skill's performance commandments.
   ===================================================================== */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = matchMedia('(min-width: 861px)').matches;
  var motion  = desktop && !reduced;

  /* ---------- Lenis smooth scroll (single ticker) ---------- */
  var lenis = null;
  var scrollY = window.scrollY || 0;

  if (!reduced && window.Lenis) {
    lenis = new Lenis({
      lerp: 0.11,           // interpolate toward target every frame
      wheelMultiplier: 1,
      smoothWheel: true,
      touchMultiplier: 1.4
    });
    lenis.on('scroll', function (e) { scrollY = e.scroll; });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  } else {
    addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });
  }

  /* ---------- nav: solid background after a little scroll ---------- */
  var nav = document.getElementById('nav');
  var burger = document.querySelector('.nav-burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-pill a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- collect animated targets ---------- */
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var chapters    = [].slice.call(document.querySelectorAll('.chapter'));

  // smoothstep for eased windows
  function smooth(a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  var vh = innerHeight;
  addEventListener('resize', function () { vh = innerHeight; }, { passive: true });

  var lastPaint = -1;

  function paint() {
    var y = scrollY;

    // idle: nothing moved, write nothing (commandment 2)
    if (Math.abs(y - lastPaint) < 0.4) { requestAnimationFrame(paint); return; }
    lastPaint = y;

    // ---- parallax layers (transform only) ----
    if (motion) {
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var r = el.getBoundingClientRect();
        var mid = r.top + r.height / 2 - vh / 2;   // distance from viewport centre
        var shift = -mid * speed;
        el.style.transform = 'translate3d(0,' + shift.toFixed(2) + 'px,0)';
      }
    }

    // ---- film chapters: drift the image, fade the caption through the middle ----
    for (var c = 0; c < chapters.length; c++) {
      var ch = chapters[c];
      var cr = ch.getBoundingClientRect();
      var prog = Math.max(0, Math.min(1, -cr.top / (cr.height - vh)));  // 0..1 across the track
      var media = ch.querySelector('.chapter-media img, .chapter-media video');
      var copy  = ch.querySelector('.chapter-copy');

      if (motion && media) {
        // slow scale + gentle vertical drift = film-like scrub with a still
        var scale = 1.06 + prog * 0.10;
        var drift = (prog - 0.5) * 60;
        media.style.transform = 'translate3d(0,' + drift.toFixed(2) + 'px,0) scale(' + scale.toFixed(3) + ')';
      }
      if (copy) {
        // caption rises and fades in over the first third, holds, fades out at the end
        var appear = smooth(0.04, 0.34, prog);
        var vanish = 1 - smooth(0.72, 0.98, prog);
        var op = appear * vanish;
        var ty = (1 - appear) * 40 - smooth(0.72, 1, prog) * 30;
        copy.style.opacity = op.toFixed(3);
        copy.style.transform = 'translate3d(0,' + ty.toFixed(2) + 'px,0)';
      }
    }

    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);

  // nav scrolled state via its own light listener (class toggle only on change)
  var navSolid = false;
  function navWatch() {
    var want = scrollY > 40;
    if (want !== navSolid && nav) { nav.classList.toggle('scrolled', want); navSolid = want; }
    requestAnimationFrame(navWatch);
  }
  requestAnimationFrame(navWatch);

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- project filters ---------- */
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    var tiles = [].slice.call(document.querySelectorAll('.project'));
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      filterBar.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      var want = btn.getAttribute('data-filter');
      tiles.forEach(function (t) {
        var show = want === 'all' || t.getAttribute('data-type') === want;
        t.classList.toggle('is-hidden', !show);
      });
    });
  }

  /* ---------- construction cost calculator ---------- */
  var calc = document.getElementById('calc');
  if (calc) {
    var rates = JSON.parse(calc.getAttribute('data-rates') || '{}');
    var area  = calc.querySelector('#calc-area');
    var areaOut = calc.querySelector('#calc-area-out');
    var tier  = calc.querySelector('#calc-tier');
    var floors = calc.querySelector('#calc-floors');
    var out   = calc.querySelector('#calc-figure');
    var fmt = new Intl.NumberFormat('en-LK');

    function run() {
      var a = parseFloat(area.value) || 0;
      var f = parseFloat(floors.value) || 1;
      var rate = (rates[tier.value] && rates[tier.value].rate) || 0;
      var total = a * f * rate;
      // a +/- 12% indicative band
      var lo = Math.round(total * 0.88 / 100000) / 10;
      var hi = Math.round(total * 1.12 / 100000) / 10;
      if (areaOut) areaOut.textContent = fmt.format(a) + ' sq ft';
      out.textContent = a ? ('LKR ' + lo + 'M – ' + hi + 'M') : 'LKR —';
    }
    [area, tier, floors].forEach(function (el) { el && el.addEventListener('input', run); });
    run();
  }

  /* ---------- anchor links go through Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -80 });
      else t.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
