/* =========================================
   LOADING SCREEN
   Matrix canvas + terminal boot sequence
   ========================================= */

(function () {
  'use strict';

  var loader   = document.getElementById('loader');
  var canvas   = document.getElementById('loader-matrix');
  var barEl    = document.getElementById('loader-bar');
  var pctEl    = document.getElementById('loader-pct');
  var linesEl  = document.getElementById('terminal-lines');

  if (!loader) return;

  /* ---- Matrix canvas ---- */
  var ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var cols  = Math.floor(canvas.width / 18);
  var drops = Array.from({ length: cols }, function () { return Math.random() * -100; });
  var chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ><{}[]#@%&*+=-_';

  function drawMatrix() {
    ctx.fillStyle = 'rgba(2,5,9,0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f5ff';
    ctx.font = '14px monospace';

    for (var i = 0; i < drops.length; i++) {
      var ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * 18, drops[i] * 18);
      if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.55;
    }
  }

  var matrixTimer = setInterval(drawMatrix, 40);

  /* ---- Terminal messages ---- */
  var messages = [
    { text: '<span class="prefix">&gt;</span> Initializing system<span class="cyan">...</span>',          delay: 0   },
    { text: '<span class="prefix">&gt;</span> Loading kernel modules<span class="ok">[OK]</span>',        delay: 380 },
    { text: '<span class="prefix">&gt;</span> Mounting file system<span class="ok">[OK]</span>',          delay: 650 },
    { text: '<span class="prefix">&gt;</span> Starting network stack<span class="ok">[OK]</span>',        delay: 900 },
    { text: '<span class="prefix">&gt;</span> Injecting cipher suite<span class="warn">[WARN]</span>',    delay: 1100 },
    { text: '<span class="prefix">&gt;</span> Bypassing firewall<span class="ok">[OK]</span>',            delay: 1350 },
    { text: '<span class="prefix">&gt;</span> Portfolio assets<span class="ok">[LOADED]</span>',          delay: 1580 },
    { text: '<span class="prefix">&gt;</span> <span class="cyan">Welcome, Priyanshu Kumar.</span>',        delay: 1820 },
  ];

  messages.forEach(function (msg) {
    setTimeout(function () {
      var line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = msg.text;
      linesEl.appendChild(line);
      requestAnimationFrame(function () {
        setTimeout(function () { line.classList.add('visible'); }, 10);
      });
    }, msg.delay);
  });

  /* ---- Progress bar ---- */
  var startTime = Date.now();
  var totalDuration = 2600; // ms

  function updateProgress() {
    var elapsed  = Date.now() - startTime;
    var progress = Math.min(elapsed / totalDuration, 1);
    // Ease-out
    var eased = 1 - Math.pow(1 - progress, 3);
    var pct   = Math.round(eased * 100);

    if (barEl)  barEl.style.width = pct + '%';
    if (pctEl)  pctEl.textContent = pct + '%';

    if (progress < 1) {
      requestAnimationFrame(updateProgress);
    } else {
      // Slight hold then exit
      setTimeout(exitLoader, 320);
    }
  }

  requestAnimationFrame(updateProgress);

  /* ---- Exit ---- */
  function exitLoader() {
    clearInterval(matrixTimer);
    loader.classList.add('fade-out');
    loader.addEventListener('transitionend', function () {
      loader.style.display = 'none';
      document.body.style.overflow = '';
    }, { once: true });
  }

  /* Prevent scroll while loading */
  document.body.style.overflow = 'hidden';

  /* Resize canvas */
  window.addEventListener('resize', function () {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / 18);
    drops = Array.from({ length: cols }, function () { return Math.random() * -100; });
  });

})();
