(() => {
  // Durations in seconds
  const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  // Elements
  const timeDisplay = document.getElementById("timeDisplay");
  const statusText  = document.getElementById("statusText");
  const progressBar = document.getElementById("progressBar");

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  const modeButtons = Array.from(document.querySelectorAll(".chip[data-mode]"));

  // State
  let mode = "focus";
  let remaining = DURATIONS[mode];
  let intervalId = null;
  let isRunning = false;

  // Helpers
  const pad2 = (n) => String(n).padStart(2, "0");

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${pad2(m)}:${pad2(s)}`;
  }

  function modeLabel(m) {
    if (m === "focus") return "Focus";
    if (m === "short") return "Short break";
    return "Long break";
  }

  function setStatus(text) {
    statusText.textContent = text;
  }

  function setButtons() {
    startBtn.textContent = isRunning ? "Running…" : (remaining < DURATIONS[mode] ? "Resume" : "Start");
    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
  }

  function setActiveModeUI() {
    for (const btn of modeButtons) {
      const btnMode = btn.getAttribute("data-mode");
      const active = btnMode === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function render() {
    timeDisplay.textContent = formatTime(remaining);
    const ratio = Math.max(0, Math.min(1, remaining / DURATIONS[mode]));
    progressBar.style.width = `${ratio * 100}%`;
    setButtons();
  }

  function stopTimer() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    setButtons();
  }

  function tick() {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      stopTimer();
      render();
      setStatus("Time’s up!");
      return;
    }
    render();
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    setButtons();
    setStatus(`${modeLabel(mode)} running…`);
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
    remaining = DURATIONS[mode];
    setStatus("Ready");
    render();
  }

  function switchMode(newMode) {
    if (!DURATIONS[newMode]) return;
    // Simple + bug-free: pause if running, then switch
    stopTimer();
    mode = newMode;
    remaining = DURATIONS[mode];
    setActiveModeUI();
    setStatus("Ready");
    render();
  }

  // Wire up events
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.getAttribute("data-mode")));
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

    if (e.code === "Space") {
      e.preventDefault();
      isRunning ? pauseTimer() : startTimer();
    }
    if (e.key.toLowerCase() === "r") resetTimer();
  });

  // Init
  setActiveModeUI();
  render();
})();
