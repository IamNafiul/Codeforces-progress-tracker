/**
 * popup.js - Popup logic for Codeforces Progress Tracker.
 * Manages active problem view, live stopwatch tick, status and notes updates,
 * and navigation.
 * Pure Vanilla JS, zero dependencies.
 */

(function () {
  'use strict';

  const Helpers = window.CFT_Helpers;
  const Codeforces = window.CFT_Codeforces;
  const Storage = window.CFT_Storage;

  // UI Elements
  const stateProblem = document.getElementById('state-problem');
  const stateNoProblem = document.getElementById('state-no-problem');

  const probTitle = document.getElementById('prob-title');
  const probRatingBadge = document.getElementById('prob-rating-badge');
  const probContestBadge = document.getElementById('prob-contest-badge');
  const probSubmissionsBadge = document.getElementById('prob-submissions-badge');

  const timerDisplay = document.getElementById('timer-display');
  const trackingStatusPill = document.getElementById('tracking-status-pill');
  const trackingStatusText = document.getElementById('tracking-status-text');

  const statusBtns = document.querySelectorAll('.status-btn');
  const selectFailureReason = document.getElementById('select-failure-reason');
  const inputPersonalNote = document.getElementById('input-personal-note');
  const btnSaveNotes = document.getElementById('btn-save-notes');
  const noteSavedMsg = document.getElementById('note-saved-msg');

  const btnOpenDashboard = document.getElementById('btn-open-dashboard');
  const btnHeaderDashboard = document.getElementById('btn-header-dashboard');
  const btnEmptyDashboard = document.getElementById('btn-empty-dashboard');
  const btnOpenCodeforces = document.getElementById('btn-open-codeforces');

  const emptyTitle = document.getElementById('empty-title');
  const emptyDesc = document.getElementById('empty-desc');

  let currentProblem = null;
  let currentDisplaySeconds = 0;
  let liveTickInterval = null;
  let isTrackingLive = false;

  /**
   * Initializes popup state
   */
  async function initPopup() {
    setupGlobalNavigation();

    // Query currently active tab
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
      showNoProblemState('Offline Mode', 'Extension APIs are not accessible in this environment.');
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs && tabs[0];
      if (!activeTab || !activeTab.url) {
        showNoProblemState('No active tab detected', 'Open a problem on Codeforces to start tracking.');
        return;
      }

      const problemInfo = Codeforces.extractProblemFromUrl(activeTab.url);

      if (!problemInfo) {
        // Check if user is on Codeforces but not a problem page
        if (activeTab.url.includes('codeforces.com')) {
          showNoProblemState(
            'On Codeforces',
            'You are on Codeforces. Open any problem to start tracking time and progress automatically.',
            'Browse Problemset'
          );
        } else {
          showNoProblemState(
            'No Codeforces problem detected.',
            'Open a problem on Codeforces to start tracking your time and progress automatically.',
            'Open Codeforces'
          );
        }
        return;
      }

      // We are on a problem page!
      await loadProblemView(activeTab, problemInfo);
    });
  }

  /**
   * Loads problem details and connects to content script or local storage
   */
  async function loadProblemView(tab, problemInfo) {
    // 1. Try to fetch from storage first
    let record = await Storage.getProblem(problemInfo.problemId);

    // If record doesn't exist yet, create default
    if (!record) {
      record = await Storage.getOrCreateProblem(problemInfo);
    }
    currentProblem = record;

    // 2. Query content script for real-time live timer status
    let contentResponse = null;
    try {
      contentResponse = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'GET_CURRENT_PROBLEM' }, (response) => {
          if (chrome.runtime.lastError) {
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });
    } catch (e) {
      contentResponse = null;
    }

    if (contentResponse && contentResponse.problem) {
      currentProblem = contentResponse.problem;
      isTrackingLive = Boolean(contentResponse.isTrackingActive);
      currentDisplaySeconds = contentResponse.liveSessionSeconds || currentProblem.totalTimeSpent || 0;
    } else {
      isTrackingLive = false;
      currentDisplaySeconds = currentProblem.totalTimeSpent || 0;
    }

    // Render problem UI
    renderProblemDetails();

    // Start live stopwatch interval if tracking is active
    startLiveTick();

    // Show problem state
    stateNoProblem.classList.add('hidden');
    stateProblem.classList.remove('hidden');
  }

  /**
   * Updates problem DOM elements
   */
  function renderProblemDetails() {
    if (!currentProblem) return;

    // Title
    const displayName = currentProblem.name || `Problem ${currentProblem.problemIndex}`;
    probTitle.textContent = `${currentProblem.problemIndex ? currentProblem.problemIndex + '. ' : ''}${displayName}`;

    // Rating Badge
    if (currentProblem.rating !== null && currentProblem.rating !== undefined) {
      probRatingBadge.textContent = `${currentProblem.rating} Rating`;
      probRatingBadge.style.backgroundColor = Helpers.getRatingColor(currentProblem.rating);
      probRatingBadge.style.color = '#fff';
      probRatingBadge.classList.remove('hidden');
    } else {
      probRatingBadge.textContent = 'Unrated';
      probRatingBadge.style.backgroundColor = 'var(--bg-surface)';
      probRatingBadge.style.color = 'var(--text-secondary)';
      probRatingBadge.classList.remove('hidden');
    }

    // Contest Badge
    if (currentProblem.contestId) {
      probContestBadge.textContent = `Contest ${currentProblem.contestId}`;
      probContestBadge.classList.remove('hidden');
    } else {
      probContestBadge.classList.add('hidden');
    }

    // Submissions Badge
    const subs = currentProblem.submissionCount || 0;
    probSubmissionsBadge.textContent = `${subs} ${subs === 1 ? 'Attempt' : 'Attempts'}`;

    // Timer display
    timerDisplay.textContent = Helpers.formatDurationHMS(currentDisplaySeconds);

    // Tracking status indicator
    updateStatusPill(isTrackingLive);

    // Status Buttons (Visiting, Attempted, Solved)
    const currentStatus = currentProblem.status || 'visiting';
    statusBtns.forEach((btn) => {
      if (btn.dataset.status === currentStatus) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Notes and Failure Reason
    selectFailureReason.value = currentProblem.failureReason || '';
    inputPersonalNote.value = currentProblem.personalNote || '';

    // Bind event listeners for actions
    bindProblemActionListeners();
  }

  /**
   * Status indicator update
   */
  function updateStatusPill(isActive) {
    if (isActive) {
      trackingStatusPill.className = 'status-pill status-active';
      trackingStatusText.textContent = 'Tracking';
    } else {
      trackingStatusPill.className = 'status-pill status-paused';
      trackingStatusText.textContent = 'Paused';
    }
  }

  /**
   * Starts live 1-second interval tick in popup
   */
  function startLiveTick() {
    if (liveTickInterval) clearInterval(liveTickInterval);

    liveTickInterval = setInterval(() => {
      if (isTrackingLive) {
        currentDisplaySeconds += 1;
        timerDisplay.textContent = Helpers.formatDurationHMS(currentDisplaySeconds);
      }
    }, 1000);
  }

  /**
   * Event listeners for status buttons and notes saving
   */
  function bindProblemActionListeners() {
    // Status button click
    statusBtns.forEach((btn) => {
      btn.onclick = async () => {
        const newStatus = btn.dataset.status;
        statusBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Automatically set verdict if Solved
        const verdict = newStatus === 'solved' ? 'OK' : null;

        await Storage.updateProblemStatus(currentProblem.problemId, newStatus, verdict);
        currentProblem.status = newStatus;
        currentProblem.verdict = verdict;

        // Broadcast to tab content script if active
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'UPDATE_PROBLEM_DATA',
              data: { status: newStatus, verdict }
            }).catch(() => {});
          }
        });
      };
    });

    // Save Notes & Failure Reason button
    btnSaveNotes.onclick = async () => {
      const personalNote = inputPersonalNote.value.trim();
      const failureReason = selectFailureReason.value || null;

      await Storage.updateProblemNotes(currentProblem.problemId, personalNote, failureReason);
      currentProblem.personalNote = personalNote;
      currentProblem.failureReason = failureReason;

      // Show temporary save message
      noteSavedMsg.classList.add('show');
      setTimeout(() => {
        noteSavedMsg.classList.remove('show');
      }, 1800);

      // Broadcast to tab content script if active
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'UPDATE_PROBLEM_DATA',
            data: { personalNote, failureReason }
          }).catch(() => {});
        }
      });
    };
  }

  /**
   * Empty / non-problem state handler
   */
  function showNoProblemState(title, desc, btnText = 'Open Codeforces') {
    if (liveTickInterval) clearInterval(liveTickInterval);

    stateProblem.classList.add('hidden');
    stateNoProblem.classList.remove('hidden');

    emptyTitle.textContent = title;
    emptyDesc.textContent = desc;
    btnOpenCodeforces.textContent = btnText;
  }

  /**
   * Navigation listeners
   */
  function setupGlobalNavigation() {
    const openDashboard = () => {
      const dashboardUrl = chrome.runtime.getURL('src/dashboard/dashboard.html');
      chrome.tabs.create({ url: dashboardUrl });
    };

    btnOpenDashboard.addEventListener('click', openDashboard);
    btnHeaderDashboard.addEventListener('click', openDashboard);
    btnEmptyDashboard.addEventListener('click', openDashboard);

    btnOpenCodeforces.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://codeforces.com/problemset' });
    });
  }

  // Run popup initialization on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initPopup);
})();
