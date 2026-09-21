/**
 * helpers.js - Common helper utilities for Codeforces Progress Tracker.
 * Pure Vanilla JS, zero dependencies.
 */

(function (root) {
  'use strict';

  const CFT_Helpers = {
    /**
     * Formats duration in seconds to stopwatch format: "MM:SS" or "HH:MM:SS"
     * @param {number} totalSeconds
     * @returns {string}
     */
    formatDurationHMS(totalSeconds) {
      if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) {
        return '00:00';
      }
      const s = Math.floor(totalSeconds);
      const hours = Math.floor(s / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const seconds = s % 60;

      const pad = (n) => String(n).padStart(2, '0');

      if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
      }
      return `${pad(minutes)}:${pad(seconds)}`;
    },

    /**
     * Formats duration in seconds to descriptive format: "1h 24m" or "18m 42s" or "35s"
     * @param {number} totalSeconds
     * @returns {string}
     */
    formatDuration(totalSeconds) {
      if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) {
        return '0s';
      }
      const s = Math.floor(totalSeconds);
      const hours = Math.floor(s / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const seconds = s % 60;

      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      if (minutes > 0) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
      }
      return `${seconds}s`;
    },

    /**
     * Formats a timestamp into a clean readable date: "Sep 21, 2026"
     * @param {number|string|Date} timestamp
     * @returns {string}
     */
    formatDate(timestamp) {
      if (!timestamp) return 'Never';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    /**
     * Formats a timestamp into a relative time: "2m ago", "3h ago", "Yesterday", etc.
     * @param {number|string|Date} timestamp
     * @returns {string}
     */
    formatRelativeTime(timestamp) {
      if (!timestamp) return 'Never';
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (isNaN(diffMs)) return 'Unknown';

      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 45) return 'Just now';
      if (diffSec < 90) return '1m ago';

      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;

      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return this.formatDate(timestamp);
    },

    /**
     * Codeforces Rating tier color mapping
     * @param {number|null} rating
     * @returns {string} Hex color
     */
    getRatingColor(rating) {
      if (rating === null || rating === undefined || isNaN(rating)) {
        return '#94a3b8'; // Slate for unrated
      }
      const r = Number(rating);
      if (r < 1200) return '#9ca3af'; // Gray - Newbie
      if (r < 1400) return '#22c55e'; // Green - Pupil
      if (r < 1600) return '#06b6d4'; // Cyan - Specialist
      if (r < 1900) return '#3b82f6'; // Blue - Expert
      if (r < 2100) return '#a855f7'; // Purple - Candidate Master
      if (r < 2400) return '#f97316'; // Orange - Master
      return '#ef4444'; // Red - Grandmaster / Legendary
    },

    /**
     * Codeforces Rank name by rating
     * @param {number|null} rating
     * @returns {string} Rank title
     */
    getRatingRankTitle(rating) {
      if (rating === null || rating === undefined || isNaN(rating)) {
        return 'Unrated';
      }
      const r = Number(rating);
      if (r < 1200) return 'Newbie';
      if (r < 1400) return 'Pupil';
      if (r < 1600) return 'Specialist';
      if (r < 1900) return 'Expert';
      if (r < 2100) return 'Candidate Master';
      if (r < 2300) return 'Master';
      if (r < 2400) return 'International Master';
      if (r < 2600) return 'Grandmaster';
      if (r < 3000) return 'International Grandmaster';
      return 'Legendary Grandmaster';
    },

    /**
     * Calculates the daily streak from problem sessions and activity.
     * A day counts if there was solved activity or meaningful time (> 30s) spent.
     * @param {Array<Object>} problems
     * @returns {number} consecutive active days
     */
    calculateStreak(problems) {
      if (!Array.isArray(problems) || problems.length === 0) {
        return 0;
      }

      // Collect all active calendar days in 'YYYY-MM-DD'
      const activeDays = new Set();

      problems.forEach((p) => {
        // Count from problem visits/solves
        if (p.lastVisited && (p.status === 'solved' || p.status === 'attempted' || (p.totalTimeSpent && p.totalTimeSpent >= 30))) {
          const d = new Date(p.lastVisited);
          if (!isNaN(d.getTime())) {
            activeDays.add(d.toISOString().slice(0, 10));
          }
        }

        // Count from individual sessions if available
        if (Array.isArray(p.sessions)) {
          p.sessions.forEach((s) => {
            if (s.startedAt && s.duration && s.duration >= 30) {
              const d = new Date(s.startedAt);
              if (!isNaN(d.getTime())) {
                activeDays.add(d.toISOString().slice(0, 10));
              }
            }
          });
        }
      });

      if (activeDays.size === 0) return 0;

      // Check consecutive days starting today or yesterday
      const toDateStr = (date) => date.toISOString().slice(0, 10);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let checkDate = new Date(today);
      const todayStr = toDateStr(today);
      const yesterdayStr = toDateStr(yesterday);

      // If today is not active yet, but yesterday was, streak can continue from yesterday
      if (!activeDays.has(todayStr)) {
        if (!activeDays.has(yesterdayStr)) {
          return 0;
        }
        checkDate = yesterday;
      }

      let streak = 0;
      while (true) {
        const dateStr = toDateStr(checkDate);
        if (activeDays.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    },

    /**
     * Safe HTML escaping
     * @param {string} str
     * @returns {string}
     */
    escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // Export for browser scripts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CFT_Helpers;
  } else {
    root.CFT_Helpers = CFT_Helpers;
  }
})(typeof self !== 'undefined' ? self : this);
