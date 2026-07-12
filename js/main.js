/**
 * main.js
 * Core UI interactions:
 *  - Cursor glow that follows the mouse
 *  - Navbar shrink + active link highlighting on scroll
 *  - Hamburger mobile menu toggle
 *  - Scroll-reveal using IntersectionObserver
 *  - Skill tag shimmer animation on section enter
 *  - Smooth stagger for project cards and cert cards
 */

(function () {
  'use strict';

  /* ========================================
     1. CURSOR GLOW
  ======================================== */
  const glow = document.getElementById('cursor-glow');

  if (glow) {
    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });

    // Hide glow when cursor leaves window
    document.addEventListener('mouseleave', function () {
      glow.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      glow.style.opacity = '1';
    });
  }

  /* ========================================
     2. NAVBAR — shrink on scroll + active link
  ======================================== */
  const navbar   = document.getElementById('navbar');
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

  function updateNavbar() {
    // Shrink
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }

    // Active link
    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 150) {
        current = sec.id;
      }
    });

    navLinks.forEach(function (a) {
      const target = a.getAttribute('href').replace('#', '');
      a.classList.toggle('active', target === current);
    });
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run once on load

  /* ========================================
     3. MOBILE MENU
  ======================================== */
  const menuBtn    = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      // Prevent body scroll when menu is open
      document.body.style.overflow =
        mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Close mobile menu when a link is tapped
  window.closeMobileMenu = function () {
    if (menuBtn)    menuBtn.classList.remove('open');
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ========================================
     4. SCROLL REVEAL (IntersectionObserver)
  ======================================== */
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right'
  );

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // Stagger siblings slightly
          var delay = 0;
          var parent = entry.target.parentElement;
          if (parent) {
            var siblings = Array.from(
              parent.querySelectorAll('.reveal, .reveal-left, .reveal-right')
            );
            var idx = siblings.indexOf(entry.target);
            delay = idx * 90;
          }
          setTimeout(function () {
            entry.target.classList.add('up');
          }, delay);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ========================================
     5. SKILL TAG SHIMMER
     Adds a shimmer class briefly when the
     skills section scrolls into view.
  ======================================== */
  var skillSection = document.getElementById('about');

  if (skillSection) {
    var shimmerDone = false;

    var shimmerObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && !shimmerDone) {
          shimmerDone = true;
          var tags = document.querySelectorAll('.skill-tag');
          tags.forEach(function (tag, i) {
            setTimeout(function () {
              tag.classList.add('shimmer');
              setTimeout(function () {
                tag.classList.remove('shimmer');
              }, 1800);
            }, i * 50);
          });
        }
      },
      { threshold: 0.2 }
    );

    shimmerObserver.observe(skillSection);
  }

  /* ========================================
     6. CERT CARD — open PDF on click
  ======================================== */
  document.querySelectorAll('.cert-card[data-pdf]').forEach(function (card) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function (e) {
      // Don't intercept clicks on the download anchor itself
      if (e.target.closest('a')) return;
      var pdf = card.getAttribute('data-pdf');
      if (pdf) window.open(pdf, '_blank');
    });
  });

  /* ========================================
     7. SMOOTH SCROLL for anchor links
  ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id  = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var offset = navbar ? navbar.offsetHeight + 16 : 80;
        var top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ========================================
     8. ACTIVE NAV on page load (hash)
  ======================================== */
  if (window.location.hash) {
    var id = window.location.hash.slice(1);
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

})();
