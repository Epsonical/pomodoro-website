:root{
  --bg: #0b0f1a;
  --panel: #121a2b;
  --border: #26324f;
  --text: #e8eefc;
  --muted: #b5c2e6;
  --muted2: #8ea0d1;
  --btn: #1a2440;
  --btn2: #16203a;
  --accent: #7aa8ff;
  --radius: 14px;
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

.wrap{
  min-height:100%;
  display:grid;
  place-items:center;
  padding: 18px;
}

.panel{
  width: min(720px, 100%);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
}

.top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.title{
  margin:0;
  font-size: 18px;
  letter-spacing: 0.2px;
}
.sub{
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.meta{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content:flex-end;
}

.pill{
  display:inline-flex;
  align-items:center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
}

.presets{
  display:grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 10px 0 16px;
}

.tab{
  background: var(--btn2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 10px;
  color: var(--text);
  cursor: pointer;
  text-align:left;
  display:flex;
  justify-content:space-between;
  align-items:baseline;
}
.tab:hover{ background: var(--btn); }
.tab.is-active{
  border-color: var(--accent);
  outline: 2px solid rgba(122,168,255,0.2);
}

.tiny{
  color: var(--muted2);
  font-size: 12px;
}

.clock{
  text-align:center;
  font-variant-numeric: tabular-nums;
  font-size: clamp(56px, 9vw, 92px);
  font-weight: 750;
  letter-spacing: 1px;
  margin: 6px 0 12px;
}

.bar{
  height: 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow:hidden;
  background: #0f1630;
  margin-bottom: 16px;
}
.barFill{
  height: 100%;
  width: 100%;
  background: var(--accent);
  transition: width .25s ease;
}

.row{
  display:grid;
  grid-template-columns: 180px 1fr;
  gap: 14px;
  align-items:start;
}

.info{
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: #10182d;
}

.infoLine{
  display:flex;
  justify-content:space-between;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(38,50,79,0.6);
}
.infoLine:last-child{ border-bottom: none; }

.label{
  color: var(--muted2);
}

.controls{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.btn{
  padding: 12px 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--btn2);
  color: var(--text);
  cursor: pointer;
}
.btn:hover{ background: var(--btn); }
.btn:disabled{
  opacity: 0.55;
  cursor: not-allowed;
}
.btn.primary{
  border-color: rgba(122,168,255,0.8);
}
.btn.ghost{
  grid-column: 1 / -1;
  background: transparent;
}

.hint{
  margin-top: 14px;
  display:flex;
  justify-content:space-between;
  gap: 10px;
  color: var(--muted2);
  font-size: 12px;
  flex-wrap: wrap;
}

@media (max-width: 640px){
  .presets{ grid-template-columns: 1fr; }
  .row{ grid-template-columns: 1fr; }
  .controls{ grid-template-columns: 1fr 1fr; }
  .btn.ghost{ grid-column: 1 / -1; }
}
