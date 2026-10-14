"use strict";

// giscus is wired to GitHub Discussions on this repo.
// The giscus GitHub App must be installed on the repo for comments to post:
//   https://github.com/apps/giscus
// IDs come from the GraphQL API (repository.id and discussionCategories).
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

document.addEventListener("DOMContentLoaded", () => {
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
      if (event.target instanceof HTMLIFrameElement && event.target.classList.contains("giscus-frame")) {
        postGiscusTheme();
      }
    },
    true
  );
});
