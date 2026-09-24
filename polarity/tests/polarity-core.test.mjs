import test from 'node:test';
import assert from 'node:assert/strict';
import { PolarityCore, getLevel, levelCount, solveLevel, playSequence, isAllPaired, pairsOf } from '../src/polarity-core.js';

function runTurn(core) {
  let elapsed = 0;
  while (core.state.status === 'resolving' && elapsed < 10) {
    core.update(1 / 60);
    elapsed += 1 / 60;
  }
  return core;
}

function levelOf(particles, moves = 4) {
  return { name: 'TEST', moves, particles };
}

test('level 1 loads with four particles and three flips', () => {
  const core = new PolarityCore();
  assert.equal(core.state.particles.length, 4);
  assert.equal(core.state.movesLeft, 3);
  assert.equal(core.state.status, 'ready');
  assert.equal(pairsOf(core.state.particles).length, 0);
});

test('flipping costs one move and starts a turn', () => {
  const core = new PolarityCore();
  assert.equal(core.flip(0), true);
  assert.equal(core.state.movesLeft, 2);
  assert.equal(core.state.status, 'resolving');
  assert.equal(core.state.particles[0].polarity, -1);
});

test('cannot flip while resolving', () => {
  const core = new PolarityCore();
  core.flip(0);
  assert.equal(core.flip(1), false);
});

test('opposite polarities drift together and lock into a pair', () => {
  const core = new PolarityCore();
  core.loadLevelData(levelOf([
    { x: 400, y: 360, polarity: 1 },
    { x: 560, y: 360, polarity: -1 },
    { x: 900, y: 360, polarity: 1 }
  ]), 'test', 0);
  core.flip(2);
  runTurn(core);
  assert.equal(pairsOf(core.state.particles).length, 1);
});

test('same polarities push each other apart', () => {
  const core = new PolarityCore();
  core.loadLevelData(levelOf([
    { x: 600, y: 360, polarity: 1 },
    { x: 660, y: 360, polarity: 1 },
    { x: 640, y: 500, polarity: -1 }
  ]), 'test', 0);
  const before = Math.abs(core.state.particles[0].x - core.state.particles[1].x);
  core.flip(2);
  runTurn(core);
  const after = Math.abs(core.state.particles[0].x - core.state.particles[1].x);
  assert.ok(after > before, `expected the same-polarity pair to separate (${before} -> ${after})`);
});

test('flipping a locked particle unlocks its partner', () => {
  const core = new PolarityCore();
  core.loadLevelData(levelOf([
    { x: 400, y: 360, polarity: 1 },
    { x: 560, y: 360, polarity: -1 },
    { x: 900, y: 360, polarity: 1 }
  ]), 'test', 0);
  core.flip(2);
  runTurn(core);
  assert.equal(pairsOf(core.state.particles).length, 1);
  core.state.status = 'ready';
  core.state.movesLeft = 3;
  core.flip(0);
  assert.equal(pairsOf(core.state.particles).length, 0);
});

test('running out of flips with unpaired particles loses the round', () => {
  const core = new PolarityCore();
  core.loadLevelData(levelOf([
    { x: 300, y: 300, polarity: 1 },
    { x: 900, y: 300, polarity: 1 }
  ], 1), 'test', 0);
  core.flip(0);
  runTurn(core);
  assert.equal(core.state.status, 'lost');
});

test('every shipped level is solvable within its move budget', () => {
  for (let index = 0; index < levelCount(); index += 1) {
    const level = getLevel(index);
    const solution = solveLevel(level, level.moves);
    assert.ok(solution, `level ${index + 1} has no solution within ${level.moves} flips`);
    assert.ok(solution.length <= level.moves);
    const core = playSequence(level, solution);
    assert.equal(core.state.status, 'won', `level ${index + 1} did not finish after ${solution.join(',')}`);
  }
});

test('difficulty ramps up across the shipped levels', () => {
  const minimums = [];
  for (let index = 0; index < levelCount(); index += 1) {
    const level = getLevel(index);
    const solution = solveLevel(level, level.moves);
    minimums.push(solution.length);
  }
  assert.deepEqual(minimums, [2, 2, 3, 3]);
});