/**
 * github.js
 * Live GitHub "progress" card.
 *  - Fetches real profile + repo data from the public GitHub REST API
 *  - Animated metric counters (repos, stars, followers, following)
 *  - Top-language distribution bar built from the user's repositories
 *  - Contribution-style heatmap built from recent public activity
 *  - Graceful fallback when the API is rate-limited or offline
 */
(function () {
  'use strict';

  var USER = 'Priyanshav';
  var API = 'https://api.github.com';

  // Sensible fallback if the API is unreachable / rate-limited.
  var FALLBACK = { repos: 12, stars: 0, followers: 5, following: 8 };

  var LANG_COLORS = {
    Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6',
    Java: '#b07219', HTML: '#e34c26', CSS: '#563d7c', Jupyter: '#DA5B0B',
    'Jupyter Notebook': '#DA5B0B', Shell: '#89e051', C: '#555555',
    'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584', Dockerfile: '#384d54',
    PHP: '#4F5D95', Ruby: '#701516', 'C#': '#178600'
  };
  var PALETTE = ['#00f5ff', '#a855f7', '#f472b6', '#fb923c', '#39ff14', '#63dbdb'];

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(id) { return document.getElementById(id); }

  /* ---- Animated counter ---- */
  function animateCount(node, target) {
    if (!node) return;
    target = Number(target) || 0;
    if (prefersReduced) { node.textContent = target; return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
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
    animateCount($('gh-repos'), user.public_repos != null ? user.public_repos : repos.length);
    animateCount($('gh-stars'), stars);
    animateCount($('gh-followers'), user.followers || 0);
    animateCount($('gh-following'), user.following || 0);
  }

  function renderMetricsFallback() {
    animateCount($('gh-repos'), FALLBACK.repos);
    animateCount($('gh-stars'), FALLBACK.stars);
    animateCount($('gh-followers'), FALLBACK.followers);
    animateCount($('gh-following'), FALLBACK.following);
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
      // Fallback languages representative of the profile.
      entries = [['Python', 6], ['Jupyter Notebook', 3], ['JavaScript', 2], ['HTML', 2], ['CSS', 1]];
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
      seg.style.width = '0%';
      bar.appendChild(seg);
      // trigger transition
      requestAnimationFrame(function () {
        setTimeout(function () { seg.style.width = pct + '%'; }, 120 + i * 90);
      });

      var item = document.createElement('span');
      item.className = 'gh-lang-item';
      item.innerHTML = '<i style="background:' + color + '"></i>' + e[0] +
        ' <b>' + pct + '%</b>';
      legend.appendChild(item);
    });
  }

  /* ---- Contribution heatmap from recent public events ---- */
  function renderHeatmap(events) {
    var wrap = $('gh-heatmap');
    if (!wrap) return;
    var WEEKS = 14, DAYS = WEEKS * 7;

    // Bucket events by YYYY-MM-DD
    var byDay = {};
    (events || []).forEach(function (ev) {
      if (!ev.created_at) return;
      var d = ev.created_at.slice(0, 10);
      byDay[d] = (byDay[d] || 0) + 1;
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
        if (!prefersReduced) {
          box.style.opacity = '0';
          box.style.transform = 'scale(.3)';
          setTimeout(function () {
            box.style.opacity = '1';
            box.style.transform = 'scale(1)';
          }, 200 + idx * 4);
        }
      } else {
        box.setAttribute('data-lv', 'empty');
      }
      col.appendChild(box);
    });

    wrap.innerHTML = '';
    wrap.appendChild(grid);

    var totalNode = $('gh-contrib-total');
    if (totalNode) totalNode.textContent = total + ' events · 90 days';
  }

  /* ---- Loader ---- */
  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;

    Promise.all([
      fetch(API + '/users/' + USER).then(function (r) { return r.ok ? r.json() : Promise.reject('user'); }),
      fetch(API + '/users/' + USER + '/repos?per_page=100&sort=updated')
        .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }),
      fetch(API + '/users/' + USER + '/events/public?per_page=100')
        .then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    ]).then(function (res) {
      var user = res[0], repos = res[1] || [], events = res[2] || [];
      renderMetrics(user, repos);
      renderLangs(repos);
      renderHeatmap(events);
      setStatus('\u25CF Live from GitHub', true);
    }).catch(function () {
      renderMetricsFallback();
      renderLangs([]);
      renderHeatmap([]);
      setStatus('Showing saved stats (API unavailable)', false);
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
