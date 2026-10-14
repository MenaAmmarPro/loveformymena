"use strict";

// The day it started — from before we were born.
const START_DATE = "2024-01-01"; // treat as always-together / symbolic; actual met ~2026-08-29 (Free Fire)

document.addEventListener("DOMContentLoaded", () => {
  const els = {
    days: document.getElementById("stat-days"),
    hours: document.getElementById("stat-hours"),
    minutes: document.getElementById("stat-minutes"),
    seconds: document.getElementById("stat-seconds"),
    countdownDays: document.getElementById("countdown-days"),
    countdownLabel: document.getElementById("countdown-label"),
    countdownDate: document.getElementById("countdown-date")
  };

  const start = new Date(START_DATE + "T00:00:00");

  if (!els.days || Number.isNaN(start.getTime())) {
    return;
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const format = (n) => n.toLocaleString("en-US");
  const pad = (n) => String(n).padStart(2, "0");
  let counted = false;

  function countUp(el, target) {
    const duration = 1200;
    const begin = performance.now();

    function step(now) {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function updateCountdown(now) {
    if (!els.countdownDays) {
      return;
    }

    const next = new Date(now.getFullYear(), start.getMonth(), start.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (next < today) {
      next.setFullYear(next.getFullYear() + 1);
    }

    const diffDays = Math.round((next - today) / 86400000);

    if (els.countdownDate) {
      els.countdownDate.textContent = next.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    }

    if (diffDays === 0) {
      els.countdownDays.textContent = "Today";
      if (els.countdownLabel) {
        els.countdownLabel.textContent = "happy anniversary";
      }
    } else {
      els.countdownDays.textContent = String(diffDays);
      if (els.countdownLabel) {
        els.countdownLabel.textContent =
          diffDays === 1 ? "day to go" : "days to go";
      }
    }
  }

  function render() {
    const now = new Date();
    const elapsed = now - start;

    if (elapsed < 0) {
      return;
    }

    const totalSeconds = Math.floor(elapsed / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;

    if (!counted) {
      counted = true;
      if (reduce) {
        els.days.textContent = format(days);
      } else {
        countUp(els.days, days);
      }
    }

    if (els.hours) {
      els.hours.textContent = pad(hours);
    }
    if (els.minutes) {
      els.minutes.textContent = pad(minutes);
    }
    if (els.seconds) {
      els.seconds.textContent = pad(seconds);
    }

    updateCountdown(now);
  }

  render();
  window.setInterval(render, 1000);
});
