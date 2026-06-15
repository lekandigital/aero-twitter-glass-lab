(() => {
  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'local-available', label: 'Local available' },
    { id: 'local-demo-page', label: 'Local demo page' },
    { id: 'local-runner-candidate', label: 'Local runner candidate' },
    { id: 'running-local-server', label: 'Running local server' },
    { id: 'not-running-local-server', label: 'Not running local server' },
    { id: 'local-source-only', label: 'Local source only' },
    { id: 'external-only', label: 'External only' },
    { id: 'codepen-local', label: 'CodePen local' },
    { id: 'github-static-local', label: 'GitHub static local' },
    { id: 'web-archive-local', label: 'Web archive local' },
  ];

  const NOT_RUNNING_STATUSES = new Set([
    'not-started', 'stopped', 'failed', 'unknown',
    'install-failed', 'start-failed', 'start-timeout',
  ]);

  let items = [];
  let enrichedItems = [];
  let runners = [];
  let runnerStatus = {};
  let activeFilter = 'all';
  let activeSort = 'usefulnessScore';

  const $ = (sel) => document.querySelector(sel);

  async function init() {
    const [indexRes, runnersRes, statusRes] = await Promise.all([
      fetch('./raw-reference-index.json'),
      fetch('./reference-runners.json').catch(() => null),
      fetch('./runner-status.json').catch(() => null),
    ]);
    items = await indexRes.json();
    if (runnersRes?.ok) runners = await runnersRes.json();
    if (statusRes?.ok) runnerStatus = await statusRes.json();
    enrichedItems = buildEnrichedItems();
    renderStats();
    renderFilters();
    bindControls();
    renderGrid();
  }

  function normalizeUrl(url) {
    return (url || '').replace(/\/$/, '').toLowerCase();
  }

  function githubRepoKey(url) {
    const match = (url || '').match(/github\.com\/[^/]+\/([^/?#]+)/i);
    return match ? match[1].toLowerCase().replace(/\.git$/, '') : null;
  }

  function localPathMatchesRunner(localPath, runner) {
    if (!localPath || !runner) return false;
    const rid = runner.id.toLowerCase();
    if (localPath === runner.sourcePath) return true;
    if (localPath.endsWith('/' + runner.id) || localPath.endsWith('/' + rid)) return true;
    const base = localPath.split('/').pop()?.toLowerCase() || '';
    return base === rid || base.replace(/[^a-z0-9]+/g, '') === rid.replace(/[^a-z0-9]+/g, '');
  }

  function findRunnerForItem(item) {
    if (!runners.length) return null;
    const sourceUrl = item.sourceUrl || '';
    const localPath = item.localSourcePath || '';
    const itemRepo = githubRepoKey(sourceUrl);
    const sorted = [...runners].sort((a, b) => b.id.length - a.id.length);

    return sorted.find((r) => {
      const rid = r.id.toLowerCase();
      const ridSlug = rid.replace(/[^a-z0-9]+/g, '');
      if (r.sourceUrl && item.sourceUrl && normalizeUrl(item.sourceUrl) === normalizeUrl(r.sourceUrl)) return true;
      if (localPathMatchesRunner(localPath, r)) return true;
      const runnerRepo = githubRepoKey(r.sourceUrl);
      if (itemRepo && runnerRepo && itemRepo === runnerRepo) return true;
      if (itemRepo && (itemRepo === rid || itemRepo.replace(/[^a-z0-9]+/g, '') === ridSlug)) return true;
      return false;
    }) ?? null;
  }

  function runnerLiveStatus(runner) {
    const live = runnerStatus?.[runner.id];
    if (live?.status === 'running') return 'running';
    return live?.status ?? runner.status ?? 'not-started';
  }

  function computeFlags(item, runner) {
    const localSourcePath = item.localSourcePath || runner?.sourcePath || null;
    const runnerPath = runner?.runnerPath || null;
    const hasLocalDemoPage = item.previewMode === 'local-page' && Boolean(item.localDemoUrl);
    const hasRunnerCandidate = Boolean(runner?.runnable);
    const runnerStatusVal = runner ? runnerLiveStatus(runner) : null;
    const isRunnerRunning = hasRunnerCandidate && runnerStatusVal === 'running';
    const isRunnerNotRunning = hasRunnerCandidate && runnerStatusVal !== 'running';
    const hasLocalSourceOnly = Boolean(localSourcePath) && !hasLocalDemoPage && !isRunnerRunning;
    const isLocalAvailable = Boolean(
      hasLocalDemoPage ||
      hasRunnerCandidate ||
      localSourcePath ||
      runnerPath ||
      (item.previewMode === 'source-only' && localSourcePath) ||
      runner?.sourcePath
    );
    const isExternalOnly = !isLocalAvailable;

    return {
      runner,
      localSourcePath,
      runnerPath,
      hasLocalDemoPage,
      hasRunnerCandidate,
      isRunnerRunning,
      isRunnerNotRunning,
      hasLocalSourceOnly,
      isLocalAvailable,
      isExternalOnly,
      runnerStatusVal,
    };
  }

  function enrichItem(item) {
    const runner = findRunnerForItem(item);
    const flags = computeFlags(item, runner);
    return { ...item, ...flags };
  }

  function enrichRunnerOnlyCard(runner) {
    const flags = computeFlags({
      id: `runner-${runner.id}`,
      title: runner.title || runner.id,
      group: 'Package runners',
      runtime: runner.runnerType === 'static' ? 'vanilla-js' : 'unknown',
      previewMode: 'source-only',
      catalogLabel: 'source-only',
      sourceUrl: runner.sourceUrl,
      localSourcePath: runner.sourcePath,
      localDemoUrl: null,
      notes: runner.notes,
      tags: ['runner', 'github'],
      usefulnessScore: 70,
    }, runner);
    return { ...flags, isRunnerOnlyCard: true };
  }

  function buildEnrichedItems() {
    const enriched = items.map(enrichItem);
    const matchedRunnerIds = new Set(
      enriched.filter((i) => i.runner).map((i) => i.runner.id),
    );
    for (const runner of runners) {
      if (!matchedRunnerIds.has(runner.id) && (runner.runnable || runner.sourcePath)) {
        enriched.push(enrichRunnerOnlyCard(runner));
      }
    }
    return enriched;
  }

  function countStats() {
    const total = enrichedItems.length;
    return {
      total,
      localAvailable: enrichedItems.filter((i) => i.isLocalAvailable).length,
      localDemoPages: enrichedItems.filter((i) => i.hasLocalDemoPage).length,
      runnerCandidates: enrichedItems.filter((i) => i.hasRunnerCandidate).length,
      runningLocalServers: enrichedItems.filter((i) => i.isRunnerRunning).length,
      notRunningRunners: enrichedItems.filter((i) => i.isRunnerNotRunning).length,
      localSourceOnly: enrichedItems.filter((i) => i.hasLocalSourceOnly).length,
      externalOnly: enrichedItems.filter((i) => i.isExternalOnly).length,
    };
  }

  function renderStats() {
    const s = countStats();
    $('#rrl-stats').innerHTML = [
      ['Total references', s.total],
      ['Local available', s.localAvailable],
      ['Local demo pages', s.localDemoPages],
      ['Runner candidates', s.runnerCandidates],
      ['Running local servers', s.runningLocalServers],
      ['Not running runners', s.notRunningRunners],
      ['Local source only', s.localSourceOnly],
      ['External only', s.externalOnly],
    ].map(([label, val]) => '<div class="rrl-stat"><strong>' + val + '</strong>' + label + '</div>').join('');
  }

  function renderFilters() {
    const el = $('#rrl-filters');
    el.innerHTML = FILTERS.map((f) =>
      '<button type="button" class="rrl-filter' + (f.id === activeFilter ? ' is-active' : '') + '" data-filter="' + f.id + '">' + f.label + '</button>',
    ).join('');
    el.querySelectorAll('.rrl-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        renderFilters();
        renderGrid();
      });
    });
  }

  function bindControls() {
    $('#rrl-search').addEventListener('input', renderGrid);
    $('#rrl-sort').addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderGrid();
    });
  }

  function matchesFilter(item) {
    switch (activeFilter) {
      case 'all': return true;
      case 'local-available': return item.isLocalAvailable;
      case 'local-demo-page': return item.hasLocalDemoPage;
      case 'local-runner-candidate': return item.hasRunnerCandidate;
      case 'running-local-server': return item.isRunnerRunning;
      case 'not-running-local-server': return item.isRunnerNotRunning;
      case 'local-source-only': return item.hasLocalSourceOnly;
      case 'external-only': return item.isExternalOnly;
      case 'codepen-local': return item.group === 'Local CodePen exports' || (item.hasLocalDemoPage && item.localDemoUrl?.includes('/codepen/'));
      case 'github-static-local': return item.group === 'Local GitHub static demos' || (item.hasLocalDemoPage && item.localDemoUrl?.includes('/github-static/'));
      case 'web-archive-local': return item.group === 'Web archives' || (item.hasLocalDemoPage && item.localDemoUrl?.includes('/web-archives/'));
      default: return true;
    }
  }

  function searchMatch(item, q) {
    if (!q) return true;
    const hay = [
      item.title, item.group, item.runtime, item.previewMode, item.catalogLabel, item.notes,
      item.sourceUrl, item.localSourcePath, item.localDemoUrl, item.runnerPath,
      item.runner?.id, item.runner?.localDevUrl, item.runner?.sourcePath,
      ...(item.tags || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  }

  function sortItems(list) {
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (activeSort === 'usefulnessScore') {
        return (b.usefulnessScore || 0) - (a.usefulnessScore || 0) || (a.title || '').localeCompare(b.title || '');
      }
      if (activeSort === 'previewMode') return (a.previewMode || '').localeCompare(b.previewMode || '');
      if (activeSort === 'group') return (a.group || '').localeCompare(b.group || '');
      return (a.title || '').localeCompare(b.title || '');
    });
    return sorted;
  }

  function esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function labelClass(label) {
    if (label === 'local archive') return 'rrl-card__label rrl-card__label--archive';
    if (label === 'source-only') return 'rrl-card__label rrl-card__label--source';
    if (label === 'external-only') return 'rrl-card__label rrl-card__label--external';
    return 'rrl-card__label';
  }

  function openLocalDemo(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function badgesHtml(item) {
    const badges = [];
    if (item.isLocalAvailable) badges.push(['Local available', 'rrl-badge--available']);
    if (item.hasLocalDemoPage) badges.push(['Local demo', 'rrl-badge--demo']);
    if (item.hasRunnerCandidate) badges.push(['Runner candidate', 'rrl-badge--runner']);
    if (item.isRunnerRunning) badges.push(['Running', 'rrl-badge--running']);
    if (item.isRunnerNotRunning) badges.push(['Not running', 'rrl-badge--stopped']);
    if (item.hasLocalSourceOnly) badges.push(['Local source', 'rrl-badge--source']);
    if (item.isExternalOnly) badges.push(['External only', 'rrl-badge--external']);
    if (!badges.length) return '';
    return '<div class="rrl-badges">' + badges.map(([t, c]) =>
      '<span class="rrl-badge ' + c + '">' + esc(t) + '</span>',
    ).join('') + '</div>';
  }

  function runnerBlockHtml(runner, item) {
    const status = item.runnerStatusVal ?? runnerLiveStatus(runner);
    const startCmd = 'node scripts/start-reference-runners.mjs --id ' + runner.id;
    let html = '<div class="rrl-runner">';
    html += '<div class="rrl-runner__meta">Runner · port ' + esc(String(runner.port)) + ' · ' + esc(runner.runnerType) + '</div>';

    if (status === 'running') {
      html += '<a class="rrl-btn rrl-btn--primary" href="' + esc(runner.localDevUrl) + '" target="_blank" rel="noopener noreferrer">Open local dev server</a>';
      html += '<div class="rrl-runner__url">' + esc(runner.localDevUrl) + '</div>';
    } else {
      html += '<div class="rrl-runner__status">Not running · ' + esc(status) + '</div>';
      html += '<code class="rrl-runner__cmd">' + esc(startCmd) + '</code>';
      html += '<button type="button" class="rrl-btn" data-action="copy-start-cmd" data-cmd="' + esc(startCmd) + '">Copy start command</button>';
    }
    if (runner.sourcePath) {
      html += '<div class="rrl-card__meta">Vault: ' + esc(runner.sourcePath) + '</div>';
    }
    if (runner.runnerPath) {
      html += '<div class="rrl-card__meta">Runner path: ' + esc(runner.runnerPath) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function cardHtml(item) {
    const runner = item.runner;
    const runnable = item.hasLocalDemoPage;
    const cardClass = 'rrl-card' + (runnable ? ' rrl-card--runnable' : '');

    let actions = '';
    if (runnable) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.localDemoUrl) + '" target="_blank" rel="noopener noreferrer">Open local demo</a>';
      actions += '<button type="button" class="rrl-btn" data-action="copy-demo-url" data-id="' + esc(item.id) + '">Copy local demo URL</button>';
    } else if (item.isRunnerRunning && runner) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(runner.localDevUrl) + '" target="_blank" rel="noopener noreferrer">Open local dev server</a>';
    } else if (item.hasRunnerCandidate && runner) {
      const startCmd = 'node scripts/start-reference-runners.mjs --id ' + runner.id;
      actions += '<button type="button" class="rrl-btn rrl-btn--primary" data-action="copy-start-cmd" data-cmd="' + esc(startCmd) + '">Copy start command</button>';
    } else if (item.previewMode === 'external-link' && item.sourceUrl) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source</a>';
    } else if (item.previewMode === 'link-only' && item.sourceUrl) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source</a>';
      actions += '<button type="button" class="rrl-btn" data-action="copy-url" data-id="' + esc(item.id) + '">Copy source URL</button>';
    } else if (item.previewMode === 'source-only') {
      if (item.sourceUrl) actions += '<a class="rrl-btn" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source URL</a>';
      if (item.localSourcePath) actions += '<button type="button" class="rrl-btn" data-action="copy-path" data-id="' + esc(item.id) + '">Copy local path</button>';
    }

    if (item.sourceUrl && (runnable || runner || item.isLocalAvailable)) {
      actions += '<a class="rrl-btn" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source URL</a>';
    }
    if (item.localSourcePath && !actions.includes('Copy local path')) {
      actions += '<button type="button" class="rrl-btn" data-action="copy-path" data-id="' + esc(item.id) + '">Copy local source path</button>';
    }
    if (item.sourceUrl && !actions.includes('Copy source URL') && item.previewMode !== 'link-only') {
      actions += '<button type="button" class="rrl-btn" data-action="copy-url" data-id="' + esc(item.id) + '">Copy source URL</button>';
    }

    return '<article class="' + cardClass + '" data-id="' + esc(item.id) + '"' + (runnable ? ' data-demo-url="' + esc(item.localDemoUrl) + '"' : '') + '>' +
      badgesHtml(item) +
      '<span class="' + labelClass(item.catalogLabel) + '">' + esc(item.catalogLabel) + '</span>' +
      '<h3 class="rrl-card__title">' + esc(item.title) + '</h3>' +
      '<div class="rrl-card__meta">' + esc(item.group) + ' · ' + esc(item.runtime) + ' · ' + esc(item.previewMode) + '</div>' +
      (item.localDemoUrl ? '<div class="rrl-card__meta">Local demo: ' + esc(item.localDemoUrl) + '</div>' : '') +
      (item.sourceUrl ? '<div class="rrl-card__meta">Source: ' + esc(item.sourceUrl) + '</div>' : '') +
      (item.localSourcePath ? '<div class="rrl-card__meta">Vault: ' + esc(item.localSourcePath) + '</div>' : '') +
      (item.runnerPath ? '<div class="rrl-card__meta">Runner path: ' + esc(item.runnerPath) + '</div>' : '') +
      (runner && item.hasRunnerCandidate ? runnerBlockHtml(runner, item) : '') +
      (item.notes ? '<p class="rrl-card__notes">' + esc(item.notes) + '</p>' : '') +
      '<div class="rrl-card__tags">' + (item.tags || []).map((t) => '<span class="rrl-tag">' + esc(t) + '</span>').join('') + '</div>' +
      '<div class="rrl-card__actions">' + actions + '</div></article>';
  }

  function findItem(id) {
    return enrichedItems.find((i) => i.id === id);
  }

  function renderGrid() {
    const q = ($('#rrl-search').value || '').trim().toLowerCase();
    const filtered = sortItems(enrichedItems.filter((i) => matchesFilter(i) && searchMatch(i, q)));
    const grid = $('#rrl-grid');
    grid.innerHTML = filtered.map((item) => cardHtml(item)).join('');
    $('#rrl-count').textContent = 'Showing ' + filtered.length + ' of ' + enrichedItems.length + ' references';

    grid.querySelectorAll('.rrl-card--runnable').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.rrl-btn') || e.target.closest('a') || e.target.closest('.rrl-runner')) return;
        const url = card.dataset.demoUrl;
        if (url) openLocalDemo(url);
      });
    });

    grid.querySelectorAll('.rrl-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.dataset.action === 'copy-start-cmd' && btn.dataset.cmd) {
          navigator.clipboard.writeText(btn.dataset.cmd);
          return;
        }
        const item = findItem(btn.dataset.id);
        if (!item) return;
        if (btn.dataset.action === 'copy-path' && item.localSourcePath) navigator.clipboard.writeText(item.localSourcePath);
        if (btn.dataset.action === 'copy-url' && item.sourceUrl) navigator.clipboard.writeText(item.sourceUrl);
        if (btn.dataset.action === 'copy-demo-url' && item.localDemoUrl) navigator.clipboard.writeText(item.localDemoUrl);
      });
    });
  }

  init().catch((err) => {
    document.body.innerHTML = '<pre style="color:#f88;padding:2rem">Failed to load Raw Reference Lab: ' + err.message + '</pre>';
  });
})();
