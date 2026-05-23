import themeStore from "#/lib/themeStore";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore, useCallback } from "react";
import { m } from "@/paraglide/messages.js";

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
      className="rounded-full bg-foreground p-2 text-inverse-foreground shadow-[0_10px_22px_-16px_var(--color-elevation-shadow)] backdrop-blur-md"
      aria-label={
        resolvedTheme === "dark"
          ? m.action_switch_to_light_mode()
          : m.action_switch_to_dark_mode()
      }
    >
      {resolvedTheme === "dark" ? (
        <Sun fill="currentColor" size={18} aria-hidden="true" />
      ) : (
        <Moon
          fill="currentColor"
          strokeWidth={0}
          size={18}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
