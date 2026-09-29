export const WIDTH = 960;
export const HEIGHT = 620;
export const SPAWN = { x: 52, y: HEIGHT / 2 };
export const CORE = { x: WIDTH - 58, y: HEIGHT / 2 };
export const MAX_PATH_LENGTH = 2450;
export const CORE_HP_MAX = 6;

export const TURRETS = [
  { id: 't1', x: 270, y: 170, range: 180, ammoMax: 3, fireDelay: .5, reloadTime: 2.6, damage: 1 },
  { id: 't2', x: 480, y: 450, range: 180, ammoMax: 3, fireDelay: .5, reloadTime: 2.6, damage: 1 },
  { id: 't3', x: 720, y: 170, range: 180, ammoMax: 3, fireDelay: .46, reloadTime: 2.8, damage: 1 }
];

const DEFAULT_POINTS = [
  SPAWN,
  { x: 250, y: 250 },
  { x: 430, y: 370 },
  { x: 600, y: 300 },
  CORE
];

function copyPoint(point) {
  return { x: point.x, y: point.y };
}

export function pathLength(points) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  return length;
}

function segmentProjection(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq <= 0.0001) return { t: 0, x: a.x, y: a.y, distance: Math.hypot(point.x - a.x, point.y - a.y) };
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq));
  const x = a.x + dx * t;
  const y = a.y + dy * t;
  return { t, x, y, distance: Math.hypot(point.x - x, point.y - y) };
}

export function pointAtDistance(points, distance) {
  if (!points.length) return { x: SPAWN.x, y: SPAWN.y, angle: 0 };
  if (distance <= 0) {
    const next = points[1] ?? points[0];
    return { ...copyPoint(points[0]), angle: Math.atan2(next.y - points[0].y, next.x - points[0].x) };
  }
  let travelled = 0;
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    const segment = Math.hypot(b.x - a.x, b.y - a.y);
    if (travelled + segment >= distance) {
      const t = segment <= 0.0001 ? 0 : (distance - travelled) / segment;
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angle: Math.atan2(b.y - a.y, b.x - a.x)
      };
    }
    travelled += segment;
  }
  const last = points[points.length - 1];
  const prev = points[points.length - 2] ?? last;
  return { ...copyPoint(last), angle: Math.atan2(last.y - prev.y, last.x - prev.x) };
}

export function nearestDistanceOnPath(points, point) {
  if (points.length < 2) return 0;
  let bestDistance = Infinity;
  let bestTravelled = 0;
  let travelled = 0;
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    const segment = Math.hypot(b.x - a.x, b.y - a.y);
    const projection = segmentProjection(point, a, b);
    if (projection.distance < bestDistance) {
      bestDistance = projection.distance;
      bestTravelled = travelled + segment * projection.t;
    }
    travelled += segment;
  }
  return bestTravelled;
}

function cleanPath(points) {
  const cleaned = [copyPoint(SPAWN)];
  for (const point of points) {
    const px = Math.max(8, Math.min(WIDTH - 8, point.x));
    const py = Math.max(8, Math.min(HEIGHT - 8, point.y));
    const previous = cleaned[cleaned.length - 1];
    if (Math.hypot(px - previous.x, py - previous.y) >= 8) cleaned.push({ x: px, y: py });
  }
  const last = cleaned[cleaned.length - 1];
  if (Math.hypot(CORE.x - last.x, CORE.y - last.y) >= 8) cleaned.push(copyPoint(CORE));
  else cleaned[cleaned.length - 1] = copyPoint(CORE);
  return cleaned.slice(0, 90);
}

export class RouteCore {
  constructor() {
    this.events = [];
    this.reset();
  }

  reset() {
    this.state = {
      time: 0,
      wave: 1,
      coreHp: CORE_HP_MAX,
      coreHpMax: CORE_HP_MAX,
      path: DEFAULT_POINTS.map(copyPoint),
      pathLength: pathLength(DEFAULT_POINTS),
      enemies: [],
      turrets: TURRETS.map((turret) => ({
        ...turret,
        ammo: turret.ammoMax,
        cooldown: 0,
        reloadTimer: 0
      })),
      waveState: 'spawning',
      spawnRemaining: 4,
      spawnTimer: .5,
      intermissionTimer: 0,
      nextEnemyId: 1,
      score: 0,
      gameOver: false,
      redrawCooldown: 0
    };
    this.events = [];
    this.queue('wave', { wave: 1 });
  }

