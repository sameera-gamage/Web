/*
  Camera rig on a 2D canvas.
  Four beats, driven by one scroll progress value 0..1:
    0.00 - 0.22  camera sits at a three-quarter angle, breathing
    0.22 - 0.48  it swings round to face you
    0.48 - 0.74  push in until the lens fills the frame
    0.74 - 1.00  aperture opens, the frame behind it lands
*/

const BLADES = 9;

// Perspective projection of a point on the camera's own plane.
// yaw is radians; z is depth out of the body (positive = toward viewer).
function project(x, y, z, yaw, dist) {
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  const rx = x * cos + z * sin;
  const rz = z * cos - x * sin;
  const k = dist / (dist + rz);
  return [rx * k, y * k, k];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Quad from four projected points, used for every slab of the body.
function quad(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function createCamera(canvas, opts = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const photo = opts.photo || null;
  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // ---- the aperture ----
  function drawIris(cx, cy, R, open, rot) {
    // opening radius: closed is a pinhole, open clears the barrel
    const r = R * (0.045 + 0.955 * open);

    // what sits behind the blades
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    if (photo && photo.complete && photo.naturalWidth) {
      const s = Math.max((R * 2) / photo.naturalWidth, (R * 2) / photo.naturalHeight) * 1.25;
      const pw = photo.naturalWidth * s, ph = photo.naturalHeight * s;
      ctx.globalAlpha = Math.min(1, open * 1.5);
      ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
      ctx.globalAlpha = 1;
    }
    // light spilling through the hole
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(2, r * 1.5));
    glow.addColorStop(0, `rgba(255,246,224,${0.8 - 0.5 * open})`);
    glow.addColorStop(0.4, `rgba(233,162,39,${0.6 - 0.35 * open})`);
    glow.addColorStop(1, 'rgba(214,70,31,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.restore();

    // blades: a ring with an N-gon punched out (even-odd)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    const pts = [];
    for (let i = 0; i < BLADES; i++) {
      const a = rot + (i * 2 * Math.PI) / BLADES;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < BLADES; i++) {
      const nxt = pts[(i + 1) % BLADES];
      const mid = rot + ((i + 0.5) * 2 * Math.PI) / BLADES;
      const cr = r * 0.9;
      ctx.quadraticCurveTo(cx + cr * Math.cos(mid), cy + cr * Math.sin(mid), nxt[0], nxt[1]);
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, '#3a3530');
    g.addColorStop(0.5, '#1d1a17');
    g.addColorStop(1, '#0c0a09');
    ctx.fillStyle = g;
    ctx.fill('evenodd');

    // blade seams
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < BLADES; i++) {
      const a = rot + (i * 2 * Math.PI) / BLADES;
      ctx.beginPath();
      ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- the whole rig for one frame ----
  function render(p, t) {
    ctx.clearRect(0, 0, W, H);
    if (!W) return;

    const ease = (a, b, x) => {
      const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return u * u * (3 - 2 * u);
    };

    const turn  = ease(0.20, 0.48, p);   // three-quarter -> face on
    const push  = ease(0.48, 0.80, p);   // dolly in
    const open  = ease(0.72, 0.97, p);   // aperture
    const yaw   = (-0.62) * (1 - turn);
    const breathe = Math.sin(t / 1400) * 0.012 * (1 - turn);

    // narrow screens have no room beside the copy, so the rig drops below it
    // and only climbs back to centre once the push takes over the frame
    const narrow = W < 820;
    const base = narrow
      ? Math.min(W / 760, H / 1180)
      : Math.min(W / 1180, H / 780);
    const scale = base * (1 + (narrow ? 9.5 : 7.2) * push);
    const cx = narrow
      ? W * (0.5 + 0.06 * (1 - push))
      : W / 2 + (1 - push) * W * 0.14;
    const cy = narrow
      ? H * (0.72 - 0.22 * push)
      : H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.rotate(breathe);

    const dist = 1500;
    const P = (x, y, z) => project(x, y, z, yaw + breathe, dist);

    const bodyAlpha = 1 - ease(0.60, 0.78, p);   // body dissolves as we enter the glass
    const BW = 470, BH = 300, BD = 96;           // half-width, half-height, depth

    // ---------- body ----------
    if (bodyAlpha > 0.01) {
      ctx.globalAlpha = bodyAlpha;

      // right side slab (only reads while angled)
      const sideShow = Math.max(0, -Math.sin(yaw));
      if (sideShow > 0.01) {
        quad(ctx, [P(BW, -BH, 0), P(BW, -BH, -BD), P(BW, BH, -BD), P(BW, BH, 0)], '#1a1613');
      }

      // top plate
      quad(ctx, [P(-BW, -BH, 0), P(BW, -BH, 0), P(BW, -BH, -BD), P(-BW, -BH, -BD)], '#4a423b');

      // viewfinder hump
      const hw = 105, hh = 62;
      quad(ctx, [P(-hw, -BH, 0), P(hw, -BH, 0), P(hw, -BH - hh, -BD * .5), P(-hw, -BH - hh, -BD * .5)], '#544a42');
      quad(ctx, [P(-hw, -BH - hh, -BD * .5), P(hw, -BH - hh, -BD * .5), P(hw, -BH - hh, -BD), P(-hw, -BH - hh, -BD)], '#332c27');

      // front face
      const f = [P(-BW, -BH, 0), P(BW, -BH, 0), P(BW, BH, 0), P(-BW, BH, 0)];
      const bg = ctx.createLinearGradient(f[0][0], f[0][1], f[2][0], f[2][1]);
      bg.addColorStop(0, '#585049');
      bg.addColorStop(0.45, '#3b3530');
      bg.addColorStop(1, '#241f1c');
      quad(ctx, f, bg);

      // grip, hand side
      const gx0 = BW - 150;
      quad(ctx, [P(gx0, -BH + 26, 2), P(BW - 12, -BH + 26, 2), P(BW - 12, BH - 26, 2), P(gx0, BH - 26, 2)], '#2b2521');

      // leatherette panel, left of the barrel
      quad(ctx, [P(-BW + 24, -BH + 34, 2), P(-BW + 210, -BH + 34, 2), P(-BW + 210, BH - 34, 2), P(-BW + 24, BH - 34, 2)], '#211c19');

      // mode dial and shutter release on the top plate
      const dial = P(-300, -BH - 22, -BD * .45);
      ctx.beginPath();
      ctx.ellipse(dial[0], dial[1], 46 * dial[2], 17 * dial[2], 0, 0, Math.PI * 2);
      ctx.fillStyle = '#6b6058';
      ctx.fill();
      const rel = P(300, -BH - 16, -BD * .45);
      ctx.beginPath();
      ctx.ellipse(rel[0], rel[1], 30 * rel[2], 12 * rel[2], 0, 0, Math.PI * 2);
      ctx.fillStyle = '#d6461f';
      ctx.fill();

      // hot-shoe
      const shoe = P(0, -BH - hh - 6, -BD * .5);
      ctx.beginPath();
      ctx.ellipse(shoe[0], shoe[1], 52 * shoe[2], 10 * shoe[2], 0, 0, Math.PI * 2);
      ctx.fillStyle = '#100e0c';
      ctx.fill();

      // engraved wordmark
      const wm = P(-BW + 250, -BH + 78, 3);
      ctx.globalAlpha = bodyAlpha * 0.5;
      ctx.fillStyle = '#cbbfae';
      ctx.font = `600 ${26 * wm[2]}px "DM Mono", monospace`;
      ctx.fillText('RAPIDSTUDIO', wm[0], wm[1]);
      ctx.globalAlpha = bodyAlpha;
    }

    // ---------- barrel + glass ----------
    // barrel centre sits on the body's front face, so the push lands on it
    const c = P(0, 0, 0);
    const bx = c[0], by = c[1];
    // foreshorten the barrel across the turn
    const squash = Math.cos(yaw + breathe);
    const R = 188 * c[2];

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(Math.max(0.08, Math.abs(squash)), 1);

    if (bodyAlpha > 0.01) {
      ctx.globalAlpha = bodyAlpha;
      // barrel rings, outermost first
      const rings = [[1.34, '#14100e'], [1.22, '#4a423b'], [1.13, '#1b1714'], [1.05, '#3d3630']];
      for (const [k, col] of rings) {
        ctx.beginPath();
        ctx.arc(0, 0, R * k, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }
      // knurled focus ring
      ctx.strokeStyle = 'rgba(190,178,160,.28)';
      ctx.lineWidth = Math.max(1, R * 0.012);
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * R * 1.21, Math.sin(a) * R * 1.21);
        ctx.lineTo(Math.cos(a) * R * 1.29, Math.sin(a) * R * 1.29);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // glass well
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = '#070605';
    ctx.fill();

    drawIris(0, 0, R, open, 0.22 + 0.5 * open);

    // coating sheen across the glass, dies off as it opens
    const sheen = ctx.createLinearGradient(-R, -R, R * 0.5, R);
    sheen.addColorStop(0, `rgba(143,184,201,${0.14 * (1 - open)})`);
    sheen.addColorStop(0.45, 'rgba(143,184,201,0)');
    sheen.addColorStop(0.75, `rgba(214,70,31,${0.08 * (1 - open)})`);
    sheen.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = sheen;
    ctx.fill();

    // inner lip
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.995, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.09)';
    ctx.lineWidth = Math.max(1, R * 0.02);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  resize();
  return { render, resize, get size() { return { W, H }; } };
}
