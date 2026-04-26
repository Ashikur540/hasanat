# Notification System — Full Implementation Guide

This doc walks through every file, function, hook, and how they wire together. Read top-to-bottom; each section builds on the previous one.

---

## 1. Big Picture

Goal: send the user system notifications for two things:

1. **Prayer reminders** — when a prayer's time window is about to close (within 20 min) and the user hasn't marked it done.
2. **Deed tips** — three random tips per day across morning / evening / night windows.

Delivery uses the **Web Notification API**, preferring the **Service Worker** path (`registration.showNotification`) so notifications still appear if the tab is backgrounded; falls back to `new Notification(...)` constructor when no SW is available.

The system has four moving pieces:

```
┌─────────────────────────────────────────────────────────┐
│  1. Service Worker (PWA)        — registered at boot    │
│  2. NotificationProvider        — React context         │
│  3. useReminderRunners          — scheduling loop       │
│  4. dispatchSystemNotification  — single delivery fn    │
└─────────────────────────────────────────────────────────┘
```

Plus two storage layers:

- **localStorage** — sent-state dedupe, tip schedule, completed prayers (per day).
- **Firestore** — completed prayers (synced every 5 min and on focus).

---

## 2. File Map

```
src/lib/notifications/
  dateUtils.ts           — date string + time parsing
  prayerCandidates.ts    — pick prayers near close
  tipSchedule.ts         — daily tip slot generation + storage
  sentState.ts           — dedupe (which notifs already fired today)
  platform.ts            — OS / browser detection
  dispatch.ts            — actual notification delivery
  deedTips.ts            — tip text pool (curated + PRESET_DEEDS)

src/hooks/
  useReminderRunners.ts  — the ticking scheduler hook
  useNotifications.tsx   — React context provider + permission UI

src/features/settings/notifications/
  notificationItems.ts        — toggle list config
  platformHelpKeys.ts         — i18n keys per OS
  NotificationToggleRow.tsx   — one toggle row component
  PermissionRow.tsx           — permission badge + Enable button
  PlatformHelp.tsx            — Safari banner + collapsible help

src/features/settings/
  NotificationSettings.tsx    — composes everything

src/lib/pwa.ts                — SW registration
vite.config.ts                — VitePWA plugin (dev SW enabled)
```

---

## 3. Bootstrap (How the system turns on)

### `src/main.tsx`

```ts
registerPwaServiceWorker();
createRoot(...).render(<ThemeProvider>...<App /></ThemeProvider>);
```

`registerPwaServiceWorker()` runs **before React mounts** so the SW starts registering early.

### `src/lib/pwa.ts`

```ts
export const registerPwaServiceWorker = () => {
  if (!("serviceWorker" in navigator)) return;
  registerSW({ immediate: true, onRegisteredSW, onRegisterError });
};
```

- `immediate: true` — register right now, don't wait for `load` event.
- No PROD gate — SW also registers in dev (so Mac mini + ngrok testing matches prod).

### `vite.config.ts` — VitePWA plugin

```ts
devOptions: { enabled: true, type: "module", navigateFallback: "index.html" }
```

This makes Vite generate a real dev SW into `dev-dist/` so `navigator.serviceWorker.ready` actually resolves during `npm run dev`. Without it, `serviceWorker.ready` would hang forever in dev.

### `src/App.tsx`

`<NotificationProvider>` wraps the app inside `<AuthProvider>`. So provider always has access to `user.uid`.

---

## 4. Core Layer: `src/lib/notifications/`

### 4.1 `dateUtils.ts`

Two pure helpers, no React.

```ts
getLocalDateKey(date)           // "2026-04-25" — local timezone, used as dedupe key
parseTimeToDate("18:30", now)   // returns Date today at 18:30
```

**Why local date:** dedupe must roll over at midnight in the user's clock, not UTC.

### 4.2 `prayerCandidates.ts`

Identifies prayers about to expire.

```ts
type PrayerReminderId = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

readCompletedPrayersFromLocalStorage(dateKey): Set<PrayerReminderId>
```
Reads `hasanat-prayers-state-{dateKey}` (written by the prayer tracking feature elsewhere) and returns IDs the user marked complete.

