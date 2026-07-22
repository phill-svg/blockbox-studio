/* presets.js — remixable starter outfits so nobody faces a blank shirt.
   Pure data; app.js interprets it (base colour, per-panel pattern, chest text). */
window.RCS = window.RCS || {};

RCS.Presets = [
  {
    id: 'jersey', name: 'Sport Jersey', emoji: '⚽', garment: 'shirt', base: '#2F6BFF',
    front: { pattern: { id: 'stripes', c1: '#2F6BFF', c2: '#ffffff' },
             text: { str: '10', font: '"Fredoka", sans-serif', fill: '#ffffff', stroke: '#1B3F9E', size: 0.42 } }
  },
  {
    id: 'rainbow', name: 'Rainbow Pop', emoji: '🌈', garment: 'shirt', base: '#6C5CE7',
    front: { pattern: { id: 'diagonal', c1: '#6C5CE7', c2: '#FFC642' } },
    arms:  { pattern: { id: 'stripes', c1: '#FF6B6B', c2: '#22C39A' } }
  },
  {
    id: 'candy', name: 'Candy Dots', emoji: '🍬', garment: 'shirt', base: '#FF7AC6',
    front: { pattern: { id: 'dots', c1: '#FF7AC6', c2: '#ffffff' },
             text: { str: 'YUM', font: '"Fredoka", sans-serif', fill: '#ffffff', stroke: '#C63F8E', size: 0.3 } }
  },
  {
    id: 'tux', name: 'Tuxedo', emoji: '🤵', garment: 'shirt', base: '#1B1E28',
    front: { pattern: { id: 'stripes', c1: '#1B1E28', c2: '#f5f5f5' } }
  },
  {
    id: 'camo', name: 'Camo', emoji: '🌲', garment: 'shirt', base: '#5A6B3B',
    front: { pattern: { id: 'camo', c1: '#5A6B3B', c2: '#3C4A26' } },
    arms:  { pattern: { id: 'camo', c1: '#5A6B3B', c2: '#3C4A26' } }
  },
  {
    id: 'denim', name: 'Blue Jeans', emoji: '👖', garment: 'pants', base: '#3E63A8',
    front: { pattern: { id: 'diagonal', c1: '#3E63A8', c2: '#33538F' } },
    arms:  { pattern: { id: 'diagonal', c1: '#3E63A8', c2: '#33538F' } }
  }
];
