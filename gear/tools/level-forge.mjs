// 关卡锻造：给定级数、齿轮池大小、目标角度，反查哪些齿轮池能让目标「解的数量」最少。
// 用途：手写关卡时挑齿轮池，保证目标可达、又有足够约束（不是随便摆摆就对）。
// 用法：node gear/tools/level-forge.mjs <级数> <池大小> [最少解数] [最多解数]
import { normalizeAngle, angleDistance, TOLERANCE } from '../src/gear-core.js';

const TEETH = [6, 9, 12, 15, 18, 24, 30, 36];
const stages = Number(process.argv[2] ?? 2);
const poolSize = Number(process.argv[3] ?? 4);
const minSolutions = Number(process.argv[4] ?? 1);
const maxSolutions = Number(process.argv[5] ?? 6);
const slots = stages * 2;

function pools(values, size, start = 0, current = [], out = []) {
  if (current.length === size) { out.push(current.slice()); return out; }
  for (let index = start; index < values.length; index += 1) {
    current.push(values[index]);
    pools(values, size, index, current, out);
    current.pop();
  }
  return out;
}

function angleCounts(pool) {
  const counts = new Map();
  const used = new Set();
  const chosen = [];
  const walk = (slot) => {
    if (slot >= slots) {
      let ratio = 1;
      for (let stage = 0; stage < stages; stage += 1) {
        ratio *= chosen[stage * 2 + 1] / chosen[stage * 2];
      }
      const angle = normalizeAngle(360 * ratio);
      const key = Math.round(angle * 1000) / 1000;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      return;
    }
    for (let index = 0; index < pool.length; index += 1) {
      if (used.has(index)) continue;
      used.add(index);
      chosen[slot] = pool[index];
      walk(slot + 1);
      used.delete(index);
    }
  };
  walk(0);
  return counts;
}

const found = new Map();
for (const pool of pools(TEETH, poolSize)) {
  const counts = angleCounts(pool);
  for (const [angle, count] of counts) {
    if (count < minSolutions || count > maxSolutions) continue;
    const snapped = Math.round(angle / 15) * 15;
    if (angleDistance(angle, snapped) > TOLERANCE) continue;
    const list = found.get(snapped) ?? [];
    list.push({ pool: pool.slice(), count });
    found.set(snapped, list);
  }
}

console.log(`级数 ${stages}（${slots} 槽）· 齿轮池 ${poolSize} 个 · 解数 ${minSolutions}~${maxSolutions}`);
console.log(`齿数可选：${TEETH.join('/')}\n`);
for (const angle of [...found.keys()].sort((a, b) => a - b)) {
  const list = found.get(angle).sort((a, b) => a.count - b.count).slice(0, 3);
  console.log(`${String(angle).padStart(3)}°  ` + list.map((item) => `[${item.pool.join('/')}]×${item.count}`).join('   '));
}
if (!found.size) console.log('（没有满足条件的齿轮池，放宽解数区间或改齿数集）');