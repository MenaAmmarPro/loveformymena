"use strict";

/*
 * Reminders + notifications.
 *
 * - Adds a footer control on every page to add a daily calendar reminder
 *   (.ics download) or enable browser notifications.
 * - Shows a friendly banner when you return after a day away.
 * - Fires a browser notification each day at your chosen time, while a tab
 *   is open. (A closed browser can't be woken without real push.)
 * - If you paste a OneSignal App ID below, it also registers for true push
 *   that works even when the site is closed. See README "Notifications".
 */

(function () {
  const LAST_VISIT_KEY = "mena-last-visit";
  const DISMISS_KEY = "mena-banner-dismissed";
  const SETTINGS_KEY = "mena-reminder";
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DEFAULT_TIME = "19:00";

  // Paste your OneSignal App ID here to enable closed-browser push.
  // Example: "6f1c8b2e-...."
  const ONESIGNAL_APP_ID = "";

  // Resolve the site base from this script's own <script> tag so links work
  // on every page, including 404.html served from arbitrary URLs.
  const scriptEl = document.querySelector('script[src$="js/notifications.js"]');
  const BASE = scriptEl ? new URL("../", scriptEl.src).href : "";
  const REMINDER_URL = BASE + "assets/mena-reminder.ics";
  const ICON = BASE + "assets/apple-touch-icon.png";

  let settings = { enabled: false, time: DEFAULT_TIME, lastReminded: "" };

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      settings = Object.assign(settings, JSON.parse(raw));
    }
  } catch (error) {
    settings = { enabled: false, time: DEFAULT_TIME, lastReminded: "" };
  }

  function save() {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      // Keep working without storage.
    }
  }

  function dayKey(date) {
    const d = date || new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function daysSince(timestamp) {
    return Math.floor((Date.now() - timestamp) / DAY_MS);
  }

  function canNotify() {
    return "Notification" in window;
  }

  function showNotification(title, body) {
    if (!canNotify() || window.Notification.permission !== "granted") {
      return;
    }

    const options = { body: body, icon: ICON, badge: ICON, tag: "mena-reminder" };

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((registration) => registration.showNotification(title, options))
        .catch(() => {
          try {
            new window.Notification(title, options);
          } catch (error) {
            // Ignore.
          }
        });
      return;
    }

    try {
      new window.Notification(title, options);
    } catch (error) {
      // Ignore.
    }
  }

  function enableReminder() {
    if (!canNotify()) {
      return false;
    }

    if (window.Notification.permission === "granted") {
      settings.enabled = true;
      save();
      return true;
    }

    if (window.Notification.permission === "denied") {
      return false;
    }

    const result = window.Notification.requestPermission((permission) => {
      if (permission === "granted") {
        settings.enabled = true;
        save();
        showNotification("Reminders on \u2665", "I'll nudge you each day to come say hi.");
      }
    });

    if (result && typeof result.then === "function") {
      result.then((permission) => {
        if (permission === "granted") {
          settings.enabled = true;
          save();
          showNotification("Reminders on \u2665", "I'll nudge you each day to come say hi.");
        }
      });
    }

    return true;
  }

  function checkSchedule() {
    if (!settings.enabled) {
      return;
    }

    const now = new Date();
    const key = dayKey(now);

    if (settings.lastReminded === key) {
      return;
    }

    const parts = (settings.time || DEFAULT_TIME).split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

    if (now >= target) {
      settings.lastReminded = key;
      save();
      showNotification("Come say hi to Mena \u2665", "Open our little universe whenever you're ready.");
    }
  }

  function makeButton(label, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    return button;
  }

  function mountBanner(daysAway) {
    if (document.querySelector(".reminder-banner")) {
      return;
    }

    const bar = document.createElement("div");
    bar.className = "reminder-banner";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Reminder");

    const message = document.createElement("span");
    message.className = "reminder-banner-text";
    message.textContent =
      daysAway >= 2
        ? "It's been " + daysAway + " days \u2014 our little universe missed you \u2665"
        : "Welcome back \u2014 want a gentle daily nudge to visit?";

    const actions = document.createElement("span");
    actions.className = "reminder-banner-actions";

    const enable = makeButton("Remind me daily", "button button-primary reminder-banner-btn");
    enable.addEventListener("click", () => {
      if (enableReminder()) {
        bar.remove();
      }
    });

    const calendar = document.createElement("a");
    calendar.className = "button reminder-banner-btn";
    calendar.href = REMINDER_URL;
    calendar.setAttribute("download", "");
    calendar.textContent = "Add to calendar";

    const dismiss = makeButton("\u00d7", "reminder-banner-dismiss");
    dismiss.setAttribute("aria-label", "Dismiss reminder");
    dismiss.addEventListener("click", () => {
      try {
        window.localStorage.setItem(DISMISS_KEY, dayKey());
      } catch (error) {
        // Ignore.
      }
      bar.remove();
    });

    actions.appendChild(enable);
    actions.appendChild(calendar);
    actions.appendChild(dismiss);

    bar.appendChild(message);
    bar.appendChild(actions);
    document.body.appendChild(bar);
  }

  function mountFooterControls() {
    const footer = document.querySelector(".site-footer");
    if (!footer || footer.querySelector(".footer-reminders")) {
      return;
    }

    const line = document.createElement("p");
    line.className = "footer-reminders";

    const calendar = document.createElement("a");
    calendar.className = "reminder-link";
    calendar.href = REMINDER_URL;
    calendar.setAttribute("download", "");
    calendar.textContent = "Add daily reminder";

    const separator = document.createElement("span");
    separator.className = "reminder-sep";
    separator.textContent = "\u00b7";

    const enable = makeButton("Enable notifications", "reminder-link reminder-enable");
    const status = document.createElement("span");
    status.className = "reminder-status";
    status.setAttribute("aria-live", "polite");

    enable.addEventListener("click", () => {
      if (enableReminder()) {
        status.textContent = "Reminders on \u2665";
      } else {
        status.textContent = "Notifications are blocked in your browser.";
      }
    });

    line.appendChild(calendar);
    line.appendChild(separator);
    line.appendChild(enable);
    line.appendChild(status);
    footer.appendChild(line);
  }

  function initOneSignal() {
    if (!ONESIGNAL_APP_ID) {
      return;
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((OneSignal) => {
      OneSignal.init({ appId: ONESIGNAL_APP_ID, allowLocalhostAsSecureOrigin: true });
    });

    const sdk = document.createElement("script");
    sdk.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    sdk.defer = true;
    document.head.appendChild(sdk);
  }

  function start() {
    mountFooterControls();
    initOneSignal();

    let last = 0;
    try {
      last = parseInt(window.localStorage.getItem(LAST_VISIT_KEY) || "0", 10) || 0;
    } catch (error) {
      last = 0;
    }

    const daysAway = last ? daysSince(last) : 0;

    let dismissedToday = false;
    try {
      dismissedToday = window.localStorage.getItem(DISMISS_KEY) === dayKey();
    } catch (error) {
      dismissedToday = false;
    }

    try {
      window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    } catch (error) {
      // Ignore.
    }

    if (last && daysAway >= 1 && !dismissedToday) {
      mountBanner(daysAway);
    }

    checkSchedule();
    window.setInterval(checkSchedule, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
