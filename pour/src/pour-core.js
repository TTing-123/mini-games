export const CAPACITY = 4;
export const COLORS = [
  '#ff6b6b',
  '#4de2d5',
  '#f5b84b',
  '#7c83ff',
  '#7ee787',
  '#ff9f43',
  '#d980fa',
  '#5aa9e6'
];

export function createRng(seed = Date.now()) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function cloneTubes(tubes) {
  return tubes.map((tube) => tube.slice());
}

export function topColor(tube) {
  return tube.length ? tube[tube.length - 1] : null;
}

export function topRun(tube) {
  if (!tube.length) return 0;
  const color = topColor(tube);
  let count = 0;
  for (let index = tube.length - 1; index >= 0 && tube[index] === color; index -= 1) count += 1;
  return count;
}

export function isSolved(tubes) {
  return tubes.every((tube) => tube.length === 0 || (tube.length === CAPACITY && tube.every((color) => color === tube[0])));
}

export function canPour(tubes, from, to) {
  if (from === to) return false;
  const source = tubes[from];
  const target = tubes[to];
  if (!source.length) return false;
  if (target.length >= CAPACITY) return false;
  if (!target.length) return true;
  return topColor(source) === topColor(target);
}

export function pour(tubes, from, to) {
  if (!canPour(tubes, from, to)) return null;
  const next = cloneTubes(tubes);
  const source = next[from];
  const target = next[to];
  const color = topColor(source);
  const amount = Math.min(topRun(source), CAPACITY - target.length);
  for (let index = 0; index < amount; index += 1) {
    source.pop();
    target.push(color);
  }
  return next;
}

export function legalMoves(tubes) {
  const moves = [];
  for (let from = 0; from < tubes.length; from += 1) {
    for (let to = 0; to < tubes.length; to += 1) {
      if (canPour(tubes, from, to)) moves.push({ from, to });
    }
  }
  return moves;
}

function tubeKey(tubes) {
  return tubes.map((tube) => tube.join(',')).sort().join('|');
}

export function solve(startTubes, maxNodes = 120000) {
  if (isSolved(startTubes)) return [];
  const seen = new Set();
  let nodes = 0;

  function search(tubes, path) {
    nodes += 1;
    if (nodes > maxNodes) return null;
    if (isSolved(tubes)) return path;
    const key = tubeKey(tubes);
    if (seen.has(key)) return null;
    seen.add(key);

    const moves = legalMoves(tubes).sort((a, b) => {
      const aScore = (tubes[a.to].length ? 2 : 0) + (topRun(tubes[a.from]) === tubes[a.from].length ? 1 : 0);
      const bScore = (tubes[b.to].length ? 2 : 0) + (topRun(tubes[b.from]) === tubes[b.from].length ? 1 : 0);
      return bScore - aScore;
    });

    for (const move of moves) {
      const next = pour(tubes, move.from, move.to);
      if (!next) continue;
      const result = search(next, path.concat(move));
      if (result) return result;
    }
    return null;
  }

  return search(cloneTubes(startTubes), []);
}

export function generateLevel(colorCount, emptyCount, seed = 1) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const random = createRng(seed + attempt * 7919);
    const deck = [];
    for (let color = 0; color < colorCount; color += 1) {
      for (let count = 0; count < CAPACITY; count += 1) deck.push(color);
    }
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [deck[index], deck[swap]] = [deck[swap], deck[index]];
    }
    const tubes = [];
    for (let index = 0; index < colorCount; index += 1) tubes.push(deck.slice(index * CAPACITY, (index + 1) * CAPACITY));
    for (let index = 0; index < emptyCount; index += 1) tubes.push([]);
    if (isSolved(tubes)) continue;
    const solution = solve(tubes);
    if (solution) return { tubes, solution };
  }
  throw new Error('could not generate a solvable level');
}

const LEVEL_CONFIGS = [
  { id: 'P1', title: '三色起步', colors: 3, empty: 2, seed: 11, hint: '先找顶层颜色相同的试管' },
  { id: 'P2', title: '第一组循环', colors: 3, empty: 2, seed: 23, hint: '空试管是周转空间' },
  { id: 'P3', title: '四色登场', colors: 4, empty: 2, seed: 31, hint: '先完成一根满管' },
  { id: 'P4', title: '多一个空管', colors: 4, empty: 3, seed: 43, hint: '空管多时先整理顶层' },
  { id: 'P5', title: '五色压力', colors: 5, empty: 2, seed: 51, hint: '不要急着把颜色倒满' },
  { id: 'P6', title: '五色周转', colors: 5, empty: 3, seed: 63, hint: '保留一根空管做缓冲' },
  { id: 'P7', title: '五色收紧', colors: 5, empty: 2, seed: 77, hint: '先处理颜色最杂的试管' },
  { id: 'P8', title: '六色挑战', colors: 6, empty: 2, seed: 89, hint: '一次倒出整段同色' },
  { id: 'P9', title: '六色周转', colors: 6, empty: 3, seed: 101, hint: '空管不要随便填满' },
  { id: 'P10', title: '最后一管', colors: 6, empty: 2, seed: 113, hint: '先完成一种颜色，再处理下一种' }
];

function buildLevel(config) {
  const generated = generateLevel(config.colors, config.empty, config.seed);
  return {
    ...config,
    tubes: generated.tubes,
    solution: generated.solution,
    parMoves: generated.solution.length
  };
}

const LEVELS = LEVEL_CONFIGS.map(buildLevel);

export function getLevelCount() {
  return LEVELS.length;
}

export function getLevelInfo(index) {
  return LEVELS[index] ?? null;
}

export function createState(index = 0) {
  const level = LEVELS[index];
  if (!level) return null;
  return {
    levelIndex: index,
    id: level.id,
    title: level.title,
    hint: level.hint,
    tubes: cloneTubes(level.tubes),
    moves: 0,
    parMoves: level.parMoves,
    undoStack: [],
    won: false
  };
}

export function applyMove(state, from, to) {
  const nextTubes = pour(state.tubes, from, to);
  if (!nextTubes) return null;
  return {
    ...state,
    tubes: nextTubes,
    moves: state.moves + 1,
    undoStack: [...state.undoStack, cloneTubes(state.tubes)],
    won: isSolved(nextTubes)
  };
}

export function undoMove(state) {
  if (!state.undoStack.length) return null;
  const undoStack = state.undoStack.slice(0, -1);
  const tubes = cloneTubes(state.undoStack[state.undoStack.length - 1]);
  return {
    ...state,
    tubes,
    moves: Math.max(0, state.moves - 1),
    undoStack,
    won: isSolved(tubes)
  };
}

export function firstHintMove(state) {
  const solution = solve(state.tubes, 60000);
  return solution?.[0] ?? null;
}
