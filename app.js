import { toSvg, mount } from './vendor/peek-vanilla/index.js';

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
if (brand) brand.innerHTML = face('Peek', 96);

/* hero: live faces that watch the pointer */
const hero = document.getElementById('hero-faces');
if (hero) {
  ['Sakayori', 'Chi', 'Kwame', 'Sofia', 'Mateo', 'Aiko'].forEach((name) => {
    const fig = document.createElement('figure');
    hero.appendChild(fig);
    mount(name, fig, { animate: true, gaze: 'pointer', size: 256, frame: 'paper' });
    caption(fig, name);
  });
}

/* determinism: one deterministic face per name, rendered live */
const same = document.getElementById('same-faces');
if (same) {
  ['JavaScript', 'Kotlin', 'Rust'].forEach((runtime) => {
    const fig = document.createElement('figure');
    fig.innerHTML = face(runtime, 256);
    caption(fig, runtime);
    same.appendChild(fig);
  });
}

/* tabs: sliding indicator + morphing panels */
const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));
const panelsWrap = document.querySelector('.panels');
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

let switchTimer = null;
function settlePanels() {
  if (switchTimer) { clearTimeout(switchTimer); switchTimer = null; }
  panels.forEach((p) => p.classList.remove('is-leaving', 'is-measuring'));
  if (panelsWrap) {
    panelsWrap.style.height = '';
    panelsWrap.style.overflow = '';
    panelsWrap.style.transition = '';
  }
}

function switchTab(tab) {
  const name = tab.dataset.tab;
  const current = document.querySelector('.panel.is-active');
  const next = document.querySelector(`.panel[data-panel="${name}"]`);

  tabs.forEach((t) => {
    t.classList.toggle('is-active', t === tab);
    t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
  });
  moveIndicator(tab, false);

  if (!next || current === next) return;

  if (reduceMotion || !panelsWrap) {
    panels.forEach((p) => p.classList.toggle('is-active', p === next));
    return;
  }

  settlePanels();

  /* slide direction follows the tab order, like a pager */
  const order = tabs.map((t) => t.dataset.tab);
  const fromIdx = current ? order.indexOf(current.dataset.panel) : -1;
  const toIdx = order.indexOf(name);
  const dir = toIdx > fromIdx ? 1 : -1;
  panelsWrap.style.setProperty('--dir', dir);

  const startH = panelsWrap.offsetHeight;

  next.classList.add('is-measuring');
  const endH = next.offsetHeight;
  next.classList.remove('is-measuring');

  if (current) {
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
  }
  next.classList.add('is-active');

  panelsWrap.style.height = `${startH}px`;
  panelsWrap.style.overflow = 'hidden';
  void panelsWrap.offsetHeight;
  panelsWrap.style.transition = 'height 0.38s cubic-bezier(0.22, 1, 0.36, 1)';
  panelsWrap.style.height = `${endH}px`;

  switchTimer = window.setTimeout(settlePanels, 420);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab));
});
moveIndicator(document.querySelector('.tab.is-active'), true);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => moveIndicator(document.querySelector('.tab.is-active'), true));
}
window.addEventListener('resize', () => moveIndicator(document.querySelector('.tab.is-active'), true));

/* no long-press menu anywhere: pairs with the CSS user-select:none */
document.addEventListener('contextmenu', (e) => e.preventDefault());

/* hard block on text selection at the event level, no matter what CSS does */
document.addEventListener('selectstart', (e) => e.preventDefault());
document.addEventListener('selectionchange', () => {
  const s = document.getSelection();
  if (s && s.rangeCount > 0) s.removeAllRanges();
});

/* copy buttons */
document.querySelectorAll('.copy[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      const old = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = old; }, 1400);
    } catch (e) {
      btn.textContent = 'Copy failed';
    }
  });
});

/* copy code snippets */
document.querySelectorAll('[data-codecopy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const pre = btn.closest('.panel').querySelector('pre');
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText);
      const old = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = old; }, 1400);
    } catch (e) {
      btn.textContent = 'Copy failed';
    }
  });
});
