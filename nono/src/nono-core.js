export const UNKNOWN = 0;
export const FILLED = 1;
export const BLANK = 2;

export function cluesFromLine(line) {
  const clues = [];
  let run = 0;
  for (const cell of line) {
    if (cell === 1) run += 1;
    else if (run) {
      clues.push(run);
      run = 0;
    }
  }
  if (run) clues.push(run);
  return clues.length ? clues : [0];
}

function placements(length, clue, index = 0, position = 0, current = [], output = []) {
  if (output.length > 50000) return output;
  if (index >= clue.length) {
    output.push(current.slice());
    return output;
  }
  const value = clue[index];
  const remaining = clue.slice(index + 1).reduce((sum, item) => sum + item + 1, 0);
  const maxStart = length - remaining - value;
  for (let start = position; start <= maxStart; start += 1) {
    const next = current.concat(Array.from({ length: value }, (_, offset) => start + offset));
    placements(length, clue, index + 1, start + value + 1, next, output);
  }
  return output;
}

export function lineCandidates(length, clue, known = []) {
  if (clue.length === 1 && clue[0] === 0) {
    if (known.some((value) => value === FILLED)) return [];
    return [Array.from({ length }, () => BLANK)];
  }
  const filledSets = placements(length, clue);
  const candidates = [];
  for (const filledIndexes of filledSets) {
    const filled = new Set(filledIndexes);
    let valid = true;
    for (let index = 0; index < length; index += 1) {
      if (known[index] === FILLED && !filled.has(index)) valid = false;
      if (known[index] === BLANK && filled.has(index)) valid = false;
      if (!valid) break;
    }
    if (!valid) continue;
    candidates.push(Array.from({ length }, (_, index) => filled.has(index) ? FILLED : BLANK));
    if (candidates.length > 20000) break;
  }
  return candidates;
}

export function deduceLine(length, clue, known) {
  const candidates = lineCandidates(length, clue, known);
  if (!candidates.length) return null;
  for (let index = 0; index < length; index += 1) {
    if (known[index] !== UNKNOWN) continue;
    const filledCount = candidates.reduce((sum, candidate) => sum + (candidate[index] === FILLED ? 1 : 0), 0);
    if (filledCount === candidates.length) return { index, value: FILLED };
    if (filledCount === 0) return { index, value: BLANK };
  }
  return null;
}

export function solveByLines(puzzle, limit = 10000) {
  const grid = Array.from({ length: puzzle.height }, () => Array.from({ length: puzzle.width }, () => UNKNOWN));
  let steps = 0;
  let changed = true;
  while (changed && steps < limit) {
    changed = false;
    for (let row = 0; row < puzzle.height; row += 1) {
      const deduction = deduceLine(puzzle.width, puzzle.rowClues[row], grid[row]);
      if (deduction && grid[row][deduction.index] === UNKNOWN) {
        grid[row][deduction.index] = deduction.value;
        changed = true;
        steps += 1;
      }
    }
    for (let col = 0; col < puzzle.width; col += 1) {
      const line = grid.map((row) => row[col]);
      const clues = puzzle.colClues[col];
      const deduction = deduceLine(puzzle.height, clues, line);
      if (deduction && grid[deduction.index][col] === UNKNOWN) {
        grid[deduction.index][col] = deduction.value;
        changed = true;
        steps += 1;
      }
    }
  }
  return grid;
}

export function isLineSolvable(puzzle) {
  const grid = solveByLines(puzzle);
  for (let row = 0; row < puzzle.height; row += 1) {
    for (let col = 0; col < puzzle.width; col += 1) {
      const expected = puzzle.solution[row][col] === 1 ? FILLED : BLANK;
      if (grid[row][col] !== expected) return false;
    }
  }
  return true;
}

