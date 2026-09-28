// PRISM 核心逻辑：光路追踪 + 颜色叠加，纯几何，不碰 DOM，可在 Node 里直接跑。
//
// 规则：
//   1. 白光射进棱镜会被拆成红、绿、蓝三束，各自偏一点角度散开
//   2. 镜子把光反射过去
//   3. 目标要点亮，需要照到它的光「刚好」是它要的颜色
//      —— 多一点少一点都不算：红+绿同时照到黄色目标才算，只照到红不行
//
// 所有光路每次状态变化就整体重算，所以拖镜子的过程中结果是实时可见的。

export const WIDTH = 1280;
export const HEIGHT = 720;

export const RED = 1;
export const GREEN = 2;
export const BLUE = 4;
export const WHITE = RED | GREEN | BLUE;

const CHANNELS = [
  { mask: RED, spread: -0.105 },
  { mask: GREEN, spread: 0 },
  { mask: BLUE, spread: 0.105 }
];

const MAX_BOUNCES = 16;
const EPS = 1e-4;

export const LEVELS = [
  {
    name: 'LEVEL 1',
    hint: '把红光和蓝光引到同色目标上 · 轻点镜子翻面',
    source: { x: 150, y: 360, angle: 0 },
    prism: { x: 430, y: 360, radius: 36 },
    mirrors: [
      { x: 620, y: 620, slant: '/' },
      { x: 620, y: 130, slant: '/' }
    ],
    walls: [],
    targets: [
      { x: 1070, y: 360, color: GREEN, radius: 26 },
      { x: 1070, y: 170, color: RED, radius: 26 },
      { x: 1070, y: 550, color: BLUE, radius: 26 }
    ]
  },
  {
    name: 'LEVEL 2',
    hint: '一束光能连续穿过两个目标',
    source: { x: 150, y: 360, angle: 0 },
    prism: { x: 430, y: 360, radius: 36 },
    mirrors: [
      { x: 620, y: 620, slant: '/' }
    ],
    walls: [],
    targets: [
      { x: 1000, y: 250, color: GREEN, radius: 24 },
      { x: 1000, y: 120, color: GREEN, radius: 24 }
    ]
  },
  {
    name: 'LEVEL 3',
    hint: '两个颜色同时照到，才算对上',
    source: { x: 150, y: 360, angle: 0 },
    prism: { x: 430, y: 360, radius: 36 },
    mirrors: [
      { x: 620, y: 620, slant: '/' }
    ],
    walls: [],
    targets: [
      { x: 1070, y: 360, color: RED | GREEN, radius: 30 }
    ]
  },
  {
    name: 'LEVEL 4',
    hint: '墙过不去，就绕过去',
    source: { x: 150, y: 360, angle: 0 },
    prism: { x: 430, y: 360, radius: 36 },
    mirrors: [
      { x: 620, y: 620, slant: '/' },
      { x: 400, y: 120, slant: '/' }
    ],
    walls: [
      { x1: 900, y1: 300, x2: 900, y2: 560 }
    ],
    targets: [
      { x: 1150, y: 150, color: GREEN, radius: 26 }
    ]
  }
];

export const SCENE = LEVELS[0];

export const MIRROR_HALF = 44;

/* ---------------- 基础几何 ---------------- */

const cross = (ax, ay, bx, by) => ax * by - ay * bx;

// 射线与线段求交，返回沿射线的距离（无交点返回 null）
export function raySegmentT(origin, dir, a, b) {
  const ex = b.x - a.x;
  const ey = b.y - a.y;
  const denom = cross(dir.x, dir.y, ex, ey);
  if (Math.abs(denom) < 1e-9) return null;
  const ox = a.x - origin.x;
  const oy = a.y - origin.y;
  const t = cross(ox, oy, ex, ey) / denom;
  const u = cross(ox, oy, dir.x, dir.y) / denom;
  if (t > EPS && u >= 0 && u <= 1) return t;
  return null;
}

