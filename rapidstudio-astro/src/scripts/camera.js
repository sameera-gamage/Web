/*
  Hero rig, built on a real photograph rather than a drawn camera.

  Two plates of the SAME studio frame are cross-dissolved so the push stays
  sharp all the way in:
    cam-wide  the whole camera, 1180px
    cam-lens  a native-resolution crop centred on the lens

  Both carry the lens centre and glass radius as normalised constants, so the
  dissolve lands pixel-on-pixel and reads as one continuous move.

  Beats, driven by one scroll progress value 0..1:
    0.00 - 0.10  the frame sits, breathing
    0.10 - 0.62  dolly in, centred on the glass
    0.40 - 0.58  the native lens crop takes over the centre
    0.46 - 0.62  the glass darkens and the blades appear
    0.60 - 0.95  we pass through the front element
    0.64 - 0.93  the aperture opens and the work lands behind it
*/

const BLADES = 9;

// Where the lens lives in each plate: centre as a fraction of the plate, and a
// reference radius as a fraction of plate WIDTH.
//
// These are measured, not eyeballed: the barrel is rotationally symmetric, so
// the true centre is the one minimising angular variance, and the engraving
// shows up as angular high-frequency energy. That puts the lens centre at
// (666, 734) in the 2048x1152 source, with the smooth front element ending at
// r = 72 and the engraved band (since blurred out) at r = 75..190.
//
// The reference radius is the barrel's front face (r = 196), NOT the glass.
// The glass is only 144px across in the source, so sizing the rig to it would
// demand a 6x upscale to fill a viewport; the barrel face needs barely 2x, and
// an iris belongs at the barrel opening anyway.
const REF = 196;
const PLATES = {
  wide: { u: 666 / 2048, v: 734 / 1152, r: REF / 2048 },
  lens: { u: 0.5, v: 0.5, r: REF / 520 },
};

function ease(a, b, x) {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
}

function ready(img) {
  return img && img.complete && img.naturalWidth > 0;
}

