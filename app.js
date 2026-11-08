import { toSvg, mount, EXPRESSIONS, ACCESSORIES, VARIANTS } from './vendor/peek-vanilla-2.0.0/index.js';

function face(name, size) {
  return toSvg(name, { size: size || 256, frame: 'paper' });
}

function caption(fig, text) {
  const cap = document.createElement('figcaption');
  cap.textContent = text;
  fig.appendChild(cap);
}

/* brand mark: static */
const brand = document.getElementById('brand-face');
if (brand) brand.innerHTML = toSvg('Peek', { size: 96, frame: 'none' });

/* hero: live faces that watch the pointer */
const hero = document.getElementById('hero-faces');
if (hero) {
  ['Sakayori', 'Chi', 'Nam', 'Lâm', 'Peka', 'Onyxx'].forEach((name) => {
    const fig = document.createElement('figure');
    hero.appendChild(fig);
    mount(name, fig, { animate: true, gaze: 'pointer', size: 256, frame: 'paper' });
    caption(fig, name);
  });
}

/* determinism: one deterministic face per name, animated like the hero */
const same = document.getElementById('same-faces');
if (same) {
  ['JavaScript', 'Kotlin', 'Rust'].forEach((runtime) => {
    const fig = document.createElement('figure');
    same.appendChild(fig);
    mount(runtime, fig, { animate: true, gaze: 'pointer', size: 256, frame: 'paper' });
    caption(fig, runtime);
  });
}

/* tabs: sliding indicator + pager track */
const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));
const panelsWrap = document.querySelector('.panels');
const track = document.querySelector('.panels-track');
const indicator = document.querySelector('.tab-indicator');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function moveIndicator(tab, instant) {
  if (!indicator || !tab) return;
  if (instant || reduceMotion) indicator.style.transition = 'none';
  else indicator.style.transition = '';
  indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  indicator.style.width = `${tab.offsetWidth}px`;
  if (instant || reduceMotion) {
    void indicator.offsetWidth;
    indicator.style.transition = '';
  }
}

let currentIdx = 0;
let switchTimer = null;

function trackStep() {
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  return panelsWrap.clientWidth + gap;
}

function layoutTrack(instant) {
  if (!track || !panelsWrap) return;
  if (instant || reduceMotion) track.style.transition = 'none';
  else track.style.transition = '';
  track.style.transform = `translateX(${-currentIdx * trackStep()}px)`;
  if (instant || reduceMotion) {
    void track.offsetWidth;
    track.style.transition = '';
  }
}

function fitHeight(instant) {
  if (!panelsWrap || !panels[currentIdx]) return;
  if (instant || reduceMotion) panelsWrap.style.transition = 'none';
  else panelsWrap.style.transition = 'height 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
  panelsWrap.style.height = `${panels[currentIdx].offsetHeight}px`;
  if (instant || reduceMotion) {
    void panelsWrap.offsetHeight;
    panelsWrap.style.transition = '';
  }
}

function switchTab(tab) {
  const idx = tabs.indexOf(tab);
  tabs.forEach((t) => {
    t.classList.toggle('is-active', t === tab);
    t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
  });
  moveIndicator(tab, false);
  if (idx < 0 || idx === currentIdx) return;
  currentIdx = idx;
  panels.forEach((p, i) => {
    p.classList.toggle('is-active', i === idx);
    p.classList.add('is-moving');
  });
  if (switchTimer) { clearTimeout(switchTimer); switchTimer = null; }
  layoutTrack(false);
  fitHeight(false);
  switchTimer = window.setTimeout(() => {
    if (panelsWrap) panelsWrap.style.transition = '';
    panels.forEach((p) => p.classList.remove('is-moving'));
  }, 700);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab));
});

function layoutAll(instant) {
  moveIndicator(document.querySelector('.tab.is-active'), instant);
  layoutTrack(instant);
  fitHeight(instant);
}
layoutAll(true);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => layoutAll(true));
}
/* Mobile browsers fire `resize` when the URL bar shows/hides on scroll
   (height-only). Relaying out then makes the tab indicator and panel
   height jump mid-scroll, only a real width change needs a relayout. */
let lastViewportWidth = window.innerWidth;
window.addEventListener('resize', () => {
  if (window.innerWidth === lastViewportWidth) return;
  lastViewportWidth = window.innerWidth;
  layoutAll(true);
});

/* Swipe between code panels, like a native pager. A swipe that starts
   inside a <pre> is left alone so the code itself can scroll sideways. */
