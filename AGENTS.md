# AGENTS.md - Agentic Coding Guidelines

This file provides guidance for AI agents operating in this repository.

## Commands

### Setup

```bash
npm install  # or bun install
```

### Development

```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build
npm run build:dev    # Development build (no minification)
```

### Linting

```bash
npm run lint         # Run ESLint on all TS/TSX files
```

### Testing

```bash
npm run test                    # Run all tests once (Vitest)
npm run test:watch              # Run tests in watch mode
npx vitest run <file>           # Run single test file
npx vitest run --testNamePattern "<pattern>"  # Run tests matching name
npx vitest run src/deeds/DoodsList.test.tsx    # Example: run specific file
```

### Preview

```bash
npm run preview   # Preview production build locally
```

---

## Code Style Guidelines

### General Rules

- **No comments** unless explicitly requested by the user
- Use **TypeScript** for all new code (no plain JavaScript)
- Follow existing patterns in the codebase - match the style of surrounding code
- Keep responses concise - answer directly without unnecessary preamble

### Imports

- Use **absolute imports** with `@/` alias (e.g., `import { Button } from "@/components/ui/button"`)
- For features, use barrel exports: `import { useAuth, useAuthActions } from "@/features/auth"`
- Group imports in this order:
  1. React/Router imports
  2. Third-party library imports
  3. Internal imports (components, hooks, utils, features)
  4. Type imports
- Use named exports for components, not default exports

### Formatting

- **2 spaces** for indentation
- **Single quotes** for strings (use double only for strings containing single quotes)
- **Trailing commas** on multi-line objects/arrays
- **Semicolons** at end of statements
- Max line length: ~100 characters (soft limit)

### Naming Conventions

- **Components**: PascalCase (e.g., `DeedCard`, `AmalGraph`)
- **Hooks**: camelCase with `use` prefix (e.g., `useNotifications`, `usePrayerTimes`)
- **Utilities**: camelCase (e.g., `cn()`, `formatDate()`)
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Files**: Match component name (e.g., `DeedCard.tsx`)
- **Translation keys**: camelCase (e.g., `landingFeature1Title`, `appName`)

### TypeScript

- Use **interfaces** for exported types, **type aliases** for internal types
- Avoid `any` - use `unknown` when type is truly unknown
- Enable strict null checks in new code (check for undefined)
- Example prop typing:
  ```typescript
  interface DeedCardProps {
  	title: string;
  	points: number;
  	completed?: boolean;
  }
  ```

### Error Handling

- Use try/catch for async operations with user-friendly error messages
- Display errors via the `useNotifications()` toast system
- Never expose internal errors to users - log them and show generic messages
- Example:
  ```typescript
  try {
  	await logDeed(deed);
  } catch (error) {
  	notify("Failed to log deed. Please try again.", "error");
  	console.error(error);
  }
  ```

### React Patterns

- Use **functional components** with hooks only
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use TanStack Query for server state (NOT useEffect for data fetching)
- Memoize expensive computations with `useMemo` / `useCallback`

### Styling

- Use **Tailwind CSS** utility classes (no inline styles unless necessary)
- Reference theme colors via CSS variables: `hsl(var(--primary))`
- Use `cn()` from `@/lib/utils` to merge Tailwind classes
- Follow component conventions in `src/components/ui/`

### Internationalization (i18n)

- ALL user-facing text must use the `useI18n()` hook
- Add new keys to both English and Bengali in `src/i18n/translations.ts`
- Example:
  ```typescript
  const { t } = useI18n();
  return <p>{t("deedLoggedSuccess")}</p>;
  ```

---

## Testing Guidelines

### Test File Location

- Co-locate tests next to their source: `src/components/DeedCard.tsx` → `src/components/DeedCard.test.tsx`
- Use `.test.ts` or `.spec.ts` extensions
- Test files go in `src/test/` for integration tests

### Test Structure

```typescript
import { describe, it, expect } from "vitest";

describe("DeedCard", () => {
	it("should render deed title", () => {
		// test implementation
	});
});
```

### Running Single Tests

```bash
# By file
npx vitest run src/components/DeedCard.test.tsx

# By name pattern
npx vitest run --testNamePattern "should render"

# Watch mode for single file
npx vitest src/components/DeedCard.test.tsx
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

## Additional Context

For detailed architecture, routing, providers, and component structure, see:
- `.github/copilot-instructions.md` - Full project documentation

### Brand Colors (Tailwind)
- Primary: `#1A7A4A` (deep forest green)
- Accent: `#2D9E63`
- Heatmap levels: 0 (none) → 4 (10+ deeds)

### Important Notes
- `@typescript-eslint/no-unused-vars` is disabled in ESLint
- Unused variables are acceptable (no need to remove them)
- SWC is used for fast React transformation
- All data is currently **hardcoded** - no backend connected yet
```
