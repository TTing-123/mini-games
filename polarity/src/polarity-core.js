// POLARITY 核心逻辑：纯函数 + 状态机，不碰 DOM，可在 Node 里直接跑。
//
// 规则一句话：点一下粒子翻转它的极性，让所有粒子两两吸成对。
// 异极相吸、同极相斥；异极粒子贴到一起就锁成一对，锁定后不再参与相互作用。
//
// 回合制：每翻一次，系统自由演化 TURN_TIME 秒后停住，再交给玩家。
// 引力只在小范围内有效，所以远处粒子不会自动聚过来。

export const WIDTH = 1280;
export const HEIGHT = 720;
export const PARTICLE_RADIUS = 16;
export const PAIR_DISTANCE = 52;
export const TURN_TIME = 2.4;

const PHYSICS = {
  attractRange: 620,    // 异极吸引的作用半径
  attract: 300,         // 异极吸引强度（距离越近越强）
  repelRange: 260,      // 同极排斥的作用半径
  repel: 760,           // 同极排斥强度
  damping: 1.15,
  maxSpeed: 300,
  wallMargin: 54,
  wallPush: 1200
};

const LEVELS = [
  {
    name: 'LEVEL 1',
    moves: 3,
    hint: '点粒子翻转极性：异极相吸，吸到一起就锁住',
    particles: [
      { x: 420, y: 280, polarity: 1 },
      { x: 700, y: 280, polarity: -1 },
      { x: 420, y: 490, polarity: 1 },
      { x: 700, y: 490, polarity: -1 }
    ]
  },
  {
    name: 'LEVEL 2',
    moves: 3,
    hint: '同极会互相弹开，得先拆开它们',
    particles: [
      { x: 300, y: 250, polarity: 1 },
      { x: 640, y: 250, polarity: 1 },
      { x: 300, y: 520, polarity: 1 },
      { x: 640, y: 520, polarity: 1 }
    ]
  },
  {
    name: 'LEVEL 3',
    moves: 4,
    hint: '六个粒子，每翻一次只锁一对',
    particles: [
      { x: 400, y: 206, polarity: 1 },
      { x: 1083, y: 170, polarity: 1 },
      { x: 385, y: 506, polarity: 1 },
      { x: 990, y: 512, polarity: 1 },
      { x: 761, y: 329, polarity: 1 },
      { x: 597, y: 485, polarity: 1 }
    ]
  },
  {
    name: 'LEVEL 4',
    moves: 3,
    hint: '步数刚好够，翻错就重来',
    particles: [
      { x: 401, y: 309, polarity: 1 },
      { x: 213, y: 213, polarity: 1 },
      { x: 655, y: 411, polarity: 1 },
      { x: 402, y: 533, polarity: 1 },
      { x: 867, y: 211, polarity: 1 },
      { x: 1070, y: 279, polarity: 1 }
    ]
  }
];

export function levelCount() {
  return LEVELS.length;
}

export function getLevel(index) {
  return LEVELS[index];
}

export function freeParticles(particles) {
  return particles.filter((particle) => particle.partnerId === null);
}

export function isAllPaired(particles) {
  return particles.every((particle) => particle.partnerId !== null);
}

export function pairsOf(particles) {
  const seen = new Set();
  const pairs = [];
  for (const particle of particles) {
    if (particle.partnerId === null || seen.has(particle.id)) continue;
    const partner = particles.find((item) => item.id === particle.partnerId);
    if (!partner) continue;
    seen.add(particle.id);
    seen.add(partner.id);
    pairs.push([particle, partner]);
  }
  return pairs;
}

export class PolarityCore {
  constructor() {
    this.state = null;
    this.events = [];
    this.loadLevel(0);
  }

  loadLevel(index) {
    this.loadLevelData(LEVELS[index], 'manual', index);
    this.queue('levelLoaded', { label: this.state.label });
  }

