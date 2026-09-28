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

const core = new PrismCore();
let dragging = null;
let hoverIndex = null;
let lastTime = performance.now();
let solvedAt = 0;

const rgbOf = (mask) => COLOR_RGB[colorKey(mask)];
const rgba = (rgb, alpha) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * (WIDTH / rect.width), y: (event.clientY - rect.top) * (HEIGHT / rect.height) };
}

/* ---------------- 输入：拖动移动，轻点翻面 ---------------- */

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const point = canvasPoint(event);
  const index = core.mirrorAt(point.x, point.y);
  if (index === null) {
    // 通关之后点画面任何地方都能继续，省得找不到按钮
    if (core.solved() && !core.isLastLevel()) goNextLevel();
    return;
  }
  dragging = {
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
    return;
  }
  const mirror = core.state.mirrors[dragging.index];
  const targetX = point.x + dragging.offsetX;
  const targetY = point.y + dragging.offsetY;
  dragging.moved += Math.hypot(targetX - mirror.x, targetY - mirror.y);
  core.moveMirror(dragging.index, targetX, targetY);
});

canvas.addEventListener('pointerup', (event) => {
  if (!dragging) return;
  // 几乎没移动就是点了一下：把这面镜子翻个面
  if (dragging.moved < 8) core.toggleMirror(dragging.index);
  dragging = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
});

canvas.addEventListener('pointercancel', () => { dragging = null; });

function goNextLevel() {
  if (core.isLastLevel()) return;
  core.nextLevel();
  refreshLevelText();
}

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'r') core.restart();
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    goNextLevel();
  }
});

nextButton.addEventListener('click', goNextLevel);

function refreshLevelText() {
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

function drawSource() {
  const source = core.state.source;
  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(source.x, source.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,240,255,.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(source.x, source.y, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
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
  ctx.restore();
}

function drawMirrors(now) {
  core.state.mirrors.forEach((mirror, index) => {
    const [a, b] = mirrorEndpoints(mirror);
    const active = index === hoverIndex || (dragging && dragging.index === index);
    ctx.save();
    ctx.shadowColor = active ? '#ffe9a8' : '#9fe6ff';
    ctx.shadowBlur = active ? 26 : 14;
    ctx.strokeStyle = active ? '#fff1c4' : '#dcf6ff';
    ctx.lineWidth = active ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // 镜面背后的反光
    ctx.strokeStyle = 'rgba(120,200,230,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 3);
    ctx.lineTo(b.x, b.y + 3);
    ctx.stroke();

    // 抓取点
    const pulse = 1 + Math.sin(now * 0.004 + index) * 0.12;
    ctx.fillStyle = 'rgba(5,29,38,.9)';
    ctx.strokeStyle = active ? '#ffe9a8' : 'rgba(160,225,250,.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mirror.x, mirror.y, 7 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

function drawTargets(now) {
  core.state.targets.forEach((target, index) => {
    const lit = core.isLit(index);
    const wanted = rgbOf(target.color);
    const received = target.hit ? rgbOf(target.hit) : null;
    const pulse = lit ? 1 + Math.sin(now * 0.005 + index) * 0.06 : 1;

    ctx.save();
    // 目标要什么颜色：外环画出来
    ctx.shadowColor = rgba(wanted, lit ? 0.95 : 0.5);
    ctx.shadowBlur = lit ? 36 : 16;
    ctx.strokeStyle = rgba(wanted, lit ? 1 : 0.75);
    ctx.lineWidth = lit ? 5 : 3;
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
  });
}

function render(now) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();
  drawBeams();
  drawSource();
  drawPrism(now);
  drawMirrors(now);
  drawTargets(now);
}

function updateHud() {
  litCounter.textContent = `${core.litCount()}/${core.state.targets.length}`;
  const solved = core.solved();
  banner.textContent = core.isLastLevel() ? 'ALL CLEAR' : 'ALL LIT';
  banner.classList.toggle('is-visible', solved);
  nextButton.classList.toggle('is-hidden', !solved || core.isLastLevel());
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  render(now);
  updateHud();
  requestAnimationFrame(loop);
}

refreshLevelText();

const params = new URLSearchParams(location.search);
if (params.has('debug')) window.__prism = core;

requestAnimationFrame(loop);