const LEVEL_ROWS = [
  { title: '爱心', hint: '先从最满的行开始', rows: ['01110', '11111', '11111', '01110', '00100'] },
  { title: '方框', hint: '四条边都是连续块', rows: ['11111', '10001', '10001', '10001', '11111'] },
  { title: '箭头', hint: '中间连续块最多', rows: ['00100', '01110', '11111', '00100', '00100'] },
  { title: '小屋', hint: '屋顶和墙分开看', rows: ['00011000', '00111100', '01111110', '11111111', '01111110', '01100110', '01100110', '01111110'] },
  { title: '树', hint: '先确定中轴', rows: ['00011000', '00111100', '01111110', '11111111', '00111100', '00111100', '00011000', '00111100'] },
  { title: '猫', hint: '耳朵在四个角上', rows: ['11000011', '11100111', '11111111', '10111101', '11111111', '11011011', '01111110', '00100100'] },
  { title: '钥匙', hint: '上面有一个空心圆', rows: ['01111000', '10000100', '10000100', '11111100', '00001000', '00001000', '00001110', '00000010'] },
  { title: '火箭', hint: '中轴很长', rows: ['0000110000', '0001111000', '0011111100', '0011111100', '0111111110', '0111111110', '0001111000', '0011111100', '0110000110', '1100000011'] },
  { title: '钻石', hint: '从中间最宽的一行开始', rows: ['0000110000', '0001111000', '0011111100', '0111111110', '1111111111', '1111111111', '0111111110', '0011111100', '0001111000', '0000110000'] },
  { title: '皇冠', hint: '顶部有三个尖', rows: ['1010000101', '1110000111', '1111001111', '1111111111', '1111111111', '1111111111', '0111111110', '0011111100', '0011111100', '0000000000'] }
];

function buildPuzzle(config, index) {
  const solution = config.rows.map((row) => row.split('').map(Number));
  const height = solution.length;
  const width = solution[0].length;
  const rowClues = solution.map(cluesFromLine);
  const colClues = Array.from({ length: width }, (_, col) => cluesFromLine(solution.map((row) => row[col])));
  return { index, title: config.title, hint: config.hint, solution, height, width, rowClues, colClues };
}

export const PUZZLES = LEVEL_ROWS.map(buildPuzzle);

export function getPuzzleCount() {
  return PUZZLES.length;
}

export function getPuzzleInfo(index) {
  return PUZZLES[index] ?? null;
}

export function createState(index = 0) {
  const puzzle = PUZZLES[index];
  if (!puzzle) return null;
  return {
    puzzleIndex: index,
    title: puzzle.title,
    hint: puzzle.hint,
    width: puzzle.width,
    height: puzzle.height,
    rowClues: puzzle.rowClues.map((line) => line.slice()),
    colClues: puzzle.colClues.map((line) => line.slice()),
    solution: puzzle.solution.map((row) => row.slice()),
    grid: Array.from({ length: puzzle.height }, () => Array.from({ length: puzzle.width }, () => UNKNOWN)),
    moves: 0,
    undoStack: [],
    won: false
  };
}

export function setCell(state, row, col, value) {
  if (state.won) return null;
  if (row < 0 || row >= state.height || col < 0 || col >= state.width) return null;
  if (state.grid[row][col] === value) return state;
  const grid = state.grid.map((line) => line.slice());
  grid[row][col] = value;
  return {
    ...state,
    grid,
    moves: state.moves + 1,
    undoStack: [...state.undoStack, state.grid.map((line) => line.slice())],
    won: isStateSolved({ ...state, grid })
  };
}

export function cycleCell(state, row, col) {
  const current = state.grid[row][col];
  const next = current === UNKNOWN ? FILLED : current === FILLED ? BLANK : UNKNOWN;
  return setCell(state, row, col, next);
}

export function undoState(state) {
  if (!state.undoStack.length) return null;
  const undoStack = state.undoStack.slice(0, -1);
  const grid = state.undoStack[state.undoStack.length - 1].map((line) => line.slice());
  return {
    ...state,
    grid,
    moves: Math.max(0, state.moves - 1),
    undoStack,
    won: false
  };
}

export function isStateSolved(state) {
  for (let row = 0; row < state.height; row += 1) {
    for (let col = 0; col < state.width; col += 1) {
      const expected = state.solution[row][col] === 1;
      const actual = state.grid[row][col] === FILLED;
      if (expected !== actual) return false;
    }
  }
  return true;
}

export function nextDeduction(state) {
  for (let row = 0; row < state.height; row += 1) {
    const deduction = deduceLine(state.width, state.rowClues[row], state.grid[row]);
    if (deduction) return { row, col: deduction.index, value: deduction.value };
  }
  for (let col = 0; col < state.width; col += 1) {
    const line = state.grid.map((row) => row[col]);
    const deduction = deduceLine(state.height, state.colClues[col], line);
    if (deduction) return { row: deduction.index, col, value: deduction.value };
  }
  return null;
}

