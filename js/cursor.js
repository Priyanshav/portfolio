/**
 * cursor.js
 * Animated custom cursor: a bright dot that tracks the pointer exactly plus a
 * trailing ring that eases behind it and reacts to interactive elements.
 * Only activates on devices with a fine pointer (mouse/trackpad); touch
 * devices keep their native behaviour.
 */
(function () {
  'use strict';

  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!fine) return;

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.documentElement.classList.add('custom-cursor');

  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var rx = mx, ry = my;
  var visible = false;

  function place(el, x, y) {
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    place(dot, mx, my);
    if (reduce) place(ring, mx, my);
    if (!visible) {
      visible = true;
      dot.style.opacity = ring.style.opacity = '1';
    }
  });

  if (!reduce) {
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      place(ring, rx, ry);
      requestAnimationFrame(loop);
    })();
  }

  var interactive = 'a, button, input, textarea, select, label, [data-tilt], ' +
    '.btn-primary, .btn-secondary, .cert-btn, .proj-card, .exp-card, .nav-links a, .social-link';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(interactive)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(interactive)) ring.classList.remove('is-hover');
  });
  document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
  document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity = ring.style.opacity = '0';
    visible = false;
  });
})();
