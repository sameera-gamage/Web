/*
  The work reel — a front-to-back pile driven straight from the scroll.

  On the desktop the reel pins to one stage (#reel-stage sticks for the whole
  section) and every card is positioned on top of the others. A card's look is
  computed directly from how far the page has scrolled — no scrubbed tweens, no
  sticky-offset guesswork — so the picture and its depth can never fall out of
  step:

    • the incoming project slides up from below into the front and fades in;
    • the one you leave recedes a touch and fades behind it.

  The centred project also reacts to the cursor: the card tilts in real
  perspective and its picture drifts inside the frame, giving the pile a sense
  of depth (a gentle 3-D parallax). A fixed caption holds the active project's
  name and rolls out/in as the project changes.

  SPEED sets how much scrolling one project takes (higher = longer / more
  scroll per project). A single scroll settles the nearest project to centre.
*/
export function mountStack({ gsap, ScrollTrigger, reduced }) {
  const reel = document.getElementById('reel');
  const stage = document.getElementById('reel-stage');
  if (!reel || !stage) return;
  const items = [...stage.querySelectorAll('.reel-item')];
  const cards = items.map((it) => it.querySelector('.reel-card'));
  const imgs = items.map((it) => it.querySelector('.reel-img'));
  const ticks = [...document.querySelectorAll('.reel-tick')];
  const rail = document.getElementById('reel-rail');
  const caption = document.getElementById('reel-caption');
  const capLine = document.getElementById('reel-caption-line');
  const N = items.length;
  if (!N) return;

  // desktop + motion only; otherwise the reel stays a plain vertical list
  const canAnimate = !reduced && matchMedia('(min-width: 761px)').matches;
  if (!canAnimate) return;

  // one project takes SPEED viewports of scroll — turn this up for a longer,
  // slower hand-off, down for a quicker one
  const SPEED = 2.2;
  const step = () => innerHeight * SPEED;

  reel.classList.add('is-live');

  // geometry from the NON-sticky track only (a sticky element's offsetTop
  // tracks the scroll and must never be used for measuring)
  const docTop = (el) => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
  const reelTop = () => docTop(reel);

  function layout() {
    // pinned length = (N-1) steps, plus one viewport for the stage itself
    reel.style.height = ((N - 1) * step() + innerHeight) + 'px';
  }

  // ---- caption: roll the old name out (down) and the new one in (up), held in
  //      one fixed spot. Queued so fast scrolling always lands on the right name.
  let swapping = false, pending = null, curName = null;
  function runSwap(name) {
    swapping = true;
    gsap.timeline({
      onComplete() {
        swapping = false;
        if (pending !== null && pending !== curName) { const n = pending; pending = null; runSwap(n); }
        else pending = null;
      },
    })
      .to(capLine, { yPercent: 120, autoAlpha: 0, duration: 0.26, ease: 'power2.in' })
      .add(() => { capLine.textContent = name; curName = name; })
      .set(capLine, { yPercent: 120, autoAlpha: 0 })
      .to(capLine, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
  }
  function swapCaption(i) {
    const el = items[i];
    if (!el) return;
    const name = el.dataset.name || '';
    if (caption) caption.setAttribute('href', el.dataset.href || '#');
    if (!capLine || name === curName) return;
    if (swapping) { pending = name; return; }
    runSwap(name);
  }
  if (capLine && items[0]) {                 // seed the first name without a roll
    capLine.textContent = curName = items[0].dataset.name || '';
    caption && caption.setAttribute('href', items[0].dataset.href || '#');
  }

  // ---- pile geometry, stored per card so the tilt can be composed on top ----
  const base = items.map(() => ({ y: 0, s: 1 }));
  let active = -1, prevImg = null;
  function setActive(i) {
    if (i === active) return;
    if (prevImg) prevImg.style.transform = '';   // drop the old card's parallax
    active = i;
    prevImg = imgs[i] || null;
    ticks.forEach((t, k) => t.classList.toggle('on', k === i));
    swapCaption(i);
  }

  function computePile(p) {
    for (let i = 0; i < N; i++) {
      const d = p - i;                 // <0 upcoming · 0 centred · >0 left behind
      let t, scale, opacity, y, bright;
      if (d <= 0) {                    // the NEW one slides up from below, to the front
        t = Math.max(0, d + 1);
        y = (1 - t) * 46;              // travels up from ~46% down into place
        scale = 0.94 + 0.06 * t;
        opacity = Math.min(1, t * 1.7);
        bright = 0.62 + 0.38 * t;
      } else {                         // the OLD one stays and recedes behind it
        t = Math.min(1, d);
        scale = 1 - 0.1 * t;
        opacity = 1 - t;
        y = -3 * t;
        bright = 1 - 0.35 * t;
      }
      const it = items[i];
      const vis = opacity > 0.012;
      it.style.opacity = vis ? opacity.toFixed(3) : '0';
      it.style.visibility = vis ? 'visible' : 'hidden';
      it.style.zIndex = String(i);
      base[i].y = y; base[i].s = scale;
      if (cards[i]) cards[i].style.filter = `brightness(${bright.toFixed(3)})`;
    }
  }

  // ---- cursor parallax: tilt the centred card, drift its picture inside ----
  let tgX = 0, tgY = 0, curX = 0, curY = 0;   // targets and eased values (-1..1)
  stage.addEventListener('pointermove', (e) => {
    tgX = (e.clientX / innerWidth) * 2 - 1;
    tgY = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { tgX = 0; tgY = 0; });

  function render() {
    curX += (tgX - curX) * 0.12;
    curY += (tgY - curY) * 0.12;
    const ry = curX * 7, rx = -curY * 5;       // card tilt, degrees
    for (let i = 0; i < N; i++) {
      const c = cards[i];
      if (!c) continue;
      let tr = `perspective(1100px) translateY(${base[i].y.toFixed(2)}%) scale(${base[i].s.toFixed(3)})`;
      if (i === active) tr += ` rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      c.style.transform = tr;
    }
    if (imgs[active]) imgs[active].style.transform =
      `translate(${(curX * 18).toFixed(1)}px, ${(curY * 18).toFixed(1)}px) scale(1.08)`;
  }

  const pos = () => Math.max(0, Math.min(N - 1, (scrollY - reelTop()) / step()));

  // ---- one rAF loop while the reel is on screen: track scroll, paint, parallax ----
  let running = false, raf = 0;
  function loop() {
    const rawTop = scrollY - reelTop();
    const p = pos();
    computePile(p);
    setActive(Math.round(p));
    render();
    const inReel = rawTop > -innerHeight * 0.5 && rawTop < (N - 1) * step() + innerHeight * 0.5;
    rail && rail.classList.toggle('show', inReel);
    if (running) raf = requestAnimationFrame(loop);
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { rootMargin: '200px' }).observe(reel);
  } else { start(); }

  // ---- centre-snap on scroll settle ----
  let settle = 0, snapping = false;
  addEventListener('scroll', () => {
    start();                                   // make sure the loop is awake mid-scroll
    if (snapping) return;
    clearTimeout(settle);
    settle = setTimeout(snapToNearest, 150);
  }, { passive: true });

  function goTo(i, dur = 0.7) {
    if (i < 0 || i >= N) return;
    const y = reelTop() + i * step();
    snapping = true;
    setActive(i);
    const L = window.__lenis;
    if (L && L.scrollTo) L.scrollTo(y, { duration: dur });
    else scrollTo({ top: y, behavior: 'smooth' });
    clearTimeout(settle);
    setTimeout(() => { snapping = false; }, dur * 1000 + 140);
  }
  function snapToNearest() {
    if (snapping) return;
    const p = (scrollY - reelTop()) / step();
    if (p <= -0.35 || p >= (N - 1) + 0.35) return;
    const i = Math.max(0, Math.min(N - 1, Math.round(p)));
    if (Math.abs(p - i) > 0.02) goTo(i, 0.6);
  }

  // ---- rail: hover-intent + click jump to a project ----
  let intent = 0;
  ticks.forEach((t, i) => {
    t.addEventListener('pointerenter', () => { clearTimeout(intent); intent = setTimeout(() => goTo(i, 0.75), 110); });
    t.addEventListener('pointerleave', () => clearTimeout(intent));
    t.addEventListener('click', () => { clearTimeout(intent); goTo(i, 0.65); });
    t.addEventListener('focus', () => goTo(i, 0.65));
  });

  addEventListener('resize', () => { layout(); ScrollTrigger && ScrollTrigger.refresh(); computePile(pos()); render(); }, { passive: true });

  layout();
  computePile(pos());
  setActive(Math.round(pos()));
  render();
  start();
  ScrollTrigger && ScrollTrigger.refresh();
}