// 射线与圆求交，返回最近的正距离
export function rayCircleT(origin, dir, cx, cy, radius) {
  const ox = origin.x - cx;
  const oy = origin.y - cy;
  const b = ox * dir.x + oy * dir.y;
  const c = ox * ox + oy * oy - radius * radius;
  const disc = b * b - c;
  if (disc < 0) return null;
  const root = Math.sqrt(disc);
  const first = -b - root;
  if (first > EPS) return first;
  const second = -b + root;
  return second > EPS ? second : null;
}

export function reflect(dir, normal) {
  const dot = dir.x * normal.x + dir.y * normal.y;
  return { x: dir.x - 2 * dot * normal.x, y: dir.y - 2 * dot * normal.y };
}

export function rotate(dir, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: dir.x * cos - dir.y * sin, y: dir.x * sin + dir.y * cos };
}

export function mirrorEndpoints(mirror) {
  const half = MIRROR_HALF;
  const dx = Math.SQRT1_2 * half;
  const dy = Math.SQRT1_2 * half;
  // 屏幕坐标 y 向下：'/' 从左下到右上，'\' 从左上到右下
  return mirror.slant === '/'
    ? [{ x: mirror.x - dx, y: mirror.y + dy }, { x: mirror.x + dx, y: mirror.y - dy }]
    : [{ x: mirror.x - dx, y: mirror.y - dy }, { x: mirror.x + dx, y: mirror.y + dy }];
}

export function mirrorNormal(mirror) {
  const [a, b] = mirrorEndpoints(mirror);
  const ex = b.x - a.x;
  const ey = b.y - a.y;
  const length = Math.hypot(ex, ey) || 1;
  return { x: -ey / length, y: ex / length };
}

/* ---------------- 颜色 ---------------- */

export function colorKey(mask) {
  if (mask === WHITE) return 'white';
  if (mask === RED) return 'red';
  if (mask === GREEN) return 'green';
  if (mask === BLUE) return 'blue';
  if (mask === (RED | GREEN)) return 'yellow';
  if (mask === (GREEN | BLUE)) return 'cyan';
  if (mask === (RED | BLUE)) return 'magenta';
  return 'off';
}

export const COLOR_RGB = {
  white: [255, 255, 255],
  red: [255, 90, 82],
  green: [90, 235, 140],
  blue: [95, 170, 255],
  yellow: [255, 226, 110],
  cyan: [120, 240, 235],
  magenta: [240, 120, 245],
  off: [110, 140, 150]
};

/* ---------------- 场景与追踪 ---------------- */

export class PrismCore {
  constructor(scene = SCENE) {
    this.events = [];
    this.state = null;
    this.levelIndex = 0;
    this.levels = LEVELS;
    this.load(scene);
  }

  get levelCount() {
    return this.levels.length;
  }

  loadLevel(index) {
    const clamped = Math.max(0, Math.min(this.levels.length - 1, index));
    this.levelIndex = clamped;
    this.load(this.levels[clamped]);
    this.queue('levelLoaded', { index: clamped, label: this.state.name });
  }

  nextLevel() {
    if (this.levelIndex >= this.levels.length - 1) return false;
    this.loadLevel(this.levelIndex + 1);
    return true;
  }

  isLastLevel() {
    return this.levelIndex >= this.levels.length - 1;
  }

  restart() {
    this.loadLevel(this.levelIndex);
  }

  load(scene = SCENE) {
    this.state = {
      name: scene.name,
      source: { ...scene.source },
      prism: { ...scene.prism },
      mirrors: scene.mirrors.map((mirror) => ({ ...mirror })),
      walls: (scene.walls ?? []).map((wall) => ({ ...wall })),
      hint: scene.hint ?? '',
      targets: scene.targets.map((target) => ({ ...target, hit: 0 })),
      beams: [],
      dragging: null
    };
    this.retrace();
  }

  queue(type, data = {}) {
    this.events.push(type === undefined ? {} : { type, ...data });
  }

  consumeEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  /* ---- 交互 ---- */

