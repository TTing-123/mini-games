import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AMBER,
  CYAN,
  EMPTY,
  SIZE,
  applyMove,
  chooseAiMove,
  createInitialState,
  hasConnection,
  index,
  legalMoves,
  pathDistance
} from '../src/surge-core.js';

function fromRows(rows) {
  const state = createInitialState();
  state.board = rows.flatMap((row) => row.split('').map((cell) => {
    if (cell === 'C') return CYAN;
    if (cell === 'A') return AMBER;
    return EMPTY;
  }));
  return state;
}

test('initial board is empty and cyan moves first', () => {
  const state = createInitialState();
  assert.equal(state.board.length, SIZE * SIZE);
  assert.equal(state.board.every((cell) => cell === EMPTY), true);
  assert.equal(state.turn, CYAN);
  assert.equal(state.winner, null);
});

test('opening position has 168 legal drag moves', () => {
  assert.equal(legalMoves(createInitialState()).length, 168);
});

test('a move places a stone and shifts its whole row', () => {
  const state = createInitialState();
  state.board[index(3, 2)] = CYAN;
  state.board[index(3, 4)] = AMBER;
  const next = applyMove(state, { r: 3, c: 3, dr: 0, dc: 1 });
  assert.equal(next.board[index(3, 3)], CYAN);
  assert.equal(next.board[index(3, 4)], CYAN);
  assert.equal(next.board[index(3, 5)], AMBER);
  assert.equal(state.board[index(3, 3)], EMPTY, 'original state must not be mutated');
});

test('a stone pushed past the edge is removed', () => {
  const state = createInitialState();
  state.board[index(0, 6)] = AMBER;
  const next = applyMove(state, { r: 0, c: 5, dr: 0, dc: 1 });
  assert.equal(next.board[index(0, 6)], CYAN);
  assert.equal(next.board.includes(AMBER), false);
});

test('the newly placed stone cannot be dragged out of bounds', () => {
  const state = createInitialState();
  assert.equal(applyMove(state, { r: 6, c: 3, dr: 1, dc: 0 }), null);
  assert.equal(applyMove(state, { r: 0, c: 3, dr: -1, dc: 0 }), null);
});

test('cyan wins by connecting top to bottom', () => {
  const board = createInitialState().board;
  for (let row = 0; row < SIZE; row += 1) board[index(row, 3)] = CYAN;
  assert.equal(hasConnection(board, CYAN), true);
  assert.equal(hasConnection(board, AMBER), false);
});

test('amber wins by connecting left to right', () => {
  const board = createInitialState().board;
  for (let col = 0; col < SIZE; col += 1) board[index(3, col)] = AMBER;
  assert.equal(hasConnection(board, AMBER), true);
  assert.equal(hasConnection(board, CYAN), false);
});

test('completing a vertical line through a row push wins', () => {
  const state = fromRows([
    '...C...',
    '...C...',
    '...C...',
    '...C...',
    '...C...',
    '...C...',
    '.......'
  ]);
  const next = applyMove(state, { r: 6, c: 2, dr: 0, dc: 1 });
  assert.equal(next.winner, CYAN);
  assert.equal(next.board[index(6, 3)], CYAN);
});

test('completing a horizontal line through a column push wins', () => {
  const state = fromRows([
    '.......',
    '.......',
    '.......',
    'AAAAAA.',
    '.......',
    '.......',
    '.......'
  ]);
  state.turn = AMBER;
  const next = applyMove(state, { r: 2, c: 6, dr: 1, dc: 0 });
  assert.equal(next.winner, AMBER);
  assert.equal(next.board[index(3, 6)], AMBER);
});

test('path distance drops when stones build a route', () => {
  const open = createInitialState();
  const built = fromRows([
    '...C...',
    '...C...',
    '...C...',
    '...C...',
    '.......',
    '.......',
    '.......'
  ]);
  assert.ok(pathDistance(built.board, CYAN) < pathDistance(open.board, CYAN));
});

test('ai takes an immediate winning move', () => {
  const state = fromRows([
    '.......',
    '.......',
    'AAAAAA.',
    '.......',
    '.......',
    '.......',
    '.......'
  ]);
  state.turn = AMBER;
  const move = chooseAiMove(state, { depth: 2, random: () => 0 });
  assert.ok(move);
  const next = applyMove(state, move);
  assert.equal(next.winner, AMBER);
});
