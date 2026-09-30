import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPACITY,
  applyMove,
  canPour,
  createState,
  firstHintMove,
  getLevelCount,
  getLevelInfo,
  isSolved,
  pour,
  solve,
  topColor,
  topRun,
  undoMove
} from '../src/pour-core.js';

test('there are ten generated levels', () => {
  assert.equal(getLevelCount(), 10);
  for (let index = 0; index < getLevelCount(); index += 1) {
    assert.ok(getLevelInfo(index).solution.length > 0);
    assert.equal(createState(index).won, false);
  }
});

test('top color and top run read the top of a tube', () => {
  assert.equal(topColor([0, 0, 1]), 1);
  assert.equal(topRun([0, 1, 1, 1]), 3);
  assert.equal(topColor([]), null);
  assert.equal(topRun([]), 0);
});

test('liquid only pours onto empty or matching top color', () => {
  assert.equal(canPour([[0, 1], [], []], 0, 1), true);
  assert.equal(canPour([[0, 1], [1], []], 0, 1), true);
  assert.equal(canPour([[0, 1], [2], []], 0, 1), false);
  assert.equal(canPour([[0], [1, 2, 3, 4]], 0, 1), false);
});

test('pour moves the whole matching top run until the target is full', () => {
  const result = pour([[2, 1, 1, 1], [1], []], 0, 1);
  assert.deepEqual(result[0], [2]);
  assert.deepEqual(result[1], [1, 1, 1, 1]);
});

test('applyMove records history and undo restores it', () => {
  const state = createState(0);
  const before = state.tubes.map((tube) => tube.slice());
  const first = firstHintMove(state);
  const moved = applyMove(state, first.from, first.to);
  assert.ok(moved);
  assert.equal(moved.moves, 1);
  const undone = undoMove(moved);
  assert.deepEqual(undone.tubes, before);
  assert.equal(undone.moves, 0);
});

test('all stored solutions actually solve their levels', () => {
  for (let index = 0; index < getLevelCount(); index += 1) {
    const level = getLevelInfo(index);
    let tubes = level.tubes.map((tube) => tube.slice());
    for (const move of level.solution) {
      tubes = pour(tubes, move.from, move.to);
      assert.ok(tubes, `level ${index + 1} move ${move.from}->${move.to}`);
    }
    assert.equal(isSolved(tubes), true, `level ${index + 1} solved`);
  }
});

test('solver finds a solution from every level start', () => {
  for (let index = 0; index < getLevelCount(); index += 1) {
    const state = createState(index);
    assert.ok(solve(state.tubes, 120000));
  }
});

test('the first hint is a legal move', () => {
  const state = createState(0);
  const hint = firstHintMove(state);
  assert.ok(hint);
  assert.equal(canPour(state.tubes, hint.from, hint.to), true);
});