```ts
getNearClosePrayerCandidates(schedule, now, bufferMinutes): PrayerReminderCandidate[]
```
For each prayer in the schedule:
1. Skip if `now < start` or `now > end` (window not active).
2. Compute `minutesRemaining = (end - now) / 60000`.
3. Keep if `0 ≤ minutesRemaining ≤ buffer` (default buffer = 20 min).

Returns sorted ascending — closest-to-closing first.

### 4.3 `tipSchedule.ts`

Daily randomized tip slots.

```ts
const TIP_WINDOWS = {
  morning: { hour: 8, durationMinutes: 180 },   // 08:00–11:00
  evening: { hour: 16, durationMinutes: 180 },  // 16:00–19:00
  night:   { hour: 20, durationMinutes: 180 },  // 20:00–23:00
};
```

```ts
buildTipSlots(rng): TipSlot[]
```
For each window, pick a random minute in the 180-min window, return `{ id, time: "HH:MM" }`.

```ts
getOrCreateTipScheduleForDate(userId, dateKey): StoredTipSchedule
```
- If `localStorage[hasanat-notif-tip-schedule-v1]` matches `{userId, dateKey}` → return cached.
- Else generate new slots, save, return.

This means **the same 3 random times stay stable for the day** — page reloads don't reroll, dedupe still works.

```ts
isTipSlotDue(slot, now): boolean
```
True once `now ≥ slot time`.

### 4.4 `sentState.ts`

In-memory + localStorage dedupe.

```ts
type NotificationSentState = Record<string, number>;  // sentKey → timestamp

makeNotificationSentKey(userId, dateKey, type, identifier)
// returns "uid123:2026-04-25:prayer:fajr"

wasNotificationSent(state, key): boolean
markNotificationSent(state, key, now): NotificationSentState
```

Storage key: `hasanat-notif-sent-v1`. Each entry is `userId:date:type:identifier → unixMillis`. Old entries never expire — fine because date is in the key (yesterday's `fajr` ≠ today's `fajr`).

### 4.5 `platform.ts`

Pure detection, no side effects.

```ts
isMacOS()         — UA + navigator.platform check
isSafari()        — Safari regex AND not Chrome/Edge/Opera
isStandalonePwa() — display-mode: standalone OR navigator.standalone
detectDevicePlatform(): DevicePlatform  // "macos"|"windows"|"linux"|"android"|"ios"|"unknown"
```

`detectDevicePlatform()` order matters:
1. Android (UA)
2. iOS (UA)
3. iPad-on-iPadOS-13+ (reports MacIntel, distinguish via `maxTouchPoints > 1`)
4. macOS, Windows, Linux fallback

### 4.6 `dispatch.ts` — single source of truth for delivery

This is the critical file. Everything that wants to send a notification calls `dispatchSystemNotification`.

#### `getServiceWorkerRegistration(timeoutMs = 1500)`

```ts
let cachedRegistration: ServiceWorkerRegistration | null = null;
```

Module-level cache so we don't re-await `serviceWorker.ready` on every dispatch.

Logic:
1. Return cached if exists.
2. Try `navigator.serviceWorker.getRegistration()` — gives us an already-active SW immediately.
3. Else race `navigator.serviceWorker.ready` against a 1500 ms timeout.
4. Return registration or null.

Why 1500 ms (not 5000)? Test button felt dead at 5 s. 1.5 s is enough for a registered SW; if it hasn't resolved by then, the SW probably isn't going to.

#### `dispatchSystemNotification(payload): DispatchResult`

Returns a discriminated union:

```ts
type DispatchResult =
  | { ok: true; via: "sw" | "direct" }
  | { ok: false; reason: "permission"|"unsupported"|"no-sw"|"platform"|"error"; detail?: string };
```

Flow:

