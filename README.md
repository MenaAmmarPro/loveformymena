
# Love for Mena ✦

A little corner of the universe, made with love for Mena — a personal
romantic website built with plain HTML, CSS, and vanilla JavaScript.

**Live site:** https://menaammarpro.github.io/loveformymena/

## Features

- Animated starry background (canvas) with shooting stars and parallax
- Responsive mobile navigation with a "More" menu
- Dark and light themes (remembered between visits, auto by time of day)
- Interactive wish button, heart bursts, sparkle cursor, and page transitions
- Love letter page with a typewriter reveal, print, and download
- Story timeline, memory gallery, and personal note page
- Extra pages: reasons, open-when letters, day counter, playlist, quiz,
  fortune cookie, bucket list, wishes wall, and a "for you" hub
- Ten mini-games (404 page) with unlockable badges
- Wishes wall powered by giscus + GitHub Discussions
- Daily reminders (calendar, browser notifications, optional push)
- Language toggle scaffold (`data-i18n` hooks)
- Installable PWA with offline support
- SEO: sitemap, robots, Open Graph / Twitter preview
- No framework or build step required

## Project structure

- `index.html` — home page
- `love-letter.html` — letter page
- `our-story.html` — story timeline
- `memories.html` — memory gallery
- `apology.html` — personal note
- `for-you.html` — hub of extra pages
- `reasons.html`, `open-when.html`, `counter.html`, `playlist.html`,
  `quiz.html`, `fortune.html`, `bucket.html`, `guestbook.html` — extra pages
- `404.html` — not-found page with mini-games
- `css/style.css` — shared styles
- `js/main.js`, `js/effects.js`, `js/i18n.js`, `js/notifications.js` — core scripts
- `js/reasons.js`, `js/counter.js`, `js/playlist.js`, `js/quiz.js`,
  `js/fortune.js`, `js/bucket.js`, `js/guestbook.js`, `js/games.js` — page scripts
- `sw.js`, `manifest.webmanifest` — PWA
- `assets/` — favicon, social image, icons, and the `.ics` reminder
- `.github/workflows/discussion-notify.yml` — comment alerts
- `LICENSE` — Creative Commons BY-NC-ND 4.0

## Run locally

Open `index.html` in a browser, or start a local server:

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

Press Ctrl+C in the terminal to stop the server.

## Notifications

### Daily reminder to visit

Three ways, all optional — controls live in the site footer:

1. **Calendar reminder** — the "Add daily reminder" link downloads
   `assets/mena-reminder.ics`, a repeating daily event. Add it to your phone
   or computer calendar so it fires even when the browser is closed.
2. **Browser notifications** — "Enable notifications" asks permission and
   shows a reminder each day at 19:00 while a tab is open (a closed browser
   can't be woken without push). The time lives in `localStorage` under
   `mena-reminder`.
3. **Real push (even when closed) via [OneSignal](https://onesignal.com/)** —
   free. Create an app, copy its **App ID**, and paste it into
   `ONESIGNAL_APP_ID` at the top of `js/notifications.js`. Visitors who allow
   notifications then receive pushes even when the site is closed.

Returning after a day away also shows a gentle banner.

### Comment alerts (when someone leaves a wish)

Comments are GitHub Discussions (via giscus). Notification options:

- **GitHub email (simplest)** — Mena makes a GitHub account and clicks
  **Watch** on this repository (or subscribes to the discussion). GitHub
  then emails her on every new comment. No setup here.
- **Email via GitHub Action** — add these repository secrets at
  *Settings → Secrets and variables → Actions*:
  `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_TO` (optionally `MAIL_SERVER`,
  `MAIL_PORT`, `MAIL_FROM`). The workflow sends the comment to her inbox.
- **Phone push via OneSignal** — add secrets `ONESIGNAL_APP_ID` and
  `ONESIGNAL_AUTH` (value: `Key <your OneSignal REST API key>`). Each new
  comment is pushed to subscribed devices.

The workflow is `.github/workflows/discussion-notify.yml`. Any channel with
no secret set is simply skipped, so the workflow never fails.

## Deployment

This is a static website and is deployed with GitHub Pages from the
`main` branch.

## License

Released under the [Creative Commons Attribution-NonCommercial-NoDerivatives
4.0 International (CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/)
license — you may share the work with attribution, but not for commercial use
and not as a modified version. See [`LICENSE`](LICENSE).

© 2026 Ammar (MenaAmmarPro). All personal content is shared with care.
