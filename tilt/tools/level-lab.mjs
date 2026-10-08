// 关卡设计辅助：给定只含墙(#)、地面(.)和起点(x)的地形，打印
// "从起点出发，几步之后方块能停在每一格"的热力图。
// 用来挑凹槽位置、判断最短步数，避免手画关卡时盲目试。
// 用法：node tilt/tools/level-lab.mjs <file>
import { readFileSync } from 'node:fs';
import { tilt, DIRECTIONS, FLOOR, WALL, HOLE } from '../src/tilt-core.js';

const file = process.argv[2];
if (!file) {
  console.error('用法：node tilt/tools/level-lab.mjs <地形文件>');
  process.exit(2);
}

const rows = readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
const height = rows.length;
const width = Math.max(...rows.map((line) => line.length));
const terrain = [];
let start = null;
for (let row = 0; row < height; row += 1) {
  const line = [];
  for (let col = 0; col < width; col += 1) {
    const char = rows[row][col] ?? '#';
    line.push(char === '#' ? WALL : char === 'o' ? HOLE : FLOOR);
    if (char === 'x') start = [row, col];
  }
  terrain.push(line);
}
if (!start) {
  console.error('地形里需要一个起点 x');
  process.exit(2);
}

const base = { width, height, terrain, blocks: [start], won: false };
const dist = new Map();
dist.set(start[0] * width + start[1], 0);
let frontier = [base];
while (frontier.length) {
  const next = [];
  for (const state of frontier) {
    const here = state.blocks[0];
    const level = dist.get(here[0] * width + here[1]);
    for (const direction of DIRECTIONS) {
      const moved = tilt(state, direction);
      const spot = moved.blocks[0];
      if (!spot || (spot[0] === here[0] && spot[1] === here[1])) continue;
      const key = spot[0] * width + spot[1];
      if (dist.has(key)) continue;
      dist.set(key, level + 1);
      next.push({ ...state, blocks: [spot] });
    }
  }
  frontier = next;
}

const cell = (value) => String(value).padStart(2);
for (let row = 0; row < height; row += 1) {
  const line = [];
  for (let col = 0; col < width; col += 1) {
    if (terrain[row][col] === WALL) { line.push('##'); continue; }
    if (row === start[0] && col === start[1]) { line.push(' x'); continue; }
    const value = dist.get(row * width + col);
    line.push(value === undefined ? ' .' : cell(value));
  }
  console.log(line.join(''));
}
console.log('\n数字 = 从起点出发，几步能让方块停在这一格。选一个数字当凹槽位置，就是那一关的最短步数。');