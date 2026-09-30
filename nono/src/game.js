import {
  BLANK,
  FILLED,
  UNKNOWN,
  cluesFromLine,
  createState,
  cycleCell,
  getPuzzleCount,
  nextDeduction,
  setCell,
  undoState
} from './nono-core.js';

const board = document.querySelector('#board');
const levelLabel = document.querySelector('#level-label');
const moveLabel = document.querySelector('#move-label');
const undoButton = document.querySelector('#undo');
const hintButton = document.querySelector('#hint');
const restartButton = document.querySelector('#restart');
const levelTitle = document.querySelector('#level-title');
const levelHint = document.querySelector('#level-hint');
const levelGrid = document.querySelector('#level-grid');
const modeFill = document.querySelector('#mode-fill');
const modeMark = document.querySelector('#mode-mark');
const result = document.querySelector('#result');
const resultTitle = document.querySelector('#result-title');
const resultText = document.querySelector('#result-text');
const resultNext = document.querySelector('#result-next');
const resultRetry = document.querySelector('#result-retry');
const DEBUG = new URLSearchParams(location.search).has('debug');
const BEST_KEY = 'nono-best-stars';
const PIXELS = ['#4de2d5', '#f5b84b', '#ff6b6b', '#7c83ff', '#7ee787', '#ff9f43', '#d980fa', '#5aa9e6', '#ffd166', '#58d68d'];

let state = createState(0);
let mode = 'fill';
let dragging = false;
let dragDirty = false;
let dragLast = null;
let hintCount = 0;
let resultShown = false;
let bestStars = loadBest();

function loadBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === 'object' ? data : {};
  } catch (_) {
    return {};
  }
}

function saveBest() {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(bestStars)); } catch (_) { /* 忽略隐私模式 */ }
}

function lineMatches(clue, line) {
  return JSON.stringify(cluesFromLine(line)) === JSON.stringify(clue);
}

function rowFilled(row) {
  return state.grid[row].map((cell) => cell === FILLED ? 1 : 0);
}

function colFilled(col) {
  return state.grid.map((row) => row[col] === FILLED ? 1 : 0);
}

function renderLevelGrid() {
  levelGrid.innerHTML = '';
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.textContent = String(index + 1);
    if (index === state.puzzleIndex) button.classList.add('is-current');
    if (bestStars[index]) button.classList.add('is-solved');
    button.addEventListener('click', () => loadPuzzle(index));
    levelGrid.append(button);
  }
}

function renderBoard() {
  const deduction = state.puzzleIndex < 3 && state.moves === 0 ? nextDeduction(state) : null;
  board.innerHTML = '';
  board.style.setProperty('--cols', state.width);
  board.style.setProperty('--rows', state.height);
  board.style.setProperty('--pixel', PIXELS[state.puzzleIndex % PIXELS.length]);
  if (state.width >= 10) board.style.setProperty('--cell', '30px');
  else if (state.width >= 8) board.style.setProperty('--cell', '36px');
  else board.style.setProperty('--cell', '48px');

  const corner = document.createElement('div');
  corner.className = 'corner';
  board.append(corner);

  for (let col = 0; col < state.width; col += 1) {
    const clue = document.createElement('div');
    clue.className = 'col-clue';
    if ((col + 1) % 5 === 0 && col !== state.width - 1) clue.classList.add('thick-bottom');
    if (lineMatches(state.colClues[col], colFilled(col))) clue.classList.add('is-done');
    if (deduction && deduction.col === col) clue.classList.add('is-done');
    for (const value of state.colClues[col]) {
      const b = document.createElement('b');
      b.textContent = String(value);
      clue.append(b);
    }
    board.append(clue);
  }

  for (let row = 0; row < state.height; row += 1) {
    const clue = document.createElement('div');
    clue.className = 'row-clue';
    if ((row + 1) % 5 === 0 && row !== state.height - 1) clue.classList.add('thick-bottom');
    if (lineMatches(state.rowClues[row], rowFilled(row))) clue.classList.add('is-done');
    if (deduction && deduction.row === row) clue.classList.add('is-done');
    for (const value of state.rowClues[row]) {
      const b = document.createElement('b');
      b.textContent = String(value);
      clue.append(b);
    }
    board.append(clue);

    for (let col = 0; col < state.width; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      if ((col + 1) % 5 === 0 && col !== state.width - 1) cell.classList.add('thick-right');
      if ((row + 1) % 5 === 0 && row !== state.height - 1) cell.classList.add('thick-bottom');
      if (state.grid[row][col] === FILLED) cell.classList.add('is-filled');
      if (state.grid[row][col] === BLANK) cell.classList.add('is-marked');
      if (deduction && deduction.row === row && deduction.col === col) cell.classList.add('is-hint');
      cell.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        dragging = true;
        dragDirty = false;
        dragLast = String(row) + ',' + String(col);
        paintCell(row, col, event.button === 2, true);
      });
      cell.addEventListener('pointerenter', () => {
        const key = String(row) + ',' + String(col);
        if (dragging && dragLast !== key) {
          dragLast = key;
          paintCell(row, col, false, true);
        }
      });
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        paintCell(row, col, true);
      });
      board.append(cell);
    }
  }
}

