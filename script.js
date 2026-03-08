/* ═══════════════════════════════════════════════════════════════
   ROMANTIC BIRTHDAY — script.js  (UPGRADED v2)
   ─────────────────────────────────────────────────────────────
   Upgrades:
     ✦ Canvas heart particles  — physics-based, multi-type
     ✦ confetti.js (canvas-confetti CDN) integration
     ✦ Parallax scrolling       — rAF-based, multi-layer
     ✦ Photo carousel           — touch/swipe, keyboard, autoplay
     ✦ Advanced page transitions
   ─────────────────────────────────────────────────────────────
   ★ CUSTOMISE:
      BIRTHDAY_DATE  →  Your girlfriend's next birthday
═══════════════════════════════════════════════════════════════ */

/* ── ★ SET BIRTHDAY DATE ────────────────────────────────────── */
const BIRTHDAY_DATE = new Date('2025-03-28T00:00:00');

/* ── PAGE FILE NAMES ─────────────────────────────────────────── */
const PAGE_CANDLE   = 'candle.html';
const PAGE_MEMORIES = 'memories.html';

/* ════════════════════════════════════════════════════════════
   1. CANVAS HEART PARTICLES  (physics-based, upgraded)
   — Each particle is a procedurally drawn SVG-style heart path
   — Has velocity, spin, fade, and colour variation
════════════════════════════════════════════════════════════ */
function initHeartCanvas() {
  const canvas = document.getElementById('heartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Resize handling
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Colour palette
  const COLOURS = [
    'rgba(244,63,114,',    // rose
    'rgba(253,164,188,',   // rose-light
    'rgba(192,132,252,',   // lavender
    'rgba(251,191,36,',    // gold
    'rgba(255,255,255,',   // white
    'rgba(233,121,249,',   // pink-purple
  ];

  // Draw a heart shape at (0,0), radius r
  function drawHeart(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.3);
    ctx.bezierCurveTo( r,    -r * 1.0,  r * 1.6, r * 0.4, 0,       r);
    ctx.bezierCurveTo(-r * 1.6, r * 0.4, -r,    -r * 1.0, 0, -r * 0.3);
    ctx.closePath();
  }

  // Particle class
  class HeartParticle {
    constructor(burst = false) {
      this.reset(burst);
    }
    reset(burst = false) {
      this.x     = burst
        ? window.innerWidth  / 2 + (Math.random() - .5) * 200
        : Math.random() * canvas.width;
      this.y     = burst
        ? window.innerHeight / 2 + (Math.random() - .5) * 100
        : canvas.height + 20;
      this.r     = 5  + Math.random() * 14;
      this.vx    = (Math.random() - .5) * 1.2;
      this.vy    = burst
        ? -(3 + Math.random() * 6)
        : -(0.4 + Math.random() * 1.1);
      this.spin  = (Math.random() - .5) * 0.08;
      this.angle = Math.random() * Math.PI * 2;
      this.alpha = burst ? 0.9 : 0;
      this.life  = 0;
      this.maxLife = burst
        ? 60  + Math.random() * 80
        : 180 + Math.random() * 200;
      this.col   = COLOURS[Math.floor(Math.random() * COLOURS.length)];
      this.grav  = 0.012; // slight gravity pull
      this.wobble      = 0;
      this.wobbleSpeed = 0.04 + Math.random() * 0.04;
      this.isStar = Math.random() < 0.2; // 20% are sparkle stars
    }
    update() {
      this.life++;
      this.vy    += this.grav;   // gravity pulls slightly down
      this.x     += this.vx;
      this.y     += this.vy;
      this.angle += this.spin;
      this.wobble+= this.wobbleSpeed;
      this.x     += Math.sin(this.wobble) * 0.4; // horizontal sway

      // Fade in / out
      const p = this.life / this.maxLife;
      this.alpha = p < .15
        ? p / .15
        : p > .72
          ? 1 - (p - .72) / .28
          : 1;

      return this.life <= this.maxLife && this.y > -50;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.alpha * .6;
      ctx.fillStyle   = this.col + this.alpha * .6 + ')';

      if (this.isStar) {
        // Sparkle star (4-pointed)
        const s = this.r * 0.5;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const r = i % 2 === 0 ? s : s * 0.4;
          i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                  : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        drawHeart(ctx, this.r);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Pool of particles
  const MAX = 55;
  const particles = [];

  // Seed initial particles staggered
  for (let i = 0; i < MAX; i++) {
    const p = new HeartParticle();
    p.y = Math.random() * canvas.height; // start anywhere vertically
    particles.push(p);
  }

  // Spawn interval — gentle drizzle
  const spawnInterval = setInterval(() => {
    if (particles.length < MAX) {
      particles.push(new HeartParticle());
    }
  }, 900);

  // Animation loop
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const alive = particles[i].update();
      particles[i].draw(ctx);
      if (!alive) {
        // Respawn quietly from bottom
        particles[i].reset();
      }
    }
    requestAnimationFrame(frame);
  }
  frame();

  // Expose burst for candle celebration
  window.burstHearts = function(n = 30) {
    for (let i = 0; i < n; i++) {
      particles.push(new HeartParticle(true));
    }
  };
}

/* ════════════════════════════════════════════════════════════
   2. CONFETTI  (uses canvas-confetti CDN library)
   — Falls back to a custom canvas engine if CDN fails
════════════════════════════════════════════════════════════ */
function launchConfetti(duration = 4500, opts = {}) {
  /* ── Try canvas-confetti (loaded via <script> tag in HTML) ── */
  if (typeof confetti !== 'undefined') {
    const end  = Date.now() + duration;
    const defaults = {
      startVelocity: 28,
      spread: 360,
      ticks: 80,
      zIndex: 9990,
      colors: ['#f43f72','#fda4bc','#c084fc','#fbbf24','#60a5fa','#34d399','#fff','#fb923c'],
    };
    const merged = { ...defaults, ...opts };

    function fire(particleRatio, extra) {
      confetti({ ...merged, ...extra,
        particleCount: Math.floor(200 * particleRatio) });
    }

    function frame() {
      fire(.25, { origin:{ x: randomInRange(.1, .3), y: Math.random() - .2 } });
      fire(.2,  { origin:{ x: randomInRange(.7, .9), y: Math.random() - .2 } });
      fire(.35, { origin:{ x: randomInRange(.4, .6), y: Math.random() - .2 }, shapes:['circle'] });
      fire(.1,  { origin:{ x: randomInRange(.1, .3), y: Math.random() - .2 }, shapes:['circle'] });
      fire(.1,  { origin:{ x: randomInRange(.7, .9), y: Math.random() - .2 } });
      if (Date.now() < end) setTimeout(frame, 280);
    }
    frame();
    return;
  }

  /* ── Fallback: custom canvas engine ── */
  _fallbackConfetti(duration);
}

function randomInRange(min, max) { return Math.random() * (max - min) + min; }

function _fallbackConfetti(duration) {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#f43f72','#fda4bc','#c084fc','#fbbf24','#34d399','#60a5fa','#fb923c','#fff'];
  const pieces = Array.from({ length: 140 }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height - canvas.height,
    w:     6 + Math.random() * 8,
    h:     4 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vy:    2.2 + Math.random() * 3.5,
    vx:    (Math.random() - .5) * 2.2,
    angle: Math.random() * Math.PI * 2,
    spin:  (Math.random() - .5) * .14,
    shape: Math.random() > .5 ? 'rect' : 'circle',
  }));

  let raf;
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.vy; p.x += p.vx; p.angle += p.spin;
      if (p.y > canvas.height + 20) { p.y = -12; p.x = Math.random() * canvas.width; }
      ctx.save();
      ctx.globalAlpha = .88;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      if (p.shape === 'rect') ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      else { ctx.beginPath(); ctx.arc(0,0,p.w/2,0,Math.PI*2); ctx.fill(); }
      ctx.restore();
    });
    raf = requestAnimationFrame(frame);
  }
  frame();
  setTimeout(() => {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, duration);
}

