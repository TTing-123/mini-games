// 把关卡数据改写成「开局就稳定」的状态：结构没接地的那部分本来就会先塌一次，
// 与其让玩家开局看到塌了一半，不如直接以塌完的状态作为关卡起点（玩法与解不变）。
import { PUZZLES, createState } from '../src/topple-core.js';
import { writeFileSync } from 'node:fs';

const rowsOf = (state, puzzle) => {
  const lines = [];
  for (let row = 0; row < puzzle.height; row += 1) {
    let line = '';
    for (let col = 0; col < puzzle.width; col += 1) {
      const key = row + ',' + col;
      if (state.gold[0] === row && state.gold[1] === col) line += 'G';
      else if (state.steel.has(key)) line += 'S';
      else if (state.blocks.has(key)) line += '#';
      else line += '.';
    }
    lines.push(line);
  }
  return lines;
};

const body = PUZZLES.map((puzzle, index) => {
  const state = createState(index);
  const rows = rowsOf(state, puzzle);
  const lines = rows.map((line) => "      '" + line + "'").join(',\n');
  return `  {\n    title: '${puzzle.title}',\n    hint: '${puzzle.hint}',\n` +
    (puzzle.tutorial ? '    tutorial: true,\n' : '') +
    `    concept: '${puzzle.concept}',\n    maxRemovals: ${puzzle.maxRemovals},\n` +
    `    target: [${puzzle.target[0]}, ${puzzle.target[1]}],\n    rows: [\n${lines}\n    ]\n  }`;
}).join(',\n');

const head = `// TOPPLE 关卡数据。# 砖 · S 钢砖（拆不掉）· G 金块 · . 空（最底下一行是地面）
// 结构手写，目标格由 tools/level-forge.mjs 反查（金块可达落点 + 所需次数 + 解条数）后锁定，
// 经 tools/level-audit.mjs 复核：可解、起始稳定且未达成、布局与拆法都不重复、难度递增。
// 目标格用 target 字段单独给：那一格原本可能就是一块砖（玩家要先拆掉它）。

export const LEVELS = [
${body}
];
`;
writeFileSync(new URL('../src/levels.js', import.meta.url), head, 'utf8');
console.log(`已改写 ${PUZZLES.length} 关的初始状态`);