import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import checker from "vite-plugin-checker";
import { VitePWA } from "vite-plugin-pwa";
import sitemap from "vite-plugin-sitemap";

/**
 * Generates `firebase-messaging-sw.js` at dev-server start and at build time
 * by interpolating the same VITE_FIREBASE_* env vars the rest of the app uses.
 * Keeps the SW file out of source control and lets us swap projects (staging
 * vs prod) without editing a checked-in script.
 */
function firebaseMessagingSwPlugin(env: Record<string, string>): Plugin {
  const SW_PATH = "/firebase-messaging-sw.js";
  const SW_FILENAME = "firebase-messaging-sw.js";
  const swSource = () => `/* global importScripts, firebase, self */
importScripts(
  "https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: ${JSON.stringify(env.VITE_FIREBASE_API_KEY ?? "")},
  authDomain: ${JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN ?? "")},
  projectId: ${JSON.stringify(env.VITE_FIREBASE_PROJECT_ID ?? "")},
  storageBucket: ${JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET ?? "")},
  messagingSenderId: ${JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "")},
  appId: ${JSON.stringify(env.VITE_FIREBASE_APP_ID ?? "")},
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = notification.title || data.title || "Hasanat";
  const body = notification.body || data.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/web-app-manifest-192x192.png",
    badge: "/favicon-96x96.png",
    tag: data.tag || title,
    data: {
      url: data.url || "/dashboard",
      ...data,
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
`;

  return {
    name: "firebase-messaging-sw",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === SW_PATH) {
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Service-Worker-Allowed", "/");
          res.end(swSource());
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: SW_FILENAME,
        source: swSource(),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_FIREBASE_");
  return {
  clearScreen: false,
  logLevel: "info",
  build: {
    target: "esnext",
    cssMinify: true,
    minify: mode === "production" ? "terser" : false,
    terserOptions:
      mode === "production"
        ? {
            compress: {
              drop_debugger: true,
              pure_funcs: ["console.log", "console.debug", "console.info"],
            },
          }
        : undefined,
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
            if (
              id.includes("firestore") ||
              id.includes("@firebase/firestore")
            ) {
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
    strictPort: false,
    hmr: {
      overlay: false,
    },
    allowedHosts: true,
    warmup: {
      clientFiles: [
        "./src/main.tsx",
        "./src/App.tsx",
        "./src/layout/AppLayout.tsx",
        "./src/pages/Dashboard.tsx",
      ],
    },
  },
  preview: {
    host: "::",
    allowedHosts: true,
  },
  plugins: [
    react(),
    firebaseMessagingSwPlugin(env),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        dev: { logLevel: ["error"] },
      },
      overlay: { initialIsOpen: false, position: "br" },
      terminal: true,
      enableBuild: false,
    }),
    sitemap({
      hostname: "https://hasanat-3375b.web.app",
      dynamicRoutes: ["/deeds"],
      exclude: [
        "/dashboard",
        "/amal-graph",
        "/settings",
        "/leaderboard",
        "/my-deeds",
        "/profile",
        "/my-city",
        "/circles",
        "/ramadan",
        "/auth",
      ],
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
        navigateFallbackDenylist: [
          /^\/auth/,
          /^\/__\/auth/,
          /^\/firebase-messaging-sw\.js$/,
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,json,woff2}"],
        /**
         * Workbox must not precache the FCM service worker. A stale FCM SW
         * silently drops background pushes after env/version changes.
         */
        globIgnores: ["**/firebase-messaging-sw.js"],
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) => {
              if (url.pathname === "/firebase-messaging-sw.js") return false;
              if (url.hostname === "www.gstatic.com") return false;
              return (
                request.destination === "style" ||
                request.destination === "script" ||
                request.destination === "worker"
              );
            },
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
        enabled: false,
        type: "module",
        navigateFallback: "index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  };
});
