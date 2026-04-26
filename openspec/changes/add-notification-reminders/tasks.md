## 1. Notification Infrastructure

- [x] 1.1 Add browser notification permission + capability checks in the notification layer
- [x] 1.2 Add service worker notification delivery helper with fallback handling
- [x] 1.3 Persist notification dedupe state keys in local storage by user/day/reminder type

## 2. Prayer-Miss Reminder Flow

- [x] 2.1 Integrate prayer-time and prayer-completion state sources for current-day reminder eligibility
- [x] 2.2 Implement 20-minute near-close window detection and schedule missed-prayer reminder triggers
- [x] 2.3 Prevent duplicate prayer reminders for the same user, prayer, and day
- [x] 2.4 Set `dailyReminder` default to OFF for new users and only send when user toggles it on

## 3. Random Good-Deed Tip Flow

- [x] 3.1 Implement 3-per-day deed-tip scheduling across morning/evening/night windows independent from prayer reminders
- [x] 3.2 Send localized deed-tip notification content at eligible random slots
- [x] 3.3 Disable deed-tip scheduling and sending when deed-tip settings are off

## 4. Settings and UX Integration

- [x] 4.1 Wire `dailyReminder` and `deedTips` toggles to scheduler start/stop behavior
- [x] 4.2 Update test notification behavior to use the same system-notification delivery path as production reminders
- [x] 4.3 Add visible permission-state messaging in settings for blocked/denied notifications

## 5. Reliability and Validation

- [x] 5.1 Recompute and reschedule reminders on app start, resume, and timezone/location changes
- [x] 5.2 Add unit/integration tests for reminder eligibility, dedupe, and random tip independence
- [x] 5.3 Verify browser + installed PWA reminder behavior for both prayer and deed-tip scenarios
