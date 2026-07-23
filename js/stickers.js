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
    { id: 'square', name: 'Block', recolor: true, svg: S(`<rect x="12" y="12" width="76" height="76" rx="12" fill="__C__"/>`) },
    { id: 'sun', name: 'Sun', recolor: true, svg: S(
        `<g fill="__C__"><circle cx="50" cy="50" r="20"/>`+
        `<g><rect x="46" y="4" width="8" height="15" rx="4"/><rect x="46" y="81" width="8" height="15" rx="4"/><rect x="4" y="46" width="15" height="8" rx="4"/><rect x="81" y="46" width="15" height="8" rx="4"/></g>`+
        `<g transform="rotate(45 50 50)"><rect x="46" y="4" width="8" height="15" rx="4"/><rect x="46" y="81" width="8" height="15" rx="4"/><rect x="4" y="46" width="15" height="8" rx="4"/><rect x="81" y="46" width="15" height="8" rx="4"/></g></g>`) },
    { id: 'flame', name: 'Fire', recolor: true, svg: S(p('M50 6 C64 28 80 38 70 60 C65 78 54 88 50 94 C46 88 34 78 30 60 C24 46 36 42 42 30 C45 42 52 34 50 6 Z')) },
    { id: 'ghost', name: 'Ghost', recolor: true, svg: S(
        p('M22 46 A28 28 0 0 1 78 46 V90 L68 80 L58 90 L50 80 L42 90 L32 80 L22 90 Z')+
        `<circle cx="40" cy="46" r="6" fill="#232A45"/><circle cx="60" cy="46" r="6" fill="#232A45"/>`) },
    { id: 'gamepad', name: 'Game', recolor: true, svg: S(
        `<rect x="10" y="34" width="80" height="40" rx="20" fill="__C__"/>`+
        `<circle cx="30" cy="54" r="5" fill="#fff"/><circle cx="66" cy="47" r="4" fill="#fff"/><circle cx="76" cy="57" r="4" fill="#fff"/><circle cx="66" cy="61" r="4" fill="#fff"/>`) },
    { id: 'donut', name: 'Donut', recolor: true, svg: S(
        `<path fill="__C__" fill-rule="evenodd" d="M50 16 A34 34 0 1 0 51 16 Z M50 38 A12 12 0 1 1 49 38 Z"/>`+
        `<circle cx="50" cy="20" r="3" fill="#fff"/><circle cx="74" cy="40" r="3" fill="#FFD23F"/><circle cx="70" cy="66" r="3" fill="#22C39A"/><circle cx="30" cy="64" r="3" fill="#FF6B6B"/><circle cx="26" cy="38" r="3" fill="#4CB8FF"/>`) },
    { id: 'balloon', name: 'Balloon', recolor: true, svg: S(
        `<ellipse cx="50" cy="40" rx="26" ry="31" fill="__C__"/><path d="M44 68 L56 68 L50 80 Z" fill="__C__"/>`+
        `<path d="M50 80 Q58 90 50 98" stroke="#232A45" stroke-width="3" fill="none"/>`) },
    { id: 'gift', name: 'Gift', recolor: true, svg: S(
        `<rect x="16" y="40" width="68" height="48" rx="6" fill="__C__"/><rect x="44" y="40" width="12" height="48" fill="#fff"/>`+
        `<path d="M50 40 C38 18 18 30 32 38 M50 40 C62 18 82 30 68 38" stroke="#fff" stroke-width="6" fill="none"/>`) },
    { id: 'snow', name: 'Snow', recolor: true, svg: S(
        `<g stroke="__C__" stroke-width="6" stroke-linecap="round"><line x1="50" y1="10" x2="50" y2="90"/><line x1="16" y1="30" x2="84" y2="70"/><line x1="84" y1="30" x2="16" y2="70"/></g>`) },
    { id: 'leaf', name: 'Leaf', recolor: true, svg: S(p('M18 82 C18 42 58 20 84 14 C80 40 58 82 18 82 Z')) },
    { id: 'sparkle', name: 'Sparkle', recolor: true, svg: S(p('M50 6 C54 40 60 46 94 50 C60 54 54 60 50 94 C46 60 40 54 6 50 C40 46 46 40 50 6 Z')) },
    { id: 'plus', name: 'Plus', recolor: true, svg: S(p('M40 12 H60 V40 H88 V60 H60 V88 H40 V60 H12 V40 H40 Z')) },
    { id: 'arrow', name: 'Arrow', recolor: true, svg: S(p('M8 40 H58 V22 L94 50 L58 78 V60 H8 Z')) }
  ];

  function svgFor(id, color) {
    const item = catalog.find(s => s.id === id);
    if (!item) return null;
    return item.recolor ? item.svg.replaceAll('__C__', color || '#6C5CE7') : item.svg;
  }

  return { catalog, svgFor };
})();
