import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUZZLES,
  angleDistance,
  clearSlot,
  createState,
  filledSlots,
  getPuzzleCount,
  isSolved,
  nextHint,
  normalizeAngle,
  partAt,
  partUsedAt,
  placePart,
  searchSolutions,
  trainResult
} from '../src/gear-core.js';

test('every level asks for a reachable angle', () => {
  assert.ok(getPuzzleCount() >= 10);
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const puzzle = PUZZLES[index];
    assert.equal(puzzle.slots, puzzle.stages * 2, `level ${index} slot count`);
    assert.ok(puzzle.parts.length >= puzzle.slots, `level ${index} needs enough parts`);
    assert.ok(puzzle.parts.every((teeth) => teeth > 0), `level ${index} teeth`);
    const found = searchSolutions(createState(index));
    assert.ok(found.count > 0, `level ${index} is not solvable`);
  }
});

test('a gear train multiplies every stage ratio', () => {
  const state = { puzzleIndex: 0, slots: [0, 1] };   // 12 齿主动、6 齿从动
  const result = trainResult(state);
  assert.equal(result.complete, true);
  assert.equal(result.ratio, 0.5);
  assert.equal(result.angle, 180);
});

test('odd stage counts reverse the output', () => {
  assert.equal(trainResult({ puzzleIndex: 0, slots: [0, 1] }).dir, -1);   // 1 级
  assert.equal(trainResult({ puzzleIndex: 3, slots: [0, 1, 2, 3] }).dir, 1); // 2 级
});

test('an incomplete train reports no angle', () => {
  const state = createState(0);
  const result = trainResult(state);
  assert.equal(result.complete, false);
  assert.equal(result.angle, null);
});

test('each gear can only be used once', () => {
  let state = createState(0);
  state = placePart(state, 0, 0);
  assert.equal(partUsedAt(state, 0), 0);
  state = placePart(state, 1, 0);       // 同一个齿轮搬到另一个槽
  assert.equal(partUsedAt(state, 0), 1);
  assert.equal(partAt(state, 0), null);
  assert.equal(filledSlots(state), 1);
});

test('taking a gear out clears the slot', () => {
  let state = createState(0);
  state = placePart(state, 0, 0);
  state = clearSlot(state, 0);
  assert.equal(partAt(state, 0), null);
  assert.equal(filledSlots(state), 0);
});

test('a correct assembly solves the level', () => {
  const found = searchSolutions(createState(0));
  assert.ok(found.count > 0);
  const solved = { puzzleIndex: 0, slots: found.solutions[0].slice() };
  assert.equal(isSolved(solved), true);
});

test('the tutorial level has exactly one answer', () => {
  assert.equal(searchSolutions(createState(0)).count, 1);
});

test('angles wrap around the dial', () => {
  assert.equal(normalizeAngle(360), 0);
  assert.equal(normalizeAngle(450), 90);
  assert.equal(normalizeAngle(-90), 270);
  assert.equal(angleDistance(350, 10), 20);
});

test('the hint always suggests a real move from the answer set', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const state = createState(index);
    const step = nextHint(state);
    assert.ok(step, `level ${index} hint`);
    assert.ok(step.slot >= 0 && step.slot < PUZZLES[index].slots);
    assert.ok(step.part >= 0 && step.part < PUZZLES[index].parts.length);
    const after = placePart(state, step.slot, step.part);
    assert.ok(searchSolutions(after).count > 0, `level ${index} hint keeps it solvable`);
  }
});