import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLANK,
  FILLED,
  UNKNOWN,
  cluesFromLine,
  createState,
  cycleCell,
  getPuzzleCount,
  getPuzzleInfo,
  isLineSolvable,
  isStateSolved,
  nextDeduction,
  setCell,
  solveByLines
} from '../src/nono-core.js';

test('there are twenty puzzles plus a tutorial', () => {
  assert.equal(getPuzzleCount(), 21);
  assert.ok(getPuzzleInfo(0));
});

test('every puzzle can be solved by line logic without guessing', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    assert.equal(isLineSolvable(getPuzzleInfo(index)), true, `puzzle ${index + 1}`);
  }
});

test('line clues collapse consecutive runs', () => {
  assert.deepEqual(cluesFromLine([1, 1, 0, 1, 1, 1, 0]), [2, 3]);
  assert.deepEqual(cluesFromLine([0, 0, 0]), [0]);
});

test('a puzzle starts empty with the right dimensions', () => {
  const state = createState(0);
  assert.equal(state.width, 3);
  assert.equal(state.height, 3);
  assert.ok(state.grid.every((row) => row.every((cell) => cell === UNKNOWN)));
});

test('cells cycle through fill, blank, and unknown', () => {
  let state = createState(0);
  state = cycleCell(state, 0, 0);
  assert.equal(state.grid[0][0], FILLED);
  state = cycleCell(state, 0, 0);
  assert.equal(state.grid[0][0], BLANK);
  state = cycleCell(state, 0, 0);
  assert.equal(state.grid[0][0], UNKNOWN);
});

test('a deduction is always a forced filled or blank cell', () => {
  const state = createState(0);
  const deduction = nextDeduction(state);
  assert.ok(deduction);
  assert.ok(deduction.row >= 0 && deduction.row < state.height);
  assert.ok(deduction.col >= 0 && deduction.col < state.width);
  assert.ok(deduction.value === FILLED || deduction.value === BLANK);
});

test('filling the solution solves the puzzle', () => {
  let state = createState(0);
  const solvedGrid = state.solution.map((row) => row.map((cell) => cell === 1 ? FILLED : BLANK));
  state = { ...state, grid: solvedGrid };
  assert.equal(isStateSolved(state), true);
});

test('the line solver completes a full puzzle', () => {
  const puzzle = getPuzzleInfo(0);
  const solved = solveByLines(puzzle);
  for (let row = 0; row < puzzle.height; row += 1) {
    for (let col = 0; col < puzzle.width; col += 1) {
      const expected = puzzle.solution[row][col] === 1 ? FILLED : BLANK;
      assert.equal(solved[row][col], expected);
    }
  }
});
