/// <reference types="vitest" />

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
import { fileURLToPath } from "node:url";
import Macros from "unplugin-macros/vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  plugins: [Macros(), vue()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  test: {
    environment: "jsdom",
    coverage: {
      enabled: true,
    },
    includeSource: ["src/**/*.ts"],
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
