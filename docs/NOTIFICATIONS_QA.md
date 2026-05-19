# Notifications Q&A — Tips + Prayer Reminders

Reference doc answering questions about `functions/src/tipDispatch.ts` and `functions/src/prayerReminderDispatch.ts`.

---

## 1. What is `prayer_{YYYY-MM-DD}_{prayerId}` (the dedup id)? Why needed? Where?

**Reference:** `functions/src/prayerReminderDispatch.ts:93`

```ts
const notifId = `prayer_${todayDate}_${candidate.id}`;
const notifRef = firestore
  .collection("users")
  .doc(uid)
  .collection("notifications")
  .doc(notifId);
const notifSnap = await notifRef.get();
if (notifSnap.exists) continue;
```

**What it is:** A deterministic Firestore document id. Composed of three parts joined by underscore:

- `prayer` — notification type prefix.
- `{YYYY-MM-DD}` — user's local date (computed via `userLocalDate(tz, now)`).
- `{prayerId}` — one of `fajr | dhuhr | asr | maghrib | isha`.

Example: `prayer_2026-05-16_asr` — Asr reminder for user on May 16 in their local timezone.

**Where it lives:** Subcollection `users/{uid}/notifications/{notifId}` in Firestore.

**Why needed:** Prevents the same prayer reminder from being sent twice in the same day to the same user.

The cron runs every 5 minutes. The "near-close" buffer is 20 minutes. That means a single prayer becomes a candidate roughly 4 cron ticks in a row (e.g. 20 min, 15 min, 10 min, 5 min before window close). Without dedup, the user would get 4 push notifications for the same prayer.

By making the doc id deterministic (same formula = same id), the second tick's `notifRef.get() → exists` returns true, and the function short-circuits with `continue`. Idempotent by construction — no race condition, no need for locks.

Same pattern in `tipDispatch.ts:68`: `tip_{date}_{slotId}` — same reasoning, prevents duplicate tips when cron ticks land twice inside the same 30-min slot window.

---

## 2. Why write the dedup doc with `{type, prayerId, date, deliveredCount, prunedCount, sentAt}`? What is dedup?

**Reference:** `functions/src/prayerReminderDispatch.ts:121-128`

```ts
await notifRef.set({
  type: "prayer_reminder",
  prayer: candidate.id,
  date: todayDate,
  deliveredCount: result.sent,
  prunedCount: result.pruned,
  sentAt: admin.firestore.FieldValue.serverTimestamp(),
});
```

**What "dedup" means:** Short for **deduplication** — making sure the same logical action only happens once. In this case, "send a Fajr reminder to user X on date Y" should happen at most once. The notification doc is the marker that proves it already happened.

**Why write the full payload (not just an empty doc)?**

| Field            | Purpose                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| `type`           | Lets future code query by type (e.g. "show all prayer reminders this week").        |
| `prayer`         | Which of the 5 prayers. Useful for analytics ("which prayer gets most reminders?"). |
| `date`           | User-local date as a string. Allows filtering without re-deriving from doc id.      |
| `deliveredCount` | How many FCM tokens accepted the message (= how many active devices).               |
| `prunedCount`    | How many tokens were stale and got deleted. Tracks token health.                    |
| `sentAt`         | Server timestamp. Useful for debugging "why did user get this at 3am?".             |

The doc could technically be empty (`set({})`) and dedup would still work — only `notifRef.exists` is checked. The metadata is bonus observability for debugging + future UI ("Notifications" history screen).

Same shape in `tipDispatch.ts:94-103`, plus `language` and `tipIndex` (which tip from the pool was chosen — useful for diversity audits).

---

## 3. Why `every 5 minutes`, region `us-central1`? Will it cause pressure?

**Reference:** `functions/src/prayerReminderDispatch.ts:174-181`

```ts
{
  schedule: "every 5 minutes",
  region: "us-central1",
  timeZone: "UTC",
  maxInstances: 1,
  memory: "256MiB",
  timeoutSeconds: 540,
}
```

