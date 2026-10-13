"use strict";

const CACHE = "mena-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./love-letter.html",
  "./our-story.html",
  "./memories.html",
  "./apology.html",
  "./for-you.html",
  "./reasons.html",
  "./open-when.html",
  "./counter.html",
  "./playlist.html",
  "./quiz.html",
  "./fortune.html",
  "./bucket.html",
  "./guestbook.html",
  "./404.html",
  "./css/style.css",
  "./js/main.js",
  "./js/effects.js",
  "./js/i18n.js",
  "./js/reasons.js",
  "./js/counter.js",
  "./js/playlist.js",
  "./js/quiz.js",
  "./js/fortune.js",
  "./js/bucket.js",
  "./js/guestbook.js",
  "./js/games.js",
  "./assets/favicon.svg",
  "./assets/apple-touch-icon.png",
  "./assets/og-image.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        ASSETS.map((asset) => cache.add(asset).catch(() => null))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => null);
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
