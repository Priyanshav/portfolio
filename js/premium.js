/* =========================================
   PREMIUM INTERACTIONS
   - Text scramble, spotlight cards, magnetic btns,
     ripple, parallax, timeline, counters, footer
   ========================================= */

(function () {
  'use strict';

  /* ================================================
     1. TEXT SCRAMBLE for section titles
  ================================================ */
  var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  function scrambleText(el) {
    var original = el.dataset.original || el.textContent;
    el.dataset.original = original;
    var iteration = 0;
    var maxIter   = original.length * 3;
    var intervalId = setInterval(function () {
      el.textContent = original
        .split('')
        .map(function (ch, idx) {
          if (idx < Math.floor(iteration / 3)) return original[idx];
          if (ch === ' ') return ' ';
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');
      iteration++;
      if (iteration > maxIter) clearInterval(intervalId);
    }, 28);
  }

  /* Observe section titles */
  var titleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        scrambleText(entry.target);
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.sec-title').forEach(function (el) {
    titleObserver.observe(el);
  });

  /* ================================================
     2. SPOTLIGHT on project cards
  ================================================ */
  document.querySelectorAll('.proj-card').forEach(function (card) {
    // Inject spotlight div
    var spot = document.createElement('div');
    spot.className = 'spotlight';
    card.appendChild(spot);

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      var y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ================================================
     3. MAGNETIC BUTTONS
  ================================================ */
  function applyMagnetic(el) {
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var cx   = rect.left + rect.width  / 2;
      var cy   = rect.top  + rect.height / 2;
      var dx   = (e.clientX - cx) * 0.28;
      var dy   = (e.clientY - cy) * 0.28;
      el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
      el.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
      setTimeout(function () { el.style.transition = ''; }, 600);
    });
  }

  document.querySelectorAll('.btn-primary, .btn-outline, .btn-resume').forEach(applyMagnetic);

  /* ================================================
     4. RIPPLE on contact cards
  ================================================ */
  document.querySelectorAll('.contact-card').forEach(function (card) {
    card.classList.add('ripple-host');
    card.addEventListener('click', function (e) {
      var rect = card.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2;
      var x    = e.clientX - rect.left  - size / 2;
      var y    = e.clientY - rect.top   - size / 2;
      var rip  = document.createElement('span');
      rip.className = 'ripple-circle';
      rip.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;';
      card.appendChild(rip);
      rip.addEventListener('animationend', function () { rip.remove(); });
    });
  });

  /* ================================================
     5. PARALLAX on hero section
  ================================================ */
  var heroText   = document.querySelector('.hero-text');
  var heroVisual = document.querySelector('.hero-visual');

  if (heroText && heroVisual) {
    document.addEventListener('mousemove', function (e) {
      var cx  = window.innerWidth  / 2;
      var cy  = window.innerHeight / 2;
      var dx  = (e.clientX - cx) / cx;
      var dy  = (e.clientY - cy) / cy;

      heroText.style.transform   = 'translate(' + dx * 8  + 'px,' + dy * 5  + 'px)';
      heroVisual.style.transform = 'translate(' + dx * -10 + 'px,' + dy * -6 + 'px)';
    });
  }

  /* ================================================
     6. SCROLL PROGRESS BAR
  ================================================ */
  var progressEl = document.getElementById('scroll-progress');

  if (progressEl) {
    function updateProgress() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var pct = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      progressEl.style.transform = 'scaleX(' + pct + ')';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  /* ================================================
     7. ANIMATED COUNTER (hero + gh stats)
  ================================================ */
  function animateCounter(el, target, duration, suffix) {
    var start     = 0;
    var startTime = null;
    var isFloat   = String(target).indexOf('.') !== -1;
    var decimals  = isFloat ? (String(target).split('.')[1] || '').length : 0;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // ease-out-cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var val   = eased * target;
      el.textContent = (isFloat ? val.toFixed(decimals) : Math.floor(val)) + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el     = entry.target;
      var target = parseFloat(el.dataset.target);
      var suffix = el.dataset.suffix || '';
      if (!isNaN(target)) {
        animateCounter(el, target, 1600, suffix);
      }
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ================================================
     8. EXPERIENCE TIMELINE animation
  ================================================ */
  var expWrap = document.querySelector('.exp-wrap');
  if (expWrap) {
    expWrap.classList.add('exp-timeline');

    var dot = document.createElement('div');
    dot.className = 'exp-dot';
    expWrap.appendChild(dot);

    var tlObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        expWrap.classList.add('in-view');
        tlObserver.disconnect();
      }
    }, { threshold: 0.2 });
    tlObserver.observe(expWrap);
  }

  /* ================================================
     9. FOOTER in-view
  ================================================ */
  var footerEl = document.querySelector('footer');
  if (footerEl) {
    var footObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        footerEl.classList.add('in-view');
        footObserver.disconnect();
      }
    }, { threshold: 0.4 });
    footObserver.observe(footerEl);
  }

  /* ================================================
     10. TILT on cert cards (vanilla tilt)
  ================================================ */
  document.querySelectorAll('.cert-card, .gh-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var cx   = rect.left + rect.width  / 2;
      var cy   = rect.top  + rect.height / 2;
      var rx   = (e.clientY - cy) / (rect.height / 2);
      var ry   = (e.clientX - cx) / (rect.width  / 2);
      card.style.transform = 'perspective(800px) rotateX(' + (-rx * 5) + 'deg) rotateY(' + (ry * 5) + 'deg) translateY(-6px)';
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1)';
    });
  });

  /* ================================================
     11. HEATMAP CELL TOOLTIP
  ================================================ */
  function addTooltip(cell) {
    var tip = document.createElement('div');
    tip.style.cssText = [
      'position:absolute',
      'bottom:calc(100% + 6px)',
      'left:50%',
      'transform:translateX(-50%)',
      'background:rgba(0,245,255,0.12)',
      'border:1px solid rgba(0,245,255,0.3)',
      'color:#e2e8f0',
      'font-family:monospace',
      'font-size:0.6rem',
      'padding:4px 8px',
      'border-radius:5px',
      'white-space:nowrap',
      'pointer-events:none',
      'z-index:10',
      'opacity:0',
      'transition:opacity 0.15s',
    ].join(';');
    tip.textContent = cell.title || '';
    cell.style.position = 'relative';
    cell.appendChild(tip);

    cell.addEventListener('mouseenter', function () { tip.style.opacity = '1'; });
    cell.addEventListener('mouseleave', function () { tip.style.opacity = '0'; });
  }

  // Apply after github.js populates heatmap (delay)
  setTimeout(function () {
    document.querySelectorAll('.gh-hm-cell[title]').forEach(addTooltip);
  }, 3000);

  /* ================================================
     12. MARQUEE pause on hover item
  ================================================ */
  document.querySelectorAll('.marquee-item').forEach(function (item) {
    item.addEventListener('mouseenter', function () {
      var track = item.closest('.marquee-track');
      if (track) track.style.animationPlayState = 'paused';
    });
    item.addEventListener('mouseleave', function () {
      var track = item.closest('.marquee-track');
      if (track) track.style.animationPlayState = '';
    });
  });

  /* ================================================
     13. AVATAR orbit icons
  ================================================ */
  var avatarRing = document.querySelector('.avatar-ring');
  if (avatarRing) {
    var orbitContainer = document.createElement('div');
    orbitContainer.className = 'avatar-orbit';

    /* Tech logos from devicons / simpleicons CDN */
    var orbitIcons = [
      { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',         label: 'Python',     dur: 18, delay: 0,    r: 152 },
      { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',          label: 'Docker',     dur: 22, delay: -4,   r: 152 },
      { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg',     label: 'Kubernetes', dur: 20, delay: -8,   r: 152 },
      { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',               label: 'Git',        dur: 16, delay: -12,  r: 152 },
      { src: 'https://cdn.simpleicons.org/kalilinux/557C94',                                                  label: 'Kali',       dur: 24, delay: -16,  r: 152 },
      { src: 'https://cdn.simpleicons.org/wireshark/1679A7',                                                  label: 'Wireshark',  dur: 19, delay: -20,  r: 152 },
      { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',           label: 'MySQL',      dur: 21, delay: -24,  r: 152 },
      { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',             label: 'Java',       dur: 17, delay: -28,  r: 152 },
      { src: 'https://cdn.simpleicons.org/langchain/00ff41',                                                  label: 'LangChain',  dur: 23, delay: -32,  r: 152 },
      { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg',           label: 'Linux',      dur: 15, delay: -36,  r: 152 },
    ];

    orbitIcons.forEach(function (o) {
      var span = document.createElement('span');
      span.className = 'orbit-icon orbit-icon--img';
      var img = document.createElement('img');
      img.src   = o.src;
      img.alt   = o.label;
      img.width = 26;
      img.height= 26;
      img.draggable = false;
      span.appendChild(img);
      span.style.cssText = [
        '--dur:'   + o.dur   + 's',
        '--delay:' + o.delay + 's',
        '--r:'     + o.r     + 'px',
        'top:50%',
        'left:50%',
        'margin-top:-14px',
        'margin-left:-14px',
      ].join(';');
      orbitContainer.appendChild(span);
    });

    avatarRing.appendChild(orbitContainer);
  }

  /* ================================================
     14. SECTION head clip-path observer override
         sec-head uses clip-path reveal, not opacity
  ================================================ */
  // sec-head already gets .up from main.js IntersectionObserver
  // The clip-path transition is handled purely in CSS premium.css

  /* ================================================
     15. GLOW RING on scroll past hero
  ================================================ */
  var avatarInner = document.querySelector('.avatar-inner');
  if (avatarInner) {
    window.addEventListener('scroll', function () {
      var intensity = Math.min(window.scrollY / 400, 1);
      avatarInner.style.boxShadow = '0 0 ' + Math.round(intensity * 40) + 'px rgba(0,245,255,' + (intensity * 0.4) + ')';
    }, { passive: true });
  }

  /* ================================================
     16. SKILL TAG stagger spring entrance
  ================================================ */
  var skillsObserver = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.skill-tag').forEach(function (tag, i) {
      tag.style.opacity    = '0';
      tag.style.transform  = 'translateY(10px) scale(0.95)';
      setTimeout(function () {
        tag.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        tag.style.opacity    = '';
        tag.style.transform  = '';
      }, i * 40);
    });
    skillsObserver.disconnect();
  }, { threshold: 0.25 });

  var skillSection = document.getElementById('about');
  if (skillSection) skillsObserver.observe(skillSection);

})();
