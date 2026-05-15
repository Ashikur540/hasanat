# Technical Debt — Backend & Infrastructure Gaps

> Audit date: 2026-05-11
> Scope: places where Hasanat relies on hardcoded data, `localStorage`, or client-only logic where a real backend is required.

Hasanat currently has no dedicated backend. Firebase Firestore (client SDK) handles auth + partial sync. Most multi-user, scheduled, and cross-device features are broken, fragile, or fake.

This document catalogs every gap, grouped by severity, with file references and the backend capability needed to fix it.

---

## Legend

- **CRITICAL** — Feature is broken or fake. User-visible bug.
- **HIGH** — Data integrity risk. Silent failure.
- **MEDIUM** — Cross-device sync broken. Works on one device only.
- **LOW** — Cleanup / hardening. Not user-blocking.

---

## CRITICAL

### 1. Circles (accountability groups)

- **File:** `src/pages/Circles.tsx:21-57`
- **Problem:** Entire feature renders from hardcoded `mockCircles` array. No DB writes, no membership, no invite codes, no activity logs.
- **Backend needed:**
  - Firestore collection: `circles/{circleId}` with `members`, `challenges`, `activity`
  - Server-side invite-code generation + validation
  - Membership management (join, leave, kick)

### 2. Ramadan feature

- **File:** `src/pages/Ramadan.tsx:1-12`
- **Problem:** Stub page. Translation says "Coming in Phase 6". Zero implementation.
- **Backend needed:**
  - Daily Ramadan goals, tarawih count, Quran khatm tracking
  - Bonus points multiplier
  - Hijri month-boundary reset (server-side; client clock untrusted)

### 3. Push notifications (tips + reminders)

- **Files:**
  - `src/lib/notifications/dispatch.ts`
  - `src/lib/notifications/tipSchedule.ts:43-71`
  - `src/lib/notifications/sentState.ts:6,39`
- **Problem:**
  - No FCM integration. Uses Web Notifications API only → no delivery when app closed.
  - Tip schedule generated randomly per device in `localStorage` → no cross-device coordination.
  - "Sent" state tracked in `localStorage` → duplicate notifications across tabs / devices.
- **Backend needed:**
  - Firebase Cloud Messaging (FCM)
  - Cloud Function: tip scheduler (per-user, per-timezone)
  - Cloud Function: prayer-time reminder dispatcher
  - Firestore: `users/{uid}/notifications/sent` for dedupe

### 4. Streak reset

- **File:** `src/lib/firestore/streakService.ts:43-64`
- **Problem:** `checkStreakReset()` runs on app mount. If user does not open app at midnight, streak persists incorrectly. No server enforcement.
- **Backend needed:**
  - Cloud Function (scheduled, per-user timezone) → midnight streak reset + integrity audit

---

## HIGH

### 5. Landing-page leaderboard

- **File:** `src/features/landing/components/LeaderboardSection.tsx:7-48`
- **Problem:** Hardcoded `LEADERBOARD` demo array. Visible to all visitors.
- **Backend needed:** Pull from live Firestore leaderboard (top N opt-in users).

### 6. Deed tips schedule

- **File:** `src/lib/notifications/tipSchedule.ts:43-71`
- **Problem:** Random per device per day. Same user gets different tips at different times on different devices.
- **Backend needed:** Server-side schedule stored in Firestore; deterministic per user/day.

### 7. Prayer reminder sent-state

- **File:** `src/lib/notifications/sentState.ts:6,39`
- **Problem:** Tracks "already sent" in `localStorage`. Multiple tabs = duplicate alerts.
- **Backend needed:** Firestore doc per user per date.

---

## MEDIUM

### 8. Prayer checklist state

- **File:** `src/hooks/usePrayerChecklistState.ts:81-103`
- **Problem:** Syncs to Firestore but `localStorage` is primary source of truth. Offline edits not reconciled on reconnect.
- **Backend needed:** Offline-first sync queue with conflict resolution.

### 9. Settings persistence

- **File:** `src/lib/settingsService.ts` and consumer hooks
- **Problem:** Firestore works for some fields, but location cache, timezone, language, reader prefs sit in `localStorage`. Cross-device drift.
- **Backend needed:** Move all preferences to `users/{uid}/preferences`. Remove `localStorage` fallback.

### 10. Location cache + reverse-geocode

