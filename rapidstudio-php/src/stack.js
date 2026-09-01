/*
  The work stack — a pile of sticky cards with one fixed caption.

  CSS `position: sticky` pins each card so the next rises over it. On top we add:
  a depth grow (each project swells from the back to full size), a recede/fade of
  the card being left, a right-side rail that tracks the active project, and one
  caption held in a fixed spot whose text rolls out (down) and in (up) as the
  active project changes.
*/
export function mountStack({ gsap, ScrollTrigger, reduced }) {
  const reel = document.getElementById('reel');
  if (!reel) return;
  const items = [...reel.querySelectorAll('.reel-item')];
  const ticks = [...document.querySelectorAll('.reel-tick')];
  if (!items.length) return;

  const rail = document.getElementById('reel-rail');
  const caption = document.getElementById('reel-caption');
  const capLine = document.getElementById('reel-caption-line');
  const N = items.length;

  // desktop only: on touch / reduced motion the reel is a plain list with each
  // card's own title, no pinning, rail or caption
  const canAnimate = !reduced && matchMedia('(min-width: 761px)').matches;
  if (!canAnimate) return;

  // Geometry from STABLE references only. A sticky element's offsetTop reports
  // its *stuck* position (it tracks the scroll), so it must never be used here.
  // The wrapper is not sticky, and every card is one viewport tall.
  const wrap = document.getElementById('stack');
  const docTop = (el) => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
  const reelTop = () => docTop(wrap);
  const stepH = () => innerHeight;

  // ---- caption: roll the name out (down) and the next one in (up), queued so
  //      fast scrolling always lands on the right name ----
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
    const name = el.dataset.name || '';
    if (caption) caption.setAttribute('href', el.dataset.href || '#');
    if (!capLine || name === curName) return;
    if (swapping) { pending = name; return; }
    runSwap(name);
  }

  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    ticks.forEach((t, k) => t.classList.toggle('on', k === i));
    swapCaption(i);
  };

  // ---- jump from the rail ----
  let snapping = false;
  function goTo(i, dur = 0.7) {
    if (!items[i]) return;
    const y = reelTop() + i * stepH();
    snapping = true;
    const L = window.__lenis;
    if (L) L.scrollTo(y, { duration: dur });
    else scrollTo({ top: y, behavior: 'smooth' });
    setTimeout(() => { snapping = false; }, dur * 1000 + 120);
    setActive(i);
  }
  let intent = 0;
  ticks.forEach((t, i) => {
    t.addEventListener('pointerenter', () => { clearTimeout(intent); intent = setTimeout(() => goTo(i, 0.8), 110); });
    t.addEventListener('pointerleave', () => clearTimeout(intent));
    t.addEventListener('click', () => { clearTimeout(intent); goTo(i, 0.7); });
    t.addEventListener('focus', () => goTo(i, 0.7));
  });

  // ---- one scroll handler drives active, show-range and centre-snap ----
  let settle = 0;
  function onScroll() {
    const rel = (scrollY - reelTop()) / stepH();   // 0 at first project, N-1 at last
    const idx = Math.max(0, Math.min(N - 1, Math.round(rel)));
    setActive(idx);

    const inReel = rel > -0.45 && rel < (N - 1) + 0.45;
    rail && rail.classList.toggle('show', inReel);
    caption && caption.classList.toggle('show', inReel);

    if (snapping) return;
    clearTimeout(settle);
    settle = setTimeout(() => {
      if (snapping) return;
      if (rel <= -0.4 || rel >= (N - 1) + 0.4) return;   // let entry/exit be free
      if (Math.abs(rel - idx) > 0.03) goTo(idx, 0.65);
    }, 160);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { ScrollTrigger.refresh(); onScroll(); }, { passive: true });
  onScroll();

  // ---- depth + recede (scrub-smoothed so it glides with the scroll) ----
  items.forEach((item, i) => {
    const card = item.querySelector('.reel-card');
    const depth = item.querySelector('.reel-depth');

    // incoming project rises from the back and grows to full size
    if (depth && i > 0) {
      gsap.fromTo(depth,
        { scale: 0.82, filter: 'brightness(0.55)' },
        {
          scale: 1, filter: 'brightness(1)', ease: 'none',
          scrollTrigger: { trigger: item, start: 'top bottom', end: 'top center', scrub: 0.6 },
        });
    }
    // the one you're leaving eases back a touch and fades behind the next
    if (i < N - 1) {
      gsap.fromTo(card,
        { scale: 1, autoAlpha: 1 },
        {
          scale: 0.88, yPercent: -2, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: items[i + 1], start: 'top 82%', end: 'top 26%', scrub: 0.6 },
        });
    }
  });

  ScrollTrigger.refresh();
  onScroll();
}
