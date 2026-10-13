"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Bubble pop ----
  (function bubbleGame() {
    const field = document.getElementById("game-bubbles");
    const scoreEl = document.getElementById("bubble-score");
    if (!field || !scoreEl) return;

    let score = 0;

    function spawn() {
      const bubble = document.createElement("div");
      bubble.className = "bub";
      const size = 26 + Math.random() * 12;
      bubble.style.width = size + "px";
      bubble.style.height = size + "px";
      bubble.style.left = Math.random() * Math.max(1, field.clientWidth - size) + "px";
      bubble.style.top = Math.random() * Math.max(1, field.clientHeight - size) + "px";

      bubble.addEventListener("click", () => {
        if (bubble.classList.contains("is-popped")) return;
        bubble.classList.add("is-popped");
        score += 1;
        scoreEl.textContent = String(score);
        setTimeout(() => bubble.remove(), 220);
      });

      field.appendChild(bubble);
      setTimeout(() => {
        if (bubble.isConnected && !bubble.classList.contains("is-popped")) {
          bubble.remove();
        }
      }, 2800);
    }

    for (let i = 0; i < 5; i += 1) {
      setTimeout(spawn, i * 260);
    }
    setInterval(spawn, 950);
  })();

  // ---- Catch falling hearts ----
  (function heartGame() {
    const field = document.getElementById("game-hearts");
    const scoreEl = document.getElementById("heart-score");
    if (!field || !scoreEl) return;

    let score = 0;

    function spawn() {
      const heart = document.createElement("span");
      heart.className = "falling-heart";
      heart.innerHTML = "&#9829;";
      heart.style.left = Math.random() * Math.max(1, field.clientWidth - 26) + "px";
      heart.style.top = "-12px";

      heart.addEventListener("click", () => {
        score += 1;
        scoreEl.textContent = String(score);
        heart.remove();
      });

      field.appendChild(heart);

      if (reduce) {
        setTimeout(() => heart.remove(), 2600);
        return;
      }

      let top = -12;
      const speed = 0.8 + Math.random() * 1.3;

      (function fall() {
        if (!heart.isConnected) return;
        top += speed;
        heart.style.top = top + "px";
        if (top > field.clientHeight) {
          heart.remove();
          return;
        }
        requestAnimationFrame(fall);
      })();
    }

    setInterval(spawn, reduce ? 2000 : 1050);
  })();

  // ---- Memory match ----
  (function memoryGame() {
    const grid = document.getElementById("game-memory");
    const scoreEl = document.getElementById("memory-score");
    const movesEl = document.getElementById("memory-moves");
    const winEl = document.getElementById("memory-win");
    if (!grid || !scoreEl || !movesEl) return;

    const symbols = ["&#9829;", "&#9733;", "&#9789;", "&#10047;"];
    const deck = symbols.concat(symbols).sort(() => Math.random() - 0.5);

    let first = null;
    let lock = false;
    let matched = 0;
    let moves = 0;

    deck.forEach((symbol) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "memory-tile";
      tile.dataset.symbol = symbol;
      tile.innerHTML = symbol;

      tile.addEventListener("click", () => {
        if (lock || tile.classList.contains("is-up")) return;
        tile.classList.add("is-up");

        if (!first) {
          first = tile;
          return;
        }

        moves += 1;
        movesEl.textContent = String(moves);

        if (first.dataset.symbol === tile.dataset.symbol) {
          first = null;
          matched += 1;
          scoreEl.textContent = String(matched);
          if (matched === symbols.length && winEl) {
            winEl.textContent = "You matched them all \u2014 nicely done!";
          }
        } else {
          lock = true;
          const previous = first;
          first = null;
          setTimeout(() => {
            previous.classList.remove("is-up");
            tile.classList.remove("is-up");
            lock = false;
          }, 700);
        }
      });

      grid.appendChild(tile);
    });
  })();

  // ---- Pet the kitty ----
  (function kittyGame() {
    const field = document.getElementById("game-kitty");
    const kitty = document.getElementById("kitty");
    const scoreEl = document.getElementById("kitty-score");
    if (!field || !kitty || !scoreEl) return;

    let score = 0;

    function pet() {
      score += 1;
      scoreEl.textContent = String(score);

      const heart = document.createElement("span");
      heart.className = "float-heart";
      heart.innerHTML = "&#9829;";
      heart.style.left = kitty.offsetLeft + kitty.offsetWidth / 2 - 8 + (Math.random() * 24 - 12) + "px";
      heart.style.top = kitty.offsetTop + 4 + "px";
      field.appendChild(heart);
      setTimeout(() => heart.remove(), 1000);
    }

    kitty.addEventListener("click", pet);
    kitty.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        pet();
      }
    });
  })();

  // ---- Whack a heart ----
  (function whackGame() {
    const grid = document.getElementById("game-whack");
    const scoreEl = document.getElementById("whack-score");
    if (!grid || !scoreEl) return;

    const holes = [];
    for (let i = 0; i < 9; i += 1) {
      const hole = document.createElement("button");
      hole.type = "button";
      hole.className = "whack-hole";
      hole.setAttribute("aria-label", "Whack hole " + (i + 1));
      hole.addEventListener("click", () => {
        if (hole.dataset.active === "1") {
          const next = Number(scoreEl.textContent || "0") + 1;
          scoreEl.textContent = String(next);
          hole.innerHTML = "";
          delete hole.dataset.active;
        }
      });
      grid.appendChild(hole);
      holes.push(hole);
    }

    function pop() {
      holes.forEach((hole) => {
        hole.innerHTML = "";
        delete hole.dataset.active;
      });
      const hole = holes[Math.floor(Math.random() * holes.length)];
      hole.innerHTML = "&#9829;";
      hole.dataset.active = "1";
      setTimeout(() => {
        if (hole.dataset.active === "1") {
          hole.innerHTML = "";
          delete hole.dataset.active;
        }
      }, reduce ? 1500 : 900);
    }

    pop();
    setInterval(pop, reduce ? 1900 : 1200);
  })();
});
