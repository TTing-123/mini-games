// 关卡锻造：给一个没有目标格的结构（# 砖 / G 金块 / . 空），
// 枚举拆除序列，列出金块能落到哪些格子、各需要几次拆除。
// 用法：node topple/tools/level-forge.mjs <结构文件> [最大拆除次数]
import { readFileSync } from 'node:fs';
import { resolve, isWon } from '../src/topple-core.js';

const file = process.argv[2];
const maxDepth = Number(process.argv[3] ?? 4);
if (!file) {
  console.error('用法：node topple/tools/level-forge.mjs <结构文件> [最大拆除次数]');
  process.exit(2);
}

const rows = readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
const height = rows.length;
const width = Math.max(...rows.map((line) => line.length));
const blocks = new Set();
let gold = null;
for (let row = 0; row < height; row += 1) {
  for (let col = 0; col < width; col += 1) {
    const char = rows[row][col] ?? '.';
    if (char === '#') blocks.add(row + ',' + col);
    else if (char === 'G') { blocks.add(row + ',' + col); gold = [row, col]; }
  }
}
if (!gold) { console.error('结构里需要一个金块 G'); process.exit(2); }

const startBlocks = new Set(blocks);
const startSettled = resolve(startBlocks, gold, height);   // resolve 会就地修改这个 Set
const found = new Map();
const seen = new Set();

function signature(blockSet, goldCell) {
  return [...blockSet].sort().join('|') + '#' + goldCell.join(',');
}

function walk(blockSet, goldCell, depth, path) {
  const sig = signature(blockSet, goldCell);
  if (seen.has(sig)) return;
  seen.add(sig);
  const key = goldCell.join(',');
  const record = found.get(key);
  if (!record || path.length < record.length) found.set(key, path.slice());
  if (depth >= maxDepth) return;
  for (const cell of [...blockSet].sort()) {
    const [row, col] = cell.split(',').map(Number);
    if (row === goldCell[0] && col === goldCell[1]) continue;
    const next = new Set(blockSet);
    next.delete(cell);
    const settled = resolve(next, goldCell, height);
    walk(next, settled.gold, depth + 1, path.concat([[row, col]]));
  }
}

walk(startBlocks, startSettled.gold, 0, []);

console.log(`${file}  ${width}×${height} · 起点金块 (${startSettled.gold[0]},${startSettled.gold[1]})`);
console.log('金块可达落点（次数 = 最少拆除次数）：');
for (const [cell, path] of [...found.entries()].sort((a, b) => a[1].length - b[1].length || a[0].localeCompare(b[0]))) {
  const [r, c] = cell.split(',');
  console.log(`  (${r},${c})  ${path.length} 次   ${path.map(([rr, cc]) => `(${rr},${cc})`).join(' → ')}`);
}