# Copilot Instructions for Radiant Digital Faith

## Project Overview

**Radiant Digital Faith** is a modern React-based web application built with Vite, TypeScript, and Tailwind CSS. The app features Islamic spiritual tracking and community features including dashboards, leaderboards, deeds tracking, and more. The project uses a component-based architecture powered by shadcn-ui and supports both English and Bengali languages via a custom i18n system.

## Build, Test, and Lint Commands

### Setup

```bash
bun install  # Install dependencies (uses Bun package manager)
```

### Development

```bash
bun run dev  # Start Vite dev server on localhost:8080 with HMR
```

### Build

```bash
bun run build         # Production build
bun run build:dev     # Development build (no minification)
```

### Testing

```bash
bun run test          # Run all tests once (Vitest)
bun run test:watch    # Run tests in watch mode
```

### Linting

```bash
bun run lint          # Run ESLint on TypeScript/TSX files
```

### Preview

```bash
bun run preview       # Preview production build locally
```

---

## Project Structure

```
src/
├── features/             # Feature-based modules
│   ├── auth/            # Auth feature (Context, hooks, components)
│   ├── dashboard/       # Dashboard widgets
│   ├── amal-graph/      # Heatmap & charts
│   ├── city/           # City visualization (3D)
│   ├── deeds/          # Deed cards & dialogs
│   └── profile/        # Profile dialogs
├── components/ui/       # shadcn-ui components
├── layout/              # AppLayout
├── pages/               # Route pages
├── hooks/               # Shared hooks
├── lib/                 # Utilities (firebase, utils)
├── i18n/                # Translations
└── routes/              # React Router config
```

### Feature Pattern

```
src/features/<feature>/
├── index.ts             # Barrel exports
├── *.tsx               # Context/Route files
├── hooks/
│   └── use*.ts         # Feature hooks
└── components/
    └── *.tsx           # Feature components
```

### Imports

```typescript
// From features (use barrel export)
import { useAuth, useAuthActions, GoogleSignInButton } from "@/features/auth";
import { DeedCard, CreateDeedDialog } from "@/features/deeds";
import { Heatmap, CategoryBreakdown } from "@/features/amal-graph";

// From UI components
import { Button } from "@/components/ui/button";
```

### Key Libraries

- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **State**: TanStack Query (server), React Context (client)
- **3D**: React Three Fiber + Drei + @react-three/postprocessing
- **Forms**: react-hook-form + Zod
- **Animation**: Framer Motion

---

### Routing & App Structure

- **Router**: React Router v6 (defined in `App.tsx`)
- **Root Page**: `src/pages/Index.tsx` (landing page with auth links)
- **Auth Page**: `src/pages/Auth.tsx` (unauthenticated)
- **Protected Routes**: All other pages use `AppLayout` wrapper for authenticated users
- **Pages**: Dashboard, AmalGraph, MyCity, Deeds, Profile, Settings, Leaderboard, Circles, Ramadan

### Providers & Context

The app wraps content with multiple providers in `App.tsx`:

1. **ThemeProvider** (next-themes) - Light/dark mode support
2. **QueryClientProvider** (TanStack React Query) - Server state management
3. **I18nProvider** - Custom bilingual (English/Bengali) translation system
4. **AuthProvider** (`@/features/auth`) - Firebase auth & user management
5. **NotificationProvider** - Toast notifications context
6. **TooltipProvider** (Radix UI) - Global tooltip support

### Component Structure

- **`src/features/`**: Feature-based modules (auth, dashboard, amal-graph, city, deeds, profile)
- **`src/components/ui/`**: shadcn-ui components
- **`src/layout/`**: Layout wrapper (AppLayout.tsx)

### Styling

- **Tailwind CSS**: All styling uses utility classes with custom theme configuration
- **Theme Config**: Defines custom color system (primary, secondary, sidebar, success, gold, heatmap colors)
- **Dark Mode**: Class-based dark mode via `darkMode: ["class"]` in tailwind.config.ts
- **Custom Fonts**: Inter (default) and Noto Naskh Arabic for Arabic/Urdu text