function updateCellDom(row, col) {
  const cell = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!cell) return;
  const value = state.grid[row][col];
  cell.classList.toggle('is-filled', value === FILLED);
  cell.classList.toggle('is-marked', value === BLANK);
}

function paintCell(row, col, markMode, fromDrag = false) {
  if (state.won) return;
  const current = state.grid[row][col];
  const effectiveMode = markMode ? 'mark' : mode;
  const value = effectiveMode === 'mark'
    ? (current === BLANK ? UNKNOWN : BLANK)
    : (current === FILLED ? UNKNOWN : FILLED);
  const next = setCell(state, row, col, value);
  if (!next || next === state) return;
  state = next;
  if (fromDrag) {
    dragDirty = true;
    updateCellDom(row, col);
    updateHud();
    return;
  }
  renderAll();
  if (state.won) showResult();
}

function updateHud() {
  levelLabel.textContent = `${state.puzzleIndex + 1} / ${getPuzzleCount()}`;
  moveLabel.textContent = String(state.moves);
  levelTitle.textContent = state.title;
  levelHint.textContent = state.hint;
  undoButton.disabled = state.undoStack.length === 0;
}

function renderAll() {
  renderBoard();
  renderLevelGrid();
  updateHud();
}

function loadPuzzle(index) {
  state = createState(index);
  hintCount = 0;
  resultShown = false;
  result.classList.add('is-hidden');
  renderAll();
}

function restart() {
  loadPuzzle(state.puzzleIndex);
}

function nextPuzzle() {
  const next = state.puzzleIndex + 1 < getPuzzleCount() ? state.puzzleIndex + 1 : 0;
  loadPuzzle(next);
}

function showResult() {
  if (resultShown) return;
  resultShown = true;
  const stars = hintCount === 0 ? 3 : hintCount <= 2 ? 2 : 1;
  bestStars[state.puzzleIndex] = Math.max(bestStars[state.puzzleIndex] ?? 0, stars);
  saveBest();
  renderLevelGrid();
  resultTitle.textContent = state.title;
  resultText.textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} · 用了 ${state.moves} 次操作`;
  resultNext.textContent = state.puzzleIndex === getPuzzleCount() - 1 ? '回到第一关' : '下一关';
  result.classList.remove('is-hidden');
}

modeFill.addEventListener('click', () => {
  mode = 'fill';
  modeFill.classList.add('active');
  modeMark.classList.remove('active');
});

modeMark.addEventListener('click', () => {
  mode = 'mark';
  modeMark.classList.add('active');
  modeFill.classList.remove('active');
});

undoButton.addEventListener('click', () => {
  const next = undoState(state);
  if (!next) return;
  state = next;
  renderAll();
});

hintButton.addEventListener('click', () => {
  const deduction = nextDeduction(state);
  if (!deduction) return;
  hintCount += 1;
  const next = setCell(state, deduction.row, deduction.col, deduction.value);
  if (!next) return;
  state = next;
  renderAll();
  if (state.won) showResult();
});

restartButton.addEventListener('click', restart);
resultNext.addEventListener('click', nextPuzzle);
resultRetry.addEventListener('click', restart);
window.addEventListener('pointerup', () => {
  if (dragging && dragDirty) {
    dragging = false;
    dragLast = null;
    renderAll();
    if (state.won) showResult();
  } else {
    dragging = false;
    dragLast = null;
  }
});

if (DEBUG) {
  window.__nono = {
    get state() { return state; },
    loadPuzzle,
    nextDeduction
  };
}

renderAll();


