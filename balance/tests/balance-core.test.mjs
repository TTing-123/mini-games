import test from 'node:test';
import assert from 'node:assert/strict';
import {
  balanceGap,
  canDetach,
  canPlace,
  createState,
  detachWeight,
  getLevelCount,
  getHook,
  isSolved,
  moveWeight,
  weightAt,
  barStats
} from '../src/balance-core.js';

test('there are enough handcrafted levels for the first playable', () => {
  assert.ok(getLevelCount() >= 8);
});

test('every level solution actually balances every bar', () => {
  for (let index = 0; index < getLevelCount(); index += 1) {
    let state = createState(index);
    assert.ok(state, `level ${index} exists`);
    for (const move of state.solution) {
      state = moveWeight(state, move.weightId, move.hookId);
      assert.ok(state, `move ${move.weightId} -> ${move.hookId} is legal`);
    }
    assert.equal(isSolved(state), true, `level ${index} solves`);
    assert.equal(balanceGap(state), 0);
  }
});

test('the first level starts tilted and can be completed', () => {
  let state = createState(0);
  assert.equal(isSolved(state), false);
  assert.ok(balanceGap(state) > 0);
  state = moveWeight(state, 'w2', 'b0.right');
  assert.equal(isSolved(state), true);
  assert.equal(weightAt(state, 'b0.right').id, 'w2');
});

test('moving onto an occupied hook swaps the two weights', () => {
  let state = createState(2);
  state = moveWeight(state, 'w3', 'b0.right');
  assert.equal(weightAt(state, 'b0.right').id, 'w3');
  assert.equal(weightAt(state, 'b0.left').id, 'w1');
  assert.equal(state.weights.find((weight) => weight.id === 'w2').at, null);
});

test('a weight cannot be placed on a hook occupied by a child bar', () => {
  const state = createState(3);
  assert.equal(canPlace(state, 'w2', 'b0.left'), false);
  assert.equal(moveWeight(state, 'w2', 'b0.left'), null);
});

test('detaching a weight returns it to the tray', () => {
  const state = createState(0);
  assert.equal(canDetach(state, 'w1'), true);
  const next = detachWeight(state, 'w1');
  assert.equal(next.weights.find((weight) => weight.id === 'w1').at, null);
  assert.equal(canDetach(next, 'w1'), false);
});

test('a child bar carries its total mass into the parent bar', () => {
  let state = createState(3);
  state = moveWeight(state, 'w2', 'b1.right');
  const child = barStats(state, 'b1');
  const parent = barStats(state, 'b0');
  assert.equal(child.totalMass, 2);
  assert.equal(parent.left.load, 2);
  assert.equal(parent.leftTorque, 4);
});

test('unknown hooks and weights are rejected', () => {
  const state = createState(0);
  assert.equal(getHook(state, 'missing.left'), null);
  assert.equal(canPlace(state, 'missing', 'b0.left'), false);
  assert.equal(moveWeight(state, 'w2', 'missing.right'), null);
});
