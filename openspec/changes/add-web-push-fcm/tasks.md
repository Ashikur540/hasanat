## 1. Firebase Project Setup

- [ ] 1.1 Upgrade Firebase project to Blaze plan (required for Cloud Functions egress)
- [ ] 1.2 Enable Firebase Cloud Messaging in the console; generate a Web Push (VAPID) key pair
- [ ] 1.3 Enable Cloud Functions and Cloud Scheduler APIs in GCP
- [ ] 1.4 Add `VITE_FIREBASE_VAPID_KEY` to `.env.example` and document deployment env wiring

## 2. Client-Side Push Subscription

- [ ] 2.1 Add `firebase/messaging` to web app initialization in `src/lib/firebase.ts`
- [ ] 2.2 Implement `requestPushSubscription()` in a new `src/lib/notifications/pushSubscription.ts` that calls `getToken(messaging, { vapidKey })` and persists the token doc to Firestore
- [ ] 2.3 Implement `revokePushSubscription()` that calls `deleteToken()` and removes the Firestore doc
- [ ] 2.4 Wire push subscription into `NotificationProvider` so toggling "Always-on reminders" subscribes/unsubscribes
- [ ] 2.5 Detect iOS &lt; 16.4 / non-installed Safari and surface "Install to Home Screen" guidance instead of attempting subscription
- [ ] 2.6 Refresh token on app load and on `messaging.onTokenRefresh` (when supported); update `lastSeenAt`

## 3. Service Worker Push Handling

- [ ] 3.1 Extend the VitePWA-generated service worker with a custom `push` event listener that reads payload (title, body, tag, deeplink) and calls `self.registration.showNotification(...)`
- [ ] 3.2 Add a `notificationclick` listener that focuses an existing client window or opens the app deeplink (e.g., `/dashboard?prayer=fajr`)
- [ ] 3.3 Verify foreground push handling via `onMessage(messaging, ...)` so foreground-tab users still see a notification (or in-app toast)
- [ ] 3.4 Confirm the SW continues to function in dev mode with `devOptions.enabled: true`

## 4. Firestore Schema and Rules

- [ ] 4.1 Define `users/{uid}/pushTokens/{tokenHash}` doc shape (token, platform, userAgent, createdAt, lastSeenAt, enabled)
- [ ] 4.2 Define `users/{uid}/notificationDedupe/{yyyy-mm-dd}` doc shape (prayerSent[], tipSent[])
- [ ] 4.3 Update `firestore.rules` so only the owner can read/write their pushTokens and notificationDedupe collections
- [ ] 4.4 Add Firestore TTL policy on `notificationDedupe` documents (7 days)

## 5. Cloud Function Scheduled Dispatcher

- [ ] 5.1 Initialize a `functions/` package with TypeScript, ESLint, and the Firebase Admin SDK
- [ ] 5.2 Implement `scheduledPushDispatcher` as an `onSchedule("every 5 minutes")` function
- [ ] 5.3 Inside the function: read all users with `pushEnabled === true`; for each, compute prayer windows in the user's timezone using the same prayer-time logic as the client (port to a shared `lib/prayer/` helper consumable from functions)
- [ ] 5.4 For each due reminder (within 20-min near-close window, prayer not completed today, not already in dedupe), build payload and call `messaging.sendEachForMulticast(tokens, payload)`
- [ ] 5.5 Apply same logic for deed-tip morning/evening/night slots
- [ ] 5.6 On send failure with `messaging/registration-token-not-registered` or `invalid-registration-token`, delete the offending pushToken doc
- [ ] 5.7 Write dedupe state back to Firestore (`prayerSent` / `tipSent` arrays for the day)

## 6. Localization on the Server

- [ ] 6.1 Extract a minimal `serverTranslations.ts` map of the keys used in push payloads (notifReminderTitle/Body, notifTipTitle, deed-tip body) for `en` and `bn`
- [ ] 6.2 Read `users/{uid}.language` (default `en`) to pick language at send time
- [ ] 6.3 Add a contract test ensuring server keys match client keys (parity check during build)

## 7. Settings UI

- [ ] 7.1 Add `pushEnabled` boolean to `NotificationSettingsData` and persist via existing settings API
- [ ] 7.2 Add an "Always-on reminders" toggle row to `NotificationSettings.tsx` with copy distinguishing it from in-app reminders
- [ ] 7.3 When toggled on: trigger `requestPushSubscription()`; when off: trigger `revokePushSubscription()`
- [ ] 7.4 Show subscription status (subscribed devices count, last delivery success) in settings
- [ ] 7.5 Add iOS PWA install banner when push is unsupported on the current device

## 8. Reliability and Validation

- [ ] 8.1 Unit-test `pushSubscription.ts` token persist + revoke flow
- [ ] 8.2 Integration-test the Cloud Function dispatcher with the Firebase Emulator Suite (Auth + Firestore + Functions)
- [ ] 8.3 Manually verify push delivery on Chrome desktop, Chrome Android, Edge desktop, Firefox desktop, installed PWA on iOS 16.4+
- [ ] 8.4 Verify reminder fires when browser is fully closed (Chrome/Edge will auto-wake the SW)
- [ ] 8.5 Verify dedupe holds across same-device push + in-tab scheduler running together
- [ ] 8.6 Verify stale-token cleanup deletes Firestore docs after token invalidation

## 9. Documentation

- [ ] 9.1 Update `NOTIFICATION_IMPLEMENTATION.md` with the push pipeline diagram and SW push handler section
- [ ] 9.2 Document iOS 16.4+ + Home Screen install requirement in user-facing settings copy
- [ ] 9.3 Add a `functions/README.md` with deploy commands and emulator workflow
