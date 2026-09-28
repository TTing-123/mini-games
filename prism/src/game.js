import {
  PrismCore, WIDTH, HEIGHT, colorKey, COLOR_RGB,
  mirrorEndpoints, MIRROR_HALF, RED, GREEN, BLUE
} from './prism-core.js';

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const litCounter = document.querySelector('#lit-counter');
const banner = document.querySelector('#banner');
const hint = document.querySelector('#hint');
const levelBadge = document.querySelector('#level-badge');
const nextButton = document.querySelector('#next-button');
const levelsButton = document.querySelector('#levels-button');
const levelPanel = document.querySelector('#level-panel');
const levelGrid = document.querySelector('#level-grid');
const levelClose = document.querySelector('#level-close');

const PROGRESS_KEY = 'prism-progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { cleared: [], level: 0 };
    const parsed = JSON.parse(raw);
    return {
      cleared: Array.isArray(parsed.cleared) ? parsed.cleared.filter((n) => Number.isInteger(n)) : [],
      level: Number.isInteger(parsed.level) ? parsed.level : 0
    };
  } catch (_) {
    return { cleared: [], level: 0 };
  }
}

const progress = loadProgress();

const core = new PrismCore();
core.loadLevel(progress.level);
let dragging = null;
let clearedLevel = -1;
let hoverIndex = null;
let hoverPrism = false;
let lastTime = performance.now();
let solvedAt = 0;

/* ---------------- 音效：全部现场合成，不带音频文件 ---------------- */

let audioCtx = null;
let muted = false;

function ensureAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (Ctor) audioCtx = new Ctor();
}

function tone({ freq, to, type = 'sine', gain = 0.14, duration = 0.22, delay = 0 }) {
  if (muted || !audioCtx) return;
  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), now + duration);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

// 目标点亮：一声清亮的叮，音符按点亮数量往上走
function playLit(step) {
  const scale = [523.25, 659.25, 783.99, 1046.5];
  tone({ freq: scale[Math.min(step, scale.length - 1)], type: 'sine', gain: 0.12, duration: 0.3 });
}
// 目标熄灭：短促下沉
function playUnlit() {
  tone({ freq: 320, to: 150, type: 'triangle', gain: 0.09, duration: 0.18 });
}
// 整关点亮：往上爬的三音
function playFanfare() {
  [0, 0.09, 0.18].forEach((delay, i) => {
    tone({ freq: [523.25, 783.99, 1046.5][i], type: 'sine', gain: 0.13, duration: 0.42, delay });
  });
}
// 镜子翻面：一下木头似的咔
function playFlip() {
  tone({ freq: 880, to: 420, type: 'square', gain: 0.05, duration: 0.08 });
}

const rgbOf = (mask) => COLOR_RGB[colorKey(mask)];
const rgba = (rgb, alpha) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * (WIDTH / rect.width), y: (event.clientY - rect.top) * (HEIGHT / rect.height) };
}

/* ---------------- 输入：拖动移动，轻点翻面 ---------------- */

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  ensureAudio();
  const point = canvasPoint(event);
  const prism = core.prismAt(point.x, point.y);
  if (prism) {
    dragging = { kind: 'prism', offsetX: prism.x - point.x, offsetY: prism.y - point.y, moved: 0 };
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  const index = core.mirrorAt(point.x, point.y);
  if (index === null) return;
  dragging = {
    kind: 'mirror',
    index,
    offsetX: core.state.mirrors[index].x - point.x,
    offsetY: core.state.mirrors[index].y - point.y,
    moved: 0
  };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  const point = canvasPoint(event);
  if (!dragging) {
    hoverIndex = core.mirrorAt(point.x, point.y);
    hoverPrism = !!core.prismAt(point.x, point.y);
    canvas.style.cursor = (hoverIndex !== null || hoverPrism) ? 'grab' : 'default';
    return;
  }
  const targetX = point.x + dragging.offsetX;
  const targetY = point.y + dragging.offsetY;
  if (dragging.kind === 'prism') {
    const prism = core.state.prism;
    dragging.moved += Math.hypot(targetX - prism.x, targetY - prism.y);
    core.movePrism(targetX, targetY);
    return;
  }
  const mirror = core.state.mirrors[dragging.index];
  dragging.moved += Math.hypot(targetX - mirror.x, targetY - mirror.y);
  core.moveMirror(dragging.index, targetX, targetY);
});

