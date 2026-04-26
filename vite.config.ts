import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { componentTagger } from "lovable-tagger";
import sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  esbuild:
    mode === "production"
      ? {
          drop: ["debugger"],
          pure: ["console.log", "console.debug", "console.info"],
        }
      : undefined,
  build: {
    target: "esnext",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // clsx/CVA/tailwind-merge MUST come before recharts — recharts
            // bundles clsx internally, so without this it becomes the only
            // source of clsx in the build and gets pulled into every page
            // that uses shadcn's cva() (i.e., every page with a Button).
            if (
              id.includes("clsx") ||
              id.includes("class-variance-authority") ||
              id.includes("tailwind-merge")
            ) {
              return "vendor-utils";
            }
            if (
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("/react/")
            ) {
              return "vendor-react";
            }
            // Split Firestore into its own chunk — it only loads after sign-in
            if (id.includes("firestore") || id.includes("@firebase/firestore")) {
              return "vendor-firestore";
            }
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-3d";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
          }
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    allowedHosts: true,
  },
  preview: {
    host: "::",
    allowedHosts: true,
  },
  plugins: [
    react(),
    sitemap({
      hostname: "https://hasanat-3375b.web.app",
      dynamicRoutes: ["/deeds"],
      exclude: ["/dashboard", "/amal-graph", "/settings", "/leaderboard", "/my-deeds", "/profile", "/my-city", "/circles", "/ramadan", "/auth"],
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon.svg",
        "favicon-96x96.png",
        "apple-touch-icon.png",
      ],
      manifestFilename: "site.webmanifest",
      manifest: {
        id: "/",
        name: "Hasanat Hub",
        short_name: "Hasanat",
        description:
          "Track daily good deeds, visualize your Amal Graph, and stay consistent.",
        start_url: "/dashboard",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FAFAF8",
        theme_color: "#1A7A4A",
        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/auth/, /^\/__\/auth/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "style" ||
              request.destination === "script" ||
              request.destination === "worker",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