```
1. No Notification API in window?
   → { ok: false, reason: "unsupported" }

2. Notification.permission !== "granted"?  ← reads LIVE permission
   → { ok: false, reason: "permission" }

3. Got SW registration?
   → registration.showNotification(...)
   → { ok: true, via: "sw" }

4. Safari + macOS + not in standalone PWA?
   → { ok: false, reason: "platform", detail: "safari-needs-pwa" }

5. Try `new Notification(...)` constructor
   → { ok: true, via: "direct" }
   → on throw: { ok: false, reason: "error" }   (often macOS OS-level block)
```

**Critical detail at step 2:** reads `Notification.permission` directly, NOT React state. Reason: when user grants permission, `Notification.requestPermission()` resolves before React's `setPermissionStatus` flushes. A closure capturing stale state would reject the dispatch right after the user just granted. Bug fix.

### 4.7 `deedTips.ts`

```ts
const curatedTips: Record<"en"|"bn", string[]> = { ... };

function formatDeedTip(deed) {
  return `${deed.emoji} ${deed.name} — ${deed.description}`;
}

getRandomTip(language) {
  const pool = language === "bn"
    ? curatedTips.bn
    : [...curatedTips.en, ...PRESET_DEEDS.map(formatDeedTip)];
  return pool[Math.floor(Math.random() * pool.length)];
}
```

**English pool** = 6 curated tips + every preset deed (~80) formatted as `emoji name — description`. Mass variety, sourced from real deed library.

**Bengali pool** = curated only (deeds.ts has no BN translations).

Also exports `getPrayerReminderBody(language, prayerName, minutes)` — formats the prayer reminder body string.

---

## 5. Scheduling Hook: `src/hooks/useReminderRunners.ts`

The runtime scheduler. Encapsulates all the loop logic so the provider stays thin.

### Inputs

```ts
useReminderRunners({ settings, permissionStatus })
```

### Internal state (refs, not state — don't trigger re-renders)

```ts
sentStateRef             — loaded once from localStorage at mount
firestoreCompletedRef    — Set<PrayerReminderId> from Firestore today
```

### `refreshFirestoreCompleted()`

Queries Firestore:
```ts
collection("deed_logs")
  .where("userId", "==", uid)
  .where("date",   "==", todayKey)
  .where("deedId", "in", ["prayer_fajr", "prayer_dhuhr", ...])
```
Strips `prayer_` prefix → fills `firestoreCompletedRef`.

### `getMergedCompletedPrayers(dateKey)`

Union of localStorage completed + Firestore completed. Used by the prayer runner.

Why both? localStorage is instant (offline), Firestore is the source of truth across devices. Merging means: a prayer marked done on phone will suppress a reminder on laptop within 5 min.

### `runPrayerReminderChecks()`

```
0. Bail if no user OR permission ≠ granted OR dailyReminder toggle off.
1. now = new Date(); dateKey = getLocalDateKey(now)
2. completed = mergedCompleted(dateKey)
3. candidates = getNearClosePrayerCandidates(schedule, now, 20)
4. next = first candidate not in completed AND not in sentState
5. if !next: return
6. body = getPrayerReminderBody(lang, prayerName, minutesRemaining)
7. result = await dispatchSystemNotification({ title, body, tag })
8. if result.ok: markNotificationSent(...) → updates ref + localStorage
```

`tag: "prayer-fajr-2026-04-25"` — same tag replaces previous notif of same kind, never stacks.

### `runTipReminderChecks()`

```
0. Bail if no user OR permission ≠ granted OR deedTips toggle off.
1. tipSchedule = getOrCreateTipScheduleForDate(uid, dateKey)
2. due = first slot where isTipSlotDue(slot, now) AND NOT sent
3. if !due: return
4. body = getRandomTip(language)
5. result = dispatch(...)
6. if ok: mark sent
```

### `runReminderChecks()` (combined)

```ts
if (!isEnabled) return;
await runPrayerReminderChecks();
await runTipReminderChecks();
```

`isEnabled = settings.dailyReminder || settings.deedTips`.

### Effects inside `useReminderRunners`

**Effect 1 — Firestore polling:**
```ts
useEffect(() => {
  void refreshFirestoreCompleted();
  const id = setInterval(refreshFirestoreCompleted, 5 * 60 * 1000);
  return () => clearInterval(id);
}, [user?.uid]);
```
Refresh every 5 min. Cross-device sync of completed prayers.

