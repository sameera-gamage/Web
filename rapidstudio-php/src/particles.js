/*
  The constellation field.

  mountParticles → one fixed, full-viewport field behind the whole page.
  mountField     → the same engine scoped to a single element (used for the
                   gate, where a fixed field is hidden behind the hero's ink
                   backdrop). Both react to the cursor.
*/

function engine(canvas, measure, reduced) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 1, h = 1, ox = 0, oy = 0;

  function resize() {
    const m = measure();
    w = m.w; h = m.h; ox = m.ox; oy = m.oy;
    canvas.width = Math.max(1, w * dpr);
    canvas.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });
  addEventListener('scroll', () => { const m = measure(); ox = m.ox; oy = m.oy; }, { passive: true });

  const COUNT = Math.min(210, Math.max(40, Math.round((w * h) / 7000)));
  const LINK = 138, MOUSE_R = 300;
  const particles = [];

  let mx = -9999, my = -9999, lmx = -9999, lmy = -9999;
  addEventListener('pointermove', (e) => { mx = e.clientX - ox; my = e.clientY - oy; }, { passive: true });
  addEventListener('pointerleave', () => { mx = my = -9999; });

  for (let i = 0; i < COUNT; i++) {
    const accent = Math.random() > 0.55;
    const x = Math.random() * w, y = Math.random() * h;
    particles.push({
      x, y, hx: x, hy: y,            // home, so the field settles back like water
      vx: 0, vy: 0,
      r: accent ? Math.random() * 1.2 + 1 : Math.random() * 0.8 + 0.5,
      accent,
      drift: Math.random() * Math.PI * 2,
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    // cursor velocity — a fast stroke displaces more water than a slow one
    const mvx = (mx > -9000 && lmx > -9000) ? mx - lmx : 0;
    const mvy = (my > -9000 && lmy > -9000) ? my - lmy : 0;
    const speed = Math.min(60, Math.hypot(mvx, mvy));
    lmx = mx; lmy = my;

    for (const p of particles) {
      // a whisper of idle drift so the surface is never dead still
      p.drift += 0.01;
      p.vx += Math.cos(p.drift) * 0.01;
      p.vy += Math.sin(p.drift) * 0.01;

      // push AWAY from the cursor (displace), harder the faster it moves,
      // and carry a little along the stroke — the wake
      const dx = p.x - mx, dy = p.y - my;
      const md = Math.hypot(dx, dy);
      if (md < MOUSE_R && md > 0.01) {
        const f = 1 - md / MOUSE_R;
        const push = f * f * (0.5 + speed * 0.14);
        p.vx += (dx / md) * push;
        p.vy += (dy / md) * push;
        p.vx += mvx * f * 0.05;
        p.vy += mvy * f * 0.05;
      }

      // spring home so the ripples calm down
      p.vx += (p.hx - p.x) * 0.012;
      p.vy += (p.hy - p.y) * 0.012;

      p.vx *= 0.86; p.vy *= 0.86;   // viscosity
      const sp = Math.hypot(p.vx, p.vy), MAX = 6;
      if (sp > MAX) { p.vx = (p.vx / sp) * MAX; p.vy = (p.vy / sp) * MAX; }
      p.x += p.vx; p.y += p.vy;
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          const alpha = (1 - Math.sqrt(d) / LINK) * 0.11;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,90,31,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.accent ? 'rgba(255,90,31,0.55)' : 'rgba(255,255,255,0.18)';
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
}

export function mountParticles(reduced) {
  if (reduced) return;
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '-1',
  });
  document.body.prepend(canvas);
  engine(canvas, () => ({ w: innerWidth, h: innerHeight, ox: 0, oy: 0 }), reduced);
}

export function mountField(el, reduced) {
  if (reduced || !el) return;
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '0',
  });
  el.prepend(canvas);
  engine(canvas, () => {
    const r = el.getBoundingClientRect();
    return { w: el.clientWidth, h: el.clientHeight, ox: r.left, oy: r.top };
  }, reduced);
}
