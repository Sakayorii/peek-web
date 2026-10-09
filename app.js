import { toSvg } from './vendor/peek-vanilla/index.js';

function face(name, size) {
  return toSvg(name, { size: size || 256, frame: 'paper' });
}

function mountFaces(el, names, size) {
  names.forEach((name) => {
    const fig = document.createElement('figure');
    fig.innerHTML = face(name, size) + '<figcaption>' + name + '</figcaption>';
    el.appendChild(fig);
  });
}

/* brand mark */
const brand = document.getElementById('brand-face');
if (brand) brand.innerHTML = face('Peek', 96);

/* hero illustration: a small set of faces, static */
const hero = document.getElementById('hero-faces');
if (hero) mountFaces(hero, ['Sakayori', 'Linh', 'Kwame', 'Sofia', 'Mateo', 'Aiko'], 256);

/* determinism: one name, three runtimes, identical bytes */
const same = document.getElementById('same-faces');
if (same) {
  ['JavaScript', 'Kotlin', 'Rust'].forEach((runtime) => {
    const fig = document.createElement('figure');
    fig.innerHTML = face('Sakayori', 256) + '<figcaption>' + runtime + '</figcaption>';
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
