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
const endlessButton = document.querySelector('#endless-button');
const endlessSelector = document.querySelector('#endless-selector');
const endlessDepth = document.querySelector('#endless-depth');
const endlessDepthOutput = document.querySelector('#endless-depth-output');
const endlessStart = document.querySelector('#endless-start');

const core = new GameCore();
const pointer = { x: 640, y: 420 };
const effects = [];
const annotations = [];
let lastTime = performance.now();
let hudSnapshot = '';
let endlessDepthValue = 1;
const MISSION_TEXT = ['目标：摧毁红核 · 蓝块会反弹', '新机关：紫块会弯曲弹球轨迹', '新机关：黄块首次命中会分裂', '新机关：绿块首次命中补充发射'];
function canvasPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * (WIDTH / rect.width), y: (event.clientY - rect.top) * (HEIGHT / rect.height) }; }
function launchAtPointer() { core.launch({ x: pointer.x - 640, y: pointer.y - 620 }); }
function setLevel(levelId) { if (levelId === 5) { startEndless(endlessDepthValue); return; } core.loadStaticLevel(levelId - 1); gameOver.classList.add('is-hidden'); levelSelectPanel.classList.add('is-hidden'); updateHud(core.state); }
function clampDepth(value) { return Math.max(1, Math.min(99, Number(value) || 1)); }
function setEndlessDepth(value) { endlessDepthValue = clampDepth(value); endlessDepth.value = endlessDepthValue; endlessDepthOutput.textContent = String(endlessDepthValue); try { localStorage.setItem('pulse-endless-depth', String(endlessDepthValue)); } catch (_) {} }
function startEndless(depth) { setEndlessDepth(depth); core.loadEndlessLevel(endlessDepthValue); gameOver.classList.add('is-hidden'); levelSelectPanel.classList.add('is-hidden'); endlessSelector.classList.add('is-hidden'); updateHud(core.state); }
// 鼠标：移动即瞄准、按下即发射。触摸：按住拖动瞄准，抬手才发射，避免手指挡住瞄准线。
let touchAiming = false;
canvas.addEventListener('pointermove', (event) => { const point = canvasPoint(event); pointer.x = point.x; pointer.y = point.y; });
canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const point = canvasPoint(event);
  pointer.x = point.x;
  pointer.y = point.y;
  if (event.pointerType === 'touch') { touchAiming = true; try { canvas.setPointerCapture(event.pointerId); } catch (_) {} return; }
  launchAtPointer();
});
canvas.addEventListener('pointerup', (event) => {
  if (!touchAiming) return;
  touchAiming = false;
  const point = canvasPoint(event);
  pointer.x = point.x;
  pointer.y = point.y;
  launchAtPointer();
});
canvas.addEventListener('pointercancel', () => { touchAiming = false; });
window.addEventListener('keydown', (event) => { if (event.key >= '1' && event.key <= '4') setLevel(Number(event.key)); if (event.key === '0') setLevel(5); if (event.key.toLowerCase() === 'r') { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); } if (event.key === 'Escape') levelSelectPanel.classList.add('is-hidden'); });
levelSelectToggle.addEventListener('click', () => levelSelectPanel.classList.toggle('is-hidden'));
document.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => setLevel(Number(button.dataset.level))));
endlessButton.addEventListener('click', () => endlessSelector.classList.toggle('is-hidden'));
endlessDepth.addEventListener('input', () => setEndlessDepth(endlessDepth.value));
document.querySelectorAll('[data-depth]').forEach((button) => button.addEventListener('click', () => setEndlessDepth(Number(button.dataset.depth))));
endlessStart.addEventListener('click', () => startEndless(endlessDepthValue));
restartButton.addEventListener('click', () => { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); });
retryButton.addEventListener('click', () => { gameOver.classList.add('is-hidden'); core.loadStaticLevel(0); });
gameOverLevels.addEventListener('click', () => { gameOver.classList.add('is-hidden'); levelSelectPanel.classList.remove('is-hidden'); });
function showLevelMission() { const text = core.state.mode === 'endless' ? '无尽模式：随机关卡持续升级' : MISSION_TEXT[core.state.levelIndex]; levelMission.textContent = text; levelMission.classList.remove('is-visible'); void levelMission.offsetWidth; levelMission.classList.add('is-visible'); }
function addAnnotation(x, y, text, color) { annotations.push({ x, y, text, color, ttl: 8, max: 8 }); }
function addLevelAnnotations() { const state = core.state; if (!state || state.mode !== 'manual') return; if (state.levelIndex === 0) { if (state.entities.targets[0]) addAnnotation(state.entities.targets[0].x, state.entities.targets[0].y, '击破', '#d94841'); if (state.entities.bumpers[0]) addAnnotation(state.entities.bumpers[0].x, state.entities.bumpers[0].y, '反弹', '#2d7dd2'); } else if (state.levelIndex === 1 && state.entities.gravity[0]) addAnnotation(state.entities.gravity[0].x, state.entities.gravity[0].y, '引力 · 拉弯轨迹', '#7d4fc9'); else if (state.levelIndex === 2 && state.entities.splitters[0]) addAnnotation(state.entities.splitters[0].x, state.entities.splitters[0].y, '分裂 · 一球变两球', '#d8a11d'); else if (state.levelIndex === 3 && state.entities.chargers[0]) addAnnotation(state.entities.chargers[0].x, state.entities.chargers[0].y, '补给 · 多发一次', '#2fa65a'); }
function addEffect(type, x, y, color) { effects.push({ type, x, y, color, ttl: 0.45, max: 0.45 }); if (type === 'combo') { comboToast.classList.remove('is-visible'); void comboToast.offsetWidth; comboToast.classList.add('is-visible'); } }
function handleEvents(events) { for (const event of events) { if (event.type === 'target') addEffect('burst', event.x, event.y, '#d94841'); if (event.type === 'bounce' && event.source === 'bumper') addEffect('spark', event.x, event.y, '#2d7dd2'); if (event.type === 'split') addEffect('burst', event.x, event.y, '#d8a11d'); if (event.type === 'charge') addEffect('burst', event.x, event.y, '#2fa65a'); if (event.type === 'combo') addEffect('combo', event.x, event.y, '#d94841'); if (event.type === 'levelClear') addEffect('burst', WIDTH / 2, HEIGHT / 2, '#2d7dd2'); if (event.type === 'levelLoaded') { updateHud(core.state); gameOver.classList.add('is-hidden'); showLevelMission(); addLevelAnnotations(); } if (event.type === 'charge' || event.type === 'combo') updateHud(core.state); if (event.type === 'gameOver') showGameOver(event.won); if (event.type === 'launched' || event.type === 'aiming') updateHud(core.state); } }
function showGameOver(won) { gameOverTitle.textContent = won ? 'CHAIN COMPLETE' : 'CHAIN BROKEN'; gameOverCopy.textContent = won ? '所有目标已被清除。' : '发射次数耗尽。调整角度再试一次。'; gameOver.classList.remove('is-hidden'); }
function updateHud(state) { if (!state) return; const signature = `${state.label}|${state.targetsRemaining}|${state.shotsLeft}|${state.shotsMax}`; if (signature === hudSnapshot) return; hudSnapshot = signature; levelBadge.textContent = state.label; targetCount.textContent = `${state.targetsRemaining}`; shotCount.textContent = `${state.shotsLeft}`; targetPips.innerHTML = ''; shotPips.innerHTML = ''; for (let i = 0; i < state.targetsTotal; i += 1) { const pip = document.createElement('span'); pip.className = `pip target-pip ${i < state.targetsRemaining ? 'is-active' : ''}`; targetPips.append(pip); } for (let i = 0; i < state.shotsMax; i += 1) { const pip = document.createElement('span'); pip.className = `pip shot-pip ${i < state.shotsLeft ? 'is-active' : ''}`; shotPips.append(pip); } }
function drawBoard() {
  const gradient = ctx.createRadialGradient(640, 280, 40, 640, 360, 780);
  gradient.addColorStop(0, '#0b3b48'); gradient.addColorStop(.52, '#06232d'); gradient.addColorStop(1, '#020b10');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = 'rgba(89,217,229,.09)'; ctx.lineWidth = 1;
  for (let x = 40; x < WIDTH; x += 40) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, HEIGHT - 20); ctx.stroke(); }
  for (let y = 40; y < HEIGHT; y += 40) { ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(WIDTH - 20, y); ctx.stroke(); }
  ctx.save(); ctx.shadowColor = '#59d9e5'; ctx.shadowBlur = 18; ctx.strokeStyle = 'rgba(89,217,229,.72)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(20, 20, WIDTH - 40, HEIGHT - 40, 48); ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(120,230,240,.22)';
  for (let i = 0; i < 55; i += 1) { const x = (i * 97) % (WIDTH - 80) + 40; const y = (i * 53) % (HEIGHT - 80) + 40; ctx.beginPath(); ctx.arc(x, y, i % 3 + 1, 0, Math.PI * 2); ctx.fill(); }
}
function drawTargets() { for (const target of core.state.entities.targets) { if (!target.active) continue; const pulse = 1 + Math.sin(performance.now() * .004 + target.id) * .05; ctx.save(); ctx.shadowColor = '#f15a4c'; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(241,90,76,.28)'; ctx.strokeStyle = '#ff8b78'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * pulse, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#f15a4c'; ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * .42, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
function drawBumpers() { for (const bumper of core.state.entities.bumpers) { ctx.save(); ctx.shadowColor = '#4aa8ea'; ctx.shadowBlur = 20; ctx.strokeStyle = '#65d5ff'; ctx.fillStyle = 'rgba(74,168,234,.2)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(160,240,255,.65)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bumper.x, bumper.y, bumper.radius - 8, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); } }
function drawGravityWells() { for (const well of core.state.entities.gravity) { const pulse = 1 + Math.sin(performance.now() * .003) * .04; ctx.save(); ctx.shadowColor = '#9a62e8'; ctx.shadowBlur = 24; const grad = ctx.createRadialGradient(well.x, well.y, 10, well.x, well.y, well.radius); grad.addColorStop(0, 'rgba(160,95,245,.24)'); grad.addColorStop(1, 'rgba(120,60,210,0)'); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(well.x, well.y, well.radius * pulse, 0, Math.PI * 2); ctx.fill(); ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(180,110,255,.62)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(well.x, well.y, well.radius * pulse, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#a66bff'; ctx.beginPath(); ctx.arc(well.x, well.y, 16, 0, Math.PI * 2); ctx.fill(); ctx.restore(); for (const ball of core.state.balls) { if (Math.hypot(ball.x - well.x, ball.y - well.y) < well.radius) { ctx.strokeStyle = 'rgba(190,130,255,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(well.x, well.y); ctx.lineTo(ball.x, ball.y); ctx.stroke(); } } } }
function drawSplitters() { for (const splitter of core.state.entities.splitters) { if (splitter.used) continue; ctx.save(); ctx.shadowColor = '#f0bd36'; ctx.shadowBlur = 20; ctx.translate(splitter.x, splitter.y); ctx.rotate(Math.PI / 4); ctx.fillStyle = 'rgba(240,189,54,.28)'; ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 4; ctx.fillRect(-25, -25, 50, 50); ctx.strokeRect(-25, -25, 50, 50); ctx.restore(); ctx.strokeStyle = '#fff0ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(splitter.x - 17, splitter.y); ctx.lineTo(splitter.x - 6, splitter.y); ctx.moveTo(splitter.x + 6, splitter.y); ctx.lineTo(splitter.x + 17, splitter.y); ctx.stroke(); } }
function drawChargers() { for (const charger of core.state.entities.chargers) { if (charger.used) continue; ctx.save(); ctx.shadowColor = '#4ed579'; ctx.shadowBlur = 22; ctx.strokeStyle = '#75f29a'; ctx.fillStyle = 'rgba(78,213,121,.24)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(charger.x, charger.y, charger.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#9dffbc'; ctx.fillRect(charger.x - 4, charger.y - 15, 8, 30); ctx.fillRect(charger.x - 15, charger.y - 4, 30, 8); ctx.restore(); } }
function drawAim() { if (!core.state || core.state.status !== 'aiming') return; const length = Math.hypot(pointer.x - 640, pointer.y - 620); if (length < 12) return; ctx.save(); ctx.setLineDash([12, 9]); ctx.strokeStyle = 'rgba(100,231,255,.8)'; ctx.shadowColor = '#64e7ff'; ctx.shadowBlur = 10; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(640, 620); ctx.lineTo(pointer.x, pointer.y); ctx.stroke(); ctx.restore(); }
function drawBalls() { for (const ball of core.state.balls) { if (ball.trail.length > 1) { ctx.strokeStyle = 'rgba(100,231,255,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ball.trail[0].x, ball.trail[0].y); for (const point of ball.trail) ctx.lineTo(point.x, point.y); ctx.stroke(); } ctx.save(); ctx.shadowColor = '#d9fbff'; ctx.shadowBlur = 22; ctx.fillStyle = '#f2fdff'; ctx.strokeStyle = '#64e7ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); } }
function drawEffects() { for (const effect of effects) { const progress = 1 - effect.ttl / effect.max; const size = effect.type === 'burst' ? 16 + progress * 48 : 8 + progress * 18; ctx.save(); ctx.globalAlpha = 1 - progress; ctx.shadowColor = effect.color; ctx.shadowBlur = 15; ctx.strokeStyle = effect.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); } }
function drawAnnotations() { for (const note of annotations) { const alpha = Math.min(1, note.ttl / 1.5); const toRight = note.x < WIDTH * .66; const anchorX = note.x + (toRight ? 30 : -30); const boxX = note.x + (toRight ? 36 : -190); const boxY = note.y - 50; ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = note.color; ctx.shadowColor = note.color; ctx.shadowBlur = 10; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(note.x, note.y); ctx.lineTo(anchorX, boxY + 24); ctx.stroke(); ctx.fillStyle = 'rgba(5,28,37,.94)'; ctx.strokeStyle = note.color; ctx.beginPath(); ctx.roundRect(boxX, boxY, 154, 34, 12); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#eaffff'; ctx.font = '800 14px "Trebuchet MS", sans-serif'; ctx.fillText(note.text, boxX + 12, boxY + 22); ctx.restore(); } }
function render() { ctx.clearRect(0, 0, WIDTH, HEIGHT); drawBoard(); drawGravityWells(); drawBumpers(); drawTargets(); drawSplitters(); drawChargers(); drawAim(); drawBalls(); drawEffects(); drawAnnotations(); }
function loop(now) { const dt = Math.min((now - lastTime) / 1000, .033); lastTime = now; core.update(dt); for (let i = effects.length - 1; i >= 0; i -= 1) { effects[i].ttl -= dt; if (effects[i].ttl <= 0) effects.splice(i, 1); } for (let i = annotations.length - 1; i >= 0; i -= 1) { annotations[i].ttl -= dt; if (annotations[i].ttl <= 0) annotations.splice(i, 1); } handleEvents(core.consumeEvents()); render(); const params = new URLSearchParams(location.search);
if (params.has('levels')) { levelSelectPanel.classList.remove('is-hidden'); if (params.has('endless')) endlessSelector.classList.remove('is-hidden'); }
try { const savedDepth = localStorage.getItem('pulse-endless-depth'); if (savedDepth) setEndlessDepth(savedDepth); } catch (_) {}
requestAnimationFrame(loop); }
updateHud(core.state); showLevelMission(); addLevelAnnotations(); const params = new URLSearchParams(location.search);
if (params.has('levels')) { levelSelectPanel.classList.remove('is-hidden'); if (params.has('endless')) endlessSelector.classList.remove('is-hidden'); }
try { const savedDepth = localStorage.getItem('pulse-endless-depth'); if (savedDepth) setEndlessDepth(savedDepth); } catch (_) {}
requestAnimationFrame(loop);