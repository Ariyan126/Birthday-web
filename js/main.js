/*
  Birthday Wish Site
  - Theme switcher (multiple versions)
  - Countdown to 5 April (Asia/Karachi)
  - Floating hearts + confetti on canvas
  - Photo gallery (edit PHOTO_LIST)
  - Background music toggle
*/

const THEME_MAP = {
  neon: 'css/theme-neon.css',
  pastel: 'css/theme-pastel.css',
  blackgold: 'css/theme-blackgold.css',
  cutepink: 'css/theme-cutepink.css',
  minimal: 'css/theme-minimal.css'
};

/* ---------------------
   Password Gate (client-side)
   NOTE: This is NOT real security for a static site.
   Anyone can still view the source and bypass it.
--------------------- */

const PASSWORD_GATE = {
  // CHANGE THIS PASSWORD
  password: '1234',
  // sessionStorage = unlock for this browser tab only (recommended)
  storageKey: 'birthdayWishUnlocked'
};

function initPasswordGate() {
  const overlay = document.getElementById('passwordGate');
  const form = document.getElementById('passwordForm');
  const input = document.getElementById('passwordInput');
  const err = document.getElementById('passwordError');
  const startOverlay = document.getElementById('startOverlay');

  if (!overlay || !form || !input) return false;

  const already = sessionStorage.getItem(PASSWORD_GATE.storageKey) === '1';
  if (already) {
    overlay.hidden = true;
    return false;
  }

  // Lock page behind the overlay
  window.__PASSWORD_GATE_LOCKED__ = true;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';

  // Make sure the music autoplay overlay can't cover the password gate
  if (startOverlay) {
    startOverlay.hidden = true;
    startOverlay.style.display = 'none';
  }

  // Focus input (small delay helps on some mobile browsers)
  setTimeout(() => {
    try { input.focus(); } catch {}
  }, 50);

  const fail = (msg = 'Wrong password.') => {
    if (err) err.textContent = msg;
    const panel = overlay.querySelector('.passOverlay__panel');
    if (panel) {
      panel.classList.remove('is-shake');
      // restart animation
      void panel.offsetWidth;
      panel.classList.add('is-shake');
    }
    input.value = '';
    try { input.focus(); } catch {}
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (input.value || '').trim();

    if (v !== PASSWORD_GATE.password) {
      fail('Incorrect password. Try again.');
      return;
    }

    sessionStorage.setItem(PASSWORD_GATE.storageKey, '1');
    overlay.hidden = true;
    window.__PASSWORD_GATE_LOCKED__ = false;
    document.body.style.overflow = '';

    if (err) err.textContent = '';
  });

  // Prevent escape key from closing anything while locked
  document.addEventListener('keydown', (e) => {
    if (!window.__PASSWORD_GATE_LOCKED__) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      fail('Please enter the password to continue.');
    }
  }, { capture: true });

  return true;
}

// 1) EDIT THIS: list your photo file names in assets/photos
// Example: ['p1.jpg','p2.jpg','p3.jpg']
const PHOTO_LIST = [
  '1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg'
];

// 2) Countdown targets in Asia/Karachi
function getNextKarachiMonthDay(month, day) {
  const now = new Date();
  const year = now.getUTCFullYear();

  const mm = String(month).padStart(2,'0');
  const dd = String(day).padStart(2,'0');

  const candidateThisYear = new Date(`${year}-${mm}-${dd}T00:00:00+05:00`);
  const candidateNextYear = new Date(`${year + 1}-${mm}-${dd}T00:00:00+05:00`);

  return (now.getTime() < candidateThisYear.getTime()) ? candidateThisYear : candidateNextYear;
}

function pad2(n){return String(n).padStart(2,'0')}

