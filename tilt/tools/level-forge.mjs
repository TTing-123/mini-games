// 单方块关卡锻造：输入只含墙(#)和地面(.)的手绘地形，
// 穷举 (起点, 凹槽) 组合，按解法去重，输出不同的走法候选。
// 用法：node tilt/tools/level-forge.mjs <地形目录> [最少步数] [每个地形的候选数]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tilt, DIRECTIONS, FLOOR, WALL, HOLE } from '../src/tilt-core.js';

const dir = process.argv[2];
const minMoves = Number(process.argv[3] ?? 3);
const top = Number(process.argv[4] ?? 2);
if (!dir) {
  console.error('用法：node tilt/tools/level-forge.mjs <地形目录> [最少步数] [候选数]');
  process.exit(2);
}

function parse(rows) {
  const height = rows.length;
  const width = Math.max(...rows.map((line) => line.length));
  const terrain = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    for (let col = 0; col < width; col += 1) {
      line.push((rows[row][col] ?? '#') === '#' ? WALL : FLOOR);
    }
    terrain.push(line);
  }
  return { width, height, terrain };
}

function walk(base, start) {
  const state = { ...base, blocks: [start], blockColors: [0], holeColors: base.holeColors, won: false };
  const dist = new Map([[start[0] * base.width + start[1], { moves: 0, path: [] }]]);
  let frontier = [state];
  while (frontier.length) {
    const next = [];
    for (const current of frontier) {
      const here = current.blocks[0];
      const record = dist.get(here[0] * base.width + here[1]);
      for (const direction of DIRECTIONS) {
        const moved = tilt(current, direction);
        const spot = moved.blocks[0];
        if (!spot || (spot[0] === here[0] && spot[1] === here[1])) continue;
        const key = spot[0] * base.width + spot[1];
        if (dist.has(key)) continue;
        dist.set(key, { moves: record.moves + 1, path: record.path.concat([direction]) });
        next.push({ ...current, blocks: [spot] });
      }
    }
    frontier = next;
  }
  return dist;
}

const files = readdirSync(dir).filter((name) => name.endsWith('.txt')).sort();
for (const name of files) {
  const rows = readFileSync(join(dir, name), 'utf8').split(/\r?\n/).filter((line) => line.trim() !== '');
  const base = parse(rows);
  base.holeColors = Array.from({ length: base.height }, () => Array.from({ length: base.width }, () => 0));
  const found = [];
  for (let row = 1; row < base.height - 1; row += 1) {
    for (let col = 1; col < base.width - 1; col += 1) {
      if (base.terrain[row][col] === WALL) continue;
      const start = [row, col];
      for (const [key, record] of walk(base, start)) {
        if (record.moves < minMoves) continue;
        const hole = [Math.floor(key / base.width), key % base.width];
        if (hole[0] === row && hole[1] === col) continue;
        found.push({ moves: record.moves, start, hole, path: record.path });
      }
    }
  }
  found.sort((a, b) => b.moves - a.moves);
  const distinct = [];
  const seen = new Set();
  for (const item of found) {
    const key = item.path.join('');
    if (seen.has(key)) continue;
    seen.add(key);
    distinct.push(item);
  }
  if (!distinct.length) {
    console.log('--- ' + name + ': 没有超过 ' + minMoves + ' 步的组合 ---');
    continue;
  }
  console.log('--- ' + name + '  不同解法 ' + distinct.length + ' 条，最长 ' + distinct[0].moves + ' 步 ---');
  for (const item of distinct.slice(0, top)) {
    const out = rows.map((line, row) => [...line].map((char, col) => {
      if (row === item.start[0] && col === item.start[1]) return 'x';
      if (row === item.hole[0] && col === item.hole[1]) return 'o';
      return char;
    }).join(''));
    console.log('    最短 ' + item.moves + ' 步  解法 ' + item.path.join('') + '  起点 ' + JSON.stringify(item.start) + ' 凹槽 ' + JSON.stringify(item.hole));
    console.log('    rows: [');
    for (const line of out) console.log("      '" + line + "',");
    console.log('    ]');
  }
}