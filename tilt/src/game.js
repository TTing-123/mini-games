import {
  FLOOR,
  HOLE,
  WALL,
  arrowFor,
  bestMove,
  createState,
  getPuzzleCount,
  solve,
  tiltPlan
} from './tilt-core.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const levelLabel = document.querySelector('#level-label');
const moveLabel = document.querySelector('#move-label');
const hintButton = document.querySelector('#hint');
const restartButton = document.querySelector('#restart');
const soundButton = document.querySelector('#sound');
const levelTitle = document.querySelector('#level-title');
const levelHint = document.querySelector('#level-hint');
const levelGrid = document.querySelector('#level-grid');
const result = document.querySelector('#result');
const resultTitle = document.querySelector('#result-title');
const resultText = document.querySelector('#result-text');
const resultNext = document.querySelector('#result-next');
const resultRetry = document.querySelector('#result-retry');
const padButtons = Array.from(document.querySelectorAll('.pad-button'));

const DEBUG = new URLSearchParams(location.search).has('debug');
const BEST_KEY = 'tilt-best';
const MUTE_KEY = 'tilt-muted';
const SLIDE_MS = 150;
const SINK_MS = 240;
const HINT_MS = 2400;
const SWIPE_MIN = 26;

let state = createState(0);
let moves = 0;
let minMoves = 0;
let hintDir = null;
let hintUntil = 0;
let hintCount = 0;
let animation = null;
let shakeUntil = 0;
let dragStart = null;
let resultShown = false;
let best = loadBest();
let muted = loadMuted();
let audioCtx = null;

function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === 'object' ? data : {};
  } catch (_) {
    return {};
  }
}

function saveBest() {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (_) { /* 隐私模式忽略 */ }
}

function loadMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (_) { return false; }
}