### Why 5 minutes?

The buffer for "near close" reminders is 20 minutes (`BUFFER_MINUTES = 20`). Picking the cron cadence is a trade-off:

| Cadence         | Worst-case lateness | Function runs/day | Cost                                             |
| --------------- | ------------------- | ----------------- | ------------------------------------------------ |
| Every 1 min     | ~1 min              | 1,440             | High                                             |
| **Every 5 min** | **~5 min**          | **288**           | **Low**                                          |
| Every 15 min    | ~15 min             | 96                | Lower but reminder may fire only when 5 min left |
| Every 30 min    | ~30 min             | 48                | Reminder may miss window entirely                |

5 minutes gives reminders that feel "on time" (max 5 min stale) while keeping invocations well under the free-tier 2M/month cap. 288 runs × 30 days = 8,640 runs/month — drop in the bucket.

### Why `us-central1`?

Cheapest GCP region for Cloud Functions egress. Latency to user devices is irrelevant for push notifications (FCM is async and global anyway).

### Will it cause pressure?

**No, for current scale.** Each tick:

1. Reads all `users` docs (one Firestore read per user).
2. For users with reminders enabled + valid window: one query to `deed_logs` + one `get` per candidate notification doc.
3. FCM send is free, unlimited.

At 1,000 DAU:

- ~1,000 user reads × 288 ticks = 288K reads/day. Free tier = 50K/day → **would exceed free tier.**

**Optimization needed when DAU grows:** filter users at query time (e.g. only fetch users where `settings.notifications.dailyReminder == true`, or partition by timezone bucket so each tick only scans users in matching tz). Right now, at low DAU, it's fine.

`maxInstances: 1` ensures only one instance ever runs — even if a previous tick is slow, no concurrent runs = no double sends.

---

## 4. The `tz` parameter — whose timezone?

**The user's timezone.** Not Firebase, not the server.

**Where it comes from:** `userDoc.get("timezone")` at `tipDispatch.ts:39` and `prayerReminderDispatch.ts:37`.

It's stored at `users/{uid}.timezone` as an IANA timezone string (e.g. `"Asia/Dhaka"`, `"America/New_York"`). Written client-side via `Intl.DateTimeFormat().resolvedOptions().timeZone`.

**Why user timezone matters:** The cron runs in UTC on Google's servers, but a "morning tip" must mean morning _for the user_. A user in Dhaka (UTC+6) reaches 8am local at 2am UTC. The function must translate UTC `now` into user-local hour/minute to decide if it's the right time to send.

That translation happens in `lib/time.ts`:

```ts
userLocalDate(tz, now); // "2026-05-16"
userLocalHour(tz, now); // 8
userLocalMinute(tz, now); // 30
```

All three use `Intl.DateTimeFormat` with `timeZone: tz` — Node's stdlib handles DST, leap seconds, all that. No external library needed.

### `processUser` in detail (`tipDispatch.ts:33-115`)

Step-by-step:

1. **Extract user fields** from the Firestore snapshot:
   - `uid` = the document id.
   - `tz` = `users/{uid}.timezone`.
   - `settings` = `users/{uid}.settings` (has `language` + `notifications.deedTips` toggle).

2. **Early skip checks** (return without doing work):
   - No `tz` → skip with reason `"no-timezone"`. Can't compute local time.
   - `settings.notifications.deedTips` is falsy → skip with reason `"tips-off"`. User opted out.

3. **Compute user-local time** using `userLocalDate` / `userLocalHour` / `userLocalMinute`. Wrapped in try/catch because an invalid tz string (e.g. typo) would throw inside `Intl.DateTimeFormat`. On throw → skip with reason `"invalid-timezone"`.

