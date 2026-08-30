/*
  The project stack.

  One scroll progress drives everything. Each slide gets a signed distance from
  centre, and the picture and the name are moved by DIFFERENT multiples of it:
  the picture crosses a whole screen and clearly leaves, the name barely moves.
  That gap is the whole effect — consecutive names end up close together and
  cross over each other, so for a moment you read both, rather than one chasing
  the other in from off-screen. Measured off the reference, not guessed: 118
  against 16.

  The ladder on the right drives the same scroll rather than a second state, so
  hovering a rung and scrolling by hand can never disagree.
*/

const SHOT_TRAVEL = 118;   // vh per slide
const NAME_TRAVEL = 16;
const HOVER_INTENT = 90;   // ms before a rung takes the page anywhere

export function mountStack({ gsap, ScrollTrigger, lenis, reduced }) {
  const stackEl = document.getElementById('pj-stack');
  const section = document.getElementById('stack');
  if (!stackEl || !section) return;

  const slides = [...stackEl.children].map((el) => ({
    el,
    shot: el.querySelector('.pj-shot'),
    name: el.querySelector('.pj-name'),
  }));
  const N = slides.length;
  const rungs = [...document.querySelectorAll('[data-rung]')];
  const nEl = document.getElementById('pj-n');

  let lastOn = -1;
  const clamp = (v) => Math.min(1, Math.max(0, v));

  function paint(p) {
    const pos = p * (N - 1);
    for (let i = 0; i < N; i++) {
      const s = slides[i];
      const d = pos - i;
      const near = Math.abs(d) < 1.35;
      s.el.style.visibility = near ? 'visible' : 'hidden';
      if (!near) continue;

      const dim = 1 - Math.min(0.08, Math.abs(d) * 0.08);
      s.shot.style.transform = `translate3d(0, ${(-d * SHOT_TRAVEL).toFixed(2)}vh, 0) scale(${dim.toFixed(4)})`;
      s.name.style.transform = `translate3d(0, ${(-d * NAME_TRAVEL).toFixed(2)}vh, 0)`;

      // the picture is gone before the name is; the name lingers to cross
      s.shot.style.opacity = clamp(1 - (Math.abs(d) - 0.34) / 0.42).toFixed(3);
      s.name.style.opacity = clamp(1 - (Math.abs(d) - 0.30) / 0.58).toFixed(3);
      s.el.style.zIndex = String(10 - Math.round(Math.abs(d) * 10));

      // only the slide at rest can be clicked, so a name halfway through a
      // crossover is never a link you can hit by accident
      const live = Math.abs(d) < 0.4 ? 'auto' : 'none';
      s.shot.style.pointerEvents = live;
      s.name.style.pointerEvents = live;
    }

    const on = Math.min(N - 1, Math.max(0, Math.round(pos)));
    if (on !== lastOn) {
      rungs.forEach((r, i) => r.classList.toggle('on', i === on));
      if (nEl) nEl.textContent = String(on + 1).padStart(2, '0');
      lastOn = on;
    }
  }


  if (reduced) {
    // nothing is driving the stack; the CSS lays it out as a plain list
    rungs.forEach((r, i) => r.classList.toggle('on', i === 0));
    return;
  }

  let progress = 0;

  // Snap WITHOUT ever stopping Lenis. Stopping the smooth-scroller was what
  // made the page feel jammed: while it was stopped the wheel had nothing to
  // drive. Instead we let scrolling run free, and when it settles we glide to
  // the nearest project. One scroll, one project — and you can always scroll.
  let settle = 0;
  let snapping = false;

  const st = ScrollTrigger.create({
    trigger: '#stack',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.15,
    onUpdate: (self) => {
      progress = self.progress;
      paint(progress);
      if (snapping) return;
      clearTimeout(settle);
      settle = setTimeout(() => snapNearest(self), 130);
    },
  });

  function snapNearest(self) {
    // never yank at the two ends — that is how you leave the section
    if (self.progress <= 0.004 || self.progress >= 0.996) return;
    const target = Math.round(self.progress * (N - 1)) / (N - 1);
    if (Math.abs(target - self.progress) < 0.003) return;
    const y = self.start + target * (self.end - self.start);
    snapping = true;
    if (lenis) {
      lenis.scrollTo(y, { duration: 0.55, easing: (t) => 1 - Math.pow(1 - t, 3) });
    } else {
      scrollTo({ top: y, behavior: 'smooth' });
    }
    setTimeout(() => { snapping = false; }, 650);
  }

  paint(0);
  addEventListener('resize', () => paint(progress), { passive: true });

  // ---- the ladder ----
  // A rung maps to a scroll position, not to a slide index we hold separately.
  function scrollToIndex(i) {
    const rect = section.getBoundingClientRect();
    const top = rect.top + scrollY;
    const range = section.offsetHeight - innerHeight;
    const y = top + (range * i) / Math.max(1, N - 1);
    if (lenis && !lenis.isStopped) lenis.scrollTo(y, { duration: 0.9 });
    else scrollTo({ top: y, behavior: 'smooth' });
  }

  let intent = 0;
  rungs.forEach((r, i) => {
    r.addEventListener('pointerenter', () => {
      clearTimeout(intent);
      intent = setTimeout(() => scrollToIndex(i), HOVER_INTENT);
    });
    r.addEventListener('pointerleave', () => clearTimeout(intent));
    r.addEventListener('click', () => { clearTimeout(intent); scrollToIndex(i); });
    r.addEventListener('focus', () => scrollToIndex(i));
  });
}
