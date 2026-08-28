/* One project: reveal the roll of stills, and only run clips while on screen. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const show = () => document.querySelectorAll('.rv').forEach((el) => el.classList.add('shown'));

if (reduced) {
  show();
} else {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv').forEach((el) => io.observe(el));

  const vio = new IntersectionObserver((es) => {
    es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); }
      else { v.pause(); }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.case-frame video').forEach((v) => vio.observe(v));
}
