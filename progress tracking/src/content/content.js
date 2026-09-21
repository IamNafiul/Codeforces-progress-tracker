/**
 * content.js - Content script for Codeforces problem pages.
 * Runs on codeforces.com problem URLs.
 * Handles problem detection, active tab-focused time tracking, submission detection,
 * and popup messaging.
 * Pure Vanilla JS, zero dependencies.
 */

(function () {
  'use strict';

  // Ensure required utilities are loaded
  const Codeforces = window.CFT_Codeforces;
  const Storage = window.CFT_Storage;

  if (!Codeforces || !Storage) {
    console.warn('[CFT] Codeforces Progress Tracker dependencies not available.');
    return;
  }

  // Check if current page is a problem page
  const problemMeta = Codeforces.extractFullProblemDetails(window.location.href, document);
  if (!problemMeta || !problemMeta.problemId) {
    // Not a problem page; exit quietly
    return;
  }

  // Unique session identifier for this specific tab instance
  const tabSessionId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

  let activeProblem = null;
  let isTrackingActive = false;
  let sessionStartTime = null;
  let uncommittedSeconds = 0;
  let heartbeatTimer = null;

  /**
   * Initializes problem in storage and begins tracking session
   */
  async function initializeTracker() {
    try {
      activeProblem = await Storage.getOrCreateProblem(problemMeta);

      // Listen for window/tab focus and visibility events
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('pagehide', handlePageUnload);
      window.addEventListener('beforeunload', handlePageUnload);

      // Check initial state
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        startTrackingSession();
      }

      // Listen for Codeforces problem submissions
      setupSubmissionDetection();

      // Listen for runtime messages from Popup
      setupMessageListener();

      console.log(`[CFT] Tracking Codeforces Problem: ${activeProblem.problemId} (${activeProblem.name})`);
    } catch (err) {
      console.error('[CFT] Failed to initialize problem tracker:', err);
    }
  }

  /**
   * Starts active timing session when tab is visible and focused
   */
  function startTrackingSession() {
    if (isTrackingActive) return;

    isTrackingActive = true;
    sessionStartTime = Date.now();

    // Heartbeat every 5 seconds to commit progress safely to storage
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(flushAccumulatedTime, 5000);
  }

  /**
   * Pauses active timing session when tab is hidden or blurred
   */
  function pauseTrackingSession() {
    if (!isTrackingActive) return;

    isTrackingActive = false;
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    flushAccumulatedTime();
  }

  /**
   * Commits accumulated session time delta to local storage
   */
  async function flushAccumulatedTime() {
    if (!activeProblem || !sessionStartTime) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - sessionStartTime) / 1000);

    if (elapsedSeconds > 0) {
      sessionStartTime = now;
      uncommittedSeconds += elapsedSeconds;

      try {
        const updated = await Storage.recordSessionTime(activeProblem.problemId, elapsedSeconds, {
          startedAt: now - elapsedSeconds * 1000,
          endedAt: now
        });
        if (updated) {
          activeProblem = updated;
        }
        uncommittedSeconds = 0;
      } catch (err) {
        console.warn('[CFT] Error saving session time:', err);
      }
    }
  }

  /**
   * Tab visibility and focus handlers
   */
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      startTrackingSession();
    } else {
      pauseTrackingSession();
    }
  }

  function handleFocus() {
    if (document.visibilityState === 'visible') {
      startTrackingSession();
    }
  }

  function handleBlur() {
    pauseTrackingSession();
  }

  function handlePageUnload() {
    pauseTrackingSession();
  }

  /**
   * Detects submission attempts made from the problem page
   */
  function setupSubmissionDetection() {
    // Problem submission form on Codeforces
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      const action = form.getAttribute('action') || '';
      // Codeforces submit actions usually match /problemset/submit or /contest/.../submit
      if (/submit/i.test(action) || form.classList.contains('submit-form') || form.id === 'submitForm') {
        form.addEventListener('submit', async () => {
          try {
            console.log('[CFT] Submission detected for problem:', activeProblem.problemId);
            const updated = await Storage.recordSubmissionAttempt(activeProblem.problemId);
            if (updated) {
              activeProblem = updated;
            }
          } catch (e) {
            console.warn('[CFT] Failed to record submission attempt:', e);
          }
        });
      }
    });

    // Also listen to click on buttons with submit text/value
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (
        target &&
        (target.matches('input[type="submit"][value*="Submit"]') ||
          target.matches('button[type="submit"]') ||
          target.closest('.submit-button'))
      ) {
        // If it belongs to a submission form
        const parentForm = target.closest('form');
        if (parentForm && /submit/i.test(parentForm.getAttribute('action') || '')) {
          Storage.recordSubmissionAttempt(activeProblem.problemId)
            .then((updated) => {
              if (updated) activeProblem = updated;
            })
            .catch(() => {});
        }
      }
    });
  }

  /**
   * Responds to queries from popup
   */
  function setupMessageListener() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
      return;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (!request || !request.action) return false;

      if (request.action === 'GET_CURRENT_PROBLEM') {
        // Calculate live real-time total including currently ticking seconds
        const liveExtra = isTrackingActive && sessionStartTime
          ? Math.floor((Date.now() - sessionStartTime) / 1000)
          : 0;

        sendResponse({
          success: true,
          problem: activeProblem,
          isTrackingActive,
          liveSessionSeconds: (activeProblem ? activeProblem.totalTimeSpent : 0) + liveExtra,
          currentSessionDelta: liveExtra
        });
        return true;
      }

      if (request.action === 'UPDATE_PROBLEM_DATA') {
        const { status, verdict, personalNote, failureReason } = request.data || {};
        (async () => {
          try {
            if (status !== undefined || verdict !== undefined) {
              await Storage.updateProblemStatus(activeProblem.problemId, status, verdict);
            }
            if (personalNote !== undefined || failureReason !== undefined) {
              await Storage.updateProblemNotes(activeProblem.problemId, personalNote, failureReason);
            }
            activeProblem = await Storage.getProblem(activeProblem.problemId);
            sendResponse({ success: true, problem: activeProblem });
          } catch (e) {
            sendResponse({ success: false, error: e.message });
          }
        })();
        return true; // asynchronous response
      }

      return false;
    });
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTracker);
  } else {
    initializeTracker();
  }
})();
