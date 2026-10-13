
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

    let shooters = [];

    function spawnShooter() {
      shooters.push({
        x: Math.random() * width * 0.7,
        y: Math.random() * height * 0.4,
        vx: 4 + Math.random() * 4,
        vy: 1.5 + Math.random() * 2.5,
        life: 1
      });
    }

    function drawStars(time) {
      context.clearRect(0, 0, width, height);

      const scrollOffset = window.scrollY || 0;

      for (const star of stars) {
        const pulse = reduceMotion
          ? 1
          : 0.72 + Math.sin(time * star.speed + star.phase) * 0.28;

        const shifted = (star.y - scrollOffset * star.speed * 25) % height;
        const drawY = shifted < 0 ? shifted + height : shifted;

        context.beginPath();
        context.arc(star.x, drawY, star.radius, 0, Math.PI * 2);

        context.fillStyle = `rgba(255, 239, 255, ${star.alpha * pulse})`;
        context.fill();
      }

      if (!reduceMotion) {
        if (Math.random() < 0.004 && shooters.length < 3) {
          spawnShooter();
        }

        for (let i = shooters.length - 1; i >= 0; i -= 1) {
          const shooter = shooters[i];
          shooter.x += shooter.vx;
          shooter.y += shooter.vy;
          shooter.life -= 0.012;

          const tail = context.createLinearGradient(
            shooter.x,
            shooter.y,
            shooter.x - shooter.vx * 12,
            shooter.y - shooter.vy * 12
          );
          tail.addColorStop(
            0,
            `rgba(255, 240, 255, ${Math.max(shooter.life, 0)})`
          );
          tail.addColorStop(1, "rgba(255, 240, 255, 0)");

          context.strokeStyle = tail;
          context.lineWidth = 1.6;
          context.beginPath();
          context.moveTo(shooter.x, shooter.y);
          context.lineTo(
            shooter.x - shooter.vx * 12,
            shooter.y - shooter.vy * 12
          );
          context.stroke();

          if (
            shooter.life <= 0 ||
            shooter.x > width + 120 ||
            shooter.y > height + 120
          ) {
            shooters.splice(i, 1);
          }
        }

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

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("mena-theme");
  } catch {
    // Choose a theme automatically below.
  }

  if (!savedTheme) {
    const hour = new Date().getHours();
    savedTheme = hour >= 7 && hour < 19 ? "light" : "dark";
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

  // Love-letter reveal (with a gentle typewriter).
  const revealButton = document.getElementById("reveal-letter");
  const letterContent = document.getElementById("letter-content");

  if (revealButton && letterContent) {
    const paragraphs = Array.from(letterContent.querySelectorAll("p"));
    const reduceType = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    paragraphs.forEach((p) => {
      p.dataset.full = p.textContent;
    });

    let typing = false;

    function playRevealAnimation() {
      letterContent.classList.remove("is-revealing");
      void letterContent.offsetWidth;
      letterContent.classList.add("is-revealing");
    }

    function typeAll() {
      typing = true;
      revealButton.disabled = true;
      const texts = paragraphs.map((p) => p.dataset.full);
      paragraphs.forEach((p) => {
        p.textContent = "";
      });

      let paragraphIndex = 0;
      let charIndex = 0;

      function tick() {
        if (paragraphIndex >= paragraphs.length) {
          typing = false;
          revealButton.disabled = false;
          revealButton.textContent = "Read it again \u2661";
          return;
        }

        const full = texts[paragraphIndex];
        const step = 2 + Math.floor(Math.random() * 3);
        charIndex = Math.min(charIndex + step, full.length);
        paragraphs[paragraphIndex].textContent = full.slice(0, charIndex);

        if (charIndex >= full.length) {
          paragraphIndex += 1;
          charIndex = 0;
        }

        window.setTimeout(tick, 12);
      }

      tick();
    }

    revealButton.addEventListener("click", () => {
      if (typing) {
        return;
      }

      if (reduceType || !paragraphs.length) {
        playRevealAnimation();
        revealButton.textContent = "Read it again \u2661";
        return;
      }

      playRevealAnimation();
      typeAll();
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
