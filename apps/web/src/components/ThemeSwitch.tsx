import themeStore from "#/lib/themeStore";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore, useCallback } from "react";

interface ThemeSwitchProps {
  initialTheme?: "light" | "dark";
}

export default function ThemeSwitch({ initialTheme }: ThemeSwitchProps) {
  const resolvedTheme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    () => initialTheme,
  );

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    localStorage.setItem("theme", next);
    document.cookie = `theme=${next};path=/;max-age=31536000;samesite=lax`;
  }, [resolvedTheme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full p-2 text-(--sea-ink-soft) transition hover:bg-(--surface) hover:text-(--sea-ink)"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  );
}
