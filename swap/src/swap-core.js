export const COLS = 15;
export const ROWS = 10;
export const TILE = 54;
export const WIDTH = COLS * TILE;
export const HEIGHT = ROWS * TILE;

export const WALL = '#';
export const FLOOR = '.';
export const SPIKE = '^';
export const PIT = ' ';
export const PLATE = 'O';
export const DOOR = 'D';
export const EXIT = 'X';

const LEVELS = [
  {
    id: 'S1',
    title: '跨过缺口',
    hint: '点击箱子换位；点击钥匙会直接拿到',
    rows: [
      '###############',
      '#P     C  K X #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '###############'
    ]
  },
  {
    id: 'S2',
    title: '跨过尖刺',
    hint: '尖刺不能走，但可以换过去',
    rows: [
      '###############',
      '#P..^^^^.C.K X#',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '###############'
    ]
  },
  {
    id: 'S3',
    title: '压住开关',
    hint: '箱子站在开关上，门才会开',
    rows: [
      '###############',
      '#P..C.O..#....#',
      '#........#....#',
      '#........D....#',
      '#........#....#',
      '#........#..K.#',
      '#........#....#',
      '#........#...X#',
      '#........#....#',
      '###############'
    ]
  },
  {
    id: 'S4',
    title: '借敌人过坑',
    hint: '敌人也能交换',
    rows: [
      '###############',
      '#P   E  K X   #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '###############'
    ]
  },
  {
    id: 'S5',
    title: '组合换位',
    hint: '先填坑，再换钥匙，最后到出口',
    rows: [
      '###############',
      '#P  C  K X    #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '###############'
    ]
  }
  ,
  {
    id: 'S6',
    title: '双开关',
    hint: '两个开关都要被压住',
    parTime: 50,
    parSwaps: 2,
    rows: [
      '###############',
      '#P..C...O..#..#',
      '#..........D..#',
      '#....O.....#..#',
      '#..........#..#',
      '#....C.....#..#',
      '#..........#..#',
      '#..........#KX#',
      '#..........#..#',
      '###############'
    ]
  },
  {
    id: 'S7',
    title: '尖刺走廊',
    hint: '箱子在尖刺的另一边',
    parTime: 35,
    parSwaps: 2,
    rows: [
      '###############',
      '#P..C..^^.C.KX#',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '###############'
    ]
  },
  {
    id: 'S8',
    title: '敌人和尖刺',
    hint: '敌人会追过来，但要先过尖刺',
    parTime: 40,
    parSwaps: 3,
    rows: [
      '###############',
      '#P..E..^^.C.KX#',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '###############'
    ]
  },
  {
    id: 'S9',
    title: '双钥匙',
    hint: '两把钥匙都要拿到，点击会直接收集',
    parTime: 45,
    parSwaps: 4,
    rows: [
      '###############',
      '#P C  K  C  KX#',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '#             #',
      '###############'
    ]
  },
  {
    id: 'S10',
    title: '最后一关',
    hint: '开关、尖刺、敌人，全部一起用',
    parTime: 65,
    parSwaps: 5,
    rows: [
      '###############',
      '#P..C.O..#....#',
      '#........#....#',
      '#..^^....D....#',
      '#........#..K.#',
      '#..E.....#....#',
      '#........#....#',
      '#........#...X#',
      '#........#....#',
      '###############'
    ]
  }
];

export function getLevelCount() {
  return LEVELS.length;
}

export function getLevelInfo(index) {
  return LEVELS[index] ?? null;
}

function parseLevel(index) {
  const level = LEVELS[index];
  const tiles = level.rows.map((row) => row.split('').map((char) => {
    if (char === WALL || char === SPIKE || char === PIT || char === PLATE || char === DOOR || char === EXIT) return char;
    return FLOOR;
  }));
  const state = {
    levelIndex: index,
    title: level.title,
    hint: level.hint,
    tiles,
    player: { x: 0, y: 0, radius: 15, hp: 3, hpMax: 3 },
    crates: [],
    enemies: [],
    keys: [],
    exit: { x: 0, y: 0 },
    doorOpen: false,
    won: false,
    lost: false,
    time: 0,
    swapCooldown: 0,
    damageCooldown: 0,
    nextId: 1,
    platesTotal: 0,
    platesPressed: 0,
    keysTotal: 0,
    swapCount: 0,
    parTime: level.parTime ?? 40,
    parSwaps: level.parSwaps ?? 3
  };

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const char = level.rows[row][col];
      const point = { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
      if (char === 'P') Object.assign(state.player, point);
      else if (char === 'C') state.crates.push({ id: `crate:${state.nextId++}`, type: 'crate', x: point.x, y: point.y, radius: 16 });
      else if (char === 'E') state.enemies.push({ id: `enemy:${state.nextId++}`, type: 'enemy', x: point.x, y: point.y, radius: 16, hp: 1, speed: 95 });
      else if (char === 'K') state.keys.push({ id: `key:${state.nextId++}`, type: 'key', x: point.x, y: point.y, radius: 14, collected: false });
      else if (char === EXIT) Object.assign(state.exit, point);
    }
  }
  return state;
}

