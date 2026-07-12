/**
 * particles.js
 * Animated particle network canvas background.
 * Creates floating dots that connect when close — giving a
 * "network / cyber" feel to the page.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let W, H;
  const PARTICLE_COUNT = 110;
  const CONNECTION_DIST = 110;
  const COLORS = ['#00f5ff', '#a855f7', '#e2e8f0'];

  /* ---- Resize canvas to fill the window ---- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Particle class ---- */
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.4 + 0.3;
      this.vx    = (Math.random() - 0.5) * 0.28;
      this.vy    = (Math.random() - 0.5) * 0.28;
      this.alpha = Math.random() * 0.45 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Wrap edges
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ---- Create particles ---- */
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  /* ---- Draw connecting lines between close particles ---- */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- Main animation loop ---- */
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

})();
