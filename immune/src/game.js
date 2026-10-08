import {
  PUZZLES,
  advance,
  availableDrops,
  cellKind,
  createState,
  dropAvailable,
  getPuzzleCount,
  inject,
  nextHint,
  previewVirus
} from './immune-core.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const levelLabel = document.querySelector('#level-label');
const turnLabel = document.querySelector('#turn-label');
const doseLabel = document.querySelector('#dose-label');
const hintButton = document.querySelector('#hint');
const restartButton = document.querySelector('#restart');
const soundButton = document.querySelector('#sound');
const stepButton = document.querySelector('#step');
const levelTitle = document.querySelector('#level-title');
const levelHint = document.querySelector('#level-hint');
const levelGrid = document.querySelector('#level-grid');
const result = document.querySelector('#result');
const resultKicker = document.querySelector('#result-kicker');
const resultTitle = document.querySelector('#result-title');
const resultText = document.querySelector('#result-text');
const resultNext = document.querySelector('#result-next');
const resultRetry = document.querySelector('#result-retry');

const DEBUG = new URLSearchParams(location.search).has('debug');
const BEST_KEY = 'immune-best';
const MUTE_KEY = 'immune-muted';
const POP_MS = 260;
const HINT_MS = 2600;

let state = createState(0);
let flashes = [];          // { row, col, kind, t0 }
let hint = null;
let shakeUntil = 0;
let resultAt = 0;
let resultShown = false;
let muted = loadMuted();
let best = loadBest();
let audioCtx = null;
let geo = null;

function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === 'object' ? data : {};
  } catch (_) { return {}; }
}

function saveBest() {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (_) { /* 忽略 */ }
}

function loadMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (_) { return false; }
}

function tone(frequency, duration, type = 'sine', gain = 0.045) {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    amp.gain.setValueAtTime(gain, audioCtx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    oscillator.connect(amp);
    amp.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (_) { /* 没有音频权限就算了 */ }
}

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function layout() {
  const puzzle = PUZZLES[state.puzzleIndex];
  const w = canvas.clientWidth || 560;
  const h = canvas.clientHeight || 560;
  const pad = 16;
  const cell = Math.min((w - pad * 2) / puzzle.width, (h - pad * 2) / puzzle.height);
  return {
    width: w,
    height: h,
    cell,
    ox: (w - cell * puzzle.width) / 2,
    oy: (h - cell * puzzle.height) / 2
  };
}

function cellCenter(row, col) {
  return {
    x: geo.ox + (col + 0.5) * geo.cell,
    y: geo.oy + (row + 0.5) * geo.cell
  };
}

function pointToCell(point) {
  const col = Math.floor((point.x - geo.ox) / geo.cell);
  const row = Math.floor((point.y - geo.oy) / geo.cell);
  const puzzle = PUZZLES[state.puzzleIndex];
  if (row < 0 || row >= puzzle.height || col < 0 || col >= puzzle.width) return null;
  return [row, col];
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * ((canvas.clientWidth || 1) / rect.width),
    y: (event.clientY - rect.top) * ((canvas.clientHeight || 1) / rect.height)
  };
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 560;
  const h = canvas.clientHeight || 560;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

function drawPerson(cx, cy, size, safe, dead) {
  const r = size * 0.16;
  ctx.save();
  ctx.strokeStyle = dead ? '#ffd7d5' : (safe ? '#eafcff' : '#ffd7d5');
  ctx.fillStyle = dead ? '#ffd7d5' : (safe ? '#eafcff' : '#ffd7d5');
  ctx.lineWidth = Math.max(1.6, size * 0.035);
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.9, r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.2);
  ctx.lineTo(cx, cy + r * 0.95);
  ctx.moveTo(cx - r * 0.75, cy + r * 0.25);
  ctx.lineTo(cx + r * 0.75, cy + r * 0.25);
  ctx.moveTo(cx, cy + r * 0.95);
  ctx.lineTo(cx - r * 0.6, cy + r * 1.7);
  ctx.moveTo(cx, cy + r * 0.95);
  ctx.lineTo(cx + r * 0.6, cy + r * 1.7);
  ctx.stroke();
  ctx.restore();
}