function tone(frequency, duration, type = 'sine', gain = 0.05) {
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

function boardMetrics() {
  const w = canvas.clientWidth || 480;
  const h = canvas.clientHeight || 480;
  const pad = Math.max(10, Math.min(w, h) * 0.04);
  const cell = Math.min((w - pad * 2) / state.width, (h - pad * 2) / state.height);
  return {
    w,
    h,
    cell,
    ox: (w - cell * state.width) / 2,
    oy: (h - cell * state.height) / 2
  };
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 480;
  const h = canvas.clientHeight || 480;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawWall(x, y, size, gap) {
  const inset = gap * 0.35;
  const side = size - inset * 2;
  roundRect(x + inset, y + inset, side, side, size * 0.18);
  const grad = ctx.createLinearGradient(x, y, x, y + size);
  grad.addColorStop(0, '#4a637d');
  grad.addColorStop(1, '#26374a');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = Math.max(1, size * 0.035);
  ctx.strokeStyle = 'rgba(163, 212, 236, .38)';
  ctx.stroke();
  // 顶面高光：让墙看起来是实心的，而不是另一块地板
  ctx.globalAlpha = 0.45;
  roundRect(x + inset + side * 0.14, y + inset + side * 0.1, side * 0.72, side * 0.12, size * 0.06);
  ctx.fillStyle = 'rgba(206, 238, 252, .5)';
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFloor(x, y, size, gap) {
  roundRect(x + gap * 0.5, y + gap * 0.5, size - gap, size - gap, size * 0.12);
  ctx.fillStyle = 'rgba(12, 20, 28, .86)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(125, 200, 232, .07)';
  ctx.stroke();
}

function drawHole(x, y, size, gap, time) {
  const pulse = 0.5 + 0.5 * Math.sin(time / 420);
  const inset = size * 0.16;
  const side = size - inset * 2;
  ctx.save();
  roundRect(x + inset, y + inset, side, side, size * 0.14);
  ctx.fillStyle = 'rgba(90, 57, 12, .5)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, size * 0.06);
  ctx.strokeStyle = 'rgba(242, 178, 62, ' + (0.62 + pulse * 0.38).toFixed(3) + ')';
  ctx.setLineDash([size * 0.16, size * 0.1]);
  ctx.lineDashOffset = -time / 26;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.32 + pulse * 0.26;
  ctx.strokeStyle = 'rgba(255, 219, 140, .9)';
  ctx.lineWidth = 1.5;
  roundRect(x + inset + size * 0.14, y + inset + size * 0.14, side - size * 0.28, side - size * 0.28, size * 0.1);
  ctx.stroke();
  ctx.restore();
}

function drawBlock(cx, cy, size, gap, scale = 1, alpha = 1) {
  const side = (size - gap * 2) * scale;
  const x = cx - side / 2;
  const y = cy - side / 2;
  const radius = side * 0.24;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(99, 198, 245, .5)';
  ctx.shadowBlur = size * 0.34 * scale;
  roundRect(x, y, side, side, radius);
  const grad = ctx.createLinearGradient(x, y, x, y + side);
  grad.addColorStop(0, '#a9e6ff');
  grad.addColorStop(0.55, '#63c6f5');
  grad.addColorStop(1, '#2f7fb5');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = alpha * 0.6;
  ctx.strokeStyle = 'rgba(232, 250, 255, .85)';
  ctx.lineWidth = Math.max(1, side * 0.06);
  roundRect(x + side * 0.16, y + side * 0.14, side * 0.68, side * 0.12, side * 0.06);
  ctx.stroke();
  ctx.restore();
}

function drawArrow(dir, cx, cy, size, alpha) {
  const angle = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[dir] ?? 0;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#f5d78a';
  ctx.beginPath();
  const head = size * 0.5;
  const tail = size * 0.86;
  ctx.moveTo(head, 0);
  ctx.lineTo(-head * 0.1, -head * 0.86);
  ctx.lineTo(-head * 0.1, -head * 0.34);
  ctx.lineTo(-tail, -head * 0.34);
  ctx.lineTo(-tail, head * 0.34);
  ctx.lineTo(-head * 0.1, head * 0.34);
  ctx.lineTo(-head * 0.1, head * 0.86);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function draw(time) {
  const m = boardMetrics();
  ctx.clearRect(0, 0, m.w, m.h);
  ctx.save();
  if (time < shakeUntil) {
    const k = (shakeUntil - time) / 220;
    ctx.translate(Math.sin(time / 18) * 6 * k, 0);
  }
  const gap = Math.max(2, m.cell * 0.06);
  // 棋盘底板：让网格从背景里浮出来
  const pad = gap * 1.8;
  roundRect(m.ox - pad, m.oy - pad, state.width * m.cell + pad * 2, state.height * m.cell + pad * 2, m.cell * 0.3);
  ctx.fillStyle = 'rgba(6, 12, 18, .78)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(125, 200, 232, .12)';
  ctx.stroke();
  for (let row = 0; row < state.height; row += 1) {
    for (let col = 0; col < state.width; col += 1) {
      const x = m.ox + col * m.cell;
      const y = m.oy + row * m.cell;
      const kind = state.terrain[row][col];
      if (kind === WALL) drawWall(x, y, m.cell, gap);
      else {
        drawFloor(x, y, m.cell, gap);
        if (kind === HOLE) drawHole(x, y, m.cell, gap, time);
      }
    }
  }

  if (animation) {
    const elapsed = time - animation.t0;
    const slide = clamp(elapsed / SLIDE_MS, 0, 1);
    const eased = easeOut(slide);
    for (const entry of animation.entries) {
      const fromX = m.ox + (entry.from[1] + 0.5) * m.cell;
      const fromY = m.oy + (entry.from[0] + 0.5) * m.cell;
      const toX = m.ox + (entry.to[1] + 0.5) * m.cell;
      const toY = m.oy + (entry.to[0] + 0.5) * m.cell;
      const cx = fromX + (toX - fromX) * eased;
      const cy = fromY + (toY - fromY) * eased;
      let scale = 1;
      let alpha = 1;
      if (entry.sink && slide >= 1) {
        const sink = clamp((elapsed - SLIDE_MS) / SINK_MS, 0, 1);
        scale = 1 - sink * 0.82;
        alpha = 1 - sink;
      }
      drawBlock(cx, cy, m.cell, gap, scale, alpha);
    }
  } else {
    for (const [row, col] of state.blocks) {
      drawBlock(m.ox + (col + 0.5) * m.cell, m.oy + (row + 0.5) * m.cell, m.cell, gap);
    }
  }

  const showHint = hintDir && (time < hintUntil || (state.tutorial && moves === 0));
  if (showHint) {
    const pulse = 0.55 + 0.45 * Math.sin(time / 320);
    drawArrow(hintDir, m.ox + (state.width * m.cell) / 2, m.oy + (state.height * m.cell) / 2, m.cell * 1.5, 0.55 + pulse * 0.4);
  }
  ctx.restore();
}

function frame(time) {
  if (animation && time - animation.t0 >= SLIDE_MS + SINK_MS) {
    const finished = animation;
    animation = null;
    state = finished.next;
    if (state.won) showResult();
  }
  draw(time);
  requestAnimationFrame(frame);
}

function tryTilt(dir) {
  if (animation || state.won) return;
  const plan = tiltPlan(state, dir);
  if (!plan.moves.length) return;
  if (!plan.changed) {
    shakeUntil = performance.now() + 220;
    tone(120, 0.12, 'square', 0.03);
    return;
  }
  animation = {
    t0: performance.now(),
    next: plan.state,
    entries: plan.moves.map((move) => ({
      from: move.from,
      to: move.to,
      sink: plan.sunk.some((spot) => spot[0] === move.to[0] && spot[1] === move.to[1])
    }))
  };
  moves += 1;
  hintDir = null;
  hintUntil = 0;
  updateHud();
  tone(plan.sunk.length ? 520 : 360, 0.14, 'triangle', 0.045);
  if (plan.sunk.length) setTimeout(() => tone(780, 0.18, 'sine', 0.04), 130);
}

function updateHud() {
  levelLabel.textContent = state.puzzleIndex + ' / ' + (getPuzzleCount() - 1);
  moveLabel.textContent = String(moves);
  levelTitle.textContent = state.title;
  levelHint.textContent = state.hint;
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
  moves = 0;
  hintCount = 0;
  resultShown = false;
  animation = null;
  hintUntil = 0;
  const path = solve(state);
  minMoves = path ? path.length : 0;
  hintDir = state.tutorial ? bestMove(state) : null;
  result.classList.add('is-hidden');
  renderLevelGrid();
  updateHud();
}

function restart() {
  loadLevel(state.puzzleIndex);
}

function nextLevel() {
  loadLevel(state.puzzleIndex + 1 < getPuzzleCount() ? state.puzzleIndex + 1 : 0);
}

function showResult() {
  if (resultShown) return;
  resultShown = true;
  const stars = moves <= minMoves ? 3 : moves <= minMoves + 2 ? 2 : 1;
  best[state.puzzleIndex] = Math.max(best[state.puzzleIndex] ?? 0, stars);
  saveBest();
  renderLevelGrid();
  resultTitle.textContent = state.title;
  resultText.textContent = moves + ' 步完成 · 最少 ' + minMoves + ' 步 · ' + '★'.repeat(stars) + '☆'.repeat(3 - stars);
  resultNext.textContent = state.puzzleIndex === getPuzzleCount() - 1 ? '回到第 0 关' : '下一关';
  result.classList.remove('is-hidden');
}

const KEY_DIRS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right'
};

window.addEventListener('keydown', (event) => {
  const dir = KEY_DIRS[event.key];
  if (!dir) return;
  event.preventDefault();
  tryTilt(dir);
});

canvas.addEventListener('pointerdown', (event) => {
  dragStart = { x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointerup', (event) => {
  if (!dragStart) return;
  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  dragStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
  if (Math.abs(dx) > Math.abs(dy)) tryTilt(dx > 0 ? 'right' : 'left');
  else tryTilt(dy > 0 ? 'down' : 'up');
});

canvas.addEventListener('pointercancel', () => { dragStart = null; });

for (const button of padButtons) {
  button.addEventListener('click', () => tryTilt(button.dataset.dir));
}

hintButton.addEventListener('click', () => {
  const dir = bestMove(state);
  if (!dir) return;
  hintCount += 1;
  hintDir = dir;
  hintUntil = performance.now() + HINT_MS;
  tone(660, 0.1, 'sine', 0.03);
});

restartButton.addEventListener('click', restart);
resultNext.addEventListener('click', nextLevel);
resultRetry.addEventListener('click', restart);
soundButton.addEventListener('click', () => {
  muted = !muted;
  soundButton.classList.toggle('is-off', muted);
  soundButton.textContent = muted ? '♪̸' : '♪';
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (_) { /* 忽略 */ }
  if (!muted) tone(660, 0.1, 'sine', 0.03);
});

window.addEventListener('resize', resizeCanvas);
soundButton.classList.toggle('is-off', muted);
resizeCanvas();
loadLevel(0);
requestAnimationFrame(frame);

if (DEBUG) {
  window.__tilt = {
    get state() { return state; },
    get moves() { return moves; },
    loadLevel,
    tryTilt,
    bestMove,
    arrowFor
  };
}