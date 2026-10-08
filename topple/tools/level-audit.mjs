// 关卡体检：可解性、最少拆除次数、起始是否已经成立、拆除后的落点，以及布局查重。
// 用法：node topple/tools/level-audit.mjs
import { PUZZLES, createState, isWon, removeBlock, solve, resolve, canRemove } from '../src/topple-core.js';

let problems = 0;
const seen = new Map();

for (let index = 0; index < PUZZLES.length; index += 1) {
  const puzzle = PUZZLES[index];
  const state = createState(index);
  const started = isWon(state);
  const found = solve(state);
  const tag = started ? ' ← 起始就已达成' : (!found.solvable ? ' ← 无解' : '');
  if (started || !found.solvable) problems += 1;
  console.log(`${String(index).padStart(2)}  ${puzzle.title}  [${puzzle.width}×${puzzle.height} · 砖 ${puzzle.blocks.size} · 允许拆 ${puzzle.maxRemovals}]`);
  console.log(`    ${found.solvable ? `最少拆 ${found.removals} 块 · 顺序 ${found.sequence.map(([r, c]) => `(${r},${c})`).join(' → ')}` : '← 无解'}${tag}`);

  // 逐块试拆一次，看看会掉成什么（帮助设计难度）
  const options = [];
  for (const cell of [...state.blocks].sort()) {
    const [row, col] = cell.split(',').map(Number);
    if (!canRemove(state, row, col)) continue;
    const next = removeBlock(state, row, col);
    if (next === state) continue;
    const falls = next.lastFalls.length;
    const height = [...next.blocks].reduce((min, key) => Math.min(min, Number(key.split(',')[0])), 999);
    options.push(`拆(${row},${col})→金块到(${next.gold[0]},${next.gold[1]})${falls ? ` 塌${falls}坨` : ''}`);
  }
  console.log(`    一次拆除的结果：${options.slice(0, 6).join(' | ')}${options.length > 6 ? ' …' : ''}`);
}

console.log('\n=== 查重 ===');
for (let index = 0; index < PUZZLES.length; index += 1) {
  const puzzle = PUZZLES[index];
  const rows = [];
  for (let row = 0; row < puzzle.height; row += 1) {
    let line = '';
    for (let col = 0; col < puzzle.width; col += 1) {
      const key = row + ',' + col;
      if (puzzle.gold[0] === row && puzzle.gold[1] === col) line += 'G';
      else if (puzzle.blocks.has(key)) line += '#';
      else if (puzzle.target[0] === row && puzzle.target[1] === col) line += 'T';
      else line += '.';
    }
    rows.push(line);
  }
  const signature = rows.join('|');
  if (seen.has(signature)) { console.log(`  ${index} 与第 ${seen.get(signature)} 关布局完全相同`); problems += 1; }
  else seen.set(signature, index);
}

console.log(`\n共 ${PUZZLES.length} 关，问题 ${problems} 处`);