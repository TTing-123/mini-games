import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_PATH_LENGTH,
  RouteCore,
  CORE,
  SPAWN,
  nearestDistanceOnPath,
  pathLength,
  pointAtDistance
} from '../src/route-core.js';

function run(core, seconds, step = .05) {
  const events = [];
  const count = Math.ceil(seconds / step);
  for (let index = 0; index < count; index += 1) events.push(...core.update(step));
  return events;
}

test('default route is valid and under the ink limit', () => {
  const core = new RouteCore();
  assert.ok(core.state.path.length >= 2);
  assert.ok(core.state.pathLength > 0);
  assert.ok(core.state.pathLength <= MAX_PATH_LENGTH);
});

test('pointAtDistance walks from spawn to core', () => {
  const core = new RouteCore();
  const start = pointAtDistance(core.state.path, 0);
  const end = pointAtDistance(core.state.path, core.state.pathLength + 100);
  assert.ok(Math.hypot(start.x - SPAWN.x, start.y - SPAWN.y) < .01);
  assert.ok(Math.hypot(end.x - CORE.x, end.y - CORE.y) < .01);
});

test('a path longer than the ink limit is rejected', () => {
  const core = new RouteCore();
  const points = [];
  for (let index = 0; index < 40; index += 1) points.push({ x: index % 2 ? 80 : 850, y: 40 + index * 13 });
  assert.equal(core.setPath(points), false);
  assert.ok(core.state.pathLength <= MAX_PATH_LENGTH);
});

test('a valid live redraw replaces the path and keeps enemies on it', () => {
  const core = new RouteCore();
  core.state.enemies.push({ id: 1, x: 350, y: 455, distance: 200, speed: 0, hp: 1, maxHp: 1, radius: 10, bounty: 1 });
  const nextPath = [SPAWN, { x: 250, y: 100 }, { x: 500, y: 520 }, CORE];
  assert.equal(core.setPath(nextPath), true);
  const enemy = core.state.enemies[0];
  core.update(.01);
  const expected = pointAtDistance(core.state.path, enemy.distance);
  assert.ok(Math.hypot(enemy.x - expected.x, enemy.y - expected.y) < .01);
  assert.equal(core.state.redrawCooldown > 0, true);
});

test('turret fires at an enemy in range and spends ammo', () => {
  const core = new RouteCore();
  const turret = core.state.turrets[0];
  const distance = nearestDistanceOnPath(core.state.path, turret);
  core.state.enemies = [{ id: 1, x: turret.x, y: turret.y, distance, speed: 0, hp: 1, maxHp: 1, radius: 10, bounty: 1 }];
  const before = turret.ammo;
  const events = core.update(.05);
  assert.equal(turret.ammo, before - 1);
  assert.equal(core.state.enemies.length, 0);
  assert.ok(events.some((event) => event.type === 'shot'));
  assert.ok(events.some((event) => event.type === 'kill'));
});

test('an empty turret reloads after its reload time', () => {
  const core = new RouteCore();
  const turret = core.state.turrets[0];
  core.state.waveState = 'intermission';
  core.state.intermissionTimer = 999;
  turret.ammo = 0;
  turret.reloadTimer = 0;
  run(core, turret.reloadTime + .1);
  assert.equal(turret.ammo, turret.ammoMax);
});

test('reaching the core costs one core hp', () => {
  const core = new RouteCore();
  core.state.enemies = [{
    id: 1,
    x: CORE.x,
    y: CORE.y,
    distance: core.state.pathLength - 1,
    speed: 200,
    hp: 1,
    maxHp: 1,
    radius: 10,
    bounty: 1
  }];
  const before = core.state.coreHp;
  core.update(.05);
  assert.equal(core.state.coreHp, before - 1);
  assert.equal(core.state.enemies.length, 0);
});

test('clearing a wave starts an intermission, then a harder wave', () => {
  const core = new RouteCore();
  core.state.waveState = 'spawning';
  core.state.spawnRemaining = 0;
  core.state.enemies = [];
  core.update(.05);
  assert.equal(core.state.waveState, 'intermission');
  run(core, 2.8);
  assert.equal(core.state.wave, 2);
  assert.equal(core.state.waveState, 'spawning');
  assert.equal(core.state.spawnRemaining, 7);
});
