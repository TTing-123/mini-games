import { GameCore, WIDTH, HEIGHT } from './game-core.js';

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const targetPips = document.querySelector('#target-pips');
const shotPips = document.querySelector('#shot-pips');
const targetCount = document.querySelector('#target-count');
const shotCount = document.querySelector('#shot-count');
const levelBadge = document.querySelector('#level-badge');
const levelMission = document.querySelector('#level-mission');
const comboToast = document.querySelector('#combo-toast');
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
const annotations = [];
let lastTime = performance.now();
let hudSnapshot = '';
const MISSION_TEXT = ['目标：摧毁红核 · 蓝块会反弹', '新机关：紫块会弯曲弹球轨迹', '新机关：黄块首次命中会分裂', '新机关：绿块首次命中补充发射'];
function canvasPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * (WIDTH / rect.width), y: (event.clientY - rect.top) * (HEIGHT / rect.height) }; }
function launchAtPointer() { core.launch({ x: pointer.x - 640, y: pointer.y - 620 }); }
function setLevel(levelId) { if (levelId === 5) core.loadEndlessLevel(1); else core.loadStaticLevel(levelId - 1); gameOver.classList.add('is-hidden'); levelSelectPanel.classList.add('is-hidden'); updateHud(core.state); }
canvas.addEventListener('pointermove', (event) => { const point = canvasPoint(event); pointer.x = point.x; pointer.y = point.y; });
canvas.addEventListener('pointerdown', (event) => { if (event.button !== 0) return; const point = canvasPoint(event); pointer.x = point.x; pointer.y = point.y; launchAtPointer(); });
window.addEventListener('keydown', (event) => { if (event.key >= '1' && event.key <= '4') setLevel(Number(event.key)); if (event.key === '0') setLevel(5); if (event.key.toLowerCase() === 'r') { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); } if (event.key === 'Escape') levelSelectPanel.classList.add('is-hidden'); });
levelSelectToggle.addEventListener('click', () => levelSelectPanel.classList.toggle('is-hidden'));
document.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => setLevel(Number(button.dataset.level))));
restartButton.addEventListener('click', () => { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); });
retryButton.addEventListener('click', () => { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); });
gameOverLevels.addEventListener('click', () => { gameOver.classList.add('is-hidden'); levelSelectPanel.classList.remove('is-hidden'); });
function showLevelMission() { const text = core.state.mode === 'endless' ? '无尽模式：随机关卡持续升级' : MISSION_TEXT[core.state.levelIndex]; levelMission.textContent = text; levelMission.classList.remove('is-visible'); void levelMission.offsetWidth; levelMission.classList.add('is-visible'); }
function addAnnotation(x, y, text, color) { annotations.push({ x, y, text, color, ttl: 8, max: 8 }); }
function addLevelAnnotations() { const state = core.state; if (!state || state.mode !== 'manual') return; if (state.levelIndex === 0) { if (state.entities.targets[0]) addAnnotation(state.entities.targets[0].x, state.entities.targets[0].y, 'TARGET', '#d94841'); if (state.entities.bumpers[0]) addAnnotation(state.entities.bumpers[0].x, state.entities.bumpers[0].y, 'BOUNCE', '#2d7dd2'); } else if (state.levelIndex === 1 && state.entities.gravity[0]) addAnnotation(state.entities.gravity[0].x, state.entities.gravity[0].y, 'PULL', '#7d4fc9'); else if (state.levelIndex === 2 && state.entities.splitters[0]) addAnnotation(state.entities.splitters[0].x, state.entities.splitters[0].y, 'SPLIT', '#d8a11d'); else if (state.levelIndex === 3 && state.entities.chargers[0]) addAnnotation(state.entities.chargers[0].x, state.entities.chargers[0].y, '+1 SHOT', '#2fa65a'); }
function addEffect(type, x, y, color) { effects.push({ type, x, y, color, ttl: 0.45, max: 0.45 }); if (type === 'combo') { comboToast.classList.remove('is-visible'); void comboToast.offsetWidth; comboToast.classList.add('is-visible'); } }
function handleEvents(events) { for (const event of events) { if (event.type === 'target') addEffect('burst', event.x, event.y, '#d94841'); if (event.type === 'bounce' && event.source === 'bumper') addEffect('spark', event.x, event.y, '#2d7dd2'); if (event.type === 'split') addEffect('burst', event.x, event.y, '#d8a11d'); if (event.type === 'charge') addEffect('burst', event.x, event.y, '#2fa65a'); if (event.type === 'combo') addEffect('combo', event.x, event.y, '#d94841'); if (event.type === 'levelClear') addEffect('burst', WIDTH / 2, HEIGHT / 2, '#2d7dd2'); if (event.type === 'levelLoaded') { updateHud(core.state); gameOver.classList.add('is-hidden'); showLevelMission(); addLevelAnnotations(); } if (event.type === 'charge' || event.type === 'combo') updateHud(core.state); if (event.type === 'gameOver') showGameOver(event.won); if (event.type === 'launched' || event.type === 'aiming') updateHud(core.state); } }
function showGameOver(won) { gameOverTitle.textContent = won ? 'CHAIN COMPLETE' : 'CHAIN BROKEN'; gameOverCopy.textContent = won ? '所有目标已被清除。' : '发射次数耗尽。调整角度再试一次。'; gameOver.classList.remove('is-hidden'); }
function updateHud(state) { if (!state) return; const signature = `${state.label}|${state.targetsRemaining}|${state.shotsLeft}|${state.shotsMax}`; if (signature === hudSnapshot) return; hudSnapshot = signature; levelBadge.textContent = state.label; targetCount.textContent = `${state.targetsRemaining}`; shotCount.textContent = `${state.shotsLeft}`; targetPips.innerHTML = ''; shotPips.innerHTML = ''; for (let i = 0; i < state.targetsTotal; i += 1) { const pip = document.createElement('span'); pip.className = `pip target-pip ${i < state.targetsRemaining ? 'is-active' : ''}`; targetPips.append(pip); } for (let i = 0; i < state.shotsMax; i += 1) { const pip = document.createElement('span'); pip.className = `pip shot-pip ${i < state.shotsLeft ? 'is-active' : ''}`; shotPips.append(pip); } }
function drawBoard() {
  ctx.fillStyle = '#eee9de'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = 'rgba(34, 82, 118, 0.14)'; ctx.lineWidth = 1;
  for (let x = 40; x < WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, HEIGHT - 20); ctx.stroke(); }
  for (let y = 40; y < HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(WIDTH - 20, y); ctx.stroke(); }
  ctx.strokeStyle = '#17212b'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);
  ctx.fillStyle = '#42576a'; ctx.font = '700 11px "Courier New", monospace';
  ctx.fillText('X:000', 28, 42); ctx.fillText(`X:${WIDTH - 40}`, WIDTH - 96, 42); ctx.fillText(`Y:${HEIGHT - 40}`, 28, HEIGHT - 30);
}
function drawTargets() { for (const target of core.state.entities.targets) { if (!target.active) continue; ctx.strokeStyle = '#d94841'; ctx.fillStyle = 'rgba(217,72,65,.16)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * .42, 0, Math.PI * 2); ctx.fillStyle = '#d94841'; ctx.fill(); } }
function drawBumpers() { for (const bumper of core.state.entities.bumpers) { ctx.strokeStyle = '#17212b'; ctx.fillStyle = 'rgba(45,125,210,.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#2d7dd2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bumper.x, bumper.y, bumper.radius - 7, 0, Math.PI * 2); ctx.stroke(); } }
function drawGravityWells() { for (const well of core.state.entities.gravity) { ctx.strokeStyle = '#7d4fc9'; ctx.fillStyle = 'rgba(125,79,201,.1)'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#7d4fc9'; ctx.beginPath(); ctx.arc(well.x, well.y, 16, 0, Math.PI * 2); ctx.fill(); for (const ball of core.state.balls) { if (Math.hypot(ball.x - well.x, ball.y - well.y) < well.radius) { ctx.strokeStyle = 'rgba(125,79,201,.35)'; ctx.beginPath(); ctx.moveTo(well.x, well.y); ctx.lineTo(ball.x, ball.y); ctx.stroke(); } } } }
function drawSplitters() { for (const splitter of core.state.entities.splitters) { if (splitter.used) continue; ctx.save(); ctx.translate(splitter.x, splitter.y); ctx.rotate(Math.PI / 4); ctx.strokeStyle = '#17212b'; ctx.fillStyle = 'rgba(216,161,29,.24)'; ctx.lineWidth = 3; ctx.fillRect(-24, -24, 48, 48); ctx.strokeRect(-24, -24, 48, 48); ctx.restore(); ctx.strokeStyle = '#d8a11d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(splitter.x - 18, splitter.y); ctx.lineTo(splitter.x - 6, splitter.y); ctx.moveTo(splitter.x + 6, splitter.y); ctx.lineTo(splitter.x + 18, splitter.y); ctx.stroke(); } }
function drawChargers() { for (const charger of core.state.entities.chargers) { if (charger.used) continue; ctx.strokeStyle = '#17212b'; ctx.fillStyle = 'rgba(47,166,90,.18)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(charger.x, charger.y, charger.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2fa65a'; ctx.fillRect(charger.x - 4, charger.y - 15, 8, 30); ctx.fillRect(charger.x - 15, charger.y - 4, 30, 8); } }
function drawAim() { if (!core.state || core.state.status !== 'aiming') return; const length = Math.hypot(pointer.x - 640, pointer.y - 620); if (length < 12) return; ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = '#17212b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(640, 620); ctx.lineTo(pointer.x, pointer.y); ctx.stroke(); ctx.restore(); }
function drawBalls() { for (const ball of core.state.balls) { if (ball.trail.length > 1) { ctx.strokeStyle = 'rgba(45,125,210,.28)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ball.trail[0].x, ball.trail[0].y); for (const point of ball.trail) ctx.lineTo(point.x, point.y); ctx.stroke(); } ctx.fillStyle = '#f8f4ea'; ctx.strokeStyle = '#17212b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
function drawEffects() { for (const effect of effects) { const progress = 1 - effect.ttl / effect.max; const size = effect.type === 'burst' ? 16 + progress * 48 : 8 + progress * 18; ctx.save(); ctx.globalAlpha = 1 - progress; ctx.strokeStyle = effect.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); } }
function drawAnnotations() { for (const note of annotations) { const alpha = Math.min(1, note.ttl / 1.5); ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = note.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(note.x, note.y); ctx.lineTo(note.x + 28, note.y - 28); ctx.stroke(); ctx.fillStyle = '#f8f4ea'; ctx.strokeStyle = '#17212b'; ctx.lineWidth = 2; const textWidth = ctx.measureText(note.text).width + 18; const boxWidth = Math.max(62, textWidth); ctx.fillRect(note.x + 28, note.y - 48, boxWidth, 26); ctx.strokeRect(note.x + 28, note.y - 48, boxWidth, 26); ctx.fillStyle = note.color; ctx.font = '800 12px "Courier New", monospace'; ctx.fillText(note.text, note.x + 38, note.y - 30); ctx.restore(); } }
function render() { ctx.clearRect(0, 0, WIDTH, HEIGHT); drawBoard(); drawGravityWells(); drawBumpers(); drawTargets(); drawSplitters(); drawChargers(); drawAim(); drawBalls(); drawEffects(); drawAnnotations(); }
function loop(now) { const dt = Math.min((now - lastTime) / 1000, 0.033); lastTime = now; core.update(dt); for (let i = effects.length - 1; i >= 0; i -= 1) { effects[i].ttl -= dt; if (effects[i].ttl <= 0) effects.splice(i, 1); } for (let i = annotations.length - 1; i >= 0; i -= 1) { annotations[i].ttl -= dt; if (annotations[i].ttl <= 0) annotations.splice(i, 1); } handleEvents(core.consumeEvents()); render(); requestAnimationFrame(loop); }
updateHud(core.state); showLevelMission(); addLevelAnnotations(); requestAnimationFrame(loop);