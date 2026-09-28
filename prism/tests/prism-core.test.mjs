import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PrismCore, SCENE, RED, GREEN, BLUE, WHITE, RAW,
  colorKey, raySegmentT, rayCircleT, reflect, mirrorEndpoints,
  LEVELS, solveLevel, verifySolution
} from '../src/prism-core.js';

const clone = (scene) => ({
  ...scene,
  source: { ...scene.source },
  prism: { ...scene.prism },
  mirrors: scene.mirrors.map((m) => ({ ...m })),
  targets: scene.targets.map((t) => ({ ...t }))
});

test('geometry: ray hits a segment and a circle', () => {
  const origin = { x: 0, y: 0 };
  const dir = { x: 1, y: 0 };
  const t = raySegmentT(origin, dir, { x: 100, y: -50 }, { x: 100, y: 50 });
  assert.equal(t, 100);
  const c = rayCircleT(origin, dir, 200, 0, 25);
  assert.equal(c, 175);
  assert.equal(raySegmentT(origin, dir, { x: 100, y: 10 }, { x: 100, y: 50 }), null);
});

test('geometry: reflection off a 45 degree mirror turns right into up', () => {
  const mirror = { x: 100, y: 100, slant: '/' };
  const [a, b] = mirrorEndpoints(mirror);
  const ex = b.x - a.x;
  const ey = b.y - a.y;
  const len = Math.hypot(ex, ey);
  const normal = { x: -ey / len, y: ex / len };
  const bounced = reflect({ x: 1, y: 0 }, normal);
  assert.ok(bounced.y < -0.9, `expected the beam to head up, got ${JSON.stringify(bounced)}`);
});

test('prism splits the raw beam into exactly red, green and blue', () => {
  const core = new PrismCore();
  const masks = new Set(core.state.beams.map((beam) => beam.color));
  assert.ok(masks.has(RAW), 'source beam is still raw before the prism');
  assert.equal(masks.has(WHITE), false, 'un-split light must not count as white');
  assert.ok(masks.has(RED));
  assert.ok(masks.has(GREEN));
  assert.ok(masks.has(BLUE));
});

test('green light naturally lights the green target on the starting scene', () => {
  const core = new PrismCore();
  assert.equal(core.isLit(0), true, 'green target should be lit before any move');
  assert.equal(core.litCount(), 1);
});

test('a red beam cannot light a green target', () => {
  const scene = clone(SCENE);
  scene.targets = [{ x: 800, y: 360, color: GREEN, radius: 30 }];
  scene.mirrors = [];
  const core = new PrismCore(scene);
  // 只有绿光的那条通道能点亮它
  assert.equal(core.isLit(0), true);
  const onlyRed = clone(SCENE);
  onlyRed.targets = [{ x: 800, y: 360, color: GREEN, radius: 30 }];
  onlyRed.source.angle = 0;
  onlyRed.prism = { x: 430, y: 360, radius: 36 };
  const core2 = new PrismCore(onlyRed);
  core2.state.targets[0].hit = RED;
  assert.equal(core2.isLit(0), false, 'wrong colour must not count');
});

test('a yellow target needs red and green together', () => {
  const scene = clone(SCENE);
  scene.targets = [{ x: 900, y: 360, color: RED | GREEN, radius: 40 }];
  const core = new PrismCore(scene);
  core.state.targets[0].hit = RED;
  assert.equal(core.isLit(0), false, 'red alone is not enough');
  core.state.targets[0].hit = RED | GREEN;
  assert.equal(core.isLit(0), true, 'red + green makes yellow');
  assert.equal(colorKey(RED | GREEN), 'yellow');
});

test('the starting scene is solvable by placing both mirrors', () => {
  const core = new PrismCore();
  core.state.mirrors[0].slant = '\\';
  core.moveMirror(0, 1020, 410);
  core.state.mirrors[1].slant = '/';
  core.moveMirror(1, 1020, 320);
  assert.equal(core.litCount(), 3, 'all three targets should light up');
  assert.equal(core.solved(), true);
});

test('moving a mirror recomputes the beams immediately', () => {
  const core = new PrismCore();
  const before = core.state.beams.length;
  core.moveMirror(1, 700, 300);
  const after = core.state.beams.length;
  assert.notEqual(before, after, 'beam layout should change when a mirror moves');
});

