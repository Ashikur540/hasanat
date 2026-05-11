# Quran Reading MVP Design

## Problem Statement

Users need an in-app Quran reading experience that lets them continue from where they left off, switch translation language (English or Bangla), and bookmark ayahs. The MVP must be fast to deliver, reliable for daily use, and support cross-device continuity.

## MVP Scope

### In Scope

- Protected Quran reader route (`/quran`) for authenticated users
- Surah-first reading flow (surah list -> ayah list reader)
- Arabic text + one selected translation at a time (English or Bangla)
- Resume from last read ayah (`surahNumber`, `ayahNumber`)
- Multiple bookmarks with optional note
- Hybrid persistence:
  - localStorage for immediate load/write
  - Firestore sync per authenticated user for cross-device continuity

### Out of Scope

- Audio recitation
- Search
- Tafsir/explanations
- Mushaf page-based navigation

## Architecture

Use feature-based structure under `src/features/quran/`:

- `components/`
  - `SurahList`
  - `QuranReader`
  - `AyahRow`
  - `ReaderToolbar`
  - `BookmarkPanel`
  - `ResumeCard`
- `hooks/`
  - `useQuranReader`
  - `useReadingProgress`
  - `useAyahBookmarks`
- `services/`
  - `quranApiService`
  - `quranSyncService`
- `types.ts`
- `index.ts`

Routing integration:

- Add `src/pages/Quran.tsx`
- Register lazy-loaded protected route at `/quran` inside existing authenticated `AppLayout` flow

## UX and Component Flow

1. User enters `/quran`
2. Surah list is shown (name, number, ayah count)
3. User selects a surah and ayah list loads
4. Ayah rows show Arabic text and selected translation language
5. User bookmarks any ayah and may add a short note
6. Reading position auto-updates while reading
7. On next visit, user sees a clear resume action to jump back

Reader controls:

- Translation toggle inside reader (`EN` / `BN`)
- Resume chip/card when progress exists
- Bookmark panel with jump-to-ayah action

## Data Flow

### Quran Content

- `quranApiService` fetches surah index and surah ayahs from a public Quran API at runtime
- Service normalizes external payloads into internal typed models before rendering

### Progress and Bookmarks

Local-first + cloud-sync flow:

1. Hydrate from localStorage immediately on load
2. If authenticated, fetch Firestore state
3. Reconcile local/cloud records with `updatedAt` (latest wins)
4. On mutation:
   - write local first
   - trigger async Firestore sync

## Persistence Model

### localStorage

- `quran.progress.current`
- `quran.bookmarks`

### Firestore (per user)

- `users/{uid}/quran_progress/current`
  - `surahNumber: number`
  - `ayahNumber: number`
  - `language: 'en' | 'bn'`
  - `updatedAt: Timestamp`

- `users/{uid}/quran_bookmarks/{bookmarkId}`
  - `surahNumber: number`
  - `ayahNumber: number`
  - `note?: string`
  - `createdAt: Timestamp`
  - `updatedAt: Timestamp`

## Error Handling and Resilience

- Quran API:
  - Show explicit loading and error states
  - Provide manual retry action
- Firestore sync failure:
  - Keep local writes as source of truth for device continuity
  - Show subtle non-blocking sync warning/toast
- Auth expiry mid-session:
  - Keep reader usable with local data
  - Pause cloud sync actions until re-auth

Principle: reading must remain available even when sync fails.

## Testing Strategy

### Unit and Hook Tests

- `useReadingProgress`
  - local hydration
  - cloud merge
  - latest-`updatedAt` conflict rule
- `useAyahBookmarks`
  - add/edit/delete
  - optional note persistence
  - local-first + cloud sync behavior
- `quranApiService`
  - payload normalization
  - failure mapping

### Integration Tests

- Surah selection -> ayah list render
- Translation toggle changes rendered translation (`en` / `bn`)
- Resume action restores exact last ayah
- Bookmark jump opens exact surah/ayah
- Cloud unavailable does not lose local progress/bookmarks

## Success Criteria (MVP)

- Authenticated user can read by surah and ayah
- User can switch translation between English and Bangla
- User can bookmark multiple ayahs and optional notes
- App resumes from last read ayah after reload
- Progress/bookmarks persist locally and sync across devices through Firestore

