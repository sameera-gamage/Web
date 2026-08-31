/*
  The work stack — a pile of cards.

  Each project owns one screen of scroll. Its card is pinned in place, and the
  next project's card rises up over it as you scroll; the one you're leaving
  scales down and dims, so it sits behind the pile rather than vanishing. The
  title reveals from a mask as each card arrives. A rail on the right tracks the
  active card and jumps to it on hover.
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

  function goTo(i) {
    const el = items[i];
    if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY;
    const L = window.__lenis;
    if (L) L.scrollTo(y, { duration: 0.8 });
    else scrollTo({ top: y, behavior: 'smooth' });
  }
  let intent = 0;
  ticks.forEach((t, i) => {
    t.addEventListener('pointerenter', () => { clearTimeout(intent); intent = setTimeout(() => goTo(i), 110); });
    t.addEventListener('pointerleave', () => clearTimeout(intent));
    t.addEventListener('click', () => { clearTimeout(intent); goTo(i); });
    t.addEventListener('focus', () => goTo(i));
  });

  // track which card is centred (works with or without motion)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(+e.target.dataset.reel); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((el) => io.observe(el));

  // pinning is desktop-only; touch just scrolls the cards in flow
  const canPin = !reduced && matchMedia('(min-width: 761px)').matches;
  if (!canPin) { setActive(0); return; }

  items.forEach((item, i) => {
    const card = item.querySelector('.reel-card');
    const title = card.querySelector('.reel-title');
    const last = i === items.length - 1;

    // pin the card so the pile builds up
    ScrollTrigger.create({
      trigger: item,
      start: 'top top',
      end: 'bottom top',
      pin: card,
      pinSpacing: false,
      anticipatePin: 1,
    });

    // the card recedes as the NEXT one takes the front
    if (!last) {
      gsap.fromTo(card,
        { scale: 1, filter: 'brightness(1)' },
        {
          scale: 0.88, yPercent: -3, filter: 'brightness(0.4)', ease: 'none',
          scrollTrigger: { trigger: items[i + 1], start: 'top bottom', end: 'top top', scrub: true },
        });
    }

    // title reveals from its mask as the card arrives, hides as it leaves
    if (title) {
      gsap.fromTo(title,
        { yPercent: 115 },
        {
          yPercent: 0, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 78%', end: 'top 30%', scrub: 0.6 },
        });
    }
  });

  ScrollTrigger.refresh();
}
