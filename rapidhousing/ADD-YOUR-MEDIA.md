# RapidHousing site — status and next steps

The hero video is installed and working. The site is done and live-previewable.

## What is already in the hero

You sent a Flow video that warped in the middle, so I looked at every frame, found
that the first 3.5 seconds were a clean, smooth descent, and trimmed the clip to
exactly that stretch. The scroll maps to progress, not seconds, so a shorter clip
costs nothing. Then I re-encoded it for silk-smooth scrubbing and wired it in.

These files are in `assets/` now:

| File | What it is |
|---|---|
| `hero-scrub.mp4` | The clean descent, H.264 (plays in every browser) |
| `hero-scrub.webm` | The same clip in VP9, used only where a browser cannot play H.264 |
| `hero-poster.jpg` | The still hero for phones and the first paint, pulled from the video |
| `hero-ending.jpg` | The resting frame, a spare design image |

## If you want the full descent that reaches the ground floor

The trimmed clip settles mid-atrium, not at the warm ground floor, because the break
sat between the two. If you want a version that descends all the way to the finished
ground floor, generate a fresh clip with the improved prompt below and send it over.
I will trim and wire it in the same way.

## The improved video prompt for Higgsfield Flow

Use the **image I already generated as the starting frame** (image-to-video), so the
video begins exactly where the still image sits. Settings: **1080p, 6 seconds,
standard mode, no audio.** Paste this as the motion prompt:

> One continuous shot, no cuts, a single smooth camera move at a slow
> and steady speed. The camera glides straight down through the tall open center of a
> modern concrete and glass atrium, moving downward along the vertical middle of the frame
> the whole time. Keep the architecture simple and solid: clean flat concrete walls and
> large calm glass panels to the left and right, softened by haze and shafts of daylight.
> Structures stay rigid and consistent, no morphing, no warping, no shifting or bending
> shapes. The only motion is the steady downward glide of the camera and gentle living
> atmosphere: dust motes drifting in the light, soft daylight slowly shifting across the
> concrete, faint haze in the air. The shot ends at rest in a calm, light-filled ground
> floor space, warm amber daylight pooling on a smooth floor, with open empty space in the
> upper center of the frame. Cinematic, photorealistic. No text, no logos, no lettering anywhere.

Why this version: the earlier prompt had "floor after floor of balconies and thin steel
railings." Thin repeating railings are exactly the fine detail AI video warps and morphs
when the camera moves past them, which is what breaks the middle of the shot. This version
keeps the surfaces simple and solid and adds an explicit "no morphing, no warping," so the
structure holds steady while light and haze carry the motion. Keep the move slow: fast
camera moves make the model invent geometry and glitch.

### If it still breaks in the middle, use this fallback

Light and haze almost never break, because there is no hard structure to get wrong:

> One continuous shot, no cuts. A slow, steady downward glide through a tall shaft of
> daylight and soft haze inside a minimal concrete atrium. Mostly glowing light, drifting
> dust, and smooth concrete surfaces sliding gently upward past the camera as it descends.
> Simple bold forms, nothing intricate, nothing that bends or morphs. Ends resting in a
> warm, softly glowing open space below. Cinematic, photorealistic. No text, no logos, no
> lettering anywhere.

Tips: keep it 6 seconds (a longer clip invents more and breaks more), and AI video varies
per take, so if one roll warps, just roll again. You do not need it perfect: send me
whatever take you get, even with a small wobble, and I can trim the clip to just the clean
stretch. The site maps scrolling to progress, not to seconds, so a shorter clip costs
nothing anywhere else.

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

- Double-clicking `index.html` now plays the scrolling video in Chrome and Edge, using a
  direct-file fallback for when the browser blocks the usual streamed load.
- Safari is stricter about local files and may show the still hero on a double-click. The
  fully reliable way, and how a real visitor sees it, is served over http: run
  `python -m http.server` in this folder and open `http://localhost:8000`, or just deploy it.
