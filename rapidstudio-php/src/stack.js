/*
  The work reel.

  A natural vertical scroll: each project is a big picture with the client name
  laid over it and the credits beneath. As a block travels through the viewport
  the picture parallaxes inside its frame and the title drifts the other way, so
  there is depth without a pin. A slim rail on the right tracks and jumps.
*/
export function mountStack({ gsap, ScrollTrigger, reduced }) {
  const reel = document.getElementById('reel');
  if (!reel) return;
  const items = [...reel.querySelectorAll('.reel-item')];
  const ticks = [...document.querySelectorAll('.reel-tick')];
  if (!items.length) return;

  // the tick rail only shows while the reel is on screen
  const wrap = document.getElementById('stack');
  const rail = document.getElementById('reel-rail');
  if (wrap && rail) {
    new IntersectionObserver(([e]) => rail.classList.toggle('show', e.isIntersecting),
      { rootMargin: '-8% 0px -8% 0px' }).observe(wrap);
  }

  // which block is centred → light its tick
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const i = +e.target.dataset.reel;
        ticks.forEach((t, k) => t.classList.toggle('on', k === i));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((el) => io.observe(el));

  ticks.forEach((t, i) => {
    t.addEventListener('click', () => {
      const y = items[i].getBoundingClientRect().top + scrollY - (innerHeight - items[i].offsetHeight) / 2;
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(y, { duration: 1 });
      else scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  if (reduced) return;

  // per-block parallax
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
