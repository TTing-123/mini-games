import {
  PUZZLES,
  createState,
  entryStatus,
  getPuzzleCount,
  nextHint,
  placeTile,
  remainingBlanks,
  takeTile,
  tileAt
} from './weave-core.js';

const COLORS = ['#d95f4b', '#2f7770', '#c59a38', '#7770b7'];
const chain = document.querySelector('#chain');
const rungs = document.querySelector('#rungs');
const bank = document.querySelector('#bank');
const clues = document.querySelector('#clues');
const levelGrid = document.querySelector('#level-grid');
const levelLabel = document.querySelector('#level-label');
const blankLabel = document.querySelector('#blank-label');
const bankLabel = document.querySelector('#bank-label');
const levelTitle = document.querySelector('#level-title');
const levelHint = document.querySelector('#level-hint');
const hintButton = document.querySelector('#hint');
const restartButton = document.querySelector('#restart');
const result = document.querySelector('#result');
const resultTitle = document.querySelector('#result-title');
const resultText = document.querySelector('#result-text');
const resultNext = document.querySelector('#result-next');
const resultRetry = document.querySelector('#result-retry');
const DEBUG = new URLSearchParams(location.search).has('debug');
const SOLVED_KEY = 'weave-solved';
let state = createState(0);
let selectedTile = null;
let resultShown = false;
let solved = loadSolved();

function loadSolved() {
  try {
    const raw = localStorage.getItem(SOLVED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveSolved() {
  try { localStorage.setItem(SOLVED_KEY, JSON.stringify(solved)); } catch (_) { /* 隐私模式 */ }
}

function renderLevels() {
  levelGrid.innerHTML = '';
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-button';
    button.textContent = String(index);
    if (index === state.puzzleIndex) button.classList.add('is-current');
    if (solved[index]) button.classList.add('is-solved');
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      loadPuzzle(index);
    });
    levelGrid.append(button);
  }
}

function cellFlags(position) {
  const puzzle = PUZZLES[state.puzzleIndex];
  const statuses = puzzle.entries
    .filter((entry) => entry.cells.includes(position))
    .map((entry) => entryStatus(state, entry.index));
  return {
    correct: statuses.length > 0 && statuses.every((status) => status === 'correct'),
    wrong: statuses.includes('wrong')
  };
}

function renderCell(position, puzzle) {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'cell';
  cell.dataset.position = String(position);
  const blank = puzzle.blanks.includes(position);
  const tile = tileAt(state, position);
  const flags = blank ? cellFlags(position) : { correct: true, wrong: false };
  if (blank && !tile) cell.classList.add('is-empty');
  if (blank && selectedTile !== null) cell.classList.add('is-target');
  if (flags.correct) cell.classList.add('is-correct');
  if (flags.wrong) cell.classList.add('is-wrong');
  cell.textContent = blank ? (tile ? tile.char : '') : puzzle.solution[position];
  return cell;
}

function renderChainBoard(puzzle) {
  chain.style.setProperty('--length', puzzle.solution.length);
  const linkPositions = new Set(puzzle.entries.slice(1).map((entry) => entry.start));
  for (let position = 0; position < puzzle.solution.length; position += 1) {
    const cell = renderCell(position, puzzle);
    if (linkPositions.has(position)) cell.classList.add('is-link');
    chain.append(cell);
  }
  rungs.innerHTML = '';
  rungs.style.setProperty('--length', puzzle.solution.length);
  puzzle.entries.forEach((entry) => {
    const rung = document.createElement('div');
    rung.className = 'rung';
    rung.style.setProperty('--start', entry.start + 1);
    rung.style.setProperty('--end', entry.start + entry.length + 1);
    rung.style.setProperty('--row', entry.index + 1);
    rung.style.setProperty('--entry-color', COLORS[entry.index % COLORS.length]);
    const status = entryStatus(state, entry.index);
    if (status === 'correct') rung.classList.add('is-correct');
    if (status === 'wrong') rung.classList.add('is-wrong');
    const number = document.createElement('span');
    number.textContent = String(entry.index + 1);
    rung.append(number);
    rungs.append(rung);
  });
}

function renderCrossBoard(puzzle) {
  chain.style.setProperty('--cols', puzzle.width);
  chain.style.setProperty('--rows', puzzle.height);
  const starts = new Map();
  puzzle.entries.forEach((entry) => {
    const first = entry.cells[0];
    if (!starts.has(first)) starts.set(first, []);
    starts.get(first).push(entry);
  });
  puzzle.cells.forEach((meta, position) => {
    const cell = renderCell(position, puzzle);
    cell.style.gridColumn = String(meta.col + 1);
    cell.style.gridRow = String(meta.row + 1);
    const badges = starts.get(position);
    if (badges) {
      const badge = document.createElement('span');
      badge.className = 'entry-badge';
      badge.textContent = badges.map((entry) => entry.index + 1).join('/');
      badge.style.setProperty('--entry-color', COLORS[badges[0].index % COLORS.length]);
      cell.append(badge);
    }
    chain.append(cell);
  });
  rungs.innerHTML = '';
}