function setText(id, txt){
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function applyTheme(v) {
  const linkEl = document.getElementById('themeStylesheet');
  const select = document.getElementById('themeSelect');
  if (!linkEl) return;
  if (!THEME_MAP[v]) v = 'neon';
  linkEl.setAttribute('href', THEME_MAP[v]);
  if (select) select.value = v;
  localStorage.setItem('theme', v);
}

function initTheme() {
  const select = document.getElementById('themeSelect');
  const stored = localStorage.getItem('theme') || 'neon';
  applyTheme(stored);

  if (select) {
    select.addEventListener('change', () => {
      applyTheme(select.value);
      // tiny celebratory burst on theme switch
      fx.confettiBurst(55);
    });
  }
}

function initGallery() {
  const t1 = document.getElementById('marqueeTrack1');
  const t2 = document.getElementById('marqueeTrack2');
  if (!t1 || !t2) return;

  const safeList = (PHOTO_LIST && PHOTO_LIST.length) ? PHOTO_LIST : [];

  if (!safeList.length) {
    t1.innerHTML = `<div class="noteBox">No photos yet. Edit <code>PHOTO_LIST</code> in <code>js/main.js</code>.</div>`;
    t2.innerHTML = '';
    return;
  }

  // Split roughly half/half for 2 marquees
  const mid = Math.ceil(safeList.length / 2);
  const row1 = safeList.slice(0, mid);
  const row2 = safeList.slice(mid);

  // Duplicate content to allow seamless endless scrolling
  function buildRow(list) {
    const items = list.map((fn, idx) => {
      const src = `assets/photos/${fn}`;
      const label = `Photo ${idx + 1}`;
      return `
        <div class="mtile">
          <img src="${src}" alt="${label}" loading="lazy" />
        </div>
      `;
    }).join('');

    // Duplicate 4x so even small photo sets feel truly endless
    // Animation moves -50%, so first half and second half are identical.
    return items + items + items + items;
  }

  // If second row is empty (odd small list), reuse first
  t1.innerHTML = buildRow(row1);
  t2.innerHTML = buildRow(row2.length ? row2 : row1);
}

function initCountdown() {
  const target = getNextKarachiMonthDay(4, 5);
  const statusPill = document.getElementById('statusPill');

  function tick() {
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      setText('dd','00');
      setText('hh','00');
      setText('mm','00');
      setText('ss','00');
      if (statusPill) statusPill.textContent = 'It\'s today!';
      setText('countdownNote', 'Happy Birthday! 🎂');
      return;
    }

    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hrs  = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = Math.floor(s % 60);

    setText('dd', pad2(days));
    setText('hh', pad2(hrs));
    setText('mm', pad2(mins));
    setText('ss', pad2(secs));

    if (statusPill) statusPill.textContent = 'Counting down…';
  }

  tick();
  setInterval(tick, 1000);
}

function getKarachiYMD(date = new Date()) {
  // Prefer IANA timezone when available
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    // en-CA gives YYYY-MM-DD
    const parts = fmt.format(date).split('-');
    return { y: Number(parts[0]), m: Number(parts[1]), d: Number(parts[2]) };
  } catch {
    // Fallback: apply fixed +05:00 offset (Pakistan is +05, no DST)
    const ms = date.getTime() + (5 * 60 * 60 * 1000);
    const k = new Date(ms);
    return { y: k.getUTCFullYear(), m: k.getUTCMonth() + 1, d: k.getUTCDate() };
  }
}

function isBirthdayTodayInKarachi(date = new Date()) {
  const { m, d } = getKarachiYMD(date);
  return m === 4 && d === 5;
}

