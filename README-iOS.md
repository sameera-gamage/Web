# TimeFlow → iOS app (Capacitor)

This repo wraps the **TimeFlow** web app in [Capacitor](https://capacitorjs.com/)
so it can run as a native iOS app and be submitted to the App Store.

The web app lives in [`www/`](www/) as a single self-contained page. Capacitor
loads it inside a native iOS shell. Your data is stored on-device via
`localStorage`, and the Analytics charts (Chart.js) are bundled locally so
everything works fully offline.

```
www/            the app that ships inside the native shell
  index.html    the whole app (UI + logic)
  chart.min.js  bundled Chart.js (offline; copied from npm on install)
resources/      icon.png + splash.png sources for icon/splash generation
capacitor.config.json
package.json
scripts/        build helpers (copy Chart.js, generate icon/splash)
```

---

## What you need (all on a Mac)

Capacitor's iOS build can only be produced on macOS.

1. **A Mac** with **Xcode** (from the Mac App Store).
2. **Node.js 18+** — https://nodejs.org
3. **CocoaPods**: `sudo gem install cocoapods` (or `brew install cocoapods`)
4. To run on a *physical iPhone* or ship to the App Store: a free Apple ID
   works for installing on your own device; the **Apple Developer Program
   ($99/year)** is required for App Store distribution.

---

## First-time setup

From the project root on your Mac:

```bash
# 1. Install dependencies (also copies Chart.js into www/)
npm install

# 2. (optional) regenerate the app icon + splash from resources/
npm install --no-save sharp
node scripts/make-assets.js

# 3. Add the native iOS project (creates the ios/ folder)
npx cap add ios

# 4. Copy the web app + config into the native project
npx cap sync ios

# 5. Open the project in Xcode
npx cap open ios
```

### Set the app icon & splash (optional but recommended)

```bash
npm install --no-save @capacitor/assets
npx @capacitor/assets generate --ios
npx cap sync ios
```

This reads `resources/icon.png` and `resources/splash.png` and fills in every
required iOS icon/splash size.

---

## Run it

In Xcode:

1. Select a target device (a **Simulator**, or your iPhone plugged in via USB).
2. For a real device: open **Signing & Capabilities**, pick your Apple ID under
   **Team**, and let Xcode manage signing.
3. Press **▶ Run**.

The app installs and launches TimeFlow as a native app.

---

## After you change the app

Whenever you edit anything in `www/`:

```bash
npx cap sync ios      # push the latest web assets into the native project
```

Then re-run from Xcode. (`npx cap copy ios` is the faster subset if you only
changed web files and no plugins.)

---

## App identity

Set in [`capacitor.config.json`](capacitor.config.json):

- **appId**: `live.rapidsolutions.timeflow` — your reverse-domain bundle ID.
  This must be **unique in the App Store**; change it if you own a different
  domain. It also has to match the Bundle Identifier you register in your
  Apple Developer account.
- **appName**: `TimeFlow` — the name under the icon.

Change these *before* `npx cap add ios` if you want them baked in from the
start (otherwise update them in Xcode too).

---

## Ship to the App Store (later)

1. In Xcode: **Product → Archive**.
2. In the Organizer window: **Distribute App → App Store Connect**.
3. Create the app listing at https://appstoreconnect.apple.com (name,
   screenshots, privacy details — TimeFlow collects no data and needs no
   special permissions, which keeps the privacy questionnaire simple).
4. Submit for review.

---

## Optional next step: real reminder notifications

Right now reminders and the Pomodoro timer are visual only. To have iOS fire a
real notification even when the app is closed, add Capacitor's local
notifications plugin:

```bash
npm install @capacitor/local-notifications
npx cap sync ios
```

Then schedule a notification when a reminder is created, e.g.:

```js
import { LocalNotifications } from '@capacitor/local-notifications';

await LocalNotifications.requestPermissions();
await LocalNotifications.schedule({
  notifications: [{
    id: Date.now() % 100000,
    title: 'Reminder',
    body: reminder.text,
    schedule: { at: new Date(/* reminder date + time */) }
  }]
});
```

This is optional — the app is fully functional without it.
