# TimeFlow — web version (test on PC, then host on cPanel)

The entire web app is the [`www/`](www/) folder. It's a static site — no server
code, no database — so it runs anywhere that serves files over HTTP(S).

```
www/
  index.html            the app
  chart.min.js          bundled charts (offline)
  manifest.webmanifest  makes it installable as a PWA
  sw.js                 service worker (offline support)
  .htaccess             cPanel/Apache config (forces HTTPS, caching)
  icons/ favicon.png apple-touch-icon.png
```

---

## 1. Test it on your PC now

**Quickest:** double-click `www/index.html` — it opens in your browser and fully
works (your data saves locally). Note: the *installable PWA* features and offline
service worker only activate over a real server address, not a `file://` path.

**Full test (recommended)** — serve the folder locally:

- If you have **Python** (usually preinstalled):
  ```
  cd www
  python -m http.server 8080
  ```
  Then open **http://localhost:8080**

- If you have **Node.js**:
  ```
  npx serve www
  ```
  Then open the URL it prints (e.g. http://localhost:3000).

Over `localhost` the service worker registers and you can test offline: load the
page, stop the server, refresh — it still works.

---

## 2. Put it on your Namecheap cPanel

1. Log in to **cPanel → File Manager**.
2. Go to `public_html`. To serve it at your root domain, upload the **contents of
   `www/`** here. To serve it at `yourdomain.com/timeflow`, make a `timeflow`
   folder inside `public_html` and upload there instead.
3. Upload the zip (`timeflow-web.zip`), then right-click → **Extract**.
   - In File Manager, turn on **Settings → Show Hidden Files** so the `.htaccess`
     file is visible and gets extracted too.
4. Make sure **SSL is on** for the domain (cPanel → **SSL/TLS Status** →
   *Run AutoSSL*). The `.htaccess` forces HTTPS, which the app needs for PWA
   install and for Microsoft sign-in later.
5. Visit your URL. On iPhone Safari: **Share → Add to Home Screen** to install it
   like an app.

---

## 3. Updating the site later

When the app changes, re-upload the changed files (at minimum `index.html`) and
**bump `CACHE_VERSION` in `sw.js`** (e.g. `timeflow-v1` → `timeflow-v2`) so
visitors' browsers pick up the new version instead of the cached one.

---

## Note on the two builds

`www/` is the single source for **both** the web/PWA version *and* the native iOS
app (see `README-iOS.md`). Edit the app once here; the native app picks up changes
via `npx cap sync`. The service worker and manifest are simply ignored inside the
native shell, so they don't interfere.
