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

// the gate now lets the page-wide particle field read straight through (the
// hero bed clears as the aperture opens), so it only needs its cursor-lit glow
// — a second, scoped field here would just double the constellation.
const gate = document.getElementById('gate');
if (gate && !reduced) {
  gate.addEventListener('pointermove', (e) => {
    const r = gate.getBoundingClientRect();
    gate.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    gate.style.setProperty('--gy', (e.clientY - r.top) + 'px');
  }, { passive: true });
}

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

// the "one room, six walls" panels: open the one you point at (or focus)
const rooms = [...document.querySelectorAll('.room')];
if (rooms.length) {
  const open = (r) => rooms.forEach((o) => o.classList.toggle('is-open', o === r));
  rooms.forEach((r) => {
    r.addEventListener('pointerenter', () => open(r));
    r.addEventListener('focus', () => open(r));
  });
}

// the FAQ index: point at a question on the left, its answer opens on the
// right. Without JS every panel just shows in a readable stack.
const qa = document.getElementById('qa');
if (qa) {
  const tabs = [...qa.querySelectorAll('.qa-tab')];
  const panels = [...qa.querySelectorAll('.qa-panel')];
  if (tabs.length) {
    qa.classList.add('is-tabs');
    let cur = -1;
    const show = (i) => {
      if (i === cur || i < 0 || i >= tabs.length) return;
      cur = i;
      tabs.forEach((t, k) => { const on = k === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
      panels.forEach((p, k) => p.classList.toggle('on', k === i));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('pointerenter', () => show(i));
      t.addEventListener('click', () => show(i));
      t.addEventListener('focus', () => show(i));
    });
    show(0);
  }
}

// the connect panel: the form unfolds from the "write a message" button
const connect = document.getElementById('connect');
if (connect) {
  document.getElementById('connect-open')?.addEventListener('click', () => {
    connect.classList.add('is-open');
    setTimeout(() => connect.querySelector('input[name="name"]')?.focus(), 400);
  });
  document.getElementById('connect-close')?.addEventListener('click', () => {
    connect.classList.remove('is-open');
  });

  // footer reveal: as the connect panel scrolls up into view it lifts and
  // settles, and the big LET'S CONNECT rises a touch further for depth —
  // scrubbed to the scroll so it glides in rather than snapping.
  if (!reduced) {
    const say = document.getElementById('say');
    const k = connect.querySelector('.connect-k');
    const h = connect.querySelector('.connect-h');
    const btn = connect.querySelector('.connect-btn');
    const foot = connect.querySelector('.connect-foot');
    gsap.set(connect, { transformOrigin: '50% 100%' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: say, start: 'top bottom', end: 'top center', scrub: 0.8 },
    });
    tl.from(connect, { yPercent: 10, scale: 0.92, autoAlpha: 0.25, ease: 'none' }, 0)
      .from(k,   { y: 50, autoAlpha: 0, ease: 'none' }, 0.05)
      .from(h,   { y: 110, autoAlpha: 0, ease: 'none' }, 0)
      .from(btn, { y: 70, autoAlpha: 0, ease: 'none' }, 0.12)
      .from(foot, { y: 34, ease: 'none' }, 0.18);   // y only — its opacity is owned by the open/close state
  }

  // magnetic button: while the panel is at rest, "Write a message" chases the
  // cursor around the container and springs home when the pointer leaves.
  const magnet = document.getElementById('connect-open');
  if (magnet && !reduced) {
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    const tick = () => {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      magnet.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) requestAnimationFrame(tick);
      else { magnet.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`; running = false; }
    };
    const wake = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
    connect.addEventListener('pointermove', (e) => {
      if (connect.classList.contains('is-open')) return;
      const r = magnet.getBoundingClientRect();
      const homeX = r.left + r.width / 2 - cx;   // subtract current offset → stable home centre
      const homeY = r.top + r.height / 2 - cy;
      tx = (e.clientX - homeX) * 0.45;
      ty = (e.clientY - homeY) * 0.45;
      const m = Math.hypot(tx, ty), max = 200;   // leash so it stays in the panel
      if (m > max) { tx = tx / m * max; ty = ty / m * max; }
      magnet.classList.add('is-chasing');
      wake();
    }, { passive: true });
    connect.addEventListener('pointerleave', () => { tx = 0; ty = 0; magnet.classList.remove('is-chasing'); wake(); });
  }
}

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