canvas.addEventListener('pointerup', (event) => {
  if (!dragging) return;
  // 几乎没移动就是点了一下：把这面镜子翻个面（棱镜没有翻面这回事）
  if (dragging.kind === 'mirror' && dragging.moved < 8) {
    if (core.toggleMirror(dragging.index)) playFlip();
  }
  dragging = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener('pointercancel', () => { dragging = null; });

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (_) {
    /* 隐私模式下写不了就算了 */
  }
}

function goNextLevel() {
  if (core.isLastLevel()) return;
  core.nextLevel();
  progress.level = core.levelIndex;
  saveProgress();
  clearedLevel = -1;
  refreshLevelText();
  buildLevelGrid();
}

function goToLevel(index) {
  core.loadLevel(index);
  progress.level = core.levelIndex;
  saveProgress();
  clearedLevel = -1;
  refreshLevelText();
  buildLevelGrid();
  levelPanel.classList.add('is-hidden');
}

function buildLevelGrid() {
  levelGrid.innerHTML = '';
  for (let i = 0; i < core.levelCount; i += 1) {
    const level = core.levels[i];
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'level-tile';
    tile.dataset.level = String(i);
    if (progress.cleared.includes(i)) tile.classList.add('is-cleared');
    if (i === core.levelIndex) tile.classList.add('is-current');
    const number = document.createElement('span');
    number.textContent = String(i + 1).padStart(2, '0');
    const tag = document.createElement('small');
    tag.textContent = level.tag ?? '';
    tile.append(number, tag);
    tile.addEventListener('click', () => goToLevel(i));
    levelGrid.append(tile);
  }
}

levelsButton.addEventListener('click', () => {
  buildLevelGrid();
  levelPanel.classList.toggle('is-hidden');
});
levelClose.addEventListener('click', () => levelPanel.classList.add('is-hidden'));

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'r') core.restart();
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    goNextLevel();
  }
  if (event.key === 'Escape') levelPanel.classList.add('is-hidden');
  if (event.key.toLowerCase() === 'm') muted = !muted;
});

nextButton.addEventListener('click', goNextLevel);

function refreshLevelText() {
  litMaskBefore = 0;
  levelBadge.textContent = `${core.state.name} · ${core.levelIndex + 1}/${core.levelCount}`;
  hint.textContent = core.state.hint;
  hint.classList.remove('is-visible');
  void hint.offsetWidth;
  hint.classList.add('is-visible');
}

/* ---------------- 渲染 ---------------- */

function drawBackground() {
  const gradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 80, WIDTH / 2, HEIGHT / 2, WIDTH * 0.7);
  gradient.addColorStop(0, '#08222c');
  gradient.addColorStop(1, '#020c11');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.strokeStyle = 'rgba(89,217,229,.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
  for (let y = 0; y <= HEIGHT; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
  ctx.restore();
}

