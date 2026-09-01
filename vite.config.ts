import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Netlify's own SSR build (separate from Nitro's) externalizes deps by
  // default, which leaves `gsap/ScrollTrigger` as a bare import. At runtime
  // Netlify's function resolves that against gsap's CJS build, which has no
  // statically-detectable named export and crashes the function. Force it
  // to inline instead.
  ssr: { noExternal: ["gsap"] },
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
