/* regions.js — the heart of correct Roblox wrapping.
   Face rectangles were extracted from the official 585x559 R15 template
   (create.roblox.com). Shirt and pants share the identical layout; only the
   names of the parts differ (torso vs hip, arms vs legs). */
window.RCS = window.RCS || {};

RCS.TEMPLATE = { width: 585, height: 559 };

/* Scale factor: how many editor pixels per template pixel. Higher = crisper art. */
RCS.EDIT_SCALE = 3;

/* Exact face rectangles on the 585x559 template. */
RCS.FACES = {
  front: { x: 231, y: 74,  w: 128, h: 128 }, // torso / hip — front
  back:  { x: 427, y: 74,  w: 128, h: 128 }, // torso / hip — back
  up:    { x: 231, y: 8,   w: 128, h: 64  }, // shoulders / top
  down:  { x: 231, y: 204, w: 128, h: 64  }, // bottom
  rSide: { x: 165, y: 74,  w: 64,  h: 128 }, // right side of torso
  lSide: { x: 361, y: 74,  w: 64,  h: 128 }, // left side of torso
  armR:  { x: 217, y: 355, w: 64,  h: 128 }, // right arm / left leg — front face
  armL:  { x: 308, y: 355, w: 64,  h: 128 }  // left arm / right leg — front face
};

/* The kid-facing panels. Each maps its square/rectangular editor onto one or
   more template faces. Sides/top/bottom simply inherit the base colour, which
   keeps the editor simple while still looking clean on the avatar. */
RCS.PANELS = {
  front: { faces: ['front'],         w: 128, h: 128 },
  back:  { faces: ['back'],          w: 128, h: 128 },
  arms:  { faces: ['armR', 'armL'],  w: 64,  h: 128 }
};

/* Friendly labels per garment. */
RCS.LABELS = {
  shirt: { front: 'Front', back: 'Back', arms: 'Sleeves' },
  pants: { front: 'Front', back: 'Back', arms: 'Legs' }
};

/* T-shirts are a single square graphic (ShirtGraphic), not a wrap. */
RCS.TSHIRT = { size: 512 };
