import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUZZLES,
  advance,
  availableDrops,
  cellKind,
  createState,
  dropAvailable,
  getPuzzleCount,
  inject,
  nextHint,
  previewVirus,
  solve
} from '../src/immune-core.js';

test('every level is solvable and has something to protect', () => {
  assert.ok(getPuzzleCount() >= 10);
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const puzzle = PUZZLES[index];
    assert.ok(puzzle.viruses.length > 0, `level ${index} needs a virus`);
    assert.ok(puzzle.persons.length > 0, `level ${index} needs a person`);
    assert.ok(puzzle.drops.length > 0, `level ${index} needs a drop point`);
    assert.ok(solve(createState(index)).solvable, `level ${index} is not solvable`);
  }
});

test('the virus spreads first and wins a tie', () => {
  // 病毒在 (1,1)、投放点在 (1,3)、人都不在：推进一回合后 (1,2) 是红的
  const state = { puzzleIndex: 0, red: [[0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], blue: [[0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]], usedDrops: [], turn: 0, injectedThisTurn: false, status: 'playing', lastRed: [], lastBlue: [], width: 9, height: 5 };
  const next = advance(state);
  assert.equal(next.red[1][2], 1, '病毒先占 (1,2)');
  assert.equal(next.blue[1][2], 0, '免疫不能抢走已经被病毒占的格子');
  assert.equal(next.blue[1][4], 1, '免疫从 (1,3) 扩到 (1,4)');
});

test('a person must be covered, not merely reachable', () => {
  const state = createState(0);
  assert.equal(state.status, 'playing');
  const saved = inject(createState(0), 1, 7);
  const after = advance(advance(saved));
  assert.equal(after.status, 'won');
});

test('one injection per turn', () => {
  let state = createState(1);
  state = inject(state, 1, 7);
  assert.equal(state.usedDrops.length, 1);
  const blocked = inject(state, 5, 1);
  assert.equal(blocked.usedDrops.length, 1, '同一回合不能投第二针');
  const next = advance(state);
  assert.equal(next.injectedThisTurn, false);
});

test('a drop point that the virus reaches becomes unusable', () => {
  let state = createState(0);
  // 0 关的 (3,1) 离病毒很近：推进几回合后它会被吞
  for (let i = 0; i < 3; i += 1) state = advance(state);
  assert.equal(state.red[3][1], 1);
  assert.equal(dropAvailable(state, 3, 1), false);
});

test('infection ends the level', () => {
  let state = createState(0);
  for (let i = 0; i < 6 && state.status === 'playing'; i += 1) state = advance(state);
  assert.equal(state.status, 'lost');
  assert.equal(state.red[1][5], 1);
});

test('cell kinds come from the level data', () => {
  const puzzle = PUZZLES[0];
  assert.equal(cellKind(puzzle, 1, 1), 'virus');
  assert.equal(cellKind(puzzle, 1, 5), 'person');
  assert.equal(cellKind(puzzle, 1, 7), 'drop');
  assert.equal(cellKind(puzzle, 0, 0), 'wall');
  assert.equal(cellKind(puzzle, 2, 2), 'floor');
});

test('the preview lists the cells the virus takes next', () => {
  const state = createState(0);
  const preview = previewVirus(state);
  const list = preview.map(([r, c]) => r + ',' + c).sort();
  assert.deepEqual(list, ['1,2', '2,1']);   // 病毒在角上，下一回合会占这两格
});

test('the hint points at an injection that keeps the level winnable', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const state = createState(index);
    const drop = nextHint(state);
    assert.ok(drop, `level ${index} hint`);
    const used = inject(state, drop[0], drop[1]);
    assert.ok(availableDrops(used).length >= 0);
    assert.ok(solve(used).solvable, `level ${index} hint keeps it solvable`);
  }
});

test('the tutorial needs exactly one dose', () => {
  assert.equal(solve(createState(0)).vaccines, 1);
});

test('the last level needs two doses', () => {
  assert.equal(solve(createState(getPuzzleCount() - 1)).vaccines, 2);
});