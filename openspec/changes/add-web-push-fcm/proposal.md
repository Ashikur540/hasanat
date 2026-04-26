## Why

Current reminder system (`add-notification-reminders`) only fires while the app tab is
open. If the user closes the browser, kills the PWA, or does not visit the site that
day, no notification is delivered. This breaks the core value of a prayer reminder —
users want to be reminded *especially* when they have not opened the app yet.

Native Islamic apps (Muslim Bangla, Athan, etc.) deliver reliable always-on
notifications via OS-level alarm scheduling or Push messaging. To match that user
expectation on the web, Hasanat needs server-driven Web Push delivered through Firebase
Cloud Messaging (FCM) so reminders fire even when the browser/PWA is fully closed.

## What Changes

- Add Web Push subscription flow on the client: register service worker push manager,
  obtain FCM token, persist token to Firestore per user/device.
- Extend service worker to handle `push` events and render notifications via
  `self.registration.showNotification(...)` so they fire when app is closed.
- Add server-side scheduler (Firebase Cloud Function on Blaze plan) that runs on a
  recurring cron, computes per-user prayer windows + tip slots in user timezone, and
  pushes via FCM Admin SDK to subscribed device tokens.
- Persist server-side dedupe state in Firestore (mirrors current localStorage dedupe
  but per-device-token + day) so the same reminder is not pushed twice.
- Handle token rotation, unsubscribe, and stale-token cleanup (FCM returns
  `invalid-registration-token` / `not-registered`).
- Provide settings UI for "Always-on reminders" toggle (separate from current
  in-tab toggle) and clear copy explaining the difference.
- Document iOS PWA constraint: Web Push only available on iOS 16.4+ and only when
  installed to Home Screen.

## Capabilities

### New Capabilities
- `web-push-notifications`: Always-on, server-driven prayer and deed-tip reminders
  delivered via FCM Web Push to subscribed browsers and installed PWAs even when the
  app is closed.

### Modified Capabilities
- `reminder-notifications`: In-tab scheduler remains as fallback when push subscription
  is unavailable, denied, or unsupported (iOS Safari < 16.4, browsers without Push API).

## Impact

- Affected areas: service worker (push event handler), notification settings UI, new
  Firestore collections for FCM tokens + dedupe state, new Cloud Functions package,
  Firebase project upgrade to Blaze plan.
- External dependencies: Firebase Cloud Messaging, Firebase Cloud Functions, Cloud
  Scheduler (or function-internal `onSchedule` trigger), VAPID key pair, FCM Admin SDK.
- Cost: FCM messages free unlimited. Cloud Functions invocations and Cloud Scheduler
  jobs require Blaze (pay-as-you-go) plan. Estimated &lt;$1/month at &lt;10k users with a
  5-minute cron and per-user fan-out.
- Privacy: device tokens are sensitive. Stored under `users/{uid}/pushTokens/{token}`
  with Firestore rules restricting read/write to the owner. Tokens never logged.