function drawVirus(cx, cy, size) {
  const r = size * 0.24;
  ctx.save();
  ctx.fillStyle = '#ef5b57';
  ctx.strokeStyle = 'rgba(255, 200, 197, .8)';
  ctx.lineWidth = Math.max(1.4, size * 0.03);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9);
    ctx.lineTo(cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 1.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDrop(cx, cy, size, used, infected, highlight) {
  const r = size * 0.3;
  ctx.save();
  if (used) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(86, 200, 232, .85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 250, 255, .8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = highlight ? 3 : 2;
  ctx.strokeStyle = infected ? 'rgba(239, 91, 87, .85)' : (highlight ? '#e8c26a' : 'rgba(232, 194, 106, .6)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = Math.max(2, size * 0.05);
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy);
  ctx.lineTo(cx + r * 0.42, cy);
  ctx.moveTo(cx, cy - r * 0.42);
  ctx.lineTo(cx, cy + r * 0.42);
  ctx.stroke();
  ctx.restore();
}

function draw(time) {
  const puzzle = PUZZLES[state.puzzleIndex];
  geo = layout();
  ctx.clearRect(0, 0, geo.width, geo.height);
  ctx.save();
  if (time < shakeUntil) ctx.translate(Math.sin(time / 15) * 5 * ((shakeUntil - time) / 200), 0);

  // 底板
  roundRect(geo.ox - 8, geo.oy - 8, geo.cell * puzzle.width + 16, geo.cell * puzzle.height + 16, 14);
  ctx.fillStyle = 'rgba(7, 10, 14, .72)';
  ctx.fill();

  const preview = puzzle.tutorial && state.turn === 0 && state.status === 'playing' ? previewVirus(state) : [];
  const hintDrop = hint ? hint.drop : null;

  for (let row = 0; row < puzzle.height; row += 1) {
    for (let col = 0; col < puzzle.width; col += 1) {
      const x = geo.ox + col * geo.cell;
      const y = geo.oy + row * geo.cell;
      const size = geo.cell;
      const kind = cellKind(puzzle, row, col);
      if (kind === 'wall') {
        roundRect(x + 1.5, y + 1.5, size - 3, size - 3, size * 0.14);
        const grad = ctx.createLinearGradient(x, y, x, y + size);
        grad.addColorStop(0, '#2b3644');
        grad.addColorStop(1, '#161d26');
        ctx.fillStyle = grad;
        ctx.fill();
        continue;
      }
      roundRect(x + 1.5, y + 1.5, size - 3, size - 3, size * 0.14);
      ctx.fillStyle = 'rgba(20, 27, 35, .75)';
      ctx.fill();

      if (state.red[row][col] === 1) {
        ctx.fillStyle = 'rgba(239, 91, 87, .3)';
        ctx.fill();
      }
      if (state.blue[row][col] === 1) {
        ctx.fillStyle = 'rgba(86, 200, 232, .32)';
        ctx.fill();
      }
      if (preview.some(([r, c]) => r === row && c === col)) {
        ctx.fillStyle = 'rgba(239, 91, 87, .14)';
        ctx.fill();
      }

      const flash = flashes.find((item) => item.row === row && item.col === col);
      if (flash) {
        const p = clamp((time - flash.t0) / POP_MS, 0, 1);
        ctx.save();
        ctx.globalAlpha = 0.55 * (1 - p);
        ctx.strokeStyle = flash.kind === 'red' ? '#ef5b57' : '#56c8e8';
        ctx.lineWidth = 2.5;
        roundRect(x + 1.5, y + 1.5, size - 3, size - 3, size * 0.14);
        ctx.stroke();
        ctx.restore();
      }

      const center = cellCenter(row, col);
      if (kind === 'virus') drawVirus(center.x, center.y, size);
      if (kind === 'person') {
        drawPerson(center.x, center.y + size * 0.08, size, state.blue[row][col] === 1, state.red[row][col] === 1);
      }
      if (kind === 'drop') {
        const used = state.usedDrops.includes(row + ',' + col);
        const infected = state.red[row][col] === 1;
        const isHint = hintDrop && hintDrop[0] === row && hintDrop[1] === col;
        drawDrop(center.x, center.y, size, used, infected, Boolean(isHint) || used);
      }
    }
  }
  ctx.restore();
}

function refresh() {
  const puzzle = PUZZLES[state.puzzleIndex];
  levelLabel.textContent = state.puzzleIndex + ' / ' + (getPuzzleCount() - 1);
  turnLabel.textContent = String(state.turn) + ' / ' + puzzle.maxTurns;
  doseLabel.textContent = state.usedDrops.length + ' / ' + puzzle.drops.length;
  levelTitle.textContent = puzzle.title;
  levelHint.textContent = puzzle.hint;
  stepButton.disabled = state.status !== 'playing';
  if (state.status === 'won' || state.status === 'lost') {
    if (!best[state.puzzleIndex] && state.status === 'won') {
      best[state.puzzleIndex] = 1;
      saveBest();
      renderLevelGrid();
    }
    if (!resultAt) resultAt = performance.now() + POP_MS + 120;
  }
}

function renderLevelGrid() {
  levelGrid.innerHTML = '';
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.textContent = String(index);
    if (index === state.puzzleIndex) button.classList.add('is-current');
    if (best[index]) button.classList.add('is-cleared');
    button.addEventListener('click', () => loadLevel(index));
    levelGrid.append(button);
  }
}

function loadLevel(index) {
  state = createState(index);
  flashes = [];
  hint = null;
  resultAt = 0;
  resultShown = false;
  result.classList.add('is-hidden');
  renderLevelGrid();
  refresh();
}

function nextLevel() {
  loadLevel(state.puzzleIndex + 1 < getPuzzleCount() ? state.puzzleIndex + 1 : 0);
}

function showResult() {
  if (resultShown) return;
  resultShown = true;
  const puzzle = PUZZLES[state.puzzleIndex];
  const won = state.status === 'won';
  resultKicker.textContent = won ? '全部安全' : '病毒突破了';
  resultTitle.textContent = puzzle.title;
  resultText.textContent = won
    ? `${state.turn} 回合 · 用掉 ${state.usedDrops.length} 针`
    : `第 ${state.turn} 回合失守 · 重来一次试试别的投放点`;
  resultNext.textContent = won
    ? (state.puzzleIndex === getPuzzleCount() - 1 ? '回到第 0 关' : '下一关')
    : '重来';
  resultNext.dataset.action = won ? 'next' : 'retry';
  result.classList.remove('is-hidden');
}

function step() {
  if (state.status !== 'playing') { showResult(); return; }
  const before = state.status;
  const next = advance(state);
  const now = performance.now();
  for (const [row, col] of next.lastRed) flashes.push({ row, col, kind: 'red', t0: now });
  for (const [row, col] of next.lastBlue) flashes.push({ row, col, kind: 'blue', t0: now });
  state = next;
  hint = null;
  tone(next.lastBlue.length ? 520 : 300, 0.07, 'triangle', 0.03);
  if (state.status !== before) tone(state.status === 'won' ? 900 : 180, 0.2, state.status === 'won' ? 'sine' : 'square', 0.05);
  refresh();
}

function onPointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  if (state.status !== 'playing') { showResult(); return; }
  const cell = pointToCell(canvasPoint(event));
  if (!cell) return;
  const puzzle = PUZZLES[state.puzzleIndex];
  if (cellKind(puzzle, cell[0], cell[1]) !== 'drop') {
    shakeUntil = performance.now() + 180;
    tone(150, 0.07, 'square', 0.025);
    return;
  }
  if (state.injectedThisTurn) {
    shakeUntil = performance.now() + 180;
    tone(220, 0.08, 'square', 0.03);
    return;
  }
  if (!dropAvailable(state, cell[0], cell[1])) {
    shakeUntil = performance.now() + 180;
    tone(180, 0.08, 'square', 0.03);
    return;
  }
  const next = inject(state, cell[0], cell[1]);
  flashes.push({ row: cell[0], col: cell[1], kind: 'blue', t0: performance.now() });
  state = next;
  hint = null;
  tone(700, 0.08, 'sine', 0.035);
  refresh();
}