4. **Find the active slot** using `activeSlotForLocalTime(localHour, localMinute)`:
   - Returns one of `morning | evening | night` if `now` is within ±30 min of the anchor (8am / 4pm / 8pm).
   - Returns `null` otherwise.
   - Null → skip with reason `"no-slot"`. Not time to send a tip.

5. **Dedup check**:
   - Build `notifId = tip_{date}_{slot}`.
   - Try `notifRef.get()`. If `exists` → already sent this slot today, skip with reason `"already-sent"`.

6. **Pick language** via `pickLanguage(settings)` → `"en"` or `"bn"` (default `"en"`).

7. **Choose tip deterministically**:
   - `pool = curatedTips[language]` (array of tip strings).
   - `idx = hashIndex(\`${uid}|${date}|${slot.id}\`, pool.length)` — djb2-style hash mod pool length.
   - Same user + same date + same slot → same index → same tip across all the user's devices.

8. **Dispatch** via `dispatchToUserDevices(uid, {title, body}, data)`:
   - Reads `users/{uid}/devices/*` for all registered FCM tokens.
   - Sends an FCM message per token.
   - Prunes any token that returns a "stale token" error.
   - Returns `{sent, pruned, failed}`.

9. **Write dedup doc** at `users/{uid}/notifications/{notifId}` with full metadata. This both prevents future duplicates AND records what was sent.

10. **Log** the outcome (uid, slot, language, tipIndex, delivered, pruned) for observability.

11. **Return** `{uid, processed: true, sentSlot: slot.id}`. The orchestrator uses this to count totals.

The prayer version (`prayerReminderDispatch.ts:31`) is nearly identical, with two extras:

