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
  hasColors,
  isSolved,
  solve,
  stateKey,
  tilt
} from '../src/tilt-core.js';

const BLOCK_CHARS = { x: 0, a: 1, b: 2, c: 3 };
const HOLE_CHARS = { o: 0, A: 1, B: 2, C: 3 };

function makeState(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const terrain = [];
  const holeColors = [];
  const blocks = [];
  const blockColors = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    const colors = [];
    for (let col = 0; col < width; col += 1) {
      const char = rows[row][col];
      if (char === '#') { line.push(WALL); colors.push(0); }
      else if (char in HOLE_CHARS) { line.push(HOLE); colors.push(HOLE_CHARS[char]); }
      else { line.push(FLOOR); colors.push(0); }
      if (char in BLOCK_CHARS) { blocks.push([row, col]); blockColors.push(BLOCK_CHARS[char]); }
    }
    terrain.push(line);
    holeColors.push(colors);
  }
  return { width, height, terrain, holeColors, blocks, blockColors, won: blocks.length === 0 };
}

test('every level is a rectangle with blocks and holes', () => {
  assert.ok(getPuzzleCount() >= 50);
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

test('no two levels share the same layout', () => {
  const seen = new Map();
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const rows = createState(index).terrain.map((line, row) => line.join('') + '|' +
      createState(index).holeColors[row].join('')).join('/');
    assert.ok(!seen.has(rows), `level ${index} duplicates level ${seen.get(rows)}`);
    seen.set(rows, index);
  }
});

test('no two levels repeat the same solution', () => {
  const seen = new Map();
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const path = solve(createState(index)).join('>');
    if (seen.has(path)) {
      assert.fail(`level ${index} repeats the solution of level ${seen.get(path)}: ${path}`);
    }
    seen.set(path, index);
  }
});

test('no two same-sized levels share nearly the same walls', () => {
  const wallsOf = (index) => {
    const state = createState(index);
    const set = new Set();
    for (let row = 1; row < state.height - 1; row += 1) {
      for (let col = 1; col < state.width - 1; col += 1) {
        if (state.terrain[row][col] === WALL) set.add(row + ',' + col);
      }
    }
    return set;
  };
  for (let a = 0; a < getPuzzleCount(); a += 1) {
    for (let b = a + 1; b < getPuzzleCount(); b += 1) {
      const one = createState(a);
      const two = createState(b);
      if (one.width !== two.width || one.height !== two.height) continue;
      const left = wallsOf(a);
      const right = wallsOf(b);
      const shared = [...left].filter((cell) => right.has(cell)).length;
      const union = left.size + right.size - shared;
      const similarity = union ? shared / union : 1;
      assert.ok(similarity < 0.7, `level ${a} and ${b} share ${similarity.toFixed(2)} of their walls`);
    }
  }
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

test('coloured blocks only fall into matching holes', () => {
  const mismatch = makeState([
    '#######',
    '#a...B#',
    '#######'
  ]);
  const kept = tilt(mismatch, 'right');
  assert.equal(kept.blocks.length, 1, '颜色不对不该被吸收');
  assert.deepEqual(kept.won, false);

  const match = makeState([
    '#######',
    '#a...A#',
    '#######'
  ]);
  const sunk = tilt(match, 'right');
  assert.equal(sunk.won, true);
  assert.deepEqual(sunk.blockColors, []);
});

test('plain holes swallow any colour, but coloured holes refuse plain blocks', () => {
  const plain = makeState([
    '#######',
    '#a...o#',
    '#######'
  ]);
  assert.equal(tilt(plain, 'right').won, true);

  const strict = makeState([
    '#######',
    '#x...A#',
    '#######'
  ]);
  assert.equal(tilt(strict, 'right').won, false);
});

test('a coloured block keeps its colour across tilts', () => {
  const state = makeState([
    '#######',
    '#b....#',
    '#.....#',
    '#######'
  ]);
  const down = tilt(state, 'down');
  assert.deepEqual(down.blockColors, [2]);
  const around = tilt(tilt(down, 'left'), 'up');
  assert.deepEqual(around.blockColors, [2]);
  assert.deepEqual(around.blocks, [[1, 1]]);
});

test('the colour chapter really uses colours', () => {
  let coloured = 0;
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    if (hasColors(createState(index))) coloured += 1;
  }
  assert.ok(coloured >= 8, `colour levels: ${coloured}`);
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