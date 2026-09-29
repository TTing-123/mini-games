import {
  AMBER,
  CYAN,
  EMPTY,
  SIZE,
  applyMove,
  chooseAiMove,
  createInitialState,
  inBounds,
  index,
  isLegalMove,
  legalMoves
} from './surge-core.js';

const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const turnChip = document.querySelector('#turn-chip');
const turnLabel = document.querySelector('#turn-label');
const restartButton = document.querySelector('#restart');
const plyLabel = document.querySelector('#ply');
const stateLabel = document.querySelector('#state-label');
const hint = document.querySelector('#hint');
const result = document.querySelector('#result');
const resultKicker = document.querySelector('#result-kicker');
const resultTitle = document.querySelector('#result-title');
const resultText = document.querySelector('#result-text');
const againButton = document.querySelector('#again');
const guideButton = document.querySelector('#guide-button');
const guide = document.querySelector('#guide');
const guideStart = document.querySelector('#guide-start');
const guideClose = document.querySelector('#guide-close');

const VIEW = 700;
const MARGIN = 22;
const GAP = 8;
const CELL = (VIEW - MARGIN * 2 - GAP * (SIZE - 1)) / SIZE;
const DRAG_THRESHOLD = 17;
const DEBUG = new URLSearchParams(location.search).has('debug');
const GUIDE_KEY = 'surge-guide-v2';

let state = createInitialState();
let drag = null;
let hover = null;
let flash = null;
let aiThinking = false;
let aiTimer = null;
let audioContext = null;
let forcedTutorial = false;
let tutorialCoach = false;

function setupCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = VIEW * dpr;
  canvas.height = VIEW * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function cellRect(row, col) {
  return {
    x: MARGIN + col * (CELL + GAP),
    y: MARGIN + row * (CELL + GAP),
    w: CELL,
    h: CELL
  };
}

function cellCenter(row, col) {
  const rect = cellRect(row, col);
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function pointToCell(point) {
  const col = Math.floor((point.x - MARGIN) / (CELL + GAP));
  const row = Math.floor((point.y - MARGIN) / (CELL + GAP));
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return null;
  const rect = cellRect(row, col);
  const inside = point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  return inside ? { r: row, c: col } : null;
}

function pointerPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width * VIEW,
    y: (event.clientY - rect.top) / rect.height * VIEW
  };
}

function drawRoundedFill(x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
  roundedRect(ctx, x, y, width, height, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawBackdrop() {
  const gradient = ctx.createLinearGradient(0, 0, VIEW, VIEW);
  gradient.addColorStop(0, '#102d38');
  gradient.addColorStop(.48, '#0a1d27');
  gradient.addColorStop(1, '#071219');
  drawRoundedFill(0, 0, VIEW, VIEW, 30, gradient);

  ctx.save();
  roundedRect(ctx, 1, 1, VIEW - 2, VIEW - 2, 30);
  ctx.clip();
  ctx.globalAlpha = .22;
  ctx.strokeStyle = '#7de4e1';
  ctx.lineWidth = 1;
  for (let i = -VIEW; i < VIEW * 2; i += 34) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + VIEW, VIEW);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEdges() {
  ctx.save();
  const top = ctx.createLinearGradient(0, 0, VIEW, 0);
  top.addColorStop(0, 'rgba(77,226,213,.08)');
  top.addColorStop(.5, 'rgba(77,226,213,.72)');
  top.addColorStop(1, 'rgba(77,226,213,.08)');
  ctx.fillStyle = top;
  ctx.fillRect(22, 8, VIEW - 44, 5);
  ctx.fillRect(22, VIEW - 13, VIEW - 44, 5);

  const side = ctx.createLinearGradient(0, 0, 0, VIEW);
  side.addColorStop(0, 'rgba(245,184,75,.08)');
  side.addColorStop(.5, 'rgba(245,184,75,.72)');
  side.addColorStop(1, 'rgba(245,184,75,.08)');
  ctx.fillStyle = side;
  ctx.fillRect(8, 22, 5, VIEW - 44);
  ctx.fillRect(VIEW - 13, 22, 5, VIEW - 44);
  ctx.restore();
}

function drawCells() {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const rect = cellRect(row, col);
      const isHover = hover && hover.r === row && hover.c === col && !drag;
      const fill = isHover ? 'rgba(139, 239, 229, .09)' : 'rgba(217, 255, 252, .028)';
      const stroke = isHover ? 'rgba(139, 239, 229, .42)' : 'rgba(132, 216, 221, .14)';
      drawRoundedFill(rect.x, rect.y, rect.w, rect.h, 16, fill, stroke, isHover ? 1.5 : 1);
    }
  }
}

