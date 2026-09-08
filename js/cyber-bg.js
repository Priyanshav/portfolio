/* ================================================================
   cyber-bg.js  —  Cybersecurity ambient animations v3
   - Network node graph (stats section)
   - Hero radar sweep
   - Tech ecosystem: DOM img nodes + canvas lines
   - Hex address blips on section numbers
   - Contact card glitch hover
   ================================================================ */

(function () {
  'use strict';

  const GREEN = '#00ff41';
  const AMBER = '#ff8c00';

  /* ================================================================
     1. NETWORK TOPOLOGY CANVAS  (stats section bg)
     ================================================================ */
  function initNetworkCanvas() {
    const section = document.getElementById('stats');
    if (!section) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.3;';
    section.style.position = 'relative';
    section.insertBefore(canvas, section.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, nodes;
    const packets = [];
    let frame = 0;

    function resize() {
      W = canvas.width  = section.offsetWidth;
      H = canvas.height = section.offsetHeight;
    }

    function buildNodes() {
      nodes = Array.from({ length: 26 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 2 + 1,
        color: Math.random() < 0.7 ? GREEN : AMBER,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function spawnPacket(a, b) {
      if (packets.length > 35) return;
      packets.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y,
        t: 0, spd: 0.008 + Math.random() * 0.01,
        color: Math.random() < 0.7 ? GREEN : AMBER });
    }

    function draw() {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      frame++;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.phase += 0.04;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      const MAX = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d > MAX) continue;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,255,65,${(1 - d / MAX) * 0.22})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (frame % 100 === 0 && Math.random() < 0.18) spawnPacket(a, b);
        }
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.spd;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.ax + (p.bx - p.ax) * p.t, p.ay + (p.by - p.ay) * p.t, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8; ctx.shadowColor = p.color;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 6 * (0.6 + 0.4 * Math.sin(n.phase));
        ctx.shadowColor = n.color;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    }

    window.addEventListener('resize', () => { resize(); buildNodes(); });
    resize(); buildNodes(); draw();
  }

  /* ================================================================
     2. HERO RADAR SWEEP CANVAS
     ================================================================ */
  function initRadar() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const wrap = document.createElement('div');
    wrap.className = 'radar-sweep';
    hero.appendChild(wrap);

    const c = document.createElement('canvas');
    c.style.cssText = 'width:100%;height:100%;border-radius:50%;';
    wrap.appendChild(c);

    const ctx = c.getContext('2d');
    const R = 200;
    let angle = 0;

    function draw() {
      c.width = R * 2; c.height = R * 2;
      ctx.clearRect(0, 0, R * 2, R * 2);
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(R, R, (R * i) / 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,255,65,0.1)'; ctx.lineWidth = 0.8; ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(0,255,65,0.07)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(R, 0); ctx.lineTo(R, R * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, R); ctx.lineTo(R * 2, R); ctx.stroke();

      ctx.save(); ctx.translate(R, R); ctx.rotate(angle);
      const g = ctx.createLinearGradient(0, 0, R, 0);
      g.addColorStop(0, 'rgba(0,255,65,0.35)');
      g.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -0.5, 0); ctx.closePath();
      ctx.fillStyle = g; ctx.fill(); ctx.restore();

      ctx.beginPath(); ctx.arc(R, R, R - 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,65,0.18)'; ctx.lineWidth = 1; ctx.stroke();

      angle += 0.025;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ================================================================
     3. TECH ECOSYSTEM  — DOM img nodes + canvas connection lines
     Uses real CDN SVG logos for high-quality rendering
     ================================================================ */
  function initEco() {
    const wrap = document.querySelector('.eco-canvas-wrap');
    if (!wrap) return;

    /* -- Tech stack with real devicon / simpleicons CDN URLs -- */
    const TECHS = [
      /* Languages */
      { label: 'Python',      cat: 'lang',  img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
      { label: 'JavaScript',  cat: 'lang',  img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
      { label: 'Java',        cat: 'lang',  img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
      { label: 'C',           cat: 'lang',  img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg' },
      { label: 'SQL',         cat: 'db',    img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azuresqldatabase/azuresqldatabase-original.svg' },
      /* Databases */
      { label: 'PostgreSQL',  cat: 'db',    img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
      { label: 'MySQL',       cat: 'db',    img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
      { label: 'MongoDB',     cat: 'db',    img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
      /* Infra / DevOps */
      { label: 'Docker',      cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
      { label: 'Kubernetes',  cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg' },
      { label: 'Git',         cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
      { label: 'GitHub',      cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg' },
      { label: 'Linux',       cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg' },
      { label: 'AWS',         cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg' },
      { label: 'Vercel',      cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg' },
      /* Web / Frameworks */
      { label: 'Flask',       cat: 'web',   img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg' },
      { label: 'FastAPI',     cat: 'web',   img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg' },
      { label: 'Postman',     cat: 'web',   img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg' },
      /* AI / ML */
      { label: 'Scikit-learn',cat: 'ai',    img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg' },
      { label: 'Pandas',      cat: 'ai',    img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg' },
      { label: 'NumPy',       cat: 'ai',    img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg' },
      { label: 'OpenAI',      cat: 'ai',    img: 'https://cdn.simpleicons.org/openai/ffffff' },
      { label: 'LangChain',   cat: 'ai',    img: 'https://cdn.simpleicons.org/langchain/00ff41' },
      { label: 'Hugging Face',cat: 'ai',    img: 'https://cdn.simpleicons.org/huggingface/FF9D00' },
      { label: 'Streamlit',   cat: 'ai',    img: 'https://cdn.simpleicons.org/streamlit/FF4B4B' },
      /* Security */
      { label: 'Kali Linux',  cat: 'sec',   img: 'https://cdn.simpleicons.org/kalilinux/557C94' },
      { label: 'Wireshark',   cat: 'sec',   img: 'https://cdn.simpleicons.org/wireshark/1679A7' },
      { label: 'Nmap',        cat: 'sec',   img: 'https://cdn.simpleicons.org/nmap/0E83CD' },
      { label: 'OWASP ZAP',   cat: 'sec',   img: 'https://cdn.simpleicons.org/owaspzap/FF4500' },
      { label: 'Metasploit',  cat: 'sec',   img: 'https://cdn.simpleicons.org/metasploit/2596CD' },
      { label: 'Cloudflare',  cat: 'infra', img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cloudflare/cloudflare-original.svg' },
    ];

    const W_WRAP = () => wrap.offsetWidth;
    const H_WRAP = () => wrap.offsetHeight;

    /* -- canvas for connecting lines -- */
    const canvas = document.getElementById('eco-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* -- create DOM node objects -- */
    const PAD = 80;
    const COLS = 6;
    const nodes = [];

    TECHS.forEach((tech, i) => {
      const el = document.createElement('div');
      el.className = 'eco-node';

      const iconWrap = document.createElement('div');
      iconWrap.className = 'nd-icon';

      const img = document.createElement('img');
      img.src = tech.img;
      img.alt = tech.label;
      img.draggable = false;
      iconWrap.appendChild(img);

      const lbl = document.createElement('span');
      lbl.className = 'nd-label';
      lbl.textContent = tech.label;

      el.appendChild(iconWrap);
      el.appendChild(lbl);
      wrap.appendChild(el);

      /* initial scatter position */
      const W = W_WRAP(), H = H_WRAP();
      const cols = COLS;
      const rows = Math.ceil(TECHS.length / cols);
      const col = i % cols, row = Math.floor(i / cols);
      const cw = (W - PAD * 2) / cols, ch = (H - PAD * 2) / rows;
      const jx = (Math.random() - 0.5) * cw * 0.4;
      const jy = (Math.random() - 0.5) * ch * 0.4;

      const x = PAD + col * cw + cw / 2 + jx;
      const y = PAD + row * ch + ch / 2 + jy;

      nodes.push({
        el,
        tech,
        x, y,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        phase: Math.random() * Math.PI * 2,
      });
    });

    /* -- fade in with stagger -- */
    nodes.forEach((n, i) => {
      n.el.style.opacity = '0';
      n.el.style.transform = 'scale(0.6) translateY(10px)';
      setTimeout(() => {
        n.el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        n.el.style.opacity = '1';
        n.el.style.transform = '';
      }, i * 55);
    });

    /* -- position DOM nodes -- */
    function positionNodes() {
      for (const n of nodes) {
        n.el.style.left = (n.x - 30) + 'px';
        n.el.style.top  = (n.y - 30) + 'px';
      }
    }

    /* -- draw canvas connection lines -- */
    const packets = [];
    let lastPkt = 0;

    function resizeCanvas() {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
    }

    function drawLines(ts) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const MAX = 220;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          if (a.tech.cat !== b.tech.cat) continue;
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d > MAX) continue;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,255,65,${(1 - d / MAX) * 0.14})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      /* spawn packet */
      if (ts - lastPkt > 1000) {
        lastPkt = ts;
        const pool = nodes.filter(n => n.el.style.opacity !== '0');
        if (pool.length >= 2) {
          const a = pool[Math.floor(Math.random() * pool.length)];
          const peers = pool.filter(n => n !== a && n.tech.cat === a.tech.cat);
          if (peers.length) {
            const b = peers[Math.floor(Math.random() * peers.length)];
            packets.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y,
              t0: ts, dur: 700 + Math.random() * 500 });
          }
        }
      }

      /* draw packets */
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        const prog = (ts - p.t0) / p.dur;
        if (prog >= 1) { packets.splice(i, 1); continue; }
        const px = p.ax + (p.bx - p.ax) * prog;
        const py = p.ay + (p.by - p.ay) * prog;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff41';
        ctx.shadowBlur = 10; ctx.shadowColor = '#00ff41';
        ctx.fill(); ctx.shadowBlur = 0;
      }
    }

    /* -- animation loop -- */
    function loop(ts) {
      requestAnimationFrame(loop);
      const W = canvas.width, H = canvas.height;
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.phase += 0.03;
        const floatY = Math.sin(n.phase) * 4;
        if (n.x < PAD || n.x > W - PAD) n.vx *= -1;
        if (n.y < PAD || n.y > H - PAD) n.vy *= -1;
        n.el.style.left = (n.x - 30) + 'px';
        n.el.style.top  = (n.y - 30 + floatY) + 'px';
      }
      drawLines(ts);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    positionNodes();
    requestAnimationFrame(loop);
  }

  /* ================================================================
     4. HEX BLIPS on section numbers
     ================================================================ */
  function initHexBlips() {
    document.querySelectorAll('.sec-num').forEach(h => {
      const blip = document.createElement('span');
      blip.style.cssText = [
        'font-size:0.55rem',
        'color:rgba(0,255,65,0.5)',
        'margin-left:10px',
        'letter-spacing:2px',
        'font-family:"JetBrains Mono","Share Tech Mono",monospace',
        'vertical-align:middle',
        'user-select:none',
        'pointer-events:none',
      ].join(';');
      h.appendChild(blip);
      setInterval(() => {
        blip.textContent = '0x' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6,'0').toUpperCase();
      }, 2000);
    });
  }

  /* ================================================================
     5. CONTACT CARD HOVER GLITCH
     ================================================================ */
  function initContactGlitch() {
    document.querySelectorAll('.contact-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        let f = 0;
        const iv = setInterval(() => {
          f++;
          card.style.opacity = f % 2 === 0 ? '1' : '0.82';
          if (f > 5) { clearInterval(iv); card.style.opacity = '1'; }
        }, 40);
      });
    });
  }

  /* ================================================================
     INIT
     ================================================================ */
  function init() {
    initNetworkCanvas();
    initRadar();
    initEco();
    initHexBlips();
    initContactGlitch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
