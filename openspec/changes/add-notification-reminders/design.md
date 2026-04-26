## Context

The app currently uses in-app toast notifications via `NotificationProvider`, including
test reminders and frequent deed-tip toasts while users are actively in authenticated routes.
It does not yet provide browser/PWA system notifications for prayer-miss reminders or
independent deed-tip reminders. The requested change introduces reminder behavior that works
through web notification channels, with existing prayer/deed state and settings as inputs.

## Goals / Non-Goals

**Goals:**
- Deliver prayer-miss reminders when prayer time is near closing and the prayer remains unchecked.
- Deliver 3 good-deed tip notifications per day (morning/evening/night) independently of prayer reminders.
- Support browser and installed PWA notification delivery paths.
- Respect user settings, language, and per-day deduplication to avoid spam.

**Non-Goals:**
- Introducing backend push infrastructure (FCM/APNs) in this change.
- Redesigning prayer time calculation sources beyond consuming existing app data.
- Guaranteeing delivery when the app cannot run timers due to platform/browser limits.

## Decisions

1. **Use Web Notification API + Service Worker display path**
   - Implement notifications using browser Notification permission and service-worker-backed display.
   - **Why:** Aligns with web/PWA support and avoids backend dependency.
   - **Alternative considered:** Server push notifications; rejected for higher infrastructure complexity.

2. **Adopt client-side scheduling with deterministic rescheduling**
   - Run schedulers in app runtime; on startup and foreground resume, recompute and schedule upcoming events.
   - Persist schedule metadata and sent markers in local storage for continuity across reloads.
   - **Why:** Works with current client-only architecture.
   - **Alternative considered:** Periodic background sync; rejected due to limited cross-browser support.

3. **Prayer reminder trigger = near-close window + unchecked prayer**
   - Trigger when prayer remaining time is within a 20-minute near-close buffer, only if
     the prayer is not marked complete and daily reminders are enabled.
   - Store a per-user/day/prayer sent key to prevent duplicates.
   - Set `dailyReminder` default to `false` for new users.
   - **Why:** Matches requested “waqt near close + not checked” behavior.
   - **Alternative considered:** Fixed reminder at prayer start; rejected because it does not model missed-prayer risk.

4. **Deed-tip reminders are independent and fixed at 3 per day**
   - Generate three daily tip slots in morning, evening, and night windows (with random minute offsets inside each window).
   - Schedule and send regardless of prayer-reminder schedule; both reminder types may occur on the same day.
   - **Why:** User requested independent reminders with a practical cap of 3 tips/day.
   - **Alternative considered:** Trigger tips only when prayer reminders are absent; rejected as contradictory to request.

5. **Use existing settings model with explicit notification gating**
   - `notifications.dailyReminder` gates prayer reminders.
   - `notifications.deedTips` gates random tips.
   - Permission state gates system-notification delivery; if denied, no system reminder is sent.
   - **Why:** Reuses current settings UX and avoids introducing parallel toggles.

6. **Test notifications share the production delivery path**
   - Settings “test notification” actions invoke the same system-notification pipeline used by scheduled reminders.
   - **Why:** Ensures test behavior accurately validates real delivery behavior.
   - **Alternative considered:** Toast-only test notifications; rejected because they can pass while system delivery fails.

## Risks / Trade-offs

- **[Background timer throttling on mobile browsers]** → Recompute schedules on app open/foreground and
  deliver next eligible reminder immediately if still valid.
- **[Permission denied or unsupported Notification API]** → Show clear settings status and disable reminder scheduling.
- **[Duplicate reminders across refresh/reload]** → Use stable dedupe keys by user/date/prayer and per-tip slot ID.
- **[Prayer-time drift due to timezone or locale changes]** → Recompute prayer windows whenever timezone/location settings change.

## Migration Plan

1. Add notification scheduler and delivery utilities behind existing notification settings toggles.
2. Integrate prayer-state checks and dedupe key persistence.
3. Integrate randomized deed-tip scheduling and localization.
4. Add service worker delivery/click handling updates.
5. Ship with settings-gated behavior (`dailyReminder` default OFF for new users; `deedTips` follows user toggle) and monitor behavior.
6. Rollback path: disable scheduler initialization and keep existing toast-only behavior.
