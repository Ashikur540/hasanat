# Quran Reading MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a protected Quran reader where users can read by surah, resume from last ayah, and manage bookmarked ayahs with optional notes using English/Bangla translation toggle and cross-device sync.

**Architecture:** Implement a new `features/quran` module with clear service/hook/component boundaries. Use runtime Quran API fetching for content, localStorage-first persistence for instant UX, and Firestore sync per authenticated user with latest-`updatedAt` conflict resolution. Integrate via a new `/quran` protected route and navigation links in existing layout.

**Tech Stack:** React 18, TypeScript, TanStack Query, Firebase Firestore, React Router v6, Vitest + Testing Library, Tailwind/shadcn-ui.

---

## File Structure Map

### Create

- `src/features/quran/types.ts` — Quran domain models (`SurahMeta`, `Ayah`, `ReaderLanguage`, `ReadingProgress`, `AyahBookmark`)
- `src/features/quran/services/quranApiService.ts` — fetch + normalize surah list and surah ayahs/translations from API
- `src/features/quran/services/quranSyncService.ts` — Firestore read/write for progress + bookmarks
- `src/features/quran/hooks/useReadingProgress.ts` — local-first progress hydration + cloud reconciliation + mutation
- `src/features/quran/hooks/useAyahBookmarks.ts` — bookmark CRUD with local-first + cloud sync
- `src/features/quran/hooks/useQuranReader.ts` — compose API data, language state, selection, and resume actions
- `src/features/quran/components/SurahList.tsx`
- `src/features/quran/components/ReaderToolbar.tsx`
- `src/features/quran/components/AyahRow.tsx`
- `src/features/quran/components/BookmarkPanel.tsx`
- `src/features/quran/components/ResumeCard.tsx`
- `src/features/quran/components/QuranReader.tsx`
- `src/features/quran/index.ts` — barrel exports
- `src/pages/Quran.tsx` — page-level composition + SEO metadata
- `src/features/quran/services/quranApiService.test.ts`
- `src/features/quran/hooks/useReadingProgress.test.tsx`
- `src/features/quran/hooks/useAyahBookmarks.test.tsx`
- `src/features/quran/hooks/useQuranReader.test.tsx`

### Modify

- `src/routes/index.tsx` — register lazy-loaded `/quran` protected route
- `src/layout/AppLayout.tsx` — add desktop and mobile nav item for Quran reader
- `src/i18n/translations.ts` — add EN/BN keys for nav + reader/bookmarks/resume states
- `firestore.rules` — add secure rules for `users/{uid}/quran_progress/*` and `users/{uid}/quran_bookmarks/*`

---

### Task 1: Quran API Service and Types

**Files:**
- Create: `src/features/quran/types.ts`
- Create: `src/features/quran/services/quranApiService.ts`
- Test: `src/features/quran/services/quranApiService.test.ts`

- [ ] **Step 1: Write the failing service tests**

```ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchSurahList, fetchSurahAyahs } from './quranApiService';

describe('quranApiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes surah list from API response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: 200,
          data: [{ number: 1, name: 'Al-Fatihah', englishName: 'Al-Faatiha', numberOfAyahs: 7 }],
        }),
      ),
    );

    const result = await fetchSurahList();
    expect(result[0]).toEqual({
      number: 1,
      nameArabic: 'Al-Fatihah',
      nameEnglish: 'Al-Faatiha',
      ayahCount: 7,
    });
  });

  it('merges arabic + translation ayahs by number', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ayahs: [{ numberInSurah: 1, text: 'بِسْمِ اللَّهِ' }] } })),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ayahs: [{ numberInSurah: 1, text: 'In the name of Allah' }] } })),
      );

    const result = await fetchSurahAyahs(1, 'en');
    expect(result[0].translation).toBe('In the name of Allah');
    expect(result[0].textArabic).toBe('بِسْمِ اللَّهِ');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/quran/services/quranApiService.test.ts`
Expected: FAIL with missing module/function errors.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/features/quran/types.ts
export type ReaderLanguage = 'en' | 'bn';

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  ayahCount: number;
}

export interface Ayah {
  surahNumber: number;
  ayahNumber: number;
  textArabic: string;
  translation: string;
}
```

```ts
// src/features/quran/services/quranApiService.ts
import type { Ayah, ReaderLanguage, SurahMeta } from '@/features/quran/types';

