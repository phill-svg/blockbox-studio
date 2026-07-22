/* export.js — composites the panel snapshots into a real Roblox template image.
   Output is exactly 585x559 for shirts/pants, or 512x512 for t-shirts. */
window.RCS = window.RCS || {};

RCS.Export = (function () {
  function newCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  /* Build the final upload-ready canvas. snaps = { front, back, arms } (or
     { graphic } for a t-shirt), each an HTMLCanvasElement. */
  function build(state) {
    const snaps = state.snaps;
    if (state.garment === 'tshirt') {
      const s = RCS.TSHIRT.size;
      const c = newCanvas(s, s), x = c.getContext('2d');
      x.fillStyle = state.baseColor; x.fillRect(0, 0, s, s);
      if (snaps.graphic) x.drawImage(snaps.graphic, 0, 0, s, s);
      return c;
    }

    const T = RCS.TEMPLATE;
    const c = newCanvas(T.width, T.height), x = c.getContext('2d');
    // Base colour fills every face (sides, top, bottom inherit it).
    x.fillStyle = state.baseColor;
    x.fillRect(0, 0, T.width, T.height);
    // Paint each panel onto its template faces.
    Object.keys(RCS.PANELS).forEach(panel => {
      const snap = snaps[panel];
      if (!snap) return;
      RCS.PANELS[panel].faces.forEach(faceName => {
        const f = RCS.FACES[faceName];
        x.drawImage(snap, 0, 0, snap.width, snap.height, f.x, f.y, f.w, f.h);
      });
    });
    return c;
  }

  function download(canvas, filename) {
    const a = document.createElement('a');
    a.download = filename || 'roblox-clothing.png';
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return { build, download };
})();
