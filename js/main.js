
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // Keep the star canvas behind the page content.
  const canvas = document.getElementById("starfield");
  const context = canvas?.getContext("2d");

  if (canvas && context) {
    let stars = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        Math.floor((width * height) / 8500),
        180
      );

      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.35 + 0.25,
        alpha: Math.random() * 0.55 + 0.25,
        speed: Math.random() * 0.012 + 0.003,
        phase: Math.random() * Math.PI * 2
      }));

      drawStars(0);
    }

    function drawStars(time) {
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        const pulse = reduceMotion
          ? 1
          : 0.72 + Math.sin(time * star.speed + star.phase) * 0.28;

        context.beginPath();
        context.arc(
          star.x,
          star.y,
          star.radius,
          0,
          Math.PI * 2
        );

        context.fillStyle = `rgba(255, 239, 255, ${star.alpha * pulse})`;
        context.fill();
      }

      if (!reduceMotion) {
        animationFrame = window.requestAnimationFrame(drawStars);
      }
    }

    resizeCanvas();

    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(animationFrame);
      resizeCanvas();
    });
  }

  // Persistent light/dark theme.
  const themeButtons = document.querySelectorAll(".theme-toggle");

  function setTheme(theme) {
    document.body.classList.toggle("light-theme", theme === "light");

    themeButtons.forEach((button) => {
      button.textContent = theme === "light" ? "Dark theme" : "Light theme";
      button.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
    });

    try {
      localStorage.setItem("mena-theme", theme);
    } catch {
      // The theme still works if browser storage is unavailable.
    }
  }

  let savedTheme = "dark";

  try {
    savedTheme = localStorage.getItem("mena-theme") || "dark";
  } catch {
    // Use dark mode by default.
  }

  setTheme(savedTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("light-theme")
        ? "dark"
        : "light";

      setTheme(nextTheme);
    });
  });

  // Mobile navigation.
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".nav-links");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
      menuButton.textContent = isOpen ? "Close" : "Menu";
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
        menuButton.textContent = "Menu";
      });
    });
  }

  // Home-page wish button.
  const wishButton = document.getElementById("wish-button");
  const wishMessage = document.getElementById("wish-message");

  if (wishButton && wishMessage) {
    const wishes = [
      "May a little happiness find you today. ✨",
      "May you always find reasons to smile. 🌷",
      "May the good things in life surprise you. 🌙",
      "May your next chapter bring something beautiful. 💗"
    ];

    wishButton.addEventListener("click", () => {
      const wish = wishes[Math.floor(Math.random() * wishes.length)];
      wishMessage.textContent = wish;
    });
  }

  // Love-letter reveal.
  const revealButton = document.getElementById("reveal-letter");
  const letterContent = document.getElementById("letter-content");

  if (revealButton && letterContent) {
    revealButton.addEventListener("click", () => {
      letterContent.classList.remove("is-revealing");

      // Restart the animation when the button is clicked again.
      void letterContent.offsetWidth;

      letterContent.classList.add("is-revealing");
      revealButton.textContent = "Read it again ♡";
    });
  }

  // Floating back-to-top button.
  const backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.textContent = "Back to top \u2191";
  backToTop.setAttribute("aria-label", "Back to top");
  document.body.appendChild(backToTop);

  function updateBackToTop() {
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  }

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener("click", () => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  });

  // Gentle scroll reveal for content blocks.
  const revealTargets = document.querySelectorAll(
    ".feature-card, .timeline-item, .memory-card, .section h2, .page-heading, .games-grid"
  );
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (revealTargets.length) {
    if (!("IntersectionObserver" in window) || prefersReduced) {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    } else {
      revealTargets.forEach((el) => el.classList.add("js-reveal"));
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealTargets.forEach((el) => observer.observe(el));
    }
  }

  // "More" dropdown in the navigation.
  document.querySelectorAll(".nav-more").forEach((more) => {
    const toggle = more.querySelector(".nav-more-toggle");

    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = more.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", (event) => {
      if (!more.contains(event.target)) {
        more.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        more.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });
});
