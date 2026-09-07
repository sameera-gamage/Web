/* =====================================================================
   EXCELLO — GSAP story engine
   Lenis smooth scroll drives GSAP ScrollTrigger. The homepage tells the
   full build story: land, survey, plan, brick by brick, materials, every
   discipline, the numbers, selected work, handover. All motion is gated
   to desktop + no-reduced-motion; mobile and reduced get calm fallbacks.
   ===================================================================== */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = matchMedia('(min-width: 861px)').matches;
  var motion  = desktop && !reduced && window.gsap;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (reduced || !desktop) document.documentElement.classList.add('is-static');

  /* ---------- Lenis + GSAP ticker ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, touchMultiplier: 1.4 });
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- nav ---------- */
  var nav = $('#nav'), burger = $('.nav-burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.nav-pill a', nav).forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('nav-open'); });
    });
  }
  var setNav = function () { if (nav) nav.classList.toggle('scrolled', (lenis ? lenis.scroll : scrollY) > 40); };
  if (lenis) lenis.on('scroll', setNav); else addEventListener('scroll', setNav, { passive: true });
  setNav();

  /* ---------- preloader ---------- */
  var pre = $('.preloader');
  function startStory() {
    buildReveals(); buildHero(); buildChapters(); buildProgress();
    buildSurvey(); buildBricks(); buildHorizontal(); buildCounters();
    buildParallax();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  if (pre && motion) {
    var pl = gsap.timeline({ onComplete: function () { pre.style.display = 'none'; ScrollTrigger.refresh(); } });
    pl.to('.pl-bar', { width: '100%', duration: .8, ease: 'power1.inOut' })
      .to('.pl-word', { yPercent: -120, duration: .5, ease: 'power3.in' }, '-=.12')
      .to(pre, { yPercent: -100, duration: .7, ease: 'power3.inOut' }, '-=.05');
    startStory();
  } else {
    if (pre) pre.style.display = 'none';
    startStory();
  }

  /* ---------- reveals ---------- */
  function buildReveals() {
    var els = $$('.reveal'), tls = $$('.tl'), sl = $$('.stageline');
    if (reduced || !window.ScrollTrigger) {
      els.concat(tls).concat(sl).forEach(function (el) { el.classList.add('in'); });
      return;
    }
    ScrollTrigger.batch('.reveal', { start: 'top 88%', onEnter: function (b) { b.forEach(function (el) { el.classList.add('in'); }); } });
    ScrollTrigger.batch('.tl, .stageline', { start: 'top 78%', onEnter: function (b) { b.forEach(function (el) { el.classList.add('in'); }); } });
  }

  /* ---------- hero headline mask ---------- */
  function buildHero() {
    if (!motion) return;
    var spans = $$('.chapter.is-hero .mask > span');
    if (spans.length) {
      gsap.set(spans, { yPercent: 115 });
      gsap.to(spans, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .12, delay: pre ? 1.15 : .2 });
    }
    var sub = $('.chapter.is-hero .chapter-sub'), cue = $('.scroll-cue');
    if (sub) gsap.from(sub, { autoAlpha: 0, y: 24, duration: 1, ease: 'power2.out', delay: pre ? 1.5 : .55 });
    if (cue) gsap.from(cue, { autoAlpha: 0, duration: 1, delay: pre ? 1.8 : .8 });
  }

  /* ---------- film chapters: media parallax + caption ---------- */
  function buildChapters() {
    if (!motion) return;
    $$('.chapter').forEach(function (ch) {
      var media = $('.chapter-media img, .chapter-media video', ch);
      if (media) {
        gsap.fromTo(media, { yPercent: -6, scale: 1.08 }, { yPercent: 8, scale: 1.2, ease: 'none',
          scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      var copy = $('.chapter-copy', ch);
      if (!copy) return;
      if (ch.classList.contains('is-hero')) {
        gsap.to(copy, { autoAlpha: 0, y: -60, ease: 'none',
          scrollTrigger: { trigger: ch, start: 'center top', end: 'bottom top', scrub: true } });
      } else {
        gsap.fromTo(copy, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, ease: 'power2.out',
          scrollTrigger: { trigger: ch, start: 'top 62%', end: 'top 22%', scrub: true } });
        gsap.to(copy, { autoAlpha: 0, y: -46, ease: 'power2.in',
          scrollTrigger: { trigger: ch, start: 'bottom 60%', end: 'bottom 22%', scrub: true } });
      }
    });
  }

  /* ---------- scroll-progress bar ---------- */
  function buildProgress() {
    var bar = $('#progress'); if (!bar) return;
    if (!window.ScrollTrigger || reduced) { bar.style.width = '0'; return; }
    gsap.to(bar, { width: '100%', ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  /* ---------- survey: self-drawing plot ---------- */
  function buildSurvey() {
    if (!motion) return;
    $$('.survey-plot .s-draw').forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 400;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, { strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.survey', start: 'top 72%', end: 'center center', scrub: 1 } });
    });
  }

  /* ---------- SIGNATURE: brick by brick ---------- */
  function buildBricks() {
    var build = $('.build'); if (!build || !motion) return;
    var bricks = $$('.brick', build);
    gsap.set(['.roofslab', '.win', '.build-real'], { autoAlpha: 0 });
    gsap.set('.build-cap .bc', { autoAlpha: 0 });
    gsap.set(bricks, { autoAlpha: 0, yPercent: 80 });

    var tl = gsap.timeline({
      scrollTrigger: { trigger: build, start: 'top top', end: 'bottom bottom', scrub: 1, pin: '.build-stage', anticipatePin: 1 }
    });
    tl.to('.bc-1', { autoAlpha: 1, duration: .4 })
      .to(bricks, { autoAlpha: 1, yPercent: 0, duration: 1.4,
        stagger: { each: .012, grid: [9, 16], axis: 'y', from: 'end' } }, '<')
      .to('.bc-1', { autoAlpha: 0, duration: .3 })
      .to('.roofslab', { autoAlpha: 1, duration: .5 })
      .to('.bc-2', { autoAlpha: 1, duration: .4 }, '<')
      .to('.bc-2', { autoAlpha: 0, duration: .3 }, '+=.4')
      .to('.win', { autoAlpha: 1, duration: .5, stagger: .12 })
      .to('.bc-3', { autoAlpha: 1, duration: .4 }, '<')
      .to('.bc-3', { autoAlpha: 0, duration: .3 }, '+=.4')
      .to('.build-real', { autoAlpha: 1, duration: .8 })
      .to(['.wall', '.roofslab', '.win'], { autoAlpha: 0, duration: .6 }, '<')
      .to('.bc-4', { autoAlpha: 1, duration: .5 }, '<');
  }

  /* ---------- everything we do: horizontal pinned ---------- */
  function buildHorizontal() {
    var sec = $('.hsec'), track = $('.htrack'); if (!sec || !track || !motion) return;
    gsap.to(track, {
      x: function () { return -(track.scrollWidth - innerWidth + 40); }, ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', pin: true, scrub: 1, invalidateOnRefresh: true,
        end: function () { return '+=' + (track.scrollWidth - innerWidth + 40); }
      }
    });
  }

  /* ---------- counters ---------- */
  function buildCounters() {
    $$('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count')) || 0, o = { v: 0 };
      if (reduced || !window.ScrollTrigger) { el.textContent = end.toLocaleString(); return; }
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 1.8, ease: 'power1.out',
          onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString(); } });
      } });
    });
  }

  /* ---------- generic parallax on inner-page imagery ---------- */
  function buildParallax() {
    if (!motion) return;
    $$('[data-parallax]').forEach(function (el) {
      var sp = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var host = el.closest('.prow-media, .person-photo, .feature-media, .tile') || el;
      gsap.fromTo(el, { yPercent: -sp * 70 }, { yPercent: sp * 70, ease: 'none',
        scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- selected work: cursor-reveal list (Landberg-style) ---------- */
  (function workList() {
    var wl = $('.worklist'); if (!wl) return;
    var floatEl = $('.work-float', wl); if (!floatEl) return;
    var imgs = $$('img', floatEl), items = $$('.work-item', wl);
    if (matchMedia('(hover: none)').matches || !window.gsap) return;
    var qx = gsap.quickTo(floatEl, 'x', { duration: .5, ease: 'power3' });
    var qy = gsap.quickTo(floatEl, 'y', { duration: .5, ease: 'power3' });
    addEventListener('pointermove', function (e) { qx(e.clientX); qy(e.clientY); }, { passive: true });
    items.forEach(function (it) {
      it.addEventListener('pointerenter', function () {
        var id = it.getAttribute('data-img');
        imgs.forEach(function (im) { im.classList.toggle('on', im.getAttribute('data-img') === id); });
        gsap.to(floatEl, { autoAlpha: 1, scale: 1, duration: .4, ease: 'power3.out' });
      });
      it.addEventListener('pointerleave', function () { gsap.to(floatEl, { autoAlpha: 0, duration: .3 }); });
    });
  })();

  /* ---------- project filters ---------- */
  var filterBar = $('.filters');
  if (filterBar) {
    var tiles = $$('.project, .prow');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter'); if (!btn) return;
      $$('.filter', filterBar).forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      var want = btn.getAttribute('data-filter');
      tiles.forEach(function (t) { t.classList.toggle('is-hidden', !(want === 'all' || t.getAttribute('data-type') === want)); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  /* ---------- cost calculator ---------- */
  var calc = $('#calc');
  if (calc) {
    var rates = JSON.parse(calc.getAttribute('data-rates') || '{}');
    var area = $('#calc-area', calc), areaOut = $('#calc-area-out', calc);
    var tier = $('#calc-tier', calc), floors = $('#calc-floors', calc), out = $('#calc-figure', calc);
    var fmt = new Intl.NumberFormat('en-LK');
    var run = function () {
      var a = parseFloat(area.value) || 0, f = parseFloat(floors.value) || 1;
      var rate = (rates[tier.value] && rates[tier.value].rate) || 0, total = a * f * rate;
      var lo = Math.round(total * 0.88 / 100000) / 10, hi = Math.round(total * 1.12 / 100000) / 10;
      if (areaOut) areaOut.textContent = fmt.format(a) + ' sq ft';
      out.textContent = a ? ('LKR ' + lo + 'M – ' + hi + 'M') : 'LKR —';
    };
    [area, tier, floors].forEach(function (el) { el && el.addEventListener('input', run); });
    run();
  }

  /* ---------- custom cursor ---------- */
  if (matchMedia('(pointer:fine)').matches && !reduced) {
    var docEl = document.documentElement; docEl.classList.add('has-cursor');
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    var label = document.createElement('div'); label.className = 'cursor-label';
    document.body.appendChild(dot); document.body.appendChild(ring); document.body.appendChild(label);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      label.style.transform = 'translate3d(' + mx + 'px,' + (my + 44) + 'px,0) translate(-50%,-50%)';
      var t = e.target.closest('a,button,.tile,.prow-media,.float-card,.slider-btn,.work-item,[data-cursor]');
      var media = t && t.hasAttribute && t.hasAttribute('data-cursor');
      ring.classList.toggle('hover', !!t && !media);
      ring.classList.toggle('media', !!media);
      if (media) { label.textContent = t.getAttribute('data-cursor') || 'View'; label.classList.add('show'); }
      else label.classList.remove('show');
    }, { passive: true });
    addEventListener('pointerdown', function () { ring.style.opacity = '.5'; });
    addEventListener('pointerup', function () { ring.style.opacity = '1'; });
    (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop); })();
  }

  /* ---------- anchor links ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = $(id); if (!t) return; e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -80 }); else t.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
