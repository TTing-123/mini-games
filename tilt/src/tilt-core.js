// TILT 纯逻辑：关卡解析、整盘倾倒、结果预言、BFS 求解与提示。不碰 DOM，可直接单测。
import { LEVELS } from './levels.js';

export const FLOOR = 0;
export const WALL = 1;
export const HOLE = 2;

export const DIRECTIONS = ['up', 'down', 'left', 'right'];
const VECTORS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' };

export function arrowFor(direction) {
  return ARROWS[direction] ?? '';
}

function compareBlocks(a, b) {
  return a[0] - b[0] || a[1] - b[1];
}

function parseLevel(config, index) {
  const rows = config.rows;
  const height = rows.length;
  const width = rows[0].length;
  const terrain = [];
  const blocks = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    for (let col = 0; col < width; col += 1) {
      const char = rows[row][col] ?? '#';
      if (char === '#') line.push(WALL);
      else if (char === 'o') line.push(HOLE);
      else line.push(FLOOR);
      if (char === 'x') blocks.push([row, col]);
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
    blocks: blocks.sort(compareBlocks)
  };
}

export const PUZZLES = LEVELS.map(parseLevel);

export function getPuzzleCount() {
  return PUZZLES.length;
}

export function createState(index = 0) {
  const puzzle = PUZZLES[index];
  if (!puzzle) return null;
  return {
    puzzleIndex: index,
    title: puzzle.title,
    hint: puzzle.hint,
    tutorial: puzzle.tutorial,
    width: puzzle.width,
    height: puzzle.height,
    terrain: puzzle.terrain.map((line) => line.slice()),
    blocks: puzzle.blocks.map((block) => block.slice()).sort(compareBlocks),
    won: puzzle.blocks.length === 0
  };
}

export function isSolved(state) {
  return state.blocks.length === 0;
}

function occupancy(state) {
  const taken = Array.from({ length: state.height }, () => Array.from({ length: state.width }, () => false));
  for (const [row, col] of state.blocks) taken[row][col] = true;
  return taken;
}

function sameBlocks(a, b) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index][0] !== b[index][0] || a[index][1] !== b[index][1]) return false;
  }
  return true;
}

// 一次倾倒：所有方块一起往同一方向滑，各自撞墙或撞到别的方块才停。
// 返回每个方块 "从哪一格滑到哪一格"，给渲染做动画用。
export function tiltMoves(state, direction) {
  const vector = VECTORS[direction];
  if (!vector || state.won) return null;
  const [dr, dc] = vector;
  const taken = occupancy(state);
  // 先处理最靠目标墙的方块，后面的方块才不会被"还没移动的前车"挡住。
  const ordered = state.blocks
    .slice()
    .sort((a, b) => (b[0] * dr + b[1] * dc) - (a[0] * dr + a[1] * dc));
  const moves = [];
  for (const [row, col] of ordered) {
    taken[row][col] = false;
    let nextRow = row;
    let nextCol = col;
    for (;;) {
      const testRow = nextRow + dr;
      const testCol = nextCol + dc;
      if (testRow < 0 || testRow >= state.height || testCol < 0 || testCol >= state.width) break;
      if (state.terrain[testRow][testCol] === WALL) break;
      if (taken[testRow][testCol]) break;
      nextRow = testRow;
      nextCol = testCol;
    }
    taken[nextRow][nextCol] = true;
    moves.push({ from: [row, col], to: [nextRow, nextCol] });
  }
  return moves;
}

// 一次倾倒的完整结算：滑到哪、谁掉进凹槽、结算后的状态。
// 停在凹槽上的方块被吸收；只是滑过凹槽的不算，而且同一格里仍然挡住后面的方块。
export function tiltPlan(state, direction) {
  const moves = tiltMoves(state, direction);
  if (!moves) return { moves: [], sunk: [], changed: false, state };
  const sunk = [];
  const blocks = [];
  for (const move of moves) {
    if (state.terrain[move.to[0]][move.to[1]] === HOLE) sunk.push(move.to);
    else blocks.push(move.to);
  }
  blocks.sort(compareBlocks);
  const changed = sunk.length > 0 || !sameBlocks(blocks, state.blocks);
  return { moves, sunk, changed, state: { ...state, blocks, won: blocks.length === 0 } };
}

export function tilt(state, direction) {
  return tiltPlan(state, direction).state;
}

export function stateKey(state) {
  return state.blocks.map(([row, col]) => row * state.width + col).sort((a, b) => a - b).join(',');
}

// 广度优先搜最短倾倒序列。方块彼此等价，用占用格排序后的键去重。
export function solve(state, limit = 200000) {
  if (state.won) return [];
  const startKey = stateKey(state);
  const parents = new Map([[startKey, null]]);
  const depth = new Map([[startKey, 0]]);
  let frontier = [state];
  while (frontier.length) {
    const next = [];
    for (const current of frontier) {
      const currentKey = stateKey(current);
      for (const direction of DIRECTIONS) {
        const plan = tiltPlan(current, direction);
        if (!plan.changed) continue;
        const key = stateKey(plan.state);
        if (parents.has(key)) continue;
        parents.set(key, { from: currentKey, direction });
        depth.set(key, depth.get(currentKey) + 1);
        if (plan.state.won) {
          const path = [];
          let cursor = key;
          while (parents.get(cursor)) {
            path.push(parents.get(cursor).direction);
            cursor = parents.get(cursor).from;
          }
          return path.reverse();
        }
        next.push(plan.state);
        if (parents.size > limit) return null;
      }
    }
    frontier = next;
  }
  return null;
}

export function bestMove(state) {
  const path = solve(state);
  return path ? path[0] : null;
}