/**
 * main.js
 * Core UI interactions:
 *  - Navbar shrink + active link highlighting on scroll
 *  - Hamburger mobile menu toggle
 *  - Motion-aware scroll reveals for page sections and cards
 */

(function () {
  'use strict';

  /* ========================================
     1. NAVBAR — shrink on scroll + active link
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
     2. MOBILE MENU
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
     3. SCROLL REVEALS
  ======================================== */
  const revealSelector = '.reveal, .reveal-left, .reveal-right, .skill-group';
  const motionTargets = Array.from(document.querySelectorAll(revealSelector));
  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion && motionTargets.length) {
    motionTargets.forEach(function (target) {
      target.classList.add('motion-target');

      const parent = target.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(function (sibling) {
          return sibling.matches(revealSelector);
        });
        const index = siblings.indexOf(target);
        target.style.setProperty('--motion-delay', Math.min(index * 90, 450) + 'ms');
      }
    });

    document.body.classList.add('motion-ready');

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    motionTargets.forEach(function (target) {
      revealObserver.observe(target);
    });
  }

  /* ========================================
     4. SKILLS ORBIT
  ======================================== */
  const skillsOrbit = document.getElementById('skills-orbit');

  if (skillsOrbit) {
    const orbitTracks = Array.from(
      skillsOrbit.querySelectorAll('.skills-orbit-track')
    );
    const orbitStart = performance.now();
    let orbitFrame = 0;

    function positionOrbitSkills(now) {
      const elapsed = reduceMotion ? 0 : (now - orbitStart) / 1000;

      orbitTracks.forEach(function (track, trackIndex) {
        const tags = Array.from(track.querySelectorAll('.skills-orbit-tag'));
        const speed = Number(track.dataset.orbitSpeed) || 0;
        const phaseOffset = trackIndex * 0.24;

        tags.forEach(function (tag, index) {
          const angle =
            (Math.PI * 2 * index) / tags.length +
            phaseOffset +
            elapsed * speed;
          const x = Math.cos(angle) * (track.clientWidth / 2);
          const y = Math.sin(angle) * (track.clientHeight / 2);

          tag.style.left = 'calc(50% + ' + x.toFixed(2) + 'px)';
          tag.style.top = 'calc(50% + ' + y.toFixed(2) + 'px)';
        });
      });

      if (!reduceMotion && !document.hidden) {
        orbitFrame = window.requestAnimationFrame(positionOrbitSkills);
      }
    }

    positionOrbitSkills(orbitStart);
    window.addEventListener('resize', function () {
      positionOrbitSkills(reduceMotion ? orbitStart : performance.now());
    }, { passive: true });

    if (!reduceMotion) {
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          window.cancelAnimationFrame(orbitFrame);
          orbitFrame = 0;
        } else if (!orbitFrame) {
          orbitFrame = window.requestAnimationFrame(positionOrbitSkills);
        }
      });
    }
  }

  /* ========================================
     5. PROJECT CARD FLIPS
  ======================================== */
  document.querySelectorAll('.proj-card-3d').forEach(function (card) {
    const front = card.querySelector('.proj-card-front');
    const back = card.querySelector('.proj-card-back');
    const controls = Array.from(card.querySelectorAll('.project-flip-button'));
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!front || !back || controls.length < 2) return;

    let pointerInside = false;

    function setFlipped(flipped, moveFocus) {
      card.classList.toggle('flipped', flipped);
      front.setAttribute('aria-hidden', String(flipped));
      back.setAttribute('aria-hidden', String(!flipped));
      front.inert = flipped;
      back.inert = !flipped;
      controls.forEach(function (control) {
        control.setAttribute('aria-expanded', String(flipped));
      });

      if (moveFocus) {
        const nextControl = card.querySelector(
          flipped ? '.project-flip-button--back' : '.proj-card-front .project-flip-button'
        );
        if (nextControl) nextControl.focus();
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('click', function () {
        setFlipped(!control.classList.contains('project-flip-button--back'), true);
      });
    });

    if (canHover) {
      card.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'touch') return;
        pointerInside = true;
        if (!card.matches(':focus-within')) setFlipped(true, false);
      });

      card.addEventListener('pointerleave', function (event) {
        if (event.pointerType === 'touch') return;
        pointerInside = false;
        if (!card.matches(':focus-within')) setFlipped(false, false);
      });

      card.addEventListener('focusout', function () {
        window.setTimeout(function () {
          if (!pointerInside && !card.contains(document.activeElement)) {
            setFlipped(false, false);
          }
        }, 0);
      });
    }

    setFlipped(false, false);
  });

  /* ========================================
     6. CERTIFICATE BOOK
  ======================================== */
  const certificateBook = document.getElementById('certificate-book');
  const bookCover = document.getElementById('book-cover');
  const bookInterior = document.getElementById('book-interior');
  const bookPrevious = document.getElementById('book-previous');
  const bookNext = document.getElementById('book-next');
  const bookClose = document.getElementById('book-close');
  const bookPageCount = document.getElementById('book-page-count');
  const bookCoverCount = document.getElementById('book-cover-count');

  if (
    certificateBook &&
    bookCover &&
    bookInterior &&
    bookPrevious &&
    bookNext &&
    bookClose &&
    bookPageCount &&
    bookCoverCount
  ) {
    const certificatePages = Array.from(
      certificateBook.querySelectorAll('.cert-card-3d')
    );
    let currentPage = certificatePages.findIndex(function (page) {
      return page.classList.contains('is-current');
    });

    if (certificatePages.length) {
      if (currentPage < 0) currentPage = 0;

      function updateBookControls() {
        bookPrevious.disabled = currentPage === 0;
        bookNext.disabled = currentPage === certificatePages.length - 1;
        bookPageCount.textContent =
          String(currentPage + 1).padStart(2, '0') +
          ' / ' +
          String(certificatePages.length).padStart(2, '0');
        bookCoverCount.textContent = certificatePages.length + ' DOCUMENTS';
        bookPageCount.setAttribute(
          'aria-label',
          'Certificate ' + (currentPage + 1) + ' of ' + certificatePages.length
        );

        if (bookPrevious.disabled && document.activeElement === bookPrevious) {
          bookNext.focus();
        } else if (bookNext.disabled && document.activeElement === bookNext) {
          bookPrevious.focus();
        }
      }

      function turnToPage(nextPage, direction) {
        if (
          nextPage < 0 ||
          nextPage >= certificatePages.length ||
          nextPage === currentPage
        ) {
          return;
        }

        const currentCard = certificatePages[currentPage];
        const nextCard = certificatePages[nextPage];
        currentCard.classList.remove('is-current');
        nextCard.classList.add('is-current', 'is-in-view');
        nextCard.classList.toggle('page-enter-previous', direction === 'previous');
        currentPage = nextPage;
        updateBookControls();
      }

      function openBook() {
        certificateBook.classList.add('is-open');
        bookCover.setAttribute('aria-expanded', 'true');
        bookCover.tabIndex = -1;
        bookInterior.removeAttribute('aria-hidden');
        bookInterior.inert = false;
        window.setTimeout(function () {
          (bookNext.disabled ? bookPrevious : bookNext).focus();
        }, reduceMotion ? 0 : 500);
      }

      function closeBook() {
        certificateBook.classList.remove('is-open');
        bookCover.setAttribute('aria-expanded', 'false');
        bookCover.tabIndex = 0;
        bookInterior.setAttribute('aria-hidden', 'true');
        bookInterior.inert = true;
        bookCover.focus();
      }

      bookInterior.setAttribute('aria-hidden', 'true');
      bookInterior.inert = true;
      bookCover.addEventListener('click', openBook);
      bookPrevious.addEventListener('click', function () {
        turnToPage(currentPage - 1, 'previous');
      });
      bookNext.addEventListener('click', function () {
        turnToPage(currentPage + 1, 'next');
      });
      bookClose.addEventListener('click', closeBook);

      certificatePages.forEach(function (page, index) {
        page.classList.toggle('is-current', index === currentPage);
        if (index === currentPage) page.classList.add('is-in-view');
      });
      updateBookControls();
      certificateBook.classList.add('book-ready');
    }
  }

  /* ========================================
     7. CERT CARD — open PDF on click
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
     8. ACTIVE NAV on page load (hash)
  ======================================== */
  if (window.location.hash) {
    var id = window.location.hash.slice(1);
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

})();
