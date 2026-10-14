"use strict";

/*
 * Site configuration.
 *
 * `wishesApi` points at the love-api Worker that powers the wishes wall
 * (see https://github.com/MenaAmmarPro/love-api). After deploying it, paste
 * your Worker URL here, for example:
 *
 *   window.MENA_CONFIG = { wishesApi: "https://love-api.<your-subdomain>.workers.dev" };
 *
 * Leave it empty and the wall gracefully falls back to GitHub Discussions
 * (giscus) instead.
 */
window.MENA_CONFIG = {
  wishesApi: "https://love-api.ammarirfan595.workers.dev"
};
