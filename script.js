(() => {
  // Presets in seconds
  const PRESETS = {
    normal:   { name: "Normal",   focus: 25 * 60, brk:  5 * 60 },
    focus:    { name: "Focus",    focus: 45 * 60, brk: 15 * 60 },
    revision: { name: "Revision", focus: 10 * 60, brk:  3 * 60 },
  };

  // Elements
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

  // State
  let presetKey = "normal";
  let phase = "focus"; // "focus" | "break"
  let remaining = PRESETS[presetKey].focus;

  let intervalId = null;
  let isRunning = false;

  // Helpers
  const pad2 = (n) => String(n).padStart(2, "0");
  const fmt = (seconds) => `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`;

  function currentDuration() {
    const p = PRESETS[presetKey];
    return phase === "focus" ? p.focus : p.brk;
  }

  function setStatus(text) {
    statusText.textContent = text;
  }

  function setButtons() {
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
    const isFocus = phase === "focus";
    focusChip.classList.toggle("is-active", isFocus);
    breakChip.classList.toggle("is-active", !isFocus);
  }

  function renderMeta() {
    const p = PRESETS[presetKey];
    presetPill.textContent = p.name;
    phasePill.textContent = phase === "focus" ? "Focus" : "Break";
    focusLen.textContent = fmt(p.focus);
    breakLen.textContent = fmt(p.brk);
    setPhaseChips();
  }

  function render() {
    timeDisplay.textContent = fmt(remaining);

    const dur = currentDuration();
    const ratio = Math.max(0, Math.min(1, remaining / dur));
    progressBar.style.width = `${ratio * 100}%`;

    renderMeta();
    setButtons();
  }

  function stopTimer() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    setButtons();
  }

  function setPhase(newPhase) {
    phase = newPhase;
    remaining = currentDuration();
    setStatus("Ready");
    render();
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

  // IMPORTANT: preset click updates timer immediately (and sets to Focus)
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

  // Events
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  switchBtn.addEventListener("click", switchPhase);

  focusChip.addEventListener("click", () => { stopTimer(); setPhase("focus"); });
  breakChip.addEventListener("click", () => { stopTimer(); setPhase("break"); });

  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => switchPreset(btn.getAttribute("data-preset")));
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

    if (e.code === "Space") {
      e.preventDefault();
      isRunning ? pauseTimer() : startTimer();
    } else if (e.key.toLowerCase() === "r") {
      resetTimer();
    } else if (e.key.toLowerCase() === "s") {
      switchPhase();
    }
  });

  // Init
  setActivePresetUI();
  render();
})();
