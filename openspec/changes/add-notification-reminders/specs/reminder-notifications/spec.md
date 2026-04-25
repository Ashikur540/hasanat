## ADDED Requirements

### Requirement: Browser and PWA reminder delivery
The system SHALL deliver reminder notifications through browser-compatible Web Notification
channels and installed PWA notification channels when permission is granted.

#### Scenario: Permission granted enables system reminders
- **WHEN** a signed-in user has reminders enabled and notification permission is `granted`
- **THEN** the system sends reminder notifications through the browser/PWA notification channel

#### Scenario: Permission denied blocks system reminders
- **WHEN** notification permission is `denied`
- **THEN** the system MUST NOT send system reminder notifications

### Requirement: Near-closing missed-prayer reminder
The system SHALL send a prayer reminder when prayer time is near closing and the related prayer
is still unchecked for the current day.

#### Scenario: Send reminder in near-close window
- **WHEN** remaining time to prayer close is 20 minutes or less and the prayer is unchecked
- **THEN** the system sends one missed-prayer reminder notification for that prayer/day

#### Scenario: Do not remind completed prayer
- **WHEN** the prayer is already marked complete for the current day
- **THEN** the system MUST NOT send a missed-prayer reminder for that prayer/day

#### Scenario: Prevent duplicate prayer reminders
- **WHEN** a missed-prayer reminder has already been sent for the same user, prayer, and day
- **THEN** the system MUST NOT send a second missed-prayer reminder for that same prayer/day

### Requirement: Independent random deed-tip reminders
The system SHALL schedule and send exactly 3 good-deed suggestion reminders per day at independent
time windows (morning, evening, and night), independent from missed-prayer reminders.

#### Scenario: Schedule random deed-tip reminders
- **WHEN** deed-tip reminders are enabled and notification permission is `granted`
- **THEN** the system schedules 3 deed-tip reminders for the day with randomized minute offsets within morning, evening, and night windows

#### Scenario: Deed-tip reminders remain independent of prayer reminders
- **WHEN** both missed-prayer and deed-tip reminder conditions are true on the same day
- **THEN** the system remains eligible to send both reminder types

#### Scenario: Disabled deed tips suppress random reminders
- **WHEN** deed-tip reminders are disabled in settings
- **THEN** the system MUST NOT schedule or send random deed-tip reminder notifications

### Requirement: Reminder settings and language compliance
The system SHALL honor notification settings and use localized reminder content.

#### Scenario: Daily reminder setting controls prayer reminders
- **WHEN** daily reminders are disabled in settings
- **THEN** the system MUST NOT send missed-prayer reminder notifications

#### Scenario: Prayer reminders default to off for new users
- **WHEN** a new user has no saved notification settings
- **THEN** the system initializes `dailyReminder` as disabled

#### Scenario: Reminder content follows selected language
- **WHEN** a reminder notification is generated
- **THEN** the title and body of the reminder use the user’s active application language

### Requirement: Test notification parity
The system SHALL use the same system-notification delivery path for test notifications and production reminders.

#### Scenario: Test notification uses production delivery pipeline
- **WHEN** the user triggers a test reminder from settings
- **THEN** the system sends it through the same browser/PWA notification delivery path used by scheduled reminders
