// 关卡体检：测算每关落在刻度上的可达角度与解的数量，供挑选目标；同时查重。
// 用法：node gear/tools/level-audit.mjs
import { PUZZLES, createState, trainResult, searchSolutions, normalizeAngle, angleDistance, TOLERANCE } from '../src/gear-core.js';

function histogram(index) {
  const puzzle = PUZZLES[index];
  const counts = new Map();
  const used = new Set();
  const slots = Array.from({ length: puzzle.slots }, () => null);
  let total = 0;
  const walk = (slot) => {
    if (slot >= puzzle.slots) {
      total += 1;
      const result = trainResult({ puzzleIndex: index, slots: slots.slice() });
      const angle = normalizeAngle(result.angle);
      const key = Math.round(angle * 1000) / 1000;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      return;
    }
    for (let part = 0; part < puzzle.parts.length; part += 1) {
      if (used.has(part)) continue;
      used.add(part);
      slots[slot] = part;
      walk(slot + 1);
      slots[slot] = null;
      used.delete(part);
    }
  };
  walk(0);
  return { counts, total };
}

let problem = 0;
for (let index = 0; index < PUZZLES.length; index += 1) {
  const puzzle = PUZZLES[index];
  const { counts, total } = histogram(index);
  const onGrid = [...counts.entries()]
    .filter(([angle]) => angleDistance(angle, Math.round(angle / 15) * 15) <= TOLERANCE)
    .map(([angle, n]) => ({ angle: Math.round(angle), n }))
    .sort((a, b) => a.n - b.n || a.angle - b.angle);
  const solved = searchSolutions(createState(index));
  const hit = onGrid.some((item) => item.angle === puzzle.targetAngle);
  if (!hit) problem += 1;
  console.log(`${String(index).padStart(2)}  ${puzzle.title}  [${puzzle.stages} 级 · ${puzzle.slots} 槽 · 齿轮 ${puzzle.parts.join('/')}]`);
  console.log(`    目标 ${puzzle.targetAngle}°  ${hit ? '解 ' + solved.count + ' 种' : '← 目标不可达'}   总装配 ${total} 种`);
  console.log(`    可选目标（角度×解数）：${onGrid.map((item) => item.angle + '°×' + item.n).join('  ') || '（没有任何角度落在刻度上）'}`);
}

console.log('\n=== 查重 ===');
const seen = new Map();
let dup = 0;
for (const puzzle of PUZZLES) {
  const key = puzzle.stages + '|' + puzzle.parts.slice().sort((a, b) => a - b).join(',') + '|' + puzzle.targetAngle;
  if (seen.has(key)) { console.log(`  ${puzzle.index} 与 ${seen.get(key)} 配置完全相同`); dup += 1; }
  else seen.set(key, puzzle.index);
}
console.log(dup ? `  发现 ${dup} 组重复` : '  （没有）');
console.log(`\n共 ${PUZZLES.length} 关，目标不可达 ${problem} 关`);