// 光束用 lighter 混合：红和绿照到同一处会自然变成黄，不用额外算混色。
function drawBeams() {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const beam of core.state.beams) {
    const rgb = rgbOf(beam.color);
    for (const [width, alpha] of [[16, 0.1], [7, 0.3], [3, 0.85]]) {
      ctx.strokeStyle = width === 3 ? rgba([255, 255, 255], 0.55) : rgba(rgb, alpha);
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSources() {
  for (const source of core.state.sources) {
    const rgb = rgbOf(source.color ?? 0);
    const tint = source.color ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : '#ffffff';
    ctx.save();
    ctx.shadowColor = tint;
    ctx.shadowBlur = 30;
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.arc(source.x, source.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,245,255,.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(source.x, source.y, 22, 0, Math.PI * 2);
    ctx.stroke();
    // 有色激光加一圈同色外环，跟白色主光源区分开
    if (source.color) {
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(source.x, source.y, 30, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawPrism(now) {
  const prism = core.state.prism;
  const pulse = 1 + Math.sin(now * 0.002) * 0.04;
  ctx.save();
  ctx.translate(prism.x, prism.y);
  ctx.shadowColor = '#a8e8ff';
  ctx.shadowBlur = 26;
  ctx.beginPath();
  ctx.moveTo(0, -prism.radius * 1.15 * pulse);
  ctx.lineTo(prism.radius * 1.1 * pulse, prism.radius * 0.75 * pulse);
  ctx.lineTo(-prism.radius * 1.1 * pulse, prism.radius * 0.75 * pulse);
  ctx.closePath();
  ctx.fillStyle = 'rgba(150,225,255,.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,245,255,.8)';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  // 能拖的棱镜给个手柄提示
  if (prism.movable) {
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = hoverPrism ? 'rgba(255,233,168,.95)' : 'rgba(160,225,250,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, prism.radius + 12 + Math.sin(now * 0.004) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = hoverPrism ? 'rgba(255,233,168,.95)' : 'rgba(160,225,250,.7)';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMirrors(now) {
  core.state.mirrors.forEach((mirror, index) => {
    const [a, b] = mirrorEndpoints(mirror);
    const fixed = !!mirror.fixed;
    const active = !fixed && (index === hoverIndex || (dragging && dragging.index === index));
    ctx.save();
    ctx.shadowColor = fixed ? 'rgba(150,175,190,.5)' : active ? '#ffe9a8' : '#9fe6ff';
    ctx.shadowBlur = fixed ? 8 : active ? 26 : 14;
    ctx.strokeStyle = fixed ? '#8fa6b4' : active ? '#fff1c4' : '#dcf6ff';
    ctx.lineWidth = active ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // 镜面背后的反光
    ctx.strokeStyle = fixed ? 'rgba(140,165,180,.4)' : 'rgba(120,200,230,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 3);
    ctx.lineTo(b.x, b.y + 3);
    ctx.stroke();

    // 抓取点：固定的画成方钉子，提示不可拖动
    const pulse = fixed ? 1 : 1 + Math.sin(now * 0.004 + index) * 0.12;
    ctx.fillStyle = 'rgba(5,29,38,.9)';
    ctx.strokeStyle = fixed ? '#8fa6b4' : active ? '#ffe9a8' : 'rgba(160,225,250,.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (fixed) {
      ctx.rect(mirror.x - 6, mirror.y - 6, 12, 12);
    } else {
      ctx.arc(mirror.x, mirror.y, 7 * pulse, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

function drawFilters(now) {
  for (const filter of core.state.filters) {
    const rgb = rgbOf(filter.color);
    const pulse = 1 + Math.sin(now * 0.002) * 0.03;
    ctx.save();
    ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.16)`;
    ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.75)`;
    ctx.shadowColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(filter.x, filter.y, filter.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 中间几道斜纹，一眼看出是滤片而不是目标
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(filter.x - filter.radius * 0.6, filter.y + i * 12 - filter.radius * 0.35);
      ctx.lineTo(filter.x + filter.radius * 0.6, filter.y + i * 12 + filter.radius * 0.35);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawSplitters() {
  for (const splitter of core.state.splitters) {
    const [a, b] = mirrorEndpoints(splitter);
    ctx.save();
    ctx.strokeStyle = '#bfe9ff';
    ctx.shadowColor = '#8fdcff';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    // 半透镜画成虚线覆层，跟实心镜子区分
    ctx.strokeStyle = 'rgba(5,29,38,.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(190,235,255,.9)';
    ctx.beginPath();
    ctx.arc(splitter.x, splitter.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const CHANNEL_BADGES = [
  { mask: RED, rgb: [255, 90, 82], label: '红' },
  { mask: GREEN, rgb: [90, 235, 140], label: '绿' },
  { mask: BLUE, rgb: [95, 170, 255], label: '蓝' }
];

// 目标内部画出它要的颜色：收到的那颗会亮起来，缺的那颗是暗的
function drawChannelBadges(target) {
  const needed = CHANNEL_BADGES.filter((channel) => target.color & channel.mask);
  if (needed.length <= 1) return;   // 单色目标的颜色本身就说明了一切，不用再画
  const spacing = 15;
  const startX = target.x - ((needed.length - 1) * spacing) / 2;
  needed.forEach((channel, index) => {
    const got = (target.hit & channel.mask) !== 0;
    const x = startX + index * spacing;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, target.y, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = got
      ? `rgb(${channel.rgb[0]},${channel.rgb[1]},${channel.rgb[2]})`
      : `rgba(${channel.rgb[0]},${channel.rgb[1]},${channel.rgb[2]},.22)`;
    if (got) {
      ctx.shadowColor = `rgb(${channel.rgb[0]},${channel.rgb[1]},${channel.rgb[2]})`;
      ctx.shadowBlur = 12;
    }
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = got ? 'rgba(255,255,255,.85)' : 'rgba(200,230,240,.28)';
    ctx.stroke();
    ctx.restore();
  });
}

function drawTargets(now) {
  core.state.targets.forEach((target, index) => {
    const lit = core.isLit(index);
    const wanted = rgbOf(target.color);
    const received = target.hit ? rgbOf(target.hit) : null;
    // 没点亮的目标也呼吸一下，把注意力拉过去
    const pulse = lit
      ? 1 + Math.sin(now * 0.005 + index) * 0.06
      : 1 + Math.sin(now * 0.003 + index * 1.7) * 0.05;

    ctx.save();
    // 目标要什么颜色：外环画出来
    ctx.shadowColor = rgba(wanted, lit ? 0.95 : 0.62);
    ctx.shadowBlur = lit ? 36 : 24;
    ctx.strokeStyle = rgba(wanted, lit ? 1 : 0.9);
    ctx.lineWidth = lit ? 5 : 3.6;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // 已经收到的光：内部填色，玩家能看出「还差一点」
    if (received) {
      ctx.fillStyle = rgba(received, 0.45);
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.72, 0, Math.PI * 2);
      ctx.fill();
    }
    if (lit) {
      ctx.fillStyle = rgba(wanted, 0.9);
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    drawChannelBadges(target);
  });
}

function render(now) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();
  drawBeams();
  drawSources();
  drawFilters(now);
  drawPrism(now);
  drawSplitters();
  drawMirrors(now);
  drawTargets(now);
}

let litMaskBefore = 0;

function soundForLitChanges() {
  let mask = 0;
  core.state.targets.forEach((_, index) => {
    if (core.isLit(index)) mask |= (1 << index);
  });
  if (mask === litMaskBefore) return;
  const gained = mask & ~litMaskBefore;
  const lost = litMaskBefore & ~mask;
  if (gained) playLit(core.litCount() - 1);
  if (lost) playUnlit();
  if (mask === (1 << core.state.targets.length) - 1 && litMaskBefore !== mask) playFanfare();
  litMaskBefore = mask;
}

function updateHud() {
  soundForLitChanges();
  litCounter.textContent = `${core.litCount()}/${core.state.targets.length}`;
  const solved = core.solved();
  banner.textContent = core.isLastLevel() ? 'ALL CLEAR' : 'ALL LIT';
  banner.classList.toggle('is-visible', solved);
  nextButton.classList.toggle('is-hidden', !solved || core.isLastLevel());

  // 第一次通关这一关时记下来，关卡面板里打勾
  if (solved && clearedLevel !== core.levelIndex) {
    clearedLevel = core.levelIndex;
    if (!progress.cleared.includes(core.levelIndex)) {
      progress.cleared.push(core.levelIndex);
      saveProgress();
      buildLevelGrid();
    }
  }
  if (!solved) clearedLevel = -1;
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  render(now);
  updateHud();
  requestAnimationFrame(loop);
}

refreshLevelText();
buildLevelGrid();

const params = new URLSearchParams(location.search);
if (params.has('debug')) {
  window.__prism = core;
  window.__prismProgress = progress;
}

requestAnimationFrame(loop);