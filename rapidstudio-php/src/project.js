/*
  One project — a cinematic case study.

  Lenis carries the whole page on a smooth rail; GSAP + ScrollTrigger drive the
  parallax (the hero cover and every gallery frame drift under their masks at a
  different rate than the scroll), the title lifts in line by line, and each
  block rises as it arrives. Clips only run while they are on screen.
*/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- videos: only play while visible (runs with or without motion) ----
const vio = new IntersectionObserver((es) => {
  es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); }
    else { v.pause(); }
  });
}, { threshold: 0.25 });
document.querySelectorAll('.cs-frame video').forEach((v) => vio.observe(v));

if (reduced) {
  document.querySelectorAll('.rv').forEach((el) => el.classList.add('shown'));
} else {
  // smooth scroll
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;

  // in-page anchor jumps through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    const t = id && document.getElementById(id);
    if (t) a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo(t, { offset: -64, duration: 1 }); });
  });

  // ---- hero: the cover drifts up slower than the page; the title lifts in ----
  const heroImg = document.getElementById('cs-hero-img');
  if (heroImg) {
    gsap.fromTo(heroImg, { yPercent: -8, scale: 1.12 }, {
      yPercent: 12, scale: 1.12, ease: 'none',
      scrollTrigger: { trigger: '.cs-hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // split a heading into words wrapped in masks, then lift them in
  document.querySelectorAll('[data-splitup]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    const inner = words.map((w) => {
      const mask = document.createElement('span'); mask.className = 'cs-mask';
      const line = document.createElement('span'); line.className = 'cs-word';
      line.textContent = w; mask.appendChild(line); el.appendChild(mask);
      el.appendChild(document.createTextNode(' '));
      return line;
    });
    gsap.from(inner, {
      yPercent: 118, duration: 0.9, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // ---- blocks rise as they arrive ----
  gsap.utils.toArray('.rv').forEach((el) => {
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onComplete: () => el.classList.add('shown'),
    });
    el.classList.add('shown');
  });

  // ---- gallery + next-project images parallax inside their frames ----
  const parallax = (inner, amount) => gsap.fromTo(inner, { yPercent: -amount }, {
    yPercent: amount, ease: 'none',
    scrollTrigger: { trigger: inner.closest('figure, .cs-next') || inner, start: 'top bottom', end: 'bottom top', scrub: true },
  });
  document.querySelectorAll('.cs-frame [data-inner]').forEach((el) => parallax(el, 9));
  const nextImg = document.querySelector('.cs-next-img');
  if (nextImg) parallax(nextImg, 12);

  ScrollTrigger.refresh();
}
