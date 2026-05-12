(function () {
  try {
    var stored = window.localStorage.getItem("theme");
    var mode =
      stored === "light" || stored === "dark" || stored === "auto"
        ? stored
        : "auto";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
    var root = document.documentElement;
    root.setAttribute("data-theme", resolved);
    root.style.colorScheme = resolved;
    document.cookie =
      "theme=" + resolved + ";path=/;max-age=31536000;samesite=lax";
  } catch (e) {}
})();
