export function mountParticles(reduced) {
  if (reduced) return;

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '-1',
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w, h;

  function resize() {
    w = innerWidth;
    h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  const COUNT = Math.min(150, Math.round((w * h) / 9500));
  const LINK = 150;
  const MOUSE_R = 260;
  const particles = [];

  let mx = -9999, my = -9999;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -9999; });

  for (let i = 0; i < COUNT; i++) {
    const accent = Math.random() > 0.55;
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: accent ? Math.random() * 1.2 + 1 : Math.random() * 0.8 + 0.5,
      accent,
      wander: Math.random() * Math.PI * 2,
      wanderSpeed: Math.random() * 0.003 + 0.001,
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.wander += p.wanderSpeed;
      p.vx += Math.cos(p.wander) * 0.008;
      p.vy += Math.sin(p.wander) * 0.008;

      const dx = mx - p.x, dy = my - p.y;
      const md = Math.sqrt(dx * dx + dy * dy);
      if (md < MOUSE_R && md > 1) {
        // stronger, so the field visibly gathers toward the cursor
        const pull = 1 - md / MOUSE_R;
        const f = 0.09 * pull * pull;
        p.vx += (dx / md) * f;
        p.vy += (dy / md) * f;
      }

      p.vx *= 0.94;
      p.vy *= 0.94;

      // keep them graceful even under a strong pull
      const sp = Math.hypot(p.vx, p.vy), MAX = 3.2;
      if (sp > MAX) { p.vx = (p.vx / sp) * MAX; p.vy = (p.vy / sp) * MAX; }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          const alpha = (1 - Math.sqrt(d) / LINK) * 0.11;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,90,31,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.accent
        ? 'rgba(255,90,31,0.55)'
        : 'rgba(255,255,255,0.18)';
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }
  frame();
}
