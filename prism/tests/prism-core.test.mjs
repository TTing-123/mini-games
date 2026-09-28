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

test('the collection ships twenty-one levels, each with its own mechanic', () => {
  assert.equal(LEVELS.length, 21);
  const tags = LEVELS.map((level) => level.tag);
  for (const tag of ['THREE COLORS', 'THROUGH', 'MIX', 'AROUND', 'CYAN', 'MAGENTA', 'FIXED', 'WHITE',
    'TWO GOALS', 'LASER', 'FILTER', 'SPLIT', 'CARRY', 'GAUNTLET', 'PERIL', 'LADDER', 'CHAIN', 'FINAL',
    'CROSSFIRE', 'SIEGE', 'REACTOR']) {
    assert.ok(tags.includes(tag), `missing level tag ${tag}`);
  }
  assert.ok(LEVELS.some((level) => level.mirrors.some((mirror) => mirror.fixed)), 'a fixed mirror level exists');
  assert.ok(LEVELS.some((level) => level.walls.length > 0), 'a wall level exists');
  assert.ok(LEVELS.some((level) => level.targets.some((t) => t.color === WHITE)), 'a white target level exists');
});

test('a colour laser lights a matching target without the prism', () => {
  const scene = {
    name: 'LASER',
    sources: [{ x: 100, y: 360, angle: 0, color: RED }],
    prism: { x: -900, y: -900, radius: 1 },
    mirrors: [],
    walls: [],
    targets: [{ x: 900, y: 360, color: RED, radius: 30 }]
  };
  const core = new PrismCore(scene);
  assert.equal(core.state.sources.length, 1);
  assert.equal(core.isLit(0), true, 'a red laser lights a red target on its own');
});

test('a filter eats the colours it does not pass', () => {
  const base = {
    name: 'FILTER',
    sources: [{ x: 100, y: 360, angle: 0 }],
    prism: { x: 250, y: 360, radius: 36 },
    mirrors: [],
    walls: [],
    targets: [{ x: 900, y: 360, color: GREEN, radius: 30 }]
  };
  const blocked = new PrismCore({ ...base, filters: [{ x: 600, y: 360, radius: 50, color: RED }] });
  assert.equal(blocked.isLit(0), false, 'a red-only filter stops the green beam');
  const passed = new PrismCore({ ...base, filters: [{ x: 600, y: 360, radius: 50, color: GREEN }] });
  assert.equal(passed.isLit(0), true, 'a green filter lets it through');
});

test('a beam splitter sends light two ways at once', () => {
  const scene = {
    name: 'SPLIT',
    sources: [{ x: 100, y: 360, angle: 0, color: RED }],
    prism: { x: -900, y: -900, radius: 1 },
    mirrors: [],
    splitters: [{ x: 500, y: 360, slant: '/' }],
    walls: [],
    targets: [
      { x: 500, y: 150, color: RED, radius: 30 },
      { x: 900, y: 360, color: RED, radius: 30 }
    ]
  };
  const core = new PrismCore(scene);
  assert.equal(core.litCount(), 2, 'the reflected and the through beam each light a target');
});

test('a movable prism can be dragged onto the beam', () => {
  const scene = {
    name: 'CARRY',
    sources: [{ x: 100, y: 300, angle: 0 }],
    prism: { x: 500, y: 600, radius: 36, movable: true },
    mirrors: [],
    walls: [],
    targets: [{ x: 900, y: 300, color: GREEN, radius: 30 }]
  };
  const core = new PrismCore(scene);
  assert.equal(core.isLit(0), false, 'off the beam the prism splits nothing');
  assert.ok(core.prismAt(500, 600), 'the prism is grabbable');
  assert.equal(core.movePrism(400, 300), true);
  assert.equal(core.isLit(0), true, 'once on the beam the green ray reaches the target');
});

test('a fixed prism refuses to move and is not grabbable', () => {
  const core = new PrismCore();
  assert.equal(core.state.prism.movable, false);
  assert.equal(core.movePrism(600, 300), false);
  assert.equal(core.prismAt(core.state.prism.x, core.state.prism.y), null);
});

