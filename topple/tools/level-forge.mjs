// 关卡锻造：给一个没有目标格的结构（# 砖 / S 钢砖 / G 金块 / . 空），
// 列出金块每个可达落点的「最少拆除次数 / 最短解条数 / 开局分支数」，用来定目标格。
// 用法：node topple/tools/level-forge.mjs <结构文件> [最大拆除次数]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, isWon, removeBlock, canRemove } from '../src/topple-core.js';

const input = process.argv[2];
const maxDepth = Number(process.argv[3] ?? 5);
if (!input) {
  console.error('用法：node topple/tools/level-forge.mjs <结构文件或目录> [最大拆除次数]');
  process.exit(2);
}

const files = statSync(input).isDirectory()
  ? readdirSync(input).filter((name) => name.endsWith('.txt')).sort().map((name) => input + '/' + name)
  : [input];

for (const file of files) report(file);

function report(file) {
const rows = readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
const height = rows.length;
const width = Math.max(...rows.map((line) => line.length));
const blocks = new Set();
let gold = null;
for (let row = 0; row < height; row += 1) {
  for (let col = 0; col < width; col += 1) {
    const char = rows[row][col] ?? '.';
    if (char === '#' || char === 'S') blocks.add(row + ',' + col);
    else if (char === 'G') { blocks.add(row + ',' + col); gold = [row, col]; }
  }
}
if (!gold) { console.error('结构里需要一个金块 G'); process.exit(2); }

const startBlocks = new Set(blocks);
const startSteel = initialSteel(startBlocks);
const startSettled = resolve(startBlocks, gold, height, startSteel);

// 用一个最小的假关状态来复用 removeBlock
function makeState(blockSet, goldCell) {
  return {
    puzzleIndex: -1,
    blocks: blockSet,
    steel: new Set([...blockSet].filter((cell) => {
      const [r, c] = cell.split(',').map(Number);
      return (rows[r] ?? '')[c] === 'S';
    })),
    gold: goldCell,
    removed: [],
    status: 'playing',
    lastFalls: [],
    width,
    height
  };
}

const results = new Map();      // 落点 -> { count, firstMoves:Set, sample }
const seen = new Map();

// 钢砖会跟着所在的一坨一起移动，所以它们的位置要跟着模拟走
function initialSteel(blockSet) {
  return new Set([...blockSet].filter((cell) => {
    const [row, col] = cell.split(',').map(Number);
    return (rows[row] ?? '')[col] === 'S';
  }));
}

function walk(blockSet, goldCell, steelSet, depth, path) {
  const key = [...blockSet].sort().join('|') + '#' + goldCell.join(',');
  const reached = seen.get(key);
  if (reached !== undefined && reached <= depth) return;
  seen.set(key, depth);

  const target = goldCell.join(',');
  const record = results.get(target) ?? { count: 0, firstMoves: new Set(), depth: Infinity };
  if (depth < record.depth) { record.depth = depth; record.count = 0; record.firstMoves = new Set(); record.sample = path.slice(); }
  if (depth === record.depth) {
    record.count += 1;
    if (path.length) record.firstMoves.add(path[0].join(','));
  }
  results.set(target, record);

  if (depth >= maxDepth) return;
  for (const cell of [...blockSet].sort()) {
    const [row, col] = cell.split(',').map(Number);
    if (row === goldCell[0] && col === goldCell[1]) continue;
    if (steelSet.has(cell)) continue;
    const nextBlocks = new Set(blockSet);
    const nextSteel = new Set(steelSet);
    nextBlocks.delete(cell);
    const settled = resolve(nextBlocks, goldCell, height, nextSteel);
    walk(nextBlocks, settled.gold, nextSteel, depth + 1, path.concat([[row, col]]));
  }
}

walk(startBlocks, startSettled.gold, startSettled.steel ?? initialSteel(startBlocks), 0, []);

console.log(`${file}  ${width}×${height}`);
console.log('落点            最少拆除  解条数  开局分支  示例');
for (const [cell, record] of [...results.entries()].sort((a, b) => a[1].depth - b[1].depth || a[0].localeCompare(b[0]))) {
  const [r, c] = cell.split(',');
  console.log(
    `(${r},${c})`.padEnd(14) +
    String(record.depth).padStart(6) +
    String(record.count).padStart(8) +
    String(record.firstMoves.size).padStart(10) + '  ' +
    (record.sample ?? []).map(([rr, cc]) => `(${rr},${cc})`).join(' → ')
  );
}
}
