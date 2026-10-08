// 多方块关卡锻造：地形里手画好墙(#)、凹槽(o)，脚本穷举"方块起点组合"，
// 挑出最短解最长的那几组，直接生成可以贴进 levels.js 的关卡。
// 用法：node tilt/tools/level-forge2.mjs <地形目录> <方块数> [最少步数] [每个地形的候选数]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { solve, FLOOR, WALL, HOLE } from '../src/tilt-core.js';

const dir = process.argv[2];
const blockCount = Number(process.argv[3] ?? 2);
const minMoves = Number(process.argv[4] ?? 4);
const top = Number(process.argv[5] ?? 1);
const colorsArg = process.argv[6];
const colorList = colorsArg ? colorsArg.split(',').map((value) => Number(value) || 0) : null;
if (!dir) {
  console.error('用法：node tilt/tools/level-forge2.mjs <地形目录> <方块数> [最少步数] [候选数] [颜色列表]');
  process.exit(2);
}

function parse(rows) {
  const height = rows.length;
  const width = Math.max(...rows.map((line) => line.length));
  const terrain = [];
  const holeColors = [];
  const floors = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    const colors = [];
    for (let col = 0; col < width; col += 1) {
      const char = rows[row][col] ?? '#';
      if (char === '#') { line.push(WALL); colors.push(0); }
      else if (char === 'o' || char === 'A' || char === 'B' || char === 'C') {
        line.push(HOLE);
        colors.push(char === 'o' ? 0 : { A: 1, B: 2, C: 3 }[char]);
      } else { line.push(FLOOR); colors.push(0); if (char === '.') floors.push([row, col]); }
    }
    terrain.push(line);
    holeColors.push(colors);
  }
  return { width, height, terrain, holeColors, floors };
}

function combinations(list, size, limit) {
  const out = [];
  const pick = (start, current) => {
    if (out.length >= limit) return;
    if (current.length === size) { out.push(current.slice()); return; }
    for (let index = start; index < list.length; index += 1) {
      current.push(list[index]);
      pick(index + 1, current);
      current.pop();
      if (out.length >= limit) return;
    }
  };
  pick(0, []);
  return out;
}

const files = readdirSync(dir).filter((name) => name.endsWith('.txt')).sort();
for (const name of files) {
  const rows = readFileSync(join(dir, name), 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
  const base = parse(rows);
  const limit = blockCount <= 2 ? 100000 : 4000;
  const combos = combinations(base.floors, blockCount, limit);
  const found = [];
  for (const combo of combos) {
    const sorted = combo.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const state = {
      ...base,
      blocks: sorted.map((spot) => spot.slice()),
      // --colors 1,2 表示按 (行,列) 排序后依次上色，用来搜『哪几个位置放红块、哪几个放蓝块』
      blockColors: colorList ? sorted.map((_, index) => colorList[index] ?? 0) : sorted.map(() => 0),
      won: false
    };
    const path = solve(state, 120000);
    if (!path || path.length < minMoves) continue;
    found.push({ moves: path.length, combo, path });
  }
  found.sort((a, b) => b.moves - a.moves);
  // 按解法去重：同一个方向序列只留一条，逼出真正不同的走法
  const distinct = [];
  const seenPath = new Set();
  for (const item of found) {
    const key = item.path.join('');
    if (seenPath.has(key)) continue;
    seenPath.add(key);
    distinct.push(item);
  }
  if (!found.length) {
    console.log('--- ' + name + ': 没有超过 ' + minMoves + ' 步的组合 ---');
    continue;
  }
  console.log('--- ' + name + '  候选 ' + found.length + ' 组，不同解法 ' + distinct.length + ' 条，最长 ' + found[0].moves + ' 步 ---');
  for (const item of distinct.slice(0, top)) {
    const sorted = item.combo.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const startChars = new Map();
    sorted.forEach((spot, index) => {
      const color = colorList ? (colorList[index] ?? 0) : 0;
      startChars.set(spot[0] + ',' + spot[1], color ? 'abcd'[color - 1] : 'x');
    });
    const out = rows.map((line, row) => [...line].map((char, col) => {
      const mark = startChars.get(row + ',' + col);
      return mark ?? char;
    }).join(''));
    console.log('    最短 ' + item.moves + ' 步  解法 ' + item.path.join('') + '  起点 ' + JSON.stringify(item.combo) + (colorList ? '  颜色 ' + colorList.join('/') : ''));
    console.log('    rows: [');
    for (const line of out) console.log("      '" + line + "',");
    console.log('    ]');
  }
}