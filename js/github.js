/**
 * github.js
 * Live GitHub "progress" card.
 *  - Fetches real profile + repo data from the public GitHub REST API
 *  - Public profile metrics (repos, stars, followers, following)
 *  - Top-language distribution bar built from the user's repositories
 *  - Contribution heatmap built from GitHub's contribution calendar
 *  - Clear unavailable states when the API is rate-limited or offline
 */
(function () {
  'use strict';

  var USER = 'Priyanshav';
  var API = 'https://api.github.com';

  var LANG_COLORS = {
    Python: '#4c6b8a', JavaScript: '#947840', TypeScript: '#50709b',
    Java: '#8c5a36', HTML: '#9c5e48', CSS: '#738977', Jupyter: '#9d6f49',
    'Jupyter Notebook': '#9d6f49', Shell: '#65785a', C: '#646b70',
    'C++': '#8a5960', Go: '#527c82', Rust: '#986d52', Dockerfile: '#536e7c',
    PHP: '#726b68', Ruby: '#7d4949', 'C#': '#5c7954'
  };
  var PALETTE = ['#56785d', '#87977f', '#b78d59', '#7d9299', '#987c68', '#a6aa96'];

  function $(id) { return document.getElementById(id); }

  function setCount(node, target) {
    if (!node) return;
    target = Number(target) || 0;
    node.textContent = target.toLocaleString();
  }

  function setStatus(txt, ok) {
    var s = $('gh-status');
    if (!s) return;
    s.textContent = txt;
    s.className = 'gh-status' + (ok ? ' ok' : '');
  }

  /* ---- Metrics ---- */
  function renderMetrics(user, repos) {
    var stars = repos.reduce(function (n, r) { return n + (r.stargazers_count || 0); }, 0);
    setCount($('gh-repos'), user.public_repos != null ? user.public_repos : repos.length);
    setCount($('gh-stars'), stars);
    setCount($('gh-followers'), user.followers || 0);
    setCount($('gh-following'), user.following || 0);
  }

  /* ---- Language bar ---- */
  function renderLangs(repos) {
    var bar = $('gh-lang-bar'), legend = $('gh-lang-legend');
    if (!bar || !legend) return;
    var counts = {};
    repos.forEach(function (r) {
      if (r.fork) return;
      if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
    });
    var entries = Object.keys(counts).map(function (k) { return [k, counts[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);

    if (!entries.length) {
      legend.textContent = 'Repository language data unavailable';
      return;
    }
    var total = entries.reduce(function (n, e) { return n + e[1]; }, 0);

    bar.innerHTML = '';
    legend.innerHTML = '';
    entries.forEach(function (e, i) {
      var pct = Math.round((e[1] / total) * 100);
      var color = LANG_COLORS[e[0]] || PALETTE[i % PALETTE.length];

      var seg = document.createElement('span');
      seg.className = 'gh-lang-seg';
      seg.style.background = color;
      seg.style.width = pct + '%';
      bar.appendChild(seg);

      var item = document.createElement('span');
      item.className = 'gh-lang-item';
      item.innerHTML = '<i style="background:' + color + '"></i>' + e[0] +
        ' <b>' + pct + '%</b>';
      legend.appendChild(item);
    });
  }

  /* ---- Query GitHub's contribution calendar through our server proxy ---- */
  function fetchContributions(days) {
    return fetch('/api/github-contributions?days=' + days)
      .then(function (r) {
        if (!r.ok) return Promise.reject('contributions');
        return r.json();
      });
  }

  /* ---- Contribution heatmap from GitHub's daily contribution counts ---- */
  function renderHeatmap(data) {
    var wrap = $('gh-heatmap');
    if (!wrap) return;

    var DAYS = 90;

    var byDay = {};
    (data && data.days || []).forEach(function (day) {
      if (day && day.date) byDay[day.date] = Number(day.contributionCount) || 0;
    });

    var today = new Date();
    // align grid end to today, walk back DAYS-1
    var cells = [];
    var max = 0, total = 0;
    for (var i = DAYS - 1; i >= 0; i--) {
      var dt = new Date(today);
      dt.setDate(today.getDate() - i);
      var key = dt.toISOString().slice(0, 10);
      var c = byDay[key] || 0;
      total += c;
      if (c > max) max = c;
      cells.push({ key: key, count: c, dow: dt.getDay() });
    }

    function level(c) {
      if (c <= 0) return 0;
      if (max <= 1) return c > 0 ? 3 : 0;
      var r = c / max;
      if (r > 0.66) return 4;
      if (r > 0.33) return 3;
      if (r > 0.10) return 2;
      return 1;
    }

    // Build columns (weeks). Pad leading days so first column aligns by weekday.
    var firstDow = cells[0].dow;
    var grid = document.createElement('div');
    grid.className = 'gh-hm-grid';

    var padded = [];
    for (var p = 0; p < firstDow; p++) padded.push(null);
    padded = padded.concat(cells);

    var col = null;
    padded.forEach(function (cell, idx) {
      if (idx % 7 === 0) {
        col = document.createElement('div');
        col.className = 'gh-hm-col';
        grid.appendChild(col);
      }
      var box = document.createElement('span');
      box.className = 'gh-hm-cell';
      if (cell) {
        var lv = level(cell.count);
        box.setAttribute('data-lv', lv);
        box.title = cell.count + ' event' + (cell.count === 1 ? '' : 's') + ' · ' + cell.key;
      } else {
        box.setAttribute('data-lv', 'empty');
      }
      col.appendChild(box);
    });

    wrap.innerHTML = '';
    wrap.appendChild(grid);

    var totalNode = $('gh-contrib-total');
    if (totalNode) totalNode.textContent = total + ' contributions in the last 90 days';
  }

  function showContributionsUnavailable() {
    var wrap = $('gh-heatmap');
    var totalNode = $('gh-contrib-total');
    if (wrap) wrap.textContent = 'Contribution data unavailable';
    if (totalNode) totalNode.textContent = '';
  }

  /* ---- Loader ---- */
  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;

    Promise.all([
      fetch(API + '/users/' + USER).then(function (r) { return r.ok ? r.json() : Promise.reject('user'); }),
      fetch(API + '/users/' + USER + '/repos?per_page=100&sort=updated')
        .then(function (r) { return r.ok ? r.json() : Promise.reject('repos'); })
    ]).then(function (res) {
      var user = res[0], repos = res[1] || [];

      fetchContributions(90).then(function (contributions) {
        renderMetrics(user, repos);
        renderLangs(repos);
        renderHeatmap(contributions);
        setStatus('\u25CF Live from GitHub', true);
      }).catch(function () {
        renderMetrics(user, repos);
        renderLangs(repos);
        showContributionsUnavailable();
        setStatus('Contribution data unavailable', false);
      });
    }).catch(function () {
      setStatus('GitHub profile data unavailable', false);
      var langs = $('gh-lang-legend');
      if (langs) langs.textContent = 'Repository data unavailable';
      showContributionsUnavailable();
    });
  }

  // Lazy-load when the stats section scrolls into view.
  var target = $('stats');
  if ('IntersectionObserver' in window && target) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { load(); io.disconnect(); }
      });
    }, { threshold: 0.15 });
    io.observe(target);
  } else {
    load();
  }
})();
