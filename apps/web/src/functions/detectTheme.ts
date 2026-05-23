import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const detectTheme = createServerFn().handler((): "light" | "dark" => {
  const cookie = getCookie("theme");

  // Default to light if no valid cookie is found
  return cookie === "dark" || cookie === "light" ? cookie : "light";
});