function drawConnections() {
  ctx.save();
  ctx.lineCap = 'round';
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const player = state.board[index(row, col)];
      if (player === EMPTY) continue;
      const from = cellCenter(row, col);
      const candidates = [];
      if (col + 1 < SIZE && state.board[index(row, col + 1)] === player) candidates.push([row, col + 1]);
      if (row + 1 < SIZE && state.board[index(row + 1, col)] === player) candidates.push([row + 1, col]);
      ctx.strokeStyle = player === CYAN ? 'rgba(77, 226, 213, .28)' : 'rgba(245, 184, 75, .3)';
      ctx.lineWidth = 8;
      for (const [nextRow, nextCol] of candidates) {
        const to = cellCenter(nextRow, nextCol);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawPreview() {
  if (!drag) return;
  const rect = cellRect(drag.r, drag.c);
  drawRoundedFill(rect.x, rect.y, rect.w, rect.h, 16, 'rgba(77, 226, 213, .14)', 'rgba(77, 226, 213, .7)', 2);

  if (drag.dr === null || drag.dc === null) return;

  if (drag.dr === 0) {
    for (let col = 0; col < SIZE; col += 1) {
      const lineRect = cellRect(drag.r, col);
      drawRoundedFill(lineRect.x, lineRect.y, lineRect.w, lineRect.h, 16, 'rgba(77, 226, 213, .12)', 'rgba(77, 226, 213, .2)', 1);
    }
  } else {
    for (let row = 0; row < SIZE; row += 1) {
      const lineRect = cellRect(row, drag.c);
      drawRoundedFill(lineRect.x, lineRect.y, lineRect.w, lineRect.h, 16, 'rgba(77, 226, 213, .12)', 'rgba(77, 226, 213, .2)', 1);
    }
  }

  const targetRow = drag.r + drag.dr;
  const targetCol = drag.c + drag.dc;
  if (!inBounds(targetRow, targetCol)) {
    drawArrow(drag, 'rgba(255, 119, 104, .9)');
    return;
  }
  const target = cellCenter(targetRow, targetCol);
  if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) return;
  ctx.save();
  ctx.globalAlpha = .62;
  drawStone(target.x, target.y, CYAN, .7, .9);
  ctx.restore();
  drawArrow(drag, 'rgba(77, 226, 213, .95)');
}

function drawArrow(move, color) {
  let x1;
  let y1;
  let x2;
  let y2;
  if (move.dr === 0) {
    const y = cellCenter(move.r, 0).y;
    x1 = move.dc > 0 ? 40 : VIEW - 40;
    x2 = move.dc > 0 ? VIEW - 40 : 40;
    y1 = y;
    y2 = y;
  } else {
    const x = cellCenter(0, move.c).x;
    x1 = x;
    x2 = x;
    y1 = move.dr > 0 ? 40 : VIEW - 40;
    y2 = move.dr > 0 ? VIEW - 40 : 40;
  }

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 15;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(angle - Math.PI / 6) * size, y2 - Math.sin(angle - Math.PI / 6) * size);
  ctx.lineTo(x2 - Math.cos(angle + Math.PI / 6) * size, y2 - Math.sin(angle + Math.PI / 6) * size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStone(x, y, player, alpha = 1, scale = 1) {
  const color = player === CYAN ? '#4de2d5' : '#f5b84b';
  const dark = player === CYAN ? '#1a8d8b' : '#a76516';
  const light = player === CYAN ? '#eafffc' : '#fff0c9';
  const radius = CELL * .32 * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  const gradient = ctx.createRadialGradient(x - radius * .3, y - radius * .35, radius * .1, x, y, radius);
  gradient.addColorStop(0, light);
  gradient.addColorStop(.42, color);
  gradient.addColorStop(1, dark);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.36)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawStones(now) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const player = state.board[index(row, col)];
      if (player === EMPTY) continue;
      const point = cellCenter(row, col);
      drawStone(point.x, point.y, player);
    }
  }

  if (!flash || !flash.last) return;
  const elapsed = now - flash.start;
  const fade = Math.max(0, 1 - elapsed / 760);
  if (fade <= 0) return;
  const last = flash.last;
  const point = cellCenter(last.toR, last.toC);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.strokeStyle = last.player === CYAN ? '#4de2d5' : '#f5b84b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(point.x, point.y, CELL * (.38 + (1 - fade) * .18), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawLastLine(now) {
  if (!flash || !flash.last) return;
  const elapsed = now - flash.start;
  const fade = Math.max(0, 1 - elapsed / 620);
  if (fade <= 0) return;
  const last = flash.last;
  const color = last.player === CYAN ? 'rgba(77,226,213,' : 'rgba(245,184,75,';
  ctx.save();
  ctx.globalAlpha = fade * .72;
  ctx.strokeStyle = color + '.78)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (last.dr === 0) {
    const y = cellCenter(last.r, 0).y;
    const x1 = cellCenter(last.r, 0).x;
    const x2 = cellCenter(last.r, SIZE - 1).x;
    ctx.moveTo(Math.min(x1, x2), y);
    ctx.lineTo(Math.max(x1, x2), y);
  } else {
    const x = cellCenter(0, last.c).x;
    const y1 = cellCenter(0, last.c).y;
    const y2 = cellCenter(SIZE - 1, last.c).y;
    ctx.moveTo(x, Math.min(y1, y2));
    ctx.lineTo(x, Math.max(y1, y2));
  }
  ctx.stroke();
  ctx.restore();
}