async function openSurprise(sec) {
  sec.hidden = false;
  document.body.style.overflow = 'hidden';

  // Reset flow state each time
  const cakeStage = document.getElementById('cakeStage');
  const finalCard = document.getElementById('finalCard');
  const cakeBtn = document.getElementById('cakeBtn');
  const cakeHint = document.getElementById('cakeHint');
  const cakeImg = document.getElementById('cakeImg');
  const cakeCutImg = document.getElementById('cakeCutImg');

  if (cakeStage) cakeStage.hidden = true;
  if (finalCard) finalCard.hidden = true;
  if (cakeBtn) cakeBtn.classList.remove('is-cut');
  if (cakeHint) cakeHint.textContent = 'One tap = cut ✨';
  if (cakeImg) {
    cakeImg.hidden = false;
    cakeImg.style.opacity = '1';
  }
  if (cakeCutImg) {
    cakeCutImg.hidden = true;
    cakeCutImg.style.opacity = '0';
  }

  // Music behavior:
  // - Pause background music
  // - Play Happy Birthday music
  const bg = document.getElementById('bgMusic');
  const hb = document.getElementById('hbMusic');
  const musicBtn = document.getElementById('musicBtn');

  try {
    if (bg && !bg.paused) bg.pause();
    if (musicBtn) {
      musicBtn.setAttribute('aria-pressed', 'false');
      const t = musicBtn.querySelector('.btn__text');
      if (t) t.textContent = 'Music: Off';
    }

    if (hb) {
      hb.currentTime = 0;
      hb.volume = 0.95;
      await hb.play();
    }
  } catch (e) {
    console.warn('HB music error:', e);
    setText('countdownNote', 'Add an MP3 at assets/audio/happy-birthday.mp3 for surprise music.');
  }

  // Enable Next button when the modal opens
  const nextBtn = document.getElementById('nextToCakeBtn');
  if (nextBtn) nextBtn.disabled = false;

  fx.confettiBurst(220);
}

function closeSurprise(sec) {
  sec.hidden = true;
  document.body.style.overflow = '';
}

function setWishLockState(unlocked) {
  // Toggle any elements marked with data-wish="locked" / "unlocked"
  document.querySelectorAll('[data-wish="locked"]').forEach(el => {
    el.hidden = !!unlocked;
  });
  document.querySelectorAll('[data-wish="unlocked"]').forEach(el => {
    el.hidden = !unlocked;
  });
}

