import test from 'node:test';
import assert from 'node:assert/strict';
import { BlastCore, CONFIG, WIDTH, HEIGHT } from '../src/blast-core.js';

function runUntilSettled(core, maxSeconds = 12) {
  let elapsed = 0;
  while (core.state.status !== 'done' && elapsed < maxSeconds) {
    core.update(1 / 120);
    elapsed += 1 / 120;
    if (core.state.status === 'idle') return elapsed;
  }
  return elapsed;
}

function place(core, specs) {
  core.state.balls = specs.map((spec, id) => ({
    id, x: spec.x, y: spec.y, radius: spec.radius ?? 12, vx: 0, vy: 0, phase: 0,
    state: 'idle', fuse: 0, generation: 0, heat: 0
  }));
  core.state.clicksLeft = CONFIG.clicksPerRun;
  core.state.status = 'idle';
}

test('reset scatters the configured number of balls', () => {
  const core = new BlastCore(1);
  assert.ok(core.state.balls.length > CONFIG.ballCount * 0.8, `expected close to ${CONFIG.ballCount}, got ${core.state.balls.length}`);
  assert.ok(core.state.balls.every((ball) => ball.state === 'idle'));
});

test('igniting spends a click and arms the ball', () => {
  const core = new BlastCore(2);
  const before = core.state.clicksLeft;
  assert.equal(core.ignite(core.state.balls[0].id), true);
  assert.equal(core.state.clicksLeft, before - 1);
  assert.equal(core.state.status, 'chaining');
  assert.equal(core.state.balls[0].state, 'armed');
});

test('a blast spreads to nearby balls and ignores distant ones', () => {
  const core = new BlastCore(3);
  const near = CONFIG.blastRadius - 30;
  place(core, [
    { x: 300, y: 300 },
    { x: 300 + near, y: 300 },
    { x: 300 + CONFIG.blastRadius + 120, y: 300 }
  ]);
  core.ignite(0);
  runUntilSettled(core);
  assert.equal(core.state.balls[0].state, 'gone');
  assert.equal(core.state.balls[1].state, 'gone', 'the ball inside the blast radius should chain');
  assert.equal(core.state.balls[2].state, 'idle', 'the ball outside the blast radius should survive');
});

test('chain reaches across a cluster and settles by itself', () => {
  const core = new BlastCore(4);
  // 排成一串、间距小于爆炸半径，连锁应该一路传到队尾。
  const specs = [];
  for (let i = 0; i < 6; i += 1) specs.push({ x: 200 + i * (CONFIG.blastRadius - 20), y: 360 });
  place(core, specs);
  core.ignite(0);
  const seconds = runUntilSettled(core);
  assert.equal(core.cleared(), 6, 'every linked ball should blow up');
  assert.ok(seconds < 4, `chain should settle quickly, took ${seconds}s`);
});

test('balls drift and stay inside the board', () => {
  const core = new BlastCore(5);
  const start = core.state.balls.map((ball) => ({ x: ball.x, y: ball.y }));
  for (let i = 0; i < 600; i += 1) core.update(1 / 60);
  let moved = 0;
  for (let i = 0; i < core.state.balls.length; i += 1) {
    const ball = core.state.balls[i];
    if (Math.hypot(ball.x - start[i].x, ball.y - start[i].y) > 5) moved += 1;
    assert.ok(ball.x >= 0 && ball.x <= WIDTH, 'ball stayed inside horizontally');
    assert.ok(ball.y >= 0 && ball.y <= HEIGHT, 'ball stayed inside vertically');
  }
  assert.ok(moved > core.state.balls.length * 0.5, 'most balls should have drifted');
});

test('clicking empty space does nothing', () => {
  const core = new BlastCore(6);
  assert.equal(core.ballAt(-500, -500), null);
  assert.equal(core.canClick(), true);
});