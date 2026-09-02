/* The full work index: smooth scroll, particle field, and cards that rise in. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { mountParticles } from './particles.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

mountParticles(reduced);

if (!reduced) {
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal-sec').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 6) * 0.05}s`;
    io.observe(el);
  });

  // each cover drifts inside its frame as the row scrolls past
  document.querySelectorAll('.wx-media [data-inner]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: el.closest('.wx-row') || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  ScrollTrigger.refresh();
} else {
  document.querySelectorAll('.reveal-sec').forEach((el) => el.classList.add('in'));
}
