// 关卡体检：逐关跑 BFS，报告是否可解、最短步数、解法方向、搜索规模。
// 用法：node tilt/tools/level-report.mjs [起始关] [结束关]
import { PUZZLES, createState, solve, arrowFor } from '../src/tilt-core.js';

const from = Number(process.argv[2] ?? 0);
const to = Number(process.argv[3] ?? PUZZLES.length - 1);

let bad = 0;
for (let index = from; index <= to; index += 1) {
  const puzzle = PUZZLES[index];
  if (!puzzle) continue;
  const started = Date.now();
  const path = solve(createState(index));
  const ms = Date.now() - started;
  const blocks = puzzle.blocks.length;
  const holes = puzzle.terrain.flat().filter((cell) => cell === 2).length;
  if (!path) {
    bad += 1;
    console.log(String(index).padStart(2) + '  ' + puzzle.title + '  [' + puzzle.width + 'x' + puzzle.height + ' 方块' + blocks + ' 凹槽' + holes + ']  不可解  ' + ms + 'ms');
    continue;
  }
  const arrows = path.map(arrowFor).join(' ');
  console.log(String(index).padStart(2) + '  ' + puzzle.title + '  [' + puzzle.width + 'x' + puzzle.height + ' 方块' + blocks + ' 凹槽' + holes + ']  最短 ' + String(path.length).padStart(2) + ' 步  ' + arrows + '  ' + ms + 'ms');
}
console.log('\n共 ' + (to - from + 1) + ' 关，不可解 ' + bad + ' 关');