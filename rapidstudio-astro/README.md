# RapidStudio

Astro 4 + Tailwind 3. Lenis for scroll, GSAP ScrollTrigger for the beats,
Canvas 2D for the camera rig. Fonts (Syne, DM Sans, DM Mono) are self-hosted
in `public/fonts`, so the page makes no third-party requests.

    npm install
    npm run dev      # local dev server
    npm run build    # -> dist/

`npm run build` runs a post-step (`scripts/portable.mjs`) that inlines the
bundle as a classic script and rewrites asset paths to be relative, so
`dist/index.html` opens by double-clicking as well as from a web server.

## Swapping in real work

Replace the six files in `public/work` (`w1.jpg` ... `w6.jpg`), keeping the
names. Titles and tags live in the `work` array at the top of
`src/pages/index.astro`. `w1.jpg` is also what shows through the lens.

## The hero

`src/scripts/camera.js` draws the camera. One scroll progress value 0..1
drives four beats: three-quarter view, turn to face on, push into the lens,
aperture opens. Beat boundaries are the `ease(...)` ranges in `render()`.
