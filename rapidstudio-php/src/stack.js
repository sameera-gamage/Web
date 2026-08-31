/*
  The work stack — a pile of cards.

  CSS `position: sticky` does the pinning: every card shares the top anchor, so
  as you scroll the next card rises up and piles over the previous, and they all
  release together at the end (no fixed-position leak into the next section). We
  only add the flourish: the card being left scales down and dims so it sits
  behind the pile, and each title reveals from its mask as the card arrives. The
  rail on the right tracks the active card and jumps to it on hover.
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

  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    ticks.forEach((t, k) => t.classList.toggle('on', k === i));
  };

  // absolute document offset — sticky elements report rect.top as 0 when stuck,
  // so sum offsetTop up the chain instead
  const docTop = (el) => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };

  let snapping = false;
  function goTo(i, dur = 0.7) {
    const el = items[i];
    if (!el) return;
    const y = docTop(el);
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

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(+e.target.dataset.reel); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((el) => io.observe(el));

  // settle the nearest project to centre when scrolling stops
  let settle = 0;
  addEventListener('scroll', () => {
    if (snapping) return;
    clearTimeout(settle);
    settle = setTimeout(snapNearest, 120);
  }, { passive: true });
  function snapNearest() {
    if (snapping || !wrap) return;
    const top = docTop(wrap), bot = top + wrap.offsetHeight;
    // only while the reel owns the screen — never fight entering/leaving it
    if (scrollY < top - innerHeight * 0.25 || scrollY > bot - innerHeight * 0.75) return;
    let best = -1, bd = Infinity;
    items.forEach((el, i) => { const d = Math.abs(docTop(el) - scrollY); if (d < bd) { bd = d; best = i; } });
    if (best < 0 || bd < 10 || bd > innerHeight * 0.7) return;
    goTo(best, 0.55);
  }

  const canAnimate = !reduced && matchMedia('(min-width: 761px)').matches;
  if (!canAnimate) { setActive(0); return; }

  items.forEach((item, i) => {
    const card = item.querySelector('.reel-card');
    const title = card.querySelector('.reel-title');

    // recede AND fade right out as the NEXT card takes the front, so old
    // titles never ghost through from behind
    if (i < items.length - 1) {
      gsap.fromTo(card,
        { scale: 1, autoAlpha: 1 },
        {
          scale: 0.92, yPercent: -2, autoAlpha: 0, ease: 'none',
          scrollTrigger: { trigger: items[i + 1], start: 'top 85%', end: 'top 30%', scrub: true },
        });
    }

    // title reveals from its mask as the card comes up
    if (title) {
      gsap.fromTo(title,
        { yPercent: 115 },
        {
          yPercent: 0, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 80%', end: 'top 35%', scrub: 0.5 },
        });
    }
  });

  ScrollTrigger.refresh();
}
