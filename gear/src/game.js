import {
  PUZZLES,
  clearSlot,
  createState,
  filledSlots,
  getPuzzleCount,
  isSolved,
  nextHint,
  normalizeAngle,
  partAt,
  placePart,
  trainResult
} from './gear-core.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const levelLabel = document.querySelector('#level-label');
const slotLabel = document.querySelector('#slot-label');
const angleLabel = document.querySelector('#angle-label');
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

const DEBUG = new URLSearchParams(location.search).has('debug');
const BEST_KEY = 'gear-best';
const MUTE_KEY = 'gear-muted';
const SPIN_MS = 900;
const HINT_MS = 2600;

let state = createState(0);
let selected = null;
let hint = null;
let spin = null;
let wonAt = 0;
let shakeUntil = 0;
let hits = [];
let currentAngle = 0;
let muted = loadMuted();
let best = loadBest();
let audioCtx = null;
let resultShown = false;
let geo = null;

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

function radiusOf(teeth) {
  return 12 + teeth * 1.05;
}

function gearSpeeds() {
  const puzzle = PUZZLES[state.puzzleIndex];
  const speeds = new Array(puzzle.slots).fill(0);
  let speed = 1;
  for (let stage = 0; stage < puzzle.stages; stage += 1) {
    const drive = partAt(state, stage * 2);
    const driven = partAt(state, stage * 2 + 1);
    speeds[stage * 2] = speed;
    speed = (!drive || !driven) ? 0 : -speed * (drive.teeth / driven.teeth);
    speeds[stage * 2 + 1] = speed;
  }
  return speeds;
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

// 版面：所有槽位用同一个半径，装不同大小的齿轮时位置不会跳。
function layout() {
  const puzzle = PUZZLES[state.puzzleIndex];
  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 460;
  const slotR = radiusOf(Math.max(...puzzle.parts));
  const meshGap = slotR * 0.1;
  const shaftGap = slotR * 0.85;
  const dialR = slotR * 1.05;

  let x = slotR;
  const nodes = [];
  for (let stage = 0; stage < puzzle.stages; stage += 1) {
    if (stage > 0) x += slotR * 2 + meshGap + shaftGap;
    nodes.push({ slot: stage * 2, role: 'drive', stage, x, r: slotR });
    x += slotR * 2 + meshGap;
    nodes.push({ slot: stage * 2 + 1, role: 'driven', stage, x, r: slotR });
  }
  const trainWidth = x + slotR;
  const dialX = trainWidth + shaftGap * 1.2 + dialR;
  const totalWidth = dialX + dialR;
  const scale = Math.min((w - 56) / totalWidth, (h * 0.46) / (slotR * 2), 1.75);
  const offsetX = (w - totalWidth * scale) / 2;
  const centerY = h * 0.32;

  for (const node of nodes) {
    node.cx = offsetX + node.x * scale;
    node.cy = centerY;
    node.r = slotR * scale;
  }
  const dial = { cx: offsetX + dialX * scale, cy: centerY, r: dialR * scale };

  const trayBase = clamp(slotR * scale * 0.42, 17, 30);
  const trayY = h * 0.8;
  const maxTeeth = Math.max(...puzzle.parts);
  const parts = puzzle.parts.map((teeth, index) => ({ index, teeth }));
  // 托盘里的齿轮按齿数画大小，一眼看得出谁大谁小
  const trayR = (teeth) => trayBase * (0.64 + 0.36 * (teeth / maxTeeth));
  const step = trayBase * 2 + 16;
  const trayStart = w / 2 - ((parts.length - 1) * step) / 2;
  const tray = parts.map((part, index) => ({
    ...part,
    cx: trayStart + index * step,
    cy: trayY,
    r: trayR(part.teeth)
  }));

  return { nodes, dial, tray, width: w, height: h, slotR: slotR * scale, trayBase, trayY };
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
  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 460;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// 真正的齿轮轮廓：内圈（齿谷）和外圈（齿顶）交替圆弧。
function cogPath(cx, cy, inner, outer, teeth, rotation) {
  const step = (Math.PI * 2) / teeth;
  ctx.beginPath();
  for (let i = 0; i < teeth; i += 1) {
    const a = rotation + i * step;
    ctx.arc(cx, cy, inner, a, a + step * 0.55);
    ctx.arc(cx, cy, outer, a + step * 0.55, a + step);
  }
  ctx.closePath();
}

function drawGear(cx, cy, r, teeth, rotation, options = {}) {
  const { filled = true, highlight = false, dim = false, label = '' } = options;
  if (!filled) {
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = highlight ? 'rgba(224,179,86,.95)' : 'rgba(224,179,86,.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = highlight ? 'rgba(255,236,190,.95)' : 'rgba(224,179,86,.62)';
    ctx.font = '700 13px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy);
    ctx.restore();
    return;
  }

  const count = Math.max(6, Math.min(teeth, 24));
  const inner = r * 0.76;
  ctx.save();
  ctx.globalAlpha = dim ? 0.32 : 1;

  cogPath(cx, cy, inner, r, count, rotation);
  const body = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.15, cx, cy, r);
  body.addColorStop(0, highlight ? '#fff3d0' : '#e8c887');
  body.addColorStop(0.65, '#c79a3d');
  body.addColorStop(1, '#8d6415');
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(58, 40, 6, .55)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, inner * 0.34, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(30, 23, 12, .85)';
  ctx.fill();

  // 一条辐条，用来看清转了多少
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.strokeStyle = 'rgba(255, 244, 214, .9)';
  ctx.lineWidth = Math.max(2, r * 0.11);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(inner * 0.66, 0);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawDial(dial, angle, target, highlight) {
  const { cx, cy, r } = dial;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 19, 26, .92)';
  ctx.fill();
  ctx.strokeStyle = highlight ? 'rgba(224,179,86,.75)' : 'rgba(224,179,86,.32)';
  ctx.lineWidth = highlight ? 3 : 2;
  ctx.stroke();

  for (let step = 0; step < 24; step += 1) {
    const value = step * 15;
    const a = (value - 90) * Math.PI / 180;
    const isTarget = value === target;
    const len = isTarget ? 0.66 : (value % 90 === 0 ? 0.78 : 0.84);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * len, cy + Math.sin(a) * r * len);
    ctx.lineTo(cx + Math.cos(a) * r * 0.93, cy + Math.sin(a) * r * 0.93);
    ctx.strokeStyle = isTarget ? '#e0b356' : 'rgba(224, 179, 86, .28)';
    ctx.lineWidth = isTarget ? 6 : (value % 90 === 0 ? 3 : 1.5);
    ctx.stroke();
  }

  const pointer = (angle - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(pointer) * r * 0.78, cy + Math.sin(pointer) * r * 0.78);
  ctx.strokeStyle = '#7fd1e0';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#7fd1e0';
  ctx.fill();

  ctx.fillStyle = '#7fd1e0';
  ctx.font = '700 12px Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(angle) + '°', cx, cy + r + 16);
  ctx.restore();
}

