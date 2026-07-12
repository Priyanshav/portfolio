/**
 * enhance.js
 * Extra motion & polish:
 *  - Scroll progress bar
 *  - Magnetic buttons
 *  - 3D tilt on [data-tilt] cards
 *  - Animated hero stat counters
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* ---- Scroll progress bar ---- */
  var bar = document.getElementById('scroll-progress');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Magnetic buttons ---- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var strength = 0.35;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + mx * strength + 'px,' + my * strength + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---- 3D tilt ---- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var MAX = 7;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * MAX * 2;
        var ry = (px - 0.5) * MAX * 2;
        card.style.transform =
          'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---- Hero stat counters ---- */
  function animateStat(node) {
    var raw = node.getAttribute('data-target');
    var suffix = node.getAttribute('data-suffix') || '';
    var decimals = raw.indexOf('.') > -1 ? (raw.split('.')[1].length) : 0;
    var target = parseFloat(raw);
    if (reduce) { node.textContent = target.toFixed(decimals) + suffix; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = (eased * target).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  var heroStats = document.querySelectorAll('.h-stat .num[data-target]');
  if (heroStats.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateStat(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    heroStats.forEach(function (n) { io.observe(n); });
  } else {
    heroStats.forEach(animateStat);
  }
})();