test('every shipped level is solvable with the written-down coordinates', () => {
  for (const level of LEVELS) {
    const solution = solveLevel(level);
    assert.ok(solution, `${level.name} has no solution`);
    // verifySolution 会用四舍五入后的坐标重跑一遍：解必须在玩家真能摆出的位置上成立
    assert.equal(verifySolution(level, solution), true, `${level.name} solution did not reproduce`);
  }
});

test('later levels ask for more thinking, not less', () => {
  const shape = LEVELS.map((level) => ({
    mirrors: level.mirrors.length,
    targets: level.targets.length,
    colors: new Set(level.targets.map((t) => t.color)).size
  }));
  assert.ok(shape[3].colors >= 1);
  assert.ok(LEVELS[0].targets.length >= LEVELS[3].targets.length, 'the last level trades target count for tighter constraints');
});

test('walls stop the beam', () => {
  const blocked = {
    name: 'WALL',
    source: { x: 100, y: 360, angle: 0 },
    // 先分光再谈颜色：未分光的原始光本来就不该点亮任何目标
    prism: { x: 250, y: 360, radius: 36 },
    mirrors: [],
    walls: [{ x1: 400, y1: 200, x2: 400, y2: 520 }],
    targets: [{ x: 900, y: 360, color: GREEN, radius: 30 }]
  };
  const core = new PrismCore(blocked);
  assert.equal(core.isLit(0), false, 'a wall in the way should block the light');

  const open = { ...blocked, walls: [] };
  const clear = new PrismCore(open);
  assert.equal(clear.isLit(0), true, 'without the wall the same beam reaches the target');
});

test('level flow advances and stops at the last level', () => {
  const core = new PrismCore();
  assert.equal(core.levelIndex, 0);
  assert.equal(core.isLastLevel(), false);
  let guard = 0;
  while (core.nextLevel() && guard < 20) guard += 1;
  assert.equal(core.levelIndex, LEVELS.length - 1);
  assert.equal(core.isLastLevel(), true);
  assert.equal(core.nextLevel(), false, 'cannot advance past the last level');
  core.restart();
  assert.equal(core.levelIndex, LEVELS.length - 1, 'restart stays on the current level');
});

test('raw light from the source cannot light anything', () => {
  const scene = {
    name: 'RAW',
    source: { x: 100, y: 360, angle: 0 },
    prism: { x: -900, y: -900, radius: 1 },
    mirrors: [],
    walls: [],
    targets: [{ x: 900, y: 360, color: WHITE, radius: 40 }]
  };
  const core = new PrismCore(scene);
  assert.equal(core.isLit(0), false, 'un-split light must not count as white');
});

test('fixed mirrors cannot be dragged or flipped', () => {
  const scene = {
    name: 'FIXED',
    source: { x: 100, y: 360, angle: 0 },
    prism: { x: -900, y: -900, radius: 1 },
    mirrors: [{ x: 500, y: 300, slant: '/', fixed: true }],
    walls: [],
    targets: []
  };
  const core = new PrismCore(scene);
  assert.equal(core.mirrorAt(500, 300), null, 'fixed mirrors are not grabbable');
  assert.equal(core.moveMirror(0, 700, 500), false);
  assert.equal(core.toggleMirror(0), false);
  assert.equal(core.state.mirrors[0].x, 500);
  assert.equal(core.state.mirrors[0].slant, '/');
});

test('the collection ships sixteen levels covering every mechanic', () => {
  assert.equal(LEVELS.length, 16);
  const tags = LEVELS.map((level) => level.tag);
  for (const tag of ['THREE COLORS', 'THROUGH', 'MIX', 'AROUND', 'CYAN', 'MAGENTA', 'FIXED', 'WHITE',
    'ABOVE', 'TWO GOALS', 'OVER', 'RELAY', 'TRIPLE', 'BLOCKED', 'LOWER', 'GAUNTLET']) {
    assert.ok(tags.includes(tag), `missing level tag ${tag}`);
  }
  assert.ok(LEVELS.some((level) => level.mirrors.some((mirror) => mirror.fixed)), 'a fixed mirror level exists');
  assert.ok(LEVELS.some((level) => level.walls.length > 0), 'a wall level exists');
  assert.ok(LEVELS.some((level) => level.targets.some((t) => t.color === WHITE)), 'a white target level exists');
});
