// WEAVE 关卡体检：链条、释义、空白、字池、可解性、重复与难度曲线。
// 用法：node weave/tools/level-audit.mjs
import { PUZZLES, createState, isSolved, placeTile } from '../src/weave-core.js';

let problems = 0;
const signatures = new Map();
const rows = [];

for (let index = 0; index < PUZZLES.length; index += 1) {
  const puzzle = PUZZLES[index];
  const flags = [];
  if (puzzle.mask.length !== puzzle.solution.length || puzzle.cells.length !== puzzle.solution.length) {
    flags.push('遮罩 / 格子长度错误');
    problems += 1;
  }

  for (const entry of puzzle.entries) {
    const actual = entry.cells.map((position) => puzzle.solution[position]).join('');
    if (actual !== entry.answer) { flags.push(`${entry.answer} 的实际格子不匹配`); problems += 1; }
  }

  const lines = new Map();
  for (const entry of puzzle.entries) {
    if (!lines.has(entry.line)) lines.set(entry.line, []);
    lines.get(entry.line).push(entry);
  }
  for (const entries of lines.values()) {
    for (let i = 0; i < entries.length - 1; i += 1) {
      const current = entries[i];
      const next = entries[i + 1];
      if (current.answer.at(-1) !== next.answer[0]) {
        flags.push(`${current.answer} 不接 ${next.answer}`);
        problems += 1;
      }
      if (current.cells.at(-1) !== next.cells[0]) {
        flags.push(`${current.answer} 与 ${next.answer} 没有共享同一格`);
        problems += 1;
      }
    }
  }

  const levelAnswers = new Set();
  const levelClues = new Set();
  for (const entry of puzzle.entries) {
    if ([...entry.answer].length < 4 || [...entry.answer].length > 8) { flags.push(`${entry.answer} 长度不在 4-8 个字`); problems += 1; }
    if (!entry.clue) { flags.push(`${entry.answer} 缺释义`); problems += 1; }
    if (levelAnswers.has(entry.answer)) { flags.push(`本关重复词句 ${entry.answer}`); problems += 1; }
    else levelAnswers.add(entry.answer);
    if (levelClues.has(entry.clue)) { flags.push(`本关重复释义 ${entry.clue}`); problems += 1; }
    else levelClues.add(entry.clue);
  }

  const required = puzzle.blanks.map((position) => puzzle.solution[position]);
  const available = puzzle.bank.slice();
  for (const char of required) {
    const at = available.indexOf(char);
    if (at === -1) { flags.push(`字池缺少「${char}」`); problems += 1; break; }
    available.splice(at, 1);
  }

  const entryShows = puzzle.entries.map((entry) => entry.cells.some((position) => !puzzle.blanks.includes(position)));
  if (entryShows.some((shown) => !shown)) { flags.push('有词句整条都是空白'); problems += 1; }

  let state = createState(index);
  for (const position of puzzle.blanks) {
    const wanted = puzzle.solution[position];
    const tile = state.tiles.find((item) => item.at === null && item.char === wanted);
    if (!tile) { flags.push(`缺口 ${position} 无字可放`); problems += 1; break; }
    state = placeTile(state, tile.tileId, position);
  }
  if (!isSolved(state)) { flags.push('无法通过放置全部正字完成'); problems += 1; }

  const type = puzzle.kind === 'net' ? '织网' : puzzle.kind === 'cross' ? '交叉' : '长链';
  const signature = type + ':' + puzzle.entries.map((entry) => entry.answer).join('>');
  if (signatures.has(signature)) { flags.push(`与第 ${signatures.get(signature)} 关布局和答案重复`); problems += 1; }
  else signatures.set(signature, index);

  const blankCount = puzzle.blanks.length;
  const decoyCount = puzzle.bank.length - blankCount;
  const difficulty = blankCount + decoyCount + (puzzle.kind === 'net' ? 4 : puzzle.kind === 'cross' ? 2 : 0);
  rows.push({ index, title: puzzle.title, blanks: blankCount, decoys: decoyCount, difficulty });
  console.log(
    `${String(index).padStart(2)}  ${puzzle.title.padEnd(6, '　')}  ` +
    `${type} · 词句 ${puzzle.entries.length} · 空缺 ${blankCount} · 干扰 ${decoyCount} · 难度 ${difficulty}` +
    (flags.length ? `  ⚠ ${flags.join('；')}` : '')
  );
}

console.log('\n=== 难度曲线 ===');
console.log(`  前 3 关：${rows.slice(0, 3).map((row) => row.difficulty).join(' / ')}`);
console.log(`  后 3 关：${rows.slice(-3).map((row) => row.difficulty).join(' / ')}`);
const tail = Math.min(...rows.slice(-3).map((row) => row.difficulty));
const body = Math.max(...rows.slice(0, -3).map((row) => row.difficulty));
if (tail < body) { console.log('  ⚠ 最后三关不是最高难度档'); problems += 1; }

console.log(`\n共 ${PUZZLES.length} 关，问题 ${problems} 处`);