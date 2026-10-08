// 关卡体检：最少疫苗数、每人余量（slack）、投放点会不会被吞、墙体查重。
// slack = 病毒到达回合 - 免疫到达回合 - 1；0 表示必须第一回合就投这一针。
// 用法：node immune/tools/level-audit.mjs
import { PUZZLES, createState, solve } from '../src/immune-core.js';

const NEIGHBORS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const key = (r, c) => r + ',' + c;

function distances(puzzle, from) {
  const dist = new Map([[key(from[0], from[1]), 0]]);
  const queue = [from];
  while (queue.length) {
    const [row, col] = queue.shift();
    const base = dist.get(key(row, col));
    for (const [dr, dc] of NEIGHBORS) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= puzzle.height || c < 0 || c >= puzzle.width) continue;
      if (puzzle.terrain[r][c] === 1) continue;
      if (dist.has(key(r, c))) continue;
      dist.set(key(r, c), base + 1);
      queue.push([r, c]);
    }
  }
  return dist;
}

const seen = new Map();
let problems = 0;

for (let index = 0; index < PUZZLES.length; index += 1) {
  const puzzle = PUZZLES[index];
  const found = solve(createState(index));
  const virusDist = puzzle.viruses.map((virus) => distances(puzzle, virus));
  const dropDist = puzzle.drops.map((drop) => distances(puzzle, drop));
  const dropLife = puzzle.drops.map((drop, i) =>
    Math.min(...virusDist.map((map) => map.get(key(drop[0], drop[1])) ?? Infinity)));

  console.log(`${String(index).padStart(2)}  ${puzzle.title}  [${puzzle.width}×${puzzle.height} · 病毒 ${puzzle.viruses.length} · 人 ${puzzle.persons.length} · 投放点 ${puzzle.drops.length}]`);
  console.log(found.solvable
    ? `    ${`最少 ${found.vaccines} 针`} · 解法 ${found.sequence.map((d) => `(${d[0]},${d[1]})`).join(' → ')}`
    : '    ← 无解');

  puzzle.persons.forEach(([row, col], personIndex) => {
    const dv = Math.min(...virusDist.map((map) => map.get(key(row, col)) ?? Infinity));
    const parts = puzzle.drops.map((drop, dropIndex) => {
      const dd = dropDist[dropIndex].get(key(row, col));
      const slack = dd === undefined || dd >= dv ? null : dv - dd - 1;
      return `(${drop[0]},${drop[1]}) 距离${dd ?? '∞'} 余量${slack ?? '—'}`;
    });
    console.log(`    人${personIndex + 1}(${row},${col}) 病毒最快 ${dv} 回合 → ${parts.join(' | ')}`);
  });

  const eaten = puzzle.drops.filter((_, i) => dropLife[i] <= 2);
  if (eaten.length) console.log(`    ≤2 回合内会被吞的投放点：${eaten.map((d) => `(${d[0]},${d[1]})`).join(' ')}`);

  const mark = (row, col) => {
    if (puzzle.persons.some(([r, c]) => r === row && c === col)) return 'P';
    if (puzzle.viruses.some(([r, c]) => r === row && c === col)) return 'V';
    if (puzzle.drops.some(([r, c]) => r === row && c === col)) return 'D';
    return puzzle.terrain[row][col] === 1 ? '#' : '.';
  };
  const signature = puzzle.terrain.map((line, row) => line.map((_, col) => mark(row, col)).join('')).join('|');
  if (seen.has(signature)) { console.log(`    ⚠ 墙体与第 ${seen.get(signature)} 关完全相同`); problems += 1; }
  else seen.set(signature, index);
  if (!found.solvable) problems += 1;
}

console.log(`\n共 ${PUZZLES.length} 关，无解或墙体重复 ${problems} 处`);