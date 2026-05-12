const themeStore = {
  subscribe: (callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  },
  getSnapshot: () =>
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light",
};

export default themeStore;