function draw(time) {
  geo = layout();
  const puzzle = PUZZLES[state.puzzleIndex];
  ctx.clearRect(0, 0, geo.width, geo.height);
  ctx.save();
  if (time < shakeUntil) ctx.translate(Math.sin(time / 16) * 5 * ((shakeUntil - time) / 200), 0);
  hits = [];

  const result = trainResult(state);
  const complete = result.complete;
  const speeds = gearSpeeds();
  const spinProgress = spin ? easeOut(clamp((time - spin.t0) / SPIN_MS, 0, 1)) : 1;
  const progress = complete ? spinProgress : 0;

  // 同轴连接（级与级之间）
  ctx.save();
  ctx.strokeStyle = 'rgba(127, 209, 224, .22)';
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 6]);
  for (let stage = 0; stage + 1 < puzzle.stages; stage += 1) {
    const from = geo.nodes[stage * 2 + 1];
    const to = geo.nodes[stage * 2 + 2];
    ctx.beginPath();
    ctx.moveTo(from.cx, from.cy);
    ctx.lineTo(to.cx, to.cy);
    ctx.stroke();
  }
  ctx.restore();

  const first = geo.nodes[0];
  const last = geo.nodes[geo.nodes.length - 1];
  ctx.save();
  ctx.fillStyle = 'rgba(127, 209, 224, .8)';
  ctx.font = '700 11px Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('输入 1 圈', first.cx, first.cy - geo.slotR - 14);
  ctx.fillText('输出', last.cx, last.cy - geo.slotR - 14);
  ctx.restore();

  for (const node of geo.nodes) {
    const speed = speeds[node.slot] || 0;
    const rotation = speed * Math.PI * 2 * progress;
    const isHint = hint && hint.slot === node.slot;
    const part = partAt(state, node.slot);
    const r = part ? radiusOf(part.teeth) * (geo.slotR / radiusOf(Math.max(...puzzle.parts))) : geo.slotR;
    drawGear(node.cx, node.cy, r, part ? part.teeth : 12, rotation, {
      filled: Boolean(part),
      highlight: Boolean(isHint),
      label: node.role === 'drive' ? '主动' : '从动'
    });
    hits.push({ kind: 'slot', index: node.slot, x: node.cx, y: node.cy, r: Math.max(geo.slotR, 24) });
  }

  drawDial(geo.dial, progress > 0 ? normalizeAngle(360 * (speeds[speeds.length - 1] || 0) * progress) : 0, puzzle.targetAngle, complete && isSolved(state));

  ctx.save();
  ctx.fillStyle = 'rgba(127, 209, 224, .5)';
  ctx.font = '700 11px Consolas, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('齿轮池 · 每个只能用一次', 20, geo.trayY - geo.trayBase - 26);
  ctx.restore();

  for (const part of geo.tray) {
    const used = state.slots.indexOf(part.index) >= 0;
    const isHint = hint && hint.part === part.index;
    const isSelected = selected === part.index;
    ctx.save();
    if (isSelected || isHint) {
      ctx.beginPath();
      ctx.arc(part.cx, part.cy, part.r + 7, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#7fd1e0' : '#e0b356';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    drawGear(part.cx, part.cy, part.r, part.teeth, 0, { filled: true, dim: used, highlight: isSelected });
    ctx.fillStyle = used ? 'rgba(156,147,132,.55)' : '#eae3d6';
    ctx.font = '700 12px Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(part.teeth) + ' 齿', part.cx, part.cy + part.r + 15);
    ctx.restore();
    if (!used) hits.push({ kind: 'part', index: part.index, x: part.cx, y: part.cy, r: part.r + 8 });
  }

  ctx.restore();
}

function refresh() {
  const puzzle = PUZZLES[state.puzzleIndex];
  const result = trainResult(state);
  slotLabel.textContent = filledSlots(state) + ' / ' + puzzle.slots;
  angleLabel.textContent = result.complete ? Math.round(result.angle) + '°' : '—';
  currentAngle = result.angle ?? 0;
  levelLabel.textContent = state.puzzleIndex + ' / ' + (getPuzzleCount() - 1);
  levelTitle.textContent = puzzle.title;
  levelHint.textContent = puzzle.hint;

  spin = null;
  if (!result.complete) return;
  spin = { t0: performance.now() };
  if (isSolved(state)) {
    tone(880, 0.14, 'triangle', 0.05);
    setTimeout(() => tone(1320, 0.18, 'sine', 0.045), 130);
    best[state.puzzleIndex] = 1;
    saveBest();
    renderLevelGrid();
    wonAt = performance.now() + SPIN_MS + 140;
  } else {
    tone(300, 0.09, 'triangle', 0.035);
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
  selected = null;
  hint = null;
  spin = null;
  wonAt = 0;
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
  resultTitle.textContent = puzzle.title;
  resultText.textContent = '输出 ' + Math.round(currentAngle) + '° · 用掉 ' + filledSlots(state) + ' 个齿轮';
  resultNext.textContent = state.puzzleIndex === getPuzzleCount() - 1 ? '回到第 0 关' : '下一关';
  result.classList.remove('is-hidden');
}

function pick(point) {
  let best = null;
  for (const hit of hits) {
    const distance = Math.hypot(point.x - hit.x, point.y - hit.y);
    if (distance > hit.r) continue;
    if (!best || distance / hit.r < best.ratio) best = { hit, ratio: distance / hit.r };
  }
  return best ? best.hit : null;
}

function onPointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  event.preventDefault();
  const target = pick(canvasPoint(event));
  if (!target) { selected = null; return; }
  hint = null;

  if (target.kind === 'part') {
    selected = selected === target.index ? null : target.index;
    tone(660, 0.05, 'sine', 0.03);
    return;
  }

  if (state.slots[target.index] !== null) {
    state = clearSlot(state, target.index);
    tone(240, 0.08, 'square', 0.03);
    refresh();
    return;
  }
  if (selected === null) {
    shakeUntil = performance.now() + 200;
    tone(150, 0.09, 'square', 0.03);
    return;
  }
  state = placePart(state, target.index, selected);
  selected = null;
  refresh();
}

function frame(time) {
  if (hint && time > hint.until) hint = null;
  draw(time);
  if (wonAt && !resultShown && time >= wonAt) showResult();
  requestAnimationFrame(frame);
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('contextmenu', (event) => event.preventDefault());
window.addEventListener('resize', resizeCanvas);

hintButton.addEventListener('click', () => {
  const step = nextHint(state);
  if (!step) return;
  hint = { slot: step.slot, part: step.part, until: performance.now() + HINT_MS };
  tone(700, 0.08, 'sine', 0.03);
});

restartButton.addEventListener('click', () => loadLevel(state.puzzleIndex));
resultNext.addEventListener('click', nextLevel);
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
  window.__gear = {
    get state() { return state; },
    loadLevel,
    get angle() { return currentAngle; },
    get geo() { return geo; },
    trainResult: () => trainResult(state),
    hint: () => nextHint(state)
  };
}