/* stickers.js — built-in sticker set as inline SVG (no network).
   Single-colour stickers use the __C__ placeholder so kids can recolour them.
   Multi-colour ones (rainbow, soccer) keep fixed colours. */
window.RCS = window.RCS || {};

RCS.Stickers = (function () {
  const S = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
  const p = (d) => `<path d="${d}" fill="__C__"/>`;

  const catalog = [
    { id: 'star',  name: 'Star',  recolor: true,  svg: S(p('M50 6 L62 38 L96 40 L70 61 L79 94 L50 74 L21 94 L30 61 L4 40 L38 38 Z')) },
    { id: 'heart', name: 'Heart', recolor: true,  svg: S(p('M50 86 C18 62 6 42 24 26 C37 15 50 24 50 36 C50 24 63 15 76 26 C94 42 82 62 50 86 Z')) },
    { id: 'crown', name: 'Crown', recolor: true,  svg: S(p('M14 78 L20 34 L37 54 L50 24 L63 54 L80 34 L86 78 Z')) },
    { id: 'bolt',  name: 'Bolt',  recolor: true,  svg: S(p('M58 4 L24 56 L46 56 L40 96 L78 40 L54 40 Z')) },
    { id: 'diamond', name: 'Gem', recolor: true,  svg: S(p('M50 6 L82 40 L50 94 L18 40 Z')) },
    { id: 'flower', name: 'Flower', recolor: true, svg: S(
        `<g fill="__C__">`+
        `<circle cx="50" cy="24" r="15"/><circle cx="76" cy="42" r="15"/><circle cx="66" cy="72" r="15"/>`+
        `<circle cx="34" cy="72" r="15"/><circle cx="24" cy="42" r="15"/></g>`+
        `<circle cx="50" cy="50" r="13" fill="#FFD23F"/>`) },
    { id: 'moon',  name: 'Moon',  recolor: true,  svg: S(p('M64 12 A40 40 0 1 0 64 88 A32 32 0 1 1 64 12 Z')) },
    { id: 'cloud', name: 'Cloud', recolor: true,  svg: S(
        `<g fill="__C__"><circle cx="34" cy="54" r="18"/><circle cx="56" cy="46" r="22"/>`+
        `<circle cx="72" cy="58" r="16"/><rect x="30" y="54" width="46" height="20" rx="10"/></g>`) },
    { id: 'paw',   name: 'Paw',   recolor: true,  svg: S(
        `<g fill="__C__"><ellipse cx="50" cy="64" rx="22" ry="18"/>`+
        `<circle cx="28" cy="40" r="9"/><circle cx="44" cy="30" r="9"/>`+
        `<circle cx="60" cy="30" r="9"/><circle cx="74" cy="42" r="9"/></g>`) },
    { id: 'note',  name: 'Music', recolor: true,  svg: S(
        `<g fill="__C__"><rect x="44" y="16" width="8" height="56"/><path d="M52 16 L80 24 L80 40 L52 32 Z"/>`+
        `<circle cx="36" cy="74" r="14"/></g>`) },
    { id: 'speech', name: 'Chat', recolor: true,  svg: S(p('M14 20 H86 A8 8 0 0 1 94 28 V64 A8 8 0 0 1 86 72 H40 L22 90 L24 72 H14 A8 8 0 0 1 6 64 V28 A8 8 0 0 1 14 20 Z')) },
    { id: 'smiley', name: 'Smiley', recolor: false, svg: S(
        `<circle cx="50" cy="50" r="44" fill="#FFD23F"/>`+
        `<circle cx="36" cy="42" r="7" fill="#232A45"/><circle cx="64" cy="42" r="7" fill="#232A45"/>`+
        `<path d="M30 60 Q50 82 70 60" stroke="#232A45" stroke-width="7" fill="none" stroke-linecap="round"/>`) },
    { id: 'rainbow', name: 'Rainbow', recolor: false, svg: S(
        `<g fill="none" stroke-width="9"><path d="M12 78 A38 38 0 0 1 88 78" stroke="#FF6B6B"/>`+
        `<path d="M22 78 A28 28 0 0 1 78 78" stroke="#FFC642"/>`+
        `<path d="M32 78 A18 18 0 0 1 68 78" stroke="#22C39A"/></g>`) },
    { id: 'soccer', name: 'Ball', recolor: false, svg: S(
        `<circle cx="50" cy="50" r="42" fill="#fff" stroke="#232A45" stroke-width="4"/>`+
        `<path d="M50 30 L64 40 L58 58 L42 58 L36 40 Z" fill="#232A45"/>`) },
    { id: 'circle', name: 'Dot', recolor: true,   svg: S(`<circle cx="50" cy="50" r="42" fill="__C__"/>`) },
    { id: 'triangle', name: 'Tri', recolor: true, svg: S(p('M50 10 L92 86 L8 86 Z')) },
    { id: 'square', name: 'Block', recolor: true, svg: S(`<rect x="12" y="12" width="76" height="76" rx="12" fill="__C__"/>`) }
  ];

  function svgFor(id, color) {
    const item = catalog.find(s => s.id === id);
    if (!item) return null;
    return item.recolor ? item.svg.replaceAll('__C__', color || '#6C5CE7') : item.svg;
  }

  return { catalog, svgFor };
})();
