# peek-web

Landing page for the Peek avatar family, live at https://getpeek.tech.

Hand-coded static site. No framework, no build step. Faces are rendered live
with the vendored `peek-vanilla` source (`vendor/peek-vanilla`), so every face
on the page is a genuine Peek face.

## Develop

Serve the folder with any static server:

```bash
python3 -m http.server 8000
```

## Deploy

Any static host works (Cloudflare Pages, GitHub Pages, nginx). The site is
`index.html` + `styles.css` + `app.js` with ES module imports, so it needs to
be served over HTTP, not `file://`.

## Credit

Peek was created by [Doan Labs](https://peek.doan-labs.com/). This site
presents the Sakayori ports (peek-vanilla, peek-kotlin, peek-rust) of their
work, MIT license kept.
