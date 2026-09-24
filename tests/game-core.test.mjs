import test from 'node:test';
import assert from 'node:assert/strict';
import { GameCore, generateEndlessLevel } from '../src/game-core.js';

function ballAt(x, y) {
  return { x, y, vx: 0, vy: 0, radius: 12, ttl: 6, canSplit: true, trail: [] };
}

test('static level starts with clear counters', () => {
  const game = new GameCore();
  assert.equal(game.state.targetsTotal, 2);
  assert.equal(game.state.targetsRemaining, 2);
  assert.equal(game.state.entities.bumpers.length, 3);
  assert.equal(game.state.shotsLeft, 3);
});

test('launch consumes a shot and creates one ball', () => {
  const game = new GameCore();
  assert.equal(game.launch({ x: 0, y: -1 }), true);
  assert.equal(game.state.shotsLeft, 2);
  assert.equal(game.state.balls.length, 1);
  assert.equal(game.state.status, 'resolving');
});

test('gravity well pulls a nearby ball toward its center', () => {
  const game = new GameCore();
  game.loadStaticLevel(1);
  const well = game.state.entities.gravity[0];
  const ball = ballAt(well.x + 120, well.y);
  game.applyGravity(ball, 0.2);
  assert.ok(ball.vx < -200);
});

test('charger grants one shot only once', () => {
  const game = new GameCore();
  game.loadStaticLevel(3);
  const charger = game.state.entities.chargers[0];
  const before = game.state.shotsLeft;
  game.resolveChargers(ballAt(charger.x, charger.y));
  game.resolveChargers(ballAt(charger.x, charger.y));
  assert.equal(game.state.shotsLeft, before + 1);
  assert.equal(game.state.shotsMax, 5);
});

test('two target hits in one shot grant one combo shot', () => {
  const game = new GameCore();
  game.state.shotsLeft = 2;
  game.state.shotsMax = 3;
  game.state.currentShotHits = 1;
  game.state.comboAwarded = false;
  const target = game.state.entities.targets[0];
  game.resolveTargets(ballAt(target.x, target.y));
  assert.equal(game.state.shotsLeft, 3);
  assert.equal(game.state.shotsMax, 4);
  const secondTarget = game.state.entities.targets[1];
  game.resolveTargets(ballAt(secondTarget.x, secondTarget.y));
  assert.equal(game.state.shotsLeft, 3);
});

test('endless difficulty increases target count', () => {
  const low = generateEndlessLevel(1, 1234);
  const high = generateEndlessLevel(7, 1234);
  assert.ok(high.targets.length > low.targets.length);
  assert.ok(high.bumpers.length >= low.bumpers.length);
});