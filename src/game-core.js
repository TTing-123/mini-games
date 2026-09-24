export const WIDTH = 1280;
export const HEIGHT = 720;
const BORDER = 20;
const SHOTS_PER_LEVEL = [3, 4, 4, 4];

const HANDMADE_LEVELS = [
  {
    name: 'LEVEL 1',
    targets: [{ x: 420, y: 180 }, { x: 860, y: 180 }],
    bumpers: [{ x: 640, y: 300 }, { x: 360, y: 500 }, { x: 920, y: 500 }],
    gravity: [], splitters: [], chargers: []
  },
  {
    name: 'LEVEL 2',
    targets: [{ x: 260, y: 180 }, { x: 1020, y: 180 }, { x: 640, y: 430 }],
    bumpers: [{ x: 460, y: 300 }, { x: 820, y: 300 }, { x: 640, y: 560 }],
    gravity: [{ x: 640, y: 320, radius: 240, strength: 2600 }],
    splitters: [], chargers: []
  },
  {
    name: 'LEVEL 3',
    targets: [{ x: 260, y: 160 }, { x: 1020, y: 160 }, { x: 640, y: 150 }],
    bumpers: [{ x: 400, y: 300 }, { x: 880, y: 300 }, { x: 640, y: 520 }],
    gravity: [{ x: 640, y: 370, radius: 240, strength: 2600 }],
    splitters: [{ x: 330, y: 520 }, { x: 950, y: 520 }],
    chargers: []
  },
  {
    name: 'LEVEL 4',
    targets: [{ x: 300, y: 180 }, { x: 980, y: 180 }, { x: 640, y: 400 }],
    bumpers: [{ x: 460, y: 300 }, { x: 820, y: 300 }, { x: 640, y: 560 }],
    gravity: [{ x: 640, y: 300, radius: 240, strength: 2600 }],
    splitters: [{ x: 330, y: 500 }, { x: 950, y: 500 }],
    chargers: [{ x: 640, y: 500 }]
  }
];

export function createRng(seed = Date.now()) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickPosition(random, minX, maxX, minY, maxY, placed, minDistance) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const x = minX + random() * (maxX - minX);
    const y = minY + random() * (maxY - minY);
    if (Math.hypot(x - 640, y - 620) < 180) continue;
    if (placed.every((point) => Math.hypot(x - point.x, y - point.y) >= minDistance)) {
      placed.push({ x, y });
      return { x, y };
    }
  }
  const fallback = { x: minX + random() * (maxX - minX), y: minY + random() * (maxY - minY) };
  placed.push(fallback);
  return fallback;
}

export function generateEndlessLevel(levelNumber, seed = Date.now()) {
  const random = createRng(seed + levelNumber * 7919);
  const placed = [];
  const targetCount = Math.min(3 + Math.floor((levelNumber - 1) / 2), 7);
  const bumperCount = Math.min(3 + Math.floor(levelNumber / 2), 7);
  const gravityCount = levelNumber >= 2 ? Math.min(1 + Math.floor((levelNumber - 2) / 4), 2) : 0;
  const splitterCount = levelNumber >= 3 ? Math.min(1 + Math.floor((levelNumber - 3) / 4), 2) : 0;
  const chargerCount = levelNumber >= 4 ? 1 : 0;
  const targets = Array.from({ length: targetCount }, () => pickPosition(random, 100, 1180, 110, 420, placed, 125));
  const bumpers = Array.from({ length: bumperCount }, () => pickPosition(random, 100, 1180, 180, 600, placed, 100));
  const gravity = Array.from({ length: gravityCount }, () => ({
    ...pickPosition(random, 220, 1060, 250, 520, placed, 210),
    radius: 240,
    strength: 2600
  }));
  const splitters = Array.from({ length: splitterCount }, () => pickPosition(random, 120, 1160, 360, 610, placed, 145));
  const chargers = Array.from({ length: chargerCount }, () => pickPosition(random, 160, 1120, 360, 600, placed, 145));
  return { name: `ENDLESS ${levelNumber}`, targets, bumpers, gravity, splitters, chargers };
}
export class GameCore {
  constructor() {
    this.state = null;
    this.events = [];
    this.loadStaticLevel(0);
  }

