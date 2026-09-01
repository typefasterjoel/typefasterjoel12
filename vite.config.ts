import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      output: {
        dir: "dist",
      },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    netlify(),
  ],
});

export default config;
