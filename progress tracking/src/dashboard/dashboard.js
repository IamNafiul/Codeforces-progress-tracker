/**
 * dashboard.js - Dashboard logic for Codeforces Progress Tracker.
 * Manages metrics calculation, rating distribution chart, failure analytics,
 * topic breakdown, table filtering, editing modal, and export/import.
 * Pure Vanilla JS, zero dependencies.
 */

(function () {
  'use strict';

  const Helpers = window.CFT_Helpers;
  const Storage = window.CFT_Storage;

  // State
  let allProblems = [];
  let filteredProblems = [];

  // DOM Elements - Metrics
  const statSolved = document.getElementById('stat-solved');
  const statSolvedSub = document.getElementById('stat-solved-sub');
  const statAttempted = document.getElementById('stat-attempted');
  const statAttemptedSub = document.getElementById('stat-attempted-sub');
  const statTotal = document.getElementById('stat-total');
  const statTotalSub = document.getElementById('stat-total-sub');
  const statRate = document.getElementById('stat-rate');
  const statTime = document.getElementById('stat-time');
  const statStreak = document.getElementById('stat-streak');
  const statStreakSub = document.getElementById('stat-streak-sub');

  // DOM Elements - Containers
  const ratingChartContainer = document.getElementById('rating-chart-container');
  const failureChartContainer = document.getElementById('failure-chart-container');
  const topicsChartContainer = document.getElementById('topics-chart-container');
  const problemsTbody = document.getElementById('problems-tbody');
  const tableEmptyState = document.getElementById('table-empty-state');
  const problemsCountBadge = document.getElementById('problems-count-badge');

  // Filters
  const filterSearch = document.getElementById('filter-search');
  const filterStatus = document.getElementById('filter-status');
  const filterRating = document.getElementById('filter-rating');

  // Nav Actions
  const btnExportData = document.getElementById('btn-export-data');
  const btnImportData = document.getElementById('btn-import-data');
  const fileImportInput = document.getElementById('file-import-input');
  const btnResetData = document.getElementById('btn-reset-data');

  // Modal Elements
  const modalEditProblem = document.getElementById('modal-edit-problem');
  const modalProblemTitle = document.getElementById('modal-problem-title');
  const modalProblemId = document.getElementById('modal-problem-id');
  const modalStatus = document.getElementById('modal-status');
  const modalFailureReason = document.getElementById('modal-failure-reason');
  const modalPersonalNote = document.getElementById('modal-personal-note');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const btnSaveModal = document.getElementById('btn-save-modal');

  /**
   * Initializes the dashboard
   */
  async function initDashboard() {
    await loadData();
    setupEventListeners();
  }

  /**
   * Loads all problem data from storage and refreshes all sections
   */
  async function loadData() {
    allProblems = await Storage.getAllProblems();
    renderMetrics();
    renderRatingDistribution();
    renderFailureAnalytics();
    renderTopicAnalytics();
    applyFilters();
  }

  /**
   * Renders the 6 key overview metrics
   */
  function renderMetrics() {
    const total = allProblems.length;
    const solved = allProblems.filter((p) => p.status === 'solved').length;
    const attempted = allProblems.filter(
      (p) => p.status === 'attempted' || p.status === 'solved' || (p.submissionCount && p.submissionCount > 0)
    ).length;

    const totalSeconds = allProblems.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0);
    const successRate = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
    const streak = Helpers.calculateStreak(allProblems);

    // Update DOM
    statSolved.textContent = solved;
    statSolvedSub.textContent = attempted > 0 ? `${Math.round((solved / attempted) * 100)}% of attempted` : '0% of attempted';

    statAttempted.textContent = attempted;
    statAttemptedSub.textContent = `${total - attempted} unattempted visits`;

    statTotal.textContent = total;
    statTotalSub.textContent = `${total} unique problems`;

    statRate.textContent = `${successRate}%`;

    statTime.textContent = Helpers.formatDuration(totalSeconds);

    statStreak.textContent = streak;
    if (streak === 0) {
      statStreakSub.textContent = 'Start solving to build your streak.';
    } else {
      statStreakSub.textContent = `${streak} active consecutive ${streak === 1 ? 'day' : 'days'}`;
    }
  }

  /**
   * Renders difficulty rating distribution bar chart for solved problems
   */
  function renderRatingDistribution() {
    ratingChartContainer.innerHTML = '';

    const solved = allProblems.filter((p) => p.status === 'solved');
    if (solved.length === 0) {
      ratingChartContainer.innerHTML = `
        <div class="empty-state-box">
          <h3>No solved problems yet.</h3>
          <p>Mark problems as solved to see your rating difficulty distribution.</p>
        </div>
      `;
      return;
    }

    // Group counts by rating
    const counts = {};
    solved.forEach((p) => {
      const key = p.rating !== null && p.rating !== undefined ? p.rating : 'Unrated';
      counts[key] = (counts[key] || 0) + 1;
    });

    // Sort ratings numerically, with Unrated at the end
    const sortedKeys = Object.keys(counts).sort((a, b) => {
      if (a === 'Unrated') return 1;
      if (b === 'Unrated') return -1;
      return Number(a) - Number(b);
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    sortedKeys.forEach((key) => {
      const count = counts[key];
      const ratingNum = key === 'Unrated' ? null : Number(key);
      const color = Helpers.getRatingColor(ratingNum);
      const label = key === 'Unrated' ? 'Unrated' : `${key} (${Helpers.getRatingRankTitle(ratingNum)})`;
      const pct = Math.max(8, Math.round((count / maxCount) * 100));

      const row = document.createElement('div');
      row.className = 'dist-bar-item';
      row.innerHTML = `
        <div class="dist-bar-label" title="${Helpers.escapeHtml(label)}">${Helpers.escapeHtml(label)}</div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
        </div>
        <div class="dist-bar-count">${count}</div>
      `;
      ratingChartContainer.appendChild(row);
    });
  }

  /**
   * Renders "Why I Get Stuck" failure reasons breakdown
   */
  function renderFailureAnalytics() {
    failureChartContainer.innerHTML = '';

    const reasonsCount = {};
    allProblems.forEach((p) => {
      if (p.failureReason) {
        reasonsCount[p.failureReason] = (reasonsCount[p.failureReason] || 0) + 1;
      }
    });

    const entries = Object.entries(reasonsCount).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      failureChartContainer.innerHTML = `
        <div class="empty-state-box">
          <h3>No failure reasons recorded yet.</h3>
          <p>Record obstacles in the popup when you get stuck to analyze your patterns.</p>
        </div>
      `;
      return;
    }

    const maxCount = Math.max(...Object.values(reasonsCount), 1);

    entries.forEach(([reason, count]) => {
      const pct = Math.max(8, Math.round((count / maxCount) * 100));
      const row = document.createElement('div');
      row.className = 'dist-bar-item';
      row.innerHTML = `
        <div class="dist-bar-label" title="${Helpers.escapeHtml(reason)}">${Helpers.escapeHtml(reason)}</div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${pct}%; background-color: var(--color-yellow);"></div>
        </div>
        <div class="dist-bar-count">${count}</div>
      `;
      failureChartContainer.appendChild(row);
    });
  }

  /**
   * Renders problem tags frequency
   */
  function renderTopicAnalytics() {
    topicsChartContainer.innerHTML = '';

    const tagsCount = {};
    allProblems.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => {
          tagsCount[tag] = (tagsCount[tag] || 0) + 1;
        });
      }
    });

    const entries = Object.entries(tagsCount).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      topicsChartContainer.innerHTML = `
        <div class="empty-state-box" style="width: 100%;">
          <h3>No topic tags collected yet.</h3>
          <p>Tags will appear as you visit tagged Codeforces problems.</p>
        </div>
      `;
      return;
    }

    entries.forEach(([tag, count]) => {
      const pill = document.createElement('span');
      pill.className = 'topic-tag-pill';
      pill.innerHTML = `
        <span>${Helpers.escapeHtml(tag)}</span>
        <span class="topic-tag-count">${count}</span>
      `;
      topicsChartContainer.appendChild(pill);
    });
  }

  /**
   * Filters problems table based on search query, status, and rating
   */
  function applyFilters() {
    const query = filterSearch.value.trim().toLowerCase();
    const status = filterStatus.value;
    const ratingFilter = filterRating.value;

    filteredProblems = allProblems.filter((p) => {
      // 1. Text Search
      if (query) {
        const idMatch = (p.problemId || '').toLowerCase().includes(query);
        const nameMatch = (p.name || '').toLowerCase().includes(query);
        const tagMatch = Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(query));
        if (!idMatch && !nameMatch && !tagMatch) return false;
      }

      // 2. Status Filter
      if (status !== 'all') {
        if (p.status !== status) return false;
      }

      // 3. Rating Filter
      if (ratingFilter !== 'all') {
        const r = p.rating;
        if (ratingFilter === 'unrated' && r !== null && r !== undefined) return false;
        if (ratingFilter === '800-1100' && (r === null || r < 800 || r >= 1200)) return false;
        if (ratingFilter === '1200-1399' && (r === null || r < 1200 || r >= 1400)) return false;
        if (ratingFilter === '1400-1599' && (r === null || r < 1400 || r >= 1600)) return false;
        if (ratingFilter === '1600-1899' && (r === null || r < 1600 || r >= 1900)) return false;
        if (ratingFilter === '1900+' && (r === null || r < 1900)) return false;
      }

      return true;
    });

    renderProblemsTable();
  }

  /**
   * Renders the problems table body
   */
  function renderProblemsTable() {
    problemsTbody.innerHTML = '';
    problemsCountBadge.textContent = `${filteredProblems.length} ${filteredProblems.length === 1 ? 'problem' : 'problems'}`;

    if (filteredProblems.length === 0) {
      tableEmptyState.classList.remove('hidden');
      return;
    }

    tableEmptyState.classList.add('hidden');

    filteredProblems.forEach((p) => {
      const tr = document.createElement('tr');

      // Problem link
      const problemUrl = p.url || `https://codeforces.com/problemset/problem/${p.contestId}/${p.problemIndex}`;
      const title = p.name ? `${p.problemIndex ? p.problemIndex + '. ' : ''}${p.name}` : p.problemId;

      // Rating badge
      const ratingColor = Helpers.getRatingColor(p.rating);
      const ratingText = p.rating ? p.rating : 'Unrated';

      // Status badge
      const statusClass = `status-badge-${p.status || 'visiting'}`;
      const statusLabel = (p.status || 'visiting').toUpperCase();

      // Notes snippet
      let notesHtml = '<span class="text-dim">-</span>';
      if (p.failureReason || p.personalNote) {
        const reasonTag = p.failureReason
          ? `<span class="notes-reason-tag" title="Why stuck: ${Helpers.escapeHtml(p.failureReason)}">${Helpers.escapeHtml(p.failureReason)}</span>`
          : '';
        const noteText = p.personalNote ? Helpers.escapeHtml(p.personalNote) : '';
        notesHtml = `<div class="notes-snippet">${reasonTag}${noteText}</div>`;
      }

      tr.innerHTML = `
        <td>
          <div class="problem-link-cell">
            <a href="${Helpers.escapeHtml(problemUrl)}" target="_blank" rel="noopener noreferrer" class="problem-link">
              ${Helpers.escapeHtml(title)}
            </a>
            <svg class="problem-external-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
        </td>
        <td>
          <span class="badge-table" style="background-color: ${ratingColor}; color: #fff;">
            ${ratingText}
          </span>
        </td>
        <td>
          <span class="badge-table ${statusClass}">
            ${statusLabel}
          </span>
        </td>
        <td style="font-family: var(--font-mono); font-weight: 500;">
          ${Helpers.formatDuration(p.totalTimeSpent || 0)}
        </td>
        <td style="font-family: var(--font-mono);">
          ${p.submissionCount || 0}
        </td>
        <td>
          ${notesHtml}
        </td>
        <td title="${Helpers.formatDate(p.lastVisited)}">
          ${Helpers.formatRelativeTime(p.lastVisited)}
        </td>
        <td class="text-right">
          <div class="action-btn-group">
            <button class="action-btn btn-edit-prob" data-id="${Helpers.escapeHtml(p.problemId)}">Edit</button>
            <button class="action-btn action-btn-danger btn-delete-prob" data-id="${Helpers.escapeHtml(p.problemId)}" title="Delete record">&times;</button>
          </div>
        </td>
      `;

      problemsTbody.appendChild(tr);
    });

    // Attach edit and delete handlers
    document.querySelectorAll('.btn-edit-prob').forEach((btn) => {
      btn.onclick = () => openEditModal(btn.dataset.id);
    });

    document.querySelectorAll('.btn-delete-prob').forEach((btn) => {
      btn.onclick = () => handleDeleteProblem(btn.dataset.id);
    });
  }

  /**
   * Modal Management
   */
  function openEditModal(problemId) {
    const problem = allProblems.find((p) => p.problemId === problemId);
    if (!problem) return;

    modalProblemId.value = problem.problemId;
    modalProblemTitle.textContent = `Edit Problem ${problem.problemIndex ? problem.problemIndex + '. ' : ''}${problem.name || problem.problemId}`;
    modalStatus.value = problem.status || 'visiting';
    modalFailureReason.value = problem.failureReason || '';
    modalPersonalNote.value = problem.personalNote || '';

    modalEditProblem.classList.remove('hidden');
  }

  function closeEditModal() {
    modalEditProblem.classList.add('hidden');
  }

  async function saveModalChanges() {
    const problemId = modalProblemId.value;
    if (!problemId) return;

    const newStatus = modalStatus.value;
    const newReason = modalFailureReason.value || null;
    const newNote = modalPersonalNote.value.trim();

    const verdict = newStatus === 'solved' ? 'OK' : null;

    await Storage.updateProblemStatus(problemId, newStatus, verdict);
    await Storage.updateProblemNotes(problemId, newNote, newReason);

    closeEditModal();
    await loadData();
  }

  async function handleDeleteProblem(problemId) {
    if (confirm(`Are you sure you want to remove problem ${problemId} from your history?`)) {
      await Storage.deleteProblem(problemId);
      await loadData();
    }
  }

  /**
   * Export / Import / Clear handlers
   */
  async function handleExport() {
    const jsonStr = await Storage.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `codeforces-tracker-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileImportInput.click();
  }

  async function handleFileImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = await Storage.importData(event.target.result);
        if (result.success) {
          alert(`Successfully imported ${result.importedCount} problems!`);
          await loadData();
        } else {
          alert(`Import failed: ${result.error || 'Unknown error'}`);
        }
      } catch (err) {
        alert(`Failed to parse backup JSON: ${err.message}`);
      } finally {
        fileImportInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  async function handleClearAll() {
    const confirm1 = confirm('Are you sure you want to delete ALL tracked Codeforces data? This action cannot be undone.');
    if (confirm1) {
      await Storage.clearAllData();
      await loadData();
      alert('All Codeforces progress data has been cleared.');
    }
  }

  /**
   * Sets up UI event listeners
   */
  function setupEventListeners() {
    filterSearch.addEventListener('input', applyFilters);
    filterStatus.addEventListener('change', applyFilters);
    filterRating.addEventListener('change', applyFilters);

    btnExportData.addEventListener('click', handleExport);
    btnImportData.addEventListener('click', handleImportClick);
    fileImportInput.addEventListener('change', handleFileImport);
    btnResetData.addEventListener('click', handleClearAll);

    btnCloseModal.addEventListener('click', closeEditModal);
    btnCancelModal.addEventListener('click', closeEditModal);
    btnSaveModal.addEventListener('click', saveModalChanges);

    // Close modal on escape or background click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalEditProblem.classList.contains('hidden')) {
        closeEditModal();
      }
    });

    modalEditProblem.addEventListener('click', (e) => {
      if (e.target === modalEditProblem) {
        closeEditModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initDashboard);
})();