  loadStaticLevel(index) {
    const level = HANDMADE_LEVELS[index];
    this.loadLevel(level, 'manual', index, SHOTS_PER_LEVEL[index]);
    this.queue('levelLoaded', { label: level.name });
  }

  loadEndlessLevel(levelNumber, seed = Date.now()) {
    const level = generateEndlessLevel(levelNumber, seed);
    this.loadLevel(level, 'endless', levelNumber, 4 + Math.min(2, Math.floor((levelNumber - 1) / 3)));
    this.queue('levelLoaded', { label: level.name });
  }

  loadLevel(level, mode, index, shots) {
    this.state = {
      mode,
      levelIndex: index,
      levelNumber: mode === 'endless' ? index : index + 1,
      label: level.name,
      status: 'aiming',
      shotsLeft: shots,
      shotsMax: shots,
      targetsTotal: level.targets.length,
      targetsRemaining: level.targets.length,
      currentShotHits: 0,
      comboAwarded: false,
      balls: [],
      entities: {
        targets: level.targets.map((target, id) => ({ ...target, id, active: true, radius: 24 })),
        bumpers: level.bumpers.map((bumper, id) => ({ ...bumper, id, radius: 26 })),
        gravity: level.gravity.map((well, id) => ({ ...well, id })),
        splitters: level.splitters.map((splitter, id) => ({ ...splitter, id, radius: 28, used: false })),
        chargers: level.chargers.map((charger, id) => ({ ...charger, id, radius: 28, used: false }))
      }
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

  launch(direction) {
    if (!this.state || this.state.status !== 'aiming' || this.state.shotsLeft <= 0) return false;
    const length = Math.hypot(direction.x, direction.y);
    if (length < 0.001) return false;
    const velocity = { x: direction.x / length * 980, y: direction.y / length * 980 };
    this.state.currentShotHits = 0;
    this.state.comboAwarded = false;
    this.state.shotsLeft -= 1;
    this.state.status = 'resolving';
    this.spawnBall({ x: 640, y: 620 }, velocity, true);
    this.queue('launched');
    return true;
  }

  spawnBall(position, velocity, canSplit) {
    this.state.balls.push({
      id: `${Date.now()}-${Math.random()}`,
      x: position.x,
      y: position.y,
      vx: velocity.x,
      vy: velocity.y,
      radius: 12,
      ttl: 6,
      canSplit,
      trail: [{ x: position.x, y: position.y }]
    });
  }
  update(dt) {
    if (!this.state || this.state.status !== 'resolving') return;
    const clamped = Math.min(dt, 0.033);
    const maxSpeed = Math.max(1, ...this.state.balls.map((ball) => Math.hypot(ball.vx, ball.vy)));
    const steps = Math.min(5, Math.max(1, Math.ceil(maxSpeed * clamped / 9)));
    const stepDt = clamped / steps;
    for (let step = 0; step < steps; step += 1) this.step(stepDt);
    if (this.state.balls.length === 0) this.finishShot();
  }

  step(dt) {
    const state = this.state;
    for (let i = state.balls.length - 1; i >= 0; i -= 1) {
      const ball = state.balls[i];
      ball.ttl -= dt;
      this.applyGravity(ball, dt);
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      this.resolveWalls(ball);
      this.resolveBumpers(ball);
      this.resolveTargets(ball);
      this.resolveSplitters(ball);
      this.resolveChargers(ball);
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 78) ball.trail.shift();
      if (ball.ttl <= 0) state.balls.splice(i, 1);
    }
  }

  applyGravity(ball, dt) {
    for (const well of this.state.entities.gravity) {
      const dx = well.x - ball.x;
      const dy = well.y - ball.y;
      const distance = Math.max(Math.hypot(dx, dy), 48);
      if (distance > well.radius) continue;
      const falloff = Math.max(0.15, 1 - distance / well.radius);
      const force = well.strength * falloff;
      ball.vx += dx / distance * force * dt;
      ball.vy += dy / distance * force * dt;
    }
  }

  resolveWalls(ball) {
    if (ball.x - ball.radius < BORDER) {
      ball.x = BORDER + ball.radius; ball.vx = Math.abs(ball.vx) * 0.99;
      this.queue('bounce', { x: ball.x, y: ball.y, source: 'wall' });
    } else if (ball.x + ball.radius > WIDTH - BORDER) {
      ball.x = WIDTH - BORDER - ball.radius; ball.vx = -Math.abs(ball.vx) * 0.99;
      this.queue('bounce', { x: ball.x, y: ball.y, source: 'wall' });
    }
    if (ball.y - ball.radius < BORDER) {
      ball.y = BORDER + ball.radius; ball.vy = Math.abs(ball.vy) * 0.99;
      this.queue('bounce', { x: ball.x, y: ball.y, source: 'wall' });
    } else if (ball.y + ball.radius > HEIGHT - BORDER) {
      ball.y = HEIGHT - BORDER - ball.radius; ball.vy = -Math.abs(ball.vy) * 0.99;
      this.queue('bounce', { x: ball.x, y: ball.y, source: 'wall' });
    }
  }

  resolveBumpers(ball) {
    for (const bumper of this.state.entities.bumpers) {
      const dx = ball.x - bumper.x;
      const dy = ball.y - bumper.y;
      const distance = Math.max(Math.hypot(dx, dy), 0.001);
      const minimum = ball.radius + bumper.radius;
      if (distance >= minimum) continue;
      const nx = dx / distance;
      const ny = dy / distance;
      ball.x = bumper.x + nx * minimum;
      ball.y = bumper.y + ny * minimum;
      const dot = ball.vx * nx + ball.vy * ny;
      if (dot < 0) { ball.vx -= 2 * dot * nx; ball.vy -= 2 * dot * ny; }
      this.queue('bounce', { x: ball.x, y: ball.y, source: 'bumper' });
    }
  }

  resolveTargets(ball) {
    for (const target of this.state.entities.targets) {
      if (!target.active) continue;
      if (Math.hypot(ball.x - target.x, ball.y - target.y) < ball.radius + target.radius) {
        target.active = false;
        this.state.targetsRemaining -= 1;
        this.state.currentShotHits += 1;
        this.queue('target', { x: target.x, y: target.y });
        if (this.state.currentShotHits >= 2 && !this.state.comboAwarded) {
          this.state.comboAwarded = true;
          this.state.shotsLeft += 1;
          this.state.shotsMax += 1;
          this.queue('combo', { x: target.x, y: target.y });
        }
      }
    }
  }
  resolveSplitters(ball) {
    if (!ball.canSplit) return;
    for (const splitter of this.state.entities.splitters) {
      if (splitter.used) continue;
      if (Math.hypot(ball.x - splitter.x, ball.y - splitter.y) >= ball.radius + splitter.radius) continue;
      splitter.used = true;
      ball.canSplit = false;
      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed < 1) return;
      const angle = Math.atan2(ball.vy, ball.vx);
      for (const offset of [-0.42, 0.42]) {
        this.spawnBall(
          { x: ball.x, y: ball.y },
          { x: Math.cos(angle + offset) * speed, y: Math.sin(angle + offset) * speed },
          false
        );
      }
      this.queue('split', { x: splitter.x, y: splitter.y });
      return;
    }
  }

  resolveChargers(ball) {
    for (const charger of this.state.entities.chargers) {
      if (charger.used) continue;
      if (Math.hypot(ball.x - charger.x, ball.y - charger.y) >= ball.radius + charger.radius) continue;
      charger.used = true;
      this.state.shotsLeft += 1;
      this.state.shotsMax += 1;
      this.queue('charge', { x: charger.x, y: charger.y });
      return;
    }
  }

  finishShot() {
    const state = this.state;
    if (state.targetsRemaining <= 0) {
      if (state.mode === 'manual' && state.levelIndex < HANDMADE_LEVELS.length - 1) {
        this.queue('levelClear', { label: state.label });
        this.loadStaticLevel(state.levelIndex + 1);
      } else {
        const next = state.mode === 'endless' ? state.levelIndex + 1 : 1;
        this.queue('levelClear', { label: state.label });
        this.loadEndlessLevel(next);
      }
      return;
    }
    if (state.shotsLeft <= 0) {
      state.status = 'gameOver';
      this.queue('gameOver', { won: false });
      return;
    }
    state.status = 'aiming';
    this.queue('aiming');
  }
}