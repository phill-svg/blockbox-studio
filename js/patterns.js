/* patterns.js — generates seamless pattern tiles and gradients on the fly.
   Each returns an HTMLCanvasElement (a tile) or a descriptor the app turns
   into a Fabric fill. No images, no network — pure canvas drawing. */
window.RCS = window.RCS || {};

RCS.Patterns = (function () {
  function tile(size, draw) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    draw(x, size);
    return c;
  }

  const makers = {
    stripes: (a, b) => tile(40, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.fillStyle = b; x.fillRect(0, 0, s / 2, s);
    }),
    diagonal: (a, b) => tile(40, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.strokeStyle = b; x.lineWidth = s / 3.5; x.beginPath();
      x.moveTo(-s, s); x.lineTo(s, -s); x.moveTo(0, 2 * s); x.lineTo(2 * s, 0); x.stroke();
    }),
    dots: (a, b) => tile(44, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.fillStyle = b;
      [[s * 0.25, s * 0.25], [s * 0.75, s * 0.75]].forEach(p => {
        x.beginPath(); x.arc(p[0], p[1], s * 0.14, 0, 7); x.fill();
      });
    }),
    checker: (a, b) => tile(40, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.fillStyle = b; x.fillRect(0, 0, s / 2, s / 2); x.fillRect(s / 2, s / 2, s / 2, s / 2);
    }),
    hearts: (a, b) => tile(48, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.fillStyle = b; heart(x, s / 2, s * 0.55, s * 0.30);
    }),
    stars: (a, b) => tile(48, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.fillStyle = b; star(x, s / 2, s / 2, 5, s * 0.22, s * 0.10);
    }),
    camo: (a, b, c) => tile(64, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      blob(x, b, [[12, 14, 12], [44, 20, 10], [30, 46, 14]]);
      blob(x, c, [[50, 50, 9], [8, 44, 8], [40, 8, 7]]);
    }),
    zigzag: (a, b) => tile(48, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.strokeStyle = b; x.lineWidth = s * 0.14; x.lineJoin = 'round'; x.beginPath();
      for (let i = -1; i < 3; i++) { const o = i * s; x.moveTo(o, s * 0.7); x.lineTo(o + s / 2, s * 0.3); x.lineTo(o + s, s * 0.7); }
      x.stroke();
    }),
    grid: (a, b) => tile(40, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.strokeStyle = b; x.lineWidth = s * 0.1;
      x.beginPath(); x.moveTo(s / 2, 0); x.lineTo(s / 2, s); x.moveTo(0, s / 2); x.lineTo(s, s / 2); x.stroke();
    }),
    waves: (a, b) => tile(48, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.strokeStyle = b; x.lineWidth = s * 0.12; x.lineCap = 'round';
      for (let o = -1; o < 2; o++) {
        x.beginPath(); x.moveTo(0, s * 0.5 + o * s);
        x.quadraticCurveTo(s * 0.25, s * 0.3 + o * s, s * 0.5, s * 0.5 + o * s);
        x.quadraticCurveTo(s * 0.75, s * 0.7 + o * s, s, s * 0.5 + o * s); x.stroke();
      }
    }),
    scales: (a, b) => tile(44, (x, s) => {
      x.fillStyle = a; x.fillRect(0, 0, s, s);
      x.strokeStyle = b; x.lineWidth = s * 0.1;
      for (let yy = 0; yy <= s; yy += s / 2) for (let xx = 0; xx <= s; xx += s / 2) { x.beginPath(); x.arc(xx, yy, s * 0.28, 0, Math.PI); x.stroke(); }
    })
  };

  function heart(x, cx, cy, r) {
    x.beginPath();
    x.moveTo(cx, cy + r * 0.3);
    x.bezierCurveTo(cx + r, cy - r * 0.6, cx + r * 0.5, cy - r * 1.1, cx, cy - r * 0.4);
    x.bezierCurveTo(cx - r * 0.5, cy - r * 1.1, cx - r, cy - r * 0.6, cx, cy + r * 0.3);
    x.fill();
  }
  function star(x, cx, cy, pts, outer, inner) {
    x.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 ? inner : outer, a = (i * Math.PI) / pts - Math.PI / 2;
      x[i ? 'lineTo' : 'moveTo'](cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
    x.closePath(); x.fill();
  }
  function blob(x, color, list) {
    x.fillStyle = color;
    list.forEach(b => { x.beginPath(); x.arc(b[0], b[1], b[2], 0, 7); x.fill(); });
  }

  /* Catalog shown in the UI. c1/c2 recolour with the active palette. */
  const catalog = [
    { id: 'stripes',  name: 'Stripes',  fn: 'stripes' },
    { id: 'diagonal', name: 'Slants',   fn: 'diagonal' },
    { id: 'dots',     name: 'Dots',     fn: 'dots' },
    { id: 'checker',  name: 'Checker',  fn: 'checker' },
    { id: 'zigzag',   name: 'Zigzag',   fn: 'zigzag' },
    { id: 'hearts',   name: 'Hearts',   fn: 'hearts' },
    { id: 'stars',    name: 'Stars',    fn: 'stars' },
    { id: 'camo',     name: 'Camo',     fn: 'camo' },
    { id: 'grid',     name: 'Grid',     fn: 'grid' },
    { id: 'waves',    name: 'Waves',    fn: 'waves' },
    { id: 'scales',   name: 'Scales',   fn: 'scales' }
  ];

  function build(id, c1, c2, c3) {
    const item = catalog.find(p => p.id === id);
    if (!item) return null;
    return makers[item.fn](c1, c2, c3 || c2);
  }

  return { catalog, build, tile };
})();
