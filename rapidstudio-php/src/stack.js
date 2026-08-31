/*
  The work reel.

  A natural vertical scroll: each project is a big picture with the client name
  laid over it and the credits beneath. The picture parallaxes inside its frame
  and the title drifts as the block travels, so there is depth without a pin.
  When scrolling settles, the nearest project glides to centre. The slim rail on
  the right tracks the active project and — on hover or click — jumps to it.
*/
export function mountStack({ gsap, ScrollTrigger, reduced }) {
  const reel = document.getElementById('reel');
  if (!reel) return;
  const items = [...reel.querySelectorAll('.reel-item')];
  const ticks = [...document.querySelectorAll('.reel-tick')];
  if (!items.length) return;

  const wrap = document.getElementById('stack');
  const rail = document.getElementById('reel-rail');
  if (wrap && rail) {
    new IntersectionObserver(([e]) => rail.classList.toggle('show', e.isIntersecting),
      { rootMargin: '-8% 0px -8% 0px' }).observe(wrap);
  }

  const lenis = () => window.__lenis;
  const frameOf = (el) => el.querySelector('.reel-frame') || el;
  const centerY = (el) => { const r = frameOf(el).getBoundingClientRect(); return r.top + r.height / 2; };

  let snapping = false;
  function goTo(i, dur = 0.7) {
    const el = items[i];
    if (!el) return;
    const f = frameOf(el);
    const y = f.getBoundingClientRect().top + scrollY - (innerHeight - f.offsetHeight) / 2;
    snapping = true;
    const L = lenis();
    if (L) L.scrollTo(y, { duration: dur, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else scrollTo({ top: y, behavior: 'smooth' });
    setTimeout(() => { snapping = false; }, dur * 1000 + 120);
    setActive(i);
  }

  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    ticks.forEach((t, k) => t.classList.toggle('on', k === i));
  }

  // light the tick for whichever block owns the centre of the screen
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(+e.target.dataset.reel); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((el) => io.observe(el));

  // ---- snap: settle the nearest project to centre ----
  let settle = 0;
  function snapNearest() {
    if (snapping) return;
    const mid = innerHeight / 2;
    let best = -1, bd = Infinity;
    items.forEach((el, i) => { const d = Math.abs(centerY(el) - mid); if (d < bd) { bd = d; best = i; } });
    if (best < 0) return;
    if (bd < 8) return;                        // already centred
    if (bd > innerHeight * 0.55) return;       // between sections — let it be
    goTo(best, 0.45);
  }
  if (!reduced) {
    addEventListener('scroll', () => {
      if (snapping) return;
      clearTimeout(settle);
      settle = setTimeout(snapNearest, 90);
    }, { passive: true });
  }

  // ---- the rail: hover (with intent) or click to jump ----
  let intent = 0;
  ticks.forEach((t, i) => {
    t.addEventListener('pointerenter', () => { clearTimeout(intent); intent = setTimeout(() => goTo(i, 0.8), 110); });
    t.addEventListener('pointerleave', () => clearTimeout(intent));
    t.addEventListener('click', () => { clearTimeout(intent); goTo(i, 0.7); });
    t.addEventListener('focus', () => goTo(i, 0.7));
  });

  if (reduced) return;

  // ---- per-block parallax ----
  items.forEach((el) => {
    const img = el.querySelector('.reel-img');
    const title = el.querySelector('.reel-title');
    gsap.fromTo(img, { yPercent: -9 }, {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    if (title) {
      gsap.fromTo(title, { yPercent: 16 }, {
        yPercent: -16, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });
}
