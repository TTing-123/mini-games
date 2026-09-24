import { GameCore, WIDTH, HEIGHT } from './game-core.js';

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const targetPips = document.querySelector('#target-pips');
const shotPips = document.querySelector('#shot-pips');
const targetCount = document.querySelector('#target-count');
const shotCount = document.querySelector('#shot-count');
const levelBadge = document.querySelector('#level-badge');
const comboToast = document.querySelector('#combo-toast');
const helpModal = document.querySelector('#help-modal');
const helpClose = document.querySelector('#help-close');
const helpStart = document.querySelector('#help-start');
const levelSelectPanel = document.querySelector('#level-select-panel');
const levelSelectToggle = document.querySelector('#level-select-toggle');
const gameOver = document.querySelector('#game-over');
const gameOverTitle = document.querySelector('#game-over-title');
const gameOverCopy = document.querySelector('#game-over-copy');
const retryButton = document.querySelector('#retry-button');
const gameOverLevels = document.querySelector('#game-over-levels');
const restartButton = document.querySelector('#restart-button');

const core = new GameCore();
const pointer = { x: 640, y: 420 };
const effects = [];
let lastTime = performance.now();
let hudSnapshot = '';

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (WIDTH / rect.width),
    y: (event.clientY - rect.top) * (HEIGHT / rect.height)
  };
}

function launchAtPointer() {
  const spawn = { x: 640, y: 620 };
  core.launch({ x: pointer.x - spawn.x, y: pointer.y - spawn.y });
}

function setLevel(levelId) {
  if (levelId === 5) core.loadEndlessLevel(1);
  else core.loadStaticLevel(levelId - 1);
  gameOver.classList.add('is-hidden');
  levelSelectPanel.classList.add('is-hidden');
  updateHud(core.state);
}

canvas.addEventListener('pointermove', (event) => {
  const point = canvasPoint(event);
  pointer.x = point.x;
  pointer.y = point.y;
});

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const point = canvasPoint(event);
  pointer.x = point.x;
  pointer.y = point.y;
  launchAtPointer();
});

window.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '4') setLevel(Number(event.key));
  if (event.key === '0') setLevel(5);
  if (event.key.toLowerCase() === 'r') core.loadStaticLevel(0);
  if (event.key === 'Escape') levelSelectPanel.classList.add('is-hidden');
});

levelSelectToggle.addEventListener('click', () => levelSelectPanel.classList.toggle('is-hidden'));
document.querySelectorAll('[data-level]').forEach((button) => {
  button.addEventListener('click', () => setLevel(Number(button.dataset.level)));
});
restartButton.addEventListener('click', () => { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); });
retryButton.addEventListener('click', () => { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); });
gameOverLevels.addEventListener('click', () => {
  gameOver.classList.add('is-hidden');
  levelSelectPanel.classList.remove('is-hidden');
});
helpClose.addEventListener('click', closeHelp);
helpStart.addEventListener('click', () => {
  closeHelp();
  try { localStorage.setItem('pulse-help-seen', '1'); } catch (_) {}
});

function closeHelp() {
  helpModal.classList.add('is-hidden');
}

let helpSeen = false;
try { helpSeen = localStorage.getItem('pulse-help-seen') === '1'; } catch (_) {}
if (!helpSeen) helpModal.classList.remove('is-hidden');
else helpModal.classList.add('is-hidden');
function addEffect(type, x, y, color) {
  effects.push({ type, x, y, color, ttl: 0.45, max: 0.45 });
  if (type === 'combo') {
    comboToast.classList.remove('is-visible');
    void comboToast.offsetWidth;
    comboToast.classList.add('is-visible');
  }
}

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'target') addEffect('burst', event.x, event.y, '#ff554d');
    if (event.type === 'bounce') addEffect('spark', event.x, event.y, '#4ecbff');
    if (event.type === 'split') addEffect('burst', event.x, event.y, '#ffd24a');
    if (event.type === 'charge') addEffect('burst', event.x, event.y, '#5cff8b');
    if (event.type === 'combo') addEffect('combo', event.x, event.y, '#ffd24a');
    if (event.type === 'levelClear') {
      addEffect('burst', WIDTH / 2, HEIGHT / 2, '#64e7ff');
      updateHud(core.state);
    }
    if (event.type === 'levelLoaded') { updateHud(core.state); gameOver.classList.add('is-hidden'); }
    if (event.type === 'charge' || event.type === 'combo') updateHud(core.state);
    if (event.type === 'gameOver') showGameOver(event.won);
    if (event.type === 'launched' || event.type === 'aiming') updateHud(core.state);
  }
}

function showGameOver(won) {
  gameOverTitle.textContent = won ? 'CHAIN COMPLETE' : 'CHAIN BROKEN';
  gameOverCopy.textContent = won ? '所有目标已被清除。' : '发射次数耗尽。调整角度再试一次。';
  gameOver.classList.remove('is-hidden');
}