function frame(time) {
  if (hint && time > hint.until) hint = null;
  if (flashes.length) flashes = flashes.filter((flash) => time - flash.t0 < POP_MS);
  draw(time);
  if (resultAt && !resultShown && time >= resultAt) showResult();
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('contextmenu', (event) => event.preventDefault());
window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    if (!event.repeat) step();
  }
});

stepButton.addEventListener('click', step);
hintButton.addEventListener('click', () => {
  const drop = nextHint(state);
  if (!drop) return;
  hint = { drop, until: performance.now() + HINT_MS };
  tone(760, 0.08, 'sine', 0.03);
});
restartButton.addEventListener('click', () => loadLevel(state.puzzleIndex));
resultNext.addEventListener('click', () => {
  if (resultNext.dataset.action === 'retry') loadLevel(state.puzzleIndex);
  else nextLevel();
});
resultRetry.addEventListener('click', () => loadLevel(state.puzzleIndex));
soundButton.addEventListener('click', () => {
  muted = !muted;
  soundButton.classList.toggle('is-off', muted);
  soundButton.textContent = muted ? '♪̸' : '♪';
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (_) { /* 忽略 */ }
  if (!muted) tone(660, 0.1, 'sine', 0.03);
});

soundButton.classList.toggle('is-off', muted);
resizeCanvas();
loadLevel(0);
requestAnimationFrame(frame);

if (DEBUG) {
  window.__immune = {
    get state() { return state; },
    get geo() { return geo; },
    loadLevel,
    step,
    injectAt: (row, col) => { state = inject(state, row, col); refresh(); },
    hint: () => nextHint(state),
    available: () => availableDrops(state)
  };
}