- Also requires `location.lat/lng` (no GPS = can't compute prayer times).
- Loops over multiple candidate prayers (rare — usually just one near close at a time) and skips any already logged in `deed_logs` (user already prayed = no reminder).

---

## 5. Logical flow diagram

```
Cloud Scheduler (every 5 min for prayer, every 30 min for tip)
            │
            ▼
   onSchedule trigger
            │
            ▼
   runPrayerReminderScan(now)   ← (or runTipDispatchScan)
            │
            │  reads all users
            ▼
   ┌────────────────────────┐
   │  For each user chunk   │  ← chunks of 25, parallel via Promise.all
   │  (concurrency = 25)    │
   └────────────────────────┘
            │
            ▼
        processUser(userDoc, now)
            │
            ├─► skip if no tz / opted out / no location
            │
            ▼
        userLocalDate/Hour/Minute(tz, now)    ← from lib/time.ts
            │
            ▼
        find candidates
        ├─ prayer: getPrayerWindows + getNearClosePrayers
        └─ tip:    activeSlotForLocalTime
            │
            ├─► skip if none
            │
            ▼
        check dedup doc at users/{uid}/notifications/{notifId}
            │
            ├─► skip if exists
            │
            ▼
        pickLanguage(settings)
            │
            ▼
        choose payload
        ├─ prayer: PRAYER_LABELS + prayerReminderBody
        └─ tip:    curatedTips[lang][hashIndex(seed, pool.length)]
            │
            ▼
        dispatchToUserDevices(uid, notification, data)   ← lib/notify.ts
            │
            │  reads users/{uid}/devices/*
            │  sends FCM per token
            │  prunes stale tokens
            ▼
        write dedup doc with metadata
            │
            ▼
        log + return outcome
            │
            ▼
   Aggregate: {scanned, processed, totalSent}
            │
            ▼
   logger.info("...Dispatch complete", result)
```

### Function briefs

| Function                    | File                            | Role                                                                                                    |
| --------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `prayerReminderDispatch`    | `prayerReminderDispatch.ts:173` | Scheduled entry point. Wraps `runPrayerReminderScan` with cron config.                                  |
| `tipDispatch`               | `tipDispatch.ts:147`            | Scheduled entry point. Wraps `runTipDispatchScan` with cron config.                                     |
| `runPrayerReminderScan`     | `prayerReminderDispatch.ts:143` | Orchestrator. Loads users, chunks into batches of 25, calls `processUser` in parallel.                  |
| `runTipDispatchScan`        | `tipDispatch.ts:117`            | Same orchestrator pattern as above, for tips.                                                           |
| `processUser` (prayer)      | `prayerReminderDispatch.ts:31`  | Per-user decision: compute windows, find near-close prayers, dedup, dispatch, record.                   |
| `processUser` (tip)         | `tipDispatch.ts:33`             | Per-user decision: compute slot, dedup, pick tip, dispatch, record.                                     |
| `getPrayerWindows`          | `lib/prayerEngine.ts`           | Returns `{fajr, dhuhr, asr, maghrib, isha}` each with `{start, end}` Date instants using Adhan library. |
| `getNearClosePrayers`       | `lib/prayerEngine.ts`           | Filters windows to those ending within `BUFFER_MINUTES`. Returns sorted by minutesRemaining.            |
| `activeSlotForLocalTime`    | `lib/tips.ts`                   | Returns one of `morning/evening/night` if local time is within ±30 min of an anchor.                    |
| `hashIndex`                 | `lib/tips.ts`                   | djb2-style hash. Maps a seed string to `[0, mod)`. Used for deterministic tip selection.                |
| `dispatchToUserDevices`     | `lib/notify.ts`                 | Fans out FCM message to every device token registered for the user. Prunes stale tokens.                |
| `userLocalDate/Hour/Minute` | `lib/time.ts`                   | Translates a UTC instant into the user's local calendar/clock using `Intl.DateTimeFormat`.              |
| `shiftDate`                 | `lib/time.ts`                   | YYYY-MM-DD string math (e.g. yesterday from today). Used by streak function.                            |

---

## Quick mental model

> The cron is a heartbeat. Every tick, the function asks each user: "Is it the right _local_ time for you, and have I not already told you today?" If yes to both, send the push and write a marker so future ticks see it's done. The marker is the dedup doc. The locale awareness comes from the user's stored `timezone` string. FCM does the actual push delivery; stale tokens get cleaned up automatically.

---

## 6. Why does `notifications/` only contain tip docs? No prayer reminders — is it a bug?

**Short answer:** Not a bug. Prayer reminders have stricter preconditions than tips. If any precondition fails, no doc is written.

**Reference:** `functions/src/prayerReminderDispatch.ts:48-67`

```ts
if (!tz) return { uid, processed: false, skipReason: "no-timezone" };
if (!settings?.notifications?.dailyReminder) {
  return { uid, processed: false, skipReason: "reminders-off" };
}
if (typeof location?.lat !== "number" || typeof location?.lng !== "number") {
  return { uid, processed: false, skipReason: "no-location" };
}
// ...
const candidates = getNearClosePrayers(windows, now, BUFFER_MINUTES);
if (candidates.length === 0) {
  return { uid, processed: true, skipReason: "no-window" };
}
```

### Reasons no prayer-reminder doc gets written

| Reason          | Cause                                                                                                            | How to fix for testing                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `no-location`   | `users/{uid}.location.lat/lng` not set. Prayer times need GPS coords.                                            | Open app, grant location permission, wait for `useLocationService` to sync.     |
| `reminders-off` | `users/{uid}.settings.notifications.dailyReminder` is `false` or missing.                                        | Go to Settings → Notifications → toggle "Daily reminders" ON.                   |
| `no-window`     | Right now, no prayer's window is closing within 20 min. Only fires during the last 20 min of each prayer window. | Wait for a near-close moment — roughly 5 × 20 min = 100 min/day total coverage. |
| Already logged  | User completed the prayer (`deed_logs` has `prayer_{id}` for today) → cron skips because no reminder needed.     | Don't log the prayer; let the window approach close.                            |
| Already sent    | A `prayer_{date}_{id}` doc already exists for today.                                                             | Delete the dedup doc and wait for next 5-min tick.                              |

### Why tip docs appear but prayer docs don't

Tips have **looser preconditions**:

| Precondition                                         | Tip                        | Prayer                                     |
| ---------------------------------------------------- | -------------------------- | ------------------------------------------ |
| `timezone` set                                       | ✅ required                | ✅ required                                |
| `settings.notifications.deedTips` / `.dailyReminder` | ✅ required                | ✅ required                                |
| `location.lat/lng` set                               | ❌ not needed              | ✅ **required** ← most common skip reason  |
| Active window                                        | 3 slots × 1h = 3 h/day     | 5 prayers × 20 min = ~100 min/day          |
| Skipped if already done                              | n/a (no concept of "done") | ✅ skipped if prayer logged in `deed_logs` |

So if your test user has tips enabled but never set their location (or location toggle is off), tips will fire reliably while prayer reminders silently skip every tick. The fact that you see 3 tip docs (morning/evening/night) but no prayer docs strongly suggests **location is missing or `dailyReminder` is off**.

### How to confirm root cause

Open Cloud Logging in GCP console → filter:

```
resource.type="cloud_function"
resource.labels.function_name="prayerReminderDispatch"
jsonPayload.message=~"complete"
```

Each tick logs `{scanned, processed, totalSent}`. If `processed = 0` while `scanned > 0`, every user is being skipped before window evaluation — almost always `no-location` or `reminders-off`. Then dig into per-user logs (`logger.info` inside `processUser` only fires on successful sends, but skip reasons are returned in `UserOutcome` and could be logged at orchestrator level if needed).

### Action items if you actually want prayer reminders to test

1. In the running app, open Settings → confirm "Daily reminders" toggle is ON.
2. Allow location permission (or set manual location). Verify `users/{uid}.location.lat` exists in Firestore.
3. Wait for a 20-min-before-close window (or temporarily widen `BUFFER_MINUTES` in `prayerReminderDispatch.ts:16` for a faster test).
4. Don't log the prayer beforehand.
5. Wait up to 5 min for next cron tick.
6. Check Firestore → `users/{uid}/notifications/` for `prayer_{date}_{prayerId}` doc.

---

# Notifications QA — v0.4.0 post-release fixes

## Symptoms reported

1. App closed on mobile → no notification arrives.
2. Open app → 3 tips fire at once + prayer reminder fires again.
3. Mac Chrome (tab open) at 11:38 PM → Isha "20 min remaining" shown.
4. Re-open same tab at 11:46 PM → Isha "13 min remaining" + 3 tips again.

Server-side was supposed to be sole dispatcher via FCM. Engineering goal defeated.

---

## Root cause analysis

### Bug A — duplicates on every app open

`src/hooks/useReminderRunners.ts` was still mounted in `NotificationProvider`. It:

- Polled every 60s while tab open.
- Re-ran on `visibilitychange`, `focus`, and `storage` events.
- Built tip schedule from `localStorage` (`getOrCreateTipScheduleForDate`) — slots at 8am/4pm/8pm.
- On open after 8pm, **all 3 slots were "past due"** and `localStorage` dedup was empty → fired 3 local `Notification`s back-to-back.
- Prayer reminder polled `usePrayerTimes()` and fired local notifs whenever a window was inside 20 min.

These were never FCM. Pure client toasts overlaid on top of the (working) server FCM path.

### Bug B — silent when app closed

Server FCM **was** sending. Logs:

```
tipdispatch: {"slot":"morning","delivered":5,"pruned":0,"uid":"wIm9z..."}
prayer_2026-05-16_dhuhr  deliveredCount: 1
```

But device never displayed the push. Three contributing factors:

1. **Workbox precached `firebase-messaging-sw.js`.** VitePWA `globPatterns: ["**/*.{js,...}"]` pulled the FCM SW into the precache. After any env/version change, the stale FCM SW was served on revisit and silently dropped `push` events.
2. **Stale device tokens accumulated.** User had 5 device docs under `users/{uid}/devices/`. Admin SDK returns success on tokens that the browser silently unregistered (data cleared, PWA reinstalled). Error-code pruning alone never catches these.
3. **Default webpush urgency.** Without `Urgency: high`, browsers + OS battery-savers delay or drop background pushes on locked Android.

---

## Fixes shipped

### Client (`src/hooks/NotificationProvider.tsx`)

- Removed `useReminderRunners` invocation entirely.
- Removed `usePrayerTimes`, `useTimezoneService`, `LOCATION_CACHE_KEY` imports (only used to retrigger polling).
- `runSchedulerCheck` stubbed to no-op for type stability (dev debug button kept).
- Deleted dead files:
  - `src/hooks/useReminderRunners.ts`
  - `src/lib/notifications/tipSchedule.ts`
  - `src/lib/notifications/prayerCandidates.ts`
  - `src/lib/notifications/sentState.ts`

Result: client only registers FCM token + listens for foreground pushes. Zero local scheduling.

### Vite (`vite.config.ts`)

- `workbox.globIgnores: ["**/firebase-messaging-sw.js"]` — keep FCM SW out of precache.
- `workbox.navigateFallbackDenylist` extended with `/firebase-messaging-sw.js`.
- `workbox.runtimeCaching` excludes `/firebase-messaging-sw.js` and `www.gstatic.com` (FCM compat scripts) from `StaleWhileRevalidate`.
- Precache went from 92 → 91 entries (confirms FCM SW dropped).

### Server (`functions/src/lib/notify.ts`)

- **Age-based pruning**: any device doc with `updatedAt` older than 30 days is deleted before the send batch runs. Catches silently-dead tokens.
- **Webpush headers**: `Urgency: high`, `TTL: 1800` → wakes locked Android, caps queue time so late delivery doesn't surprise.
- **Webpush notification**: icon + badge set in payload so OS displays branded notification even if SW skips.
- **Android config**: `priority: "high"`, `channelId: "hasanat-reminders"`.

---

## Verification done locally

| Check                                                 | Result                                              |
| ----------------------------------------------------- | --------------------------------------------------- |
| `npm run build`                                       | passes, precache count dropped 92 → 91              |
| `cd functions && npx tsc --noEmit`                    | clean                                               |
| `useReminderRunners` grep across `src/`               | only self-references (file deleted)                 |
| `tipSchedule` / `prayerCandidates` / `sentState` grep | zero references                                     |
| Pre-existing TS errors in `NotificationProvider.tsx`  | unchanged by edits (confirmed via `git stash` diff) |

---

## Verification needed in prod after deploy

Steps:

1. `npm run deploy:all`.
2. On every active device:
   - DevTools → Application → Service Workers → **Unregister both** SWs.
   - Hard reload → re-grant notification permission → confirm new `users/{uid}/devices/{newId}` doc with fresh `token` + recent `updatedAt`.
3. Stale device docs (5 old ones) auto-pruned on next cron tick.

Acceptance criteria:

- Close app, lock phone → wait for next tip slot (8am/4pm/8pm local) → notification appears in tray.
- Open app → **no** bulk tip burst, **no** repeat prayer reminder.
- Firebase Console → Cloud Messaging → "Send test message" → paste current token → push appears within seconds.
- `firebase functions:log --only tipDispatch,prayerReminderDispatch`:
  - `delivered` ≥ 1 per active user per slot.
  - `pruned` increments as old device docs get cleaned.

If "send test message" lands but cron pushes do not → SW or scheduler issue.
If "send test message" fails → token / OS-level permission issue.

---

## Lessons

- Killing a polling loop in code != killing it in production. Must also delete the hook invocation and surrounding effects, not just stop calling it directly.
- FCM admin SDK "success" ≠ device received. Always pair error-pruning with age-pruning.
- `VitePWA` `globPatterns` is too greedy by default — every non-Workbox SW must be explicitly ignored.
