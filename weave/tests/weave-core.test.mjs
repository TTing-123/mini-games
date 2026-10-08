import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUZZLES,
  createState,
  entryStatus,
  getPuzzleCount,
  isSolved,
  nextHint,
  placeTile,
  takeTile,
  tileAt
} from '../src/weave-core.js';

function solveLevel(index) {
  let state = createState(index);
  const puzzle = PUZZLES[index];
  for (const position of puzzle.blanks) {
    const wanted = puzzle.solution[position];
    const tile = state.tiles.find((item) => item.at === null && item.char === wanted);
    state = placeTile(state, tile.tileId, position);
  }
  return state;
}

test('there are enough handwritten levels', () => {
  assert.ok(getPuzzleCount() >= 30, '关卡数至少 30，当前 ' + getPuzzleCount());
});

test('every line of idioms shares its end and next first character', () => {
  for (const puzzle of PUZZLES) {
    const lines = new Map();
    for (const entry of puzzle.entries) {
      if (!lines.has(entry.line)) lines.set(entry.line, []);
      lines.get(entry.line).push(entry);
    }
    for (const entries of lines.values()) {
      for (let i = 0; i < entries.length - 1; i += 1) {
        assert.equal(entries[i].answer.at(-1), entries[i + 1].answer[0], puzzle.title);
        assert.equal(entries[i].cells.at(-1), entries[i + 1].cells[0], puzzle.title);
      }
    }
  }
});

test('answers and clues do not repeat across levels', () => {
  const answers = new Set();
  const clues = new Set();
  for (const puzzle of PUZZLES) {
    for (const entry of puzzle.entries) {
      assert.ok(!answers.has(entry.answer), entry.answer);
      assert.ok(!clues.has(entry.clue), entry.clue);
      answers.add(entry.answer);
      clues.add(entry.clue);
    }
  }
});

test('the bank contains every missing character', () => {
  for (const puzzle of PUZZLES) {
    const bank = puzzle.bank.slice();
    for (const position of puzzle.blanks) {
      const at = bank.indexOf(puzzle.solution[position]);
      assert.notEqual(at, -1, `${puzzle.title} 缺少 ${puzzle.solution[position]}`);
      bank.splice(at, 1);
    }
  }
});

test('the bank order is genuinely shuffled', () => {
  const rotated = (a, b) => a.length === b.length && (a + a).includes(b);
  for (const puzzle of PUZZLES) {
    const required = puzzle.blanks.map((position) => puzzle.solution[position]).join('');
    const bank = puzzle.bank.join('');
    if (puzzle.bank.length === required.length) {
      assert.equal(rotated(bank, required), false, `${puzzle.title} 的字池仍按答案顺序旋转`);
    } else {
      assert.notEqual(puzzle.bank.slice(0, required.length).join(''), required, `${puzzle.title} 的字池把答案排在了前面`);
    }
  }
});
test('every level can be completed by placing the correct tiles', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const state = solveLevel(index);
    assert.equal(isSolved(state), true, PUZZLES[index].title);
    assert.equal(state.status, 'won');
  }
});

test('a wrong character does not complete the level', () => {
  const puzzle = PUZZLES[0];
  const position = puzzle.blanks[0];
  let state = createState(0);
  const wrong = state.tiles.find((tile) => tile.char !== puzzle.solution[position]);
  state = placeTile(state, wrong.tileId, position);
  assert.equal(isSolved(state), false);
  assert.notEqual(tileAt(state, position).char, puzzle.solution[position]);
});

test('a placed tile can be moved to another blank', () => {
  const puzzle = PUZZLES[1];
  let state = createState(1);
  const first = puzzle.blanks[0];
  const tile = state.tiles.find((item) => item.char === puzzle.solution[first]);
  state = placeTile(state, tile.tileId, first);
  const second = puzzle.blanks[1];
  state = placeTile(state, tile.tileId, second);
  assert.equal(state.placements[first], null);
  assert.equal(state.placements[second], tile.tileId);
});

test('placing onto an occupied blank sends the old tile back to the bank', () => {
  const puzzle = PUZZLES[1];
  let state = createState(1);
  const position = puzzle.blanks[0];
  const [a, b] = state.tiles.filter((tile) => tile.char !== puzzle.solution[position]).slice(0, 2);
  state = placeTile(state, a.tileId, position);
  state = placeTile(state, b.tileId, position);
  assert.equal(state.placements[position], b.tileId);
  assert.equal(state.tiles[a.tileId].at, null);
});

test('taking a tile back clears the cell', () => {
  const puzzle = PUZZLES[0];
  const position = puzzle.blanks[0];
  let state = createState(0);
  const tile = state.tiles.find((item) => item.char === puzzle.solution[position]);
  state = placeTile(state, tile.tileId, position);
  state = takeTile(state, position);
  assert.equal(state.placements[position], null);
  assert.equal(state.tiles[tile.tileId].at, null);
});

test('entry status tracks empty and correct lines', () => {
  const puzzle = PUZZLES[0];
  const entryIndex = puzzle.entries.findIndex((entry) => entry.cells.some((position) => puzzle.blanks.includes(position)));
  const entry = puzzle.entries[entryIndex];
  let state = createState(0);
  assert.equal(entryStatus(state, entryIndex), 'empty');
  for (const position of entry.cells.filter((position) => puzzle.blanks.includes(position))) {
    const tile = state.tiles.find((item) => item.at === null && item.char === puzzle.solution[position]);
    state = placeTile(state, tile.tileId, position);
  }
  assert.equal(entryStatus(state, entryIndex), 'correct');
});

test('cross levels use two lines and one shared cell', () => {
  const cross = PUZZLES.find((puzzle) => puzzle.kind === 'cross');
  assert.ok(cross, '至少要有一个交叉关');
  assert.equal(new Set(cross.entries.map((entry) => entry.line)).size, 2);
  const shared = new Map();
  for (const entry of cross.entries) {
    for (const cell of entry.cells) shared.set(cell, (shared.get(cell) || 0) + 1);
  }
  assert.ok([...shared.values()].some((count) => count > 1), '交叉关要有一个共享格');
});

test('the hint always names a correct tile for a missing character', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const puzzle = PUZZLES[index];
    const state = createState(index);
    const hint = nextHint(state);
    assert.ok(hint, puzzle.title);
    assert.equal(state.tiles[hint.tileId].char, puzzle.solution[hint.position]);
    assert.ok(puzzle.blanks.includes(hint.position));
  }
});