### Internationalization (i18n)

- **Provider**: `src/i18n/I18nProvider.tsx` - Custom React Context
- **Languages**: English ("en") and Bengali ("bn")
- **Translations**: All strings in `src/i18n/translations.ts`
- **Storage**: Language preference saved to localStorage as `hasanat-lang`
- **Usage**: Import and use `useI18n()` hook in components

### Custom Hooks

- **`useNotifications()`**: Toast notifications system
- **`usePrayerTimes()`**: Prayer times calculations
- **`useAmbientSounds()`**: Background audio management
- **`use-mobile()`**: Responsive design breakpoint detection
- **`use-toast()`**: Low-level toast API

## Key Conventions

### Component Naming & Export

- Page components in `src/pages/` are named exports (not default exports)
- UI components use PascalCase file names matching component names
- Props are typed with TypeScript interfaces (not type aliases for exported APIs)

### File Organization

- Use **feature-based architecture** in `src/features/<feature>/`
- Each feature has: `index.ts` (barrel exports), Context, hooks, components
- Utility functions go in `src/lib/utils.ts`
- Shared hooks go in `src/hooks/`

### Feature Pattern

```
src/features/<feature>/
├── index.ts             # Barrel exports
├── *.tsx               # Context/Route files
├── hooks/
│   └── use*.ts        # Feature hooks
└── components/
    └── *.tsx           # Feature components
```

### ESLint Rules

- `@typescript-eslint/no-unused-vars` is disabled (set to "off")
- React Hooks rules are enforced (`react-hooks/rules-of-hooks`)
- React Refresh warnings are set to "warn" level for HMR compatibility

### Styling Patterns

- Use CSS modules or Tailwind utility classes (no inline style objects unless necessary)
- Color values reference theme CSS variables (e.g., `hsl(var(--primary))`)
- Animations use `framer-motion` for complex animations or Tailwind `animate-*` utilities

### Translation Keys

- All user-facing text must use the i18n system via `t()` function
- Translation keys follow camelCase naming: `landingFeature1Title`, `appName`, etc.
- Add new keys to `translations.ts` for both English and Bengali

### Path Aliases

- Absolute imports use `@/` alias pointing to `src/`
- Example: `import { Button } from "@/components/ui/button"`

### Feature Imports

Use barrel exports from features:

```typescript
import { useAuth, useAuthActions, GoogleSignInButton } from "@/features/auth";
import { DeedCard, CreateDeedDialog } from "@/features/deeds";
import { Heatmap, CategoryBreakdown } from "@/features/amal-graph";
import { DateCalendarWidget, StreakCard } from "@/features/dashboard";
```

## Third-Party Libraries

### UI & Styling

- **shadcn-ui**: Pre-built, customizable components on Radix UI
- **Radix UI**: Headless component library
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: CSS-in-JS variant management
- **tailwind-merge**: Merge Tailwind class conflicts

### Forms & Validation

- **react-hook-form**: Performant form state management
- **zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Zod integration with react-hook-form

### 3D Graphics

- **three.js**: 3D rendering
- **@react-three/drei**: React Three Fiber utilities
- **PixiJS**: 2D WebGL renderer (used for city visualization)

### Animations & Motion

- **framer-motion**: Production-ready animation library
- **tailwindcss-animate**: Tailwind animation utilities

### State & Data

- **TanStack React Query**: Server state management, caching, synchronization
- **React Router DOM**: Client-side routing
- **next-themes**: Theme switching utility

### Utilities

- **date-fns**: Date manipulation
- **lucide-react**: Icon library
- **sonner**: Toast notifications library
- **input-otp**: OTP input component
- **embla-carousel**: Carousel functionality
- **react-resizable-panels**: Resizable panel layouts
