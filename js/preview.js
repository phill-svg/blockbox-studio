/* preview.js — a friendly blocky avatar that wears the current design.
   Deliberately isolated: a 3D (Three.js) preview can replace draw() later
   without touching the rest of the app. */
window.RCS = window.RCS || {};

RCS.Preview = (function () {
  function roundRect(x, r, X, Y, W, H) {
    x.beginPath();
    x.moveTo(X + r, Y);
    x.arcTo(X + W, Y, X + W, Y + H, r);
    x.arcTo(X + W, Y + H, X, Y + H, r);
    x.arcTo(X, Y + H, X, Y, r);
    x.arcTo(X, Y, X + W, Y, r);
    x.closePath();
  }

  function paint(x, snap, base, X, Y, W, H, r) {
    x.save();
    roundRect(x, r, X, Y, W, H); x.clip();
    x.fillStyle = base; x.fillRect(X, Y, W, H);
    if (snap) x.drawImage(snap, X, Y, W, H);
    x.restore();
    x.lineWidth = 3; x.strokeStyle = 'rgba(35,42,69,.15)';
    roundRect(x, r, X, Y, W, H); x.stroke();
  }

  function draw(canvas, state) {
    const x = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    x.clearRect(0, 0, W, H);

    const base = state.baseColor;
    const back = state.previewSide === 'back';
    const torsoSnap = back ? state.snaps.back : state.snaps.front;
    const armSnap = state.snaps.arms;
    const isPants = state.garment === 'pants';
    const isTee = state.garment === 'tshirt';

    // Layout of the little mannequin.
    const cx = W / 2;
    const headR = W * 0.11;
    const torsoW = W * 0.30, torsoH = H * 0.26;
    const torsoX = cx - torsoW / 2, torsoY = H * 0.20;
    const armW = W * 0.10, armH = torsoH * 0.95;
    const legW = torsoW * 0.42, legH = H * 0.28;

    // Head
    x.save();
    roundRect(x, headR * 0.5, cx - headR, torsoY - headR * 2.1, headR * 2, headR * 2);
    x.fillStyle = '#FFE0A3'; x.fill();
    x.lineWidth = 3; x.strokeStyle = 'rgba(35,42,69,.2)'; x.stroke();
    x.restore();
    if (!back) {
      x.fillStyle = '#232A45';
      const ey = torsoY - headR * 1.35;
      x.beginPath(); x.arc(cx - headR * 0.45, ey, headR * 0.16, 0, 7); x.fill();
      x.beginPath(); x.arc(cx + headR * 0.45, ey, headR * 0.16, 0, 7); x.fill();
      x.strokeStyle = '#232A45'; x.lineWidth = 3; x.lineCap = 'round';
      x.beginPath(); x.arc(cx, ey + headR * 0.25, headR * 0.5, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
    }

    // Arms (shirt/tee only wear sleeves; pants leave arms bare)
    const armSnapUse = isPants ? null : armSnap;
    const armBase = isPants ? '#FFE0A3' : base;
    paint(x, armSnapUse, armBase, torsoX - armW - 6, torsoY + 4, armW, armH, 8);
    paint(x, armSnapUse, armBase, torsoX + torsoW + 6, torsoY + 4, armW, armH, 8);

    // Torso
    if (isTee) {
      // plain torso with the graphic on the chest
      paint(x, null, base, torsoX, torsoY, torsoW, torsoH, 10);
      if (state.snaps.graphic) {
        const g = state.snaps.graphic, gs = torsoW * 0.62;
        x.drawImage(g, cx - gs / 2, torsoY + torsoH * 0.22, gs, gs);
      }
    } else {
      paint(x, torsoSnap, base, torsoX, torsoY, torsoW, torsoH, 10);
    }

    // Legs / hips
    const legY = torsoY + torsoH + 4;
    const legBase = isPants ? base : '#5B6473';
    const legSnap = isPants ? armSnap : null;
    paint(x, legSnap, legBase, cx - legW - 3, legY, legW, legH, 8);
    paint(x, legSnap, legBase, cx + 3, legY, legW, legH, 8);
  }

  return { draw };
})();
