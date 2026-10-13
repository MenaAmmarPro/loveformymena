"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Badges ----
  const BADGES = {
    "bubbles-10": "Bubble Popper",
    "hearts-10": "Heart Catcher",
    "memory-win": "Memory Keeper",
    "kitty-50": "Cat Whisperer",
    "whack-10": "Heart Whacker",
    "flappy-10": "Sky Heart",
    "2048-256": "Tile Toucher",
    "stars-complete": "Stargazer",
    "scramble-solve": "Word Weaver",
    "puzzle-solve": "Puzzler"
  };
  const BADGE_KEY = "mena-badges";
  let earned = {};

  try {
    earned = JSON.parse(localStorage.getItem(BADGE_KEY) || "{}") || {};
  } catch {
    earned = {};
  }

  function saveBadges() {
    try {
      localStorage.setItem(BADGE_KEY, JSON.stringify(earned));
    } catch {
      // Badges still show for this visit.
    }
  }

  function renderBadges() {
    const shelf = document.getElementById("badge-shelf");
    if (!shelf) {
      return;
    }

    shelf.textContent = "";

    Object.keys(BADGES).forEach((id) => {
      const span = document.createElement("span");
      const got = Boolean(earned[id]);
      span.className = "badge" + (got ? " is-unlocked" : "");
      span.setAttribute("data-badge", id);
      span.textContent = BADGES[id];
      span.title = got ? "Unlocked" : "Locked";
      shelf.appendChild(span);
    });
  }

  function unlockBadge(id) {
    if (!BADGES[id] || earned[id]) {
      return;
    }

    earned[id] = true;
    saveBadges();

    const badge = document.querySelector('[data-badge="' + id + '"]');
    if (badge) {
      badge.classList.add("is-unlocked");
      badge.title = "Unlocked";
    }

    if (typeof window.fxToast === "function") {
      window.fxToast("Badge unlocked: " + BADGES[id]);
    }
  }

  window.unlockBadge = unlockBadge;
  renderBadges();

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
        if (score >= 10) unlockBadge("bubbles-10");
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
        if (score >= 10) unlockBadge("hearts-10");
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
            unlockBadge("memory-win");
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
      if (score >= 50) unlockBadge("kitty-50");

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
          if (next >= 10) unlockBadge("whack-10");
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

  // ---- Flappy heart ----
  (function flappyGame() {
    const field = document.getElementById("game-flappy");
    const scoreEl = document.getElementById("flappy-score");
    const statusEl = document.getElementById("flappy-status");
    if (!field || !scoreEl) return;

    const HEART = 22;
    const GATE_W = 44;
    const GAP = 96;
    const SPEED = 2.4;
    const GRAVITY = 0.42;
    const FLAP = -6.4;

    const heart = document.createElement("div");
    heart.className = "flappy-heart";
    heart.innerHTML = "&#9829;";
    field.appendChild(heart);

    let heartY = 0;
    let vy = 0;
    let score = 0;
    let gates = [];
    let spawn = 0;
    let running = false;
    let over = false;
    let raf = 0;
    let prev = 0;

    const height = () => field.clientHeight;

    function spawnGate() {
      const gapTop = 26 + Math.random() * Math.max(20, height() - GAP - 52);
      const gate = document.createElement("div");
      gate.className = "flappy-gate";
      gate.style.left = field.clientWidth + "px";
      gate.style.width = GATE_W + "px";
      gate.style.background =
        "linear-gradient(to bottom, var(--purple) 0 " + gapTop + "px, transparent " +
        gapTop + "px " + (gapTop + GAP) + "px, var(--purple) " + (gapTop + GAP) + "px 100%)";
      field.appendChild(gate);
      gates.push({ el: gate, x: field.clientWidth, gapTop: gapTop, passed: false });
    }

    function reset() {
      gates.forEach((g) => g.el.remove());
      gates = [];
      heartY = height() / 2 - HEART / 2;
      vy = 0;
      score = 0;
      spawn = 0;
      over = false;
      running = true;
      scoreEl.textContent = "0";
      if (statusEl) statusEl.textContent = "";
      heart.style.top = heartY + "px";
      prev = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }

    function flap() {
      if (!running || over) {
        reset();
        return;
      }
      vy = FLAP;
    }

    function endGame() {
      running = false;
      over = true;
      cancelAnimationFrame(raf);
      if (statusEl) statusEl.textContent = "Score " + score + " \u2014 tap to play again";
    }

    function loop(now) {
      if (!running) return;
      const dt = Math.min((now - prev) / 16.67, 2.5) || 1;
      prev = now;

      vy += GRAVITY * dt;
      heartY += vy * dt;
      heart.style.top = heartY + "px";

      if (heartY < 0 || heartY + HEART > height()) {
        endGame();
        return;
      }

      spawn += dt;
      if (spawn > 58) {
        spawn = 0;
        spawnGate();
      }

      const left = 40;
      const right = 40 + HEART;

      for (let i = gates.length - 1; i >= 0; i -= 1) {
        const g = gates[i];
        g.x -= SPEED * dt;
        g.el.style.left = g.x + "px";

        if (!g.passed && g.x + GATE_W < left) {
          g.passed = true;
          score += 1;
          scoreEl.textContent = String(score);
          if (score >= 10) unlockBadge("flappy-10");
        }

        if (
          right > g.x &&
          left < g.x + GATE_W &&
          (heartY < g.gapTop || heartY + HEART > g.gapTop + GAP)
        ) {
          endGame();
          return;
        }

        if (g.x + GATE_W < -20) {
          g.el.remove();
          gates.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(loop);
    }

    field.setAttribute("tabindex", "0");
    field.addEventListener("click", flap);
    field.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        flap();
      }
    });

    reset();
  })();

  // ---- 2048 hearts ----
  (function game2048() {
    const board = document.getElementById("game-2048");
    const scoreEl = document.getElementById("g2048-score");
    const statusEl = document.getElementById("g2048-status");
    if (!board || !scoreEl) return;

    const SIZE = 4;
    let grid;
    let score;
    let over;

    function empties() {
      const cells = [];
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          if (!grid[r][c]) cells.push([r, c]);
        }
      }
      return cells;
    }

    function addTile() {
      const cells = empties();
      if (!cells.length) return;
      const pick = cells[Math.floor(Math.random() * cells.length)];
      grid[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
    }

    function render() {
      board.textContent = "";
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          const value = grid[r][c];
          const cell = document.createElement("div");
          cell.className = "cell-2048" + (value ? " v" + Math.min(value, 2048) : " is-empty");
          cell.textContent = value || "";
          board.appendChild(cell);
        }
      }
      scoreEl.textContent = String(score);
    }

    function slide(row) {
      const arr = row.filter((v) => v);
      for (let i = 0; i < arr.length - 1; i += 1) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          score += arr[i];
          arr.splice(i + 1, 1);
          if (arr[i] >= 256) unlockBadge("2048-256");
        }
      }
      while (arr.length < SIZE) arr.push(0);
      return arr;
    }

    function canMove() {
      if (empties().length) return true;
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          const v = grid[r][c];
          if (c < SIZE - 1 && v === grid[r][c + 1]) return true;
          if (r < SIZE - 1 && v === grid[r + 1][c]) return true;
        }
      }
      return false;
    }

    function move(dir) {
      if (over) return;
      const before = JSON.stringify(grid);

      if (dir === "left" || dir === "right") {
        for (let r = 0; r < SIZE; r += 1) {
          let row = grid[r].slice();
          if (dir === "right") row.reverse();
          row = slide(row);
          if (dir === "right") row.reverse();
          grid[r] = row;
        }
      } else {
        for (let c = 0; c < SIZE; c += 1) {
          let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
          if (dir === "down") col.reverse();
          col = slide(col);
          if (dir === "down") col.reverse();
          for (let r = 0; r < SIZE; r += 1) grid[r][c] = col[r];
        }
      }

      if (JSON.stringify(grid) !== before) {
        addTile();
        render();
        if (!canMove()) {
          over = true;
          if (statusEl) statusEl.textContent = "No moves left \u2014 press New game";
        }
      }
    }

    function newGame() {
      grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
      score = 0;
      over = false;
      addTile();
      addTile();
      render();
      if (statusEl) statusEl.textContent = "";
    }

    board.setAttribute("tabindex", "0");
    board.addEventListener("keydown", (event) => {
      const map = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down"
      };
      if (map[event.key]) {
        event.preventDefault();
        move(map[event.key]);
      }
    });

    board.parentElement.querySelectorAll("[data-2048]").forEach((button) => {
      button.addEventListener("click", () => move(button.dataset["2048"]));
    });

    const reset = document.getElementById("g2048-reset");
    if (reset) reset.addEventListener("click", newGame);

    newGame();
  })();

  // ---- Constellation connect ----
  (function constellationGame() {
    const field = document.getElementById("game-stars");
    const statusEl = document.getElementById("stars-status");
    if (!field) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const COUNT = 10;
    const raw = [];

    for (let i = 0; i < COUNT; i += 1) {
      const t = (i / COUNT) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      raw.push({ x: x, y: y });
    }

    const W = field.clientWidth || 300;
    const H = field.clientHeight || 220;
    const pad = 30;
    const xs = raw.map((p) => p.x);
    const ys = raw.map((p) => p.y);
    const minX = Math.min.apply(null, xs);
    const maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys);
    const maxY = Math.max.apply(null, ys);

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "cn-svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    field.appendChild(svg);

    const points = raw.map((p) => ({
      x: pad + ((p.x - minX) / (maxX - minX)) * (W - pad * 2),
      y: pad + ((maxY - p.y) / (maxY - minY)) * (H - pad * 2)
    }));

    let next = 0;
    const nodes = [];

    points.forEach((p, i) => {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 12);
      circle.setAttribute("class", "cn-node");
      circle.style.cursor = "pointer";

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", p.x);
      label.setAttribute("y", p.y);
      label.setAttribute("class", "cn-label");
      label.textContent = String(i + 1);
      label.style.pointerEvents = "none";

      circle.addEventListener("click", () => {
        if (i !== next) {
          if (statusEl) statusEl.textContent = "Follow the numbers \u2014 tap " + (next + 1) + " next.";
          return;
        }

        circle.classList.add("is-done");

        if (next > 0) {
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", points[next - 1].x);
          line.setAttribute("y1", points[next - 1].y);
          line.setAttribute("x2", p.x);
          line.setAttribute("y2", p.y);
          line.setAttribute("class", "cn-line");
          svg.insertBefore(line, svg.firstChild);
        }

        next += 1;

        if (next === COUNT) {
          unlockBadge("stars-complete");
          if (statusEl) statusEl.textContent = "You drew a heart \u2014 beautiful.";
        } else if (statusEl) {
          statusEl.textContent = "Lovely \u2014 now tap " + (next + 1) + ".";
        }
      });

      svg.appendChild(circle);
      svg.appendChild(label);
      nodes.push(circle);
    });
  })();

  // ---- Word scramble ----
  (function scrambleGame() {
    const wordEl = document.getElementById("scramble-word");
    const form = document.getElementById("scramble-form");
    const input = document.getElementById("scramble-input");
    const statusEl = document.getElementById("scramble-status");
    if (!wordEl || !form || !input) return;

    const WORDS = [
      "forever",
      "starlight",
      "sweetheart",
      "moonlight",
      "cuddle",
      "soulmate",
      "always",
      "darling"
    ];
    let current = "";

    function next() {
      current = WORDS[Math.floor(Math.random() * WORDS.length)];
      let shuffled;
      do {
        shuffled = current.split("").sort(() => Math.random() - 0.5).join("");
      } while (shuffled === current && current.length > 2);

      wordEl.textContent = shuffled.toUpperCase();
      input.value = "";
      if (statusEl) statusEl.textContent = "";
      input.focus();
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (input.value.trim().toLowerCase() === current) {
        unlockBadge("scramble-solve");
        if (statusEl) statusEl.textContent = "Yes! It was \u201C" + current + "\u201D";
        window.setTimeout(next, 950);
      } else if (statusEl) {
        statusEl.textContent = "Not quite \u2014 try again.";
      }
    });

    next();
  })();

  // ---- Puzzle slider ----
  (function puzzleGame() {
    const board = document.getElementById("game-puzzle");
    const statusEl = document.getElementById("puzzle-status");
    if (!board) return;

    const SIZE = 3;
    let tiles = [];

    function solved() {
      return tiles.every((v, i) =>
        i === tiles.length - 1 ? v === 0 : v === i + 1
      );
    }

    function neighbors(i) {
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      const result = [];
      if (r > 0) result.push(i - SIZE);
      if (r < SIZE - 1) result.push(i + SIZE);
      if (c > 0) result.push(i - 1);
      if (c < SIZE - 1) result.push(i + 1);
      return result;
    }

    function render() {
      board.textContent = "";
      tiles.forEach((value, i) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "puzzle-tile" + (value ? "" : " is-blank");
        cell.textContent = value || "";
        cell.addEventListener("click", () => {
          const blank = tiles.indexOf(0);
          if (neighbors(blank).indexOf(i) === -1) return;
          const swap = tiles[blank];
          tiles[blank] = tiles[i];
          tiles[i] = swap;
          render();
          if (solved()) {
            unlockBadge("puzzle-solve");
            if (statusEl) statusEl.textContent = "Solved! Nicely done \u2665";
          }
        });
        board.appendChild(cell);
      });
    }

    function shuffle() {
      tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      for (let i = 0; i < 400; i += 1) {
        const blank = tiles.indexOf(0);
        const options = neighbors(blank);
        const pick = options[Math.floor(Math.random() * options.length)];
        tiles[blank] = tiles[pick];
        tiles[pick] = 0;
      }
      render();
      if (statusEl) statusEl.textContent = "";
    }

    const reset = document.getElementById("puzzle-reset");
    if (reset) reset.addEventListener("click", shuffle);

    shuffle();
  })();
});
