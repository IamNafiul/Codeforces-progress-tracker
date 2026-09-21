/**
 * codeforces.js - Resilient parsing helpers for Codeforces problem pages.
 * Handles URL pattern matching, DOM extraction, and graceful fallbacks.
 * Pure Vanilla JS, zero dependencies.
 */

(function (root) {
  'use strict';

  const CFT_Codeforces = {
    /**
     * Extracts problem metadata from URL.
     * Supports Problemset, Contest, Gym, and Group URLs.
     * @param {string} urlStr
     * @returns {Object|null} { contestId, problemIndex, problemId, isGym, isGroup, url }
     */
    extractProblemFromUrl(urlStr) {
      if (!urlStr || typeof urlStr !== 'string') return null;

      try {
        const parsed = new URL(urlStr);
        const host = parsed.hostname.toLowerCase();
        // Allow codeforces.com, www.codeforces.com, mirror.codeforces.com
        if (!host.endsWith('codeforces.com')) {
          return null;
        }

        const path = parsed.pathname;

        // 1. Problemset: /problemset/problem/{contestId}/{index}
        const problemsetMatch = path.match(/^\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
        if (problemsetMatch) {
          const contestId = problemsetMatch[1];
          const problemIndex = problemsetMatch[2].toUpperCase();
          return {
            contestId,
            problemIndex,
            problemId: `${contestId}${problemIndex}`,
            isGym: false,
            isGroup: false,
            canonicalUrl: `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`
          };
        }

        // 2. Contest: /contest/{contestId}/problem/{index}
        const contestMatch = path.match(/^\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
        if (contestMatch) {
          const contestId = contestMatch[1];
          const problemIndex = contestMatch[2].toUpperCase();
          return {
            contestId,
            problemIndex,
            problemId: `${contestId}${problemIndex}`,
            isGym: false,
            isGroup: false,
            canonicalUrl: `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`
          };
        }

        // 3. Gym: /gym/{contestId}/problem/{index}
        const gymMatch = path.match(/^\/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
        if (gymMatch) {
          const contestId = gymMatch[1];
          const problemIndex = gymMatch[2].toUpperCase();
          return {
            contestId: `gym_${contestId}`,
            problemIndex,
            problemId: `gym_${contestId}${problemIndex}`,
            isGym: true,
            isGroup: false,
            canonicalUrl: `https://codeforces.com/gym/${contestId}/problem/${problemIndex}`
          };
        }

        // 4. Group contest: /group/{groupId}/contest/{contestId}/problem/{index}
        const groupMatch = path.match(/^\/group\/([^/]+)\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
        if (groupMatch) {
          const contestId = groupMatch[2];
          const problemIndex = groupMatch[3].toUpperCase();
          return {
            contestId,
            problemIndex,
            problemId: `grp_${contestId}${problemIndex}`,
            isGym: false,
            isGroup: true,
            canonicalUrl: `https://codeforces.com/group/${groupMatch[1]}/contest/${contestId}/problem/${problemIndex}`
          };
        }

        return null;
      } catch (err) {
        console.warn('[CFT] Error parsing Codeforces URL:', err);
        return null;
      }
    },

    /**
     * Checks whether a URL represents a Codeforces problem page.
     * @param {string} urlStr
     * @returns {boolean}
     */
    isProblemUrl(urlStr) {
      return Boolean(this.extractProblemFromUrl(urlStr));
    },

    /**
     * Safely extracts problem title and parsed clean name from page DOM.
     * @param {Document} [doc=document]
     * @param {string} [fallbackIndex]
     * @returns {{ rawTitle: string|null, cleanName: string|null }}
     */
    parseProblemTitle(doc = document, fallbackIndex = '') {
      try {
        // Try standard problem title selector
        const titleEl =
          doc.querySelector('.problem-statement .header .title') ||
          doc.querySelector('.header .title') ||
          doc.querySelector('.problem-statement > div:first-child > div:first-child');

        if (!titleEl) {
          return {
            rawTitle: null,
            cleanName: fallbackIndex ? `Problem ${fallbackIndex}` : 'Unknown Problem'
          };
        }

        const rawTitle = titleEl.textContent.trim();

        // Title format is usually "A. Watermelon" or "B1. Permutation" or "A - Watermelon"
        const match = rawTitle.match(/^[A-Za-z0-9]+[\.\-\s]+\s*(.+)$/);
        let cleanName = match && match[1] ? match[1].trim() : rawTitle;

        return { rawTitle, cleanName };
      } catch (e) {
        console.warn('[CFT] Error parsing problem title:', e);
        return { rawTitle: null, cleanName: fallbackIndex ? `Problem ${fallbackIndex}` : null };
      }
    },

    /**
     * Extracts problem tags and difficulty rating from sidebar DOM.
     * @param {Document} [doc=document]
     * @returns {{ rating: number|null, tags: string[] }}
     */
    parseTagsAndRating(doc = document) {
      const result = {
        rating: null,
        tags: []
      };

      try {
        // Codeforces usually houses problem tags inside a sidebox containing "Problem tags" caption
        const sideboxes = doc.querySelectorAll('.roundbox.sidebox, ._ProblemDataBox');
        let tagsContainer = null;

        for (const box of sideboxes) {
          const caption = box.querySelector('.caption, .caption.titled');
          if (caption && /problem tags/i.test(caption.textContent)) {
            tagsContainer = box;
            break;
          }
        }

        // Fallback: search for any .tag-box on the page
        const tagElements = tagsContainer
          ? tagsContainer.querySelectorAll('.tag-box')
          : doc.querySelectorAll('.tag-box');

        tagElements.forEach((el) => {
          const text = el.textContent.trim();
          const title = el.getAttribute('title') || '';

          // Rating tag is typically "*800", "*1200", or has title="Difficulty"
          const ratingMatch = text.match(/^\*(\d+)$/) || title.match(/difficulty.*?(\d+)/i);
          if (ratingMatch && result.rating === null) {
            result.rating = parseInt(ratingMatch[1], 10);
            return;
          }

          // If it's a pure number prefixed with star or just number in difficulty
          if (/^\*\d+$/.test(text)) {
            const num = parseInt(text.replace('*', ''), 10);
            if (!isNaN(num) && result.rating === null) {
              result.rating = num;
              return;
            }
          }

          // Otherwise it's a regular tag
          const cleanTag = text.replace(/^\*+\s*/, '').trim().toLowerCase();
          if (cleanTag && !result.tags.includes(cleanTag)) {
            result.tags.push(cleanTag);
          }
        });
      } catch (e) {
        console.warn('[CFT] Error parsing tags/rating:', e);
      }

      return result;
    },

    /**
     * Extracts time limit and memory limit if available.
     * @param {Document} [doc=document]
     * @returns {{ timeLimit: string|null, memoryLimit: string|null }}
     */
    parseLimits(doc = document) {
      try {
        const timeLimitEl = doc.querySelector('.problem-statement .header .time-limit');
        const memoryLimitEl = doc.querySelector('.problem-statement .header .memory-limit');

        return {
          timeLimit: timeLimitEl ? timeLimitEl.textContent.trim() : null,
          memoryLimit: memoryLimitEl ? memoryLimitEl.textContent.trim() : null
        };
      } catch (e) {
        return { timeLimit: null, memoryLimit: null };
      }
    },

    /**
     * Comprehensive problem metadata extractor combining URL and DOM.
     * @param {string} [url=window.location.href]
     * @param {Document} [doc=document]
     * @returns {Object|null}
     */
    extractFullProblemDetails(url = (typeof window !== 'undefined' ? window.location.href : ''), doc = (typeof document !== 'undefined' ? document : null)) {
      const urlInfo = this.extractProblemFromUrl(url);
      if (!urlInfo) return null;

      let titleInfo = { rawTitle: null, cleanName: `Problem ${urlInfo.problemIndex}` };
      let tagInfo = { rating: null, tags: [] };
      let limits = { timeLimit: null, memoryLimit: null };

      if (doc) {
        titleInfo = this.parseProblemTitle(doc, urlInfo.problemIndex);
        tagInfo = this.parseTagsAndRating(doc);
        limits = this.parseLimits(doc);
      }

      return {
        problemId: urlInfo.problemId,
        contestId: urlInfo.contestId,
        problemIndex: urlInfo.problemIndex,
        name: titleInfo.cleanName || `Problem ${urlInfo.problemIndex}`,
        rawTitle: titleInfo.rawTitle,
        rating: tagInfo.rating,
        tags: tagInfo.tags,
        timeLimit: limits.timeLimit,
        memoryLimit: limits.memoryLimit,
        url: urlInfo.canonicalUrl || url
      };
    }
  };

  // Export for browser scripts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CFT_Codeforces;
  } else {
    root.CFT_Codeforces = CFT_Codeforces;
  }
})(typeof self !== 'undefined' ? self : this);
