import { deLocalizeHref } from "@/paraglide/runtime.js";

function normalizePath(path: string) {
  const [pathname = "/"] = path.split(/[?#]/);
  const withoutLocale = deLocalizeHref(pathname);
  const withoutTrailingSlash = withoutLocale.replace(/\/+$/, "");

  return withoutTrailingSlash || "/";
}

export function isActivePath(pathname: string, to: string) {
  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(to);

  if (targetPath === "/") {
    return currentPath === "/" || currentPath.startsWith("/projects/");
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}
