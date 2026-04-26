## ADDED Requirements

### Requirement: Always-on reminder delivery via Web Push
The system SHALL deliver prayer-window and deed-tip reminders via Web Push through
Firebase Cloud Messaging so that notifications fire even when the application tab,
browser, or installed PWA is fully closed.

#### Scenario: Push delivered when app closed
- **WHEN** a signed-in user has `pushEnabled` true, has a valid FCM token registered, and a prayer reminder becomes due
- **THEN** the system pushes the reminder via FCM and the device displays the notification without the app being open

#### Scenario: Push respects existing eligibility rules
- **WHEN** a reminder would be due but the prayer is already completed for the day OR a dedupe entry already records the same reminder
- **THEN** the system MUST NOT push that reminder

#### Scenario: Permission denied prevents subscription
- **WHEN** browser notification permission is `denied` or the Push API is unsupported
- **THEN** the system MUST NOT register a token and MUST surface guidance in settings

### Requirement: FCM token lifecycle management
The system SHALL register, refresh, and revoke FCM device tokens in response to user
actions and platform events.

#### Scenario: Subscribe persists token
- **WHEN** the user toggles "Always-on reminders" on
- **THEN** the system requests notification permission, obtains an FCM token, and writes a doc to `users/{uid}/pushTokens/{tokenHash}` with platform metadata

#### Scenario: Unsubscribe revokes token
- **WHEN** the user toggles "Always-on reminders" off
- **THEN** the system calls FCM `deleteToken()` and removes the corresponding Firestore doc

#### Scenario: Stale token cleanup
- **WHEN** an FCM send returns `messaging/registration-token-not-registered` or `invalid-registration-token`
- **THEN** the server MUST delete the offending pushToken doc and MUST NOT retry that token

#### Scenario: Token refresh updates record
- **WHEN** the FCM client emits a token refresh OR the app boots and obtains a different token
- **THEN** the system upserts the new token doc and updates `lastSeenAt`

### Requirement: Server-side scheduled dispatcher
The system SHALL run a server-side scheduler that periodically computes due reminders
per user and dispatches them via FCM.

#### Scenario: Cron evaluates due reminders
- **WHEN** the scheduled function fires (no less than once every 5 minutes)
- **THEN** the function reads users with push enabled, computes prayer windows in each user's timezone, and dispatches due reminders that pass eligibility and dedupe checks

#### Scenario: Multicast send for multi-device users
- **WHEN** a user has multiple registered FCM tokens
- **THEN** the function sends the reminder to all tokens via multicast in a single FCM call

#### Scenario: Dedupe persisted server-side
- **WHEN** a reminder is successfully dispatched
- **THEN** the function records the reminder in `users/{uid}/notificationDedupe/{yyyy-mm-dd}` so subsequent runs do not redispatch

### Requirement: Service worker push handling
The system SHALL handle FCM `push` events in the service worker and render
notifications regardless of foreground/background state.

#### Scenario: SW renders notification on push
- **WHEN** the service worker receives a `push` event with a valid FCM payload
- **THEN** it calls `self.registration.showNotification(title, options)` with the payload's title, body, tag, and icon

#### Scenario: Notification click focuses or opens app
- **WHEN** the user taps a delivered notification
- **THEN** the service worker focuses an existing client window for the app origin OR opens a new window at the deeplink encoded in the payload

### Requirement: Platform support and graceful degradation
The system SHALL detect platform support for Web Push and surface clear guidance when
the user's environment cannot subscribe.

#### Scenario: iOS Safari without PWA install
- **WHEN** the user is on iOS Safari that is not running as an installed PWA OR is on iOS &lt; 16.4
- **THEN** the system MUST NOT attempt subscription and MUST display guidance to install the app to the Home Screen

#### Scenario: Browsers without Push API
- **WHEN** `navigator.serviceWorker` or `PushManager` is unavailable
- **THEN** the system marks always-on reminders unsupported and continues to offer the in-tab reminder fallback

### Requirement: Coexistence with in-tab reminder scheduler
The system SHALL allow the in-tab scheduler from `reminder-notifications` to run
alongside the push pipeline without producing duplicate user-visible reminders.

#### Scenario: Server dedupe blocks in-tab duplicate
- **WHEN** the server has already pushed today's `fajr` reminder for the user
- **THEN** the in-tab scheduler MUST read the shared dedupe state and MUST NOT fire a second `fajr` reminder for the same day

#### Scenario: In-tab fallback when push unsupported
- **WHEN** push is unavailable but the in-tab settings (`dailyReminder`, `deedTips`) are on
- **THEN** the in-tab scheduler continues to deliver reminders for the open session
