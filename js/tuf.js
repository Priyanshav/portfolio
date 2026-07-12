/**
 * tuf.js
 * Live TakeUForward DSA stats card.
 * Fetches the public (no-auth) TUF profile API and falls back to a saved
 * snapshot if the request is blocked (CORS) or offline. Loads lazily when
 * the Stats section scrolls into view.
 *
 * API: https://backend-go.takeuforward.org/api/v1/shared/profile/dsa-progress/{user}
 * Shape: { data: { data: { solvedEasy, solvedMedium, solvedHard, totalSolved } } }
 */
(function () {
  'use strict';

  var USER = 'Priyanshav';
  var API = 'https://backend-go.takeuforward.org/api/v1/shared/profile/dsa-progress/' + USER;

  /* Saved snapshot — used if the live API is unreachable/CORS-blocked. */
  var FALLBACK = { solvedEasy: 97, solvedMedium: 26, solvedHard: 8 };

  /* TUF catalogue sizes (denominators shown on the profile page). */
  var TOTALS = { easy: 374, medium: 477, hard: 253 };

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var section = document.getElementById('stats');
  var totalEl = document.getElementById('tuf-total');
  if (!totalEl) return;

  function animateCount(el, to) {
    if (reduce || to <= 0) { el.textContent = to; return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * to);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setRow(diff, solved) {
    var countEl = document.getElementById('tuf-' + diff);
    var barEl = document.getElementById('tuf-' + diff + '-bar');
    var total = TOTALS[diff];
    if (countEl) {
      countEl.innerHTML = '<b>' + solved + '</b> <span class="den">/ ' + total + '</span>';
    }
    if (barEl) {
      var pct = Math.max(4, Math.min(100, Math.round((solved / total) * 100)));
      // defer so the width transition animates from 0
      requestAnimationFrame(function () {
        setTimeout(function () { barEl.style.width = pct + '%'; }, 60);
      });
    }
  }

  function render(stats, live) {
    var e = stats.solvedEasy || 0;
    var m = stats.solvedMedium || 0;
    var h = stats.solvedHard || 0;
    animateCount(totalEl, e + m + h);
    setRow('easy', e);
    setRow('medium', m);
    setRow('hard', h);
    var status = document.getElementById('tuf-status');
    if (status) {
      status.innerHTML = live
        ? '<span class="live-dot"></span> Live from TakeUForward'
        : '<span class="live-dot"></span> Latest snapshot';
    }
  }

  function load() {
    var done = false;
    function fallback() { if (!done) { done = true; render(FALLBACK, false); } }
    // Guard against a hanging request.
    var timer = setTimeout(fallback, 6000);
    try {
      fetch(API, { headers: { 'accept': 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (j) {
          var d = j && j.data && j.data.data;
          if (!d) return Promise.reject();
          clearTimeout(timer);
          if (!done) {
            done = true;
            render({
              solvedEasy: d.solvedEasy,
              solvedMedium: d.solvedMedium,
              solvedHard: d.solvedHard
            }, true);
          }
        })
        .catch(function () { clearTimeout(timer); fallback(); });
    } catch (err) {
      clearTimeout(timer);
      fallback();
    }
  }

  var started = false;
  function trigger() { if (started) return; started = true; load(); }

  if (section && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { trigger(); io.disconnect(); }
      });
    }, { threshold: 0.1 });
    io.observe(section);
  } else {
    trigger();
  }
})();
