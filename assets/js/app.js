/* =====================================================================
   EXCELLO — light luxury engine (GSAP + ScrollTrigger + Lenis)
   Reveals from every side, kinetic sliding type, word-by-word text,
   a scroll odometer, image carousels, a theme-aware cursor.
   ===================================================================== */
(function () {
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = matchMedia('(min-width: 861px)').matches;
  var motion  = desktop && !reduced && window.gsap;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.gsap) gsap.config({ nullTargetWarn: false });
  if (reduced || !desktop) document.documentElement.classList.add('is-static');

  /* ---- Lenis + GSAP ticker (tuned for a smooth, weighted feel) ---- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.95, smoothWheel: true, touchMultiplier: 1.5 });
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---- nav ---- */
  var nav = $('#nav'), burger = $('.nav-burger'), navwrap = $('.nav-inner');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.nav-links a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('nav-open'); }); });
  }

  /* ---- odometer ---- */
  var odo = $('#odo');
  function odoUpdate() {
    if (!odo) return;
    var max = document.documentElement.scrollHeight - innerHeight;
    var pct = max > 0 ? (lenis ? lenis.scroll : scrollY) / max : 0;
    odo.textContent = String(Math.min(99, Math.max(0, Math.round(pct * 99)))).padStart(2, '0');
  }
  if (lenis) lenis.on('scroll', odoUpdate); else addEventListener('scroll', odoUpdate, { passive: true });
  odoUpdate();

  /* ---- preloader ---- */
  var pre = $('.preloader');
  function boot() { reveals(); heroIn(); kinetic(); heroParallax(); videoScrub(); lines(); navOverHero(); carousels(); parallax(); voyage(); routeDraw(); petals(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }
  if (pre && motion) {
    gsap.timeline({ onComplete: function () { pre.style.display = 'none'; ScrollTrigger.refresh(); } })
      .to('.pl-bar', { width: '100%', duration: .8, ease: 'power1.inOut' })
      .to('.pl-word', { yPercent: -120, duration: .5, ease: 'power3.in' }, '-=.12')
      .to(pre, { yPercent: -100, duration: .7, ease: 'power3.inOut' }, '-=.05');
    boot();
  } else { if (pre) pre.style.display = 'none'; boot(); }

  /* ---- reveals: rv / clip / word ---- */
  function reveals() {
    if (!motion || !window.ScrollTrigger) {
      $$('.rv, .rv-up, .rv-l, .rv-r, .rv-sc, .clip-b, .clip-l, .clip-r, .tl, .stageline').forEach(function (el) { el.classList.add('in'); });
      // ensure word-rv text is visible
      $$('.word-rv').forEach(function (el) { el.style.opacity = 1; });
      return;
    }
    // split word-rv into words
    $$('.word-rv').forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
      gsap.to($$('.w', el), {
        opacity: 1, y: 0, rotate: 0, duration: .8, ease: 'power3.out', stagger: .05,
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
    });
    // generic rv
    $$('.rv, .rv-up, .rv-l, .rv-r, .rv-sc').forEach(function (el) {
      gsap.to(el, { opacity: 1, x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    // clip image wipes
    $$('.clip-b, .clip-l, .clip-r').forEach(function (el) {
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 84%' } });
      var img = $('img', el); if (img) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 84%' } });
    });
    // timelines
    ScrollTrigger.batch('.tl, .stageline', { start: 'top 78%', onEnter: function (b) { b.forEach(function (el) { el.classList.add('in'); }); } });
  }

  /* ---- hero title mask ---- */
  function heroIn() {
    if (!motion) return;
    var spans = $$('.hero-title .mask > span');
    if (spans.length) { gsap.set(spans, { yPercent: 120 }); gsap.to(spans, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .14, delay: pre ? 1.15 : .2 }); }
    var sub = $('.hero-sub'), eye = $('.hero-copy .eyebrow'), cue = $('.hero-cue');
    if (eye) gsap.from(eye, { autoAlpha: 0, y: 20, duration: .9, delay: pre ? 1 : .1 });
    if (sub) gsap.from(sub, { autoAlpha: 0, y: 24, duration: 1, delay: pre ? 1.5 : .5 });
    if (cue) gsap.from(cue, { autoAlpha: 0, duration: 1, delay: pre ? 1.9 : .9 });
  }
  function heroParallax() {
    if (!motion) return;
    var m = $('.hero-media img, .hero-media video');
    if (m) gsap.to(m, { yPercent: 14, scale: 1.14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---- kinetic sliding words ---- */
  function kinetic() {
    if (!motion) return;
    $$('[data-kinetic]').forEach(function (el) {
      var amt = parseFloat(el.getAttribute('data-kinetic')) || -12;
      gsap.fromTo(el, { xPercent: amt < 0 ? 0 : -amt }, { xPercent: amt < 0 ? amt : 0, ease: 'none',
        scrollTrigger: { trigger: el.closest('.kinetic') || el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---- timeline line draw already via .in ---- */
  function lines() {}

  /* ---- nav + badge colour over the hero ---- */
  function navOverHero() {
    var hero = $('.hero') || $('.vhero'); if (!hero) return;
    document.body.classList.add('over-hero');
    if (!window.ScrollTrigger) return;
    ScrollTrigger.create({ trigger: hero, start: 'bottom top+=90',
      onEnter: function () { document.body.classList.remove('over-hero'); if (nav) nav.classList.remove('light-nav'); },
      onLeaveBack: function () { document.body.classList.add('over-hero'); if (nav) nav.classList.add('light-nav'); } });
  }

  /* ---- image carousels ---- */
  function carousels() {
    $$('.carousel').forEach(function (car) {
      var track = $('.car-track', car); if (!track) return;
      var slides = $$('.car-slide', track), count = $('.car-count span', car);
      var step = function () { return slides[0] ? slides[0].getBoundingClientRect().width + 16 : 400; };
      $$('.car-btn', car).forEach(function (b) {
        b.addEventListener('click', function () { track.scrollBy({ left: parseInt(b.getAttribute('data-dir'), 10) * step(), behavior: 'smooth' }); });
      });
      if (count) track.addEventListener('scroll', function () {
        var i = Math.round(track.scrollLeft / step());
        count.textContent = Math.min(slides.length, i + 1);
      }, { passive: true });
    });
  }

  /* ---- generic parallax (origins, gulls, inner pages) ---- */
  function parallax() {
    if (!motion) return;
    $$('[data-parallax]').forEach(function (el) {
      var sp = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var host = el.closest('.origin-media, .voyage, .prow-media, .feature-media, .person-photo') || el;
      gsap.fromTo(el, { yPercent: -sp * 60 }, { yPercent: sp * 60, ease: 'none',
        scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---- scroll-scrubbed video hero (video-as-Lenis) ---- */
  function videoScrub() {
    var sec = $('#vhero'); if (!sec) return;
    var vid = $('.vhero-vid', sec);
    if (motion) {
      gsap.to('.cap-1', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: sec, start: '30% top', end: '48% top', scrub: true } });
      gsap.fromTo('.cap-2', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: sec, start: '50% top', end: '68% top', scrub: true } });
      gsap.to('.vhero .hero-cue', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: sec, start: '5% top', end: '15% top', scrub: true } });
    }
    if (!motion || !vid) return;
    var dur = 0, target = 0, cur = 0, seeking = false;
    sec.classList.add('loading');
    function ready() { dur = vid.duration || 12; sec.classList.remove('loading'); }
    if (vid.readyState >= 2) ready();
    vid.addEventListener('loadedmetadata', function () { dur = vid.duration || 12; });
    vid.addEventListener('loadeddata', ready);
    vid.addEventListener('canplaythrough', ready);
    setTimeout(function () { sec.classList.remove('loading'); }, 6000);
    vid.addEventListener('seeked', function () { seeking = false; });
    // prime the decoder so seeking is instant (muted lets this pass autoplay policy)
    var p = vid.play(); if (p && p.then) p.then(function () { vid.pause(); }).catch(function () {});
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: function (self) { target = self.progress; } });
    (function loop() {
      cur += (target - cur) * 0.12;
      if (dur && vid.readyState >= 2 && !seeking) {
        var t = Math.max(0, Math.min(dur - 0.05, cur * dur));
        if (Math.abs((vid.currentTime || 0) - t) > 0.015) { seeking = true; try { vid.currentTime = t; } catch (e) { seeking = false; } }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---- the materials voyage: ship + truck sail across on scroll ---- */
  function voyage() {
    if (!motion) return;
    var v = $('#voyage');
    if (v) {
      var ship = $('[data-ship]', v), wake = $('[data-wake]', v);
      if (ship) gsap.fromTo(ship, { x: '-32vw' }, { x: '112vw', ease: 'none', scrollTrigger: { trigger: v, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      if (wake) gsap.fromTo(wake, { x: '-60vw' }, { x: '86vw', ease: 'none', scrollTrigger: { trigger: v, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }
    var br = $('#byroad');
    if (br) { var truck = $('[data-truck]', br);
      if (truck) gsap.fromTo(truck, { x: '-30vw' }, { x: '114vw', ease: 'none', scrollTrigger: { trigger: br, start: 'top bottom', end: 'bottom top', scrub: 1 } }); }
  }

  /* ---- the route: draw the line, sail a marker along it ---- */
  function routeDraw() {
    if (!motion) return;
    var line = document.getElementById('routeLine'), marker = document.getElementById('routeMarker');
    if (!line || !line.getTotalLength) return;
    var len = line.getTotalLength();
    line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
    var s = line.getPointAtLength(0);
    if (marker) marker.setAttribute('transform', 'translate(' + s.x + ',' + s.y + ')');
    ScrollTrigger.create({ trigger: '#route', start: 'top 68%', end: 'bottom 55%', scrub: 1,
      onUpdate: function (self) {
        var p = self.progress; line.style.strokeDashoffset = len * (1 - p);
        if (marker) { var pt = line.getPointAtLength(len * p); marker.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')'); }
      } });
  }

  /* ---- SURPRISE: bougainvillea petals fall when the promise arrives ---- */
  function petals() {
    var host = $('#petals'); if (!host || !motion) return;
    ScrollTrigger.create({ trigger: '#promise', start: 'top 60%', once: true, onEnter: function () {
      for (var i = 0; i < 20; i++) {
        var el = document.createElement('span'); el.className = 'petal'; host.appendChild(el);
        gsap.set(el, { left: (Math.random() * 100) + '%', top: '-8%', opacity: 0, scale: 0.7 + Math.random() * 0.7 });
        gsap.to(el, { y: '116vh', x: (Math.random() * 180 - 90), rotation: Math.random() * 720 - 360,
          duration: 4 + Math.random() * 3.5, ease: 'none', delay: Math.random() * 2.4,
          onComplete: function () { var t = this.targets()[0]; if (t) t.remove(); } });
        gsap.to(el, { opacity: 1, duration: 0.8, delay: Math.random() * 2.4 });
        gsap.to(el, { opacity: 0, duration: 1.4, delay: 3.6 + Math.random() * 2.2 });
      }
    } });
  }

  /* ---- project filters ---- */
  var fb = $('.filters');
  if (fb) {
    var tiles = $$('.prow, .project');
    fb.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter'); if (!btn) return;
      $$('.filter', fb).forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      var want = btn.getAttribute('data-filter');
      tiles.forEach(function (t) { t.classList.toggle('is-hidden', !(want === 'all' || t.getAttribute('data-type') === want)); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  /* ---- cost calculator ---- */
  var calc = $('#calc');
  if (calc) {
    var rates = JSON.parse(calc.getAttribute('data-rates') || '{}');
    var area = $('#calc-area', calc), areaOut = $('#calc-area-out', calc), tier = $('#calc-tier', calc), floors = $('#calc-floors', calc), out = $('#calc-figure', calc);
    var fmt = new Intl.NumberFormat('en-LK');
    var run = function () {
      var a = parseFloat(area.value) || 0, f = parseFloat(floors.value) || 1, rate = (rates[tier.value] && rates[tier.value].rate) || 0, total = a * f * rate;
      var lo = Math.round(total * 0.88 / 100000) / 10, hi = Math.round(total * 1.12 / 100000) / 10;
      if (areaOut) areaOut.textContent = fmt.format(a) + ' sq ft';
      out.textContent = a ? ('LKR ' + lo + 'M – ' + hi + 'M') : 'LKR —';
    };
    [area, tier, floors].forEach(function (el) { el && el.addEventListener('input', run); }); run();
  }

  /* ---- custom cursor (mix-blend, theme-aware) ---- */
  if (matchMedia('(pointer:fine)').matches && !reduced) {
    document.documentElement.classList.add('has-cursor');
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    var label = document.createElement('div'); label.className = 'cursor-label';
    document.body.appendChild(dot); document.body.appendChild(ring); document.body.appendChild(label);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      label.style.transform = 'translate3d(' + mx + 'px,' + (my + 42) + 'px,0) translate(-50%,-50%)';
      var t = e.target.closest('a,button,.car-slide,.prow-media,[data-cursor]');
      var media = t && t.hasAttribute && t.hasAttribute('data-cursor');
      ring.classList.toggle('hover', !!t && !media);
      ring.classList.toggle('media', !!media);
      if (media) { label.textContent = t.getAttribute('data-cursor') || 'View'; label.classList.add('show'); } else label.classList.remove('show');
    }, { passive: true });
    (function loop() { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) translate(-50%,-50%)'; requestAnimationFrame(loop); })();
  }

  /* ---- anchors ---- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length < 2) return; var t = $(id); if (!t) return; e.preventDefault(); if (lenis) lenis.scrollTo(t, { offset: -80 }); else t.scrollIntoView({ behavior: 'smooth' }); });
  });
})();
