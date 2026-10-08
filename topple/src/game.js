import {
  PUZZLES,
  canRemove,
  createState,
  getPuzzleCount,
  isWon,
  nextHint,
  removeBlock
} from './topple-core.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const levelLabel = document.querySelector('#level-label');
const leftLabel = document.querySelector('#left-label');
const hintButton = document.querySelector('#hint');
const restartButton = document.querySelector('#restart');
const soundButton = document.querySelector('#sound');
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
const BEST_KEY = 'topple-best';
const MUTE_KEY = 'topple-muted';
const FALL_MS = 280;
const POP_MS = 260;
const HINT_MS = 2600;

let state = createState(0);
let anim = null;
let pops = [];
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
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function layout() {
  const puzzle = PUZZLES[state.puzzleIndex];
  const w = canvas.clientWidth || 520;
  const h = canvas.clientHeight || 520;
  const pad = 26;
  const cell = Math.min((w - pad * 2) / puzzle.width, (h - pad * 2) / puzzle.height);
  return {
    width: w,
    height: h,
    cell,
    ox: (w - cell * puzzle.width) / 2,
    oy: (h - cell * puzzle.height) / 2
  };
}

function centerOf(row, col, cellSize = geo.cell) {
  return { x: geo.ox + (col + 0.5) * cellSize, y: geo.oy + (row + 0.5) * cellSize };
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 520;
  const h = canvas.clientHeight || 520;
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

function drawBlock(cx, cy, size, kind, alpha = 1) {
  const side = size * 0.88;
  const x = cx - side / 2;
  const y = cy - side / 2;
  const r = size * 0.14;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (kind === 'gold') {
    ctx.shadowColor = 'rgba(232, 178, 60, .55)';
    ctx.shadowBlur = size * 0.4;
  }
  roundRect(x, y, side, side, r);
  const grad = ctx.createLinearGradient(x, y, x, y + side);
  if (kind === 'gold') {
    grad.addColorStop(0, '#ffe9a8');
    grad.addColorStop(0.55, '#e8b23c');
    grad.addColorStop(1, '#a4720f');
  } else if (kind === 'steel') {
    grad.addColorStop(0, '#8b98a8');
    grad.addColorStop(0.5, '#5d697a');
    grad.addColorStop(1, '#39424f');
  } else {
    grad.addColorStop(0, '#5a6678');
    grad.addColorStop(1, '#2b323d');
  }
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1, size * 0.035);
  ctx.strokeStyle = kind === 'gold' ? 'rgba(255, 246, 214, .75)'
    : (kind === 'steel' ? 'rgba(226, 238, 250, .55)' : 'rgba(160, 186, 214, .35)');
  ctx.stroke();
  // 顶面高光，一眼看出是砖
  ctx.globalAlpha = alpha * 0.5;
  roundRect(x + side * 0.14, y + side * 0.12, side * 0.72, side * 0.12, side * 0.06);
  ctx.fillStyle = kind === 'gold' ? 'rgba(255, 255, 240, .6)' : 'rgba(206, 226, 246, .45)';
  ctx.fill();
  if (kind === 'steel') {
    ctx.globalAlpha = alpha * 0.75;
    ctx.fillStyle = 'rgba(228, 240, 252, .8)';
    for (const [ox, oy] of [[0.26, 0.72], [0.74, 0.72]]) {
      ctx.beginPath();
      ctx.arc(x + side * ox, y + side * oy, side * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawTarget(cx, cy, size, time) {
  const pulse = 0.5 + 0.5 * Math.sin(time / 380);
  const side = size * 0.86;
  ctx.save();
  ctx.setLineDash([size * 0.14, size * 0.1]);
  ctx.lineDashOffset = -time / 40;
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.strokeStyle = 'rgba(111, 211, 184, ' + (0.5 + pulse * 0.5).toFixed(3) + ')';
  roundRect(cx - side / 2, cy - side / 2, side, side, size * 0.14);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.16, cy - size * 0.06);
  ctx.lineTo(cx, cy + size * 0.12);
  ctx.lineTo(cx + size * 0.16, cy - size * 0.06);
  ctx.strokeStyle = 'rgba(111, 211, 184, .8)';
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

function draw(time) {
  const puzzle = PUZZLES[state.puzzleIndex];
  geo = layout();
  ctx.clearRect(0, 0, geo.width, geo.height);

  // 地面
  const groundY = geo.oy + geo.cell * puzzle.height;
  ctx.save();
  ctx.strokeStyle = 'rgba(226, 178, 106, .35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(geo.ox - 6, groundY);
  ctx.lineTo(geo.ox + geo.cell * puzzle.width + 6, groundY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  if (time < shakeUntil) ctx.translate(Math.sin(time / 14) * 5 * ((shakeUntil - time) / 200), 0);

  // 目标格
  const targetCenter = centerOf(puzzle.target[0], puzzle.target[1]);
  drawTarget(targetCenter.x, targetCenter.y, geo.cell, time);

  // 静态方块（动画中的方块单独画）
  const moving = new Set();
  if (anim) for (const entry of anim.entries) moving.add(entry.to[0] + ',' + entry.to[1]);
  for (const cell of state.blocks) {
    if (moving.has(cell)) continue;
    const [row, col] = cell.split(',').map(Number);
    const kind = (row === state.gold[0] && col === state.gold[1]) ? 'gold'
      : (state.steel.has(cell) ? 'steel' : 'brick');
    const center = centerOf(row, col);
    drawBlock(center.x, center.y, geo.cell, kind);
  }

  // 正在坠落的方块
  if (anim) {
    const p = easeOut(clamp((time - anim.t0) / FALL_MS, 0, 1));
    for (const entry of anim.entries) {
      const from = centerOf(entry.from[0], entry.from[1]);
      const to = centerOf(entry.to[0], entry.to[1]);
      const kind = (entry.to[0] === state.gold[0] && entry.to[1] === state.gold[1]) ? 'gold' : 'brick';
      drawBlock(from.x + (to.x - from.x) * p, from.y + (to.y - from.y) * p, geo.cell, kind);
    }
  }

  // 被拆掉的碎块
  for (const pop of pops) {
    const p = clamp((time - pop.t0) / POP_MS, 0, 1);
    const center = centerOf(pop.row, pop.col);
    const side = geo.cell * 0.88 * (1 + p * 0.6);
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.8;
    ctx.strokeStyle = 'rgba(226, 178, 106, .9)';
    ctx.lineWidth = 2;
    roundRect(center.x - side / 2, center.y - side / 2, side, side, geo.cell * 0.14);
    ctx.stroke();
    ctx.restore();
  }

  // 提示高亮
  if (hint) {
    const center = centerOf(hint[0], hint[1]);
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(time / 220);
    ctx.strokeStyle = 'rgba(111, 211, 184, ' + (0.5 + pulse * 0.5).toFixed(3) + ')';
    ctx.lineWidth = 3;
    roundRect(center.x - geo.cell * 0.47, center.y - geo.cell * 0.47, geo.cell * 0.94, geo.cell * 0.94, geo.cell * 0.16);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function refresh() {
  const puzzle = PUZZLES[state.puzzleIndex];
  levelLabel.textContent = state.puzzleIndex + ' / ' + (getPuzzleCount() - 1);
  leftLabel.textContent = (puzzle.maxRemovals - state.removed.length) + ' / ' + puzzle.maxRemovals;
  levelTitle.textContent = puzzle.title;
  levelHint.textContent = puzzle.hint;
  if (state.status === 'won' || state.status === 'lost') {
    if (state.status === 'won' && !best[state.puzzleIndex]) {
      best[state.puzzleIndex] = 1;
      saveBest();
      renderLevelGrid();
    }
    if (!resultAt) resultAt = performance.now() + FALL_MS + 160;
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
  anim = null;
  pops = [];
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
  resultKicker.textContent = won ? '金块到位' : '砖用完了';
  resultTitle.textContent = puzzle.title;
  resultText.textContent = won
    ? `拆了 ${state.removed.length} 块完成`
    : `拆了 ${state.removed.length} 块，金块还没到位`;
  resultNext.textContent = won
    ? (state.puzzleIndex === getPuzzleCount() - 1 ? '回到第 0 关' : '下一关')
    : '重来';
  resultNext.dataset.action = won ? 'next' : 'retry';
  result.classList.remove('is-hidden');
}

function onPointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  if (state.status !== 'playing') { showResult(); return; }
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * ((canvas.clientWidth || 1) / rect.width);
  const y = (event.clientY - rect.top) * ((canvas.clientHeight || 1) / rect.height);
  const col = Math.floor((x - geo.ox) / geo.cell);
  const row = Math.floor((y - geo.oy) / geo.cell);
  const puzzle = PUZZLES[state.puzzleIndex];
  if (row < 0 || row >= puzzle.height || col < 0 || col >= puzzle.width) return;

  if (!state.blocks.has(row + ',' + col) || !canRemove(state, row, col)) {
    shakeUntil = performance.now() + 180;
    tone(150, 0.08, 'square', 0.03);
    return;
  }

  const next = removeBlock(state, row, col);
  const now = performance.now();
  pops.push({ row, col, t0: now });
  const entries = [];
  for (const fall of next.lastFalls) {
    for (let i = 0; i < fall.from.length; i += 1) {
      const [fr, fc] = fall.from[i].split(',').map(Number);
      const [tr, tc] = fall.to[i].split(',').map(Number);
      entries.push({ from: [fr, fc], to: [tr, tc] });
    }
  }
  anim = entries.length ? { entries, t0: now } : null;
  state = next;
  hint = null;
  tone(320, 0.07, 'square', 0.03);
  if (entries.length) {
    const drop = Math.max(...entries.map((entry) => entry.to[0] - entry.from[0]));
    setTimeout(() => tone(120 + 40 * Math.min(drop, 4), 0.22, 'sawtooth', 0.05), FALL_MS * 0.7);
  }
  if (state.status === 'won') setTimeout(() => tone(900, 0.18, 'sine', 0.05), FALL_MS);
  refresh();
}

function frame(time) {
  if (hint && time > hint.until) hint = null;
  if (pops.length) pops = pops.filter((pop) => time - pop.t0 < POP_MS);
  if (anim && time - anim.t0 > FALL_MS + 40) anim = null;
  draw(time);
  if (resultAt && !resultShown && time >= resultAt) showResult();
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('contextmenu', (event) => event.preventDefault());
window.addEventListener('resize', resizeCanvas);

hintButton.addEventListener('click', () => {
  const cell = nextHint(state);
  if (!cell) return;
  hint = cell;
  setTimeout(() => { hint = null; }, HINT_MS);
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
  window.__topple = {
    get state() { return state; },
    get geo() { return geo; },
    loadLevel,
    hint: () => nextHint(state),
    removable: () => [...state.blocks].filter((key) => canRemove(state, ...key.split(',').map(Number))),
    click: (row, col) => {
      const event = { pointerType: 'mouse', button: 0, preventDefault() {}, clientX: 0, clientY: 0 };
      const rect = canvas.getBoundingClientRect();
      event.clientX = rect.left + geo.ox + (col + 0.5) * geo.cell;
      event.clientY = rect.top + geo.oy + (row + 0.5) * geo.cell;
      onPointerDown(event);
    }
  };
}