  mirrorAt(x, y, slack = 34) {
    let best = null;
    for (let i = 0; i < this.state.mirrors.length; i += 1) {
      const mirror = this.state.mirrors[i];
      const distance = Math.hypot(mirror.x - x, mirror.y - y);
      if (distance <= MIRROR_HALF + slack && (!best || distance < best.distance)) best = { index: i, distance };
    }
    return best ? best.index : null;
  }

  moveMirror(index, x, y) {
    const mirror = this.state.mirrors[index];
    if (!mirror) return false;
    mirror.x = Math.max(60, Math.min(WIDTH - 60, x));
    mirror.y = Math.max(60, Math.min(HEIGHT - 60, y));
    this.retrace();
    this.queue('moved', { index, x: mirror.x, y: mirror.y });
    return true;
  }

  toggleMirror(index) {
    const mirror = this.state.mirrors[index];
    if (!mirror) return false;
    mirror.slant = mirror.slant === '/' ? '\\' : '/';
    this.retrace();
    this.queue('toggled', { index, slant: mirror.slant });
    return true;
  }

  /* ---- 状态查询 ---- */

  isLit(index) {
    const target = this.state.targets[index];
    return target ? target.hit === target.color : false;
  }

  litCount() {
    return this.state.targets.filter((_, index) => this.isLit(index)).length;
  }

  solved() {
    return this.litCount() === this.state.targets.length;
  }

  /* ---- 光路追踪 ---- */

  retrace() {
    const state = this.state;
    for (const target of state.targets) target.hit = 0;
    const beams = [];
    const start = {
      x: state.source.x + Math.cos(state.source.angle) * 18,
      y: state.source.y + Math.sin(state.source.angle) * 18
    };
    const dir = { x: Math.cos(state.source.angle), y: Math.sin(state.source.angle) };
    this.trace(start, dir, WHITE, 0, beams, -1);
    state.beams = beams;
    if (this.solved()) this.queue('solved', {});
  }

  trace(origin, dir, color, depth, beams, ignoreMirror) {
    if (depth > MAX_BOUNCES || color === 0) return;

    const hit = this.nearestHit(origin, dir, ignoreMirror);
    const end = hit ? hit.point : this.boundaryPoint(origin, dir);
    beams.push({ x1: origin.x, y1: origin.y, x2: end.x, y2: end.y, color });

    if (!hit) return;
    const { point, normal } = hit;

    if (hit.type === 'mirror') {
      const bounced = reflect(dir, normal);
      this.trace(point, bounced, color, depth + 1, beams, hit.index);
      return;
    }

    if (hit.type === 'prism') {
      // 复合光进棱镜会被拆成三束；单色光只是穿过去
      if (color === RED || color === GREEN || color === BLUE) {
        this.trace(point, dir, color, depth + 1, beams, -1);
        return;
      }
      for (const channel of CHANNELS) {
        if (!(color & channel.mask)) continue;
        this.trace(point, rotate(dir, channel.spread), channel.mask, depth + 1, beams, -1);
      }
      return;
    }

    if (hit.type === 'wall') return;   // 光被挡住，到此为止

    if (hit.type === 'target') {
      const target = this.state.targets[hit.index];
      target.hit |= color;
      this.trace(point, dir, color, depth + 1, beams, -1);
      return;
    }
  }

