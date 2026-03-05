(() => {
  // ---------- Toast ----------
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1400);
  }

  // ---------- IST Clock ----------
  const istTimeEl = document.getElementById("istTime");
  const istDateEl = document.getElementById("istDate");
  function startISTClock() {
    if (!istTimeEl || !istDateEl) return;
    const timeFmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    const dateFmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short", day: "2-digit", month: "short", year: "numeric"
    });
    const tick = () => {
      const now = new Date();
      istTimeEl.textContent = `${timeFmt.format(now)} IST`;
      istDateEl.textContent = dateFmt.format(now);
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---------- Background particles ----------
  const pCanvas = document.getElementById("particles");
  const pCtx = pCanvas?.getContext("2d");
  let particles = [];
  function resizeParticles() {
    if (!pCanvas || !pCtx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    pCanvas.width = Math.floor(window.innerWidth * dpr);
    pCanvas.height = Math.floor(window.innerHeight * dpr);
    pCanvas.style.width = "100%";
    pCanvas.style.height = "100%";
    pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 22000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.6 + Math.random() * 1.6,
      vx: -0.12 + Math.random() * 0.24,
      vy: -0.10 + Math.random() * 0.20,
      a: 0.12 + Math.random() * 0.25
    }));
  }
  function animParticles() {
    if (!pCanvas || !pCtx) return;
    pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pCtx.fillStyle = "rgba(160,200,255,0.7)";
    for (const pt of particles) {
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.x < -10) pt.x = window.innerWidth + 10;
      if (pt.x > window.innerWidth + 10) pt.x = -10;
      if (pt.y < -10) pt.y = window.innerHeight + 10;
      if (pt.y > window.innerHeight + 10) pt.y = -10;

      pCtx.globalAlpha = pt.a;
      pCtx.beginPath();
      pCtx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      pCtx.fill();
    }
    pCtx.globalAlpha = 1;
    requestAnimationFrame(animParticles);
  }

  // ---------- Timer ----------
  const PRESETS = {
    normal:   { name: "Normal",   focus: 25 * 60, brk:  5 * 60 },
    focus:    { name: "Focus",    focus: 45 * 60, brk: 15 * 60 },
    revision: { name: "Revision", focus: 10 * 60, brk:  3 * 60 },
  };

  const timeDisplay = document.getElementById("timeDisplay");
  const statusText  = document.getElementById("statusText");
  const progressBar = document.getElementById("progressBar");

  const presetPill = document.getElementById("presetPill");
  const phasePill  = document.getElementById("phasePill");
  const focusLen   = document.getElementById("focusLen");
  const breakLen   = document.getElementById("breakLen");

  const startBtn  = document.getElementById("startBtn");
  const pauseBtn  = document.getElementById("pauseBtn");
  const resetBtn  = document.getElementById("resetBtn");
  const switchBtn = document.getElementById("switchBtn");

  const focusChip = document.getElementById("focusChip");
  const breakChip = document.getElementById("breakChip");

  const presetButtons = Array.from(document.querySelectorAll(".preset[data-preset]"));

  let presetKey = "normal";
  let phase = "focus"; // "focus" | "break"
  let remaining = PRESETS[presetKey].focus;
  let intervalId = null;
  let isRunning = false;

  const pad2 = (n) => String(n).padStart(2, "0");
  const fmt = (seconds) => `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`;

  function currentDuration() {
    const p = PRESETS[presetKey];
    return phase === "focus" ? p.focus : p.brk;
  }
  function setStatus(t) { if (statusText) statusText.textContent = t; }

  function setButtons() {
    if (!startBtn || !pauseBtn) return;
    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
    const started = remaining < currentDuration();
    startBtn.textContent = isRunning ? "Running…" : (started ? "Resume" : "Start");
  }

  function setActivePresetUI() {
    presetButtons.forEach(btn => {
      const key = btn.getAttribute("data-preset");
      const active = key === presetKey;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function setPhaseChips() {
    if (!focusChip || !breakChip) return;
    const isFocus = phase === "focus";
    focusChip.classList.toggle("is-active", isFocus);
    breakChip.classList.toggle("is-active", !isFocus);
  }

  function renderMeta() {
    const p = PRESETS[presetKey];
    if (presetPill) presetPill.textContent = p.name;
    if (phasePill) phasePill.textContent = phase === "focus" ? "Focus" : "Break";
    if (focusLen) focusLen.textContent = fmt(p.focus);
    if (breakLen) breakLen.textContent = fmt(p.brk);
    setPhaseChips();
  }

  function render() {
    if (timeDisplay) timeDisplay.textContent = fmt(remaining);
    const ratio = Math.max(0, Math.min(1, remaining / currentDuration()));
    if (progressBar) progressBar.style.width = `${ratio * 100}%`;
    renderMeta();
    setButtons();
    updateSpotifyLockState();
    updateSnakeAvailability();
  }

  function stopTimer() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    setButtons();
    updateSpotifyLockState();
  }

  function autoSwitchPhase() {
    phase = (phase === "focus") ? "break" : "focus";
    remaining = currentDuration();
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      stopTimer();
      render();
      setStatus("Time’s up! Switching…");
      setTimeout(() => {
        autoSwitchPhase();
        setStatus("Ready");
        render();
      }, 600);
      return;
    }
    render();
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    setButtons();
    setStatus(`${phase === "focus" ? "Focus" : "Break"} running…`);
    intervalId = setInterval(tick, 1000);
    updateSpotifyLockState();
  }

  function pauseTimer() {
    if (!isRunning) return;
    stopTimer();
    setStatus("Paused");
    render();
  }

  function resetTimer() {
    stopTimer();
    remaining = currentDuration();
    setStatus("Ready");
    render();
  }

  function switchPhase() {
    stopTimer();
    phase = (phase === "focus") ? "break" : "focus";
    remaining = currentDuration();
    setStatus("Ready");
    render();
  }

  function setPhase(newPhase) {
    stopTimer();
    phase = newPhase;
    remaining = currentDuration();
    setStatus("Ready");
    render();
  }

  function switchPreset(newKey) {
    if (!PRESETS[newKey]) return;
    stopTimer();
    presetKey = newKey;
    phase = "focus";
    remaining = currentDuration();
    setActivePresetUI();
    setStatus("Ready");
    render();
  }

  // ---------- Spotify (3 vibes only) ----------
  const SPOTIFY_VIBES = [
    { key:"lofi", label:"Lofi Beats",
      embedUrl:"https://open.spotify.com/embed/playlist//37i9dQZF1DWWQRwui0ExPn?si=k2QN_b5qRzePiLKgP2Kqiw",
      openUrl:"https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn?si=k2QN_b5qRzePiLKgP2Kqiw" },
    { key:"deep", label:"Deep Focus",
      embedUrl:"https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
      openUrl:"https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ" },
    { key:"rain", label:"Rain",
      embedUrl:"https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8",
      openUrl:"https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8" },
  ];

  const LS = {
    vibe: "spotify_selected_vibe",
    collapsed: "spotify_collapsed",
    size: "spotify_size",
    focusLock: "spotify_focus_lock",
  };

  const safeGetBool = (k, fb) => (localStorage.getItem(k) ?? (fb ? "1" : "0")) === "1";
  const safeGetStr  = (k, fb) => (localStorage.getItem(k) ?? fb);

  let spSelectedKey = safeGetStr(LS.vibe, "lofi");
  if (!SPOTIFY_VIBES.find(v => v.key === spSelectedKey)) spSelectedKey = "lofi";

  let spCollapsed = safeGetBool(LS.collapsed, false);
  let spSize = safeGetStr(LS.size, "mini");
  if (spSize !== "mini" && spSize !== "full") spSize = "mini";

  let spFocusLockEnabled = safeGetBool(LS.focusLock, true); // ON by default

  const sp = {
    // sidebar
    nowSide: document.getElementById("spNowSide"),
    statusSide: document.getElementById("spStatusSide"),
    metaSide: document.getElementById("spMetaSide"),
    bodySide: document.getElementById("spBodySide"),
    iframeSide: document.getElementById("spIframeSide"),
    vibesSide: document.getElementById("spVibesSide"),
    collapseSide: document.getElementById("spCollapseSide"),
    openSide: document.getElementById("spOpenSide"),
    copySide: document.getElementById("spCopySide"),
    miniSide: document.getElementById("spMiniSide"),
    fullSide: document.getElementById("spFullSide"),
    // drawer
    nowDrawer: document.getElementById("spNowDrawer"),
    statusDrawer: document.getElementById("spStatusDrawer"),
    metaDrawer: document.getElementById("spMetaDrawer"),
    bodyDrawer: document.getElementById("spBodyDrawer"),
    iframeDrawer: document.getElementById("spIframeDrawer"),
    vibesDrawer: document.getElementById("spVibesDrawer"),
    collapseDrawer: document.getElementById("spCollapseDrawer"),
    openDrawer: document.getElementById("spOpenDrawer"),
    copyDrawer: document.getElementById("spCopyDrawer"),
    miniDrawer: document.getElementById("spMiniDrawer"),
    fullDrawer: document.getElementById("spFullDrawer"),
  };

  function selectedVibe() {
    return SPOTIFY_VIBES.find(v => v.key === spSelectedKey) || SPOTIFY_VIBES[0];
  }

  function computeSpotifyLockedNow() {
    return spFocusLockEnabled && isRunning && phase === "focus";
  }

  function setIframeHeight(iframeEl) {
    if (!iframeEl) return;
    iframeEl.height = (spSize === "full") ? "420" : "152";
  }

  function setCollapseIcon(btn) {
    if (!btn) return;
    btn.textContent = spCollapsed ? "▸" : "▾";
  }

  function setSeg(miniBtn, fullBtn) {
    if (!miniBtn || !fullBtn) return;
    miniBtn.classList.toggle("is-active", spSize === "mini");
    fullBtn.classList.toggle("is-active", spSize === "full");
  }

  function renderVibes(container) {
    if (!container) return;
    container.innerHTML = "";
    for (const v of SPOTIFY_VIBES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "vibeChip" + (v.key === spSelectedKey ? " is-active" : "");
      b.textContent = v.label;
      b.addEventListener("click", () => switchSpotifyVibe(v.key));
      container.appendChild(b);
    }
  }

  function applySpotify(where) {
    const isSide = where === "side";
    const vibe = selectedVibe();
    const locked = computeSpotifyLockedNow();

    const nowEl = isSide ? sp.nowSide : sp.nowDrawer;
    const statusEl = isSide ? sp.statusSide : sp.statusDrawer;
    const metaEl = isSide ? sp.metaSide : sp.metaDrawer;
    const bodyEl = isSide ? sp.bodySide : sp.bodyDrawer;
    const iframeEl = isSide ? sp.iframeSide : sp.iframeDrawer;
    const vibesEl = isSide ? sp.vibesSide : sp.vibesDrawer;
    const collapseBtn = isSide ? sp.collapseSide : sp.collapseDrawer;
    const miniBtn = isSide ? sp.miniSide : sp.miniDrawer;
    const fullBtn = isSide ? sp.fullSide : sp.fullDrawer;

    if (nowEl) nowEl.textContent = vibe.label;
    if (statusEl) statusEl.textContent = locked ? "Locked (focus running)" : "Unlocked";
    if (metaEl) metaEl.textContent = `Mode: ${spSize.toUpperCase()} • Status: ${locked ? "Locked" : "Unlocked"}`;

    if (bodyEl) bodyEl.style.display = spCollapsed ? "none" : "block";
    setCollapseIcon(collapseBtn);

    if (iframeEl) iframeEl.src = vibe.embedUrl + "?utm_source=generator";
    setIframeHeight(iframeEl);
    setSeg(miniBtn, fullBtn);

    renderVibes(vibesEl);

    // disable vibe/size switching while locked
    const disable = locked;
    if (vibesEl) vibesEl.querySelectorAll("button").forEach(b => (b.disabled = disable));
    if (miniBtn) miniBtn.disabled = disable;
    if (fullBtn) fullBtn.disabled = disable;

    // subtle lock style
    const cardId = isSide ? "spotifySidebarCard" : "spotifyDrawerCard";
    const card = document.getElementById(cardId);
    if (card) card.classList.toggle("spotifyLocked", locked);
  }

  function updateSpotifyLockState() {
    // optional: auto-collapse when lock starts
    if (computeSpotifyLockedNow() && !spCollapsed) {
      spCollapsed = true;
      localStorage.setItem(LS.collapsed, "1");
    }
    applySpotify("side");
    applySpotify("drawer");
  }

  function switchSpotifyVibe(key) {
    if (!SPOTIFY_VIBES.find(v => v.key === key)) return;
    if (computeSpotifyLockedNow()) return toast("Locked during focus");
    spSelectedKey = key;
    localStorage.setItem(LS.vibe, spSelectedKey);
    applySpotify("side");
    applySpotify("drawer");
    toast(`Vibe: ${selectedVibe().label}`);
  }

  function toggleSpotifyCollapse() {
    spCollapsed = !spCollapsed;
    localStorage.setItem(LS.collapsed, spCollapsed ? "1" : "0");
    applySpotify("side");
    applySpotify("drawer");
  }

  function setSpotifySize(size) {
    if (computeSpotifyLockedNow()) return toast("Locked during focus");
    spSize = size;
    localStorage.setItem(LS.size, spSize);
    applySpotify("side");
    applySpotify("drawer");
    toast(`Player: ${spSize.toUpperCase()}`);
  }

  function openSpotify() {
    window.open(selectedVibe().openUrl, "_blank", "noopener,noreferrer");
  }

  async function copySpotifyLink() {
    const url = selectedVibe().openUrl;
    try {
      await navigator.clipboard.writeText(url);
      toast("Copied Spotify link");
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  // hook spotify buttons
  if (sp.collapseSide) sp.collapseSide.addEventListener("click", toggleSpotifyCollapse);
  if (sp.openSide) sp.openSide.addEventListener("click", openSpotify);
  if (sp.copySide) sp.copySide.addEventListener("click", copySpotifyLink);
  if (sp.miniSide) sp.miniSide.addEventListener("click", () => setSpotifySize("mini"));
  if (sp.fullSide) sp.fullSide.addEventListener("click", () => setSpotifySize("full"));

  if (sp.collapseDrawer) sp.collapseDrawer.addEventListener("click", toggleSpotifyCollapse);
  if (sp.openDrawer) sp.openDrawer.addEventListener("click", openSpotify);
  if (sp.copyDrawer) sp.copyDrawer.addEventListener("click", copySpotifyLink);
  if (sp.miniDrawer) sp.miniDrawer.addEventListener("click", () => setSpotifySize("mini"));
  if (sp.fullDrawer) sp.fullDrawer.addEventListener("click", () => setSpotifySize("full"));

  // ---------- Mobile drawer ----------
  const musicFab = document.getElementById("musicFab");
  const drawer = document.getElementById("drawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");

  function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.add("open");
    drawerBackdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.remove("open");
    drawerBackdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    drawerBackdrop.setAttribute("aria-hidden", "true");
  }

  if (musicFab) musicFab.addEventListener("click", openDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);

  // ---------- Snake (break only) ----------
  const openSnakeBtn = document.getElementById("openSnakeBtn");
  const snakeAvail = document.getElementById("snakeAvail");
  const snakeBackdrop = document.getElementById("snakeBackdrop");
  const snakeModal = document.getElementById("snakeModal");
  const snakeCloseBtn = document.getElementById("snakeCloseBtn");
  const snakeCanvas = document.getElementById("snakeCanvas");
  const snakeScoreEl = document.getElementById("snakeScore");
  const snakeHighEl = document.getElementById("snakeHigh");

  const SNAKE_LS_HIGH = "snake_high_score_v1";
  let snakeHigh = Number(localStorage.getItem(SNAKE_LS_HIGH) || "0");
  if (snakeHighEl) snakeHighEl.textContent = String(snakeHigh);

  function canPlaySnake() {
    return phase === "break"; // only during break phase
  }

  function updateSnakeAvailability() {
    const ok = canPlaySnake();
    if (openSnakeBtn) openSnakeBtn.disabled = !ok;
    if (snakeAvail) snakeAvail.textContent = ok ? "Available" : "Break only";
  }

  function openSnake() {
    if (!canPlaySnake()) return toast("Snake is only available during break");
    if (!snakeModal || !snakeBackdrop) return;
    snakeModal.classList.add("open");
    snakeBackdrop.classList.add("open");
    snakeModal.setAttribute("aria-hidden", "false");
    snakeBackdrop.setAttribute("aria-hidden", "false");
    startSnakeGame();
  }

  function closeSnake() {
    if (!snakeModal || !snakeBackdrop) return;
    snakeModal.classList.remove("open");
    snakeBackdrop.classList.remove("open");
    snakeModal.setAttribute("aria-hidden", "true");
    snakeBackdrop.setAttribute("aria-hidden", "true");
    stopSnakeGame();
  }

  if (openSnakeBtn) openSnakeBtn.addEventListener("click", openSnake);
  if (snakeCloseBtn) snakeCloseBtn.addEventListener("click", closeSnake);
  if (snakeBackdrop) snakeBackdrop.addEventListener("click", closeSnake);

  // Snake implementation (simple, smooth)
  const ctx = snakeCanvas?.getContext("2d");
  const grid = 18;          // 18x18 board
  const cell = 20;          // logical cell size for drawing
  const sizePx = grid * cell;

  let snakeTimer = null;
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 8, y: 8 };
  let score = 0;

  function randFood() {
    while (true) {
      const x = Math.floor(Math.random() * grid);
      const y = Math.floor(Math.random() * grid);
      if (!snake.some(s => s.x === x && s.y === y)) return { x, y };
    }
  }

  function resetSnake() {
    snake = [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = randFood();
    score = 0;
    if (snakeScoreEl) snakeScoreEl.textContent = "0";
  }

  function drawSnake() {
    if (!ctx || !snakeCanvas) return;

    // fit canvas resolution to look crisp
    snakeCanvas.width = sizePx;
    snakeCanvas.height = sizePx;

    // background
    ctx.clearRect(0, 0, sizePx, sizePx);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, sizePx, sizePx);

    // grid dots (subtle)
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "rgba(160,200,255,1)";
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        if ((x + y) % 3 === 0) ctx.fillRect(x * cell + 9, y * cell + 9, 2, 2);
      }
    }
    ctx.globalAlpha = 1;

    // food
    ctx.fillStyle = "rgba(120,170,255,0.95)";
    ctx.beginPath();
    ctx.arc(food.x * cell + cell/2, food.y * cell + cell/2, cell*0.30, 0, Math.PI*2);
    ctx.fill();

    // snake
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      const alpha = 0.95 - i * 0.03;
      ctx.fillStyle = `rgba(200,230,255,${Math.max(0.45, alpha)})`;
      ctx.fillRect(seg.x * cell + 2, seg.y * cell + 2, cell - 4, cell - 4);
    }
  }

  function stepSnake() {
    // commit direction
    dir = nextDir;

    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // wrap around edges (feels nicer for break game)
    if (newHead.x < 0) newHead.x = grid - 1;
    if (newHead.x >= grid) newHead.x = 0;
    if (newHead.y < 0) newHead.y = grid - 1;
    if (newHead.y >= grid) newHead.y = 0;

    // collision with self
    if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      // game over -> save high, reset
      if (score > snakeHigh) {
        snakeHigh = score;
        localStorage.setItem(SNAKE_LS_HIGH, String(snakeHigh));
        if (snakeHighEl) snakeHighEl.textContent = String(snakeHigh);
      }
      toast("Game over!");
      resetSnake();
      drawSnake();
      return;
    }

    snake.unshift(newHead);

    // eat
    if (newHead.x === food.x && newHead.y === food.y) {
      score += 1;
      if (snakeScoreEl) snakeScoreEl.textContent = String(score);
      food = randFood();
    } else {
      snake.pop();
    }

    drawSnake();
  }

  function startSnakeGame() {
    if (!ctx) return;
    resetSnake();
    drawSnake();
    if (snakeTimer) clearInterval(snakeTimer);
    snakeTimer = setInterval(stepSnake, 110);
  }

  function stopSnakeGame() {
    if (snakeTimer) clearInterval(snakeTimer);
    snakeTimer = null;
  }

  // input: keyboard
  function setDir(dx, dy) {
    // prevent reversing
    if (dx === -dir.x && dy === -dir.y) return;
    nextDir = { x: dx, y: dy };
  }

  document.addEventListener("keydown", (e) => {
    // ignore when typing
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

    const k = e.key.toLowerCase();

    // timer keys
    if (e.code === "Space") { e.preventDefault(); isRunning ? pauseTimer() : startTimer(); return; }
    if (k === "r") { resetTimer(); return; }
    if (k === "s") { switchPhase(); return; }

    // spotify keys
    if (k === "m") { toggleSpotifyCollapse(); return; }
    if (k === "v") { setSpotifySize(spSize === "mini" ? "full" : "mini"); return; }
    if (k === "o") { openSpotify(); return; }
    if (k === "c") { copySpotifyLink(); return; }

    // snake keys
    if (k === "g") { openSnake(); return; }
    if (k === "escape") { closeSnake(); closeDrawer(); return; }

    if (snakeModal?.classList.contains("open")) {
      if (e.key === "ArrowUp") setDir(0, -1);
      else if (e.key === "ArrowDown") setDir(0, 1);
      else if (e.key === "ArrowLeft") setDir(-1, 0);
      else if (e.key === "ArrowRight") setDir(1, 0);
    }
  });

  // input: swipe (mobile) on snake canvas
  let sx = null, sy = null;
  if (snakeCanvas) {
    snakeCanvas.addEventListener("touchstart", (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      sx = t.clientX; sy = t.clientY;
    }, { passive: true });

    snakeCanvas.addEventListener("touchend", (e) => {
      if (sx === null || sy === null) return;
      const t = e.changedTouches?.[0];
      if (!t) return;
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      sx = sy = null;

      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;

      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
      else setDir(0, dy > 0 ? 1 : -1);
    }, { passive: true });
  }

  // ---------- Mobile drawer ----------
  function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.add("open");
    drawerBackdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.remove("open");
    drawerBackdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    drawerBackdrop.setAttribute("aria-hidden", "true");
  }
  if (musicFab) musicFab.addEventListener("click", openDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);

  // ---------- Wire timer UI ----------
  if (startBtn) startBtn.addEventListener("click", startTimer);
  if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
  if (resetBtn) resetBtn.addEventListener("click", resetTimer);
  if (switchBtn) switchBtn.addEventListener("click", switchPhase);
  if (focusChip) focusChip.addEventListener("click", () => setPhase("focus"));
  if (breakChip) breakChip.addEventListener("click", () => setPhase("break"));
  presetButtons.forEach(btn => btn.addEventListener("click", () => switchPreset(btn.getAttribute("data-preset"))));

  // ---------- Init ----------
  startISTClock();
  resizeParticles();
  animParticles();
  window.addEventListener("resize", resizeParticles);

  setActivePresetUI();
  updateSpotifyLockState();
  applySpotify("side");
  applySpotify("drawer");
  updateSnakeAvailability();
  render();
})();
