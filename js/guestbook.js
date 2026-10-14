"use strict";

// The wishes wall is backed by the love-api Cloudflare Worker when a URL is
// configured in js/config.js. Without one it falls back to giscus
// (GitHub Discussions) so the page still has a working wall.
//
// giscus needs the giscus GitHub App installed on the repo to post:
//   https://github.com/apps/giscus
const API = (
  (window.MENA_CONFIG && window.MENA_CONFIG.wishesApi) || ""
).replace(/\/+$/, "");

const GISCUS = {
  repo: "MenaAmmarPro/loveformymena",
  repoId: "R_kgDOVEqXVA",
  category: "Announcements",
  categoryId: "DIC_kwDOVEqXVM4DIWU9",
  mapping: "pathname",
  lang: "en"
};

const GISCUS_ORIGIN = "https://giscus.app";

// Map the site's theme to a giscus theme.
// The site is dark by default and adds `light-theme` to <body> for light.
function currentGiscusTheme() {
  return document.body.classList.contains("light-theme") ? "light" : "dark_dimmed";
}

function postGiscusTheme() {
  const frame = document.querySelector("iframe.giscus-frame");
  if (!frame || !frame.contentWindow) {
    return;
  }
  frame.contentWindow.postMessage(
    { giscus: { setConfig: { theme: currentGiscusTheme() } } },
    GISCUS_ORIGIN
  );
}

function loadGiscus() {
  const host = document.getElementById("giscus-host");
  const note = document.getElementById("giscus-note");

  if (!host) {
    return;
  }

  if (!GISCUS.repoId || !GISCUS.categoryId) {
    if (note) {
      note.hidden = false;
    }
    return;
  }

  if (host.dataset.loaded === "true") {
    return;
  }
  host.dataset.loaded = "true";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", GISCUS.repo);
  script.setAttribute("data-repo-id", GISCUS.repoId);
  script.setAttribute("data-category", GISCUS.category);
  script.setAttribute("data-category-id", GISCUS.categoryId);
  script.setAttribute("data-mapping", GISCUS.mapping);
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", currentGiscusTheme());
  script.setAttribute("data-lang", GISCUS.lang);
  script.setAttribute("data-loading", "lazy");
  host.appendChild(script);

  // Keep giscus in step with the site theme toggle.
  const observer = new MutationObserver(() => postGiscusTheme());
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // giscus builds its iframe after the client script loads, so post the theme
  // whenever a giscus iframe finishes loading.
  document.addEventListener(
    "load",
    (event) => {
      if (
        event.target instanceof HTMLIFrameElement &&
        event.target.classList.contains("giscus-frame")
      ) {
        postGiscusTheme();
      }
    },
    true
  );
}

function showFallback() {
  const form = document.getElementById("wish-form");
  const listHead = document.querySelector(".wish-list-head");
  const list = document.getElementById("wish-list");
  const empty = document.getElementById("wish-empty");
  const fallback = document.getElementById("giscus-fallback");

  if (form) form.hidden = true;
  if (listHead) listHead.hidden = true;
  if (list) list.hidden = true;
  if (empty) empty.hidden = true;
  if (fallback) fallback.hidden = false;

  loadGiscus();
}

function formatWhen(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (err) {
    return "";
  }
}

function renderWish(wish) {
  const li = document.createElement("li");
  li.className = "wish-card";

  const p = document.createElement("p");
  p.textContent = wish.message || "";

  const foot = document.createElement("footer");
  const name = document.createElement("span");
  name.textContent = "— " + (wish.name || "Someone");
  const when = document.createElement("time");
  when.textContent = formatWhen(wish.ts);
  foot.appendChild(name);
  foot.appendChild(when);

  li.appendChild(p);
  li.appendChild(foot);
  return li;
}

function setStatus(text, tone) {
  const status = document.getElementById("wish-status");
  if (!status) return;
  status.textContent = text || "";
  if (tone) {
    status.dataset.tone = tone;
  } else {
    delete status.dataset.tone;
  }
}

async function loadWishes() {
  const list = document.getElementById("wish-list");
  const empty = document.getElementById("wish-empty");
  if (!list) return;

  let data;
  try {
    const res = await fetch(API + "/wishes?limit=100", {
      headers: { accept: "application/json" }
    });
    if (!res.ok) throw new Error("bad status " + res.status);
    data = await res.json();
  } catch (err) {
    showFallback();
    return;
  }

  const wishes = (data && data.wishes) || [];
  list.textContent = "";
  wishes.forEach((wish) => list.appendChild(renderWish(wish)));
  if (empty) empty.hidden = wishes.length !== 0;
}

async function submitWish(event) {
  event.preventDefault();

  const messageEl = document.getElementById("wish-message");
  const nameEl = document.getElementById("wish-name");
  const siteEl = document.getElementById("wish-website");
  const button = document.getElementById("wish-submit");

  const message = (messageEl && messageEl.value ? messageEl.value : "").trim();
  const name = (nameEl && nameEl.value ? nameEl.value : "").trim();

  if (!message) {
    setStatus("Write a few kind words first.", "error");
    if (messageEl) messageEl.focus();
    return;
  }

  if (button) button.disabled = true;
  setStatus("Hanging your wish on the wall…");

  try {
    const res = await fetch(API + "/wishes", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        name: name,
        message: message,
        website: siteEl ? siteEl.value : ""
      })
    });

    if (res.status === 201) {
      const created = await res.json().catch(() => null);
      if (created && created.wish) {
        const list = document.getElementById("wish-list");
        if (list) list.insertBefore(renderWish(created.wish), list.firstChild);
        const empty = document.getElementById("wish-empty");
        if (empty) empty.hidden = true;
      }
      if (messageEl) messageEl.value = "";
      if (nameEl) nameEl.value = "";
      setStatus("Thank you ✦ your wish is on the wall.", "ok");
    } else if (res.status === 429) {
      setStatus("That's a lot of wishes at once — try again in a minute.", "error");
    } else if (res.status === 422) {
      setStatus("That wish looked like a link or spam — try phrasing it warmly.", "error");
    } else {
      setStatus("Something went wrong — please try again.", "error");
    }
  } catch (err) {
    setStatus("Couldn't reach the wishes wall — please try again.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

function initApiWall() {
  const form = document.getElementById("wish-form");
  const refresh = document.getElementById("wish-refresh");
  if (form) form.addEventListener("submit", submitWish);
  if (refresh) refresh.addEventListener("click", loadWishes);
  loadWishes();
}

document.addEventListener("DOMContentLoaded", () => {
  if (API) {
    initApiWall();
  } else {
    showFallback();
  }
});
