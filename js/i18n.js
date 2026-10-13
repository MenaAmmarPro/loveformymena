"use strict";

/*
 * i18n scaffold.
 *
 * This ships English content only. It provides the plumbing so a second
 * language can be added later without touching every page:
 *
 *   1. Add a locale below (copy the `en` shape and fill in `strings`).
 *   2. Mark up any element with data-i18n="some.key" (text) or
 *      data-i18n-attr="aria-label:some.key,title:some.key" (attributes).
 *   3. The toggle button (auto-added to the header) cycles languages and
 *      remembers the choice in localStorage under "mena-lang".
 *
 * Call window.menaI18n.t("key") anywhere, or listen for the "mena:locale"
 * event that fires on document each time the language changes.
 */

(function () {
  const STORAGE_KEY = "mena-lang";
  const FALLBACK = "en";

  const LOCALES = {
    en: {
      label: "English",
      short: "EN",
      strings: {
        "nav.home": "Home",
        "nav.menu": "Open navigation",
        "nav.theme": "Toggle color theme",
        "nav.github": "View source on GitHub",
        "lang.toggle": "Change language"
      }
    },
    es: {
      label: "Espa\u00f1ol",
      short: "ES",
      // Add translations here, e.g. "nav.home": "Inicio"
      strings: {}
    }
  };

  let current = FALLBACK;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES[saved]) {
      current = saved;
    }
  } catch (error) {
    current = FALLBACK;
  }

  function t(key, vars) {
    const table = (LOCALES[current] && LOCALES[current].strings) || {};
    const fallbackTable = LOCALES[FALLBACK].strings;
    let text = Object.prototype.hasOwnProperty.call(table, key)
      ? table[key]
      : fallbackTable[key];

    if (typeof text !== "string") {
      return key;
    }

    if (vars) {
      text = text.replace(/\{(\w+)\}/g, (whole, name) =>
        Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : whole
      );
    }

    return text;
  }

  function apply(root) {
    const scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const text = t(el.getAttribute("data-i18n"));
      if (text != null && text !== el.getAttribute("data-i18n")) {
        el.textContent = text;
      }
    });

    scope.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
        const parts = pair.split(":");
        const attr = (parts[0] || "").trim();
        const key = (parts[1] || "").trim();
        if (attr && key) {
          el.setAttribute(attr, t(key));
        }
      });
    });
  }

  function nextLocale() {
    const keys = Object.keys(LOCALES);
    const index = keys.indexOf(current);
    return keys[(index + 1) % keys.length];
  }

  let button = null;

  function updateButton() {
    if (!button) {
      return;
    }
    const next = nextLocale();
    button.textContent = (LOCALES[current] && LOCALES[current].short) || current.toUpperCase();
    button.setAttribute("aria-label", t("lang.toggle") + " (" + LOCALES[current].label + ")");
    button.setAttribute("title", LOCALES[current].label + " \u2192 " + LOCALES[next].label);
  }

  function setLocale(locale) {
    if (!LOCALES[locale]) {
      return;
    }
    current = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch (error) {
      // Ignore storage failures.
    }
    document.documentElement.lang = locale;
    apply(document);
    updateButton();
    document.dispatchEvent(new CustomEvent("mena:locale", { detail: { locale: locale } }));
  }

  function mount() {
    const header = document.querySelector(".site-header");
    if (!header || button) {
      return;
    }

    button = document.createElement("button");
    button.type = "button";
    button.className = "lang-toggle";
    button.addEventListener("click", () => setLocale(nextLocale()));

    const anchor = header.querySelector(".theme-toggle");
    if (anchor && anchor.parentNode === header) {
      header.insertBefore(button, anchor);
    } else {
      header.appendChild(button);
    }

    updateButton();
  }

  document.documentElement.lang = current;

  window.menaI18n = {
    t: t,
    apply: apply,
    setLocale: setLocale,
    locales: LOCALES,
    get locale() {
      return current;
    }
  };

  function start() {
    mount();
    apply(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
