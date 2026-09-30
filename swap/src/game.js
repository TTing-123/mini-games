import {
  COLS,
  DOOR,
  EXIT,
  FLOOR,
  HEIGHT,
  PIT,
  PLATE,
  ROWS,
  SPIKE,
  SwapCore,
  TILE,
  WALL,
  WIDTH,
  cellCenter,
  cellOf,
  findSwapTarget,
  getLevelCount,
  tileAt
} from './swap-core.js';
import { createTutorial } from './tutorial.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const levelLabel = document.querySelector('#level-label');
const hearts = document.querySelector('#hearts');
const restartButton = document.querySelector('#restart');
const nextButton = document.querySelector('#next');
const levelTitle = document.querySelector('#level-title');
const levelHint = document.querySelector('#level-hint');
const result = document.querySelector('#result');
const resultKicker = document.querySelector('#result-kicker');
const resultTitle = document.querySelector('#result-title');
const resultText = document.querySelector('#result-text');
const resultNext = document.querySelector('#result-next');
const resultRetry = document.querySelector('#result-retry');
const tutorialButton = document.querySelector('#tutorial-button');
const tutorialOverlay = document.querySelector('#tutorial');
const tutorialCanvas = document.querySelector('#tutorial-canvas');
const tutorialStart = document.querySelector('#tutorial-start');
const tutorialAnim = createTutorial(tutorialCanvas);
const DEBUG = new URLSearchParams(location.search).has('debug');
const TUTORIAL_KEY = 'swap-tutorial-v1';

const core = new SwapCore();
const keys = new Set();
let mouse = { x: WIDTH / 2, y: HEIGHT / 2 };
let hoverTarget = null;
let audioContext = null;
let resultShown = false;

function setupCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = WIDTH * dpr;
  canvas.height = HEIGHT * dpr;
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

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#102c37');
  gradient.addColorStop(.6, '#0a1d27');
  gradient.addColorStop(1, '#071219');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawTiles() {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const x = col * TILE;
      const y = row * TILE;
      const tile = tileAt(core.state, col, row);
      if (tile === WALL) {
        const g = ctx.createLinearGradient(x, y, x, y + TILE);
        g.addColorStop(0, '#234653');
        g.addColorStop(1, '#122b35');
        ctx.fillStyle = g;
        roundedRect(x + 3, y + 3, TILE - 6, TILE - 6, 9);
        ctx.fill();
        ctx.strokeStyle = 'rgba(180,235,232,.16)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(5,16,22,.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + TILE / 2);
        ctx.lineTo(x + TILE - 8, y + TILE / 2);
        ctx.moveTo(x + TILE / 2, y + 8);
        ctx.lineTo(x + TILE / 2, y + TILE - 8);
        ctx.stroke();
      } else if (tile === PIT) {
        const g = ctx.createRadialGradient(x + TILE / 2, y + TILE / 2, 4, x + TILE / 2, y + TILE / 2, TILE * .7);
        g.addColorStop(0, '#000000');
        g.addColorStop(1, '#071219');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(0,0,0,.9)';
        ctx.lineWidth = 6;
        ctx.strokeRect(x + 4, y + 4, TILE - 8, TILE - 8);
      } else {
        const g = ctx.createLinearGradient(x, y, x + TILE, y + TILE);
        g.addColorStop(0, (row + col) % 2 ? '#102a35' : '#12313d');
        g.addColorStop(1, '#0a1c25');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(125,228,225,.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
        ctx.fillStyle = 'rgba(255,255,255,.035)';
        ctx.fillRect(x + 8, y + 8, 3, 3);
        ctx.fillRect(x + TILE - 13, y + TILE - 14, 2, 2);
      }

      if (tile === SPIKE) {
        for (let index = 0; index < 3; index += 1) {
          const sx = x + 10 + index * 15;
          const g = ctx.createLinearGradient(sx, y + 16, sx, y + TILE - 10);
          g.addColorStop(0, '#ffd0ca');
          g.addColorStop(.5, '#ff7468');
          g.addColorStop(1, '#842b30');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(sx, y + TILE - 10);
          ctx.lineTo(sx + 7, y + 15);
          ctx.lineTo(sx + 14, y + TILE - 10);
          ctx.closePath();
          ctx.fill();
        }
      } else if (tile === PLATE) {
        ctx.fillStyle = 'rgba(245,184,75,.13)';
        roundedRect(x + 10, y + 10, TILE - 20, TILE - 20, 8);
        ctx.fill();
        ctx.strokeStyle = core.state.doorOpen ? '#4de2d5' : '#f5b84b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 15, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tile === DOOR) {
        const open = core.state.doorOpen;
        ctx.fillStyle = open ? 'rgba(77,226,213,.18)' : '#b8792f';
        roundedRect(x + 7, y + 4, TILE - 14, TILE - 8, 8);
        ctx.fill();
        ctx.strokeStyle = open ? '#4de2d5' : '#f5b84b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = open ? '#4de2d5' : '#5a3518';
        ctx.beginPath();
        ctx.arc(x + TILE - 16, y + TILE / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile === EXIT) {
        const pulse = .5 + .5 * Math.sin(performance.now() / 250);
        ctx.strokeStyle = '#f5b84b';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#f5b84b';
        ctx.shadowBlur = 18 + pulse * 12;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 15 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }
}
function drawPlayer() {
  const player = core.state.player;
  const pulse = .5 + .5 * Math.sin(performance.now() / 180);
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.shadowColor = '#4de2d5';
  ctx.shadowBlur = 20;
  const body = ctx.createRadialGradient(-6, -8, 2, 0, 0, 19);
  body.addColorStop(0, '#eafffc');
  body.addColorStop(.35, '#4de2d5');
  body.addColorStop(1, '#176f73');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#071219';
  ctx.beginPath();
  ctx.ellipse(0, -3, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eafffc';
  ctx.beginPath();
  ctx.arc(-3.5, -3, 2.2, 0, Math.PI * 2);
  ctx.arc(3.5, -3, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a8e9e4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 22 + pulse * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#4de2d5';
  ctx.fillRect(-8, 9, 16, 4);
  ctx.restore();
}
function drawCrate(crate) {
  ctx.save();
  ctx.translate(crate.x, crate.y);
  ctx.shadowColor = '#f5b84b';
  ctx.shadowBlur = 14;
  const wood = ctx.createLinearGradient(-18, -18, 18, 18);
  wood.addColorStop(0, '#d79a4c');
  wood.addColorStop(.5, '#a9682d');
  wood.addColorStop(1, '#71401d');
  ctx.fillStyle = wood;
  roundedRect(-18, -18, 36, 36, 5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,217,150,.42)';
  ctx.fillRect(-14, -15, 28, 6);
  ctx.fillRect(-14, 9, 28, 6);
  ctx.strokeStyle = '#4f2c14';
  ctx.lineWidth = 3;
  ctx.strokeRect(-18, -18, 36, 36);
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.lineTo(14, 14);
  ctx.moveTo(14, -14);
  ctx.lineTo(-14, 14);
  ctx.stroke();
  ctx.fillStyle = '#f5b84b';
  [[-14,-14],[14,-14],[-14,14],[14,14]].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}
function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.shadowColor = '#ff7468';
  ctx.shadowBlur = 18;
  const body = ctx.createRadialGradient(-5, -8, 2, 0, 0, 20);
  body.addColorStop(0, '#ffd5d0');
  body.addColorStop(.35, '#ff7468');
  body.addColorStop(1, '#8e2f34');
  ctx.fillStyle = body;
  ctx.beginPath();
  for (let index = 0; index < 12; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI / 6;
    const radius = index % 2 ? 13 : 19;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#071219';
  ctx.beginPath();
  ctx.arc(-5, -3, 3, 0, Math.PI * 2);
  ctx.arc(5, -3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
function drawKey(key) {
  if (key.collected) return;
  ctx.save();
  ctx.translate(key.x, key.y);
  ctx.shadowColor = '#f5b84b';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = '#f5b84b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -10, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(0, 18);
  ctx.moveTo(0, 11);
  ctx.lineTo(10, 11);
  ctx.moveTo(0, 17);
  ctx.lineTo(7, 17);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -10, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
function drawTarget() {
  if (!hoverTarget) return;
  const valid = hoverTarget;
  ctx.save();
  ctx.setLineDash([7, 7]);
  ctx.strokeStyle = 'rgba(154,98,232,.72)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(core.state.player.x, core.state.player.y);
  ctx.lineTo(valid.x, valid.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = '#9a62e8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(valid.x, valid.y, (valid.radius ?? 16) + 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSwapFlash() {
  ctx.save();
  ctx.globalAlpha = Math.max(0, core.state.swapCooldown / .62) * .7;
  ctx.strokeStyle = '#9a62e8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(core.state.player.x, core.state.player.y, 30 + (1 - core.state.swapCooldown / .62) * 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFirstLevelHint(now) {
  if (core.state.levelIndex !== 0 || core.state.won || !core.state.crates.length) return;
  const crate = core.state.crates[0];
  const pulse = .5 + .5 * Math.sin(now / 220);
  ctx.save();
  ctx.setLineDash([7, 7]);
  ctx.strokeStyle = `rgba(154,98,232,${.45 + pulse * .4})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(crate.x, crate.y, 28 + pulse * 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#f4ffff';
  ctx.strokeStyle = '#071219';
  ctx.lineWidth = 2;
  const hx = crate.x + 23;
  const hy = crate.y - 26;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx, hy + 16);
  ctx.lineTo(hx + 5, hy + 12);
  ctx.lineTo(hx + 9, hy + 18);
  ctx.lineTo(hx + 12, hy + 16);
  ctx.lineTo(hx + 8, hy + 10);
  ctx.lineTo(hx + 15, hy + 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function openTutorial() {
  tutorialOverlay.classList.remove('is-hidden');
  tutorialAnim.start();
}

function closeTutorial() {
  tutorialOverlay.classList.add('is-hidden');
  tutorialAnim.stop();
  try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch (_) { /* 忽略隐私模式 */ }
}
function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();
  drawTiles();
  core.state.crates.forEach(drawCrate);
  core.state.keys.forEach(drawKey);
  core.state.enemies.forEach(drawEnemy);
  drawTarget();
  drawPlayer();
  drawSwapFlash();
  requestAnimationFrame(render);
}

function updateHud() {
  const total = getLevelCount();
  levelLabel.textContent = `${core.state.levelIndex + 1} / ${total}`;
  levelTitle.textContent = core.state.title;
  levelHint.textContent = core.state.hint;
  hearts.innerHTML = '';
  for (let index = 0; index < core.state.player.hpMax; index += 1) {
    const heart = document.createElement('span');
    heart.className = index < core.state.player.hp ? 'heart' : 'heart is-empty';
    hearts.append(heart);
  }
  nextButton.disabled = !core.state.won || core.state.levelIndex >= total - 1;
}

function showResult(won) {
  if (resultShown) return;
  resultShown = true;
  const last = core.state.levelIndex >= getLevelCount() - 1;
  resultKicker.textContent = won ? '关卡完成' : '被抓住了';
  resultTitle.textContent = won ? (last ? '全部换位完成' : '通过') : '再来一次';
  resultText.textContent = won ? (last ? '五组换位谜题全部解决。' : '钥匙拿到了，出口也找到了。') : '生命归零。想一想还能和谁换位。';
  resultNext.textContent = won ? (last ? '回到第一关' : '下一关') : '重来';
  result.classList.remove('is-hidden');
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

function tone(frequency, duration, type = 'sine', gain = .018, delay = 0) {
  const audio = ensureAudio();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const volume = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + .012);
  volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(volume).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function pointerPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width * WIDTH,
    y: (event.clientY - rect.top) / rect.height * HEIGHT
  };
}

function loadLevel(index) {
  core.loadLevel(index);
  hoverTarget = null;
  resultShown = false;
  result.classList.add('is-hidden');
  updateHud();
}

function restart() {
  core.restart();
  hoverTarget = null;
  resultShown = false;
  result.classList.add('is-hidden');
  updateHud();
}

function nextLevel() {
  if (core.state.levelIndex >= getLevelCount() - 1) {
    loadLevel(0);
    return;
  }
  core.next();
  hoverTarget = null;
  resultShown = false;
  result.classList.add('is-hidden');
  updateHud();
}

function frame(now) {
  const dt = Math.min(.05, (now - (frame.last ?? now)) / 1000);
  frame.last = now;
  const dx = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  const dy = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
  if (dx || dy) core.move(dx, dy, dt);
  core.update(dt);
  updateHud();
  if (!resultShown) {
    if (core.state.won) showResult(true);
    else if (core.state.lost) showResult(false);
  }
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === 'r') restart();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener('pointermove', (event) => {
  mouse = pointerPoint(event);
  hoverTarget = findSwapTarget(core.state, mouse);
});

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  ensureAudio();
  const point = pointerPoint(event);
  const target = findSwapTarget(core.state, point);
  if (!target) return;
  if (!core.trySwapAt(point)) return;
  hoverTarget = null;
  tone(520, .1, 'triangle', .02);
  tone(680, .08, 'sine', .012, .05);
});

tutorialButton.addEventListener('click', openTutorial);
tutorialStart.addEventListener('click', closeTutorial);
restartButton.addEventListener('click', restart);
nextButton.addEventListener('click', nextLevel);
resultNext.addEventListener('click', () => {
  if (core.state.won) nextLevel();
  else restart();
});
resultRetry.addEventListener('click', restart);

if (DEBUG) {
  window.__swap = {
    get core() { return core; },
    loadLevel,
    restart,
    nextLevel
  };
}

setupCanvas();
render();
requestAnimationFrame(frame);
if (localStorage.getItem(TUTORIAL_KEY) !== '1') openTutorial();
