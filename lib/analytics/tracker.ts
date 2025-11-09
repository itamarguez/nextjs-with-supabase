// Analytics Tracker - Client-side tracking utility
// Tracks page views, sessions, and conversion events

'use client';

import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'nomorefomo_analytics_session';
const SESSION_START_KEY = 'nomorefomo_session_start';
const LAST_PAGE_VIEW_KEY = 'nomorefomo_last_page_view';

// Get or create session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${uuidv4()}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());
  }

  return sessionId;
}

// Get session duration
export function getSessionDuration(): number {
  if (typeof window === 'undefined') return 0;

  const startTime = localStorage.getItem(SESSION_START_KEY);
  if (!startTime) return 0;

  return Date.now() - parseInt(startTime, 10);
}

// Track page view
export async function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const lastPageView = localStorage.getItem(LAST_PAGE_VIEW_KEY);

  let timeOnPage: number | undefined;
  if (lastPageView) {
    const lastPageData = JSON.parse(lastPageView);
    timeOnPage = Date.now() - lastPageData.timestamp;
  }

  try {
    await fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        pagePath,
        pageTitle: pageTitle || document.title,
        referrer: document.referrer,
        isFirstVisit: !lastPageView,
        timeOnPreviousPage: timeOnPage,
      }),
    });

    // Store current page view for next calculation
    localStorage.setItem(
      LAST_PAGE_VIEW_KEY,
      JSON.stringify({
        path: pagePath,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

// Track conversion event
export async function trackEvent(
  eventName: string,
  eventCategory: string,
  metadata?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventName,
        eventCategory,
        pagePath: window.location.pathname,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Track outbound link click
export async function trackOutboundClick(linkUrl: string, linkText?: string) {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();

  try {
    await fetch('/api/analytics/outbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        linkUrl,
        linkText,
        pagePath: window.location.pathname,
      }),
    });
  } catch (error) {
    console.error('Failed to track outbound click:', error);
  }
}

// End session (call on tab close or significant inactivity)
export async function endSession() {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const duration = getSessionDuration();
  const lastPageView = localStorage.getItem(LAST_PAGE_VIEW_KEY);

  try {
    await fetch('/api/analytics/session-end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        duration,
        exitPage: lastPageView ? JSON.parse(lastPageView).path : window.location.pathname,
      }),
    });
  } catch (error) {
    console.error('Failed to end session:', error);
  }
}

// Convenience functions for common events
export const Analytics = {
  // Trial chat events
  trialStarted: () => trackEvent('trial_started', 'trial'),
  trialMessageSent: (messageNumber: number) =>
    trackEvent('trial_message_sent', 'trial', { messageNumber }),
  trialLimitReached: () => trackEvent('trial_limit_reached', 'trial'),

  // Signup events
  signupClicked: (source: string) =>
    trackEvent('signup_clicked', 'signup', { source }),
  signupCompleted: () => trackEvent('signup_completed', 'conversion'),

  // Engagement events
  firstMessageSent: () => trackEvent('first_message_sent', 'engagement'),
  conversationStarted: () => trackEvent('conversation_started', 'engagement'),

  // Navigation events
  pageView: trackPageView,
  outboundClick: trackOutboundClick,
};
