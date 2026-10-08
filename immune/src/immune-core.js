// IMMUNE 纯逻辑：扩散推进、投放疫苗、胜负判定、解法搜索。不碰 DOM，可直接单测。
import { LEVELS } from './levels.js';

export const FLOOR = 0;
export const WALL = 1;

const NEIGHBORS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const key = (row, col) => row + ',' + col;

function parseLevel(config, index) {
  const rows = config.rows;
  const height = rows.length;
  const width = rows[0].length;
  const terrain = [];
  const persons = [];
  const viruses = [];
  const drops = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    for (let col = 0; col < width; col += 1) {
      const char = rows[row][col] ?? '#';
      line.push(char === '#' ? WALL : FLOOR);
      if (char === 'P') persons.push([row, col]);
      else if (char === 'V') viruses.push([row, col]);
      else if (char === 'D') drops.push([row, col]);
    }
    terrain.push(line);
  }
  return {
    index,
    title: config.title,
    hint: config.hint ?? '',
    tutorial: Boolean(config.tutorial),
    width,
    height,
    terrain,
    persons,
    viruses,
    drops,
    maxTurns: config.maxTurns ?? 24
  };
}

export const PUZZLES = LEVELS.map(parseLevel);

export function getPuzzleCount() {
  return PUZZLES.length;
}

export function getPuzzleInfo(index) {
  return PUZZLES[index] ?? null;
}

function blank(puzzle) {
  return Array.from({ length: puzzle.height }, () => Array.from({ length: puzzle.width }, () => 0));
}

export function createState(index = 0) {
  const puzzle = PUZZLES[index];
  if (!puzzle) return null;
  const red = blank(puzzle);
  for (const [row, col] of puzzle.viruses) red[row][col] = 1;
  return {
    puzzleIndex: index,
    width: puzzle.width,
    height: puzzle.height,
    red,
    blue: blank(puzzle),
    usedDrops: [],
    turn: 0,
    injectedThisTurn: false,
    status: 'playing',
    lastRed: [],
    lastBlue: []
  };
}

export function cellKind(puzzle, row, col) {
  if (row < 0 || row >= puzzle.height || col < 0 || col >= puzzle.width) return 'outside';
  if (puzzle.terrain[row][col] === WALL) return 'wall';
  if (puzzle.persons.some(([r, c]) => r === row && c === col)) return 'person';
  if (puzzle.viruses.some(([r, c]) => r === row && c === col)) return 'virus';
  if (puzzle.drops.some(([r, c]) => r === row && c === col)) return 'drop';
  return 'floor';
}

export function dropAvailable(state, row, col) {
  const puzzle = PUZZLES[state.puzzleIndex];
  if (cellKind(puzzle, row, col) !== 'drop') return false;
  if (state.usedDrops.includes(key(row, col))) return false;
  return state.red[row][col] === 0 && state.blue[row][col] === 0;
}

export function inject(state, row, col) {
  if (state.status !== 'playing' || state.injectedThisTurn) return state;
  if (!dropAvailable(state, row, col)) return state;
  const blue = state.blue.map((line) => line.slice());
  blue[row][col] = 1;
  const next = {
    ...state,
    blue,
    usedDrops: state.usedDrops.concat([key(row, col)]),
    injectedThisTurn: true,
    lastRed: [],
    lastBlue: [[row, col]]
  };
  return settle(next);
}

function settle(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  const infected = puzzle.persons.some(([row, col]) => state.red[row][col] === 1);
  if (infected) return { ...state, status: 'lost' };
  const saved = puzzle.persons.every(([row, col]) => state.blue[row][col] === 1);
  if (saved) return { ...state, status: 'won' };
  if (state.turn >= puzzle.maxTurns) return { ...state, status: 'lost' };
  return state;
}

// 推进一回合：病毒先扩散，免疫后扩散。
export function advance(state) {
  if (state.status !== 'playing') return state;
  const puzzle = PUZZLES[state.puzzleIndex];
  const red = state.red.map((line) => line.slice());
  const blue = state.blue.map((line) => line.slice());

  const newRed = [];
  for (let row = 0; row < state.height; row += 1) {
    for (let col = 0; col < state.width; col += 1) {
      if (red[row][col] !== 1) continue;
      for (const [dr, dc] of NEIGHBORS) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= state.height || c < 0 || c >= state.width) continue;
        if (puzzle.terrain[r][c] === WALL) continue;
        if (red[r][c] === 1 || blue[r][c] === 1) continue;
        newRed.push([r, c]);
      }
    }
  }
  for (const [r, c] of newRed) red[r][c] = 1;

  const newBlue = [];
  for (let row = 0; row < state.height; row += 1) {
    for (let col = 0; col < state.width; col += 1) {
      if (blue[row][col] !== 1) continue;
      for (const [dr, dc] of NEIGHBORS) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= state.height || c < 0 || c >= state.width) continue;
        if (puzzle.terrain[r][c] === WALL) continue;
        if (red[r][c] === 1 || blue[r][c] === 1) continue;
        newBlue.push([r, c]);
      }
    }
  }
  for (const [r, c] of newBlue) blue[r][c] = 1;

  return settle({
    ...state,
    red,
    blue,
    turn: state.turn + 1,
    injectedThisTurn: false,
    lastRed: newRed,
    lastBlue: newBlue
  });
}

// 下一回合病毒会占到的格子（教学关用来提示）
export function previewVirus(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  const cells = [];
  for (let row = 0; row < state.height; row += 1) {
    for (let col = 0; col < state.width; col += 1) {
      if (state.red[row][col] !== 1) continue;
      for (const [dr, dc] of NEIGHBORS) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= state.height || c < 0 || c >= state.width) continue;
        if (puzzle.terrain[r][c] === WALL) continue;
        if (state.red[r][c] === 1 || state.blue[r][c] === 1) continue;
        if (!cells.some(([rr, cc]) => rr === r && cc === c)) cells.push([r, c]);
      }
    }
  }
  return cells;
}

export function availableDrops(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  return puzzle.drops.filter(([row, col]) => dropAvailable(state, row, col));
}

// 搜索「最少疫苗」的投放顺序。早投一定不比晚投差，所以只枚举连续投针的排列。
export function solve(state, limit = 20000) {
  let best = null;
  let visited = 0;

  const walk = (current, sequence) => {
    if (visited > limit) return;
    visited += 1;
    if (current.status === 'won') {
      if (!best || sequence.length < best.length) best = sequence.slice();
      return;
    }
    if (current.status === 'lost') return;

    // 本回合已经投过针：先推进一回合才能再投
    if (current.injectedThisTurn) {
      walk(advance(current), sequence);
      return;
    }

    // 不投了，一路推进
    let idle = current;
    while (idle.status === 'playing') idle = advance(idle);
    if (idle.status === 'won' && (!best || sequence.length < best.length)) best = sequence.slice();

    for (const drop of availableDrops(current)) {
      const injected = inject(current, drop[0], drop[1]);
      if (injected === current) continue;
      walk(advance(injected), sequence.concat([drop]));
    }
  };

  walk(state, []);
  return { solvable: Boolean(best), vaccines: best ? best.length : null, sequence: best, visited };
}

export function nextHint(state) {
  const found = solve(state);
  if (!found.solvable) return null;
  for (const drop of found.sequence) {
    if (dropAvailable(state, drop[0], drop[1])) return drop;
  }
  return null;
}