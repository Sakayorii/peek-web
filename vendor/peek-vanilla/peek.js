/*
 * mount(name, target, options): the vanilla replacement for React's <Peek />.
 * Renders the same tree, binds the same Live animation rig, no React needed.
 */

import { Live } from './animate.js'
import { draw, restPose } from './draw.js'
import { serialize, settle } from './svg.js'

let uid = 0

/**
 * Render a Peek avatar into a DOM element.
 *
 * @param {string} name — the name that decides the face
 * @param {Element|string} target — container element (or CSS selector)
 * @param {object} [options]
 *   face, color, eyes, brows, mouth, cheeks, trait — axis overrides (win over the hash)
 *   expression — 'normal' | 'happy' | 'sad' | 'angry' | 'sleepy' | 'curious' |
 *     'surprised' | 'excited' | 'confused' | 'bored' | 'attentive'
 *   gaze — [x, y] in -1..1, or 'pointer' to follow the pointer (animate only)
 *   animate — bring it to life (off under prefers-reduced-motion)
 *   size, frame, square, riso, title — same as toSvg
 *   className — set on the <svg>
 * @returns {{ el: SVGSVGElement, live: Live|null, setExpression, setGaze, destroy }}
 */
export function mount(name, target, options = {}) {
  const host =
    typeof target === 'string' ? document.querySelector(target) : target
  if (!host) throw new Error('peek-vanilla: mount target not found')
  const { animate = false, className, ...rest } = options
  const expression = rest.expression ?? 'normal'
  const gaze = options.gaze
  const fixed = Array.isArray(gaze) ? gaze : undefined
  const id = `peek-vanilla-${++uid}`
  const { who, pose, opts } = settle(
    name,
    { ...rest, gaze: fixed, id },
    animate,
  )
  const tree = draw(
    who,
    animate ? restPose(who, expression, fixed) : pose,
    opts,
  )
  const doc = new DOMParser().parseFromString(serialize(tree), 'image/svg+xml')
  const svg = doc.documentElement
  if (className) svg.setAttribute('class', className)
  host.appendChild(svg)

  const live = animate ? new Live(svg, tree, who, opts, expression, gaze) : null
  return {
    el: svg,
    live,
    setExpression: (next) => {
      if (live) live.setExpression(next)
    },
    setGaze: (next) => {
      if (live) live.setGaze(next)
    },
    destroy: () => {
      if (live) live.destroy()
      svg.remove()
    },
  }
}
