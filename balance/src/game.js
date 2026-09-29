import {
  allStats,
  canPlace,
  createState,
  detachWeight,
  getBarHooks,
  getLevelCount,
  isSolved,
  moveWeight,
  weightAt
} from './balance-core.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const levelLabel = document.querySelector('#level-label');
const levelTitle = document.querySelector('#level-title');
const levelHint = document.querySelector('#level-hint');
const resetButton = document.querySelector('#reset');
const nextButton = document.querySelector('#next');
const solvedPanel = document.querySelector('#solved');
const solvedTitle = document.querySelector('#solved-title');
const solvedText = document.querySelector('#solved-text');
const solvedNext = document.querySelector('#solved-next');
const solvedRetry = document.querySelector('#solved-retry');

const W = 900;
const H = 620;
const SCALE = 50;
const ROOT_ANCHOR = { x: W / 2, y: 50 };
const ROOT_GAP = 112;
const CHILD_GAP = 108;
const WEIGHT_GAP = 31;
const TRAY_Y = 548;
const HIT_RADIUS = 34;
const DEBUG = new URLSearchParams(location.search).has('debug');

let state = createState(0);
let drag = null;
let hoverHook = null;
let displayAngles = new Map();
let hit = { weights: [], hooks: [] };
let audioContext = null;
let solvedShown = false;

function setupCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawRoundedFill(x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
  roundedRect(x, y, width, height, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function pointerPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width * W,
    y: (event.clientY - rect.top) / rect.height * H
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function weightRadius(mass) {
  return 10 + mass * 2.35;
}

function weightColor(mass) {
  if (mass <= 1) return '#8ce8e1';
  if (mass <= 2) return '#4de2d5';
  if (mass <= 4) return '#f5b84b';
  if (mass <= 6) return '#f08a3c';
  return '#ff7468';
}

function resetDisplayAngles() {
  const stats = allStats(state);
  displayAngles = new Map();
  for (const bar of state.bars) displayAngles.set(bar.id, stats.get(bar.id)?.angle ?? 0);
}

function easeAngles() {
  const stats = allStats(state);
  for (const bar of state.bars) {
    const target = stats.get(bar.id)?.angle ?? 0;
    const current = displayAngles.get(bar.id) ?? target;
    displayAngles.set(bar.id, current + (target - current) * 0.18);
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#102c37');
  gradient.addColorStop(.58, '#0a1d27');
  gradient.addColorStop(1, '#071219');
  drawRoundedFill(0, 0, W, H, 30, gradient);

  ctx.save();
  roundedRect(1, 1, W - 2, H - 2, 30);
  ctx.clip();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = '#7de4e1';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAnchor() {
  ctx.save();
  ctx.strokeStyle = 'rgba(125, 228, 225, .72)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 34, ROOT_ANCHOR.y - 9);
  ctx.lineTo(W / 2, ROOT_ANCHOR.y + 1);
  ctx.lineTo(W / 2 + 34, ROOT_ANCHOR.y - 9);
  ctx.stroke();
  ctx.fillStyle = 'rgba(77, 226, 213, .8)';
  ctx.beginPath();
  ctx.arc(W / 2, ROOT_ANCHOR.y + 1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawString(x1, y1, x2, y2, alpha = .58) {
  ctx.save();
  ctx.strokeStyle = `rgba(196, 239, 237, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawBarLine(x1, y1, x2, y2) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(159, 226, 225, .26)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = '#a8e9e4';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawPivot(x, y) {
  ctx.save();
  ctx.fillStyle = '#f5b84b';
  ctx.shadowColor = '#f5b84b';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.65)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawHook(x, y, active, valid) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, active ? 12 : 8, 0, Math.PI * 2);
  ctx.fillStyle = active
    ? (valid ? 'rgba(77, 226, 213, .28)' : 'rgba(255, 116, 104, .22)')
    : 'rgba(8, 19, 26, .92)';
  ctx.fill();
  ctx.strokeStyle = active
    ? (valid ? '#4de2d5' : '#ff7468')
    : 'rgba(168, 233, 228, .64)';
  ctx.lineWidth = active ? 3 : 2;
  ctx.stroke();
  ctx.restore();
}

function drawWeight(weight, x, y, active = false) {
  const radius = weightRadius(weight.mass);
  const color = weightColor(weight.mass);
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = active ? 28 : 16;
  const gradient = ctx.createRadialGradient(x - radius * .32, y - radius * .36, radius * .12, x, y, radius);
  gradient.addColorStop(0, 'rgba(255,255,255,.95)');
  gradient.addColorStop(.3, color);
  gradient.addColorStop(1, 'rgba(10, 33, 42, .96)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = active ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.36)';
  ctx.lineWidth = active ? 3 : 1.5;
  ctx.stroke();

  ctx.fillStyle = '#071219';
  ctx.font = '700 12px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(weight.mass), x, y + .5);
  ctx.restore();
}

function trayWeights() {
  return state.weights.filter((weight) => !weight.at);
}

function trayPosition(index, count) {
  const spacing = 82;
  const startX = W / 2 - (count - 1) * spacing / 2;
  return { x: startX + index * spacing, y: TRAY_Y };
}

function drawTray() {
  const tray = trayWeights();
  drawRoundedFill(112, 505, W - 224, 92, 20, 'rgba(6, 19, 26, .68)', 'rgba(125, 228, 225, .16)', 1);
  ctx.save();
  ctx.fillStyle = 'rgba(125, 170, 176, .8)';
  ctx.font = '700 10px "Consolas", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('可用重物', W / 2, 523);
  ctx.restore();

  if (!tray.length) {
    ctx.save();
    ctx.fillStyle = 'rgba(125, 170, 176, .55)';
    ctx.font = '700 12px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('全部挂上去了', W / 2, TRAY_Y + 2);
    ctx.restore();
    return;
  }

  tray.forEach((weight, index) => {
    if (drag && drag.weightId === weight.id) return;
    const point = trayPosition(index, tray.length);
    drawWeight(weight, point.x, point.y);
    hit.weights.push({ id: weight.id, x: point.x, y: point.y, radius: weightRadius(weight.mass), at: null });
  });
}

function drawGuide(now) {
  if (state.levelIndex !== 0 || solvedShown) return;
  const empty = hit.hooks.find((hook) => hook.hookId === 'b0.right' && !hook.hasChild);
  const trayWeight = hit.weights.find((weight) => !weight.at);
  if (!empty || !trayWeight) return;

  const pulse = .5 + .5 * Math.sin(now / 250);
  ctx.save();
  ctx.setLineDash([7, 8]);
  ctx.strokeStyle = `rgba(245, 184, 75, ${.42 + pulse * .42})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(trayWeight.x, trayWeight.y - trayWeight.radius - 4);
  ctx.lineTo(empty.x, empty.y + 18);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = `rgba(245, 184, 75, ${.5 + pulse * .4})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(trayWeight.x, trayWeight.y, trayWeight.radius + 8 + pulse * 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(empty.x, empty.y, 16 + pulse * 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawDrag(now) {
  if (!drag) return;
  const weight = state.weights.find((item) => item.id === drag.weightId);
  if (!weight) return;
  drawWeight(weight, drag.x, drag.y, true);
}

function render(now = performance.now()) {
  hit = { weights: [], hooks: [] };
  easeAngles();
  drawBackground();
  drawAnchor();
  drawBarMulti('b0', { x: ROOT_ANCHOR.x, y: ROOT_ANCHOR.y + ROOT_GAP }, ROOT_ANCHOR);
  drawTray();
  drawGuide(now);
  drawDrag(now);
  requestAnimationFrame(render);
}

function findWeight(point) {
  let best = null;
  let bestDistance = Infinity;
  for (const item of hit.weights) {
    const d = distance(point, item);
    if (d <= item.radius + 10 && d < bestDistance) {
      best = item;
      bestDistance = d;
    }
  }
  return best;
}

function findHook(point) {
  let best = null;
  let bestDistance = Infinity;
  for (const hook of hit.hooks) {
    const d = distance(point, hook);
    if (d <= HIT_RADIUS + 8 && d < bestDistance) {
      best = hook;
      bestDistance = d;
    }
  }
  return best;
}

function updateUi() {
  const total = getLevelCount();
  levelLabel.textContent = `${state.levelIndex + 1} / ${total}`;
  levelTitle.textContent = state.title;
  levelHint.textContent = state.hint;
  nextButton.disabled = !state.solved || state.levelIndex >= total - 1;
}

function ensureAudio() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(frequency, duration, type = 'sine', gain = .025, delay = 0) {
  const audio = ensureAudio();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const volume = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + .015);
  volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(volume).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function playPick() {
  tone(240, .08, 'triangle', .018);
}

function playPlace() {
  tone(330, .09, 'sine', .022);
  tone(440, .08, 'sine', .014, .04);
}

function playSolve() {
  tone(330, .18, 'sine', .028);
  tone(415, .18, 'sine', .024, .12);
  tone(495, .24, 'sine', .022, .24);
}

function loadLevel(index) {
  state = createState(index);
  resetDisplayAngles();
  solvedShown = false;
  drag = null;
  hoverHook = null;
  solvedPanel.classList.add('is-hidden');
  updateUi();
}

function resetLevel() {
  loadLevel(state.levelIndex);
}

function nextLevel() {
  const total = getLevelCount();
  const next = state.levelIndex + 1 < total ? state.levelIndex + 1 : 0;
  loadLevel(next);
}

function showSolved() {
  if (solvedShown) return;
  solvedShown = true;
  const last = state.levelIndex >= getLevelCount() - 1;
  solvedTitle.textContent = last ? '全部平衡' : '这一关平了';
  solvedText.textContent = last ? '八组悬挂结构全部保持水平。' : '所有横杆同时保持水平。';
  solvedNext.textContent = last ? '回到第一关' : '下一关';
  solvedPanel.classList.remove('is-hidden');
  nextButton.disabled = last;
  playSolve();
}

function tryDrop(point) {
  if (!drag) return;
  const weightId = drag.weightId;
  const hook = findHook(point);
  if (hook && canPlace(state, weightId, hook.hookId)) {
    const next = moveWeight(state, weightId, hook.hookId);
    if (next) state = next;
    playPlace();
  } else if (drag.fromAt) {
    const next = detachWeight(state, weightId);
    if (next) state = next;
    playPlace();
  }
  drag = null;
  hoverHook = null;
  updateUi();
  if (isSolved(state)) showSolved();
}

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  ensureAudio();
  if (solvedShown) return;
  const point = pointerPoint(event);
  const weight = findWeight(point);
  if (!weight) return;
  drag = { weightId: weight.id, fromAt: weight.at, x: point.x, y: point.y, pointerId: event.pointerId };
  playPick();
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  const point = pointerPoint(event);
  if (!drag) {
    hoverHook = findHook(point);
    return;
  }
  drag.x = point.x;
  drag.y = point.y;
  hoverHook = findHook(point);
});

canvas.addEventListener('pointerup', (event) => {
  event.preventDefault();
  if (!drag) return;
  tryDrop(pointerPoint(event));
});

canvas.addEventListener('pointercancel', () => {
  drag = null;
  hoverHook = null;
});

resetButton.addEventListener('click', resetLevel);
nextButton.addEventListener('click', nextLevel);
solvedNext.addEventListener('click', nextLevel);
solvedRetry.addEventListener('click', () => {
  solvedPanel.classList.add('is-hidden');
  resetLevel();
});

if (DEBUG) {
  window.__balance = {
    get state() { return state; },
    get hit() { return hit; },
    loadLevel,
    moveWeight,
    isSolved,
    allStats
  };
}

setupCanvas();
loadLevel(0);
requestAnimationFrame(render);

function drawHooksMulti(bar, center, angle) {
  const hooks = getBarHooks(bar);
  for (const hook of hooks) {
    const distance = hook.pos * SCALE * (hook.side === 'left' ? -1 : 1);
    const point = {
      x: center.x + distance * Math.cos(angle),
      y: center.y + distance * Math.sin(angle)
    };
    const active = Boolean(drag && hoverHook && hoverHook.hookId === hook.id);
    const valid = active && drag ? canPlace(state, drag.weightId, hook.id) : false;
    drawHook(point.x, point.y, active, valid);
    hit.hooks.push({ hookId: hook.id, x: point.x, y: point.y, hasChild: Boolean(hook.child), valid });

    if (hook.child) {
      const childCenter = { x: point.x, y: point.y + CHILD_GAP };
      drawBarMulti(hook.child, childCenter, point);
      continue;
    }

    const weight = weightAt(state, hook.id);
    if (!weight || (drag && drag.weightId === weight.id)) continue;
    const weightPoint = { x: point.x, y: point.y + WEIGHT_GAP };
    drawWeight(weight, weightPoint.x, weightPoint.y);
    hit.weights.push({ id: weight.id, x: weightPoint.x, y: weightPoint.y, radius: weightRadius(weight.mass), at: hook.id });
  }
}

function drawBarMulti(barId, center, parentAnchor) {
  const bar = state.bars.find((item) => item.id === barId);
  if (!bar) return;
  const hooks = getBarHooks(bar);
  const leftLength = Math.max(1, ...hooks.filter((hook) => hook.side === 'left').map((hook) => hook.pos)) * SCALE;
  const rightLength = Math.max(1, ...hooks.filter((hook) => hook.side === 'right').map((hook) => hook.pos)) * SCALE;
  const angle = displayAngles.get(barId) ?? 0;
  const leftEnd = { x: center.x - leftLength * Math.cos(angle), y: center.y - leftLength * Math.sin(angle) };
  const rightEnd = { x: center.x + rightLength * Math.cos(angle), y: center.y + rightLength * Math.sin(angle) };
  drawString(parentAnchor.x, parentAnchor.y, center.x, center.y);
  drawBarLine(leftEnd.x, leftEnd.y, rightEnd.x, rightEnd.y);
  drawPivot(center.x, center.y);
  drawHooksMulti(bar, center, angle);
}


