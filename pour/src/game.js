import {
  COLORS,
  applyMove,
  createState,
  firstHintMove,
  getLevelCount,
  isSolved,
  topColor,
  undoMove
} from './pour-core.js';

const rack = document.querySelector('#rack');
const levelLabel = document.querySelector('#level-label');
const moveLabel = document.querySelector('#move-label');
const bestLabel = document.querySelector('#best-label');
const undoButton = document.querySelector('#undo');
const restartButton = document.querySelector('#restart');
const levelTitle = document.querySelector('#level-title');
const levelHint = document.querySelector('#level-hint');
const levelGrid = document.querySelector('#level-grid');
const result = document.querySelector('#result');
const resultTitle = document.querySelector('#result-title');
const resultStars = document.querySelector('#result-stars');
const resultText = document.querySelector('#result-text');
const resultNext = document.querySelector('#result-next');
const resultRetry = document.querySelector('#result-retry');
const DEBUG = new URLSearchParams(location.search).has('debug');
const BEST_KEY = 'pour-best-stars';

let state = createState(0);
let selected = null;
let invalidIndex = null;
let pouring = false;
let pourFrom = null;
let pourTo = null;
let resultShown = false;
let hintMove = firstHintMove(state);

function loadBestStars() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === 'object' ? data : {};
  } catch (_) {
    return {};
  }
}

function saveBestStars(data) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(data)); } catch (_) { /* 忽略隐私模式 */ }
}

const bestStars = loadBestStars();

function calculateStars() {
  if (state.moves <= state.parMoves) return 3;
  if (state.moves <= Math.ceil(state.parMoves * 1.5)) return 2;
  return 1;
}

function renderLevelGrid() {
  levelGrid.innerHTML = '';
  for (let index = 0; index < getLevelCount(); index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.textContent = String(index + 1);
    if (index === state.levelIndex) button.classList.add('is-current');
    if (bestStars[index]) button.classList.add('is-solved');
    button.addEventListener('click', () => loadLevel(index));
    levelGrid.append(button);
  }
}

function makeTube(index) {
  const wrap = document.createElement('div');
  wrap.className = 'tube-wrap';
  wrap.dataset.index = String(index);
  if (selected === index) wrap.classList.add('is-selected');
  if (invalidIndex === index) wrap.classList.add('is-invalid');
  if (pouring && pourFrom === index) wrap.classList.add('pour-out');
  if (pouring && pourTo === index) wrap.classList.add('pour-in');

  const tube = document.createElement('div');
  tube.className = 'tube';
  const top = document.createElement('span');
  top.className = 'tube-top';
  const stack = document.createElement('div');
  stack.className = 'liquid-stack';

  const colors = state.tubes[index];
  const locked = colors.length === 4 && colors.every((color) => color === colors[0]);
  if (locked) wrap.classList.add('is-locked');

  for (const colorIndex of colors) {
    const liquid = document.createElement('i');
    liquid.className = 'liquid';
    liquid.style.background = COLORS[colorIndex % COLORS.length];
    stack.append(liquid);
  }

  tube.append(top, stack);
  tube.addEventListener('click', () => handleTubeClick(index));
  const label = document.createElement('span');
  label.className = 'tube-label';
  label.textContent = String(index + 1);
  wrap.append(tube, label);
  return wrap;
}

function renderRack() {
  rack.innerHTML = '';
  if (state.levelIndex < 3 && state.moves === 0 && hintMove) {
    const wraps = [];
    for (let index = 0; index < state.tubes.length; index += 1) wraps.push(makeTube(index));
    wraps[hintMove.from]?.classList.add('is-hint-source');
    wraps[hintMove.to]?.classList.add('is-hint-target');
    wraps.forEach((wrap) => rack.append(wrap));
    return;
  }
  for (let index = 0; index < state.tubes.length; index += 1) rack.append(makeTube(index));
}

function updateHud() {
  levelLabel.textContent = `${state.levelIndex + 1} / ${getLevelCount()}`;
  moveLabel.textContent = String(state.moves);
  bestLabel.textContent = bestStars[state.levelIndex] ? '★'.repeat(bestStars[state.levelIndex]) : '-';
  levelTitle.textContent = state.title;
  levelHint.textContent = state.hint;
  undoButton.disabled = state.undoStack.length === 0 || pouring;
}

function renderAll() {
  renderRack();
  renderLevelGrid();
  updateHud();
}

function handleTubeClick(index) {
  if (pouring || state.won) return;
  if (selected === null) {
    if (!state.tubes[index].length) {
      invalidIndex = index;
      renderRack();
      setTimeout(() => { invalidIndex = null; renderRack(); }, 260);
      return;
    }
    selected = index;
    renderRack();
    return;
  }

  if (selected === index) {
    selected = null;
    renderRack();
    return;
  }

  const next = applyMove(state, selected, index);
  if (!next) {
    invalidIndex = index;
    renderRack();
    setTimeout(() => { invalidIndex = null; renderRack(); }, 260);
    return;
  }

  pouring = true;
  pourFrom = selected;
  pourTo = index;
  selected = null;
  renderRack();

  setTimeout(() => {
    state = next;
    pouring = false;
    pourFrom = null;
    pourTo = null;
    renderAll();
    if (state.won) showResult();
  }, 300);
}

function loadLevel(index) {
  state = createState(index);
  hintMove = firstHintMove(state);
  selected = null;
  invalidIndex = null;
  pouring = false;
  resultShown = false;
  result.classList.add('is-hidden');
  renderAll();
}

function restart() {
  loadLevel(state.levelIndex);
}

function nextLevel() {
  const next = state.levelIndex + 1 < getLevelCount() ? state.levelIndex + 1 : 0;
  loadLevel(next);
}

function showResult() {
  if (resultShown) return;
  resultShown = true;
  const stars = calculateStars();
  bestStars[state.levelIndex] = Math.max(bestStars[state.levelIndex] ?? 0, stars);
  saveBestStars(bestStars);
  renderLevelGrid();
  resultStars.textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  resultTitle.textContent = state.levelIndex === getLevelCount() - 1 ? '全部完成' : '颜色分开';
  resultText.textContent = `用了 ${state.moves} 步，最少参考 ${state.parMoves} 步。`;
  resultNext.textContent = state.levelIndex === getLevelCount() - 1 ? '回到第一关' : '下一关';
  result.classList.remove('is-hidden');
}

undoButton.addEventListener('click', () => {
  if (pouring) return;
  const next = undoMove(state);
  if (!next) return;
  state = next;
  selected = null;
  renderAll();
});

restartButton.addEventListener('click', restart);
resultNext.addEventListener('click', nextLevel);
resultRetry.addEventListener('click', restart);

if (DEBUG) {
  window.__pour = {
    get state() { return state; },
    loadLevel,
    handleTubeClick,
    firstHintMove
  };
}

renderAll();