- **Files:**
  - `src/hooks/useLocationService.ts:64,80,177`
  - `src/hooks/useReverseGeocode.ts:32,71`
- **Problem:** Cached in `localStorage`. User moves city → old cache used on other devices.
- **Backend needed:** Firestore `users/{uid}/location` with TTL.

### 11. Profile sharing

- **Files:** `src/features/profile/ShareProfileDialog.tsx`, `src/features/profile/hooks/useProfileData.ts`
- **Problem:** Raw `/profile/{uid}` URLs. No share tokens, no expiry, no view tracking, only Firestore rules for gating.
- **Backend needed:** Signed share tokens with expiry; view-count tracking; link-preview generator.

### 12. DeedCity building unlocks

- **File:** `src/features/city/CityVisualization.tsx`
- **Problem:** Building levels driven by client-held stats. Editing `localStorage` upgrades the city.
- **Backend needed:** Server validates deed totals before unlocking levels.

---

## LOW

### 13. Quran bookmarks + reading progress

- **Files:**
  - `src/features/quran/hooks/useAyahBookmarks.ts`
  - `src/features/quran/hooks/useReadingProgress.ts`
- **Problem:** Firestore sync done (recent refactor). `localStorage` fallback still present — risk of stale shadow state.
- **Backend needed:** None new. Remove `localStorage` fallback once sync proven stable.

### 14. Amal Graph aggregation

- **File:** `src/lib/amalGraphCalculations.ts`
- **Problem:** Client determines "today" / "yesterday". No server snapshot for historical integrity.
- **Backend needed:** Daily snapshot Cloud Function → `users/{uid}/daily_snapshots/{date}`.

### 15. Prayer-times cache

- **File:** `src/hooks/useAlAdhanPrayerTimes.ts:56-78`
- **Problem:** `localStorage` cache; no invalidation mechanism if upstream API changes.
- **Backend needed:** Versioned cache key from server.

### 16. Hadith cache

- **File:** `src/hooks/useHadith.ts:91-113`
- **Problem:** Same as prayer times — `localStorage`, no push update.
- **Backend needed:** Versioned content keys.

### 17. Confetti celebration state

- **File:** `src/features/dashboard/utils/confettiCycleStorage.ts:25,33,41`
- **Problem:** Tracks "celebrated" in `localStorage`. Clearing storage re-fires celebration. Spoofable.
- **Backend needed:** Server-side celebration log per achievement.

### 18. Custom deeds storage

- **File:** `src/features/deeds/custom-deeds/`
- **Problem:** Verify Firestore is the only writer. Audit for `localStorage` fallback that could drop user-created deeds.
- **Backend needed:** None new. Audit + remove fallbacks.

### 19. Notification-permission state

- **File:** `src/hooks/useNotifications.ts`
- **Problem:** Browser permission state is transient. User re-prompted across sessions.
- **Backend needed:** Persist permission status in Firestore so server can choose not to dispatch to denied users.

---

## Backend Capabilities Required (rolled up)

| Capability | Used by gaps |
|---|---|
| **Firebase Cloud Functions** | 3, 4, 6, 7, 14 |
| **Firebase Cloud Messaging (FCM)** | 3, 6, 7 |
| **Cloud Scheduler / scheduled functions** | 3, 4, 6, 14 |
| **New Firestore collections** | 1, 5, 7, 9, 10, 14, 17, 19 |
| **Server-side validation** | 5, 12 |
| **Signed tokens** | 11 |

---

## Recommended Execution Order

1. **FCM + Cloud Functions bootstrap** (unblocks 3, 4, 6, 7)
2. **Streak midnight cron** (gap 4 — data integrity)
3. **Tips + reminders notification pipeline** (gaps 3, 6, 7)
4. **Circles backend** (gap 1 — entire feature dead)
5. **Ramadan feature** (gap 2 — stub)
6. **Settings + location Firestore migration** (gaps 9, 10)
7. **Profile share tokens** (gap 11)
8. **DeedCity server validation** (gap 12)
9. **`localStorage` fallback cleanup** (gaps 13, 18)
10. **Polish + hardening** (5, 14, 15, 16, 17, 19)

---

## Out of Scope

- Migration to non-Firebase backend (Supabase, Appwrite, custom server).
- Native mobile rewrite. Capacitor wrap is preferred path.
- E2E test coverage for newly added Cloud Functions (separate doc).
