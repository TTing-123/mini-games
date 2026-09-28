import { BlastCore, CONFIG, WIDTH, HEIGHT } from './blast-core.js';

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const chainDisplay = document.querySelector('#chain-display');
const restartButton = document.querySelector('#restart');

const core = new BlastCore();
let lastTime = performance.now();
let shake = 0;
let muted = false;
let autoResetTimer = 0;
let chainToShow = 0;
let audioCtx = null;
let voicesThisFrame = 0;

/* ---------------- 音效：不引入任何素材，全部现场合成 ---------------- */

function ensureAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return;
  }
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (Ctor) audioCtx = new Ctor();
}

function playBlast(chain) {
  if (muted || !audioCtx || voicesThisFrame > 10) return;
  voicesThisFrame += 1;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  // 连锁越深音高越高，一串爆炸听起来像在往上爬。
  const base = 140 + Math.min(chain, 80) * 11;
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(60, base * 0.45), now + 0.13);
  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.15);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.17);
}

/* ---------------- 输入 ---------------- */

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * (WIDTH / rect.width), y: (event.clientY - rect.top) * (HEIGHT / rect.height) };
}

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  ensureAudio();
  const point = canvasPoint(event);
  const ball = core.ballAt(point.x, point.y);
  if (!ball) return;
  chainToShow = 0;
  core.ignite(ball.id);
});

restartButton.addEventListener('click', () => resetRun());
window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'r') resetRun();
  if (event.key.toLowerCase() === 'm') muted = !muted;
});

function resetRun() {
  core.reset();
  chainToShow = 0;
  autoResetTimer = 0;
  chainDisplay.textContent = '';
}

/* ---------------- 事件 ---------------- */

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'blast') {
      chainToShow = event.chain;
      shake = Math.min(16, shake + 1.6 + Math.min(event.chain, 40) * 0.16);
      playBlast(event.chain);
    }
    if (event.type === 'settled') {
      chainDisplay.textContent = `×${event.chain}`;
      autoResetTimer = 1.1;
    }
    if (event.type === 'reset') {
      chainDisplay.textContent = '';
    }
  }
}

/* ---------------- 渲染 ---------------- */

function drawBackground() {
  const gradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 60, WIDTH / 2, HEIGHT / 2, WIDTH * 0.7);
  gradient.addColorStop(0, '#082a34');
  gradient.addColorStop(1, '#020b10');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.strokeStyle = 'rgba(89,217,229,.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke(); }
  for (let y = 0; y <= HEIGHT; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
  ctx.restore();
}

function drawBalls(now) {
  for (const ball of core.state.balls) {
    if (ball.state === 'idle') {
      const breathe = 1 + Math.sin(now * 0.0018 + ball.phase) * 0.06;
      ctx.save();
      ctx.shadowColor = '#59d9e5';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(89,217,229,.18)';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius * 1.7 * breathe, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,240,255,.85)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    if (ball.heat <= 0) continue;
    // 刚炸开的球：白热 → 橙红 → 消散
    const heat = ball.heat;
    const radius = ball.radius * (1 + (1 - heat) * 2.4);
    ctx.save();
    ctx.globalAlpha = heat;
    ctx.shadowColor = heat > 0.6 ? '#fff6d8' : '#ff7a3c';
    ctx.shadowBlur = 34 * heat;
    ctx.fillStyle = heat > 0.6 ? 'rgba(255,250,235,.95)' : 'rgba(255,130,60,.85)';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawWaves() {
  for (const wave of core.state.waves) {
    const progress = 1 - wave.life / (CONFIG.blastRadius / CONFIG.waveSpeed);
    const alpha = Math.max(0, 1 - progress * 1.15);
    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = progress < 0.35 ? '#fff3d0' : '#ff9d4d';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 22;
    ctx.lineWidth = 4 * (1 - progress) + 1;
    ctx.beginPath();
    ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawParticles() {
  ctx.save();
  for (const particle of core.state.particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = alpha > 0.6 ? '#fff4d6' : '#ff9a4a';
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawChainCounter() {
  if (core.state.status !== 'chaining' || chainToShow <= 0) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#ffe9b0';
  ctx.shadowColor = '#ff9d4d';
  ctx.shadowBlur = 26;
  ctx.font = '700 62px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`×${chainToShow}`, WIDTH / 2, 132);
  ctx.restore();
}

function render(now) {
  ctx.save();
  if (shake > 0.2) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  drawBackground();
  drawWaves();
  drawParticles();
  drawBalls(now);
  ctx.restore();
  drawChainCounter();
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  voicesThisFrame = 0;

  core.update(dt);
  shake = Math.max(0, shake - dt * 34);

  if (autoResetTimer > 0) {
    autoResetTimer -= dt;
    if (autoResetTimer <= 0) resetRun();
  }

  handleEvents(core.consumeEvents());
  render(now);
  // 自动化检查用：?debug=1 时把 core 挂出来。
if (new URLSearchParams(location.search).has('debug')) window.__blast = core;

requestAnimationFrame(loop);
}

requestAnimationFrame(loop);