export function createCamera(canvas, opts = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const photo = opts.photo || null;   // the work frame revealed through the iris
  const wide = opts.wide || null;
  const lens = opts.lens || null;
  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // Draw a plate so its reference circle lands at (cx, cy) on screen with radius R.
  function drawPlate(img, meta, cx, cy, R, alpha) {
    if (!ready(img) || alpha <= 0.001) return;
    const dw = R / meta.r;
    const dh = dw * (img.naturalHeight / img.naturalWidth);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, cx - meta.u * dw, cy - meta.v * dh, dw, dh);
    ctx.globalAlpha = 1;
  }

  // Where the lens sits, and how big its reference circle is, before any push.
  function restingGlass(img, meta) {
    if (!ready(img)) return { x: W / 2, y: H / 2, r: Math.min(W, H) * 0.12 };
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const pw = img.naturalWidth * s;
    const ph = img.naturalHeight * s;
    const px = (W - pw) / 2;
    const py = (H - ph) / 2;
    return { x: px + meta.u * pw, y: py + meta.v * ph, r: meta.r * pw };
  }

  // ---- the aperture ----
  function drawIris(cx, cy, R, open, rot, alpha) {
    const r = R * (0.045 + 0.955 * open);

    // what sits behind the blades
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    if (ready(photo)) {
      // Cover the VIEWPORT, not the iris circle. Once the aperture is wider
      // than the screen, sizing to the circle would magnify a 620px frame past
      // 4x; covering the viewport keeps it to what the frame can carry.
      const s = Math.max(W / photo.naturalWidth, H / photo.naturalHeight);
      const pw = photo.naturalWidth * s, ph = photo.naturalHeight * s;
      ctx.globalAlpha = Math.min(1, open * 1.5);
      ctx.drawImage(photo, W / 2 - pw / 2, H / 2 - ph / 2, pw, ph);
      // sit it back a little so the closing copy reads over it, and so the
      // softness of a blown-up frame reads as depth of field
      ctx.globalAlpha = Math.min(1, open) * 0.42;
      ctx.fillStyle = '#12100E';
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
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
    ctx.globalAlpha = alpha;
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
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---- one frame ----
  function render(p, t) {
    ctx.clearRect(0, 0, W, H);
    if (!W) return;

    const push = ease(0.10, 0.62, p);   // dolly in on the glass
    const swap = ease(0.40, 0.58, p);   // native lens crop takes over the centre
    const well = ease(0.46, 0.62, p);   // glass goes dark, blades fade in
    const fly  = ease(0.60, 0.95, p);   // we pass through the front element
    const open = ease(0.64, 0.93, p);   // aperture
    const fade = ease(0.62, 0.82, p);   // plate retires once we are inside

    // a slow float before the push takes hold
    const drift = Math.sin(t / 2600) * 0.004 * (1 - push);

    const rest = restingGlass(wide, PLATES.wide);

    // The plate only zooms as far as its own pixels allow — a hard 2x cap on
    // the dolly. Past that the iris keeps growing on its own, which is what
    // sells flying into the lens without ever magnifying the photograph
    // further than it can carry.
    const plateMax = rest.r * 2;
    const irisMax = Math.max(W, H) * 0.68;

    const Rplate = rest.r + (plateMax - rest.r) * push;
    const R = Rplate + (irisMax - plateMax) * fly;

    const cx = rest.x + (W / 2 - rest.x) * push + W * drift;
    const cy = rest.y + (H / 2 - rest.y) * push;

    // Both plates are the same frame. The crop is laid OVER the wide plate
    // rather than cross-faded against it: the crop only covers the middle, so
    // fading one out as the other comes in would show the crop's edge as a
    // rectangle. Stacked, the seam is invisible because the content matches.
    const plateA = 1 - fade;
    if (plateA > 0.001) {
      drawPlate(wide, PLATES.wide, cx, cy, Rplate, plateA);
      drawPlate(lens, PLATES.lens, cx, cy, Rplate, swap * plateA);
    }

    // scrim so the opening copy stays readable over the photograph;
    // it lifts as the copy goes and the push takes the frame
    const scrimA = 0.72 * (1 - ease(0.06, 0.34, p));
    if (scrimA > 0.001) {
      const sc = ctx.createLinearGradient(0, 0, W * 0.9, H * 0.4);
      sc.addColorStop(0, `rgba(18,16,14,${scrimA})`);
      sc.addColorStop(0.55, `rgba(18,16,14,${scrimA * 0.45})`);
      sc.addColorStop(1, 'rgba(18,16,14,0)');
      ctx.fillStyle = sc;
      ctx.fillRect(0, 0, W, H);
    }

    // Nothing is drawn over the lens until the push has arrived: at rest the
    // hero is simply the photograph.
    if (well <= 0.001) return;

    // the glass darkens down, so the blades read as the lens itself stopping
    // down rather than a disc pasted on top
    ctx.save();
    ctx.globalAlpha = well;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#070605';
    ctx.fill();
    ctx.restore();

    drawIris(cx, cy, R, open, 0.22 + 0.5 * open, well);

    // coating sheen, dies off as the aperture clears
    if (open < 0.999) {
      const sheen = ctx.createLinearGradient(cx - R, cy - R, cx + R * 0.5, cy + R);
      sheen.addColorStop(0, `rgba(143,184,201,${0.16 * (1 - open) * well})`);
      sheen.addColorStop(0.45, 'rgba(143,184,201,0)');
      sheen.addColorStop(0.75, `rgba(214,70,31,${0.1 * (1 - open) * well})`);
      sheen.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sheen;
      ctx.fill();
    }

    // inner lip
    ctx.globalAlpha = well;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.995, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.09)';
    ctx.lineWidth = Math.max(1, R * 0.02);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  resize();
  return { render, resize, get size() { return { W, H }; } };
}
