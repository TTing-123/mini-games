import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIRECTIONS,
  FLOOR,
  HOLE,
  WALL,
  arrowFor,
  bestMove,
  createState,
  getPuzzleCount,
  isSolved,
  solve,
  stateKey,
  tilt
} from '../src/tilt-core.js';

function makeState(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const terrain = [];
  const blocks = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    for (let col = 0; col < width; col += 1) {
      const char = rows[row][col];
      line.push(char === '#' ? WALL : char === 'o' ? HOLE : FLOOR);
      if (char === 'x') blocks.push([row, col]);
    }
    terrain.push(line);
  }
  return { width, height, terrain, blocks, won: blocks.length === 0 };
}

test('every level is a rectangle with blocks and holes', () => {
  assert.ok(getPuzzleCount() >= 12);
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const puzzle = createState(index);
    const widths = new Set(puzzle.terrain.map((line) => line.length));
    assert.equal(widths.size, 1, `level ${index} rows differ in width`);
    assert.equal(puzzle.width, puzzle.terrain[0].length, `level ${index} width`);
    assert.ok(puzzle.blocks.length > 0, `level ${index} needs a block`);
    const holes = puzzle.terrain.flat().filter((cell) => cell === HOLE).length;
    assert.ok(holes > 0, `level ${index} needs a hole`);
  }
});

test('every level can be cleared by tilting', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const path = solve(createState(index));
    assert.ok(path, `level ${index} is not solvable`);
    assert.ok(path.length > 0, `level ${index} solution is empty`);
    for (const direction of path) assert.ok(DIRECTIONS.includes(direction), `level ${index} bad direction`);
  }
});

test('the tutorial is a single tilt', () => {
  assert.equal(solve(createState(0)).length, 1);
});

test('a lone block slides until it hits a wall', () => {
  const state = makeState([
    '#####',
    '#x..#',
    '#...#',
    '#####'
  ]);
  const moved = tilt(state, 'right');
  assert.deepEqual(moved.blocks, [[1, 3]]);
  const back = tilt(moved, 'left');
  assert.deepEqual(back.blocks, [[1, 1]]);
});

test('blocks keep their order when they slide together', () => {
  const state = makeState([
    '########',
    '#x.x..o#',
    '########'
  ]);
  const moved = tilt(state, 'right');
  // 靠墙的先停，后面的方块贴上去，谁也不会越过谁。
  assert.deepEqual(moved.blocks, [[1, 5]]);
  assert.equal(moved.won, false);
});

test('a block is absorbed only when it stops on a hole', () => {
  const over = makeState([
    '########',
    '#x.o...#',
    '########'
  ]);
  const passed = tilt(over, 'right');
  assert.deepEqual(passed.blocks, [[1, 6]], '滑过凹槽不应该被吸收');

  const stops = makeState([
    '#######',
    '#x...o#',
    '#######'
  ]);
  const sunk = tilt(stops, 'right');
  assert.equal(sunk.blocks.length, 0);
  assert.equal(sunk.won, true);
});

test('tilting returns a new state and never mutates the old one', () => {
  const state = createState(0);
  const before = stateKey(state);
  const moved = tilt(state, 'right');
  assert.notEqual(moved, state);
  assert.equal(stateKey(state), before);
  assert.equal(moved.won, true);
  assert.equal(isSolved(moved), true);
});

test('a finished state stops responding to input', () => {
  const done = tilt(createState(0), 'right');
  assert.equal(tilt(done, 'left'), done);
});

test('the hint always names a move that gets closer to the goal', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const start = createState(index);
    const path = solve(start);
    const hint = bestMove(start);
    assert.equal(hint, path[0], `level ${index} hint`);
    assert.ok(arrowFor(hint).length > 0);
    const after = tilt(start, hint);
    const rest = solve(after);
    assert.equal(rest.length, path.length - 1, `level ${index} hint progress`);
  }
});