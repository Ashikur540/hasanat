# Design: Web Push via FCM

## Goals

- Deliver prayer-window and deed-tip reminders even when the app tab/PWA is fully
  closed.
- Match user expectation set by native Islamic apps (Muslim Bangla, Athan).
- Keep existing in-tab scheduler as fallback for unsupported environments.
- Stay within Firebase Blaze free tier for &lt;10k DAU.

## Non-goals

- Native iOS/Android apps. Capacitor/TWA wrap is a separate future change.
- Push for arbitrary user-defined deeds. Initial scope = prayer windows + curated
  deed tips only (mirrors current in-tab feature set).
- iOS Safari support below 16.4. Documented as unsupported.

## Architecture

```
Client                                Server (Cloud Functions)
------                                ------------------------
NotificationProvider
  ├─ requestPushSubscription()        scheduledPushDispatcher (cron */5 * * * *)
  │   └─ FCM SDK getToken()             ├─ Read users with pushEnabled=true
  │       └─ Save to Firestore          ├─ Compute per-user prayer windows
  │                                     ├─ Filter due reminders not yet sent
  │                                     ├─ messaging.sendEachForMulticast(tokens)
SW (sw.js)                              └─ Mark dedupe state
  ├─ on 'push' event
  │   └─ self.registration.showNotification()
  └─ on 'notificationclick'
      └─ focus or open app
```

## Key Decisions

### 1. FCM over raw Web Push protocol

**Decision:** Use Firebase Cloud Messaging (web SDK) instead of self-hosted VAPID push.

**Why:**
- Firebase already used for Auth and Firestore — no new infra.
- FCM Admin SDK handles VAPID, payload encryption, token rotation, APNs proxy for iOS.
- Free, unlimited messages.
- Single send call works for Chrome, Edge, Firefox, Safari (iOS 16.4+ PWA).

**Tradeoff:** Locks notification delivery to Firebase. Acceptable — already locked in for
Auth + Firestore.

### 2. Cloud Function cron over client-driven scheduling

**Decision:** Server-side Cloud Function runs every 5 minutes, fans out to due users.

**Why:**
- Client-side `setInterval` dies when tab closes → defeats the goal.
- `Periodic Background Sync API` is Chrome-only, throttled, and unreliable for
  prayer-time precision.
- Cloud Scheduler jobs cost ~$0.10 each above the free 3. One job suffices.

**5-minute granularity tradeoff:** Reminder may fire up to 5 min after the 20-min
near-close window opens. Acceptable — current in-tab scheduler is also 60s polled.
Can tighten to 1-minute later if needed (24× cost still well under $1/month).

### 3. Server-side dedupe in Firestore

**Decision:** Mirror the current `notificationSentState` localStorage map into a
Firestore doc per user: `users/{uid}/notificationDedupe/{yyyy-mm-dd}` →
`{ prayerSent: ["fajr"], tipSent: ["morning"] }`.

**Why:**
- Server has no access to the client's localStorage.
- Need to prevent the same reminder firing once via push and again via in-tab scheduler.
- Per-day docs auto-purge with a 7-day TTL policy on the collection.

**Conflict handling:** Both client and server read/write the dedupe doc. Last-write
wins is acceptable — duplicate suppression is safety-net, not strict invariant.

### 4. Token storage shape

```
users/{uid}/pushTokens/{tokenHash}
  ├─ token: string             // raw FCM token, sensitive
  ├─ platform: "web" | "android" | "ios"
  ├─ userAgent: string
  ├─ createdAt: Timestamp
  ├─ lastSeenAt: Timestamp
  └─ enabled: boolean
```

`tokenHash` (sha256 of token) is the doc ID so re-subscription updates the same doc
instead of bloating the collection.

**Stale token cleanup:** When `messaging.sendEachForMulticast` returns
`invalid-registration-token` or `messaging/registration-token-not-registered`, the
function deletes the doc.

### 5. iOS PWA path

**Decision:** Detect iOS &lt; 16.4 or non-installed Safari. Show "Install to Home Screen
required" banner instead of attempting subscription.

**Why:** Apple only ships Web Push for installed PWAs on iOS 16.4+. Calling
`Notification.requestPermission()` in bare Safari fails silently.

### 6. Two settings: "In-tab" vs "Always-on"

**Decision:** Keep existing `dailyReminder` and `deedTips` toggles (in-tab). Add new
`pushEnabled` toggle that gates server-side push. UI groups them with copy:

> **In-app reminders** (always free): fire while the app is open
> **Always-on reminders** (recommended): fire even when the app is closed

**Why:** Some users may want push without the in-tab scheduler also running, or vice
versa. Keep concerns separable.

## Cost Model

| Item | Free tier | Hasanat est | Notes |
|---|---|---|---|
| FCM send | unlimited | ~5 prayer + 3 tips × users × day | $0 |
| Cloud Functions (Blaze) | 2M invocations/mo | ~8.6k/day at */5 cron = 260k/mo | $0 |
| Cloud Functions CPU/mem | 400k GB-s/mo | function ~30s × 8.6k = 260k s × 256MB = 66k GB-s | $0 |
| Firestore reads | 50k/day | ~10 reads/user/day × 1k users = 10k/day | $0 |
| Firestore writes | 20k/day | ~5 writes/user/day × 1k users = 5k/day | $0 |
| Cloud Scheduler | 3 free jobs | 1 job (the cron) | $0 |
| Outbound network | 5 GB/mo | minimal | $0 |

**Estimated: $0/month up to ~5k DAU.** First paid line item shows up when Firestore
reads cross 50k/day, which is roughly 5k users × 10 reads/day. Add a per-user
last-checked-at gate to avoid re-reading users with nothing due.

## Open Questions

1. **Cron pacing:** Start at 5-minute. Tighten later if user feedback demands precision.
2. **Multi-device:** A user with 3 devices gets 3 notifications. Acceptable initially
   (mirrors WhatsApp behavior). De-dupe across devices = future work.
3. **Quiet hours:** Out of scope for v1 — deed tips already use 7am–10pm windows.
   Prayer reminders intentionally fire at any hour matching the prayer schedule.
4. **Translations on server:** Function needs i18n strings. Either bundle a tiny
   `serverTranslations.ts` mirror of the client keys used, or pass language code in
   the user doc and pick from a small server-side map. Lean toward the latter.
