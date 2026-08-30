/* The home page: the loader, the scrubbed hero, then the work stack and the
   sections below it — all one page, one scroll. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createHeroVideo } from './heroVideo.js';
import { mountHero } from './hero.js';
import { mountStack } from './stack.js';
import { mountParticles } from './particles.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

mountParticles(reduced);

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

mountHero({ gsap, ScrollTrigger, createHeroVideo, reduced });
mountStack({ gsap, ScrollTrigger, lenis, reduced });

// morph the clicked cover into the project page (Chrome/Edge)
document.querySelectorAll('.pj-shot').forEach((link) => {
  link.addEventListener('click', () => {
    const img = link.querySelector('img');
    if (img) img.style.viewTransitionName = 'project-cover';
  });
});

// sections rise in as they arrive
if (!reduced) {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal-sec').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.reveal-sec').forEach((el) => el.classList.add('in'));
}

// the FAQ is native <details>, but only one open at a time reads calmer
const faqs = [...document.querySelectorAll('.faq')];
faqs.forEach((d) => {
  d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  });
});

// smooth in-page jumps (nav Work/Answers, Start a brief, the seal) via Lenis
document.querySelectorAll('a[href]').forEach((a) => {
  const href = a.getAttribute('href') || '';
  const h = href.indexOf('#');
  if (h < 0) return;
  const id = href.slice(h + 1);
  const target = id && document.getElementById(id);
  if (!target) return; // not a section on this page — let it navigate away
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const y = target.getBoundingClientRect().top + scrollY - 64;
    if (lenis) lenis.scrollTo(y, { duration: 1 });
    else scrollTo({ top: y, behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);
  });
});
