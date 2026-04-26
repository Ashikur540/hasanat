## Why

Users need timely reminders to avoid missing prayers near the end of each waqt and
to stay spiritually engaged throughout the day. Adding browser/PWA notifications now
improves consistency in daily amal tracking without requiring users to keep the app open.

## What Changes

- Add reminder notifications for near-closing prayer windows when a prayer is still
  unchecked.
- Add independent good-deed suggestion notifications sent 3 times daily across
  morning/evening/night periods.
- Support delivery to web browser notifications and installed PWA contexts.
- Define notification scheduling behavior, eligibility checks, and user-facing message
  expectations for both reminder types.
- Make prayer reminders user-controlled (`dailyReminder`) and OFF by default for new users.
- Use the same system-notification delivery path for test notifications and production reminders.

## Capabilities

### New Capabilities
- `reminder-notifications`: Provides prayer-miss reminders and randomized good-deed tip
  notifications for browser and PWA users.

### Modified Capabilities
- None.

## Impact

- Affected areas: notification hooks/services, prayer completion state integration,
  service worker notification handling, and reminder-related user settings.
- External dependencies: browser Notification API, Service Worker APIs, and existing
  app prayer/deed state sources.