  loadLevelData(level, mode, index) {
    this.state = {
      mode,
      levelIndex: index,
      label: level.name,
      hint: level.hint ?? '',
      movesLeft: level.moves,
      movesMax: level.moves,
      status: 'ready',
      particles: level.particles.map((particle, id) => ({
        id,
        x: particle.x,
        y: particle.y,
        vx: 0,
        vy: 0,
        polarity: particle.polarity,
        radius: PARTICLE_RADIUS,
        partnerId: null
      })),
      turnTime: 0
    };
  }

  queue(type, data = {}) {
    this.events.push({ type, ...data });
  }

  consumeEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  particleAt(x, y, slack = 34) {
    let best = null;
    for (const particle of this.state.particles) {
      const distance = Math.hypot(particle.x - x, particle.y - y);
      if (distance <= particle.radius + slack && (!best || distance < best.distance)) best = { particle, distance };
    }
    return best ? best.particle : null;
  }

  canFlip() {
    return this.state.status === 'ready' && this.state.movesLeft > 0;
  }

  flip(particleId) {
    if (!this.canFlip()) return false;
    const particle = this.state.particles.find((item) => item.id === particleId);
    if (!particle) return false;
    if (particle.partnerId !== null) this.unpair(particle);
    particle.polarity *= -1;
    this.state.movesLeft -= 1;
    this.state.status = 'resolving';
    this.state.turnTime = 0;
    this.queue('flip', { id: particle.id, x: particle.x, y: particle.y, polarity: particle.polarity });
    return true;
  }

  unpair(particle) {
    const partner = this.state.particles.find((item) => item.id === particle.partnerId);
    particle.partnerId = null;
    if (partner) {
      partner.partnerId = null;
      // 拆开时给一点反向初速度，避免立刻又被吸回去。
      const dx = partner.x - particle.x;
      const dy = partner.y - particle.y;
      const distance = Math.max(Math.hypot(dx, dy), 1);
      partner.vx = (dx / distance) * 120;
      partner.vy = (dy / distance) * 120;
      particle.vx = -(dx / distance) * 120;
      particle.vy = -(dy / distance) * 120;
    }
    this.queue('unpair', { x: particle.x, y: particle.y });
  }

  update(dt) {
    if (!this.state || this.state.status !== 'resolving') return;
    const clamped = Math.min(dt, 0.05);
    const steps = Math.max(1, Math.ceil(clamped / (1 / 120)));
    const stepDt = clamped / steps;
    for (let step = 0; step < steps; step += 1) {
      this.step(stepDt);
      this.tryPairAll();
    }
    this.state.turnTime += clamped;

    if (isAllPaired(this.state.particles)) {
      this.state.status = 'won';
      this.queue('won', { label: this.state.label });
      return;
    }
    if (this.state.turnTime >= TURN_TIME) this.finishTurn();
  }

  step(dt) {
    const particles = this.state.particles;
    const acceleration = particles.map(() => ({ x: 0, y: 0 }));

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      if (a.partnerId !== null) continue;
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        if (b.partnerId !== null) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const nx = dx / distance;
        const ny = dy / distance;

        let push = 0; // 正数表示互相排斥
        if (a.polarity === b.polarity) {
          if (distance < PHYSICS.repelRange) push = PHYSICS.repel * (1 - distance / PHYSICS.repelRange);
        } else if (distance < PHYSICS.attractRange) {
          // 远处也留一部分拉力，否则场地另一头的粒子永远够不着。
          const falloff = 1 - 0.65 * (distance / PHYSICS.attractRange);
          push = -PHYSICS.attract * falloff;
        }

        acceleration[i].x -= nx * push;
        acceleration[i].y -= ny * push;
        acceleration[j].x += nx * push;
        acceleration[j].y += ny * push;
      }