/* ════════════════════════════════════════════════════════════
   3. MUSIC PLAYER
════════════════════════════════════════════════════════════ */
function initMusic() {
  const btn   = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  if (!btn || !audio) return;

  let playing = false;
  audio.volume = 0.65;

  function tryPlay() {
    if (!playing && audio.paused) {
      audio.play()
        .then(() => { playing = true; btn.textContent = '⏸'; })
        .catch(() => {});
    }
  }

  // Auto-play on first user interaction
  document.addEventListener('click', tryPlay, { once: true });
  document.addEventListener('touchstart', tryPlay, { once: true });

  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (playing) {
      // Fade out
      let vol = audio.volume;
      const fade = setInterval(() => {
        vol = Math.max(0, vol - 0.05);
        audio.volume = vol;
        if (vol <= 0) { audio.pause(); clearInterval(fade); audio.volume = 0.65; }
      }, 50);
      btn.textContent = '♫';
      playing = false;
    } else {
      audio.play().then(() => { btn.textContent = '⏸'; playing = true; }).catch(() => {});
    }
  });
}

/* ════════════════════════════════════════════════════════════
   4. PAGE TRANSITIONS
════════════════════════════════════════════════════════════ */
function navigateTo(url, delay = 0) {
  const overlay = document.querySelector('.transition-overlay');
  const go = () => {
    if (overlay) {
      overlay.classList.add('active');
      setTimeout(() => { location.href = url; }, 680);
    } else {
      location.href = url;
    }
  };
  delay > 0 ? setTimeout(go, delay) : go();
}
window.navigateTo = navigateTo;

