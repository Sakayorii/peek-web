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
  ['Sakayori', 'Linh', 'Kwame', 'Sofia', 'Mateo', 'Aiko'].forEach((name) => {
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

/* tabs */
const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = Array.from(document.querySelectorAll('.panel'));
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      t.classList.toggle('is-active', t === tab);
      t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
    });
    panels.forEach((p) => {
      p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab);
    });
  });
});

/* copy buttons */
document.querySelectorAll('.copy').forEach((btn) => {
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
