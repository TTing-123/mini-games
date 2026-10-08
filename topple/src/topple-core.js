// TOPPLE 纯逻辑：支撑连通、整体坠落、拆除、胜负判定、解法搜索。不碰 DOM，可直接单测。
import { LEVELS } from './levels.js';

const KEY = (row, col) => row + ',' + col;
const CELL = (key) => key.split(',').map(Number);
const NEIGHBORS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function parseLevel(config, index) {
  const rows = config.rows;
  const height = rows.length;
  const width = rows[0].length;
  const blocks = new Set();
  let gold = null;
  let target = null;
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const char = rows[row][col] ?? '.';
      if (char === '#') blocks.add(KEY(row, col));
      else if (char === 'G') { blocks.add(KEY(row, col)); gold = [row, col]; }
      else if (char === 'T') target = [row, col];
    }
  }
  return {
    index,
    title: config.title,
    hint: config.hint ?? '',
    tutorial: Boolean(config.tutorial),
    width,
    height,
    blocks,
    gold,
    target,
    maxRemovals: config.maxRemovals ?? 3
  };
}

export const PUZZLES = LEVELS.map(parseLevel);

export function getPuzzleCount() { return PUZZLES.length; }
export function getPuzzleInfo(index) { return PUZZLES[index] ?? null; }

export function createState(index = 0) {
  const puzzle = PUZZLES[index];
  if (!puzzle) return null;
  // 开局先结算一次：关卡里没接地的结构会自己落下（关卡设计错误也会在这里暴露）
  const blocks = new Set(puzzle.blocks);
  const resolved = resolve(blocks, puzzle.gold, puzzle.height);
  const state = {
    puzzleIndex: index,
    blocks,
    gold: resolved.gold,
    removed: [],
    status: 'playing',
    lastFalls: resolved.falls
  };
  if (isWon(state)) state.status = 'won';
  return state;
}

function supportedSet(blocks, height) {
  const supported = new Set();
  const queue = [];
  for (const cell of blocks) {
    const [row] = CELL(cell);
    if (row === height - 1) {
      supported.add(cell);
      queue.push(cell);
    }
  }
  while (queue.length) {
    const [row, col] = CELL(queue.shift());
    for (const [dr, dc] of NEIGHBORS) {
      const key = KEY(row + dr, col + dc);
      if (!blocks.has(key) || supported.has(key)) continue;
      supported.add(key);
      queue.push(key);
    }
  }
  return supported;
}

function groupComponents(cells) {
  const pool = new Set(cells);
  const groups = [];
  while (pool.size) {
    const start = pool.values().next().value;
    const group = [];
    const queue = [start];
    pool.delete(start);
    while (queue.length) {
      const cell = queue.shift();
      group.push(cell);
      const [row, col] = CELL(cell);
      for (const [dr, dc] of NEIGHBORS) {
        const next = KEY(row + dr, col + dc);
        if (!pool.has(next)) continue;
        pool.delete(next);
        queue.push(next);
      }
    }
    groups.push(group);
  }
  return groups;
}

function dropDistance(group, blocks, height) {
  const inside = new Set(group);
  let distance = Infinity;
  for (const cell of group) {
    const [row, col] = CELL(cell);
    let step = 0;
    for (;;) {
      const nextRow = row + step + 1;
      if (nextRow >= height) break;
      const nextKey = KEY(nextRow, col);
      if (blocks.has(nextKey) && !inside.has(nextKey)) break;
      step += 1;
    }
    distance = Math.min(distance, step);
    if (distance === 0) break;
  }
  return Number.isFinite(distance) ? distance : 0;
}

// 结算：与地面断开的部分整体下落，可能连着塌第二、第三次。
export function resolve(blocks, gold, height) {
  const falls = [];
  let goldCell = gold;
  let guard = 0;
  while (guard < 400) {
    guard += 1;
    const supported = supportedSet(blocks, height);
    const floating = [...blocks].filter((cell) => !supported.has(cell));
    if (!floating.length) break;
    const groups = groupComponents(floating).sort((a, b) => {
      const lowA = Math.max(...a.map((cell) => CELL(cell)[0]));
      const lowB = Math.max(...b.map((cell) => CELL(cell)[0]));
      return lowB - lowA;
    });
    let moved = false;
    for (const group of groups) {
      const distance = dropDistance(group, blocks, height);
      if (distance <= 0) continue;
      for (const cell of group) blocks.delete(cell);
      const targets = group.map((cell) => {
        const [row, col] = CELL(cell);
        return KEY(row + distance, col);
      });
      for (const cell of targets) blocks.add(cell);
      const goldKey = KEY(goldCell[0], goldCell[1]);
      if (group.includes(goldKey)) goldCell = [goldCell[0] + distance, goldCell[1]];
      falls.push({ from: group.slice(), to: targets.slice(), distance });
      moved = true;
    }
    if (!moved) break;
  }
  return { falls, gold: goldCell };
}

export function isWon(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  return state.gold[0] === puzzle.target[0] && state.gold[1] === puzzle.target[1];
}

export function canRemove(state, row, col) {
  const puzzle = PUZZLES[state.puzzleIndex];
  if (state.status !== 'playing') return false;
  if (state.removed.length >= puzzle.maxRemovals) return false;
  const key = KEY(row, col);
  if (!state.blocks.has(key)) return false;
  return !(row === state.gold[0] && col === state.gold[1]);
}

export function removeBlock(state, row, col) {
  if (!canRemove(state, row, col)) return state;
  const puzzle = PUZZLES[state.puzzleIndex];
  const blocks = new Set(state.blocks);
  blocks.delete(KEY(row, col));
  const resolved = resolve(blocks, state.gold, state.height ?? puzzle.height);
  const next = {
    ...state,
    blocks,
    gold: resolved.gold,
    removed: state.removed.concat([[row, col]]),
    lastFalls: resolved.falls
  };
  if (isWon(next)) next.status = 'won';
  else if (next.removed.length >= puzzle.maxRemovals) next.status = 'lost';
  return next;
}

function signature(state) {
  const blocks = [...state.blocks].sort();
  return blocks.join('|') + '#' + state.gold.join(',');
}

// 搜索最少拆除次数。拆除顺序无关的分支会被签名去重。
export function solve(state, limit = 80000) {
  const puzzle = PUZZLES[state.puzzleIndex];
  let best = null;
  let visited = 0;
  const seen = new Set([signature(state)]);
  const walk = (current, sequence) => {
    if (visited > limit) return;
    visited += 1;
    if (isWon(current)) {
      if (!best || sequence.length < best.length) best = sequence.slice();
      return;
    }
    if (sequence.length >= puzzle.maxRemovals) return;
    for (const cell of [...current.blocks].sort()) {
      const [row, col] = CELL(cell);
      if (!canRemove(current, row, col)) continue;
      const next = removeBlock(current, row, col);
      if (next === current) continue;
      const sig = signature(next);
      if (seen.has(sig)) continue;
      seen.add(sig);
      walk(next, sequence.concat([[row, col]]));
    }
  };
  walk(state, []);
  return { solvable: Boolean(best), removals: best ? best.length : null, sequence: best, visited };
}

export function nextHint(state) {
  const found = solve(state);
  if (!found.solvable) return null;
  for (const cell of found.sequence) {
    if (canRemove(state, cell[0], cell[1])) return cell;
  }
  return null;
}