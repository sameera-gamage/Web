/*
  The work reel — a front-to-back pile driven straight from the scroll.

  On the desktop the reel pins to one stage (#reel-stage sticks for the whole
  section) and every card is positioned on top of the others. A card's look is
  computed directly from how far the page has scrolled — no scrubbed tweens, no
  sticky-offset guesswork — so the picture, its depth and its overlaid title all
  move as one and can never fall out of step:

    • the incoming project grows from the back (scale 0.8 → 1) and fades up;
    • the one you leave recedes (scale 1 → 0.88) and fades behind the next.

  SPEED sets how much scrolling one project takes (higher = slower / longer).
  A single scroll settles the nearest project to the centre and holds it there.
*/
export function mountStack({ gsap, ScrollTrigger, reduced }) {
  const reel = document.getElementById('reel');
  const stage = document.getElementById('reel-stage');
  if (!reel || !stage) return;
  const items = [...stage.querySelectorAll('.reel-item')];
  const cards = items.map((it) => it.querySelector('.reel-card'));
  const ticks = [...document.querySelectorAll('.reel-tick')];
  const rail = document.getElementById('reel-rail');
  const N = items.length;
  if (!N) return;

  // desktop + motion only; otherwise the reel stays a plain vertical list
  const canAnimate = !reduced && matchMedia('(min-width: 761px)').matches;
  if (!canAnimate) return;

  // one project takes SPEED viewports of scroll — turn this up to slow it down
  const SPEED = 1.6;
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

  // ---- paint the pile for a given fractional position p (0 = first centred) ----
  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    ticks.forEach((t, k) => t.classList.toggle('on', k === i));
  }

  function paint(p) {
    for (let i = 0; i < N; i++) {
      const d = p - i;                 // <0 upcoming · 0 centred · >0 left behind
      let t, scale, opacity, y, bright;
      if (d <= 0) {                    // rising from the back to the front
        t = Math.max(0, d + 1);        // d=-1 → 0 (deep back) · d=0 → 1 (front)
        scale = 0.8 + 0.2 * t;
        opacity = t;
        y = (1 - t) * 6;               // eases up from just below
        bright = 0.5 + 0.5 * t;
      } else {                         // receding behind the next one
        t = Math.min(1, d);            // 0 front · 1 gone
        scale = 1 - 0.12 * t;
        opacity = 1 - t;
        y = -4 * t;
        bright = 1 - 0.4 * t;
      }
      const it = items[i], card = cards[i];
      const vis = opacity > 0.012;
      it.style.opacity = vis ? opacity.toFixed(3) : '0';
      it.style.visibility = vis ? 'visible' : 'hidden';
      it.style.zIndex = String(i);
      if (card) {
        card.style.transform = `translateY(${y.toFixed(2)}%) scale(${scale.toFixed(3)})`;
        card.style.filter = `brightness(${bright.toFixed(3)})`;
      }
    }
  }

  const pos = () => Math.max(0, Math.min(N - 1, (scrollY - reelTop()) / step()));

  // ---- rAF-gated scroll: paint every frame the scroll moved, plus centre-snap ----
  let ticking = false, lastY = -1, settle = 0, snapping = false;
  function frame() {
    ticking = false;
    const rawTop = scrollY - reelTop();
    const p = pos();
    paint(p);
    setActive(Math.round(p));
    // show the rail only while the reel owns the screen
    const inReel = rawTop > -innerHeight * 0.5 && rawTop < (N - 1) * step() + innerHeight * 0.5;
    rail && rail.classList.toggle('show', inReel);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    if (scrollY === lastY) return;
    lastY = scrollY;
    if (snapping) return;
    clearTimeout(settle);
    settle = setTimeout(snapToNearest, 150);
  }

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
    if (p <= -0.35 || p >= (N - 1) + 0.35) return;   // leave the entry/exit free
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

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { layout(); ScrollTrigger && ScrollTrigger.refresh(); frame(); }, { passive: true });

  layout();
  frame();
  ScrollTrigger && ScrollTrigger.refresh();
}
