/* Leonida Legend — tracker logic. One plain script, no modules, no network.
   Trophy data arrives via data/trophies-data.js (window.__TROPHY_DATA__), the
   same content as data/trophies.json, so the page also works from file://.
   Every trophy carries a three-step guide: how to trigger it, where and when
   it happens, and what to watch out for. The search box matches guide text
   too, so typing "showroom" or "launder" finds the trophy whose hints say so. */
(function () {
  'use strict';
  var DATA = window.__TROPHY_DATA__;
  var TROPHIES = DATA.trophies;
  var KEY = 'leonida-legend-v1';
  var GRADES = ['platinum', 'gold', 'silver', 'bronze'];
  /* Which roadmap phase a trophy mainly belongs to, by kind — shown in the
     detail panel so a reader always knows where a trophy sits in the plan. */
  var PHASE = {
    story: 'Roadmap phase 1 — story first',
    activity: 'Roadmap phase 2 — strangers & activities (counters finish in phase 4)',
    collectible: 'Roadmap phase 3 — collectibles & exploration',
    misc: 'Roadmap phase 4 — cleanup & the 100% grind (or a story moment — see the guide)',
    online: 'No online trophy is stated in the official list'
  };
  /* Labels for the three guide steps, in order: what to do, where and when,
     what to watch out for. */
  var GUIDE_LABELS = ['How to trigger it', 'Where & when', 'Watch out for'];
  var params = new URLSearchParams(location.search);

  var state = load();
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); return { earned: p.earned || [], spoilers: p.spoilers !== false }; }
    } catch (e) { /* storage unavailable: run in-memory */ }
    return { earned: [], spoilers: true };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* in-memory only */ }
  }

  /* Demo seeding for screenshots and shareable lived-in links: ?demo=1, ?earned=2,3,8 */
  if (params.has('demo')) {
    state.earned = [2, 3, 4, 5, 8, 10, 16, 19, 20, 21, 25, 36, 51];
    save();
  }
  if (params.has('earned')) {
    state.earned = params.get('earned').split(',').map(Number).filter(function (n) { return n >= 1 && n <= 55; });
    save();
  }

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('grid'), missGrid = $('miss-grid');

  function isEarned(t) { return state.earned.indexOf(t.id) !== -1; }
  function spoilerHides(t) { return state.spoilers && t.hidden && !isEarned(t); }

  /* The guide is a three-string array [how, where/when, watch-out]. Older
     exports of the data used one long string; accept that shape too so a
     stale copy of the data file still renders instead of breaking the page. */
  function guideSteps(t) {
    if (Array.isArray(t.guide)) return t.guide;
    if (typeof t.guide === 'string' && t.guide) return [t.guide];
    return [];
  }
  function guideText(t) { return guideSteps(t).join(' '); }

  /* Escape text before it is interpolated into innerHTML. The data is ours,
     but a checklist import must never be able to inject markup this way. */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function badges(t) {
    var h = '<span class="badge g-' + t.grade + '">' + t.grade + '</span>' +
      '<span class="badge">' + t.kind + '</span>';
    if (t.target) h += '<span class="badge">target ' + t.target.toLocaleString('en-US') + '</span>';
    if (t.hidden) h += '<span class="badge">hidden</span>';
    if (t.missable) h += '<span class="badge miss">⚠ missable (inferred)</span>';
    if (isEarned(t)) h += '<span class="badge done">✓ earned</span>';
    return h;
  }

  function card(t, hideMark, forceReveal) {
    var el = document.createElement('article');
    el.className = 'card grade-' + t.grade + (isEarned(t) ? ' earned' : '');
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Open guide for ' + t.name);
    var hid = forceReveal ? false : spoilerHides(t);
    var name = hid ? '<span class="hidden-name">Hidden trophy</span>' : esc(t.name);
    var desc = hid ? '<span class="spoilered">This story trophy stays hidden until you earn it. Turn off “Hide spoilers” to reveal it.</span>' : esc(t.description);
    /* First guide step as a preview line, so the grid already answers "how
       do I start this one?" without opening the detail panel. Hidden cards
       keep the preview back with the rest of the spoiler. */
    var steps = guideSteps(t);
    var preview = (!hid && steps.length > 0)
      ? '<p class="first-step"><strong>First step:</strong> ' + esc(steps[0]) + '</p>' : '';
    el.innerHTML = '<h3>' + name + '</h3><p>' + desc + '</p>' + preview + '<div class="meta">' + badges(t) + '</div>' +
      (hideMark ? '' : '<button type="button" class="mark">' + (isEarned(t) ? '✓ Earned — undo' : 'Mark earned') + '</button>');
    el.addEventListener('click', function () { openDetail(t.id); });
    el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openDetail(t.id); } });
    var btn = el.querySelector('.mark');
    if (btn) btn.addEventListener('click', function (ev) { ev.stopPropagation(); toggle(t.id); });
    return el;
  }

  function toggle(id) {
    var i = state.earned.indexOf(id);
    if (i === -1) state.earned.push(id); else state.earned.splice(i, 1);
    save(); render();
  }

  function currentFilter() {
    return {
      q: $('q').value.trim().toLowerCase(),
      grade: $('f-grade').value, kind: $('f-kind').value,
      status: $('f-status').value, miss: $('f-missable').checked
    };
  }

  function render() {
    /* progress ring + per-grade counts */
    var total = TROPHIES.length, n = state.earned.length;
    var pct = Math.round((n / total) * 100);
    $('ring-num').textContent = n + '/' + total;
    $('ring-pct').textContent = pct + '%';
    $('ring-fg').style.strokeDashoffset = String(326.7 * (1 - n / total));
    $('grade-counts').innerHTML = GRADES.map(function (g) {
      var all = TROPHIES.filter(function (t) { return t.grade === g; }).length;
      var got = TROPHIES.filter(function (t) { return t.grade === g && isEarned(t); }).length;
      return '<li><span><span class="dot ' + g + '"></span>' + g + '</span><strong>' + got + ' / ' + all + '</strong></li>';
    }).join('');

    /* progress bar (tracker view): the same percentage as the ring, in a
       wide bar a screen reader can read as a progressbar and a sighted
       reader can take in without finding the hero panel. */
    var fill = $('progress-fill'), bar = $('progress-bar');
    if (fill && bar) {
      fill.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', String(pct));
      $('progress-label').textContent = pct + '% complete — ' + n + ' of ' + total + ' trophies earned';
    }

    /* "up next" line: unearned inferred missables first (they are the ones a
       player can lose), then the remaining count. */
    var openMiss = TROPHIES.filter(function (t) { return t.missable && !isEarned(t); }).length;
    var left = total - n;
    $('next-line').textContent = left === 0
      ? 'All 55 trophies earned — Leonida Legend status. 🏆'
      : (openMiss > 0
          ? 'Up next: ' + left + ' trophies to go, including ' + openMiss + ' unearned inferred missable' + (openMiss === 1 ? '' : 's') + ' — keep a manual save before story moments.'
          : 'Up next: ' + left + ' trophies to go, and every inferred missable is already banked.');

    /* tracker grid: the search query matches the name, the official
       description, the kind — and all three guide steps, so a player can
       search for what they remember doing ("showroom", "launder", "bowling")
       instead of the trophy's exact name. */
    var f = currentFilter();
    var shown = TROPHIES.filter(function (t) {
      if (f.grade && t.grade !== f.grade) return false;
      if (f.kind && t.kind !== f.kind) return false;
      if (f.status === 'earned' && !isEarned(t)) return false;
      if (f.status === 'unearned' && isEarned(t)) return false;
      if (f.miss && !t.missable) return false;
      if (f.q && (t.name + ' ' + t.description + ' ' + t.kind + ' ' + guideText(t)).toLowerCase().indexOf(f.q) === -1) return false;
      return true;
    });
    grid.innerHTML = '';
    shown.forEach(function (t) { grid.appendChild(card(t, false)); });
    $('empty').hidden = shown.length > 0;
    $('result-line').textContent = 'Showing ' + shown.length + ' of ' + total + ' trophies · ' + n + ' earned · progress saves automatically in this browser.';

    /* missables grid (roadmap view): names always revealed here, on purpose */
    missGrid.innerHTML = '';
    TROPHIES.filter(function (t) { return t.missable; }).forEach(function (t) { missGrid.appendChild(card(t, true, true)); });
  }

  /* detail panel */
  var current = null;
  function guideHtml(t) {
    var steps = guideSteps(t);
    if (steps.length === 0) return '<p>No guide steps for this trophy yet.</p>';
    /* A numbered list, one labelled step per line: how to trigger it, where
       and when it happens, what to watch out for. Spoiler-hidden trophies
       show the same steps — the steps are written spoiler-light on purpose —
       but only once the trophy's name and description are visible, so the
       panel never leaks a hidden trophy's identity while it is still hidden. */
    var items = steps.map(function (s, i) {
      var label = GUIDE_LABELS[i] || ('Step ' + (i + 1));
      return '<li><strong>' + label + ':</strong> ' + esc(s) + '</li>';
    }).join('');
    return '<ol class="guide-list">' + items + '</ol>';
  }
  function openDetail(id) {
    var t = TROPHIES.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    current = t;
    var hid = spoilerHides(t);
    var h = '<div class="meta" style="display:flex;gap:.35rem;flex-wrap:wrap">' + badges(t) + '</div>';
    h += '<h2 id="d-name">' + (hid ? 'Hidden trophy' : esc(t.name)) + '</h2>';
    h += '<p class="official">“' + (hid ? 'Description hidden by the spoiler setting until earned.' : esc(t.description)) + '”</p>';
    h += '<p class="phase">' + (PHASE[t.kind] || '') + '</p>';
    if (t.target) h += '<p><strong>PSN target:</strong> ' + t.target.toLocaleString('en-US') + ' ' + esc(t.targetLabel || '') + '.</p>';
    if (t.missable) h += '<p class="warn"><strong>⚠ Missable — flagged (inferred).</strong> The flag is reasoned from the official description’s wording — a choice, a one-time scene or a fail-first condition — not from a confirmed report. Keep a manual save before the relevant story moment or first attempt.</p>';
    h += '<h4>How to get it — three steps</h4>';
    h += hid ? '<p class="spoiler-note">The guide steps stay hidden with this trophy until you earn it or turn off “Hide spoilers”.</p>' : guideHtml(t);
    h += '<h4>Tips</h4><p>' + esc(t.tips) + '</p>';
    h += '<button type="button" class="mark" id="d-toggle">' + (isEarned(t) ? '✓ Earned — click to undo' : 'Mark this trophy earned') + '</button>';
    h += '<p class="src"><strong>Sources:</strong> ' + esc(t.source) + ' The full source list and honesty note are on the Roadmap &amp; missables view.</p>';
    $('d-body').innerHTML = h;
    $('detail').hidden = false;
    $('scrim').hidden = false;
    $('d-toggle').addEventListener('click', function () { toggle(t.id); openDetail(t.id); });
    $('d-close').focus();
  }
  function closeDetail() { $('detail').hidden = true; $('scrim').hidden = true; }
  $('d-close').addEventListener('click', closeDetail);
  $('scrim').addEventListener('click', closeDetail);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeDetail(); });

  /* views */
  function showView(v) {
    $('view-tracker').hidden = v !== 'tracker';
    $('view-roadmap').hidden = v !== 'roadmap';
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('is-active', b.dataset.view === v); });
  }
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { showView(b.dataset.view); });
  });

  /* controls */
  ['q', 'f-grade', 'f-kind', 'f-status', 'f-missable'].forEach(function (id) {
    $(id).addEventListener('input', render);
    $(id).addEventListener('change', render);
  });
  $('opt-spoilers').checked = state.spoilers;
  $('opt-spoilers').addEventListener('change', function () { state.spoilers = $('opt-spoilers').checked; save(); render(); });
  $('btn-reset').addEventListener('click', function () {
    if (confirm('Clear every earned mark?')) { state.earned = []; save(); render(); closeDetail(); }
  });
  $('btn-export').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ app: 'leonida-legend', version: 1, earned: state.earned }, null, 1)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-checklist.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
  });
  $('file-import').addEventListener('change', function () {
    var file = $('file-import').files[0];
    if (!file) return;
    file.text().then(function (text) {
      try {
        var p = JSON.parse(text);
        var list = Array.isArray(p) ? p : p.earned;
        if (!Array.isArray(list)) throw new Error('no earned list');
        state.earned = list.map(Number).filter(function (n) { return n >= 1 && n <= 55; });
        save(); render();
      } catch (e) { alert('That file is not a checklist exported from this guide.'); }
    });
  });

  if (params.get('view') === 'roadmap') showView('roadmap');
  if (params.has('miss')) setTimeout(function () { $('miss-grid').scrollIntoView(); window.scrollBy(0, -170); }, 60);
  if (params.get('grade')) $('f-grade').value = params.get('grade');
  if (params.get('kind')) $('f-kind').value = params.get('kind');
  render();
  if (params.has('detail')) openDetail(Number(params.get('detail')));
})();