function drawTutorial(now) {
  if (!forcedTutorial || state.ply > 0 || state.turn !== CYAN) return;
  const from = cellCenter(3, 3);
  const to = cellCenter(3, 4);
  const pulse = .5 + .5 * Math.sin(now / 240);

  ctx.save();
  ctx.strokeStyle = `rgba(77, 226, 213, ${.55 + pulse * .4})`;
  ctx.lineWidth = 3 + pulse * 2;
  ctx.beginPath();
  ctx.arc(from.x, from.y, CELL * .43 + pulse * 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(77, 226, 213, .95)';
  ctx.fillStyle = 'rgba(77, 226, 213, .95)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x + CELL * .28, from.y);
  ctx.lineTo(to.x - CELL * .18, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x - CELL * .18, to.y);
  ctx.lineTo(to.x - CELL * .3, to.y - CELL * .12);
  ctx.lineTo(to.x - CELL * .3, to.y + CELL * .12);
  ctx.closePath();
  ctx.fill();

  drawRoundedFill(from.x - 108, from.y - 77, 216, 36, 10, 'rgba(4, 20, 27, .9)', 'rgba(77, 226, 213, .5)', 1);
  ctx.fillStyle = '#dff8f7';
  ctx.font = '700 14px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('按住闪烁格，向右拖', from.x, from.y - 59);
  ctx.restore();
}

function render(now = performance.now()) {
  ctx.clearRect(0, 0, VIEW, VIEW);
  drawBackdrop();
  drawEdges();
  drawCells();
  drawConnections();
  drawPreview();
  drawLastLine(now);
  drawStones(now);
  drawTutorial(now);
  requestAnimationFrame(render);
}

function updateUi() {
  const isAiTurn = state.turn === AMBER && !state.winner;
  turnChip.classList.toggle('is-ai', isAiTurn);
  turnLabel.textContent = state.winner ? '对局结束' : isAiTurn ? 'AI 推潮中' : '你的回合';
  plyLabel.textContent = String(state.ply);
  stateLabel.textContent = state.winner ? (state.winner === CYAN ? '你赢了' : 'AI 赢了') : isAiTurn ? 'AI 行动' : '你先';
  if (forcedTutorial) {
    hint.textContent = '先按住闪烁格，再向右拖。';
  } else if (tutorialCoach) {
    hint.textContent = '你刚才同时完成了落子和推线。再找一格，自己试一次。';
  } else if (state.winner) {
    hint.textContent = state.winner === CYAN ? '青线接通上下。再来一局？' : '琥珀线接通左右。再试一次。';
  } else if (isAiTurn) {
    hint.textContent = 'AI 正在找最稳的一推…';
  } else if (state.ply === 0) {
    hint.textContent = '按住空格，向一个方向拖一格。整条线会一起移动。';
  } else {
    hint.textContent = '继续：落子后，整行或整列一起移动。推到边缘外的棋子会消失。';
  }
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

function tone(frequency, duration, type = 'sine', gain = .025, delay = 0) {
  const audio = ensureAudio();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const volume = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + .015);
  volume.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(volume).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function playMoveSound() {
  tone(170, .12, 'triangle', .025);
  tone(250, .1, 'sine', .012, .03);
}

function playWinSound(player) {
  const base = player === CYAN ? 330 : 247;
  tone(base, .16, 'sine', .03);
  tone(base * 1.25, .16, 'sine', .025, .12);
  tone(base * 1.5, .24, 'sine', .025, .24);
}

function clearAiTimer() {
  if (aiTimer) {
    clearTimeout(aiTimer);
    aiTimer = null;
  }
  aiThinking = false;
}

function markGuideSeen() {
  try {
    localStorage.setItem(GUIDE_KEY, '1');
  } catch (_) {
    /* 隐私模式写不了就算了 */
  }
}

function hasSeenGuide() {
  try {
    return localStorage.getItem(GUIDE_KEY) === '1';
  } catch (_) {
    return true;
  }
}

function openGuide() {
  guide.classList.remove('is-hidden');
}

function closeGuide() {
  markGuideSeen();
  forcedTutorial = false;
  tutorialCoach = false;
  guide.classList.add('is-hidden');
  updateUi();
}

function startGuideGame() {
  startNewGame();
  markGuideSeen();
  forcedTutorial = true;
  tutorialCoach = false;
  guide.classList.add('is-hidden');
  updateUi();
}

function maybeOpenGuide() {
  if (!hasSeenGuide()) openGuide();
}

function startNewGame() {
  clearAiTimer();
  state = createInitialState();
  drag = null;
  hover = null;
  flash = null;
  forcedTutorial = false;
  tutorialCoach = false;
  result.classList.add('is-hidden');
  updateUi();
}

function showResult() {
  const playerWon = state.winner === CYAN;
  resultKicker.textContent = playerWon ? '青线接通' : '琥珀线接通';
  resultTitle.textContent = playerWon ? '你赢了' : 'AI 赢了';
  resultText.textContent = playerWon
    ? '青线从顶边连到了底边。'
    : '琥珀线从左边连到了右边。';
  result.classList.remove('is-hidden');
  playWinSound(state.winner);
}

function playMove(move) {
  const next = applyMove(state, move);
  if (!next) return false;
  state = next;
  flash = { start: performance.now(), last: state.last };
  if (forcedTutorial) {
    forcedTutorial = false;
    tutorialCoach = true;
    markGuideSeen();
  } else if (tutorialCoach) {
    tutorialCoach = false;
  }
  playMoveSound();
  updateUi();
  if (state.winner) {
    showResult();
    return true;
  }
  scheduleAi();
  return true;
}

function scheduleAi() {
  if (state.winner || state.turn !== AMBER) return;
  aiThinking = true;
  updateUi();
  aiTimer = setTimeout(() => {
    aiTimer = null;
    if (!state.winner && state.turn === AMBER) {
      const move = chooseAiMove(state, { depth: 2 });
      if (move) {
        const next = applyMove(state, move);
        if (next) {
          state = next;
          flash = { start: performance.now(), last: state.last };
          playMoveSound();
        }
      }
    }
    aiThinking = false;
    updateUi();
    if (state.winner) showResult();
  }, 260);
}

function cancelDrag() {
  drag = null;
  updateUi();
}

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  ensureAudio();
  if (state.winner || aiThinking || state.turn !== CYAN) return;
  const point = pointerPoint(event);
  const cell = pointToCell(point);
  if (!cell || state.board[index(cell.r, cell.c)] !== EMPTY) return;
  if (forcedTutorial && (cell.r !== 3 || cell.c !== 3)) {
    hint.textContent = '先按住闪烁格，再向右拖。';
    return;
  }
  drag = {
    ...cell,
    startX: point.x,
    startY: point.y,
    x: point.x,
    y: point.y,
    dr: null,
    dc: null
  };
  hover = cell;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  const point = pointerPoint(event);
  if (!drag) {
    hover = pointToCell(point);
    return;
  }

  drag.x = point.x;
  drag.y = point.y;
  const dx = drag.x - drag.startX;
  const dy = drag.y - drag.startY;
  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      drag.dr = 0;
      drag.dc = Math.sign(dx);
    } else {
      drag.dr = Math.sign(dy);
      drag.dc = 0;
    }
  }
});

canvas.addEventListener('pointerup', (event) => {
  event.preventDefault();
  if (!drag) return;
  const current = drag;
  drag = null;
  if (forcedTutorial && (current.r !== 3 || current.c !== 3 || current.dr !== 0 || current.dc !== 1)) {
    hint.textContent = '先按住闪烁格，再向右拖。';
    return;
  }
  if (current.dr !== null && current.dc !== null) {
    const move = { r: current.r, c: current.c, dr: current.dr, dc: current.dc };
    if (isLegalMove(state, move)) playMove(move);
  }
});

canvas.addEventListener('pointercancel', cancelDrag);
canvas.addEventListener('pointerleave', () => {
  if (!drag) hover = null;
});

restartButton.addEventListener('click', startNewGame);
againButton.addEventListener('click', startNewGame);
guideButton.addEventListener('click', openGuide);
guideStart.addEventListener('click', startGuideGame);
guideClose.addEventListener('click', closeGuide);

if (DEBUG) {
  window.__surge = {
    get state() { return state; },
    legalMoves: () => legalMoves(state),
    playMove,
    setState(next) {
      state = next;
      updateUi();
    }
  };
}

setupCanvas();
startNewGame();
maybeOpenGuide();
requestAnimationFrame(render);
