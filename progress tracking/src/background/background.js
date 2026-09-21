/**
 * background.js - Manifest V3 background service worker for Codeforces Progress Tracker.
 * Pure Vanilla JS, minimal footprint.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[CFT] Codeforces Progress Tracker extension successfully installed.');
  } else if (details.reason === 'update') {
    console.log('[CFT] Codeforces Progress Tracker extension updated to version:', chrome.runtime.getManifest().version);
  }
});
