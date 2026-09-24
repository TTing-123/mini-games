import { PolarityCore, WIDTH, HEIGHT, PAIR_DISTANCE, TURN_TIME } from './polarity-core.js';

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const movePips = document.querySelector('#move-pips');
const moveCount = document.querySelector('#move-count');
const levelBadge = document.querySelector('#level-badge');
const pairCount = document.querySelector('#pair-count');
const levelHint = document.querySelector('#level-hint');
const levelSelectPanel = document.querySelector('#level-select-panel');
const levelSelectToggle = document.querySelector('#level-select-toggle');
const restartButton = document.querySelector('#restart-button');
const gameOver = document.querySelector('#game-over');
const gameOverTitle = document.querySelector('#game-over-title');
const gameOverCopy = document.querySelector('#game-over-copy');
const retryButton = document.querySelector('#retry-button');
const gameOverLevels = document.querySelector('#game-over-levels');

const core = new PolarityCore();
const effects = [];
let lastTime = performance.now();
let hudSnapshot = '';

const POSITIVE = { core: '#f15a4c', glow: '#ff8b7a', soft: 'rgba(241,90,76,.18)' };
const NEGATIVE = { core: '#59d9e5', glow: '#9ff2ff', soft: 'rgba(89,217,229,.18)' };

const paletteOf = (particle) => (particle.polarity > 0 ? POSITIVE : NEGATIVE);

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * (WIDTH / rect.width), y: (event.clientY - rect.top) * (HEIGHT / rect.height) };
}

function addEffect(type, x, y, color) {
  effects.push({ type, x, y, color, ttl: type === 'lock' ? 0.7 : 0.5, max: type === 'lock' ? 0.7 : 0.5 });
}

function setLevel(index) {
  core.loadLevel(index);
  gameOver.classList.add('is-hidden');
  levelSelectPanel.classList.add('is-hidden');
  updateHud(core.state);
}

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  if (!core.canFlip()) return;
  const point = canvasPoint(event);
  const particle = core.particleAt(point.x, point.y);
  if (particle) core.flip(particle.id);
});

window.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '4') setLevel(Number(event.key) - 1);
  if (event.key.toLowerCase() === 'r') setLevel(0);
  if (event.key === 'Escape') levelSelectPanel.classList.add('is-hidden');
});

levelSelectToggle.addEventListener('click', () => levelSelectPanel.classList.toggle('is-hidden'));
document.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => setLevel(Number(button.dataset.level))));
restartButton.addEventListener('click', () => setLevel(0));
retryButton.addEventListener('click', () => setLevel(core.state.levelIndex));
gameOverLevels.addEventListener('click', () => { gameOver.classList.add('is-hidden'); levelSelectPanel.classList.remove('is-hidden'); });

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'flip') addEffect('flip', event.x, event.y, event.polarity > 0 ? POSITIVE.glow : NEGATIVE.glow);
    if (event.type === 'pair') addEffect('lock', event.x, event.y, '#ffd86a');
    if (event.type === 'unpair') addEffect('break', event.x, event.y, '#f0bd36');
    if (event.type === 'won') showGameOver(true);
    if (event.type === 'lost') showGameOver(false);
    if (event.type === 'levelLoaded') {
      updateHud(core.state);
      showHint();
    }
    if (event.type === 'ready' || event.type === 'pair' || event.type === 'unpair') updateHud(core.state);
  }
}

function showHint() {
  levelHint.textContent = core.state.hint;
  levelHint.classList.remove('is-visible');
  void levelHint.offsetWidth;
  levelHint.classList.add('is-visible');
}

function showGameOver(won) {
  gameOverTitle.textContent = won ? 'ALL PAIRS LOCKED' : 'OUT OF FLIPS';
  gameOverCopy.textContent = won ? '全部粒子都配对锁定了。' : '还有粒子没配上对，再试一次。';
  gameOver.classList.remove('is-hidden');
}

function updateHud(state) {
  if (!state) return;
  const paired = state.particles.filter((particle) => particle.partnerId !== null).length / 2;
  const total = state.particles.length / 2;
  const signature = `${state.label}|${state.movesLeft}|${state.movesMax}|${paired}`;
  if (signature === hudSnapshot) return;
  hudSnapshot = signature;
  levelBadge.textContent = state.label;
  moveCount.textContent = String(state.movesLeft);
  pairCount.textContent = `${paired}/${total}`;
  movePips.innerHTML = '';
  for (let i = 0; i < state.movesMax; i += 1) {
    const pip = document.createElement('span');
    pip.className = `pip ${i < state.movesLeft ? 'is-active' : ''}`;
    movePips.append(pip);
  }
}