      // 软墙：靠近边缘时被推回来，而不是硬反弹。
      const margin = PHYSICS.wallMargin;
      if (a.x < margin) acceleration[i].x += PHYSICS.wallPush * ((margin - a.x) / margin);
      if (a.x > WIDTH - margin) acceleration[i].x -= PHYSICS.wallPush * ((a.x - (WIDTH - margin)) / margin);
      if (a.y < margin) acceleration[i].y += PHYSICS.wallPush * ((margin - a.y) / margin);
      if (a.y > HEIGHT - margin) acceleration[i].y -= PHYSICS.wallPush * ((a.y - (HEIGHT - margin)) / margin);
    }

    const damping = Math.exp(-PHYSICS.damping * dt);
    particles.forEach((particle, i) => {
      if (particle.partnerId !== null) return;
      particle.vx = (particle.vx + acceleration[i].x * dt) * damping;
      particle.vy = (particle.vy + acceleration[i].y * dt) * damping;
      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > PHYSICS.maxSpeed) {
        particle.vx = (particle.vx / speed) * PHYSICS.maxSpeed;
        particle.vy = (particle.vy / speed) * PHYSICS.maxSpeed;
      }
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
    });
  }

  tryPairAll() {
    let paired = false;
    for (let i = 0; i < this.state.particles.length; i += 1) {
      const a = this.state.particles[i];
      if (a.partnerId !== null) continue;
      for (let j = i + 1; j < this.state.particles.length; j += 1) {
        const b = this.state.particles[j];
        if (b.partnerId !== null || a.polarity === b.polarity) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) > PAIR_DISTANCE) continue;
        this.pairUp(a, b);
        paired = true;
      }
    }
    return paired;
  }

  pairUp(a, b) {
    a.partnerId = b.id;
    b.partnerId = a.id;
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const offset = PARTICLE_RADIUS;
    a.x = midX - Math.cos(angle) * offset;
    a.y = midY - Math.sin(angle) * offset;
    b.x = midX + Math.cos(angle) * offset;
    b.y = midY + Math.sin(angle) * offset;
    a.vx = 0; a.vy = 0;
    b.vx = 0; b.vy = 0;
    this.queue('pair', { x: midX, y: midY });
  }

  finishTurn() {
    const state = this.state;
    if (isAllPaired(state.particles)) {
      state.status = 'won';
      this.queue('won', { label: state.label });
      return;
    }
    if (state.movesLeft > 0) {
      state.status = 'ready';
      this.queue('ready', {});
      return;
    }
    state.status = 'lost';
    this.queue('lost', { label: state.label });
  }
}

/* ---------- 供测试与关卡生成使用 ---------- */

function cloneCore(core) {
  const clone = Object.create(PolarityCore.prototype);
  clone.state = structuredClone(core.state);
  clone.events = [];
  return clone;
}

function runTurn(core, maxSeconds = TURN_TIME * 4) {
  let elapsed = 0;
  while (core.state.status === 'resolving' && elapsed < maxSeconds) {
    core.update(1 / 60);
    elapsed += 1 / 60;
  }
  return core;
}

export function playSequence(level, sequence) {
  const core = new PolarityCore();
  core.loadLevelData(level, 'solve', 0);
  for (const id of sequence) {
    if (!core.flip(id)) break;
    runTurn(core);
  }
  return core;
}

// 深度优先搜索：步数上限内存在一条翻转序列能全部配对就算可解，返回最短序列之一。
// 有自由粒子离其他所有自由粒子都超出吸引半径时，这盘已经没救。
function hasStrandedParticle(core) {
  const free = core.state.particles.filter((particle) => particle.partnerId === null);
  return free.some((a) => free.every((b) => b === a || Math.hypot(a.x - b.x, a.y - b.y) > PHYSICS.attractRange));
}

export function solveLevel(level, maxDepth = Math.min(level.moves, 5)) {
  const count = level.particles.length;
  const search = (core, depth) => {
    if (core.state.status === 'won') return [];
    if (depth >= maxDepth || core.state.movesLeft <= 0) return null;
    if (hasStrandedParticle(core)) return null;
    let best = null;
    for (let id = 0; id < count; id += 1) {
      const branch = cloneCore(core);
      if (!branch.flip(id)) continue;
      runTurn(branch);
      const rest = search(branch, depth + 1);
      if (!rest) continue;
      const candidate = [id, ...rest];
      if (!best || candidate.length < best.length) best = candidate;
    }
    return best;
  };
  const start = new PolarityCore();
  start.loadLevelData(level, 'solve', 0);
  return search(start, 0);
}