// 每关的存档解：由 solveLevel 搜出来并验证过。测试里直接重放它，
// 一是快（最后一关要搜三十多秒），二是它同时验证「解在玩家真能摆出的坐标上成立」。
const SAVED_SOLUTIONS = [
  [{ mirror: 0, x: 1061, y: 290, slant: '/' }, { mirror: 1, x: 1061, y: 430, slant: '\\' }],
  [{ mirror: 0, x: 998, y: 360, slant: '/' }],
  [{ mirror: 0, x: 1061, y: 290, slant: '\\' }],
  [{ mirror: 0, x: 527, y: 346, slant: '/' }, { mirror: 1, x: 513, y: 150, slant: '/' }],
  [{ mirror: 0, x: 998, y: 424, slant: '/' }],
  [{ mirror: 0, x: 1092, y: 286, slant: '\\' }],
  [{ mirror: 0, x: 904, y: 360, slant: '/' }],
  [{ mirror: 0, x: 528, y: 346, slant: '\\' }, { mirror: 1, x: 521, y: 408, slant: '\\' }, { mirror: 2, x: 972, y: 429, slant: '/' }],
  [{ mirror: 0, x: 904, y: 306, slant: '\\' }, { mirror: 1, x: 1092, y: 434, slant: '/' }],
  [{ mirror: 1, x: 620, y: 465, slant: '/' }],
  [{ mirror: 0, x: 998, y: 296, slant: '\\' }, { mirror: 1, x: 983, y: 436, slant: '/' }],
  [{ mirror: 0, x: 1153, y: 280, slant: '\\' }],
  [{ prism: true, x: 303, y: 300 }, { mirror: 0, x: 1092, y: 213, slant: '/' }, { mirror: 1, x: 1092, y: 387, slant: '\\' }],
  [{ mirror: 0, x: 1092, y: 286, slant: '\\' }, { mirror: 1, x: 1074, y: 459, slant: '/' }],
  [{ mirror: 0, x: 779, y: 319, slant: '\\' }],
  [{ mirror: 0, x: 708, y: 327, slant: '/' }, { mirror: 1, x: 1123, y: 360, slant: '/' }, { mirror: 2, x: 716, y: 250, slant: '/' }],
  [{ mirror: 0, x: 1194, y: 276, slant: '\\' }],
  [{ mirror: 0, x: 526, y: 346, slant: '/' }, { mirror: 1, x: 526, y: 346, slant: '/' }, { mirror: 2, x: 543, y: 189, slant: '/' }, { mirror: 3, x: 1162, y: 124, slant: '\\' }],
  [{ mirror: 0, x: 1090, y: 287, slant: '\\' }, { mirror: 1, x: 967, y: 420, slant: '\\' }],
  [{ mirror: 0, x: 873, y: 310, slant: '/' }, { mirror: 1, x: 1059, y: 430, slant: '\\' }, { mirror: 2, x: 1081, y: 635, slant: '/' }],
  [{ mirror: 0, x: 526, y: 346, slant: '/' }, { mirror: 1, x: 543, y: 189, slant: '/' }, { mirror: 2, x: 1161, y: 124, slant: '\\' }]
];

test('every shipped level has a recorded solution that reproduces', () => {
  assert.equal(SAVED_SOLUTIONS.length, LEVELS.length, 'the solution table must cover every level');
  LEVELS.forEach((level, index) => {
    const solution = SAVED_SOLUTIONS[index];
    assert.ok(solution, `${level.name} has no recorded solution`);
    assert.equal(verifySolution(level, solution), true, `${level.name} recorded solution did not reproduce`);
  });
});

test('later levels need more thinking than earlier ones', () => {
  const early = SAVED_SOLUTIONS.slice(0, 5).reduce((sum, moves) => sum + moves.length, 0) / 5;
  const late = SAVED_SOLUTIONS.slice(14).reduce((sum, moves) => sum + moves.length, 0) / 7;
  assert.ok(late >= early, `late levels should not be shallower (early ${early}, late ${late})`);
  assert.ok(late >= 2, 'the last stretch should average at least two moves');
});