// Fade in on page load
window.addEventListener('load', () => {
  const overlay = document.querySelector('.transition-overlay');
  if (overlay) {
    overlay.classList.add('active');
    requestAnimationFrame(() => {
      setTimeout(() => overlay.classList.remove('active'), 50);
    });
  }
});

/* ════════════════════════════════════════════════════════════
   5. COUNTDOWN PAGE
════════════════════════════════════════════════════════════ */
function initCountdown() {
  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minsEl    = document.getElementById('minutes');
  const secsEl    = document.getElementById('seconds');
  const timerWrap = document.getElementById('timerWrap');
  const arrivedWrap = document.getElementById('arrivedWrap');
  if (!daysEl) return;

  // Seed scattered parallax stars behind the timer
  seedParallaxStars();

  function pad(n) { return String(n).padStart(2, '0'); }

  function flip(el, val) {
    if (el.textContent === val) return;
    el.textContent = val;
    el.classList.remove('flip');
    void el.offsetWidth; // reflow
    el.classList.add('flip');
  }

  function tick() {
    const diff = BIRTHDAY_DATE - Date.now();
    if (diff <= 0) {
      timerWrap.style.display   = 'none';
      arrivedWrap.style.display = 'flex';
      launchConfetti(8000, { ticks: 100 });
      if (window.burstHearts) burstHearts(40);
      // Auto-redirect after 9s
      navigateTo(PAGE_CANDLE, 9000);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    flip(daysEl, pad(d));
    flip(hoursEl, pad(h));
    flip(minsEl, pad(m));
    flip(secsEl, pad(s));
    setTimeout(tick, 1000);
  }
  tick();
}

/* Parallax star dots on countdown page */
function seedParallaxStars() {
  const hero = document.querySelector('.countdown-hero');
  if (!hero) return;
  for (let i = 0; i < 36; i++) {
    const star = document.createElement('div');
    star.className = 'parallax-star';
    const s = 1.5 + Math.random() * 3;
    star.style.cssText = `
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      width:${s}px;height:${s}px;
      animation-duration:${2+Math.random()*3}s;
      animation-delay:${Math.random()*3}s;
      --speed:${0.04+Math.random()*0.12};
    `;
    star.dataset.speed = 0.04 + Math.random() * 0.12;
    hero.style.position = 'relative';
    hero.appendChild(star);
  }

  // rAF-based mouse parallax for countdown
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
  });

  const stars = hero.querySelectorAll('.parallax-star');
  function parallaxTick() {
    stars.forEach(s => {
      const spd = parseFloat(s.dataset.speed);
      s.style.transform = `translate(${mx * spd * 40}px, ${my * spd * 40}px)`;
    });
    requestAnimationFrame(parallaxTick);
  }
  parallaxTick();
}

/* ════════════════════════════════════════════════════════════
   6. CANDLE PAGE — upgraded flame + smoke
════════════════════════════════════════════════════════════ */
function initCandle() {
  const candles  = document.querySelectorAll('.candle');
  const blowBtn  = document.getElementById('blowBtn');
  const wishWrap = document.getElementById('wishWrap');
  if (!candles.length) return;

  let blown = 0;
  const total = candles.length;

  function blowOut(candle) {
    if (candle.classList.contains('blown')) return;
    candle.classList.add('blown');
    blown++;

    // Animate smoke drift direction randomly
    const smokeCol = candle.querySelector('.smoke-col');
    if (smokeCol) {
      smokeCol.querySelectorAll('.smoke-puff').forEach(p => {
        p.style.setProperty('--drift', `${(Math.random()-0.5)*20}px`);
      });
    }

    if (blown >= total) allBlown();
  }

  function blowNext() {
    for (const c of candles) {
      if (!c.classList.contains('blown')) { blowOut(c); break; }
    }
  }

  function allBlown() {
    if (blowBtn) { blowBtn.disabled = true; blowBtn.style.opacity = '.3'; }
    launchConfetti(4500);
    if (window.burstHearts) burstHearts(35);
    setTimeout(() => {
      if (wishWrap) {
        wishWrap.style.display = 'block';
        wishWrap.classList.add('wish-reveal');
      }
    }, 1100);
  }

  candles.forEach(c => {
    const flame = c.querySelector('.flame');
    if (flame) flame.addEventListener('click', () => blowOut(c));
    c.addEventListener('click', () => blowOut(c));
  });

  if (blowBtn) blowBtn.addEventListener('click', blowNext);
}

