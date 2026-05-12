'use strict';

// Fallback when running outside Electron (browser preview)
if (!window.electronAPI) {
  window.electronAPI = {
    toggleAlwaysOnTop: async () => false,
    getAlwaysOnTop:    async () => false
  };
}

const CELL   = 26;
const RADIUS = 10;

const STYLE = {
  B: { fill: '#c40000', ring: '#ff6666' },
  P: { fill: '#00308F', ring: '#5588ff' },
  T: { fill: '#1a7a35', ring: '#4fc870' }
};

// ── State ──────────────────────────────────────────────────────────────────
let history = [];   // array of 'P' | 'B' | 'T'

// ── Counts ─────────────────────────────────────────────────────────────────
function updateCounts() {
  let p = 0, b = 0, t = 0;
  for (const s of history) {
    if      (s === 'P') p++;
    else if (s === 'B') b++;
    else if (s === 'T') t++;
  }
  document.getElementById('playerCount').textContent = p;
  document.getElementById('bankerCount').textContent = b;
  document.getElementById('tieCount').textContent    = t;
  document.getElementById('handsCount').textContent  = history.length;
}

// ── Layout computation ──────────────────────────────────────────────────────

// Big Road: P/B switch columns when outcome changes; T stays in same column.
function computeMainRoad() {
  const entries = [];
  let row = 0, col = 0, lastNonTie = null;

  for (const side of history) {
    if (side === 'T') {
      entries.push({ side, row, col });
      row++;
    } else {
      if (lastNonTie !== null && side !== lastNonTie) {
        col++;
        row = 0;
      }
      entries.push({ side, row, col });
      row++;
      lastNonTie = side;
    }
  }
  return entries;
}

// Bead Road: sequential, wrap at rowLimit.
function computeBeadRoad() {
  const rowLimit = getBeadRows();
  const entries  = [];
  let row = 0, col = 0;

  for (const side of history) {
    entries.push({ side, row, col });
    row++;
    if (row >= rowLimit) { row = 0; col++; }
  }
  return entries;
}

// ── Drawing ─────────────────────────────────────────────────────────────────
function drawCircle(ctx, col, row, side) {
  const cx = col * CELL + CELL / 2;
  const cy = row * CELL + CELL / 2;
  const s  = STYLE[side];

  // drop shadow
  ctx.shadowColor   = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur    = 5;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = s.fill;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur  = 0;

  // highlight ring
  ctx.beginPath();
  ctx.arc(cx, cy, RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = s.ring;
  ctx.lineWidth   = 2;
  ctx.stroke();

  // inner shine arc
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 5, RADIUS * 0.45, -Math.PI * 0.8, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth   = 3;
  ctx.stroke();

  // letter
  ctx.fillStyle    = '#ffffff';
  ctx.font         = 'bold 8px Arial, sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(side, cx, cy);
}

function drawGrid(ctx, cols, rows) {
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth   = 0.5;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL, 0);
    ctx.lineTo(c * CELL, rows * CELL);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0,          r * CELL);
    ctx.lineTo(cols * CELL, r * CELL);
    ctx.stroke();
  }
}

function renderCanvas(canvasId, entries, fixedRows) {
  const canvas = document.getElementById(canvasId);
  const ctx    = canvas.getContext('2d');

  let maxCol = 0, maxRow = 0;
  for (const e of entries) {
    if (e.col > maxCol) maxCol = e.col;
    if (e.row > maxRow) maxRow = e.row;
  }

  const cols = Math.max(maxCol + 3, 22);
  const rows = fixedRows !== undefined ? fixedRows : Math.max(maxRow + 2, 6);

  canvas.width  = cols * CELL;
  canvas.height = rows * CELL;

  // felt-green background
  ctx.fillStyle = '#1c2b1c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid(ctx, cols, rows);

  for (const e of entries) drawCircle(ctx, e.col, e.row, e.side);
}

// ── Redraw both canvases ────────────────────────────────────────────────────
function redraw() {
  renderCanvas('mainCanvas', computeMainRoad());
  renderCanvas('beadCanvas', computeBeadRoad(), getBeadRows());
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getBeadRows() {
  const v = parseInt(document.getElementById('beadRows').value, 10);
  return (isNaN(v) || v < 3) ? 6 : Math.min(v, 15);
}

function addResult(side) {
  history.push(side);
  updateCounts();
  redraw();
}

function removeLast() {
  if (history.length === 0) return;
  history.pop();
  updateCounts();
  redraw();
}

function clearAll() {
  if (history.length === 0) return;
  if (!confirm('Clear all results and start over?')) return;
  history = [];
  updateCounts();
  redraw();
}

// ── Always-on-top toggle ────────────────────────────────────────────────────
const btnTop = document.getElementById('btnTop');
btnTop.addEventListener('click', async () => {
  const pinned = await window.electronAPI.toggleAlwaysOnTop();
  btnTop.classList.toggle('pinned', pinned);
  btnTop.textContent = pinned ? '📌 Pinned' : '📌 Top';
});

// ── Button wiring ───────────────────────────────────────────────────────────
document.getElementById('btnPlayer').addEventListener('click', () => addResult('P'));
document.getElementById('btnTie'   ).addEventListener('click', () => addResult('T'));
document.getElementById('btnBanker').addEventListener('click', () => addResult('B'));
document.getElementById('btnBack'  ).addEventListener('click', removeLast);
document.getElementById('btnClear' ).addEventListener('click', clearAll);
document.getElementById('beadRows' ).addEventListener('change', redraw);

// ── Tab switching ───────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn'  ).forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ── Keyboard shortcuts ──────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.key.toUpperCase()) {
    case 'P':         addResult('P'); break;
    case 'B':         addResult('B'); break;
    case 'T':         addResult('T'); break;
    case 'BACKSPACE': removeLast();   break;
  }
});

// ── Initial render ──────────────────────────────────────────────────────────
redraw();
