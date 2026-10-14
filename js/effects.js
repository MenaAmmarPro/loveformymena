"use strict";

// Little global effects shared by every page.
document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Service worker (PWA) ---------- */
  if ("serviceWorker" in navigator && window.location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {
        // Offline support simply stays unavailable.
      });
    });
  }

  /* ---------- Toast ---------- */
  let toastEl = null;
  let toastTimer = 0;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "fx-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Heart burst ---------- */
  function heartBurst(x, y, count) {
    if (reduce) {
      return;
    }

    const total = count || 14;

    for (let i = 0; i < total; i += 1) {
      const heart = document.createElement("span");
      heart.className = "fx-heart";
      heart.textContent = "\u2665";

      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 100;

      heart.style.left = x + "px";
      heart.style.top = y + "px";
      heart.style.fontSize = 12 + Math.random() * 16 + "px";
      heart.style.setProperty("--fx-x", Math.cos(angle) * distance + "px");
      heart.style.setProperty("--fx-y", Math.sin(angle) * distance + "px");

      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 950);
    }
  }

  function centerOf(el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  ["wish-button", "reveal-letter", "reason-button", "fortune-cookie"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        const point = centerOf(el);
        heartBurst(point.x, point.y, id === "fortune-cookie" ? 20 : 14);
      });
    }
  });

  /* ---------- Sparkle cursor ---------- */
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (canHover && !reduce) {
    let last = 0;

    document.addEventListener("mousemove", (event) => {
      const now = performance.now();
      if (now - last < 55) {
        return;
      }
      last = now;

      const spark = document.createElement("span");
      spark.className = "fx-sparkle";
      spark.style.left = event.clientX + "px";
      spark.style.top = event.clientY + "px";
      spark.style.setProperty("--fx-dx", (Math.random() * 20 - 10) + "px");
      spark.style.setProperty("--fx-dy", (Math.random() * 20 - 10) + "px");

      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 700);
    });
  }

  /* ---------- Floating buttons (music + share) ---------- */
  const stack = document.createElement("div");
  stack.className = "float-stack";

  const music = document.createElement("button");
  music.type = "button";
  music.className = "float-btn";
  music.textContent = "Music";
  music.setAttribute("aria-label", "Play background music");
  music.setAttribute("title", "Background music (generated live)");

  function setMusicLabel(playing) {
    music.textContent = playing ? "Mute" : "Music";
    music.setAttribute(
      "aria-label",
      playing ? "Mute background music" : "Play background music"
    );
  }

  music.addEventListener("click", () => {
    const engine = window.MenaMusic;

    if (!engine || !engine.supported()) {
      toast("This browser cannot play the generated music");
      return;
    }

    if (engine.isPlaying(engine.AMBIENT.id)) {
      engine.stop();
      setMusicLabel(false);
      try {
        localStorage.setItem("mena-music", "off");
      } catch {
        // Ignore storage errors.
      }
    } else {
      engine.play(engine.AMBIENT);
      setMusicLabel(true);
      try {
        localStorage.setItem("mena-music", "on");
      } catch {
        // Ignore storage errors.
      }
    }
  });

  stack.appendChild(music);

  const share = document.createElement("button");
  share.type = "button";
  share.className = "float-btn";
  share.textContent = "Share";
  share.setAttribute("aria-label", "Share this page");

  share.addEventListener("click", () => {
    const data = { title: document.title, url: window.location.href };

    if (navigator.share) {
      navigator.share(data).catch(() => {
        // The user dismissed the share sheet.
      });
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast("Link copied \u2665"))
        .catch(() => toast(window.location.href));
    } else {
      toast(window.location.href);
    }
  });

  stack.appendChild(share);
  document.body.appendChild(stack);

  // If music was left on, start it on the next interaction (browsers only
  // allow audio to begin after a gesture).
  try {
    if (localStorage.getItem("mena-music") === "on") {
      document.addEventListener(
        "pointerdown",
        () => {
          const engine = window.MenaMusic;
          if (engine && engine.supported() && !engine.playingId()) {
            engine.play(engine.AMBIENT);
            setMusicLabel(true);
          }
        },
        { once: true }
      );
    }
  } catch {
    // Ignore storage errors.
  }

  /* ---------- Letter: print + download ---------- */
  const printButton = document.getElementById("print-letter");
  const downloadButton = document.getElementById("download-letter");
  const letterContent = document.getElementById("letter-content");

  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  if (downloadButton && letterContent) {
    downloadButton.addEventListener("click", () => {
      const text = [
        "Dear Mena,",
        "",
        letterContent.innerText.trim(),
        "",
        "Always, Ammar"
      ].join("\n");

      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "a-letter-for-mena.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast("Saved as a letter file");
    });
  }

  /* ---------- Reason of the day (home only) ---------- */
  const reasonToday = document.getElementById("reason-of-day");

  if (reasonToday && typeof REASONS !== "undefined" && REASONS.length) {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - start) / 86400000);
    reasonToday.textContent = REASONS[dayOfYear % REASONS.length];
  }

  /* ---------- Page transitions ---------- */
  if (!reduce) {
    document.body.classList.add("page-in");

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");

      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const href = link.getAttribute("href");

      if (
        !href ||
        href.charAt(0) === "#" ||
        href.indexOf("http") === 0 ||
        href.indexOf("mailto:") === 0
      ) {
        return;
      }

      event.preventDefault();
      document.body.classList.add("page-out");
      window.setTimeout(() => {
        window.location.href = href;
      }, 240);
    });
  }

  /* ---------- 3D card tilt ---------- */
  if (canHover && !reduce) {
    document.querySelectorAll(".feature-card, .memory-card").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.transform =
          "perspective(700px) rotateX(" +
          (-py * 6).toFixed(2) +
          "deg) rotateY(" +
          (px * 6).toFixed(2) +
          "deg) translateY(-2px)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Loading splash (once per session) ---------- */
  let splashSeen = false;

  try {
    splashSeen = sessionStorage.getItem("mena-splash") === "1";
  } catch {
    // Ignore storage errors.
  }

  if (!splashSeen && !reduce) {
    try {
      sessionStorage.setItem("mena-splash", "1");
    } catch {
      // Ignore storage errors.
    }

    const splash = document.createElement("div");
    splash.className = "fx-splash";
    splash.setAttribute("aria-hidden", "true");

    const heart = document.createElement("span");
    heart.className = "fx-splash-heart";
    heart.textContent = "\u2665";
    splash.appendChild(heart);
    document.body.appendChild(splash);

    window.setTimeout(() => splash.classList.add("is-hiding"), 850);
    window.setTimeout(() => splash.remove(), 1500);
  }

  /* ---------- Easter egg ---------- */
  const KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  let progress = 0;

  document.addEventListener("keydown", (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if (key === KONAMI[progress]) {
      progress += 1;
      if (progress === KONAMI.length) {
        progress = 0;
        heartBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
        toast("You found the secret \u2665");
      }
    } else {
      progress = key === KONAMI[0] ? 1 : 0;
    }
  });

  /* ---------- Shared helpers for other scripts ---------- */
  window.fxToast = toast;
  window.heartBurst = heartBurst;
});
