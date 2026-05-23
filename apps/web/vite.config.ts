import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  const plugins = [
    devtools(),
    tailwindcss(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      outputStructure: "message-modules",
      emitTsDeclarations: true,
      cookieName: "locale",
      strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
    }),
    tanstackStart({
      prerender: {
        crawlLinks: true,
      },
    }),
    command === "build" ? nitro() : null,
    viteReact(),
  ];

  return {
    plugins,
    resolve: {
      tsconfigPaths: true,
    },
  };
});