/* ---------------- 渲染 ---------------- */

function drawBoard() {
  const gradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT * 0.35, 80, WIDTH / 2, HEIGHT * 0.35, WIDTH * 0.72);
  gradient.addColorStop(0, '#0b3440');
  gradient.addColorStop(1, '#031016');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.strokeStyle = 'rgba(89,217,229,.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();
}

// 会互相吸引的粒子之间画虚线，已经锁定的画实线：一眼看出谁跟谁有关系。
function drawLinks() {
  const particles = core.state.particles;
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const locked = a.partnerId === b.id;
      if (!locked && (a.partnerId !== null || b.partnerId !== null)) continue;
      if (a.polarity === b.polarity) continue;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (!locked && distance > 620) continue;
      ctx.save();
      if (locked) {
        ctx.strokeStyle = 'rgba(255,216,106,.9)';
        ctx.shadowColor = '#ffd86a';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 5;
      } else {
        const strength = Math.max(0.12, 1 - distance / 620);
        ctx.strokeStyle = `rgba(160,220,240,${0.12 + strength * 0.28})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([7, 9]);
        ctx.lineDashOffset = -(performance.now() / 90) % 16;
      }
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawParticles() {
  const now = performance.now();
  for (const particle of core.state.particles) {
    const palette = paletteOf(particle);
    const locked = particle.partnerId !== null;
    const pulse = locked ? 1 + Math.sin(now * 0.004) * 0.05 : 1;

    ctx.save();
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = locked ? 34 : 22;
    ctx.fillStyle = palette.soft;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * 1.9 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.core;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = palette.glow;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 极性符号
    ctx.strokeStyle = 'rgba(255,255,255,.95)';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(particle.x - 7, particle.y);
    ctx.lineTo(particle.x + 7, particle.y);
    if (particle.polarity > 0) {
      ctx.moveTo(particle.x, particle.y - 7);
      ctx.lineTo(particle.x, particle.y + 7);
    }
    ctx.stroke();
    ctx.restore();

    // 可点击时给个呼吸环
    if (core.canFlip()) {
      ctx.save();
      ctx.globalAlpha = 0.22 + Math.sin(now * 0.003 + particle.id) * 0.12;
      ctx.strokeStyle = palette.glow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius + 8 + Math.sin(now * 0.002 + particle.id) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawTurnProgress() {
  if (core.state.status !== 'resolving') return;
  const ratio = Math.min(1, core.state.turnTime / TURN_TIME);
  const width = 360;
  const x = (WIDTH - width) / 2;
  const y = HEIGHT - 58;
  ctx.save();
  ctx.fillStyle = 'rgba(89,217,229,.16)';
  ctx.beginPath();
  ctx.roundRect(x, y, width, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#59d9e5';
  ctx.shadowColor = '#59d9e5';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(x, y, width * ratio, 6, 3);
  ctx.fill();
  ctx.restore();
}

function drawEffects() {
  for (const effect of effects) {
    const progress = 1 - effect.ttl / effect.max;
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = effect.color;
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = effect.type === 'break' ? 2 : 3;
    if (effect.type === 'break') ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, 10 + progress * 46, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function render() {
  drawBoard();
  drawLinks();
  drawParticles();
  drawTurnProgress();
  drawEffects();
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  core.update(dt);
  for (let i = effects.length - 1; i >= 0; i -= 1) {
    effects[i].ttl -= dt;
    if (effects[i].ttl <= 0) effects.splice(i, 1);
  }
  handleEvents(core.consumeEvents());
  render();
  requestAnimationFrame(loop);
}

const params = new URLSearchParams(location.search);
if (params.has('levels')) levelSelectPanel.classList.remove('is-hidden');
// 自动化检查用：?debug=1 时把 core 挂出来，方便测试直接读粒子状态。
if (params.has('debug')) window.__polarity = core;

updateHud(core.state);
showHint();
requestAnimationFrame(loop);