function initSurprise() {
  const btn = document.getElementById('surpriseBtn');
  const sec = document.getElementById('surprise');
  if (!btn || !sec) return;

  // Lock surprise until the birthday (Asia/Karachi)
  const TEST_MODE_UNLOCK = false;
  const unlocked = TEST_MODE_UNLOCK ? true : isBirthdayTodayInKarachi();

  setWishLockState(unlocked);

  // Ensure modal is CLOSED on page load
  closeSurprise(sec);

  btn.disabled = !unlocked;
  btn.title = unlocked ? 'Open your surprise 🎁' : 'Locked — unlocks on 5 April (Karachi time)';

  if (!unlocked) {
    setText('countdownNote', 'Surprise + wish unlock on 5 April.');
  }

  // Auto-open only on the actual birthday (disabled during test unlock mode)
  if (!TEST_MODE_UNLOCK && isBirthdayTodayInKarachi()) {
    const { y } = getKarachiYMD();
    const key = `surpriseAutoOpened-${y}-04-05`;
    const already = localStorage.getItem(key) === '1';
    if (!already) {
      setTimeout(() => {
        openSurprise(sec);
        localStorage.setItem(key, '1');
      }, 700);
    }
  }

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    await openSurprise(sec);
  });

  // Close behavior (button + backdrop)
  const closeBtn = document.getElementById('closeSurpriseBtn');
  if (closeBtn) closeBtn.addEventListener('click', () => closeSurprise(sec));

  sec.addEventListener('click', (e) => {
    const el = e.target;
    // Close if user clicked backdrop or any element marked data-close="1"
    if (el && el.closest && el.closest('[data-close="1"]')) {
      closeSurprise(sec);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sec.hidden) closeSurprise(sec);
  });

  // Next → show cake
  const nextBtn = document.getElementById('nextToCakeBtn');
  const cakeStage = document.getElementById('cakeStage');
  const finalCard = document.getElementById('finalCard');
  if (nextBtn && cakeStage) {
    nextBtn.addEventListener('click', () => {
      cakeStage.hidden = false;
      if (finalCard) finalCard.hidden = true;
      nextBtn.disabled = true;
      fx.confettiBurst(90);
      cakeStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Replay
  const replayBtn = document.getElementById('replayBtn');
  if (replayBtn) replayBtn.addEventListener('click', () => {
    closeSurprise(sec);
    setTimeout(() => openSurprise(sec), 250);
  });

  // Cake cut interaction (PNG swap)
  const cakeBtn = document.getElementById('cakeBtn');
  const cakeHint = document.getElementById('cakeHint');
  const pop = document.getElementById('popSfx');
  const cakeImg = document.getElementById('cakeImg');
  const cakeCutImg = document.getElementById('cakeCutImg');
  const popperBurst = document.getElementById('popperBurst');

  if (cakeBtn) {
    cakeBtn.addEventListener('click', async () => {
      if (cakeBtn.classList.contains('is-cut')) return;
      cakeBtn.classList.add('is-cut');
      if (cakeHint) cakeHint.textContent = 'Yay! 🎉';

      // Animated swap to cut cake image
      if (cakeCutImg) {
        cakeCutImg.hidden = false;
        // force style recalc so opacity transition applies even after hidden->visible
        void cakeCutImg.offsetWidth;
        cakeCutImg.style.opacity = '1';
      }
      if (cakeImg) {
        cakeImg.style.opacity = '0';
        // after fade, fully hide the base image to avoid any overlap artifacts
        setTimeout(() => {
          cakeImg.hidden = true;
        }, 320);
      }

      // Party popper overlay (visual)
      if (popperBurst) {
        popperBurst.hidden = false;
        popperBurst.classList.remove('is-go');
        // restart animation
        void popperBurst.offsetWidth;
        popperBurst.classList.add('is-go');
        setTimeout(() => {
          popperBurst.hidden = true;
        }, 950);
      }

      // Party popper SFX + confetti
      try {
        if (pop) {
          pop.currentTime = 0;
          pop.volume = 0.9;
          await pop.play();
        }
      } catch (e) {
        console.warn('Popper SFX error:', e);
      }

      fx.confettiBurst(260);

      // Show final card after cut
      const finalCard = document.getElementById('finalCard');
      if (finalCard) {
        finalCard.hidden = false;
        setTimeout(() => finalCard.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
      }
    });
  }

  const burstBtn = document.getElementById('burstBtn');
  if (burstBtn) burstBtn.addEventListener('click', () => fx.confettiBurst(120));
}

function initMusic() {
  // If password gate is still active, don't trigger the autoplay overlay yet.
  if (window.__PASSWORD_GATE_LOCKED__) return;

  const audio = document.getElementById('bgMusic');
  const source = document.getElementById('bgSource');
  const select = document.getElementById('musicSelect');
  if (!audio || !source || !select) return;

  const TRACKS = {
    off: null,
    m1: 'assets/audio/music1.mp3',
    m2: 'assets/audio/music2.mp3'
  };

  const overlay = document.getElementById('startOverlay');
  const startBtn = document.getElementById('startBtn');
  const skipBtn = document.getElementById('startSkipBtn');

  const hideOverlay = () => {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.style.display = 'none';
  };

  const showOverlay = () => {
    if (!overlay) return;
    overlay.hidden = false;
    overlay.style.display = 'grid';
  };

  function setSelection(v) {
    select.value = v;
    localStorage.setItem('musicTrack', v);
  }

  async function playSelected() {
    const v = select.value;
    const url = TRACKS[v];

    if (!url) {
      audio.pause();
      return;
    }

    // swap source
    if (source.getAttribute('src') !== url) {
      source.setAttribute('src', url);
      audio.load();
    }

    audio.volume = 0.8;
    await audio.play();
  }

  function stopMusic() {
    audio.pause();
  }

  // Restore previous selection
  const stored = localStorage.getItem('musicTrack') || 'off';
  setSelection(TRACKS[stored] ? stored : 'off');

  // Try autoplay if not off
  (async () => {
    if (select.value === 'off') return;
    try {
      await playSelected();
      hideOverlay();
    } catch (e) {
      console.warn('Autoplay blocked:', e);
      setText('countdownNote', 'Tap once to start music (autoplay blocked).');
      stopMusic();
      showOverlay();
    }
  })();

  // Overlay buttons
  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      try {
        // if user never chose a track, default to Track 1
        if (select.value === 'off') setSelection('m1');
        await playSelected();
      } catch (e) {
        console.warn('Start music failed:', e);
        setText('countdownNote', 'Could not start music. Make sure music1.mp3 or music2.mp3 exists.');
      } finally {
        // Always hide overlay after user action
        hideOverlay();
      }
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      // User explicitly chose no music
      setSelection('off');
      stopMusic();
      hideOverlay();
    });
  }

  // Extra robustness: if some webview swallows button handlers, delegate clicks
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#startBtn')) hideOverlay();
      if (t.closest('#startSkipBtn')) hideOverlay();
    });
  }

  // User changes track
  select.addEventListener('change', async () => {
    setSelection(select.value);
    try {
      await playSelected();
      hideOverlay();
    } catch (e) {
      console.warn('Music change blocked:', e);
      // user gesture usually exists here, but in case of webview weirdness:
      showOverlay();
    }
  });

  // First tap anywhere can also start if blocked
  const firstTap = async () => {
    if (select.value === 'off') return;
    if (!audio.paused) return;
    try { await playSelected(); hideOverlay(); } catch {}
  };
  window.addEventListener('pointerdown', firstTap, { capture: true, passive: true });
  window.addEventListener('touchstart', firstTap, { capture: true, passive: true });
}