if (panelsWrap) {
  let swipeX = null;
  let swipeY = null;
  panelsWrap.addEventListener('touchstart', (e) => {
    if (e.target.closest('pre')) { swipeX = null; return; }
    const t = e.changedTouches[0];
    swipeX = t.clientX;
    swipeY = t.clientY;
  }, { passive: true });
  panelsWrap.addEventListener('touchend', (e) => {
    if (swipeX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeX;
    const dy = t.clientY - swipeY;
    swipeX = null;
    swipeY = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const next = currentIdx + (dx < 0 ? 1 : -1);
    if (next >= 0 && next < tabs.length) switchTab(tabs[next]);
  }, { passive: true });
}

/* no long-press menu anywhere: pairs with the CSS user-select:none.
   Form controls (the playground name field) are exempt, or the visitor
   could not edit, select, or paste into them. */
function inControl(e) {
  return !!(e.target && e.target.closest && e.target.closest('input, select, textarea'));
}
document.addEventListener('contextmenu', (e) => { if (!inControl(e)) e.preventDefault(); });

/* hard block on text selection at the event level, no matter what CSS does */
document.addEventListener('selectstart', (e) => { if (!inControl(e)) e.preventDefault(); });
document.addEventListener('selectionchange', () => {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
  const s = document.getSelection();
  if (s && s.rangeCount > 0) s.removeAllRanges();
});

/* copy: Clipboard API first; in-app WebViews (Messenger/Zalo browsers)
   often deny it, so fall back to a throwaway textarea + execCommand. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }
}

function copyFeedback(btn, ok) {
  const old = btn.textContent;
  btn.textContent = ok ? 'Copied' : 'Copy failed';
  setTimeout(() => { btn.textContent = old; }, 1400);
}

/* copy buttons */
document.querySelectorAll('.copy[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    copyFeedback(btn, await copyText(btn.dataset.copy));
  });
});

/* copy code snippets */
document.querySelectorAll('[data-codecopy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const pre = btn.closest('.panel').querySelector('pre');
    if (!pre) return;
    copyFeedback(btn, await copyText(pre.innerText));
  });
});

/* playground: one name, three drawing styles, a wardrobe.
   Options are filled from the vendored tables, so the controls can never
   drift from what the engine on this page actually supports. Rendering is
   a synchronous string build, well under a frame, so there is no async
   gap to cover with a loading state; changes cross-fade instead. */
const pgName = document.getElementById('pg-name');
if (pgName) {
  const pg = {
    variant: 'peek',
    expression: 'normal',
    eyewear: 'none',
    headwear: 'none',
    neckwear: 'none',
  };
  const faces = {};
  document.querySelectorAll('[data-variant-face]').forEach((el) => {
    faces[el.dataset.variantFace] = el;
  });
  const cards = Array.from(document.querySelectorAll('.variant-card'));
  const pgCode = document.getElementById('pg-code');
  const pgCopy = document.getElementById('pg-copy');
  let snippet = '';

  function fillSelect(id, values) {
    const sel = document.getElementById(id);
    values.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
    return sel;
  }
  const pgExpression = fillSelect('pg-expression', Object.keys(EXPRESSIONS));
  const pgEyewear = fillSelect('pg-eyewear', ACCESSORIES.eyewear);
  const pgHeadwear = fillSelect('pg-headwear', ACCESSORIES.headwear);
  const pgNeckwear = fillSelect('pg-neckwear', ACCESSORIES.neckwear);
  pgExpression.value = pg.expression;

  function currentName() {
    const n = pgName.value.trim();
    return n === '' ? 'Peek' : n;
  }

  function buildSnippet(name) {
    const opts = [];
    if (pg.variant !== 'peek') opts.push(`variant: '${pg.variant}'`);
    if (pg.expression !== 'normal') opts.push(`expression: '${pg.expression}'`);
    if (pg.eyewear !== 'none') opts.push(`eyewear: '${pg.eyewear}'`);
    if (pg.headwear !== 'none') opts.push(`headwear: '${pg.headwear}'`);
    if (pg.neckwear !== 'none') opts.push(`neckwear: '${pg.neckwear}'`);
    const safe = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return opts.length === 0
      ? `toSvg('${safe}')`
      : `toSvg('${safe}', { ${opts.join(', ')} })`;
  }

  function renderPlayground(animate) {
    const name = currentName();
    VARIANTS.forEach((v) => {
      const el = faces[v];
      if (!el) return;
      el.innerHTML = toSvg(name, {
        size: 256,
        frame: 'paper',
        variant: v,
        expression: pg.expression,
        eyewear: pg.eyewear,
        headwear: pg.headwear,
        neckwear: pg.neckwear,
      });
    });
    cards.forEach((card) => {
      const featured = card.dataset.variant === pg.variant;
      card.classList.toggle('is-featured', featured);
      card.setAttribute('aria-pressed', featured ? 'true' : 'false');
    });
    snippet = buildSnippet(name);
    if (pgCode) pgCode.textContent = snippet;
    if (animate && !reduceMotion) {
      cards.forEach((card) => {
        const faceEl = card.querySelector('.variant-face');
        faceEl.classList.remove('is-swapping');
        void faceEl.offsetWidth;
        faceEl.classList.add('is-swapping');
      });
      window.setTimeout(() => {
        cards.forEach((card) => card.querySelector('.variant-face').classList.remove('is-swapping'));
      }, 220);
    }
  }

  pgName.addEventListener('input', () => renderPlayground(false));
  pgExpression.addEventListener('change', () => { pg.expression = pgExpression.value; renderPlayground(true); });
  pgEyewear.addEventListener('change', () => { pg.eyewear = pgEyewear.value; renderPlayground(true); });
  pgHeadwear.addEventListener('change', () => { pg.headwear = pgHeadwear.value; renderPlayground(true); });
  pgNeckwear.addEventListener('change', () => { pg.neckwear = pgNeckwear.value; renderPlayground(true); });
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (pg.variant === card.dataset.variant) return;
      pg.variant = card.dataset.variant;
      renderPlayground(true);
    });
  });
  if (pgCopy) {
    pgCopy.addEventListener('click', async () => {
      copyFeedback(pgCopy, await copyText(snippet));
    });
  }
  renderPlayground(false);
}
