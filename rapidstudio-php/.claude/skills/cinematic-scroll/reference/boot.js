/*
  boot.js — wire the whole cinematic-scroll page together.

  ONE smooth-scroll rail (Lenis) driven by ONE ticker (GSAP), then hand the
  shared pieces to each module. Import GSAP, ScrollTrigger and Lenis (bundle
  with esbuild, or use UMD CDN builds and read gsap / ScrollTrigger / Lenis off
  window). Keep this file's order: Lenis first, then hero, then reel.
*/
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createHeroVideo } from './heroVideo.js';
import { mountHero } from './hero.js';
import { mountStack as mountReel } from './reel.js';   // reel.js exports mountStack
import { mountParticles } from './particles.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Background particle field. Idle it behind the hero (a 300vh pinned stage that
// hides it) so the video owns the frame budget while it scrubs.
const heroTop = document.getElementById('top');
mountParticles(reduced, () => !heroTop || scrollY > heroTop.offsetHeight - innerHeight * 1.5);

// Frame-locked smooth scroll — lerp interpolates toward the target EVERY frame.
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, syncTouch: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;                        // modules use this to scrollTo()
}

mountHero({ gsap, ScrollTrigger, createHeroVideo, reduced });
mountReel({ gsap, ScrollTrigger, reduced });

// smooth in-page anchor jumps through Lenis
document.querySelectorAll('a[href*="#"]').forEach((a) => {
  const href = a.getAttribute('href') || '';
  const id = href.slice(href.indexOf('#') + 1);
  const target = id && document.getElementById(id);
  if (!target) return;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const y = target.getBoundingClientRect().top + scrollY - 64;
    if (lenis) lenis.scrollTo(y, { duration: 1 });
    else scrollTo({ top: y, behavior: 'smooth' });
  });
});
