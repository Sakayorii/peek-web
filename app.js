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
  else panelsWrap.style.transition = 'height 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
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
  }, 540);
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
window.addEventListener('resize', () => layoutAll(true));

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
