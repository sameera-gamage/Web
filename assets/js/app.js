/* =====================================================================
   EXCELLO — front-end engine
   One scroll rail (Lenis) drives parallax, the film chapter captions,
   a scroll-progress bar, and the reveals. Per frame we only ever write
   transform / opacity. Heavy motion is gated to desktop + motion-on.
   ===================================================================== */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = matchMedia('(min-width: 861px)').matches;
  var motion  = desktop && !reduced;

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  var scrollY = window.scrollY || 0;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, touchMultiplier: 1.4 });
    lenis.on('scroll', function (e) { scrollY = e.scroll; });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
  } else {
    addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });
  }

  /* ---------- nav + mobile menu ---------- */
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

  /* ---------- targets ---------- */
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var chapters    = [].slice.call(document.querySelectorAll('.chapter'));
  var progress    = document.getElementById('progress');

  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  var vh = innerHeight, docH = 1;
  function measure() { vh = innerHeight; docH = Math.max(1, document.documentElement.scrollHeight - vh); }
  measure();
  addEventListener('resize', measure, { passive: true });

  var lastPaint = -1, navSolid = false;

  function paint() {
    var y = scrollY;

    if (progress) progress.style.width = (Math.max(0, Math.min(1, y / docH)) * 100).toFixed(2) + '%';

    var want = y > 40;
    if (want !== navSolid && nav) { nav.classList.toggle('scrolled', want); navSolid = want; }

    if (Math.abs(y - lastPaint) < 0.4) { requestAnimationFrame(paint); return; }
    lastPaint = y;

    // parallax layers
    if (motion) {
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var r = el.getBoundingClientRect();
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * speed).toFixed(2) + 'px,0)';
      }
    }

    // film chapters
    for (var c = 0; c < chapters.length; c++) {
      var ch = chapters[c];
      var cr = ch.getBoundingClientRect();
      var prog = Math.max(0, Math.min(1, -cr.top / (cr.height - vh)));
      var media = ch.querySelector('.chapter-media img, .chapter-media video');
      var copy  = ch.querySelector('.chapter-copy');
      var hero  = ch.classList.contains('is-hero');

      if (motion && media) {
        var scale = 1.08 + prog * 0.16;
        var drift = (prog - 0.5) * 150;            // clearly visible vertical parallax
        media.style.transform = 'translate3d(0,' + drift.toFixed(2) + 'px,0) scale(' + scale.toFixed(3) + ')';
      }
      if (copy && !reduced) {
        var op, ty;
        if (hero) {
          op = 1 - smooth(0.72, 1, prog);          // steady, then fades out at the end
          ty = -smooth(0, 1, prog) * 60;
        } else {
          var appear = smooth(0.06, 0.4, prog);
          var vanish = 1 - smooth(0.74, 0.98, prog);
          op = appear * vanish;
          ty = (1 - appear) * 52 - smooth(0.74, 1, prog) * 34;
        }
        copy.style.opacity = op.toFixed(3);
        copy.style.transform = 'translate3d(0,' + ty.toFixed(2) + 'px,0)';
      }
    }

    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal, .tl');   // .tl triggers its line draw
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- showcase slider: drag + buttons + snap + parallax ---------- */
  var slider = document.getElementById('workSlider');
  if (slider) {
    var track = slider.querySelector('.slider-track');
    var slides = [].slice.call(track.querySelectorAll('.slide'));
    var imgs = [].slice.call(track.querySelectorAll('[data-slide-parallax]'));
    var btns = document.querySelectorAll('.slider-btn');

    // horizontal parallax on the slide images as the reel moves
    var ticking = false;
    function slideParallax() {
      ticking = false;
      if (!motion) return;
      var vw = innerWidth;
      for (var i = 0; i < imgs.length; i++) {
        var r = imgs[i].parentElement.getBoundingClientRect();
        var mid = r.left + r.width / 2 - vw / 2;
        imgs[i].style.transform = 'translate3d(' + (-mid * 0.05).toFixed(2) + 'px,0,0) scale(1.06)';
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(slideParallax); } }
    track.addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', slideParallax, { passive: true });
    slideParallax();

    // buttons
    function step() { return (slides[0] ? slides[0].getBoundingClientRect().width : 400) + 18; }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        track.scrollBy({ left: parseInt(b.getAttribute('data-dir'), 10) * step(), behavior: 'smooth' });
      });
    });

    // pointer drag
    var down = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      down = true; moved = 0; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('dragging'); track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      track.scrollLeft = startLeft - dx;
    });
    function endDrag() { down = false; track.classList.remove('dragging'); }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', function () { if (down) endDrag(); });
    // swallow the click that ends a real drag so it doesn't navigate
    track.addEventListener('click', function (e) { if (moved > 8) { e.preventDefault(); } }, true);
  }

  /* ---------- project filters (projects page) ---------- */
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    var tiles = [].slice.call(document.querySelectorAll('.project, .prow'));
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter'); if (!btn) return;
      filterBar.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      var want = btn.getAttribute('data-filter');
      tiles.forEach(function (t) { t.classList.toggle('is-hidden', !(want === 'all' || t.getAttribute('data-type') === want)); });
    });
  }

  /* ---------- custom cursor (desktop, fine pointer) ---------- */
  if (matchMedia('(pointer:fine)').matches && !reduced) {
    var docEl = document.documentElement;
    docEl.classList.add('has-cursor');
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    var label = document.createElement('div'); label.className = 'cursor-label';
    document.body.appendChild(dot); document.body.appendChild(ring); document.body.appendChild(label);

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      label.style.transform = 'translate3d(' + mx + 'px,' + (my + 44) + 'px,0) translate(-50%,-50%)';
      var t = e.target.closest('a,button,.tile,.prow-media,.float-card,.slider-btn,[data-cursor]');
      ring.classList.toggle('hover', !!t && !t.hasAttribute('data-cursor'));
      var media = t && t.hasAttribute('data-cursor');
      ring.classList.toggle('media', !!media);
      if (media) { label.textContent = t.getAttribute('data-cursor') || 'View'; label.classList.add('show'); }
      else { label.classList.remove('show'); }
    }, { passive: true });
    addEventListener('pointerdown', function () { ring.style.opacity = '.5'; });
    addEventListener('pointerup', function () { ring.style.opacity = '1'; });
    (function ring_raf() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(ring_raf);
    })();
  }

  /* ---------- cost calculator (insights page) ---------- */
  var calc = document.getElementById('calc');
  if (calc) {
    var rates = JSON.parse(calc.getAttribute('data-rates') || '{}');
    var area = calc.querySelector('#calc-area'), areaOut = calc.querySelector('#calc-area-out');
    var tier = calc.querySelector('#calc-tier'), floors = calc.querySelector('#calc-floors');
    var out = calc.querySelector('#calc-figure');
    var fmt = new Intl.NumberFormat('en-LK');
    function run() {
      var a = parseFloat(area.value) || 0, f = parseFloat(floors.value) || 1;
      var rate = (rates[tier.value] && rates[tier.value].rate) || 0;
      var total = a * f * rate;
      var lo = Math.round(total * 0.88 / 100000) / 10, hi = Math.round(total * 1.12 / 100000) / 10;
      if (areaOut) areaOut.textContent = fmt.format(a) + ' sq ft';
      out.textContent = a ? ('LKR ' + lo + 'M – ' + hi + 'M') : 'LKR —';
    }
    [area, tier, floors].forEach(function (el) { el && el.addEventListener('input', run); });
    run();
  }

  /* ---------- anchor links via Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -80 }); else t.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