**Effect 2 — The minute ticker:**
```ts
useEffect(() => {
  if (!user?.uid || !isEnabled) return;
  void runReminderChecks();
  const id = setInterval(runReminderChecks, 60 * 1000);
  return () => clearInterval(id);
}, [isEnabled, runReminderChecks, user?.uid]);
```
Every 60 s call `runReminderChecks`. With dedupe, redundant calls are free.

### Returns

```ts
{ runReminderChecks, refreshFirestoreCompleted }
```

Provider uses these for additional triggers (focus, visibility, storage events).

---

## 6. Provider: `src/hooks/useNotifications.tsx`

React context layer. Owns:

- Permission state (one piece of React state, drives UI badges).
- The user-facing actions: `requestPermission`, `sendTestNotification`.
- Browser event wiring (focus, visibility, storage) → triggers `runReminderChecks`.

### State

```ts
const [permissionStatus, setPermissionStatus] = useState(getInitialPermissionStatus);
```

`getInitialPermissionStatus()`:
- No `window` → `"unsupported"`
- No Notification API → `"unsupported"`
- Else `Notification.permission` ("default" | "granted" | "denied")

### `requestPermission()`

```
1. No API? set "unsupported", toast, return
2. Already granted? sync state, return "granted"
3. Already denied? toast "denied", return "denied"
4. Default? await Notification.requestPermission() — shows browser prompt
5. Set state to result, return result
```

### `sendTestNotification(type)`

Used by the Test buttons in settings.

```
1. If permissionStatus === "default": call requestPermission() first
2. If still not granted: toast "permission required", bail
3. Build payload via buildTestPayload(type, t, language):
     reminder → notifReminderTitle / notifReminderBody
     streak   → notifStreakTitle   / notifStreakBody
     tip      → notifTipTitle      / getRandomTip(lang)
     weekly   → notifWeeklyTitle   / notifWeeklyBody
4. result = await dispatchSystemNotification(payload)
5. result.ok → done
6. Map result.reason → specific toast:
     "permission"           → "settingsNotifPermissionRequired"
     "unsupported"          → "settingsNotifPermissionUnsupported"
     "platform" + safari... → "settingsNotifSafariNeedsPwa"
     "error"  + isMacOS()   → "settingsNotifBlockedByOS"  (macOS System Settings)
     fallback               → "settingsNotifBlockedByBrowser"
```

Each branch has actionable description text in the toast (i18n).

### Effects

**Effect A — sync permission on tab return:**
```ts
window.addEventListener("focus",            sync);
document.addEventListener("visibilitychange", sync);
```
If user grants permission via browser settings while in another tab, we catch up.

**Effect B — re-run checks when prayer schedule or timezone changes:**
```ts
useEffect(() => { void runReminderChecks(); },
  [appSettings.timeZone, runReminderChecks, schedule, user?.uid]);
```

**Effect C — focus / visibility / storage triggers:**
```ts
visibilitychange (visible) → refreshFirestoreCompleted + runReminderChecks
focus                      → same
storage event              → if key matches LOCATION_CACHE_KEY or hasanat-prayers-state-* → same
```

The storage event means: complete Maghrib in another tab → this tab's reminder loop wakes up and won't re-fire.

### Memoized values

```ts
platformHint = isSafari() && isMacOS() && !isStandalonePwa() ? "safari-needs-pwa" : null
devicePlatform = detectDevicePlatform()
```

### Context value exposed

```ts
{
  settings,                 // notification toggle state
  permissionStatus,         // granted | denied | default | unsupported
  requestPermission,        // (called by Enable button)
  sendTestNotification,     // (called by Test buttons)
  runSchedulerCheck,        // (= runReminderChecks; dev debug button)
  platformHint,             // null | "safari-needs-pwa" | "macos-blocked"
  devicePlatform,           // for help text
}
```

---

## 7. Settings UI: `src/features/settings/notifications/`

The Settings UI subscribes to the context and renders four sections.

