import {
  CORE,
  HEIGHT,
  MAX_PATH_LENGTH,
  RouteCore,
  SPAWN,
  TURRETS,
  WIDTH,
  pathLength
} from './route-core.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const coreHpLabel = document.querySelector('#core-hp');
const waveLabel = document.querySelector('#wave');
const scoreLabel = document.querySelector('#score');
const inkBar = document.querySelector('#ink-bar');
const inkValue = document.querySelector('#ink-value');
const redrawValue = document.querySelector('#redraw-value');
const turretList = document.querySelector('#turret-list');
const restartButton = document.querySelector('#restart');
const gameover = document.querySelector('#gameover');
const gameoverText = document.querySelector('#gameover-text');
const againButton = document.querySelector('#again');
const DEBUG = new URLSearchParams(location.search).has('debug');

const core = new RouteCore();
let drawing = null;
let previewPoints = [];
let flashes = [];
let particles = [];
let lastTime = performance.now();
let hudTimer = 0;
let message = '';
let messageTimer = 0;
let shake = 0;
let audioContext = null;

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

function strokePath(points, color, width, alpha = 1, dash = []) {
  if (points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) ctx.lineTo(points[index].x, points[index].y);
  ctx.stroke();
  ctx.restore();
}

function drawBackground() {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#102c37');
  gradient.addColorStop(.58, '#0a1d27');
  gradient.addColorStop(1, '#071219');
  roundedRect(0, 0, WIDTH, HEIGHT, 30);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.clip();
  ctx.globalAlpha = .16;
  ctx.strokeStyle = '#7de4e1';
  ctx.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPath() {
  const path = core.state.path;
  strokePath(path, 'rgba(77,226,213,.16)', 18);
  strokePath(path, 'rgba(77,226,213,.78)', 4);

  if (previewPoints.length >= 2) {
    const length = pathLength([SPAWN, ...previewPoints, CORE]);
    const ok = length <= MAX_PATH_LENGTH;
    strokePath([SPAWN, ...previewPoints, CORE], ok ? '#f5b84b' : '#ff7468', 5, .92, ok ? [] : [10, 8]);
  }
}

function drawSpawnAndCore(now) {
  ctx.save();
  const pulse = .5 + .5 * Math.sin(now / 260);
  ctx.fillStyle = 'rgba(77,226,213,.16)';
  ctx.beginPath();
  ctx.arc(SPAWN.x, SPAWN.y, 26 + pulse * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4de2d5';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#dffffb';
  ctx.font = '700 10px "Consolas", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('入口', SPAWN.x, SPAWN.y + 45);

  const hpRatio = core.state.coreHp / core.state.coreHpMax;
  ctx.shadowColor = hpRatio > .45 ? '#4de2d5' : '#ff7468';
  ctx.shadowBlur = 24;
  ctx.fillStyle = hpRatio > .45 ? '#4de2d5' : '#ff7468';
  ctx.beginPath();
  ctx.arc(CORE.x, CORE.y, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#071219';
  ctx.font = '700 13px "Trebuchet MS", sans-serif';
  ctx.fillText('核', CORE.x, CORE.y + 1);
  ctx.restore();
}

function drawTurrets() {
  for (const turret of core.state.turrets) {
    ctx.save();
    ctx.globalAlpha = .09;
    ctx.fillStyle = '#4de2d5';
    ctx.beginPath();
    ctx.arc(turret.x, turret.y, turret.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(77,226,213,.34)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = turret.ammo > 0 ? '#4de2d5' : '#31515b';
    ctx.shadowColor = '#4de2d5';
    ctx.shadowBlur = turret.ammo > 0 ? 18 : 0;
    ctx.beginPath();
    ctx.arc(turret.x, turret.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#071219';
    ctx.font = '700 10px "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(turret.ammo), turret.x, turret.y + .5);

    for (let index = 0; index < turret.ammoMax; index += 1) {
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / turret.ammoMax);
      ctx.fillStyle = index < turret.ammo ? '#f5b84b' : 'rgba(255,255,255,.12)';
      ctx.beginPath();
      ctx.arc(turret.x + Math.cos(angle) * 23, turret.y + Math.sin(angle) * 23, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (turret.ammo <= 0) {
      const progress = Math.min(1, turret.reloadTimer / turret.reloadTime);
      ctx.strokeStyle = '#f5b84b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(turret.x, turret.y, 21, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawEnemies(now) {
  for (const enemy of core.state.enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate((enemy.angle ?? 0) + Math.PI / 2);
    ctx.shadowColor = '#ff7468';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ff7468';
    ctx.beginPath();
    ctx.moveTo(0, -enemy.radius);
    ctx.lineTo(enemy.radius * .82, enemy.radius * .72);
    ctx.lineTo(-enemy.radius * .82, enemy.radius * .72);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    const ratio = enemy.hp / enemy.maxHp;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(enemy.x - 14, enemy.y - enemy.radius - 12, 28, 4);
    ctx.fillStyle = ratio > .5 ? '#f5b84b' : '#ff7468';
    ctx.fillRect(enemy.x - 14, enemy.y - enemy.radius - 12, 28 * ratio, 4);
  }
}

function updateEffects(dt) {
  flashes = flashes.filter((flash) => {
    flash.life -= dt;
    return flash.life > 0;
  });
  particles = particles.filter((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= .96;
    particle.vy *= .96;
    return particle.life > 0;
  });
  if (messageTimer > 0) messageTimer -= dt;
  if (shake > 0) shake -= dt;
}

function drawEffects() {
  for (const flash of flashes) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, flash.life / .22);
    ctx.strokeStyle = flash.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(flash.x1, flash.y1);
    ctx.lineTo(flash.x2, flash.y2);
    ctx.stroke();
    ctx.restore();
  }

  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life / .55);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawMessage() {
  if (messageTimer <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, messageTimer * 2);
  roundedRect(WIDTH / 2 - 120, 22, 240, 38, 12);
  ctx.fillStyle = 'rgba(4,20,27,.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,184,75,.45)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#e9f8f6';
  ctx.font = '700 13px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, WIDTH / 2, 42);
  ctx.restore();
}

function render(now) {
  const dt = Math.min(.05, (now - lastTime) / 1000);
  lastTime = now;
  updateEffects(dt);

  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - .5) * 8 * shake, (Math.random() - .5) * 8 * shake);
  ctx.clearRect(-20, -20, WIDTH + 40, HEIGHT + 40);
  drawBackground();
  drawPath();
  drawTurrets();
  drawEnemies(now);
  drawEffects();
  drawSpawnAndCore(now);
  drawMessage();
  ctx.restore();

  requestAnimationFrame(render);
}

function buildTurretList() {
  turretList.innerHTML = '';
  for (const turret of core.state.turrets) {
    const row = document.createElement('div');
    row.className = 'turret-row';
    row.dataset.id = turret.id;
    const dot = document.createElement('span');
    dot.className = 'turret-dot';
    const bar = document.createElement('div');
    bar.className = 'turret-bar';
    const fill = document.createElement('i');
    bar.append(fill);
    const label = document.createElement('b');
    label.textContent = `${turret.ammo}/${turret.ammoMax}`;
    row.append(dot, bar, label);
    turretList.append(row);
  }
}

function updateHud() {
  const state = core.state;
  coreHpLabel.textContent = String(state.coreHp);
  waveLabel.textContent = String(state.wave);
  scoreLabel.textContent = String(state.score);
  const inkRatio = Math.min(1, state.pathLength / MAX_PATH_LENGTH);
  inkBar.style.width = `${Math.round(inkRatio * 100)}%`;
  inkValue.textContent = `${Math.round(state.pathLength)} / ${MAX_PATH_LENGTH}`;
  redrawValue.textContent = state.redrawCooldown > 0 ? `${state.redrawCooldown.toFixed(1)} 秒` : '就绪';

  for (const turret of state.turrets) {
    const row = turretList.querySelector(`[data-id="${turret.id}"]`);
    if (!row) continue;
    const fill = row.querySelector('.turret-bar i');
    const label = row.querySelector('b');
    const ratio = turret.ammo / turret.ammoMax;
    fill.style.width = `${Math.round(ratio * 100)}%`;
    fill.style.background = turret.ammo > 0 ? 'var(--cyan)' : 'var(--amber)';
    label.textContent = turret.ammo > 0 ? `${turret.ammo}/${turret.ammoMax}` : `${turret.reloadTimer.toFixed(1)}s`;
  }
}

function showMessage(text, seconds = .9) {
  message = text;
  messageTimer = seconds;
}

function pointerPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width * WIDTH,
    y: (event.clientY - rect.top) / rect.height * HEIGHT
  };
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

function processEvents(events) {
  for (const event of events) {
    if (event.type === 'shot') {
      flashes.push({
        x1: event.fromX,
        y1: event.fromY,
        x2: event.toX,
        y2: event.toY,
        color: '#f5b84b',
        life: .22
      });
      tone(420, .045, 'square', .008);
    } else if (event.type === 'kill') {
      for (let index = 0; index < 7; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 45 + Math.random() * 80;
        particles.push({
          x: event.x,
          y: event.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 2.5,
          color: Math.random() > .5 ? '#f5b84b' : '#ff7468',
          life: .55
        });
      }
      tone(180, .07, 'triangle', .012);
    } else if (event.type === 'coreHit') {
      shake = .35;
      tone(95, .22, 'sawtooth', .03);
    } else if (event.type === 'waveClear') {
      showMessage(`第 ${event.wave} 波清空`, 1.1);
      tone(330, .12, 'sine', .018);
      tone(440, .14, 'sine', .014, .1);
    } else if (event.type === 'pathRejected') {
      showMessage('线太长了，墨水不够', 1.1);
    } else if (event.type === 'gameOver') {
      gameoverText.textContent = `第 ${event.wave} 波 · 分数 ${event.score}`;
      gameover.classList.remove('is-hidden');
      tone(120, .4, 'sawtooth', .03);
      tone(80, .5, 'sine', .025, .16);
    }
  }
}

function startGame() {
  core.reset();
  drawing = null;
  previewPoints = [];
  flashes = [];
  particles = [];
  message = '';
  messageTimer = 0;
  shake = 0;
  gameover.classList.add('is-hidden');
  buildTurretList();
  updateHud();
}

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  ensureAudio();
  if (core.state.gameOver) return;
  if (core.state.redrawCooldown > 0) {
    showMessage('重画冷却中');
    return;
  }
  const point = pointerPoint(event);
  drawing = { points: [{ x: point.x, y: point.y }], pointerId: event.pointerId };
  previewPoints = drawing.points;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!drawing) return;
  const point = pointerPoint(event);
  const clamped = {
    x: Math.max(8, Math.min(WIDTH - 8, point.x)),
    y: Math.max(8, Math.min(HEIGHT - 8, point.y))
  };
  const last = drawing.points[drawing.points.length - 1];
  if (Math.hypot(clamped.x - last.x, clamped.y - last.y) >= 9) drawing.points.push(clamped);
  previewPoints = drawing.points;
});

canvas.addEventListener('pointerup', (event) => {
  event.preventDefault();
  if (!drawing) return;
  const points = drawing.points;
  drawing = null;
  previewPoints = [];
  if (points.length < 2) return;
  if (!core.setPath(points)) {
    if (core.state.redrawCooldown <= 0 && messageTimer <= 0) showMessage('线太长了，墨水不够');
  } else {
    tone(520, .08, 'sine', .012);
  }
});

canvas.addEventListener('pointercancel', () => {
  drawing = null;
  previewPoints = [];
});

restartButton.addEventListener('click', startGame);
againButton.addEventListener('click', startGame);

if (DEBUG) {
  window.__route = {
    get core() { return core; },
    startGame,
    setPath: (points) => core.setPath(points)
  };
}

setupCanvas();
buildTurretList();
updateHud();
let lastUpdate = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - lastUpdate) / 1000);
  lastUpdate = now;
  processEvents(core.update(dt));
  updateHud();
  render(now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
