// 关卡体检 + 相似度检查：找出重复、镜像、以及"套路一样"的关卡。
// 用法：node tilt/tools/level-audit.mjs
import { PUZZLES, createState, solve, arrowFor, WALL, HOLE } from '../src/tilt-core.js';

const layoutOf = (puzzle) => {
  const rows = [];
  for (let row = 0; row < puzzle.height; row += 1) {
    let line = '';
    for (let col = 0; col < puzzle.width; col += 1) {
      const cell = puzzle.terrain[row][col];
      if (cell === WALL) line += '#';
      else if (cell === HOLE) line += 'o';
      else if (puzzle.blocks.some(([r, c]) => r === row && c === col)) line += 'x';
      else line += '.';
    }
    rows.push(line);
  }
  return rows;
};

const mirror = (rows, mode) => rows.map((line, row) => {
  if (mode === 'h') return [...line].reverse().join('');
  if (mode === 'v') return rows[rows.length - 1 - row];
  return [...rows[rows.length - 1 - row]].reverse().join('');
});

function symmetry(rows) {
  const kinds = [];
  for (const mode of ['h', 'v', 'r']) {
    if (rows.join('|') === mirror(rows, mode).join('|')) kinds.push(mode);
  }
  return kinds;
}

function wallSet(puzzle) {
  const set = new Set();
  for (let row = 0; row < puzzle.height; row += 1) {
    for (let col = 0; col < puzzle.width; col += 1) {
      const edge = row === 0 || col === 0 || row === puzzle.height - 1 || col === puzzle.width - 1;
      if (edge) continue; // 外圈是所有关卡共用的，算进相似度会虚高
      if (puzzle.terrain[row][col] === WALL) set.add(row + ',' + col);
    }
  }
  return set;
}

function jaccard(a, b) {
  let inter = 0;
  for (const item of a) if (b.has(item)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 1 : inter / union;
}

const info = PUZZLES.map((puzzle, index) => {
  const path = solve(createState(index)) ?? [];
  return {
    index,
    title: puzzle.title,
    width: puzzle.width,
    height: puzzle.height,
    walls: wallSet(puzzle).size,
    blocks: puzzle.blocks.length,
    holes: puzzle.terrain.flat().filter((cell) => cell === HOLE).length,
    moves: path.length,
    path: path.join(''),
    steps: path,
    arrows: path.map(arrowFor).join(' '),
    rows: layoutOf(puzzle),
    walls_set: wallSet(puzzle)
  };
});

console.log('=== 关卡总览 ===');
for (const item of info) {
  const sym = symmetry(item.rows);
  const flag = sym.length ? '  对称:' + sym.join('') : '';
  console.log(
    String(item.index).padStart(2) + '  ' + item.title.padEnd(4, '　') +
    '  ' + (item.width + 'x' + item.height).padEnd(6) +
    ' 墙' + String(item.walls).padStart(2) +
    ' 块' + item.blocks + ' 槽' + item.holes +
    ' 最短' + String(item.moves).padStart(2) +
    '  ' + item.arrows + flag
  );
}

console.log('\n=== 可疑重复 ===');
const flags = [];
for (let a = 0; a < info.length; a += 1) {
  for (let b = a + 1; b < info.length; b += 1) {
    const one = info[a];
    const two = info[b];
    const reasons = [];
    if (one.width === two.width && one.height === two.height) {
      const sim = jaccard(one.walls_set, two.walls_set);
      if (sim >= 0.7) reasons.push('墙体相似 ' + sim.toFixed(2));
    }
    if (one.path && one.path === two.path) reasons.push('解法完全相同 ' + one.arrows);
    if (one.rows.join('|') === two.rows.join('|')) reasons.push('布局完全相同');
    if (reasons.length) flags.push([one.index, two.index, reasons]);
  }
}
if (!flags.length) console.log('（没有）');
for (const [a, b, reasons] of flags) {
  console.log(String(a).padStart(2) + ' vs ' + String(b).padStart(2) + '  ' + info[a].title + ' / ' + info[b].title + '  ->  ' + reasons.join('；'));
}

console.log('\n=== 开局方向分布 ===');
const opening = new Map();
for (const item of info) {
  const key = item.steps[0] ? arrowFor(item.steps[0]) : '-';
  opening.set(key, (opening.get(key) ?? 0) + 1);
}
console.log([...opening.entries()].map(([k, v]) => k + ':' + v).join('  '));

console.log('\n=== 规模分布 ===');
const sizes = new Map();
for (const item of info) {
  const key = item.width + 'x' + item.height;
  sizes.set(key, (sizes.get(key) ?? 0) + 1);
}
console.log([...sizes.entries()].map(([k, v]) => k + ':' + v).join('  '));