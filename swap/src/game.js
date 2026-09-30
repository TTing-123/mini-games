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
const DEBUG = new URLSearchParams(location.search).has('debug');

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
        ctx.fillStyle = '#17323f';
        roundedRect(x + 3, y + 3, TILE - 6, TILE - 6, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(125,228,225,.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (tile === PIT) {
        ctx.fillStyle = '#03090d';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(255,116,104,.12)';
        ctx.strokeRect(x + 5, y + 5, TILE - 10, TILE - 10);
      } else {
        ctx.fillStyle = (row + col) % 2 ? '#0b202a' : '#0d2430';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(125,228,225,.07)';
        ctx.strokeRect(x + .5, y + .5, TILE - 1, TILE - 1);
      }

      if (tile === SPIKE) {
        ctx.fillStyle = '#ff7468';
        for (let index = 0; index < 3; index += 1) {
          const sx = x + 12 + index * 15;
          ctx.beginPath();
          ctx.moveTo(sx, y + TILE - 12);
          ctx.lineTo(sx + 7, y + 16);
          ctx.lineTo(sx + 14, y + TILE - 12);
          ctx.closePath();
          ctx.fill();
        }
      } else if (tile === PLATE) {
        ctx.strokeStyle = core.state.doorOpen ? '#4de2d5' : '#f5b84b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 16, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tile === DOOR) {
        ctx.fillStyle = core.state.doorOpen ? 'rgba(77,226,213,.22)' : '#f5b84b';
        roundedRect(x + 8, y + 5, TILE - 16, TILE - 10, 8);
        ctx.fill();
      } else if (tile === EXIT) {
        const pulse = .5 + .5 * Math.sin(performance.now() / 250);
        ctx.strokeStyle = '#f5b84b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 15 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
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
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#4de2d5';
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#071219';
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgba(245,184,75,${.35 + pulse * .4})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, player.radius + 7 + pulse * 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCrate(crate) {
  ctx.save();
  ctx.fillStyle = '#f5b84b';
  ctx.shadowColor = '#f5b84b';
  ctx.shadowBlur = 14;
  roundedRect(crate.x - 16, crate.y - 16, 32, 32, 7);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.42)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(crate.x - 10, crate.y - 10);
  ctx.lineTo(crate.x + 10, crate.y + 10);
  ctx.moveTo(crate.x + 10, crate.y - 10);
  ctx.lineTo(crate.x - 10, crate.y + 10);
  ctx.stroke();
  ctx.restore();
}

function drawEnemy(enemy) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.shadowColor = '#ff7468';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ff7468';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(16, 14);
  ctx.lineTo(-16, 14);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawKey(key) {
  if (key.collected) return;
  ctx.save();
  ctx.shadowColor = '#f5b84b';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#f5b84b';
  ctx.beginPath();
  ctx.arc(key.x, key.y - 3, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#071219';
  ctx.beginPath();
  ctx.arc(key.x, key.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(key.x - 2, key.y + 3, 4, 15);
  ctx.fillRect(key.x + 2, key.y + 12, 8, 4);
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