function renderChain() {
  const puzzle = PUZZLES[state.puzzleIndex];
  chain.innerHTML = '';
  chain.classList.toggle('is-solved', state.status === 'won');
  chain.classList.toggle('is-grid', puzzle.kind === 'cross');
  if (puzzle.kind === 'cross') renderCrossBoard(puzzle);
  else renderChainBoard(puzzle);
}
function renderBank() {
  const puzzle = PUZZLES[state.puzzleIndex];
  bank.innerHTML = '';
  bankLabel.textContent = `${state.tiles.filter((tile) => tile.at === null).length} 块未用`;
  state.tiles.forEach((tile) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tile';
    button.dataset.tileId = String(tile.tileId);
    button.textContent = tile.char;
    if (tile.at !== null) button.classList.add('is-used');
    if (selectedTile === tile.tileId) button.classList.add('is-selected');
    bank.append(button);
  });
}

function renderClues() {
  const puzzle = PUZZLES[state.puzzleIndex];
  clues.innerHTML = '';
  puzzle.entries.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'clue';
    card.style.setProperty('--entry-color', COLORS[entry.index % COLORS.length]);
    const status = entryStatus(state, entry.index);
    if (status === 'correct') card.classList.add('is-correct');
    if (status === 'wrong') card.classList.add('is-wrong');
    const number = document.createElement('b');
    number.textContent = String(entry.index + 1);
    const text = document.createElement('p');
    text.textContent = entry.clue;
    card.append(number, text);
    clues.append(card);
  });
}
function render() {
  const puzzle = PUZZLES[state.puzzleIndex];
  levelLabel.textContent = `${state.puzzleIndex} / ${getPuzzleCount() - 1}`;
  blankLabel.textContent = String(remainingBlanks(state));
  levelTitle.textContent = puzzle.title;
  levelHint.textContent = puzzle.hint;
  renderChain();
  renderBank();
  renderClues();
  renderLevels();
  if (state.status === 'won') showResult();
}

function showResult() {
  if (resultShown) return;
  resultShown = true;
  const puzzle = PUZZLES[state.puzzleIndex];
  solved[state.puzzleIndex] = true;
  saveSolved();
  resultTitle.textContent = puzzle.title;
  resultText.textContent = `把 ${puzzle.entries.length} 条成语接成了 ${puzzle.solution.length} 个字的链。`;
  result.classList.remove('is-hidden');
}

function loadPuzzle(index) {
  state = createState(index);
  selectedTile = null;
  resultShown = false;
  result.classList.add('is-hidden');
  render();
}

function chooseTile(tileId) {
  const tile = state.tiles[tileId];
  if (!tile) return;
  if (tile.at !== null) state = takeTile(state, tile.at);
  selectedTile = tileId;
  render();
}

function chooseCell(position) {
  const puzzle = PUZZLES[state.puzzleIndex];
  if (!puzzle.blanks.includes(position)) return;
  if (state.placements[position] !== null && selectedTile === null) {
    const tileId = state.placements[position];
    state = takeTile(state, position);
    selectedTile = tileId;
    render();
    return;
  }
  if (selectedTile === null) return;
  state = placeTile(state, selectedTile, position);
  selectedTile = null;
  render();
}

bank.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('[data-tile-id]');
  if (!button) return;
  event.preventDefault();
  chooseTile(Number(button.dataset.tileId));
});

chain.addEventListener('pointerdown', (event) => {
  const cell = event.target.closest('[data-position]');
  if (!cell) return;
  event.preventDefault();
  chooseCell(Number(cell.dataset.position));
});

hintButton.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  const hint = nextHint(state);
  if (!hint) return;
  state = placeTile(state, hint.tileId, hint.position);
  selectedTile = null;
  render();
});

restartButton.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  loadPuzzle(state.puzzleIndex);
});

resultRetry.addEventListener('click', () => loadPuzzle(state.puzzleIndex));
resultNext.addEventListener('click', () => loadPuzzle((state.puzzleIndex + 1) % getPuzzleCount()));

if (DEBUG) {
  window.__weave = {
    get state() { return state; },
    get puzzle() { return PUZZLES[state.puzzleIndex]; },
    chooseTile,
    chooseCell,
    loadPuzzle
  };
}

render();
