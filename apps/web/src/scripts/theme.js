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
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    document.cookie =
      "theme=" + resolved + ";path=/;max-age=31536000;samesite=lax";
    var old = document.querySelector('meta[name="theme-color"]');
    if (old) old.remove();
    var m = document.createElement("meta");
    m.name = "theme-color";
    m.content = resolved === "dark" ? "#0b1118" : "#e8edf3"; // Theme-color hex values must stay in sync with --bg-base in styles.css
    document.head.appendChild(m);
  } catch (e) {}
})();