  queue(type, data = {}) {
    this.events.push({ type, ...data });
  }

  consumeEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  setPath(points) {
    if (this.state.gameOver) return false;
    if (this.state.redrawCooldown > 0) return false;
    const path = cleanPath(points);
    const length = pathLength(path);
    if (length > MAX_PATH_LENGTH) {
      this.queue('pathRejected', { length, max: MAX_PATH_LENGTH });
      return false;
    }
    this.state.path = path;
    this.state.pathLength = length;
    this.state.redrawCooldown = 1.15;
    for (const enemy of this.state.enemies) {
      enemy.distance = nearestDistanceOnPath(path, { x: enemy.x, y: enemy.y });
    }
    this.queue('pathChanged', { length });
    return true;
  }

  spawnEnemy() {
    const state = this.state;
    const hp = 1 + Math.floor((state.wave - 1) / 2);
    const speed = 76 + state.wave * 4.8;
    const point = pointAtDistance(state.path, 0);
    state.enemies.push({
      id: state.nextEnemyId,
      x: point.x,
      y: point.y,
      distance: 0,
      speed,
      hp,
      maxHp: hp,
      radius: 10 + Math.min(6, state.wave * .15),
      bounty: 1
    });
    state.nextEnemyId += 1;
  }

  update(dt) {
    const state = this.state;
    const delta = Math.min(dt, .05);
    if (state.gameOver) return this.consumeEvents();

    state.time += delta;
    state.redrawCooldown = Math.max(0, state.redrawCooldown - delta);

    if (state.waveState === 'spawning') {
      state.spawnTimer -= delta;
      if (state.spawnTimer <= 0 && state.spawnRemaining > 0) {
        this.spawnEnemy();
        state.spawnRemaining -= 1;
        state.spawnTimer = Math.max(.32, .85 - state.wave * .04);
      }
      if (state.spawnRemaining <= 0 && state.enemies.length === 0) {
        state.waveState = 'intermission';
        state.intermissionTimer = 2.6;
        this.queue('waveClear', { wave: state.wave, score: state.score });
      }
    } else if (state.waveState === 'intermission') {
      state.intermissionTimer -= delta;
      if (state.intermissionTimer <= 0) {
        state.wave += 1;
        state.waveState = 'spawning';
        state.spawnRemaining = 5 + state.wave;
        state.spawnTimer = .35;
        this.queue('wave', { wave: state.wave });
      }
    }

    for (const enemy of state.enemies) {
      enemy.distance += enemy.speed * delta;
      const point = pointAtDistance(state.path, enemy.distance);
      enemy.x = point.x;
      enemy.y = point.y;
      enemy.angle = point.angle;
    }

    for (const turret of state.turrets) {
      if (turret.ammo <= 0) {
        turret.reloadTimer += delta;
        if (turret.reloadTimer >= turret.reloadTime) {
          turret.ammo = turret.ammoMax;
          turret.reloadTimer = 0;
          this.queue('reloaded', { turretId: turret.id });
        }
        continue;
      }

      turret.cooldown -= delta;
      if (turret.cooldown > 0) continue;
      let target = null;
      for (const enemy of state.enemies) {
        const distance = Math.hypot(enemy.x - turret.x, enemy.y - turret.y);
        if (distance > turret.range) continue;
        if (!target || enemy.distance > target.distance) target = enemy;
      }
      if (!target) continue;

      target.hp -= turret.damage;
      turret.ammo -= 1;
      turret.cooldown = turret.fireDelay;
      if (turret.ammo <= 0) turret.reloadTimer = 0;
      this.queue('shot', {
        turretId: turret.id,
        fromX: turret.x,
        fromY: turret.y,
        toX: target.x,
        toY: target.y,
        targetId: target.id
      });
      if (target.hp <= 0) {
        state.score += target.bounty;
        this.queue('kill', { enemyId: target.id, x: target.x, y: target.y });
      }
    }

    state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);

    for (const enemy of [...state.enemies]) {
      if (enemy.distance < state.pathLength) continue;
      enemy.hp = 0;
      state.coreHp -= 1;
      this.queue('coreHit', { enemyId: enemy.id, coreHp: state.coreHp });
    }
    state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);

    if (state.coreHp <= 0) {
      state.coreHp = 0;
      state.gameOver = true;
      this.queue('gameOver', { wave: state.wave, score: state.score });
    }
    return this.consumeEvents();
  }
}



