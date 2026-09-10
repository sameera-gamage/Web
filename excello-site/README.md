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