export function createState(levelIndex = 0) {
  return parseLevel(levelIndex);
}

export function cloneState(state) {
  return {
    ...state,
    tiles: state.tiles.map((row) => row.slice()),
    player: { ...state.player },
    crates: state.crates.map((item) => ({ ...item })),
    enemies: state.enemies.map((item) => ({ ...item })),
    keys: state.keys.map((item) => ({ ...item })),
    exit: { ...state.exit }
  };
}

export function cellOf(point) {
  return { col: Math.floor(point.x / TILE), row: Math.floor(point.y / TILE) };
}

export function cellCenter(col, row) {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

export function tileAt(state, col, row) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return WALL;
  return state.tiles[row][col];
}

export function solidTile(state, col, row) {
  const tile = tileAt(state, col, row);
  if (tile === WALL || tile === PIT) return true;
  if (tile === DOOR && !state.doorOpen) return true;
  return false;
}

export function crateAt(state, point) {
  return state.crates.find((crate) => Math.hypot(crate.x - point.x, crate.y - point.y) < crate.radius + 10) ?? null;
}

function collides(state, point, radius) {
  const samples = [
    { x: point.x - radius, y: point.y - radius },
    { x: point.x + radius, y: point.y - radius },
    { x: point.x - radius, y: point.y + radius },
    { x: point.x + radius, y: point.y + radius },
    { x: point.x, y: point.y }
  ];
  for (const sample of samples) {
    const cell = cellOf(sample);
    if (solidTile(state, cell.col, cell.row)) return true;
    if (crateAt(state, sample)) return true;
  }
  return false;
}

function moveEntity(state, entity, dx, dy, dt, isEnemy = false) {
  const distance = Math.hypot(dx, dy);
  if (distance <= 0) return;
  const speed = entity.speed ?? 150;
  const stepX = dx / distance * speed * dt;
  const stepY = dy / distance * speed * dt;

  const nextX = { x: entity.x + stepX, y: entity.y };
  if (!collides(state, nextX, entity.radius)) entity.x = nextX.x;
  const nextY = { x: entity.x, y: entity.y + stepY };
  if (!collides(state, nextY, entity.radius)) entity.y = nextY.y;
}

export function movePlayer(state, dx, dy, dt) {
  if (state.won || state.lost) return;
  moveEntity(state, state.player, dx, dy, dt, false);
}

export function lineOfSight(state, a, b) {
  const start = cellOf(a);
  const end = cellOf(b);
  let x0 = start.col;
  let y0 = start.row;
  const x1 = end.col;
  const y1 = end.row;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx - dy;
  while (true) {
    if (!(x0 === start.col && y0 === start.row) && !(x0 === x1 && y0 === y1)) {
      const tile = tileAt(state, x0, y0);
      if (tile === WALL || (tile === DOOR && !state.doorOpen)) return false;
    }
    if (x0 === x1 && y0 === y1) return true;
    const doubled = error * 2;
    if (doubled > -dy) {
      error -= dy;
      x0 += sx;
    }
    if (doubled < dx) {
      error += dx;
      y0 += sy;
    }
  }
}

export function getEntity(state, id) {
  return state.crates.find((item) => item.id === id)
    ?? state.enemies.find((item) => item.id === id)
    ?? state.keys.find((item) => item.id === id && !item.collected)
    ?? null;
}

