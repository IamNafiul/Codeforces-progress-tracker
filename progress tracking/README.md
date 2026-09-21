# Codeforces Progress Tracker

A lightweight, privacy-first Chromium browser extension for competitive programmers that automatically tracks your problem-solving activity on [Codeforces](https://codeforces.com/) with minimal manual input and presents clean, actionable progress analytics.

Built with Vanilla JavaScript, HTML5, CSS3, and Chrome Extension Manifest V3. Compatible with **Google Chrome**, **Brave Browser**, and other Chromium-based browsers.

---

## Features

- **Automatic Problem Detection**: Instantly recognizes Codeforces problem pages across the problemset, active contests, gym contests, and group contests.
- **Smart Focus-Aware Time Tracking**: Tracks active "Time on Problem" accurately. Automatically pauses when you switch tabs, minimize the browser, or blur the window to prevent inflated times.
- **Zero Double-Counting**: Detects active tab focus to avoid multiplying elapsed time across multiple open tabs for the same problem.
- **Submission Attempt Tracking**: Automatically senses submission form actions on the problem page and records attempt counts.
- **Compact Productivity Popup**:
  - Live ticking timer with active pulsating indicator (`● Tracking` / `⏸ Paused`).
  - Problem title, rating tier badge, contest ID, and attempt counter.
  - One-click status selector (`Visiting`, `Attempted`, `Solved`).
  - Optional obstacle recorder ("Why I Got Stuck") and personal note-taking.
- **Developer-Grade Dashboard**:
  - **Overview Metrics**: Problems Solved, Problems Attempted, Total Tracked, Success Rate, Total Time, and Daily Streak.
  - **Rating Distribution**: Visual difficulty breakdown matching official Codeforces rank tiers (Newbie through Legendary Grandmaster).
  - **Why I Get Stuck (Failure Analytics)**: Frequency breakdown of user-recorded obstacles (e.g., *Couldn't find approach*, *Coding error*, *Didn't know concept*).
  - **Topic Breakdown**: Dynamic tag frequency analysis captured directly from visited problems.
  - **Searchable Problems Table**: Instant search by problem name/ID, status filtering, rating filters, and direct Codeforces links.
  - **Problem Editor Modal**: Edit status, notes, or failure reasons at any time directly in the dashboard.
- **Data Portability**: Full JSON Export and Import capabilities to backup, restore, or transfer your data across devices.
- **100% Privacy-First**: All data stays on your machine inside `chrome.storage.local`. Zero external servers, zero telemetry, zero accounts.

---

## Architecture

```
                                  Codeforces Problem Page
                                             │
                                     [Content Script]
                     (Extracts Problem ID, Title, Rating, Sidebar Tags)
                                             │
                       ┌─────────────────────┴──────────────────────┐
                       ▼                                            ▼
               [Focus & Visibility]                       [Submission Form]
          (Active tab timer: pauses on blur)           (Captures submit events)
                       │                                            │
                       └─────────────────────┬──────────────────────┘
                                             │
                                             ▼
                                  [chrome.storage.local]
                                 (Structured Problem Map)
                                             │
                       ┌─────────────────────┴──────────────────────┐
                       ▼                                            ▼
                  [Popup UI]                               [Full Dashboard]
           - Real-time live stopwatch                 - Metric Cards & Daily Streak
           - Quick status toggle                      - Rating Distribution Chart
           - Note & failure reason recorder           - "Why I Get Stuck" Analytics
           - Direct link to dashboard                 - Searchable & Filterable Table
                                                      - JSON Export / Import
```

---

## Installation

### For Google Chrome

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the project folder (the folder containing `manifest.json`).
6. Pin the **Codeforces Tracker** icon to your browser toolbar for quick access.

### For Brave Browser

1. Clone or download this repository to your local machine.
2. Open Brave Browser and navigate to:
   ```
   brave://extensions/
   ```
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the project folder (the folder containing `manifest.json`).
6. Pin the extension to your toolbar.

---

## How It Works

1. **Visit any problem on Codeforces**:
   - Example: `https://codeforces.com/problemset/problem/4/A` or `https://codeforces.com/contest/1800/problem/B`
2. **Automatic Tracking Starts**:
   - The extension registers the problem, extracts the difficulty rating and topic tags from the page, and starts accumulating active focus time.
   - If you switch to another tab or minimize your browser, tracking pauses automatically.
3. **Check the Popup**:
   - Click the extension icon in your browser toolbar to see the live stopwatch, adjust problem status, record key notes, or note why you got stuck.
4. **Open the Dashboard**:
   - Click **Open Dashboard** in the popup to view comprehensive analytics, difficulty charts, streak metrics, and your full problem history.

---

## Privacy Guarantee

Your privacy is paramount:
- **No external server**: There is no backend, no cloud database, and no server collection.
- **No telemetry or analytics**: The extension does not contain Google Analytics, Firebase, or third-party trackers.
- **No ads or monetization**: Completely free, lightweight, open-source tool.
- **Scoped permissions**: Only requests `storage` and `activeTab` permissions, with host permissions restricted exclusively to `codeforces.com`.

---

## Current Limitations & Design Decisions (V1)

- **Automatic Verdict Detection**:
  - Codeforces redirects or updates submissions asynchronously on separate status/my-submissions pages.
  - In V1, the extension reliably detects problem page submission attempts (`submissionCount` + 1 and `attempted` status).
  - Marking a problem as `Solved` or tagging specific failure reasons is intentionally one-click manual in the popup or dashboard to ensure 100% accurate, non-faked data.
- **Codeforces Page Structure**:
  - The DOM parser uses resilient CSS selectors and fallbacks. If Codeforces redesigns its problem statement DOM, tags and ratings will safely fallback to `null` or URL-derived problem IDs rather than crashing.

---

## Future Roadmap

- [ ] **Codeforces Public API Integration**: Optionally connect your Codeforces handle to automatically verify and synchronize final verdicts (`OK`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`) without requiring credentials.
- [ ] **GitHub Solution Sync**: Automatically commit accepted solution code directly to a personal GitHub repository.
- [ ] **Weak Topic Radar**: Suggest problem difficulty ranges based on topics with the highest failure rates.
- [ ] **Contest Mode**: Special contest timer and countdown dashboard for live virtual and official contests.
- [ ] **Dark / Light Theme Toggle**: User preference override for dashboard aesthetics.

---

## License

MIT License. Free for all competitive programmers and open-source contributors.
