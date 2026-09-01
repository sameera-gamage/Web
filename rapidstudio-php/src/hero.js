/*
  The hero: the loader, then the scrubbed film.

  Lifted verbatim out of the page it used to live in, so the behaviour is the
  one that was tested rather than a retelling of it. The only change is that the
  pieces it needs are handed in rather than reached for.
*/
export function mountHero({ gsap, ScrollTrigger, createHeroVideo, reduced }) {
  /* ---- loader ----
     A real read, not a fake timer: fonts, then how much of the hero clip has
     actually arrived. It clears when the footage can be scrubbed, and it has
     a hard ceiling so a stalled network can never lock anyone out. */
  const boot = document.getElementById('boot');
  function runBoot(vid, onClear) {
    if (!boot) { onClear && onClear(); return () => {}; }
    const fill = document.getElementById('boot-fill');
    const pct = document.getElementById('boot-pct');
    const what = document.getElementById('boot-what');
    let shown = 0, done = false, raf = 0;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      fill.style.setProperty('--fill', '100%');
      pct.textContent = '100';
      what.textContent = 'ready';
      setTimeout(() => {
        boot.classList.add('is-done');
        document.body.style.overflow = '';
        // the entrance runs WITH the curtain, not after it, so the camera is
        // already moving by the time anyone can see it
        onClear && onClear();
        setTimeout(() => { boot.hidden = true; }, 750);
      }, 260);
    };

    const real = () => {
      let v = 0.12;
      if (document.fonts && document.fonts.status === 'loaded') v += 0.18;
      if (vid) {
        if (vid.readyState >= 1) v += 0.12;
        try {
          if (vid.buffered.length && vid.duration) {
            v += 0.58 * Math.min(1, vid.buffered.end(vid.buffered.length - 1) / vid.duration);
          }
        } catch {}
      }
      return Math.min(1, v);
    };

    const tick = () => {
      // ease toward the true figure so the number never jumps or stalls dead
      shown += (real() - shown) * 0.06;
      const n = Math.min(99, Math.round(shown * 100));
      fill.style.setProperty('--fill', `${n}%`);
      pct.textContent = String(n);
      if (!done) raf = requestAnimationFrame(tick);
    };

    document.body.style.overflow = 'hidden';
    scrollTo(0, 0);
    raf = requestAnimationFrame(tick);
    // canplaythrough is the honest signal that scrubbing will not stutter
    if (vid) vid.addEventListener('canplaythrough', finish, { once: true });
    setTimeout(finish, 7000);
    return finish;
  }

  /* ---- the camera rig ---- */
  const video = document.getElementById('cam');
  if (video) {
    const heroA = document.getElementById('hero-a');
    const heroM = document.getElementById('hero-m');
    const heroB = document.getElementById('hero-b');
    const scrim = document.getElementById('hero-scrim');
    const cue = document.getElementById('scroll-cue');
    const span = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
    const ease = (a, b, x) => { const u = span(a, b, x); return u * u * (3 - 2 * u); };

    // One source of truth. The scroll progress drives the footage AND every
    // overlay, so the copy can never drift out of step with the picture.
    //
    // Where the beats fall in the clip:
    //   0.00 - 0.50  the body turns, bringing the lens round to face us
    //   0.50 - 0.62  square on, the iris still closed
    //   0.62 - 1.00  the blades retract and the aperture opens
    const smoke = document.getElementById('hero-smoke');
    const bedEl = document.getElementById('hero-bed');
    const matEl = document.getElementById('hero-mat');
    const well = document.getElementById('hero-well');
    const frame = document.getElementById('hero-frame');

    const set = (el, prop, v, key) => { if (state[key] !== v) { el.style[prop] = v; state[key] = v; } };
    const state = {};

    function paintCopy(v) {
      const a = 1 - ease(0.06, 0.30, v);   // opening copy leaves as the turn starts
      const m = ease(0.32, 0.44, v) * (1 - ease(0.58, 0.68, v));  // trades, over the turn
      const b = ease(0.70, 0.85, v) * (1 - ease(0.86, 0.92, v));  // lands on the open iris, gone before the hole opens
      const c = 1 - span(0, 0.08, v);      // scroll cue
      const s = 1 - 0.75 * ease(0.10, 0.45, v);  // scrim lifts off the footage
      const sm = 1 - ease(0.05, 0.26, v);  // smoke retires once the plate moves

      // The tail, in order: we accelerate into the glass, the barrel goes
      // dark around us, and then the far end opens from the middle and the
      // work is on the other side of it.
      const dive = ease(0.78, 0.97, v);
      const k = 1 + 6.2 * dive * dive;
      const w = ease(0.84, 0.93, v) * (1 - 0.35 * ease(0.94, 1, v));  // inside the barrel
      const open = ease(0.84, 0.95, v);    // card -> full bleed
      const rev = ease(0.90, 1, v);        // the aperture opens onto the next section
      // ink behind the card while the barrel goes dark, then cleared as the
      // aperture opens so the work section shows the live particle field
      // through the hole rather than a flat black plate
      const bed = ease(0.76, 0.88, v) * (1 - ease(0.93, 1, v));

      set(heroA, 'opacity', a, 'a');
      set(heroA, 'transform', `translateY(${((1 - a) * -40).toFixed(1)}px)`, 'at');
      set(heroM, 'opacity', m, 'm');
      set(heroM, 'transform', `translateY(${((1 - m) * 18).toFixed(1)}px)`, 'mt');
      set(heroB, 'opacity', b, 'b');
      set(heroB, 'transform', `translateY(${((1 - b) * 30).toFixed(1)}px)`, 'bt');
      set(cue, 'opacity', c, 'c');
      set(scrim, 'opacity', s, 's');
      set(smoke, 'opacity', sm, 'sm');
      set(well, 'opacity', w, 'w');
      set(bedEl, 'opacity', bed, 'bed');
      set(matEl, 'opacity', 1 - open, 'mat');

      if (state.k !== k) { rig.push(k); state.k = k; }
      if (state.sm2 !== sm) { rig.setFloat(sm); state.sm2 = sm; }

      // The reveal. A hole is punched in the card at the lens centre and grown
      // until it clears the corners; the work section sits directly behind, so
      // what comes through the hole IS the next section rather than a picture
      // of it. The mask is only attached while it is doing something — a mask
      // forces its own compositing pass, and there is no reason to pay for it
      // through the other 90% of the scroll.
      if (state.r !== rev) {
        if (rev <= 0.0001) {
          set(frame, 'webkitMaskImage', '', 'mk');
          set(frame, 'maskImage', '', 'mk2');
        } else {
          const R = (rev * rev * 0.55 + rev * 0.45) * HOLE;   // slow open, then away
          const soft = Math.max(2, R * 0.10);
          const g = `radial-gradient(circle at var(--lens-x) var(--lens-y),` +
                    ` transparent 0 ${(R - soft).toFixed(1)}px, #000 ${R.toFixed(1)}px)`;
          set(frame, 'webkitMaskImage', g, 'mk');
          set(frame, 'maskImage', g, 'mk2');
        }
        state.r = rev;
      }
      if (state.o !== open) {
        // Growing the card by scale rather than by shrinking its margins: the
        // margins would relayout the video — and so re-derive its object-fit
        // crop — on every scroll frame. The card is inset by the same amount
        // on all four sides, so scaling from the centre by exactly
        // viewport/(viewport - 2*inset) lands its edges on the viewport edges.
        set(frame, 'transform', `translateZ(0) scale(${(1 + (SX - 1) * open).toFixed(4)}, ${(1 + (SY - 1) * open).toFixed(4)})`, 'ft');
        set(frame, 'borderRadius', `${(BASE_RADIUS * (1 - open)).toFixed(1)}px`, 'fr');
        state.o = open;
      }
    }
    const readPx = (n) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n)) || 0;
    let BASE_INSET = 12, BASE_RADIUS = 26, SX = 1, SY = 1, HOLE = 1200;
    function measureFrame() {
      BASE_INSET = readPx('--hero-inset') || 12;
      BASE_RADIUS = readPx('--hero-radius') || 26;
      SX = innerWidth / Math.max(1, innerWidth - BASE_INSET * 2);
      SY = innerHeight / Math.max(1, innerHeight - BASE_INSET * 2);
      // far enough that the hole has cleared the furthest corner from the lens
      HOLE = Math.hypot(innerWidth, innerHeight) * 1.05;
    }
    measureFrame();

    const rig = createHeroVideo(video);

    if (reduced) {
      // no pin, no scrub, no drift: the poster frame is the hero and the copy sits
      heroA.style.opacity = 1;
      heroB.style.opacity = 0;
      scrim.style.opacity = 1;
      smoke.style.opacity = 0;
      bedEl.style.opacity = 0;
      matEl.style.opacity = 0;
      runBoot(null, null)();    // nothing to wait for, so do not make anyone wait
    } else {
      let progress = 0;
      const bootDone = runBoot(video, () => {
        rig.intro();
        gsap.from('.ln', { yPercent: 115, duration: 1.15, ease: 'expo.out', stagger: 0.09 });
      });
      rig.start();
      // if the clip cannot be fetched at all, the page must still open
      video.addEventListener('error', () => bootDone(), { once: true });
      ScrollTrigger.create({
        trigger: '#top',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => { progress = self.progress; rig.seek(progress); paintCopy(progress); },
      });
      paintCopy(0);
      // the full-bleed scale is derived from the viewport, so it has to be
      // re-derived when the viewport changes — and repainted where we stand
      addEventListener('resize', () => { measureFrame(); state.o = -1; paintCopy(progress); });
    }
  }
}