function updateHud(state) {
  if (!state) return;
  const signature = `${state.label}|${state.targetsRemaining}|${state.shotsLeft}|${state.shotsMax}`;
  if (signature === hudSnapshot) return;
  hudSnapshot = signature;
  levelBadge.textContent = state.label;
  targetCount.textContent = `${state.targetsRemaining}`;
  shotCount.textContent = `${state.shotsLeft}`;
  targetPips.innerHTML = '';
  shotPips.innerHTML = '';
  for (let i = 0; i < state.targetsTotal; i += 1) {
    const pip = document.createElement('span');
    pip.className = `pip target-pip ${i < state.targetsRemaining ? 'is-active' : ''}`;
    targetPips.append(pip);
  }
  for (let i = 0; i < state.shotsMax; i += 1) {
    const pip = document.createElement('span');
    pip.className = `pip shot-pip ${i < state.shotsLeft ? 'is-active' : ''}`;
    shotPips.append(pip);
  }
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBoard();
  drawGravityWells();
  drawBumpers();
  drawTargets();
  drawSplitters();
  drawChargers();
  drawAim();
  drawBalls();
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
function drawBoard() {
  const gradient = ctx.createRadialGradient(640, 360, 40, 640, 360, 720);
  gradient.addColorStop(0, '#101b2c'); gradient.addColorStop(1, '#05070c');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = 'rgba(91, 158, 210, 0.12)'; ctx.lineWidth = 1;
  for (let x = 40; x < WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, HEIGHT - 20); ctx.stroke(); }
  for (let y = 40; y < HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(WIDTH - 20, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(100, 220, 255, 0.65)'; ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);
}

function drawTargets() {
  for (const target of core.state.entities.targets) {
    if (!target.active) continue;
    const pulse = 1 + Math.sin(performance.now() * 0.004 + target.id) * 0.06;
    ctx.save(); ctx.shadowColor = '#ff4338'; ctx.shadowBlur = 24;
    ctx.strokeStyle = '#ff554d'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255, 60, 52, 0.28)';
    ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * 0.62, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}

function drawBumpers() {
  for (const bumper of core.state.entities.bumpers) {
    ctx.save(); ctx.shadowColor = '#35bfff'; ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(40, 170, 240, 0.28)';
    ctx.beginPath(); ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#56d4ff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}

function drawGravityWells() {
  for (const well of core.state.entities.gravity) {
    const pulse = 1 + Math.sin(performance.now() * 0.003) * 0.04;
    ctx.save(); ctx.shadowColor = '#a95cff'; ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(170, 90, 255, 0.38)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(well.x, well.y, well.radius * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(150, 70, 255, 0.12)';
    ctx.beginPath(); ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(185, 105, 255, 0.85)';
    ctx.beginPath(); ctx.arc(well.x, well.y, 16, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    for (const ball of core.state.balls) {
      if (Math.hypot(ball.x - well.x, ball.y - well.y) < well.radius) {
        ctx.strokeStyle = 'rgba(190, 120, 255, 0.34)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(well.x, well.y); ctx.lineTo(ball.x, ball.y); ctx.stroke();
      }
    }
  }
}
function drawSplitters() {
  for (const splitter of core.state.entities.splitters) {
    if (splitter.used) continue;
    ctx.save(); ctx.translate(splitter.x, splitter.y); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255, 205, 60, 0.22)'; ctx.fillRect(-24, -24, 48, 48);
    ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 4; ctx.strokeRect(-24, -24, 48, 48); ctx.restore();
  }
}

function drawChargers() {
  for (const charger of core.state.entities.chargers) {
    if (charger.used) continue;
    ctx.save(); ctx.shadowColor = '#4dff87'; ctx.shadowBlur = 18;
    ctx.strokeStyle = '#5cff8b'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(charger.x, charger.y, charger.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(60, 255, 120, 0.28)'; ctx.fillRect(charger.x - 4, charger.y - 14, 8, 28);
    ctx.fillRect(charger.x - 14, charger.y - 4, 28, 8); ctx.restore();
  }
}

function drawAim() {
  const state = core.state;
  if (!state || state.status !== 'aiming') return;
  const dx = pointer.x - 640; const dy = pointer.y - 620; const length = Math.hypot(dx, dy);
  if (length < 12) return;
  ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(110, 225, 255, 0.8)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(640, 620); ctx.lineTo(pointer.x, pointer.y); ctx.stroke(); ctx.restore();
}

function drawBalls() {
  for (const ball of core.state.balls) {
    if (ball.trail.length > 1) {
      ctx.strokeStyle = 'rgba(100, 225, 255, 0.28)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
      for (const point of ball.trail) ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    ctx.save(); ctx.shadowColor = '#d8fbff'; ctx.shadowBlur = 22;
    ctx.fillStyle = '#f2fcff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#63dfff'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  }
}

function drawEffects() {
  for (const effect of effects) {
    const progress = 1 - effect.ttl / effect.max;
    const size = effect.type === 'burst' ? 18 + progress * 56 : 8 + progress * 20;
    ctx.save(); ctx.globalAlpha = 1 - progress; ctx.strokeStyle = effect.color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}

updateHud(core.state);
requestAnimationFrame(loop);