export const themeStore = {
  subscribe: (callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  },
  getSnapshot: () =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
};
