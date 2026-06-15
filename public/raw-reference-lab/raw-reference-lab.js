(() => {
  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'runs-locally', label: 'Runs locally' },
    { id: 'has-local-files', label: 'Has local files' },
    { id: 'local-static-demo', label: 'Local static demos' },
    { id: 'local-dev-server', label: 'Local dev servers' },
    { id: 'partial-archive', label: 'Partial archives' },
    { id: 'needs-internet', label: 'Needs internet' },
    { id: 'needs-preprocessor', label: 'Needs preprocessor' },
    { id: 'needs-runner', label: 'Needs runner' },
    { id: 'source-only', label: 'Source only' },
    { id: 'external-only', label: 'External only' },
    { id: 'broken', label: 'Broken' },
    { id: 'warnings', label: 'Warnings' },
    { id: 'fixable-locally', label: 'Fixable locally' },
    { id: 'codepen-local', label: 'CodePen local' },
    { id: 'github-static-local', label: 'GitHub static local' },
    { id: 'web-archive-local', label: 'Web archive local' },
  ];

  const HEALTH_LABELS = {
    working: 'Working',
    warning: 'Warning',
    broken: 'Broken',
    'needs-preprocessor': 'Needs preprocessor',
    'needs-external-assets': 'Needs external assets',
    'needs-runner': 'Needs runner',
    'runner-failed': 'Runner failed',
    'source-only': 'Source-only',
    'external-only': 'External only',
    unknown: 'Unknown',
  };

  const CLASSIFICATION_BADGE_CLASS = {
    runsLocally: 'rrl-badge--runs-locally',
    hasLocalFiles: 'rrl-badge--has-files',
    isLocalStaticDemo: 'rrl-badge--static-demo',
    isLocalDevServer: 'rrl-badge--dev-server',
    isPartialArchive: 'rrl-badge--partial-archive',
    needsInternet: 'rrl-badge--needs-internet',
    isRemoteDependent: 'rrl-badge--remote-dependent',
    isSourceOnly: 'rrl-badge--source',
    isExternalOnly: 'rrl-badge--external',
  };

  const HEALTH_BADGE_CLASS = {
    working: 'rrl-badge--health-working',
    warning: 'rrl-badge--health-warning',
    broken: 'rrl-badge--health-broken',
    'needs-preprocessor': 'rrl-badge--health-preprocessor',
    'needs-external-assets': 'rrl-badge--health-external',
    'needs-runner': 'rrl-badge--health-runner',
    'runner-failed': 'rrl-badge--health-failed',
    'source-only': 'rrl-badge--health-source',
    'external-only': 'rrl-badge--health-extonly',
    unknown: 'rrl-badge--health-unknown',
  };

  const NOT_RUNNING_STATUSES = new Set([
    'not-started', 'stopped', 'failed', 'unknown',
    'install-failed', 'start-failed', 'start-timeout',
  ]);

  let items = [];
  let enrichedItems = [];
  let runners = [];
  let runnerStatus = {};
  let demoHealth = { items: {} };
  const WRAPPER_ISSUE_REASONS = new Set(['js-module-mismatch', 'missing-local-asset']);

  function isFixableLocally(item) {
    if (item.fixableLocally) return true;
    const reason = item.healthReason || '';
    return reason === 'js-module-mismatch' || reason === 'missing-local-asset' || reason === 'scss-not-compiled';
  }

  function needsInternet(item) {
    if (item.needsInternet) return true;
    return item.health === 'needs-external-assets'
      || item.healthReason === 'external-js-required'
      || item.healthReason === 'external-decorative-asset'
      || item.healthReason === 'external-cdn-required';
  }
  let activeFilter = 'all';
  let activeSort = 'usefulnessScore';

  const $ = (sel) => document.querySelector(sel);

  async function init() {
    const [indexRes, runnersRes, statusRes, healthRes] = await Promise.all([
      fetch('./raw-reference-index.json'),
      fetch('./reference-runners.json').catch(() => null),
      fetch('./runner-status.json').catch(() => null),
      fetch('./demo-health.json').catch(() => null),
    ]);
    items = await indexRes.json();
    if (runnersRes?.ok) runners = await runnersRes.json();
    if (statusRes?.ok) runnerStatus = await statusRes.json();
    if (healthRes?.ok) demoHealth = await healthRes.json();
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
    const hasLocalFiles = Boolean(
      item.localDemoUrl ||
      localSourcePath ||
      runnerPath ||
      runner?.localDevUrl ||
      runner?.sourcePath,
    );
    const isExternalOnly = !hasLocalFiles;

    return {
      runner,
      localSourcePath,
      runnerPath,
      hasLocalDemoPage,
      hasRunnerCandidate,
      isRunnerRunning,
      isRunnerNotRunning,
      hasLocalSourceOnly,
      hasLocalFiles,
      isExternalOnly,
      runnerStatusVal,
    };
  }

  function computeClassification(item, runner, flags, healthRecord) {
    const health = healthRecord?.health || item.health || 'unknown';
    const localDevUrl = runnerStatus?.[runner?.id]?.localDevUrl || runner?.localDevUrl || null;
    const isLocalDevServer = Boolean(
      runner?.runnable &&
      flags.isRunnerRunning &&
      String(localDevUrl || '').startsWith('http://localhost:'),
    );

    const audit = healthRecord || {};
    const needsInternet = Boolean(audit.needsInternet)
      || health === 'needs-external-assets'
      || item.healthReason === 'external-js-required'
      || item.healthReason === 'external-decorative-asset'
      || item.healthReason === 'archive-asset-gap';
    const isPartialArchive = Boolean(audit.isPartialArchive);
    const isRemoteDependent = Boolean(audit.isRemoteDependent)
      || (flags.hasLocalDemoPage && (needsInternet || isPartialArchive));

    const isSourceOnly = Boolean(audit.isSourceOnly)
      || health === 'source-only'
      || (Boolean(flags.localSourcePath) && !flags.hasLocalDemoPage && !isLocalDevServer);
    const isExternalOnly = Boolean(audit.isExternalOnly)
      || health === 'external-only'
      || flags.isExternalOnly;

    const isLocalStaticDemo = Boolean(
      flags.hasLocalDemoPage &&
      health === 'working' &&
      !needsInternet &&
      !isPartialArchive &&
      !isRemoteDependent &&
      !isLocalDevServer,
    );

    const runsLocally = Boolean(
      isLocalDevServer ||
      (health === 'working' &&
        !needsInternet &&
        !isPartialArchive &&
        !isRemoteDependent &&
        flags.hasLocalDemoPage),
    );

    let buttonLabel = audit.buttonLabel || null;
    if (isLocalDevServer) buttonLabel = 'Open local dev server';
    else if (isLocalStaticDemo || (runsLocally && item.localDemoUrl)) buttonLabel = 'Open local demo';
    else if (isPartialArchive && item.localDemoUrl) buttonLabel = 'Open partial archive';
    else if ((isRemoteDependent || needsInternet) && item.localDemoUrl) buttonLabel = 'Open remote-dependent local page';
    else if (isSourceOnly) buttonLabel = 'Open source URL';
    else if (isExternalOnly) buttonLabel = 'Open source';

    return {
      hasLocalFiles: flags.hasLocalFiles,
      runsLocally,
      isLocalStaticDemo,
      isLocalDevServer,
      isPartialArchive,
      needsInternet,
      isRemoteDependent,
      isSourceOnly,
      isExternalOnly,
      partialArchiveKind: audit.partialArchiveKind || null,
      buttonLabel,
      classificationDescription: audit.classificationDescription || null,
    };
  }

  function defaultHealth(item, runner, flags) {
    if (flags.hasLocalDemoPage) {
      return { health: 'unknown', healthReason: 'unknown', healthDetails: [], lastCheckedAt: null, debugUrl: null, logPath: null };
    }
    if (flags.isRunnerRunning) {
      return { health: 'working', healthReason: 'runner-active', healthDetails: ['Runner dev server is running'], lastCheckedAt: null, debugUrl: null, logPath: null };
    }
    if (flags.hasRunnerCandidate && flags.isRunnerNotRunning) {
      const status = flags.runnerStatusVal || 'not-started';
      if (status === 'install-failed' || status === 'start-failed' || status === 'failed') {
        return {
          health: 'runner-failed',
          healthReason: status === 'install-failed' ? 'runner-install-failed' : 'runner-start-failed',
          healthDetails: [`Runner status: ${status}`],
          lastCheckedAt: null,
          debugUrl: null,
          logPath: runner ? `.raw-reference-runners/logs/${runner.id}.log` : null,
        };
      }
      return { health: 'needs-runner', healthReason: 'runner-not-started', healthDetails: [`Runner not running (${status})`], lastCheckedAt: null, debugUrl: null, logPath: null };
    }
    if (flags.hasLocalSourceOnly || item.previewMode === 'source-only') {
      return { health: 'source-only', healthReason: 'source-only-no-entrypoint', healthDetails: ['Local source exists but no runnable local demo page'], lastCheckedAt: null, debugUrl: null, logPath: null };
    }
    if (flags.isExternalOnly) {
      return { health: 'external-only', healthReason: 'external-only', healthDetails: ['External URL only — no local copy'], lastCheckedAt: null, debugUrl: null, logPath: null };
    }
    return { health: 'unknown', healthReason: 'unknown', healthDetails: [], lastCheckedAt: null, debugUrl: null, logPath: null };
  }

  function mergeHealth(item, runner, flags) {
    const fromAudit = demoHealth?.items?.[item.id];
    if (fromAudit) return { ...defaultHealth(item, runner, flags), ...fromAudit };
    return defaultHealth(item, runner, flags);
  }

  function enrichItem(item) {
    const runner = findRunnerForItem(item);
    const flags = computeFlags(item, runner);
    const health = mergeHealth(item, runner, flags);
    const classification = computeClassification(item, runner, flags, health);
    return { ...item, ...flags, ...health, ...classification };
  }

  function enrichRunnerOnlyCard(runner) {
    const pseudo = {
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
    };
    const flags = computeFlags(pseudo, runner);
    const health = mergeHealth(pseudo, runner, flags);
    const classification = computeClassification(pseudo, runner, flags, health);
    return { ...pseudo, ...flags, ...health, ...classification, isRunnerOnlyCard: true };
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
    const byHealth = (h) => enrichedItems.filter((i) => i.health === h).length;
    return {
      total,
      runsLocally: enrichedItems.filter((i) => i.runsLocally).length,
      hasLocalFiles: enrichedItems.filter((i) => i.hasLocalFiles).length,
      localStaticDemos: enrichedItems.filter((i) => i.isLocalStaticDemo).length,
      localDevServers: enrichedItems.filter((i) => i.isLocalDevServer).length,
      partialArchives: enrichedItems.filter((i) => i.isPartialArchive).length,
      needsInternetCount: enrichedItems.filter((i) => i.needsInternet).length,
      healthNeedsPreprocessor: byHealth('needs-preprocessor'),
      healthNeedsRunner: byHealth('needs-runner'),
      sourceOnly: enrichedItems.filter((i) => i.isSourceOnly).length,
      externalOnly: enrichedItems.filter((i) => i.isExternalOnly).length,
      healthBroken: byHealth('broken'),
      healthWarning: byHealth('warning'),
      healthWorking: byHealth('working'),
    };
  }

  function renderStats() {
    const s = countStats();
    const row = (pairs) => pairs.map(([label, val]) =>
      '<div class="rrl-stat"><strong>' + val + '</strong>' + label + '</div>',
    ).join('');
    $('#rrl-stats').innerHTML =
      '<div class="rrl-stats__row">' + row([
        ['Total references', s.total],
        ['Runs locally', s.runsLocally],
        ['Has local files', s.hasLocalFiles],
        ['Local static demos', s.localStaticDemos],
        ['Local dev servers', s.localDevServers],
        ['Partial archives', s.partialArchives],
        ['Needs internet', s.needsInternetCount],
        ['Needs preprocessor', s.healthNeedsPreprocessor],
        ['Needs runner', s.healthNeedsRunner],
        ['Source only', s.sourceOnly],
        ['External only', s.externalOnly],
        ['Broken', s.healthBroken],
      ]) + '</div>' +
      '<div class="rrl-stats__row rrl-stats__row--health">' + row([
        ['Working (health)', s.healthWorking],
        ['Warnings', s.healthWarning],
      ]) + '</div>';
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
      case 'runs-locally': return item.runsLocally;
      case 'has-local-files': return item.hasLocalFiles;
      case 'local-static-demo': return item.isLocalStaticDemo;
      case 'local-dev-server': return item.isLocalDevServer;
      case 'partial-archive': return item.isPartialArchive;
      case 'needs-internet': return item.needsInternet;
      case 'broken': return item.health === 'broken';
      case 'needs-preprocessor': return item.health === 'needs-preprocessor';
      case 'needs-runner': return item.health === 'needs-runner';
      case 'source-only': return item.isSourceOnly;
      case 'external-only': return item.isExternalOnly;
      case 'warnings': return item.health === 'warning';
      case 'fixable-locally': return isFixableLocally(item) && item.hasLocalDemoPage;
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
      item.health, item.healthReason,
      ...(item.healthDetails || []),
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

  function healthBadgeHtml(item) {
    const h = item.health || 'unknown';
    const cls = HEALTH_BADGE_CLASS[h] || HEALTH_BADGE_CLASS.unknown;
    const label = HEALTH_LABELS[h] || 'Unknown';
    return '<span class="rrl-badge rrl-badge--health ' + cls + '">' + esc(label) + '</span>';
  }

  function healthBlockHtml(item) {
    const h = item.health;
    if (!['broken', 'warning', 'needs-preprocessor', 'needs-external-assets', 'runner-failed'].includes(h)) return '';

    let html = '<div class="rrl-health">';

    if (h === 'broken' || h === 'warning') {
      html += healthBadgeHtml(item);
      if (h === 'broken' && WRAPPER_ISSUE_REASONS.has(item.healthReason)) {
        html += '<div class="rrl-health__reason">Likely generated-wrapper issue</div>';
      }
      html += '<div class="rrl-health__reason">Likely issue: ' + esc(item.healthReason || 'unknown') + '</div>';
      if (item.healthDetails?.length) {
        html += '<ul class="rrl-health__details">' + item.healthDetails.slice(0, 5).map((d) => '<li>' + esc(d) + '</li>').join('') + '</ul>';
      }
    }

    if (h === 'needs-preprocessor') {
      html += healthBadgeHtml(item);
      html += '<p class="rrl-health__note">This likely needs the original CodePen preprocessing step. Original files are preserved. Not compiled or rewritten.</p>';
      if (item.healthDetails?.length) {
        html += '<ul class="rrl-health__details">' + item.healthDetails.slice(0, 4).map((d) => '<li>' + esc(d) + '</li>').join('') + '</ul>';
      }
    }

    if (h === 'needs-external-assets') {
      html += healthBadgeHtml(item);
      html += '<p class="rrl-health__note">This demo references external assets/CDNs. Local copy exists, but it may not be fully offline.</p>';
      if (item.healthDetails?.length) {
        html += '<ul class="rrl-health__details">' + item.healthDetails.slice(0, 4).map((d) => '<li>' + esc(d) + '</li>').join('') + '</ul>';
      }
    }

    if (h === 'runner-failed' && item.runner) {
      html += healthBadgeHtml(item);
      const logPath = item.logPath || ('.raw-reference-runners/logs/' + item.runner.id + '.log');
      const startCmd = 'node scripts/start-reference-runners.mjs --id ' + item.runner.id;
      html += '<div class="rrl-health__reason">Runner failed</div>';
      html += '<div class="rrl-card__meta">Log: ' + esc(logPath) + '</div>';
      html += '<code class="rrl-runner__cmd">' + esc(startCmd) + '</code>';
    }

    if (item.debugUrl) {
      html += '<a class="rrl-btn" href="' + esc(item.debugUrl) + '" target="_blank" rel="noopener noreferrer">Open debug page</a>';
    }

    html += '</div>';
    return html;
  }

  function badgesHtml(item) {
    const badges = [];
    if (item.runsLocally) badges.push(['Runs locally', CLASSIFICATION_BADGE_CLASS.runsLocally]);
    if (item.hasLocalFiles) badges.push(['Has local files', CLASSIFICATION_BADGE_CLASS.hasLocalFiles]);
    if (item.isLocalStaticDemo) badges.push(['Local static demo', CLASSIFICATION_BADGE_CLASS.isLocalStaticDemo]);
    if (item.isLocalDevServer) badges.push(['Local dev server', CLASSIFICATION_BADGE_CLASS.isLocalDevServer]);
    if (item.isPartialArchive) badges.push(['Partial archive', CLASSIFICATION_BADGE_CLASS.isPartialArchive]);
    if (item.needsInternet) badges.push(['Needs internet', CLASSIFICATION_BADGE_CLASS.needsInternet]);
    if (item.isRemoteDependent) badges.push(['Remote-dependent', CLASSIFICATION_BADGE_CLASS.isRemoteDependent]);
    if (item.isSourceOnly) badges.push(['Source only', CLASSIFICATION_BADGE_CLASS.isSourceOnly]);
    if (item.isExternalOnly) badges.push(['External only', CLASSIFICATION_BADGE_CLASS.isExternalOnly]);
    if (item.health && item.health !== 'unknown' && item.health !== 'working') {
      badges.push([HEALTH_LABELS[item.health] || item.health, HEALTH_BADGE_CLASS[item.health] || 'rrl-badge--health-unknown']);
    }
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
    const canOpenLocalPage = Boolean(item.localDemoUrl);
    const isClickableLocal = item.runsLocally || item.isLocalStaticDemo;
    const cardClass = 'rrl-card'
      + (isClickableLocal ? ' rrl-card--runnable' : '')
      + (item.health === 'broken' ? ' rrl-card--health-broken' : '')
      + (item.health === 'warning' ? ' rrl-card--health-warning' : '');

    let actions = '';
    const primaryLabel = item.buttonLabel;

    if (primaryLabel === 'Open local dev server' && runner) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(runner.localDevUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(primaryLabel) + '</a>';
    } else if (primaryLabel && canOpenLocalPage) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.localDemoUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(primaryLabel) + '</a>';
      if (primaryLabel === 'Open local demo' || primaryLabel === 'Open partial archive' || primaryLabel === 'Open remote-dependent local page') {
        actions += '<button type="button" class="rrl-btn" data-action="copy-demo-url" data-id="' + esc(item.id) + '">Copy local page URL</button>';
      }
      if (item.debugUrl) {
        actions += '<a class="rrl-btn" href="' + esc(item.debugUrl) + '" target="_blank" rel="noopener noreferrer">Open debug page</a>';
      }
    } else if (item.isRunnerRunning && runner) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(runner.localDevUrl) + '" target="_blank" rel="noopener noreferrer">Open local dev server</a>';
    } else if (item.hasRunnerCandidate && runner) {
      const startCmd = 'node scripts/start-reference-runners.mjs --id ' + runner.id;
      actions += '<button type="button" class="rrl-btn rrl-btn--primary" data-action="copy-start-cmd" data-cmd="' + esc(startCmd) + '">Copy start command</button>';
    } else if (item.isExternalOnly && item.sourceUrl) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source</a>';
      actions += '<button type="button" class="rrl-btn" data-action="copy-url" data-id="' + esc(item.id) + '">Copy source URL</button>';
    } else if (item.isSourceOnly) {
      if (item.sourceUrl) actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source URL</a>';
      if (item.localSourcePath) actions += '<button type="button" class="rrl-btn" data-action="copy-path" data-id="' + esc(item.id) + '">Copy local source path</button>';
    } else if (item.previewMode === 'external-link' && item.sourceUrl) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source</a>';
    } else if (item.previewMode === 'link-only' && item.sourceUrl) {
      actions += '<a class="rrl-btn rrl-btn--primary" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source</a>';
      actions += '<button type="button" class="rrl-btn" data-action="copy-url" data-id="' + esc(item.id) + '">Copy source URL</button>';
    }

    if (item.sourceUrl && (canOpenLocalPage || runner || item.hasLocalFiles)) {
      if (!actions.includes('Open source')) {
        actions += '<a class="rrl-btn" href="' + esc(item.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Open source URL</a>';
      }
    }
    if (item.localSourcePath && !actions.includes('Copy local source path')) {
      actions += '<button type="button" class="rrl-btn" data-action="copy-path" data-id="' + esc(item.id) + '">Copy local source path</button>';
    }
    if (item.sourceUrl && !actions.includes('Copy source URL') && item.previewMode !== 'link-only' && !item.isExternalOnly) {
      actions += '<button type="button" class="rrl-btn" data-action="copy-url" data-id="' + esc(item.id) + '">Copy source URL</button>';
    }

    const classificationNote = item.classificationDescription
      ? '<p class="rrl-card__notes rrl-card__classification">' + esc(item.classificationDescription) + '</p>'
      : '';

    return '<article class="' + cardClass + '" data-id="' + esc(item.id) + '"' + (isClickableLocal ? ' data-demo-url="' + esc(item.localDemoUrl) + '"' : '') + '>' +
      badgesHtml(item) +
      '<span class="' + labelClass(item.catalogLabel) + '">' + esc(item.catalogLabel) + '</span>' +
      '<h3 class="rrl-card__title">' + esc(item.title) + '</h3>' +
      '<div class="rrl-card__meta">' + esc(item.group) + ' · ' + esc(item.runtime) + ' · ' + esc(item.previewMode) + '</div>' +
      (item.localDemoUrl ? '<div class="rrl-card__meta">Local page: ' + esc(item.localDemoUrl) + '</div>' : '') +
      (item.sourceUrl ? '<div class="rrl-card__meta">Source: ' + esc(item.sourceUrl) + '</div>' : '') +
      (item.localSourcePath ? '<div class="rrl-card__meta">Vault: ' + esc(item.localSourcePath) + '</div>' : '') +
      (item.runnerPath ? '<div class="rrl-card__meta">Runner path: ' + esc(item.runnerPath) + '</div>' : '') +
      classificationNote +
      healthBlockHtml(item) +
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
