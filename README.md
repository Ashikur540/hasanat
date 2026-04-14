# Hasanat

Hasanat is a React + TypeScript web app for tracking daily good deeds (amal), building consistency, and visualizing spiritual progress.

## Tech stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase
- TanStack Query

## Getting started

```sh
git clone <YOUR_GIT_URL>
cd hasanat
npm install
npm run dev
```

## Scripts

```sh
npm run dev        # Start local dev server
npm run build      # Production build
npm run build:dev  # Development build output
npm run preview    # Preview production build locally
npm run lint       # ESLint
npm run test       # Vitest (run once)
```

## PWA

The app is installable as a Progressive Web App.

- Android/Chromium: use **Settings → Install App** or browser install prompt
- iOS Safari: use **Share → Add to Home Screen**

### Verify locally

1. `npm run build`
2. `npm run preview`
3. Open on mobile and install from browser/app prompt

## Repository rename note

If the repository was previously named `radiant-digital-faith`, update your local remote after rename:

```sh
git remote set-url origin https://github.com/<owner>/hasanat.git
git remote -v
```
