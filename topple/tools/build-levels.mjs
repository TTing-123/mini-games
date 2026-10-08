// 由结构文件 + 目标格生成 levels.js（一次性脚本，放在 .scratch 里）
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const scratch = new URL('./structures/', import.meta.url).pathname.replace(/^\//, '');
const l00 = [
  '.........',
  '.G#......',
  '..#......',
  '..#......',
  '.T#......'
];

const table = [
  ['l00', [4, 1], '拆一根', '金块横挂在柱子上：断掉旁边那块，它就落下来', '吊钩', 1, true],
  ['b01', [4, 1], '剪两边', '两边都撑着，得两边都断', '双撑', 2],
  ['h02', [4, 1], '先清路', '下面横着一块，先把它拆掉', '吊钩', 2],
  ['c02', [4, 1], '落上台阶', '整根横梁一起落，落点看它下面最高的那格', '宽梁', 2],
  ['d01', [4, 1], '两级', '一层一层剥', '台阶', 2],
  ['j03', [5, 1], '双柱', '两根柱子顶着横梁', '宽梁', 2],
  ['h03', [5, 1], '高柱', '先剥掉上面的支撑，再让整根柱子落到底', '台阶', 3],
  ['b03', [2, 1], '长吊', '两边撑着，位置还不一样高', '双撑', 2],
  ['j10', [5, 1], '三支点', '三个支点，最高的那个说了算', '宽梁', 2],
  ['g01', [4, 1], '长臂', '梁伸得越长，要看的地方越多', '宽梁', 2],
  ['f03', [5, 1], '三级', '每一级都会接住它一次', '台阶', 2],
  ['i03', [7, 1], '叠梁', '上下两层梁', '宽梁', 2],
  ['i02', [5, 1], '钢台', '钢砖嵌在台子里，整块平台会一起落', '钢砖', 2],
  ['i05', [6, 1], '钢夹层', '钢砖夹在结构里，落点会被它改写', '钢砖', 3],
  ['h04', [3, 1], '长梁吊钩', '金块挂在长梁的一头', '吊钩', 2],
  ['i08', [7, 1], '深台', '钢砖让横梁停在高处，最后一次才落到底', '宽梁', 2],
  ['b02', [5, 1], '深撑', '撑得更高，要拆的更多', '双撑', 3],
  ['j09', [6, 1], '钢柱梁', '有一根柱子是钢的', '钢砖', 3],
  ['d03', [6, 1], '四级', '一层一层剥到底', '台阶', 3],
  ['e01', [5, 1], '钢柱', '钢砖托着一整根柱子', '钢砖', 3],
  ['j14', [6, 1], '四柱梁', '四个支点，两高两低', '宽梁', 3],
  ['d02', [6, 1], '三级深', '一级一级往下落', '台阶', 3],
  ['j11', [5, 1], '双垫二', '两层垫块都会落', '宽梁', 3],
  ['k01', [6, 3], '借力', '先让金块落在活动架上，再拆掉架子的支点', '活动台', 2],
  ['e03', [4, 1], '钢夹', '钢砖夹住一段柱子', '钢砖', 3],
  ['i06', [8, 1], '双垫三', '上面落下来的会挡住下面', '宽梁', 3],
  ['j06', [5, 1], '钢柱二', '一根钢柱改变整个落点', '钢砖', 4],
  ['j12', [6, 1], '钢垫', '钢砖当垫子，只能绕开', '钢砖', 4],
  ['e04', [5, 1], '钢坠', '先松开两层钢架，最后让整座塔落下', '钢砖', 5],
  ['j04', [6, 1], '宽梁四', '四根柱子，留谁拆谁', '宽梁', 4],
  ['j05', [7, 1], '深柱', '两级台阶都要管', '宽梁', 4],
  ['i04', [7, 1], '长塔', '塔里有块钢砖', '钢砖', 4],
  ['i01', [7, 1], '终局·钢', '钢砖托着整根柱子，四块砖', '钢砖', 4],
  ['j13', [7, 1], '终局·塔', '五块砖，顺序错一次就拆不完', '钢砖', 5]
];

const out = [];
for (const [file, target, title, hint, concept, maxRemovals, tutorial] of table) {
  let rows;
  if (file === 'l00') rows = l00.slice();
  else {
    rows = readFileSync(resolve(scratch, file + '.txt'), 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
  }
  if (target) {
    const [row, col] = target;
    const line = rows[row];
    const char = line[col];
    if (char !== '.') {
      console.error(`⚠ ${title}: 目标格 (${row},${col}) 原本是「${char}」，不是空地`);
    }
    // 目标格不改动网格：它原本可能就是一块砖，玩家要先把它拆掉
  }
  out.push({
    title,
    hint,
    ...(tutorial ? { tutorial: true } : {}),
    concept,
    maxRemovals,
    target,
    rows
  });
}

const body = out.map((level) => {
  const lines = level.rows.map((line) => "      '" + line + "'").join(',\n');
  return `  {\n    title: '${level.title}',\n    hint: '${level.hint}',\n` +
    (level.tutorial ? '    tutorial: true,\n' : '') +
    `    concept: '${level.concept}',\n    maxRemovals: ${level.maxRemovals},\n    target: [${level.target[0]}, ${level.target[1]}],\n    rows: [\n${lines}\n    ]\n  }`;
}).join(',\n');

const head = `// TOPPLE 关卡数据。# 砖 · S 钢砖（拆不掉）· G 金块 · T 目标格 · . 空（最底下一行是地面）
// 结构手写，目标格由 tools/level-forge.mjs 反查（金块可达落点 + 所需次数 + 解条数）后锁定，
// 再经 tools/level-audit.mjs 复核：可解、起始不成立、布局与拆法都不重复、难度递增。

export const LEVELS = [
${body}
];
`;
writeFileSync(new URL('../src/levels.js', import.meta.url), head, 'utf8');
console.log(`生成 ${out.length} 关`);