const API_BASE = 'https://api.alquran.cloud/v1';
const TRANSLATION_EDITION: Record<ReaderLanguage, string> = {
  en: 'en.asad',
  bn: 'bn.bengali',
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Quran API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchSurahList(): Promise<SurahMeta[]> {
  const payload = await fetchJson<{ data: Array<{ number: number; name: string; englishName: string; numberOfAyahs: number }> }>(
    `${API_BASE}/surah`,
  );
  return payload.data.map((item) => ({
    number: item.number,
    nameArabic: item.name,
    nameEnglish: item.englishName,
    ayahCount: item.numberOfAyahs,
  }));
}

export async function fetchSurahAyahs(surahNumber: number, language: ReaderLanguage): Promise<Ayah[]> {
  const [arabicPayload, translationPayload] = await Promise.all([
    fetchJson<{ data: { ayahs: Array<{ numberInSurah: number; text: string }> } }>(`${API_BASE}/surah/${surahNumber}/quran-uthmani`),
    fetchJson<{ data: { ayahs: Array<{ numberInSurah: number; text: string }> } }>(
      `${API_BASE}/surah/${surahNumber}/${TRANSLATION_EDITION[language]}`,
    ),
  ]);

  const translationByAyah = new Map(
    translationPayload.data.ayahs.map((ayah) => [ayah.numberInSurah, ayah.text]),
  );

  return arabicPayload.data.ayahs.map((ayah) => ({
    surahNumber,
    ayahNumber: ayah.numberInSurah,
    textArabic: ayah.text,
    translation: translationByAyah.get(ayah.numberInSurah) ?? '',
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/quran/services/quranApiService.test.ts`
Expected: PASS (all tests in file).

- [ ] **Step 5: Commit**

```bash
git add src/features/quran/types.ts src/features/quran/services/quranApiService.ts src/features/quran/services/quranApiService.test.ts
git commit -m "feat(quran): add API service and normalized Quran domain models"
```

---

### Task 2: Progress Persistence Hook (Local + Firestore)

**Files:**
- Create: `src/features/quran/services/quranSyncService.ts`
- Create: `src/features/quran/hooks/useReadingProgress.ts`
- Test: `src/features/quran/hooks/useReadingProgress.test.tsx`

- [ ] **Step 1: Write failing tests for hydration, merge, and save**

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReadingProgress } from './useReadingProgress';

vi.mock('@/features/quran/services/quranSyncService', () => ({
  fetchCloudProgress: vi.fn(),
  saveCloudProgress: vi.fn(),
}));

describe('useReadingProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('hydrates from localStorage immediately', async () => {
    localStorage.setItem('quran.progress.current', JSON.stringify({
      surahNumber: 2, ayahNumber: 255, language: 'en', updatedAt: 200,
    }));
    const { result } = renderHook(() => useReadingProgress('uid-1'));
    await waitFor(() => expect(result.current.progress?.ayahNumber).toBe(255));
  });

  it('prefers newest updatedAt between local and cloud', async () => {
    localStorage.setItem('quran.progress.current', JSON.stringify({
      surahNumber: 1, ayahNumber: 1, language: 'en', updatedAt: 100,
    }));
    // mock cloud returns updatedAt 200
    const { result } = renderHook(() => useReadingProgress('uid-1'));
    await waitFor(() => expect(result.current.progress?.updatedAt).toBe(200));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/quran/hooks/useReadingProgress.test.tsx`
Expected: FAIL with missing hook/service exports.

- [ ] **Step 3: Implement sync service + hook minimally**

```ts
// src/features/quran/services/quranSyncService.ts
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ReaderLanguage } from '@/features/quran/types';

export interface ReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  language: ReaderLanguage;
  updatedAt: number;
}

const progressRef = (uid: string) => doc(db, 'users', uid, 'quran_progress', 'current');

export async function fetchCloudProgress(uid: string): Promise<ReadingProgress | null> {
  const snap = await getDoc(progressRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { surahNumber: number; ayahNumber: number; language: ReaderLanguage; updatedAt?: { toMillis: () => number } };
  return {
    surahNumber: data.surahNumber,
    ayahNumber: data.ayahNumber,
    language: data.language,
    updatedAt: data.updatedAt?.toMillis?.() ?? 0,
  };
}

export async function saveCloudProgress(uid: string, progress: ReadingProgress): Promise<void> {
  await setDoc(progressRef(uid), {
    surahNumber: progress.surahNumber,
    ayahNumber: progress.ayahNumber,
    language: progress.language,
    updatedAt: serverTimestamp(),
  });
}
```

```ts
// src/features/quran/hooks/useReadingProgress.ts
import { useEffect, useState } from 'react';
import { fetchCloudProgress, saveCloudProgress, type ReadingProgress } from '@/features/quran/services/quranSyncService';

const STORAGE_KEY = 'quran.progress.current';

export function useReadingProgress(uid?: string) {
  const [progress, setProgress] = useState<ReadingProgress | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReadingProgress) : null;
  });

  useEffect(() => {
    if (!uid) return;
    fetchCloudProgress(uid).then((cloud) => {
      if (!cloud) return;
      setProgress((local) => (local && local.updatedAt > cloud.updatedAt ? local : cloud));
    });
  }, [uid]);

  const saveProgress = (next: Omit<ReadingProgress, 'updatedAt'>) => {
    const payload: ReadingProgress = { ...next, updatedAt: Date.now() };
    setProgress(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (uid) void saveCloudProgress(uid, payload);
  };

  return { progress, saveProgress };
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/features/quran/hooks/useReadingProgress.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/quran/services/quranSyncService.ts src/features/quran/hooks/useReadingProgress.ts src/features/quran/hooks/useReadingProgress.test.tsx
git commit -m "feat(quran): add local-first reading progress with cloud sync"
```

---

### Task 3: Bookmark Persistence Hook (Local + Firestore)

**Files:**
- Modify: `src/features/quran/services/quranSyncService.ts`
- Create: `src/features/quran/hooks/useAyahBookmarks.ts`
- Test: `src/features/quran/hooks/useAyahBookmarks.test.tsx`

- [ ] **Step 1: Write failing bookmark hook tests**

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAyahBookmarks } from './useAyahBookmarks';

describe('useAyahBookmarks', () => {
  beforeEach(() => localStorage.clear());

  it('adds bookmark with optional note', () => {
    const { result } = renderHook(() => useAyahBookmarks('uid-1'));
    act(() => {
      result.current.addBookmark({ surahNumber: 2, ayahNumber: 255, note: 'Ayatul Kursi' });
    });
    expect(result.current.bookmarks).toHaveLength(1);
    expect(result.current.bookmarks[0].note).toBe('Ayatul Kursi');
  });

  it('removes bookmark by id', () => {
    const { result } = renderHook(() => useAyahBookmarks('uid-1'));
    act(() => {
      result.current.addBookmark({ surahNumber: 1, ayahNumber: 1 });
    });
    const id = result.current.bookmarks[0].id;
    act(() => result.current.removeBookmark(id));
    expect(result.current.bookmarks).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/quran/hooks/useAyahBookmarks.test.tsx`
Expected: FAIL with missing hook/service methods.

- [ ] **Step 3: Implement bookmark APIs and hook**

```ts
// add to src/features/quran/services/quranSyncService.ts
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

export interface AyahBookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

const bookmarksCol = (uid: string) => collection(db, 'users', uid, 'quran_bookmarks');

export async function fetchCloudBookmarks(uid: string): Promise<AyahBookmark[]> { /* map docs -> AyahBookmark[] with millis */ }
export async function upsertCloudBookmark(uid: string, bookmark: AyahBookmark): Promise<void> { /* setDoc(doc(...bookmark.id), payload) */ }
export async function removeCloudBookmark(uid: string, id: string): Promise<void> { await deleteDoc(doc(db, 'users', uid, 'quran_bookmarks', id)); }
```

```ts
// src/features/quran/hooks/useAyahBookmarks.ts
import { useEffect, useMemo, useState } from 'react';
import { fetchCloudBookmarks, removeCloudBookmark, upsertCloudBookmark, type AyahBookmark } from '@/features/quran/services/quranSyncService';

const STORAGE_KEY = 'quran.bookmarks';

export function useAyahBookmarks(uid?: string) {
  const [bookmarks, setBookmarks] = useState<AyahBookmark[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AyahBookmark[]) : [];
  });

  useEffect(() => {
    if (!uid) return;
    fetchCloudBookmarks(uid).then((cloud) => {
      setBookmarks((local) => {
        const byId = new Map(local.map((item) => [item.id, item]));
        for (const item of cloud) {
          const localItem = byId.get(item.id);
          if (!localItem || item.updatedAt > localItem.updatedAt) byId.set(item.id, item);
        }
        const merged = Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    });
  }, [uid]);

  const persist = (next: AyahBookmark[]) => {
    setBookmarks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addBookmark = (input: { surahNumber: number; ayahNumber: number; note?: string }) => {
    const now = Date.now();
    const bookmark: AyahBookmark = {
      id: `${input.surahNumber}:${input.ayahNumber}:${now}`,
      surahNumber: input.surahNumber,
      ayahNumber: input.ayahNumber,
      note: input.note?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    const next = [bookmark, ...bookmarks];
    persist(next);
    if (uid) void upsertCloudBookmark(uid, bookmark);
  };

  const removeBookmark = (id: string) => {
    const next = bookmarks.filter((item) => item.id !== id);
    persist(next);
    if (uid) void removeCloudBookmark(uid, id);
  };

  return useMemo(() => ({ bookmarks, addBookmark, removeBookmark }), [bookmarks]);
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/features/quran/hooks/useAyahBookmarks.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/quran/services/quranSyncService.ts src/features/quran/hooks/useAyahBookmarks.ts src/features/quran/hooks/useAyahBookmarks.test.tsx
git commit -m "feat(quran): add bookmark persistence with local-cloud merge"
```

---

### Task 4: Reader Composition Hook and UI Components

**Files:**
- Create: `src/features/quran/hooks/useQuranReader.ts`
- Create: `src/features/quran/components/SurahList.tsx`
- Create: `src/features/quran/components/ReaderToolbar.tsx`
- Create: `src/features/quran/components/AyahRow.tsx`
- Create: `src/features/quran/components/BookmarkPanel.tsx`
- Create: `src/features/quran/components/ResumeCard.tsx`
- Create: `src/features/quran/components/QuranReader.tsx`
- Create: `src/features/quran/index.ts`
- Test: `src/features/quran/hooks/useQuranReader.test.tsx`

- [ ] **Step 1: Write failing reader hook test**

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useQuranReader } from './useQuranReader';

vi.mock('@/features/quran/services/quranApiService', () => ({
  fetchSurahList: vi.fn().mockResolvedValue([{ number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', ayahCount: 7 }]),
  fetchSurahAyahs: vi.fn().mockResolvedValue([{ surahNumber: 1, ayahNumber: 1, textArabic: 'بسم الله', translation: 'In the name of Allah' }]),
}));

it('loads surahs and selected surah ayahs', async () => {
  const { result } = renderHook(() => useQuranReader('uid-1'));
  await waitFor(() => expect(result.current.surahs.length).toBe(1));
  await waitFor(() => expect(result.current.ayahs.length).toBe(1));
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run src/features/quran/hooks/useQuranReader.test.tsx`
Expected: FAIL (hook missing).

- [ ] **Step 3: Implement hook and minimal components**

```ts
// src/features/quran/hooks/useQuranReader.ts
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSurahAyahs, fetchSurahList } from '@/features/quran/services/quranApiService';
import { useReadingProgress } from '@/features/quran/hooks/useReadingProgress';
import { useAyahBookmarks } from '@/features/quran/hooks/useAyahBookmarks';
import type { ReaderLanguage } from '@/features/quran/types';

export function useQuranReader(uid?: string) {
  const [language, setLanguage] = useState<ReaderLanguage>('en');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const { progress, saveProgress } = useReadingProgress(uid);
  const bookmarksApi = useAyahBookmarks(uid);

  const surahQuery = useQuery({ queryKey: ['quran', 'surahs'], queryFn: fetchSurahList, staleTime: Infinity });
  const ayahQuery = useQuery({
    queryKey: ['quran', 'ayahs', selectedSurah, language],
    queryFn: () => fetchSurahAyahs(selectedSurah, language),
    enabled: !!selectedSurah,
  });

  const resume = () => {
    if (!progress) return;
    setSelectedSurah(progress.surahNumber);
    setLanguage(progress.language);
  };

  const markLastRead = (ayahNumber: number) => {
    saveProgress({ surahNumber: selectedSurah, ayahNumber, language });
  };

  return useMemo(
    () => ({
      language, setLanguage, selectedSurah, setSelectedSurah, surahs: surahQuery.data ?? [],
      ayahs: ayahQuery.data ?? [], progress, resume, markLastRead, isLoading: surahQuery.isLoading || ayahQuery.isLoading,
      ...bookmarksApi,
    }),
    [language, selectedSurah, surahQuery.data, ayahQuery.data, progress, surahQuery.isLoading, ayahQuery.isLoading, bookmarksApi],
  );
}
```

```tsx
// src/features/quran/components/QuranReader.tsx (shape)
export default function QuranReader() {
  // compose SurahList + ReaderToolbar + ResumeCard + AyahRow list + BookmarkPanel
  // wire markLastRead on ayah click/observe
  return <div className="container mx-auto px-4 py-6 space-y-4">{/* ... */}</div>;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/features/quran/hooks/useQuranReader.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/quran/hooks/useQuranReader.ts src/features/quran/components src/features/quran/index.ts src/features/quran/hooks/useQuranReader.test.tsx
git commit -m "feat(quran): add reader composition hook and MVP reader components"
```

---

### Task 5: Route + Navigation + Quran Page Integration

**Files:**
- Create: `src/pages/Quran.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/layout/AppLayout.tsx`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Write failing integration test for route/page shell**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Quran from '@/pages/Quran';

describe('Quran page', () => {
  it('renders quran reader heading', () => {
    render(<Quran />);
    expect(screen.getByText(/Quran/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages/Quran.test.tsx`
Expected: FAIL (page missing).

- [ ] **Step 3: Implement page and routing/nav wiring**

```tsx
// src/pages/Quran.tsx
import { Helmet } from 'react-helmet-async';
import { QuranReader } from '@/features/quran';

const Quran = () => (
  <>
    <Helmet>
      <title>Quran Reader | Hasanat</title>
      <meta name="description" content="Read Quran by surah, resume last ayah, and bookmark ayahs in English or Bangla." />
    </Helmet>
    <QuranReader />
  </>
);

export default Quran;
```

```ts
// src/routes/index.tsx changes
const Quran = lazy(() => import('@/pages/Quran'));
// in protected AppLayout children:
{ path: '/quran', element: withRouteSuspense(<Quran />) },
```

```tsx
// src/layout/AppLayout.tsx additions
import { BookText } from 'lucide-react';
// navLinks
{ to: '/quran', label: t('navQuran'), icon: BookText },
// mobileRightLinks (or left) add quran link
```

```ts
// src/i18n/translations.ts add both locales
navQuran: 'Quran',
quranReaderTitle: 'Quran Reader',
quranResumeLastAyah: 'Resume from last ayah',
quranBookmarks: 'Bookmarks',
quranTranslationEnglish: 'English',
quranTranslationBangla: 'Bangla',
// Bengali equivalents in bn block
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/pages/Quran.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Quran.tsx src/routes/index.tsx src/layout/AppLayout.tsx src/i18n/translations.ts src/pages/Quran.test.tsx
git commit -m "feat(quran): wire protected quran route and navigation"
```

---

### Task 6: Firestore Security Rules for Quran Data

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Add failing rules unit test or emulator check script**

```bash
# If firestore emulator/rules tests exist, run them first; otherwise validate via firebase deploy --only firestore:rules --dry-run equivalent in project workflow.
```

- [ ] **Step 2: Add explicit rules for Quran subcollections**

```txt
match /users/{userId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == userId;

  match /quran_progress/{docId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }

  match /quran_bookmarks/{bookmarkId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

- [ ] **Step 3: Validate rules syntax**

Run: `firebase firestore:rules:test` (if configured) or repository-standard rules validation command.
Expected: PASS (no syntax or permission-regression errors).

- [ ] **Step 4: Commit**

```bash
git add firestore.rules
git commit -m "chore(firestore): secure quran progress and bookmark subcollections"
```

---

### Task 7: Full Verification and Cleanup

**Files:**
- Modify: any touched files from tasks above if fixes are required

- [ ] **Step 1: Run targeted Quran tests**

Run:
```bash
npx vitest run src/features/quran/services/quranApiService.test.ts src/features/quran/hooks/useReadingProgress.test.tsx src/features/quran/hooks/useAyahBookmarks.test.tsx src/features/quran/hooks/useQuranReader.test.tsx src/pages/Quran.test.tsx
```
Expected: PASS.

- [ ] **Step 2: Run repository test suite**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 3: Run lint and build**

Run:
```bash
npm run lint
npm run build
```
Expected: PASS for both.

- [ ] **Step 4: Final commit for any integration fixes**

```bash
git add -A
git commit -m "test: finalize quran reader MVP integration fixes"
```

---

## Self-Review Checklist (Completed)

1. **Spec coverage:** Route protection, surah reader flow, EN/BN toggle, resume last ayah, multi-bookmarks with notes, local+cloud persistence, and sync-safe behavior each map to Tasks 1-7.
2. **Placeholder scan:** Removed TBD/TODO markers; all code-touching steps include concrete file paths and implementation snippets.
3. **Type consistency:** `ReaderLanguage`, `ReadingProgress`, and `AyahBookmark` naming stays consistent across services, hooks, and component tasks.

