/**
 * cyber.js
 * Matrix-style digital rain confined to the Experience section canvas.
 * Runs only while the section is on screen (IntersectionObserver) and
 * fully respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('cyberCanvas');
  if (!canvas) return;

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var ctx = canvas.getContext('2d');
  var section = canvas.closest('section') || canvas.parentElement;
  var chars = '01<>[]{}#$%&*+=/\\|_ｱｷｼﾂﾅﾊﾐﾑﾒﾓ01'.split('');
  var fontSize = 14;
  var drops = [];

  function resize() {
    var w = section.offsetWidth;
    var h = section.offsetHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    var cols = Math.max(1, Math.floor(w / fontSize));
    drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -60;
  }

  var running = false;
  var raf = null;

  function draw() {
    ctx.fillStyle = 'rgba(5, 8, 16, 0.09)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px monospace';
    for (var i = 0; i < drops.length; i++) {
      var text = chars[Math.floor(Math.random() * chars.length)];
      var x = i * fontSize;
      var y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.972
        ? 'rgba(168, 85, 247, 0.95)'
        : 'rgba(0, 245, 255, 0.55)';
      ctx.fillText(text, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    raf = window.requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    if (!canvas.width) resize();
    draw();
  }
  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
  }

  window.addEventListener('resize', function () {
    resize();
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0.04 });
    io.observe(section);
  } else {
    resize();
    start();
  }
})();
