(() => {
  // -------------------- TOAST --------------------
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1400);
  }

  // -------------------- IST CLOCK --------------------
  const istTimeEl = document.getElementById("istTime");
  const istDateEl = document.getElementById("istDate");

  function startISTClock() {
    if (!istTimeEl || !istDateEl) return;

    const timeFmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const dateFmt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const tick = () => {
      const now = new Date();
      istTimeEl.textContent = `${timeFmt.format(now)} IST`;
      istDateEl.textContent = dateFmt.format(now);
    };

    tick();
    setInterval(tick, 1000);
  }

  // -------------------- TIMER --------------------
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

  function setStatus(text) {
    if (statusText) statusText.textContent = text;
  }

  function setButtons() {
    if (!startBtn || !pauseBtn) return;

    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;

    const dur = currentDuration();
    const started = remaining < dur;
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

    const dur = currentDuration();
    const ratio = Math.max(0, Math.min(1, remaining / dur));
    if (progressBar) progressBar.style.width = `${ratio * 100}%`;

    renderMeta();
    setButtons();
  }

  function stopTimer() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    setButtons();
    updateSpotifyLockState(); // integrate
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
        updateSpotifyLockState(); // phase changed
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
    updateSpotifyLockState();
  }

  function setPhase(newPhase) {
    stopTimer();
    phase = newPhase;
    remaining = currentDuration();
    setStatus("Ready");
    render();
    updateSpotifyLockState();
  }

  // Preset click updates timer immediately and resets to focus
  function switchPreset(newKey) {
    if (!PRESETS[newKey]) return;
    stopTimer();
    presetKey = newKey;
    phase = "focus";
    remaining = currentDuration();
    setActivePresetUI();
    setStatus("Ready");
    render();
    updateSpotifyLockState();
  }

  // -------------------- SPOTIFY MODULE --------------------
  // Vibes (you can replace these URLs later)
  // embedUrl must be spotify.com/embed/... and openUrl is spotify.com/...
 const SPOTIFY_VIBES = [
  {
    key: "lofi",
    label: "Lofi Beats",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M",
    openUrl:  "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
  },
  {
    key: "deep",
    label: "Deep Focus",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ",
    openUrl:  "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
  },
  {
    key: "rain",
    label: "Rain",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4PP3DA4J0N8",
    openUrl:  "https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8",
  },
];

  const LS = {
    vibe: "spotify_selected_vibe",
    collapsed: "spotify_collapsed",
    size: "spotify_size",
    focusLock: "spotify_focus_lock",
  };

  function safeGetBool(key, fallback) {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "1";
  }
  function safeGetStr(key, fallback) {
    const v = localStorage.getItem(key);
    return (v === null || v === "") ? fallback : v;
  }

  let spSelectedKey = safeGetStr(LS.vibe, "lofi");
  if (!SPOTIFY_VIBES.find(v => v.key === spSelectedKey)) spSelectedKey = "lofi";

  let spCollapsed = safeGetBool(LS.collapsed, false);
  let spSize = safeGetStr(LS.size, "mini");
  if (spSize !== "mini" && spSize !== "full") spSize = "mini";

  let spFocusLockEnabled = safeGetBool(LS.focusLock, true);

  // Elements (sidebar)
  const spNowSide = document.getElementById("spNowSide");
  const spStatusSide = document.getElementById("spStatusSide");
  const spMetaSide = document.getElementById("spMetaSide");
  const spBodySide = document.getElementById("spBodySide");
  const spIframeSide = document.getElementById("spIframeSide");
  const spVibesSide = document.getElementById("spVibesSide");
  const spCollapseSide = document.getElementById("spCollapseSide");
  const spOpenSide = document.getElementById("spOpenSide");
  const spCopySide = document.getElementById("spCopySide");
  const spMiniSide = document.getElementById("spMiniSide");
  const spFullSide = document.getElementById("spFullSide");

  // Elements (drawer)
  const spNowDrawer = document.getElementById("spNowDrawer");
  const spStatusDrawer = document.getElementById("spStatusDrawer");
  const spMetaDrawer = document.getElementById("spMetaDrawer");
  const spBodyDrawer = document.getElementById("spBodyDrawer");
  const spIframeDrawer = document.getElementById("spIframeDrawer");
  const spVibesDrawer = document.getElementById("spVibesDrawer");
  const spCollapseDrawer = document.getElementById("spCollapseDrawer");
  const spOpenDrawer = document.getElementById("spOpenDrawer");
  const spCopyDrawer = document.getElementById("spCopyDrawer");
  const spMiniDrawer = document.getElementById("spMiniDrawer");
  const spFullDrawer = document.getElementById("spFullDrawer");

  function getSelectedVibe() {
    return SPOTIFY_VIBES.find(v => v.key === spSelectedKey) || SPOTIFY_VIBES[0];
  }

  function isMobileLayout() {
    return window.matchMedia("(max-width: 860px)").matches;
  }

  function setIframeHeight(iframeEl, size) {
    if (!iframeEl) return;
    iframeEl.height = (size === "full") ? "420" : "152";
  }

  function setSegButtons(miniBtn, fullBtn, size) {
    if (!miniBtn || !fullBtn) return;
    miniBtn.classList.toggle("is-active", size === "mini");
    fullBtn.classList.toggle("is-active", size === "full");
  }

  function setCollapseBtn(btnEl, collapsed) {
    if (!btnEl) return;
    btnEl.textContent = collapsed ? "▸" : "▾";
  }

  function setLockedUI(containerId, locked) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.classList.toggle("spotifyLocked", locked);
  }

  function setVibeChips(container, onClick) {
    if (!container) return;
    container.innerHTML = "";
    for (const v of SPOTIFY_VIBES) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vibeChip" + (v.key === spSelectedKey ? " is-active" : "");
      btn.textContent = v.label;
      btn.addEventListener("click", () => onClick(v.key));
      container.appendChild(btn);
    }
  }

  function updateVibeChipActive(container) {
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll(".vibeChip"));
    for (const b of buttons) {
      b.classList.toggle("is-active", b.textContent === (getSelectedVibe().label));
    }
    // safer: match by order
    const vibe = getSelectedVibe();
    buttons.forEach((btn, idx) => {
      const key = SPOTIFY_VIBES[idx]?.key;
      btn.classList.toggle("is-active", key === vibe.key);
    });
  }

  function applySpotifyTo(sideOrDrawer) {
    const vibe = getSelectedVibe();
    const isSide = sideOrDrawer === "side";

    const nowEl = isSide ? spNowSide : spNowDrawer;
    const statusEl = isSide ? spStatusSide : spStatusDrawer;
    const metaEl = isSide ? spMetaSide : spMetaDrawer;
    const bodyEl = isSide ? spBodySide : spBodyDrawer;
    const iframeEl = isSide ? spIframeSide : spIframeDrawer;
    const vibesEl = isSide ? spVibesSide : spVibesDrawer;
    const collapseBtn = isSide ? spCollapseSide : spCollapseDrawer;
    const miniBtn = isSide ? spMiniSide : spMiniDrawer;
    const fullBtn = isSide ? spFullSide : spFullDrawer;

    if (nowEl) nowEl.textContent = vibe.label;

    // collapse state
    if (bodyEl) bodyEl.style.display = spCollapsed ? "none" : "block";
    setCollapseBtn(collapseBtn, spCollapsed);

    // size state
    setIframeHeight(iframeEl, spSize);
    setSegButtons(miniBtn, fullBtn, spSize);

    // iframe src
    if (iframeEl) iframeEl.src = vibe.embedUrl + "?utm_source=generator";

    // vibe chips
    setVibeChips(vibesEl, (key) => switchSpotifyVibe(key));
    updateVibeChipActive(vibesEl);

    // locked state text/meta
    const lockedNow = computeSpotifyLockedNow();
    const lockText = lockedNow ? "Locked (Focus running)" : "Unlocked";
    if (statusEl) statusEl.textContent = lockText;
    if (metaEl) metaEl.textContent = `Mode: ${spSize === "full" ? "Full" : "Mini"} • Status: ${lockedNow ? "Locked" : "Unlocked"}`;
  }

  function computeSpotifyLockedNow() {
    return spFocusLockEnabled && isRunning && phase === "focus";
  }

  function updateSpotifyLockState() {
    const lockedNow = computeSpotifyLockedNow();

    // Optionally auto-collapse when lock starts
    // (Feels clean. If you don't want it, delete this block.)
    if (lockedNow && !spCollapsed) {
      spCollapsed = true;
      localStorage.setItem(LS.collapsed, "1");
    }

    // Apply to both views
    applySpotifyTo("side");
    applySpotifyTo("drawer");

    // Disable switching controls when locked
    setSpotifyControlsEnabled(!lockedNow);

    // Add subtle locked styling
    setLockedUI("spotifySidebarCard", lockedNow);
    setLockedUI("spotifyDrawerCard", lockedNow);
  }

  function setSpotifyControlsEnabled(enabled) {
    // When locked, we still allow Open/Copy and Collapse, but block vibe & size toggles
    const disable = !enabled;

    const vibeBtnsSide = spVibesSide ? Array.from(spVibesSide.querySelectorAll("button")) : [];
    const vibeBtnsDrawer = spVibesDrawer ? Array.from(spVibesDrawer.querySelectorAll("button")) : [];

    vibeBtnsSide.forEach(b => b.disabled = disable);
    vibeBtnsDrawer.forEach(b => b.disabled = disable);

    if (spMiniSide) spMiniSide.disabled = disable;
    if (spFullSide) spFullSide.disabled = disable;
    if (spMiniDrawer) spMiniDrawer.disabled = disable;
    if (spFullDrawer) spFullDrawer.disabled = disable;
  }

  function switchSpotifyVibe(newKey) {
    if (!SPOTIFY_VIBES.find(v => v.key === newKey)) return;

    // Block switching when locked (focus running)
    if (computeSpotifyLockedNow()) {
      toast("Locked during focus");
      return;
    }

    spSelectedKey = newKey;
    localStorage.setItem(LS.vibe, spSelectedKey);

    applySpotifyTo("side");
    applySpotifyTo("drawer");
    toast(`Vibe: ${getSelectedVibe().label}`);
  }

  function toggleSpotifyCollapse() {
    spCollapsed = !spCollapsed;
    localStorage.setItem(LS.collapsed, spCollapsed ? "1" : "0");
    applySpotifyTo("side");
    applySpotifyTo("drawer");
  }

  function setSpotifySize(size) {
    if (size !== "mini" && size !== "full") return;

    if (computeSpotifyLockedNow()) {
      toast("Locked during focus");
      return;
    }

    spSize = size;
    localStorage.setItem(LS.size, spSize);
    applySpotifyTo("side");
    applySpotifyTo("drawer");
    toast(`Player: ${spSize.toUpperCase()}`);
  }

  function openSpotify() {
    const vibe = getSelectedVibe();
    window.open(vibe.openUrl, "_blank", "noopener,noreferrer");
  }

  async function copySpotifyLink() {
    const vibe = getSelectedVibe();
    try {
      await navigator.clipboard.writeText(vibe.openUrl);
      toast("Copied Spotify link");
    } catch {
      // fallback: prompt
      window.prompt("Copy this link:", vibe.openUrl);
    }
  }

  // Wire spotify buttons (side)
  if (spCollapseSide) spCollapseSide.addEventListener("click", toggleSpotifyCollapse);
  if (spOpenSide) spOpenSide.addEventListener("click", openSpotify);
  if (spCopySide) spCopySide.addEventListener("click", copySpotifyLink);
  if (spMiniSide) spMiniSide.addEventListener("click", () => setSpotifySize("mini"));
  if (spFullSide) spFullSide.addEventListener("click", () => setSpotifySize("full"));

  // Wire spotify buttons (drawer)
  if (spCollapseDrawer) spCollapseDrawer.addEventListener("click", toggleSpotifyCollapse);
  if (spOpenDrawer) spOpenDrawer.addEventListener("click", openSpotify);
  if (spCopyDrawer) spCopyDrawer.addEventListener("click", copySpotifyLink);
  if (spMiniDrawer) spMiniDrawer.addEventListener("click", () => setSpotifySize("mini"));
  if (spFullDrawer) spFullDrawer.addEventListener("click", () => setSpotifySize("full"));

  // -------------------- MOBILE DRAWER --------------------
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

  // Basic swipe-down to close (mobile)
  let startY = null;
  if (drawer) {
    drawer.addEventListener("touchstart", (e) => {
      startY = e.touches?.[0]?.clientY ?? null;
    }, { passive: true });

    drawer.addEventListener("touchmove", (e) => {
      if (startY === null) return;
      const y = e.touches?.[0]?.clientY ?? startY;
      const dy = y - startY;
      if (dy > 80) {
        startY = null;
        closeDrawer();
      }
    }, { passive: true });

    drawer.addEventListener("touchend", () => { startY = null; }, { passive: true });
  }

  // -------------------- KEYBOARD SHORTCUTS --------------------
  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

    const k = e.key.toLowerCase();

    if (e.code === "Space") {
      e.preventDefault();
      isRunning ? pauseTimer() : startTimer();
      return;
    }

    if (k === "r") { resetTimer(); return; }
    if (k === "s") { switchPhase(); return; }

    if (k === "m") { toggleSpotifyCollapse(); return; }
    if (k === "v") { setSpotifySize(spSize === "mini" ? "full" : "mini"); return; }
    if (k === "o") { openSpotify(); return; }
    if (k === "c") { copySpotifyLink(); return; }
    if (k === "escape") { closeDrawer(); return; }
  });

  // -------------------- TIMER EVENTS --------------------
  if (startBtn) startBtn.addEventListener("click", startTimer);
  if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
  if (resetBtn) resetBtn.addEventListener("click", resetTimer);
  if (switchBtn) switchBtn.addEventListener("click", switchPhase);

  if (focusChip) focusChip.addEventListener("click", () => setPhase("focus"));
  if (breakChip) breakChip.addEventListener("click", () => setPhase("break"));

  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => switchPreset(btn.getAttribute("data-preset")));
  });

  // -------------------- INIT --------------------
  startISTClock();
  setActivePresetUI();
  render();
  applySpotifyTo("side");
  applySpotifyTo("drawer");
  updateSpotifyLockState();

  // If on mobile, keep sidebar spotify hidden; drawer gets the player
  window.addEventListener("resize", () => {
    // Re-apply so the drawer/sidebar stays consistent after resize
    applySpotifyTo("side");
    applySpotifyTo("drawer");
    updateSpotifyLockState();
    // Close drawer when switching to desktop
    if (!isMobileLayout()) closeDrawer();
  });
})();
