/* peek-vanilla — vanilla JS port of @doan-labs/peek
   No React, no build step. A name in, an SVG string out —
   or mount() it live with the full animation rig. */
export { toSvg, settle, serialize } from './svg.js';
export { identify, tidy, fnv1a, seed } from './identity.js';
export { COLORS, EXPRESSIONS, FACES } from './tables.js';
export { Live } from './animate.js';
export { mount } from './peek.js';