/* ---------------------
   Canvas FX: Hearts + Confetti
--------------------- */

const fx = (() => {
  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w = 0, h = 0;

  const hearts = [];
  const confetti = [];

  // Performance / intensity controls
  let mode = 'auto'; // auto|high|low|off
  let heartRatePerSec = 10; // spawn rate
  let maxHearts = 90;
  let heartShadowBlur = 10;
  let maxDpr = 1.5;

  function resize() {
    const dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(a,b){return a + Math.random()*(b-a)}

  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s, y - s, x - 2*s, y + s/3, x, y + 2*s);
    ctx.bezierCurveTo(x + 2*s, y + s/3, x + s, y - s, x, y);
    ctx.closePath();
  }

  function spawnHeart() {
    if (hearts.length >= maxHearts) return;
    hearts.push({
      x: rand(0, w),
      y: h + rand(10, 120),
      s: rand(6, 13),
      vy: rand(0.35, 0.85),
      vx: rand(-0.16, 0.16),
      a: rand(0.38, 0.72),
      hue: rand(290, 340)
    });
  }

  function confettiBurst(n=100) {
    if (mode === 'off') return;

    // scale down confetti in low mode
    const scale = (mode === 'low') ? 0.55 : 1;
    n = Math.floor(n * scale);

    const originX = w * rand(0.30, 0.70);
    const originY = h * rand(0.18, 0.35);

    for (let i = 0; i < n; i++) {
      const speed = rand(2.4, 6.4) * (mode === 'low' ? 0.85 : 1);
      const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      confetti.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        g: rand(0.05, 0.11),
        r: rand(2, 4),
        a: 1,
        spin: rand(-0.22, 0.22),
        rot: rand(0, Math.PI * 2),
        hue: rand(170, 330)
      });
    }
  }

  function applyFxMode(nextMode) {
    mode = nextMode;

    // Auto: be kind to mobile + low-end devices
    const minSide = Math.min(window.innerWidth, window.innerHeight);
    const isMobileish = minSide < 820;
    const lowCpu = (navigator && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let effective = mode;
    if (mode === 'auto') {
      effective = (prefersReduced || isMobileish || lowCpu) ? 'low' : 'high';
    }

    if (effective === 'high') {
      heartRatePerSec = 10;
      maxHearts = 70;
      heartShadowBlur = 9;
      maxDpr = 1.35;
      canvas.style.display = 'block';
    } else if (effective === 'low') {
      heartRatePerSec = 3;
      maxHearts = 26;
      heartShadowBlur = 4;
      maxDpr = 1.15;
      canvas.style.display = 'block';
    } else if (effective === 'off') {
      heartRatePerSec = 0;
      maxHearts = 0;
      heartShadowBlur = 0;
      canvas.style.display = 'none';
      hearts.length = 0;
      confetti.length = 0;
    }

    resize();
  }

  // Time-based loop (prevents “spawn every frame”)
  let last = performance.now();
  let heartAcc = 0;

  function step(now) {
    const dt = Math.min(0.033, (now - last) / 1000); // cap dt
    last = now;

    if (mode === 'off') {
      requestAnimationFrame(step);
      return;
    }

    ctx.clearRect(0,0,w,h);

    // Hearts: time-based spawn
    heartAcc += dt * heartRatePerSec;
    while (heartAcc >= 1) {
      spawnHeart();
      heartAcc -= 1;
    }

    for (let i = hearts.length - 1; i >= 0; i--) {
      const p = hearts[i];
      p.x += p.vx * (dt * 60);
      p.y -= p.vy * (dt * 60);
      p.a -= 0.0011 * (dt * 60);

      if (p.y < -40 || p.a <= 0) {
        hearts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${p.a})`;
      ctx.shadowColor = `hsla(${p.hue}, 95%, 70%, ${Math.min(0.45, p.a)})`;
      ctx.shadowBlur = heartShadowBlur;
      heartPath(p.x, p.y, p.s);
      ctx.fill();
      ctx.restore();
    }

    // Confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.vy += c.g * (dt * 60);
      c.x += c.vx * (dt * 60);
      c.y += c.vy * (dt * 60);
      c.vx *= Math.pow(0.995, dt * 60);
      c.a -= 0.010 * (dt * 60);
      c.rot += c.spin * (dt * 60);

      if (c.y > h + 30 || c.a <= 0) {
        confetti.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha = Math.max(0, c.a);
      ctx.fillStyle = `hsla(${c.hue}, 95%, 62%, ${c.a})`;
      ctx.shadowColor = `hsla(${c.hue}, 95%, 62%, ${Math.min(0.25, c.a)})`;
      ctx.shadowBlur = (mode === 'low') ? 4 : 8;
      ctx.fillRect(-c.r, -c.r, c.r * 2.2, c.r * 1.6);
      ctx.restore();
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  applyFxMode('auto');
  requestAnimationFrame(step);

  return { confettiBurst, applyFxMode };
})();

function initFxMode() {
  const sel = document.getElementById('fxSelect');
  if (!sel) return;

  // Default to LOW on mobile unless user chose otherwise
  const minSide = Math.min(window.innerWidth, window.innerHeight);
  const defaultMode = (minSide < 820) ? 'low' : 'auto';

  const stored = localStorage.getItem('fxMode') || defaultMode;
  sel.value = stored;
  fx.applyFxMode(stored);

  sel.addEventListener('change', () => {
    const v = sel.value;
    localStorage.setItem('fxMode', v);
    fx.applyFxMode(v);

    if (v !== 'off') fx.confettiBurst(40);
  });
}

function initButtons() {
  const btn = document.getElementById('confettiBtn');
  if (btn) btn.addEventListener('click', () => fx.confettiBurst(120));
}

// Boot
initPasswordGate();
initTheme();
initFxMode();
initGallery();
initCountdown();
initSurprise();
initMusic();
initButtons();

