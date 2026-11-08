/* peek-vanilla — vanilla JS port of @doan-labs/peek
   No React, no build step. A name in, an SVG string out —
   or mount() it live with the full animation rig. */
export { toSvg, settle, serialize } from './svg.js';
export { identify, tidy, fnv1a, seed } from './identity.js';
export { ACCESSORIES, ACCESSORY_INK, BLOC, COLORS, EXPRESSIONS, FACES, HAZE, VARIANTS, WHEEL } from './tables.js';
export { draw } from './draw.js';
export { Live } from './animate.js';
export { mount } from './peek.js';
