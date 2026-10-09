/*
 * A name in, an identity out. Every axis hashes on its own seed, so changing
 * one list never moves another axis:
 *
 *   seed(axis) = fnv1a(`peek@${version}:${axis}:${tidy(name)}`)
 *
 * The persona (continuous proportions and habits) is transcribed from
 * faceFor() in the v1.2 page: same ranges, same draw order.
 */
import { COLORS, FACES, LATEST, PARTS, VERSIONS, } from './tables.js';
export const STYLE = 'peek';
export const tidy = (s) => s.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
/** FNV-1a over the UTF-8 bytes. */
export function fnv1a(str) {
    let h = 0x811c9dc5;
    for (const b of new TextEncoder().encode(str)) {
        h ^= b;
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
}
export function mulberry32(a) {
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
/** What each axis picks from, in list order. Append-only. */
export const LISTS = {
    face: Object.keys(FACES),
    color: Object.keys(COLORS),
    ...PARTS,
};
/** The axes in readout order. */
export const AXES = Object.keys(LISTS);
export function seed(name, axis, version = LATEST) {
    return fnv1a(`${STYLE}@${version}:${axis}:${tidy(name)}`);
}
export function identify(name, { version = LATEST } = {}) {
    const lengths = VERSIONS[version];
    if (!lengths)
        throw new Error(`peek@${version} does not exist`);
    const pick = (axis) => LISTS[axis][seed(name, axis, version) % lengths[axis]];
    const rnd = mulberry32(seed(name, 'persona', version));
    const r = (a, b) => Math.round((a + rnd() * (b - a)) * 100) / 100;
    // object literal order is the draw order: never reorder these lines
    const persona = {
        spread: r(-7, 7),
        blink: r(0.75, 1.4),
        add: {
            browY: r(-4, 4),
            browTilt: r(-5, 5),
            browArch: r(-0.2, 0.3),
            rot: r(-3, 3),
            hair: r(-0.2, 0.35),
            gx: r(-0.12, 0.12),
            my: r(-2, 3),
        },
        mul: {
            eyeS: r(0.92, 1.08),
            pupil: r(0.9, 1.12),
            browW: r(0.85, 1.2),
            mw: r(0.85, 1.18),
        },
    };
    const key = tidy(name);
    return {
        key,
        hash: fnv1a(key),
        version,
        face: pick('face'),
        color: pick('color'),
        eyes: pick('eyes'),
        brows: pick('brows'),
        mouth: pick('mouth'),
        cheeks: pick('cheeks'),
        trait: pick('trait'),
        persona,
    };
}
