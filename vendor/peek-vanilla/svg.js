/*
 * toSvg: a name in, a standalone SVG string out. Same input, same bytes, on
 * any machine. Shares its defaults with <Peek> through settle().
 */
import { draw, restPose, } from './draw.js';
import { fnv1a, identify } from './identity.js';
/**
 * A name decides identity unless the caller overrides an axis: an explicit
 * face, color or part wins over the hash, and every other axis stays put.
 */
export function settle(name, o, live = false) {
    const base = identify(name, { version: o.version });
    const who = {
        ...base,
        face: o.face ?? base.face,
        color: o.color ?? base.color,
        eyes: o.eyes ?? base.eyes,
        brows: o.brows ?? base.brows,
        mouth: o.mouth ?? base.mouth,
        cheeks: o.cheeks ?? base.cheeks,
        trait: o.trait ?? base.trait,
    };
    const pose = restPose(who, o.expression ?? 'normal', o.gaze);
    const look = {
        size: o.size ?? 64,
        frame: o.frame ?? 'ink',
        square: o.square ?? true,
        riso: o.riso ?? false,
        live,
    };
    const id = o.id ?? `peek-${fnv1a(JSON.stringify([who, pose, look])).toString(36)}`;
    return { who, pose, opts: { ...look, id, title: o.title ?? name } };
}
// characters XML 1.0 cannot hold at all: C0 controls and lone surrogates
const ILLEGAL = 
// biome-ignore lint/suspicious/noControlCharactersInRegex: matching them is the point
/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
const esc = (s) => s
    .replace(ILLEGAL, '\uFFFD')
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export function serialize(node) {
    let a = '';
    for (const k in node.attrs)
        a += ` ${k}="${esc(node.attrs[k])}"`;
    if (!node.children.length)
        return `<${node.tag}${a}/>`;
    return `<${node.tag}${a}>${node.children.map(serialize).join('')}</${node.tag}>`;
}
export function toSvg(name, props = {}) {
    const { who, pose, opts } = settle(name, props);
    return serialize(draw(who, pose, opts));
}