  nearestHit(origin, dir, ignoreMirror) {
    let best = null;

    this.state.mirrors.forEach((mirror, index) => {
      if (index === ignoreMirror) return;
      const [a, b] = mirrorEndpoints(mirror);
      const t = raySegmentT(origin, dir, a, b);
      if (t === null) return;
      if (!best || t < best.t) best = { t, type: 'mirror', index };
    });

    this.state.walls.forEach((wall, index) => {
      const t = raySegmentT(origin, dir, { x: wall.x1, y: wall.y1 }, { x: wall.x2, y: wall.y2 });
      if (t === null) return;
      if (!best || t < best.t) best = { t, type: 'wall', index };
    });

    const prismT = rayCircleT(origin, dir, this.state.prism.x, this.state.prism.y, this.state.prism.radius);
    if (prismT !== null && (!best || prismT < best.t)) best = { t: prismT, type: 'prism', index: 0 };

    this.state.targets.forEach((target, index) => {
      const t = rayCircleT(origin, dir, target.x, target.y, target.radius);
      if (t === null) return;
      if (!best || t < best.t) best = { t, type: 'target', index };
    });

    if (!best) return null;

    const point = { x: origin.x + dir.x * best.t, y: origin.y + dir.y * best.t };
    if (best.type === 'mirror') {
      return { ...best, point, normal: mirrorNormal(this.state.mirrors[best.index]) };
    }
    if (best.type === 'target') {
      const target = this.state.targets[best.index];
      let normal = { x: origin.x - target.x, y: origin.y - target.y };
      const len = Math.hypot(normal.x, normal.y) || 1;
      normal = { x: normal.x / len, y: normal.y / len };
      return { ...best, point, normal };
    }
    return { ...best, point, normal: { x: 0, y: 0 } };
  }

  boundaryPoint(origin, dir) {
    const candidates = [];
    if (dir.x > EPS) candidates.push((WIDTH - origin.x) / dir.x);
    if (dir.x < -EPS) candidates.push((0 - origin.x) / dir.x);
    if (dir.y > EPS) candidates.push((HEIGHT - origin.y) / dir.y);
    if (dir.y < -EPS) candidates.push((0 - origin.y) / dir.y);
    const positive = candidates.filter((t) => t > EPS);
    const t = positive.length ? Math.min(...positive) : 0;
    return { x: origin.x + dir.x * t, y: origin.y + dir.y * t };
  }
}


/* ---------------- 关卡验证工具 ---------------- */

function cloneCore(core) {
  const clone = Object.create(PrismCore.prototype);
  clone.state = structuredClone(core.state);
  clone.events = [];
  clone.levelIndex = core.levelIndex;
  clone.levels = core.levels;
  return clone;
}

// 镜子只有放在光束经过的地方才可能改变光路，所以候选点就取光束上的采样。
export function candidateSpots(core, step = 55) {
  const spots = [];
  const seen = new Set();
  for (const beam of core.state.beams) {
    const length = Math.hypot(beam.x2 - beam.x1, beam.y2 - beam.y1);
    const count = Math.max(1, Math.ceil(length / step));
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      const x = beam.x1 + (beam.x2 - beam.x1) * t;
      const y = beam.y1 + (beam.y2 - beam.y1) * t;
      if (x < 70 || x > WIDTH - 70 || y < 70 || y > HEIGHT - 70) continue;
      const key = `${Math.round(x / 25)}:${Math.round(y / 25)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      spots.push({ x, y });
    }
  }
  return spots;
}

// 逐面镜子做深度优先搜索：找到一组摆放能让全部目标亮起就返回。
export function solveLevel(level, options = {}) {
  const step = options.step ?? 55;
  const start = new PrismCore(level);
  const total = start.state.mirrors.length;

  const search = (core, index) => {
    if (core.solved()) return [];
    if (index >= total) return null;

    const base = core.litCount();
    for (const spot of candidateSpots(core, step)) {
      for (const slant of ['/', '\\']) {
        const branch = cloneCore(core);
        branch.state.mirrors[index].slant = slant;
        branch.moveMirror(index, spot.x, spot.y);
        // 剪枝：这一步没让任何新目标亮起，就别在这条死路上往下搜
        if (branch.litCount() < base && !branch.solved()) continue;
        if (branch.solved()) {
          return [{ mirror: index, x: Math.round(spot.x), y: Math.round(spot.y), slant }];
        }
        const rest = search(branch, index + 1);
        if (rest) {
          return [{ mirror: index, x: Math.round(spot.x), y: Math.round(spot.y), slant }, ...rest];
        }
      }
    }
    return null;
  };

  return search(start, 0);
}
