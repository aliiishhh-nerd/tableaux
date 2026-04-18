// src/lib/analytics.js
// PostHog analytics integration for TableFolk
// Install: npm install posthog-js
// Add REACT_APP_POSTHOG_KEY to Netlify env vars

import posthog from 'posthog-js';

export const initAnalytics = () => {
  posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    capture_pageview: true,
    autocapture: true,
  });
};

// ============================================================
// IDENTITY
// ============================================================

export const identifyUser = (userId, properties = {}) => {
  posthog.identify(userId, properties);
};

export const resetUser = () => {
  posthog.reset();
};

// ============================================================
// DISCOVERY → RSVP FUNNEL
// Step 1: User views the Discover / feed page
// Step 2: User opens an event detail
// Step 3: User taps "Request to Join"
// Step 4: RSVP submitted
// ============================================================

export const trackDiscoverView = () => {
  posthog.capture('discover_viewed');
};

export const trackEventCardClick = (eventId, eventType) => {
  posthog.capture('event_card_clicked', { event_id: eventId, event_type: eventType });
};

export const trackRsvpStarted = (eventId, eventType) => {
  posthog.capture('rsvp_started', { event_id: eventId, event_type: eventType });
};

export const trackRsvpSubmitted = (eventId, eventType, hasMessage) => {
  posthog.capture('rsvp_submitted', {
    event_id: eventId,
    event_type: eventType,
    included_message: hasMessage,
  });
};

// ============================================================
// EVENT CREATION FUNNEL
// Step 1: Host opens CreateEventModal
// Step 2: Host selects event type
// Step 3: Host completes all required fields
// Step 4: Event published
// ============================================================

export const trackCreateEventOpened = () => {
  posthog.capture('create_event_opened');
};

export const trackEventTypeSelected = (eventType) => {
  posthog.capture('event_type_selected', { event_type: eventType });
};

export const trackEventDraftCompleted = (eventType) => {
  posthog.capture('event_draft_completed', { event_type: eventType });
};

export const trackEventPublished = (eventId, eventType, isTicketed) => {
  posthog.capture('event_published', {
    event_id: eventId,
    event_type: eventType,
    is_ticketed: isTicketed,
  });
};

// ============================================================
// POST-EVENT ENGAGEMENT FUNNEL
// Step 1: Event status set to "completed"
// Step 2: Host views post-event summary
// Step 3: Moment (photo) added
// Step 4: Host sends thank-you or follow-up
// ============================================================

export const trackEventCompleted = (eventId, attendeeCount) => {
  posthog.capture('event_completed', { event_id: eventId, attendee_count: attendeeCount });
};

export const trackPostEventSummaryViewed = (eventId) => {
  posthog.capture('post_event_summary_viewed', { event_id: eventId });
};

export const trackMomentAdded = (eventId) => {
  posthog.capture('moment_added', { event_id: eventId });
};

// ============================================================
// PROFILE & RETENTION FUNNEL
// ============================================================

export const trackProfileViewed = (profileId, isSelf) => {
  posthog.capture('profile_viewed', { profile_id: profileId, is_self: isSelf });
};

export const trackPassportViewed = (stampCount) => {
  posthog.capture('passport_viewed', { stamp_count: stampCount });
};

export const trackAppInstalled = () => {
  posthog.capture('pwa_installed');
};

// ============================================================
// POSTHOG DASHBOARD — Funnel Definitions
// After wiring up the events above, build these funnels in PostHog:
//
// 1. Discovery → RSVP
//    discover_viewed → event_card_clicked → rsvp_started → rsvp_submitted
//
// 2. Event Creation
//    create_event_opened → event_type_selected → event_draft_completed → event_published
//
// 3. Post-Event Engagement
//    event_completed → post_event_summary_viewed → moment_added
//
// 4. Retention (use Retention chart, not Funnel)
//    Retention event: rsvp_submitted  (did they RSVP to another event 7 days later?)
// ============================================================
