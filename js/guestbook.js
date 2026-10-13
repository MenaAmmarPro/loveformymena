"use strict";

// EDIT ME: after enabling GitHub Discussions and installing the giscus app
// (see Phase 5 notes), fill in repoId and categoryId below, then the wall loads.
const GISCUS = {
  repo: "ammar49-cyber/loveformymena",
  repoId: "",
  category: "Announcements",
  categoryId: "",
  mapping: "pathname",
  theme: "dark_dimmed",
  lang: "en"
};

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
  script.setAttribute("data-theme", GISCUS.theme);
  script.setAttribute("data-lang", GISCUS.lang);
  script.setAttribute("data-loading", "lazy");
  host.appendChild(script);
});
