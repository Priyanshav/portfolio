/**
 * typing.js
 * Typewriter effect for the hero section role text.
 * Cycles through an array of role strings, typing and
 * deleting each one with configurable speeds.
 */

(function () {
  'use strict';

  /* ---- Config ---- */
  const ROLES = [
    'Software Development Engineer',
    'Cybersecurity Expert',
    'Technical Support Engineer',
    'AI Builder',
  ];

  const TYPE_SPEED   = 100;  // ms per character when typing
  const DELETE_SPEED = 55;   // ms per character when deleting
  const PAUSE_AFTER  = 2200; // ms to pause at full word
  const PAUSE_BEFORE = 380;  // ms to pause before next word
  const START_DELAY  = 1200; // ms before first character appears

  /* ---- State ---- */
  let roleIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;

  const el = document.getElementById('typedRole');
  if (!el) return;

  /* ---- Core typing function ---- */
  function tick() {
    const currentRole = ROLES[roleIndex];

    if (!isDeleting) {
      // Typing forward
      charIndex++;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === currentRole.length) {
        // Finished typing — pause then start deleting
        setTimeout(tick, PAUSE_AFTER);
        isDeleting = true;
        return;
      }
      setTimeout(tick, TYPE_SPEED);

    } else {
      // Deleting backward
      charIndex--;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === 0) {
        // Finished deleting — move to next role
        isDeleting = false;
        roleIndex  = (roleIndex + 1) % ROLES.length;
        setTimeout(tick, PAUSE_BEFORE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  /* ---- Start after initial delay ---- */
  setTimeout(tick, START_DELAY);

})();
