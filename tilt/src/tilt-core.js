// TILT 纯逻辑：关卡解析、整盘倾倒、结算预言、BFS 求解与提示。不碰 DOM，可直接单测。
// 颜色：0 = 无色（普通方块 / 万能凹槽）。带色方块只能进同色凹槽，普通凹槽谁都收。
import { LEVELS } from './levels.js';

export const FLOOR = 0;
export const WALL = 1;
export const HOLE = 2;

export const DIRECTIONS = ['up', 'down', 'left', 'right'];
const VECTORS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' };
const BLOCK_CHARS = { x: 0, a: 1, b: 2, c: 3, d: 4 };
const HOLE_CHARS = { o: 0, A: 1, B: 2, C: 3, D: 4 };

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
  const holeColors = [];
  const blocks = [];
  const blockColors = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    const colors = [];
    for (let col = 0; col < width; col += 1) {
      const char = rows[row][col] ?? '#';
      if (char === '#') {
        line.push(WALL);
        colors.push(0);
      } else if (char in HOLE_CHARS) {
        line.push(HOLE);
        colors.push(HOLE_CHARS[char]);
      } else {
        line.push(FLOOR);
        colors.push(0);
      }
      if (char in BLOCK_CHARS) {
        blocks.push([row, col]);
        blockColors.push(BLOCK_CHARS[char]);
      }
    }
    terrain.push(line);
    holeColors.push(colors);
  }
  const order = blocks.map((_, position) => position).sort((a, b) => compareBlocks(blocks[a], blocks[b]));
  return {
    index,
    title: config.title,
    hint: config.hint ?? '',
    tutorial: Boolean(config.tutorial),
    width,
    height,
    terrain,
    holeColors,
    blocks: order.map((position) => blocks[position]),
    blockColors: order.map((position) => blockColors[position])
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
    holeColors: puzzle.holeColors.map((line) => line.slice()),
    blocks: puzzle.blocks.map((block) => block.slice()).sort(compareBlocks),
    blockColors: puzzle.blockColors.slice(),
    won: puzzle.blocks.length === 0
  };
}

export function isSolved(state) {
  return state.blocks.length === 0;
}

export function blockColorAt(state, row, col) {
  const index = state.blocks.findIndex((block) => block[0] === row && block[1] === col);
  return index < 0 ? null : state.blockColors[index];
}

export function holeColorAt(state, row, col) {
  return state.holeColors[row][col];
}

export function hasColors(state) {
  return state.blockColors.some((color) => color > 0) || state.holeColors.flat().some((color) => color > 0);
}

function occupancy(state) {
  const taken = Array.from({ length: state.height }, () => Array.from({ length: state.width }, () => false));
  for (const [row, col] of state.blocks) taken[row][col] = true;
  return taken;
}

function sameLayout(blocks, colors, otherBlocks, otherColors) {
  if (blocks.length !== otherBlocks.length) return false;
  for (let index = 0; index < blocks.length; index += 1) {
    if (blocks[index][0] !== otherBlocks[index][0] || blocks[index][1] !== otherBlocks[index][1]) return false;
    if (colors[index] !== otherColors[index]) return false;
  }
  return true;
}

// 一次倾倒：所有方块一起往同一方向滑，各自撞墙或撞到别的方块才停。
// 返回每个方块 "从哪一格滑到哪一格"（带着自己的颜色），给渲染做动画用。
export function tiltMoves(state, direction) {
  const vector = VECTORS[direction];
  if (!vector || state.won) return null;
  const [dr, dc] = vector;
  const taken = occupancy(state);
  const entries = state.blocks.map((block, index) => ({ block, color: state.blockColors[index] }));
  // 先处理最靠目标墙的方块，后面的方块才不会被"还没移动的前车"挡住。
  entries.sort((a, b) => (b.block[0] * dr + b.block[1] * dc) - (a.block[0] * dr + a.block[1] * dc));
  const moves = [];
  for (const entry of entries) {
    const [row, col] = entry.block;
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
    moves.push({ from: [row, col], to: [nextRow, nextCol], color: entry.color });
  }
  return moves;
}

// 一次倾倒的完整结算：滑到哪、谁被吸收、结算后的状态。
// 停在凹槽上的方块被吸收（同色才行，万能凹槽谁都收）；只是滑过凹槽的不算，
// 而且同一格里仍然挡住后面的方块，所以顺序很重要。
export function tiltPlan(state, direction) {
  const moves = tiltMoves(state, direction);
  if (!moves) {
    return { moves: [], sunk: [], changed: false, state };
  }
  const colorBySpot = new Map();
  const sunk = [];
  const blocks = [];
  const colors = [];
  for (const move of moves) {
    const spot = state.terrain[move.to[0]][move.to[1]];
    const target = state.holeColors[move.to[0]][move.to[1]];
    colorBySpot.set(move.to[0] + ',' + move.to[1], move.color);
    if (spot === HOLE && (target === 0 || target === move.color)) sunk.push(move.to);
    else blocks.push(move.to);
  }
  const order = blocks.map((_, position) => position).sort((a, b) => compareBlocks(blocks[a], blocks[b]));
  const sortedBlocks = order.map((position) => blocks[position]);
  const sortedColors = order.map((position) => colorBySpot.get(blocks[position][0] + ',' + blocks[position][1]));
  const changed = sunk.length > 0 || !sameLayout(sortedBlocks, sortedColors, state.blocks, state.blockColors);
  return {
    moves,
    sunk,
    changed,
    state: { ...state, blocks: sortedBlocks, blockColors: sortedColors, won: sortedBlocks.length === 0 }
  };
}

export function tilt(state, direction) {
  return tiltPlan(state, direction).state;
}

export function stateKey(state) {
  const spots = state.blocks.map(([row, col], index) => ({
    color: state.blockColors[index],
    spot: row * state.width + col
  }));
  spots.sort((a, b) => a.spot - b.spot || a.color - b.color);
  return spots.map((item) => item.color + '@' + item.spot).join(',');
}

// 广度优先搜最短倾倒序列。方块用 "颜色 + 占用格" 排序后的键去重。
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