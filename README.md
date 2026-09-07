# Excello — cinematic design-build website

A scroll-driven, six-page website for **Excello**, a design-build firm in
Mount Lavinia. The home page tells the firm's story as one continuous film
you scroll through — **land → design → engineering → construction →
handover** — with the real content resting between the chapters. Built to
the Excello design document with the *10k-websites* and *cinematic-scroll*
patterns: Lenis smooth scroll, image parallax, and a scroll-scrubbed film
that is ready for video the moment you have it.

Plain **HTML, CSS, and vanilla JavaScript** on a small **PHP + MySQL**
back end so the team can run projects, articles, and enquiries from a simple
admin. No build step, no frameworks. One folder.

---

## Run it on XAMPP (about 2 minutes)

1. Install **XAMPP** and open the **XAMPP Control Panel**.
2. Start **Apache** and **MySQL**.
3. Copy this whole folder into `xampp/htdocs/` so you have
   `xampp/htdocs/excello/`.
4. Open **http://localhost/excello/** in your browser.

That's it. On the first visit the site **creates its own database and
tables and adds starter content** — you do not need to touch phpMyAdmin.

> If your MySQL has a root password, set it in `inc/config.php` (`DB_PASS`).
> If you put the site at a different path or the web root, update
> `BASE_PATH` in `inc/config.php` (e.g. `''` for the web root).

The full scroll film runs on **laptops and desktops**. On phones and with
reduced-motion, each chapter becomes a still poster with the same words —
by design, so the page is always fast and readable.

---

## The admin

Open **http://localhost/excello/admin/** (or click *Admin* in the footer).

- **Username:** `admin`
- **Password:** `excello2026`

Change both in `inc/config.php` before going live.

From the admin the team can:

- **Projects** — add, edit, reorder, mark as *featured on the home page*.
- **Articles** — write and publish Insights posts, or keep them as drafts.
- **Enquiries** — every contact-form submission lands here; mark done or delete.

Covers can be typed (a filename in `assets/img/`) or uploaded straight from
the form.

---

## Your images and videos

The site ships with palette-matched posters so nothing looks empty. To use
your real assets, just drop files in — **no code changes**:

- **Home film photos:** `assets/img/chapter-01.jpg … chapter-04.jpg`
- **Home film videos (later):** `assets/video/chapter-01.mp4 … chapter-04.mp4`

See `assets/img/README.txt` for the exact names and what each chapter shows.
A video is used automatically when present; otherwise the photo, then the
poster. For the smoothest scroll-scrub video later, encode **all-intra
(GOP 1)** — see the cinematic-scroll skill's `encode-hero.sh`.

---

## The pages

| Page | What it is |
|------|------------|
| `/` | The four-chapter scroll film with *Our process*, *What we do*, and *Selected Projects* between the chapters |
| `/projects.php` | Filterable grid (villas, houses, hotels, commercial); Sea Esta leads |
| `/services.php` | The land-to-handover lifecycle |
| `/team.php` | The people who hold each stage |
| `/insights.php` | Articles + the **Construction Cost Calculator** |
| `/contact.php` | Enquiry form, address, phone, and map |

## The contact form

Submissions are saved to the database (visible in the admin) **and** emailed
to `Sales@excello.lk` on hosts that have mail configured. Local XAMPP does
not send real email out of the box — the enquiry still saves and shows in the
admin, which is what matters in development.

## The cost calculator

Runs entirely in the browser from a rate table in `inc/config.php`
(`$COST_RATES`, LKR per sq ft). Edit those numbers and the calculator
updates.

---

## Files

```
excello/
├── index.php              home — the 4-chapter film
├── projects.php  services.php  team.php  insights.php  contact.php
├── inc/                   config, db (self-installing), shared nav/head/footer
├── admin/                 login + Projects / Articles / Enquiries
├── assets/
│   ├── css/               style.css, lenis.css
│   ├── js/                app.js (parallax + film engine), lenis.min.js
│   ├── img/posters/       palette-matched SVG posters (fallbacks)
│   ├── img/               ← drop chapter-01…04.jpg here
│   └── video/             ← drop chapter-01…04.mp4 here (later)
└── sql/excello.sql        optional manual import (not needed normally)
```

---

## Notes / next steps

- **Fonts** are the modern-luxury pair from the brief (Cormorant Garamond +
  Jost), loaded from Google Fonts. Swap them in `inc/head.php` if the brand
  adopts its own faces.
- **Videos** are the one thing still to come; everything is wired for them.
- Before going live: change the admin password, set `DB_PASS` if needed, and
  point `BASE_PATH` at the real path.
