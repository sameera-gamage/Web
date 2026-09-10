# Excello — Design & Build website

A static, no-build website for Excello Developers (Sri Lanka). The visual language is an
editorial, Mediterranean-luxury style: light serif display type, small letter-spaced sans
labels, warm sand and charcoal palette, and scroll-driven motion built with GSAP.

## Run it

Open `index.html` in a browser, or serve the folder:

```
npx serve .
# or
python3 -m http.server 8080
```

No build step. Everything is plain HTML, CSS and vanilla JS.

## Structure

```
index.html        Home: hero, manifesto, services, horizontal projects, stats, process, Aathavan spotlight, CTA
about.html        Story, integrated model, values, leadership
services.html     Five service sections with anchors (#architecture, #construction, #interiors, #real-estate, #branding)
projects.html     Editorial project grid
contact.html      Contact details, enquiry form (front-end only), map placeholder
css/style.css     All styles (design tokens at the top of the file)
js/layout.js      Shared header, fullscreen menu, preloader, cursor and footer markup
js/main.js        Motion system (see below)
js/vendor/        gsap, ScrollTrigger, SplitText (GSAP 3.15, free licence), lenis
```

## Motion system (GSAP + ScrollTrigger + Lenis)

| Hook | Effect |
| --- | --- |
| Preloader | Counter 0 to 100, wordmark reveal, curtain wipe (shown once per browser session) |
| `.hero` | Background scale-in on load, parallax on scroll, content drifts and fades |
| `data-split` | Headline lines slide up out of a mask when scrolled into view |
| `data-split="words-scrub"` | Manifesto words brighten as you scroll through the paragraph |
| `data-reveal` | Fade-up on enter |
| `.media--parallax` + `data-parallax="10"` | Image parallax, number = strength in percent |
| `.media--clip` | Clip-path reveal with a slow zoom-out |
| `.hscroll` | Pinned horizontal scroll gallery with progress bar (stacks vertically under 900px) |
| `data-count` | Number counters |
| `data-theme="dark"` | Page background and text cross-fade to dark while the section is in view |
| `.marquee` | Infinite marquee that speeds up with scroll velocity |
| `.process` | Sticky image that swaps as each step scrolls past |
| `.service` | Floating preview image that follows the cursor over the services list |
| `data-magnetic` | Magnetic pull on buttons and nav links |
| `data-cursor="view"` | Cursor grows into a "View" badge over project cards |
| Footer | Slides up from beneath the page, wordmark letters rise in |
| Links | Curtain page transition between internal pages |

All motion is disabled automatically for `prefers-reduced-motion`.

## Swapping content

* **Images** are Unsplash placeholders. Replace the `src` URLs in the HTML (a failed placeholder falls
  back to picsum.photos automatically). Put local images in `img/` and reference them relatively.
* **Fonts** load from Google Fonts (Cormorant Garamond + Manrope). Change the `<link>` in each page
  `<head>` and the `--font-serif` / `--font-sans` tokens in `css/style.css`.
* **Colours** are CSS custom properties at the top of `css/style.css`.
* **Header, footer, menu** text lives in `js/layout.js`.
* **Contact form** is front-end only. Point it at your form handler (Formspree, Netlify Forms,
  a PHP mailer, etc.) by giving the `<form>` an `action` and removing the demo handler at the
  bottom of `js/main.js`.
* The email `info@excello.lk` is a placeholder. Confirm the real address before launch.

---

## Update: scroll-scrubbed video frames, symmetry pass, fixed motif

Two supplied videos were converted to still-frame sequences and are now scrubbed by scroll
(the frame advances as you scroll, forward and back), the way a cinematic site plays a video
on the scrollbar.

### The frame sequences

| Sequence | Source | Frames | Resolution | Folder |
| --- | --- | --- | --- | --- |
| Hero (architectural transformation) | 10s / 24fps clip | 72 | 1920×1080 (original) | `img/hero-seq/` |
| Cinematic band (from foundation to finish) | 12.1s / 30fps clip | 60 | 1920×1080 (original) | `img/clip-seq/` |

Frames were extracted at original resolution with ffmpeg:

```
ffmpeg -i hero.mp4 -vf "fps=72/10" -q:v 6 -frames:v 72 img/hero-seq/f_%03d.jpg
ffmpeg -i clip.mp4 -vf "fps=60/12.1" -q:v 6 -frames:v 60 img/clip-seq/f_%03d.jpg
```

The two sequences are about 33 MB together, so the whole page preloads that before the scrub is
fully smooth. **To make it lighter** for a live site, re-run the commands above with either a lower
frame count (e.g. `fps=48/10`) or a smaller width (add `-vf "scale=1280:-2,fps=..."`). The player
reads the frame count from the HTML, so also update `data-frames` on the section.

### How the player works (`js/main.js`)

Any element with `data-seq="<folder>" data-frames="<n>"` and a child `<canvas>` becomes a pinned,
scroll-scrubbed scene:

- Frames load progressively; a small `Loading NN%` counter shows until they are all in.
- The current frame is drawn to a canvas with cover-fit math, redrawn on resize and on GSAP refresh.
- A pinned `ScrollTrigger` maps scroll progress to the frame index. `data-seq-end` sets how much
  scroll the scene takes (e.g. `+=150%`).
- `data-seq-mode="hero"` also fades the hero text out toward the end of the pin.
- Under `prefers-reduced-motion` the scene is not pinned; it just shows the first frame.

To swap in different footage, replace the JPEGs in the folder (named `f_001.jpg`, `f_002.jpg`, …)
and set `data-frames` to the new count.

### Symmetry pass

- The horizontal project gallery panels are now all the same width with the same 4:5 image ratio,
  so their tops and bottoms line up instead of stepping up and down.
- The feature block below the manifesto is now a balanced two-up diptych (equal columns, aligned
  tops) with a single lead line above it.

### The fixed motif

The horizontal-slide section has a fixed line-drawn sun/arc motif (an inline SVG in `index.html`,
`.hscroll__motif`) that stays put while the panels slide across it — a nod to Aathavan's
solar theme. It is drawn with the bronze accent and is easy to replace: swap the inline `<svg>`
for your own artwork. (The white image supplied for this was effectively blank, so this motif was
drawn in its place; drop your SVG in if you have final art.)

### Parallax images

The parallax blocks still use cloud-hosted (Unsplash) images; a couple were refreshed to larger
crops. Replace those `src` URLs with your own photography when ready.
