# RapidHousing site — how to finish it

Your site is built and works right now. It looks complete even before you add any
media, because the hero has a hand-drawn atrium scene behind it. To bring in the
cinematic descent, you add two files. That is the whole job.

## The two files to add

Put both inside the `assets/` folder, with these exact names:

| File | What it is | Where it comes from |
|---|---|---|
| `assets/hero-poster.jpg` | The still image of the atrium | The image I generated for you in Higgsfield. Open it in the Higgsfield viewer, download it, rename it to `hero-poster.jpg`. |
| `assets/hero-scrub.mp4` | The scrolling descent video | You make this in Higgsfield Flow with the prompt below, download it, rename it to `hero-scrub.mp4`. |

That is it. Once those two files are in `assets/`, the hero plays the video as you
scroll on laptops and desktops, and shows the still image on phones. Nothing else
to wire up.

## The video prompt for Higgsfield Flow

Use the **image I already generated as the starting frame** (image-to-video), so the
video begins exactly where the still image sits. Settings: **1080p, 6 seconds,
standard mode, no audio.** Paste this as the motion prompt:

> One continuous shot, no cuts. The camera descends straight down through the open
> central void of a soaring modern concrete and glass atrium, gliding smoothly past
> floor after floor of cantilevered balconies and thin steel railings, from the bright
> skylight at the top down toward a warm, light-filled ground floor. The camera moves
> steadily downward along the vertical center of the frame. The scene stays alive: fine
> dust motes drift in the shafts of daylight, soft light shifts across the raw concrete
> as the camera passes each level, faint haze moves through the void. The shot ends at
> rest, settling level in a calm finished ground-floor space where warm amber daylight
> pools on a polished concrete floor, bold architectural forms framing an open, composed
> view with generous empty space above. No text, no logos, no lettering anywhere.

Tip: scrolling down should feel like going down, so keep the camera moving downward the
whole time. If a version drifts or spins, re-roll with the same prompt.

### One optional step for the smoothest scrolling

A raw video from Flow scrubs fine, but it scrubs *silk-smooth* if it is re-encoded with
frequent keyframes. If you drop your raw video into `assets/` and tell me, I will run
this for you here. Or run it yourself if you have ffmpeg:

```
ffmpeg -i your-raw-video.mp4 -c:v libx264 -crf 20 -preset slow -g 8 -keyint_min 8 \
  -pix_fmt yuv420p -movflags +faststart -an assets/hero-scrub.mp4
```

## Two small things before you go live

1. **Your email.** The contact form and footer use a placeholder address,
   `hello@rapidhousing.studio`. Tell me your real inbox and I will set the form to send
   there, or change it yourself in `index.html` (search for `hello@rapidhousing.studio`).
2. **The numbers and the disclosure.** The stats (180 projects, 14 years, and so on) are
   sensible placeholders. Give me the real figures and I will swap them in. The footer
   also notes the imagery is AI-generated; once you add real photos we remove that line.

## How to preview it

- Double-clicking `index.html` shows the still-image hero (browsers block video loading
  from a double-clicked file, so this is expected and looks complete).
- For the full scrolling video, run a tiny local server in this folder and open the link:
  `python -m http.server` then visit `http://localhost:8000`.