### `notificationItems.ts` — pure config

```ts
export const NOTIFICATION_ITEMS = [
  { key: "dailyReminder", labelKey: "settingsDailyReminder", descKey: "...", test: "reminder" },
  { key: "streakAlerts",  labelKey: "settingsStreakAlerts",  descKey: "...", test: "streak"   },
  { key: "deedTips",      labelKey: "settingsDeedTips",      descKey: "...", test: "tip"      },
  { key: "circleUpdates", labelKey: "settingsCircleUpdates", descKey: "..." },
  { key: "weeklyReport",  labelKey: "settingsWeeklyReport",  descKey: "...", test: "weekly"   },
];

export const COMING_SOON_KEYS = ["streakAlerts", "circleUpdates", "weeklyReport"];
```

Data-driven — adding a toggle = one entry.

### `platformHelpKeys.ts` — i18n key lookup per OS

```ts
PLATFORM_HELP_KEYS: Record<DevicePlatform, { title, items: [3 keys] }>
```

Maps `devicePlatform` to title + 3 troubleshooting bullet i18n keys for that OS.

### `NotificationToggleRow.tsx`

Renders one row: label + "Coming Soon" badge if applicable + Test button (if `test` defined and toggle on) + Switch.

Props:
```ts
{ item: NotificationItem, checked, onToggle, onTest }
```

### `PermissionRow.tsx`

Permission badge (granted/denied/default/unsupported) + Enable button (visible when not granted/unsupported).

### `PlatformHelp.tsx`

- Amber banner if `platformHint === "safari-needs-pwa"`.
- `<details>` collapsible with the 3 platform-specific help bullets.

### `NotificationSettings.tsx` (main)

Pure composition:

```tsx
<Card>
  {NOTIFICATION_ITEMS.map(item => <NotificationToggleRow ... />)}
  <Separator />
  <PermissionRow ... />
  <PlatformHelp ... />
  {isDev && <DevDebugButton onClick={runSchedulerCheck} />}
  <Separator />
  <ReminderTimeInput />   {/* coming soon */}
</Card>
```

`handleToggleChange(key, value)`:
- Set form value (react-hook-form).
- If turning on `dailyReminder` or `deedTips` and permission ≠ granted → call `requestPermission()` to prompt.

---

## 8. End-to-End Flow Examples

### Flow A: User clicks Test on Daily Reminder

```
1. NotificationToggleRow → onTest("reminder")
2. handleTest → sendTestNotification("reminder")
3. permission === "granted"? Yes (assume)
4. buildTestPayload → { title: "Time to Pray", body: "...", tag: "test-prayer-reminder" }
5. dispatchSystemNotification:
   - Notification.permission === "granted" ✓
   - getServiceWorkerRegistration() → cached SW
   - registration.showNotification(...) → success
   - return { ok: true, via: "sw" }
6. Toast: none (ok). Notification appears.
```

### Flow B: User toggles Daily Reminder ON, permission was "default"

```
1. handleToggleChange("dailyReminder", true)
2. setValue("notifications.dailyReminder", true)
3. permission !== "granted" → call requestPermission()
4. Browser shows native permission prompt
5. User clicks Allow → Notification.requestPermission() resolves "granted"
6. setPermissionStatus("granted")
7. Form is dirty, user clicks Save (elsewhere) → settings persist
8. useReminderRunners' useEffect re-runs because permissionStatus changed
   → runReminderChecks fires
9. If a prayer is within 20 min of close → notification dispatched
```

### Flow C: 60s tick fires for tip

```
1. setInterval (60s) calls runReminderChecks
2. runPrayerReminderChecks → no candidate (or already sent), returns
3. runTipReminderChecks:
   - tipSchedule = { morning: "08:42", evening: "17:13", night: "21:05" }
   - now = 17:14, evening slot is due, not yet sent
   - dispatchSystemNotification({ title: "Tip of the Day", body: "📖 Read 1 Page of Quran — ...", tag: "tip-evening-2026-04-25" })
   - SW shows notification
4. markNotificationSent("uid:2026-04-25:tip:evening")
5. Next 60s tick: same check, but wasNotificationSent === true → skip
```

