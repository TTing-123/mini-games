// 关卡体检：最少拆除次数、最短解条数、开局分支数、钢砖数、难度分、概念分布，以及布局/解法查重。
// 用法：node topple/tools/level-audit.mjs
import { PUZZLES, createState, isWon, solve } from '../src/topple-core.js';

const rowsOf = (puzzle) => {
  const lines = [];
  for (let row = 0; row < puzzle.height; row += 1) {
    let line = '';
    for (let col = 0; col < puzzle.width; col += 1) {
      const key = row + ',' + col;
      if (puzzle.gold[0] === row && puzzle.gold[1] === col) line += 'G';
      else if (puzzle.steel.has(key)) line += 'S';
      else if (puzzle.blocks.has(key)) line += '#';
      else if (puzzle.target[0] === row && puzzle.target[1] === col) line += 'T';
      else line += '.';
    }
    lines.push(line);
  }
  return lines;
};

// 解法相对金块的偏移模式：用来抓「操作明显雷同」的关卡
const solveSignature = (puzzle, solution) => solution
  .map(([row, col]) => `${row - puzzle.gold[0]},${col - puzzle.gold[1]}`)
  .sort()
  .join(' ');

let problems = 0;
const layouts = new Map();
const solves = new Map();
const concepts = new Map();
const entries = [];

for (let index = 0; index < PUZZLES.length; index += 1) {
  const puzzle = PUZZLES[index];
  const state = createState(index);
  const started = isWon(state);
  const found = solve(state);
  const concept = puzzle.concept ?? '未标注';
  const difficulty = (found.removals ?? 0) * 2 + (found.count === 1 ? 2 : 0) + (puzzle.steel.size ? 1 : 0);
  concepts.set(concept, (concepts.get(concept) ?? 0) + 1);

  const flags = [];
  if (started) { flags.push('起始就达成'); problems += 1; }
  if (!found.solvable) { flags.push('无解'); problems += 1; }

  const layout = rowsOf(puzzle).join('|');
  if (layouts.has(layout)) { flags.push(`布局同第 ${layouts.get(layout)} 关`); problems += 1; }
  else layouts.set(layout, index);

  if (found.solvable) {
    const sig = solveSignature(puzzle, found.sequence);
    if (solves.has(sig)) { flags.push(`拆法同第 ${solves.get(sig)} 关`); problems += 1; }
    else solves.set(sig, index);
  }

  entries.push({ index, concept, removals: found.removals, count: found.count, difficulty });
  console.log(
    `${String(index).padStart(2)}  ${puzzle.title.padEnd(5, '　')} [${concept}]  ` +
    (found.solvable
      ? `最少 ${found.removals} 拆 · 解 ${found.count} 条 · 开局 ${found.firstMoves} 种 · 难度 ${difficulty}` +
        `${puzzle.steel.size ? ` · 钢砖 ${puzzle.steel.size}` : ''}`
      : '无解') +
    (flags.length ? `  ⚠ ${flags.join('；')}` : '')
  );
}

console.log('\n=== 概念分布 ===');
for (const [name, n] of [...concepts.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${name} × ${n}`);

console.log('\n=== 难度曲线 ===');
const tail = entries.slice(-3);
const head = entries.slice(0, 3);
console.log(`  前 3 关难度：${head.map((e) => e.difficulty).join(' / ')}`);
console.log(`  后 3 关难度：${tail.map((e) => e.difficulty).join(' / ')}`);
const worst = Math.max(...tail.map((e) => e.difficulty));
const others = Math.max(...entries.slice(0, -3).map((e) => e.difficulty));
if (worst < others) { console.log('  ⚠ 最后三关不是最难的'); problems += 1; }

console.log(`\n共 ${PUZZLES.length} 关，问题 ${problems} 处`);