export function findSwapTarget(state, point) {
  const candidates = [
    ...state.crates,
    ...state.enemies,
    ...state.keys.filter((key) => !key.collected)
  ];
  let best = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
    if (distance > candidate.radius + 20) continue;
    const range = Math.hypot(candidate.x - state.player.x, candidate.y - state.player.y);
    if (range > TILE * 8) continue;
    if (!lineOfSight(state, state.player, candidate)) continue;
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

export function swapWith(state, targetId) {
  if (state.won || state.lost) return false;
  const target = getEntity(state, targetId);
  if (!target) return false;
  if (state.swapCooldown > 0 && target.type !== 'key') return false;
  const range = Math.hypot(target.x - state.player.x, target.y - state.player.y);
  if (range > TILE * 8 || !lineOfSight(state, state.player, target)) return false;

  const playerPoint = { x: state.player.x, y: state.player.y };
  const swappedKey = target.type === 'key';
  state.player.x = target.x;
  state.player.y = target.y;
  target.x = playerPoint.x;
  target.y = playerPoint.y;
  if (swappedKey) {
    target.collected = true;
    state.keys = state.keys.filter((key) => key.id !== target.id);
  }
  state.swapCount += 1;
  state.swapCooldown = .62;
  applyTileEffects(state);
  return true;
}

export function applyTileEffects(state) {
  const playerCell = cellOf(state.player);
  const playerTile = tileAt(state, playerCell.col, playerCell.row);
  if (playerTile === PIT) {
    state.player.hp = 0;
    state.lost = true;
  } else if (playerTile === SPIKE && state.damageCooldown <= 0) {
    state.player.hp -= 1;
    state.damageCooldown = .8;
    if (state.player.hp <= 0) state.lost = true;
  }

  state.crates = state.crates.filter((crate) => {
    const cell = cellOf(crate);
    const tile = tileAt(state, cell.col, cell.row);
    if (tile !== PIT) return true;
    state.tiles[cell.row][cell.col] = FLOOR;
    return false;
  });

  state.enemies = state.enemies.filter((enemy) => {
    const cell = cellOf(enemy);
    const tile = tileAt(state, cell.col, cell.row);
    return tile !== PIT && tile !== SPIKE;
  });
}

export function update(state, dt) {
  if (state.won || state.lost) return;
  const delta = Math.min(dt, .05);
  state.time += delta;
  state.swapCooldown = Math.max(0, state.swapCooldown - delta);
  state.damageCooldown = Math.max(0, state.damageCooldown - delta);

  for (const enemy of state.enemies) {
    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    if (Math.hypot(dx, dy) > 8) moveEntity(state, enemy, dx, dy, delta, true);
  }

  for (const enemy of state.enemies) {
    const distance = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
    if (distance < enemy.radius + state.player.radius - 8 && state.damageCooldown <= 0) {
      state.player.hp -= 1;
      state.damageCooldown = 1;
      if (state.player.hp <= 0) state.lost = true;
    }
  }

  for (const key of state.keys) {
    if (key.collected) continue;
    if (Math.hypot(key.x - state.player.x, key.y - state.player.y) < key.radius + state.player.radius) {
      key.collected = true;
    }
  }

  const playerCell = cellOf(state.player);
  const occupied = new Set([`${playerCell.col},${playerCell.row}`]);
  for (const crate of state.crates) {
    const cell = cellOf(crate);
    occupied.add(`${cell.col},${cell.row}`);
  }
  let platesPressed = 0;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (tileAt(state, col, row) === PLATE && occupied.has(`${col},${row}`)) platesPressed += 1;
    }
  }
  state.platesPressed = platesPressed;
  state.doorOpen = state.platesTotal === 0 || platesPressed >= state.platesTotal;

  const hasKey = state.keys.length === 0 || state.keys.some((key) => key.collected);
  if (hasKey && Math.hypot(state.exit.x - state.player.x, state.exit.y - state.player.y) < TILE * .45) {
    state.won = true;
  }

  applyTileEffects(state);
}

export class SwapCore {
  constructor() {
    this.state = null;
    this.loadLevel(0);
  }

  loadLevel(index) {
    this.state = createState(index);
  }

  restart() {
    this.loadLevel(this.state.levelIndex);
  }

  next() {
    const nextIndex = this.state.levelIndex + 1;
    if (nextIndex < getLevelCount()) this.loadLevel(nextIndex);
  }

  move(dx, dy, dt) {
    movePlayer(this.state, dx, dy, dt);
    update(this.state, 0);
  }

  trySwapAt(point) {
    const target = findSwapTarget(this.state, point);
    if (!target) return false;
    return swapWith(this.state, target.id);
  }

  update(dt) {
    update(this.state, dt);
  }
}
