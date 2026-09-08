/* =========================================
   3D CARDS, SPHERE & INTERACTIONS
   - Physics tilt on stat/cert/exp cards
   - 3D skill sphere tag placement
   - Mobile flip toggle for project cards
   ========================================= */

(function () {
  'use strict';

  /* ================================================
     1. PHYSICS TILT — all .tilt-3d elements
  ================================================ */
  var TILT_MAX   = 16;   // degrees
  var TILT_GLARE = true;

  function initTilt(el) {
    // Wrap existing card in a perspective container if needed
    el.style.transformStyle = 'preserve-3d';

    // Inject shine layer if not present
    if (!el.querySelector('.tilt-shine')) {
      var shine = document.createElement('div');
      shine.className = 'tilt-shine';
      el.appendChild(shine);
    }

    var shine = el.querySelector('.tilt-shine');

    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var cx   = rect.left + rect.width  / 2;
      var cy   = rect.top  + rect.height / 2;
      var dx   = (e.clientX - cx) / (rect.width  / 2); // -1 to 1
      var dy   = (e.clientY - cy) / (rect.height / 2); // -1 to 1

      var rotX = -dy * TILT_MAX;
      var rotY =  dx * TILT_MAX;

      el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
      el.style.transform  = [
        'perspective(900px)',
        'rotateX(' + rotX + 'deg)',
        'rotateY(' + rotY + 'deg)',
        'translateZ(8px)',
        'scale(1.02)'
      ].join(' ');

      el.style.boxShadow = [
        '0 ' + (20 + Math.abs(dy) * 20) + 'px ' + (40 + Math.abs(dy) * 20) + 'px rgba(0,0,0,0.5)',
        '0 0 ' + (20 + Math.abs(dx) * 15) + 'px rgba(0,245,255,0.08)'
      ].join(', ');

      // Shine position
      if (shine) {
        var tx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        var ty = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        shine.style.setProperty('--tx', tx + '%');
        shine.style.setProperty('--ty', ty + '%');
        shine.style.opacity = '1';
      }
    });

    el.addEventListener('mouseleave', function () {
      el.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1), box-shadow 0.7s ease';
      el.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)';
      el.style.boxShadow  = '';
      if (shine) shine.style.opacity = '0';
    });

    el.addEventListener('mouseenter', function () {
      el.style.transition = 'transform 0.1s ease';
    });
  }

  /* Apply tilt to non-flip cards */
  document.querySelectorAll('.gh-card, .exp-card, .edu-card').forEach(initTilt);

  /* ================================================
     2. PROJECT CARD FLIP — mobile tap support
  ================================================ */
  document.querySelectorAll('.proj-card-3d').forEach(function (card) {
    // Add tap hint on mobile
    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      var hint = document.createElement('div');
      hint.textContent = '\u21ba Tap to flip';
      hint.style.cssText = [
        'position:absolute',
        'bottom:10px',
        'right:12px',
        'font-size:0.6rem',
        'color:rgba(0,255,65,0.6)',
        'font-family:"JetBrains Mono",monospace',
        'letter-spacing:1px',
        'pointer-events:none',
        'z-index:5',
      ].join(';');
      card.style.position = 'relative';
      card.appendChild(hint);
    }

    // Click always toggles flip — matchMedia(hover:none) is unreliable
    // on Android/Chrome so we removed it. CSS already prevents hover-flip
    // on mobile so desktop hover still works independently.
    card.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target.closest('a')) return;
      card.classList.toggle('flipped');
      var h = card.querySelector('div[style*="Tap to flip"]');
      if (h) h.style.display = 'none';
    });
  });

  /* ================================================
     3. CERT CARD FLIP — click/tap support (desktop + mobile)
  ================================================ */
  document.querySelectorAll('.cert-card-3d').forEach(function (card) {
    // Add tap hint badge on mobile
    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      var hint = document.createElement('div');
      hint.textContent = '↺ Tap to flip';
      hint.style.cssText = [
        'position:absolute',
        'bottom:10px',
        'right:12px',
        'font-size:0.6rem',
        'color:rgba(0,255,65,0.6)',
        'font-family:"JetBrains Mono",monospace',
        'letter-spacing:1px',
        'pointer-events:none',
        'z-index:5',
      ].join(';');
      card.style.position = 'relative';
      card.appendChild(hint);
    }

    // Toggle flip on click — works on both desktop and mobile.
    // matchMedia(hover:none) is unreliable on many Android browsers so we
    // always allow click; the CSS already disables the hover-flip on mobile.
    card.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target.closest('a')) return;
      card.classList.toggle('flipped');
      // Hide hint once user has flipped
      var h = card.querySelector('div[style*="Tap to flip"]');
      if (h) h.style.display = 'none';
    });
  });

  /* ================================================
     4. 3D SKILLS SPHERE — tag cloud
  ================================================ */
  var sphereEl = document.getElementById('skills-sphere');
  if (!sphereEl) return;

  var tags = [
    'Python', 'Java', 'SQL', 'HTML5', 'CSS3',
    'Wireshark', 'Nmap', 'Kali Linux', 'Cryptography', 'Network Sec',
    'LangChain', 'Streamlit', 'Flask', 'Scikit-learn', 'FAISS',
    'Git', 'Docker', 'Linux', 'PostgreSQL', 'REST APIs',
    'Hugging Face', 'John the Ripper', 'Suricata', 'MITRE ATT&CK',
  ];

  var n       = tags.length;
  var radius  = 130;  // px
  var tagEls  = [];
  var angles  = [];   // current {phi, theta} for each tag

  tags.forEach(function (label, i) {
    // Fibonacci sphere distribution
    var phi   = Math.acos(1 - 2 * (i + 0.5) / n);
    var theta = Math.PI * (1 + Math.sqrt(5)) * i;

    angles.push({ phi: phi, theta: theta });

    var span = document.createElement('span');
    span.className  = 'sphere-tag';
    span.textContent = label;
    sphereEl.appendChild(span);
    tagEls.push(span);
  });

  /* Position tags in 3D space using CSS transforms */
  function positionTags(extraRotY, extraRotX) {
    var ry = (extraRotY || 0);
    var rx = (extraRotX || 0);

    tagEls.forEach(function (el, i) {
      var phi   = angles[i].phi;
      var theta = angles[i].theta + ry;

      var x = radius * Math.sin(phi) * Math.cos(theta);
      var y = radius * Math.cos(phi) + rx * 60;
      var z = radius * Math.sin(phi) * Math.sin(theta);

      // Classify depth for styling
      el.classList.remove('side-front', 'side-mid', 'side-back');
      if (z > 40)       el.classList.add('side-front');
      else if (z > -40) el.classList.add('side-mid');
      else              el.classList.add('side-back');

      var scale = (z + radius + 60) / (2 * radius + 60);
      el.style.transform = [
        'translate(-50%, -50%)',
        'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px)',
        'scale(' + scale.toFixed(3) + ')'
      ].join(' ');
    });
  }

  // Animate sphere rotation
  var rotY = 0;
  var rotX = 0;
  var targetRotY = 0;
  var targetRotX = 0;
  var isDragging = false;
  var lastMX = 0;
  var lastMY = 0;

  // Mouse drag on sphere
  sphereEl.addEventListener('mousedown', function (e) {
    isDragging = true;
    lastMX = e.clientX;
    lastMY = e.clientY;
    sphereEl.style.animationPlayState = 'paused';
  });

  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dX = (e.clientX - lastMX) * 0.005;
    var dY = (e.clientY - lastMY) * 0.005;
    rotY += dX;
    rotX += dY;
    lastMX = e.clientX;
    lastMY = e.clientY;
    positionTags(rotY, rotX);
  });

  window.addEventListener('mouseup', function () {
    isDragging = false;
    sphereEl.style.animationPlayState = '';
  });

  // Auto-rotation tick (synced with CSS animation)
  var autoStartTime = Date.now();
  var AUTO_SPEED = (2 * Math.PI) / 28000; // 28 s full rotation

  function autoRotate() {
    if (isDragging) { requestAnimationFrame(autoRotate); return; }
    var elapsed  = Date.now() - autoStartTime;
    var autoRotY = elapsed * AUTO_SPEED;
    positionTags(autoRotY + rotY, rotX + 0.26); // +0.26 rad = 15° tilt
    requestAnimationFrame(autoRotate);
  }

  autoRotate();

  /* ================================================
     5. HERO AVATAR 3D MOUSE PARALLAX
  ================================================ */
  var avatarInner = document.querySelector('.avatar-inner');
  if (avatarInner) {
    document.addEventListener('mousemove', function (e) {
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;
      avatarInner.style.transform = [
        'perspective(600px)',
        'rotateY(' + (dx * 12) + 'deg)',
        'rotateX(' + (-dy * 10) + 'deg)',
        'translateZ(10px)'
      ].join(' ');
      avatarInner.style.transition = 'transform 0.15s ease';
    });
  }

  /* ================================================
     6. SECTION HEADER 3D text class injection
  ================================================ */
  document.querySelectorAll('.sec-title').forEach(function (el) {
    el.classList.add('text-3d');
  });

})();
