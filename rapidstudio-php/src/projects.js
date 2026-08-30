/* The roll. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { mountStack } from './stack.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ duration: 0.9, smoothWheel: true, wheelMultiplier: 0.8 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
mountStack({ gsap, ScrollTrigger, lenis, reduced });

document.querySelectorAll('.pj-shot').forEach((link) => {
  link.addEventListener('click', () => {
    const img = link.querySelector('img');
    if (img) img.style.viewTransitionName = 'project-cover';
  });
});
