// Synchronously mark hero-page loads before the first paint so the CSS rule
// `html[data-hero-visible] .header-logo { opacity: 0 }` already hides the
// duck — no IntersectionObserver lag, no flash.
(function () {
  try {
    var p = window.location.pathname;
    // Home page paths: "/" (English default) or "/{locale}" (e.g. "/fr")
    if (p === "/" || /^\/[a-z]{2}\/?$/.test(p)) {
      document.documentElement.setAttribute("data-hero-visible", "");
    }
  } catch (e) {}
})();