/* ════════════════════════════════════════════════════════════
   7. PHOTO CAROUSEL  (upgraded — touch/swipe + keyboard + auto)
════════════════════════════════════════════════════════════ */
function initCarousel() {
  const track   = document.querySelector('.carousel-track');
  const slides  = document.querySelectorAll('.carousel-slide');
  const dotsWrap= document.querySelector('.carousel-dots');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  if (!track || !slides.length) return;

  let current = 0;
  let autoTimer = null;
  const total   = slides.length;

  // Build dots
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className   = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.ariaLabel   = `Slide ${i + 1}`;
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    // Update dots
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
    resetAuto();
  }

  function goNext() { goTo(current + 1); }
  function goPrev() { goTo(current - 1); }

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  });

  // Touch / swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging  = false;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging  = true;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    // Only swipe horizontally
    if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
  }, { passive: false });

  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) { dx < 0 ? goNext() : goPrev(); }
  });

  // Mouse drag (desktop)
  let mouseStartX = 0;
  let mouseDown   = false;
  track.addEventListener('mousedown', e => { mouseDown = true; mouseStartX = e.clientX; });
  window.addEventListener('mouseup', e => {
    if (!mouseDown) return;
    mouseDown = false;
    const dx = e.clientX - mouseStartX;
    if (Math.abs(dx) > 60) { dx < 0 ? goNext() : goPrev(); }
  });
  track.addEventListener('mouseleave', () => { mouseDown = false; });

  // Autoplay every 4.5s
  function startAuto() {
    autoTimer = setInterval(goNext, 4500);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);
}

/* ════════════════════════════════════════════════════════════
   8. PARALLAX SCROLLING  (memories page)
   — Header text moves at 0.5x scroll speed
   — Card rows move at slightly different speeds (depth)
════════════════════════════════════════════════════════════ */
function initParallax() {
  const parallaxHero = document.querySelector('.parallax-hero');
  const cardRows = document.querySelectorAll('.parallax-card');
  const scrollEl = document.getElementById('memoriesBody') || window;

  function getScroll() {
    return scrollEl === window ? window.scrollY : scrollEl.scrollTop;
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = getScroll();

      // Hero text parallax — moves up at half scroll speed
      if (parallaxHero) {
        parallaxHero.style.transform = `translateY(${sy * 0.38}px)`;
      }

      // Card parallax — alternating rows at different depths
      cardRows.forEach((card, i) => {
        const speed = i % 2 === 0 ? 0.055 : -0.055;
        const rect  = card.getBoundingClientRect();
        const relY  = rect.top + sy - window.innerHeight / 2;
        card.style.transform = card.classList.contains('visible')
          ? `translateY(${relY * speed}px)`
          : '';
      });

      ticking = false;
    });
  }

  scrollEl.addEventListener('scroll', onScroll, { passive: true });
  // Also run on window scroll if scrollEl is body
  if (scrollEl === window) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

/* ════════════════════════════════════════════════════════════
   9. MEMORY CARDS — scroll reveal with IntersectionObserver
════════════════════════════════════════════════════════════ */
function initMemories() {
  const cards = document.querySelectorAll('.mem-card');
  if (!cards.length) return;

  // Mark parallax cards
  cards.forEach((c, i) => c.classList.add('parallax-card'));

  // Welcome confetti burst
  launchConfetti(3000, { startVelocity: 20, ticks: 60 });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.10 });

  cards.forEach(c => {
    obs.observe(c);
    const r = c.getBoundingClientRect();
    if (r.top < window.innerHeight) c.classList.add('visible');
  });
}

/* ════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initHeartCanvas();   // ← runs on all pages
  initMusic();         // ← runs on all pages
  initCountdown();     // ← countdown.html
  initCandle();        // ← candle.html
  initCarousel();      // ← memories.html
  initMemories();      // ← memories.html
  initParallax();      // ← memories.html
});