### Flow D: User on Mac mini, OS-level notifications blocked for Chrome

```
1. Click Test → sendTestNotification("tip")
2. dispatchSystemNotification:
   - permission === "granted" (browser-level allow)
   - SW exists, registration.showNotification(...) → silent (OS blocks but doesn't throw via SW)
   - returns { ok: true, via: "sw" }   ← false positive!
```

(Note: OS-level mac blocks for SW path don't throw. Direct constructor *does* throw. So if SW is the path, we can't detect mac OS block.)

For the constructor path:
```
   - new Notification(...) → throws TypeError
   - caught → { ok: false, reason: "error" }
3. sendTestNotification: result.reason === "error" && isMacOS()
   → toast: "Allow notifications for this browser in macOS System Settings"
```

---

## 9. Why each design choice

| Decision | Reason |
|----------|--------|
| SW path first, constructor fallback | SW notifications survive tab close/background. Constructor needs tab open. |
| Live `Notification.permission` not React state in dispatch | `requestPermission()` resolves before React flushes — would reject freshly-granted user. |
| Cached SW registration | Avoid re-awaiting `serviceWorker.ready` on every dispatch. |
| 1.5s SW timeout | 5s felt dead. 1.5s is enough for a registered SW. |
| localStorage + Firestore for completed prayers | LocalStorage = instant offline. Firestore = cross-device truth. Union of both. |
| `tag` on every notification | Browser de-dupes same-tag notifs visually. Combined with `sentState` for correctness. |
| Tip schedule generated once per day | Stable times per day across reloads. Without this, every reload re-randomizes. |
| Discriminated union `DispatchResult` | Caller can map each failure to actionable UI. Generic boolean would lose info. |
| `useReminderRunners` extracted from provider | Provider is now ~230 lines. Scheduling logic is testable in isolation. |
| Dev SW (`devOptions.enabled: true`) | Without it, `serviceWorker.ready` hangs forever in dev → fallback never triggered → silent failure. |
| Sub-components for settings UI | Each row is self-contained, props-driven, easy to read. Main file is composition only. |

---

## 10. Storage Keys Reference

| Key | Shape | Purpose |
|-----|-------|---------|
| `hasanat-notif-sent-v1` | `{ "uid:date:type:id": timestamp }` | Dedupe — has this notif fired today? |
| `hasanat-notif-tip-schedule-v1` | `{ userId, date, slots: TipSlot[] }` | Today's randomized tip times |
| `hasanat-prayers-state-{date}` | `{ fajr: { completed }, ... }` | Per-day prayer completion (written elsewhere, read here) |

---

## 11. Common Failure Modes (Mac mini debugging)

| Symptom | Cause | Fix |
|---------|-------|-----|
| Test button silent, no toast | SW never registered (dev gate) | `vite.config.ts` `devOptions.enabled: true` ✓ |
| Test button shows error toast immediately after granting | Stale React state in dispatch | Read `Notification.permission` live ✓ |
| 5s delay then nothing | `serviceWorker.ready` hung | 1.5s timeout + fallback ✓ |
| Permission granted, notif still silent on Mac | macOS System Settings → Notifications → [browser] OFF | Toast tells user where to look ✓ |
| Safari shows nothing ever | Safari macOS needs installed PWA | Banner: "Install via Share → Add to Dock" ✓ |
| PWA install button missing | Static `public/site.webmanifest` shadowed VitePWA's | Deleted static file, VitePWA's manifest takes over ✓ |

---

## 12. TL;DR Mental Model

```
User toggles ON  →  permission prompt  →  Allow
                                            ↓
                              Settings persisted (form save)
                                            ↓
              useReminderRunners' interval ticks every 60s
                                            ↓
              runPrayerReminderChecks + runTipReminderChecks
                                            ↓
        For each: filter completed + filter already-sent → pick first
                                            ↓
                        dispatchSystemNotification(payload)
                                            ↓
                  SW.showNotification (preferred) OR new Notification
                                            ↓
                        markNotificationSent → localStorage
```

That's the whole system.
