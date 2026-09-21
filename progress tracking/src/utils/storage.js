/**
 * storage.js - Privacy-first local storage manager for Codeforces Progress Tracker.
 * Stores all data strictly in chrome.storage.local (no remote calls, no telemetry).
 * Pure Vanilla JS, zero dependencies.
 */

(function (root) {
  'use strict';

  const STORAGE_KEYS = {
    PROBLEMS: 'cf_problems',
    ACTIVE_SESSION: 'cf_active_session',
    SETTINGS: 'cf_settings'
  };

  /**
   * Safe wrapper for Chrome Local Storage API with fallback
   */
  const storageDriver = {
    async get(key) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get([key], (result) => {
            resolve(result ? result[key] : undefined);
          });
        });
      }
      // LocalStorage fallback for non-extension context or unit tests
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : undefined;
      } catch (e) {
        return undefined;
      }
    },

    async set(key, value) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, resolve);
        });
      }
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('[CFT] Storage write error:', e);
      }
    },

    async remove(key) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.remove([key], resolve);
        });
      }
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  };

  const CFT_Storage = {
    /**
     * Initializes default problem structure
     * @param {Object} meta
     * @returns {Object}
     */
    createDefaultProblem(meta) {
      const now = Date.now();
      return {
        problemId: meta.problemId,
        contestId: meta.contestId || null,
        problemIndex: meta.problemIndex || '',
        name: meta.name || `Problem ${meta.problemIndex || ''}`,
        rating: typeof meta.rating === 'number' ? meta.rating : null,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        url: meta.url || '',
        firstVisited: now,
        lastVisited: now,
        totalTimeSpent: 0, // In seconds
        visitCount: 1,
        submissionCount: 0,
        status: 'visiting', // 'visiting' | 'attempted' | 'solved'
        verdict: null,      // 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | etc.
        personalNote: '',
        failureReason: null,
        sessions: []        // [{ startedAt, endedAt, duration }]
      };
    },

    /**
     * Gets all problems as an array, sorted by lastVisited descending
     * @returns {Promise<Array<Object>>}
     */
    async getAllProblems() {
      const problemsMap = (await storageDriver.get(STORAGE_KEYS.PROBLEMS)) || {};
      const list = Object.values(problemsMap);
      list.sort((a, b) => (b.lastVisited || 0) - (a.lastVisited || 0));
      return list;
    },

    /**
     * Gets problems indexed map { [problemId]: problem }
     * @returns {Promise<Object>}
     */
    async getProblemsMap() {
      return (await storageDriver.get(STORAGE_KEYS.PROBLEMS)) || {};
    },

    /**
     * Retrieves single problem by ID
     * @param {string} problemId
     * @returns {Promise<Object|null>}
     */
    async getProblem(problemId) {
      if (!problemId) return null;
      const map = await this.getProblemsMap();
      return map[problemId] || null;
    },

    /**
     * Saves or updates a problem record in storage
     * @param {Object} problem
     * @returns {Promise<Object>}
     */
    async saveProblem(problem) {
      if (!problem || !problem.problemId) return null;
      const map = await this.getProblemsMap();
      map[problem.problemId] = problem;
      await storageDriver.set(STORAGE_KEYS.PROBLEMS, map);
      return problem;
    },

    /**
     * Finds existing problem or creates a new one, updating metadata and visit count
     * @param {Object} meta
     * @returns {Promise<Object>}
     */
    async getOrCreateProblem(meta) {
      if (!meta || !meta.problemId) return null;
      const map = await this.getProblemsMap();
      let record = map[meta.problemId];
      const now = Date.now();

      if (!record) {
        record = this.createDefaultProblem(meta);
      } else {
        record.visitCount = (record.visitCount || 0) + 1;
        record.lastVisited = now;

        // Fill in missing details if newly extracted
        if ((!record.name || record.name.startsWith('Problem ')) && meta.name) {
          record.name = meta.name;
        }
        if (record.rating === null && typeof meta.rating === 'number') {
          record.rating = meta.rating;
        }
        if ((!record.tags || record.tags.length === 0) && Array.isArray(meta.tags) && meta.tags.length > 0) {
          record.tags = meta.tags;
        }
        if (!record.url && meta.url) {
          record.url = meta.url;
        }
      }

      map[meta.problemId] = record;
      await storageDriver.set(STORAGE_KEYS.PROBLEMS, map);
      return record;
    },

    /**
     * Adds duration to problem time and records session entry
     * @param {string} problemId
     * @param {number} durationSeconds
     * @param {Object} [sessionInfo]
     * @returns {Promise<Object|null>}
     */
    async recordSessionTime(problemId, durationSeconds, sessionInfo = {}) {
      if (!problemId || !durationSeconds || durationSeconds <= 0) return null;
      const map = await this.getProblemsMap();
      const record = map[problemId];
      if (!record) return null;

      record.totalTimeSpent = (record.totalTimeSpent || 0) + Math.floor(durationSeconds);
      record.lastVisited = Date.now();

      if (!Array.isArray(record.sessions)) {
        record.sessions = [];
      }

      // Add session history (retain max 50 recent sessions to preserve storage space)
      record.sessions.push({
        startedAt: sessionInfo.startedAt || (Date.now() - durationSeconds * 1000),
        endedAt: sessionInfo.endedAt || Date.now(),
        duration: Math.floor(durationSeconds)
      });

      if (record.sessions.length > 50) {
        record.sessions = record.sessions.slice(-50);
      }

      map[problemId] = record;
      await storageDriver.set(STORAGE_KEYS.PROBLEMS, map);
      return record;
    },

    /**
     * Updates problem status and optional verdict
     * @param {string} problemId
     * @param {'visiting'|'attempted'|'solved'} status
     * @param {string|null} [verdict=null]
     * @returns {Promise<Object|null>}
     */
    async updateProblemStatus(problemId, status, verdict = null) {
      const map = await this.getProblemsMap();
      const record = map[problemId];
      if (!record) return null;

      record.status = status;
      if (verdict !== undefined) {
        record.verdict = verdict;
      }
      record.lastVisited = Date.now();

      map[problemId] = record;
      await storageDriver.set(STORAGE_KEYS.PROBLEMS, map);
      return record;
    },

    /**
     * Updates problem notes and failure reason
     * @param {string} problemId
     * @param {string} personalNote
     * @param {string|null} failureReason
     * @returns {Promise<Object|null>}
     */
    async updateProblemNotes(problemId, personalNote, failureReason) {
      const map = await this.getProblemsMap();
      const record = map[problemId];
      if (!record) return null;

      if (personalNote !== undefined) {
        record.personalNote = personalNote;
      }
      if (failureReason !== undefined) {
        record.failureReason = failureReason;
      }
      record.lastVisited = Date.now();

      map[problemId] = record;
      await storageDriver.set(STORAGE_KEYS.PROBLEMS, map);
      return record;
    },

    /**
     * Records a submission attempt
     * @param {string} problemId
     * @returns {Promise<Object|null>}
     */
    async recordSubmissionAttempt(problemId) {
      const map = await this.getProblemsMap();
      const record = map[problemId];
      if (!record) return null;

      record.submissionCount = (record.submissionCount || 0) + 1;
      if (record.status === 'visiting') {
        record.status = 'attempted';
      }
      record.lastVisited = Date.now();

      map[problemId] = record;
      await storageDriver.set(STORAGE_KEYS.PROBLEMS, map);
      return record;
    },

    /**
     * Deletes a problem record
     * @param {string} problemId
     * @returns {Promise<boolean>}
     */
    async deleteProblem(problemId) {
      const map = await this.getProblemsMap();
      if (map[problemId]) {
        delete map[problemId];
        await storageDriver.set(STORAGE_KEYS.PROBLEMS, map);
        return true;
      }
      return false;
    },

    /**
     * Active tracking session coordination (cross-tab single-instance timer)
     */
    async getActiveSession() {
      return (await storageDriver.get(STORAGE_KEYS.ACTIVE_SESSION)) || null;
    },

    async setActiveSession(sessionData) {
      if (!sessionData) {
        await storageDriver.remove(STORAGE_KEYS.ACTIVE_SESSION);
      } else {
        await storageDriver.set(STORAGE_KEYS.ACTIVE_SESSION, sessionData);
      }
    },

    /**
     * Export all data as JSON string for backup / portability
     * @returns {Promise<string>}
     */
    async exportData() {
      const problems = await this.getProblemsMap();
      const exportPayload = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        problemsCount: Object.keys(problems).length,
        problems
      };
      return JSON.stringify(exportPayload, null, 2);
    },

    /**
     * Import JSON data and merge with existing records
     * @param {string|Object} rawData
     * @returns {Promise<{ success: boolean, importedCount: number, error?: string }>}
     */
    async importData(rawData) {
      try {
        const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        const incomingProblems = parsed.problems || parsed;

        if (!incomingProblems || typeof incomingProblems !== 'object') {
          return { success: false, importedCount: 0, error: 'Invalid file format: problems data missing.' };
        }

        const currentMap = await this.getProblemsMap();
        let importedCount = 0;

        for (const [id, problem] of Object.entries(incomingProblems)) {
          if (id && problem && typeof problem === 'object') {
            currentMap[id] = {
              ...(currentMap[id] || {}),
              ...problem
            };
            importedCount++;
          }
        }

        await storageDriver.set(STORAGE_KEYS.PROBLEMS, currentMap);
        return { success: true, importedCount };
      } catch (err) {
        return { success: false, importedCount: 0, error: err.message };
      }
    },

    /**
     * Completely clear all tracked problems
     * @returns {Promise<void>}
     */
    async clearAllData() {
      await storageDriver.remove(STORAGE_KEYS.PROBLEMS);
      await storageDriver.remove(STORAGE_KEYS.ACTIVE_SESSION);
    }
  };

  // Export for browser scripts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CFT_Storage;
  } else {
    root.CFT_Storage = CFT_Storage;
  }
})(typeof self !== 'undefined' ? self : this);
