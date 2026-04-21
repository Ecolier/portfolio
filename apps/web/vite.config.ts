import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import svgr from "vite-plugin-svgr";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        crawlLinks: true,
      },
      autoCodeSplitting: true,
    }),
    nitro(),
    svgr({
      svgrOptions: {
        replaceAttrValues: {
          "#ff9e00": "var(--duck-feet)",
          "#ff6400": "var(--duck-beak)",
          "#fff": "var(--duck-eye)",
          "#ffffff": "var(--duck-eye)",
          "#1a2d52": "var(--duck-body)",
          "#0f1e3a": "var(--duck-body-dark)",
          "#2d3f6a": "var(--duck-body-soft)",
          "#c8daeb": "var(--duck-highlight)",
          "#b5c8d4": "var(--umbrella-pole-soft)",
          "#9ab0be": "var(--umbrella-pole)",
        },
      },
    }),
    viteReact(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});

export default config;
