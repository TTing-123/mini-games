export const SIZE = 7;
export const EMPTY = 0;
export const CYAN = 1;
export const AMBER = 2;

export const WIN_SCORE = 1000000;
const FAR = 999;

export const DIRECTIONS = [
  { dr: 0, dc: -1, key: 'left' },
  { dr: 0, dc: 1, key: 'right' },
  { dr: -1, dc: 0, key: 'up' },
  { dr: 1, dc: 0, key: 'down' }
];

export function index(row, col) {
  return row * SIZE + col;
}

export function inBounds(row, col) {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
}

export function other(player) {
  return player === CYAN ? AMBER : CYAN;
}

export function createInitialState() {
  return {
    board: new Array(SIZE * SIZE).fill(EMPTY),
    turn: CYAN,
    winner: null,
    ply: 0,
    last: null
  };
}

export function cloneState(state) {
  return {
    board: state.board.slice(),
    turn: state.turn,
    winner: state.winner,
    ply: state.ply,
    last: state.last ? { ...state.last } : null
  };
}

function isMoveShape(move) {
  if (!move || !Number.isInteger(move.r) || !Number.isInteger(move.c)) return false;
  if (!Number.isInteger(move.dr) || !Number.isInteger(move.dc)) return false;
  return Math.abs(move.dr) + Math.abs(move.dc) === 1;
}

export function isLegalMove(state, move) {
  if (!state || state.winner || !isMoveShape(move)) return false;
  if (!inBounds(move.r, move.c)) return false;
  if (state.board[index(move.r, move.c)] !== EMPTY) return false;
  return inBounds(move.r + move.dr, move.c + move.dc);
}

export function legalMoves(state) {
  if (!state || state.winner) return [];
  const moves = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (state.board[index(r, c)] !== EMPTY) continue;
      for (const direction of DIRECTIONS) {
        const move = { r, c, dr: direction.dr, dc: direction.dc };
        if (isLegalMove(state, move)) moves.push(move);
      }
    }
  }
  return moves;
}

function shiftLine(board, row, col, dr, dc) {
  if (dc !== 0) {
    const direction = dc;
    if (direction > 0) {
      for (let x = SIZE - 1; x >= 0; x -= 1) {
        const value = board[index(row, x)];
        board[index(row, x)] = EMPTY;
        if (x + 1 < SIZE) board[index(row, x + 1)] = value;
      }
    } else {
      for (let x = 0; x < SIZE; x += 1) {
        const value = board[index(row, x)];
        board[index(row, x)] = EMPTY;
        if (x - 1 >= 0) board[index(row, x - 1)] = value;
      }
    }
    return;
  }

  const direction = dr;
  if (direction > 0) {
    for (let y = SIZE - 1; y >= 0; y -= 1) {
      const value = board[index(y, col)];
      board[index(y, col)] = EMPTY;
      if (y + 1 < SIZE) board[index(y + 1, col)] = value;
    }
  } else {
    for (let y = 0; y < SIZE; y += 1) {
      const value = board[index(y, col)];
      board[index(y, col)] = EMPTY;
      if (y - 1 >= 0) board[index(y - 1, col)] = value;
    }
  }
}

export function applyMove(state, move) {
  if (!isLegalMove(state, move)) return null;
  const player = state.turn;
  const next = cloneState(state);
  next.board[index(move.r, move.c)] = player;
  shiftLine(next.board, move.r, move.c, move.dr, move.dc);
  next.last = {
    r: move.r,
    c: move.c,
    dr: move.dr,
    dc: move.dc,
    player,
    toR: move.r + move.dr,
    toC: move.c + move.dc
  };
  next.ply += 1;
  next.turn = other(player);

  const opponent = other(player);
  const opponentConnected = hasConnection(next.board, opponent);
  const playerConnected = hasConnection(next.board, player);
  if (opponentConnected) next.winner = opponent;
  else if (playerConnected) next.winner = player;
  return next;
}

function edgeCells(player) {
  const cells = [];
  if (player === CYAN) {
    for (let col = 0; col < SIZE; col += 1) cells.push(index(0, col));
  } else {
    for (let row = 0; row < SIZE; row += 1) cells.push(index(row, 0));
  }
  return cells;
}

function targetCells(player) {
  const cells = [];
  if (player === CYAN) {
    for (let col = 0; col < SIZE; col += 1) cells.push(index(SIZE - 1, col));
  } else {
    for (let row = 0; row < SIZE; row += 1) cells.push(index(row, SIZE - 1));
  }
  return cells;
}

function neighbors(cell) {
  const row = Math.floor(cell / SIZE);
  const col = cell % SIZE;
  const result = [];
  if (row > 0) result.push(index(row - 1, col));
  if (row < SIZE - 1) result.push(index(row + 1, col));
  if (col > 0) result.push(index(row, col - 1));
  if (col < SIZE - 1) result.push(index(row, col + 1));
  return result;
}

export function hasConnection(board, player) {
  const targets = new Set(targetCells(player));
  const seen = new Uint8Array(SIZE * SIZE);
  const queue = [];
  for (const cell of edgeCells(player)) {
    if (board[cell] !== player) continue;
    seen[cell] = 1;
    queue.push(cell);
  }

  for (let head = 0; head < queue.length; head += 1) {
    const cell = queue[head];
    if (targets.has(cell)) return true;
    for (const next of neighbors(cell)) {
      if (seen[next] || board[next] !== player) continue;
      seen[next] = 1;
      queue.push(next);
    }
  }
  return false;
}

export function pathDistance(board, player) {
  const opponent = other(player);
  const distances = new Array(SIZE * SIZE).fill(Infinity);
  const deque = [];

  const add = (cell, cost, front) => {
    if (cost >= distances[cell]) return;
    distances[cell] = cost;
    if (front) deque.unshift(cell);
    else deque.push(cell);
  };

  for (const cell of edgeCells(player)) {
    const value = board[cell];
    if (value === opponent) continue;
    add(cell, value === player ? 0 : 1, value === player);
  }

  while (deque.length) {
    const cell = deque.shift();
    const current = distances[cell];
    for (const next of neighbors(cell)) {
      const value = board[next];
      if (value === opponent) continue;
      const cost = value === player ? 0 : 1;
      add(next, current + cost, cost === 0);
    }
  }

  let best = Infinity;
  for (const cell of targetCells(player)) best = Math.min(best, distances[cell]);
  return Number.isFinite(best) ? best : FAR;
}

function materialScore(board, player) {
  let score = 0;
  for (const cell of board) {
    if (cell === player) score += 1;
    else if (cell === other(player)) score -= 1;
  }
  return score;
}

function centerScore(board, player) {
  const middle = (SIZE - 1) / 2;
  let score = 0;
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const cell = board[index(r, c)];
      if (cell !== player && cell !== other(player)) continue;
      const weight = Math.max(0, 6 - Math.abs(r - middle) - Math.abs(c - middle));
      if (cell === player) score += weight;
      else score -= weight;
    }
  }
  return score;
}

function adjacencyScore(board, player) {
  let score = 0;
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const cell = board[index(r, c)];
      if (cell !== player && cell !== other(player)) continue;
      if (c + 1 < SIZE && board[index(r, c + 1)] === cell) score += cell === player ? 1 : -1;
      if (r + 1 < SIZE && board[index(r + 1, c)] === cell) score += cell === player ? 1 : -1;
    }
  }
  return score;
}

export function evaluateState(state, player) {
  if (state.winner === player) return WIN_SCORE - state.ply;
  if (state.winner) return -WIN_SCORE + state.ply;
  const opponent = other(player);
  const ownDistance = pathDistance(state.board, player);
  const opponentDistance = pathDistance(state.board, opponent);
  return (opponentDistance - ownDistance) * 90
    + materialScore(state.board, player) * 8
    + centerScore(state.board, player) * 2
    + adjacencyScore(state.board, player);
}

function movePriority(state, move) {
  const middle = (SIZE - 1) / 2;
  const center = 6 - Math.abs(move.r - middle) - Math.abs(move.c - middle);
  const targetRow = move.r + move.dr;
  const targetCol = move.c + move.dc;
  const targetCenter = 6 - Math.abs(targetRow - middle) - Math.abs(targetCol - middle);
  return center * 2 + targetCenter;
}

function orderedMoves(state, moves) {
  return moves.slice().sort((a, b) => movePriority(state, b) - movePriority(state, a));
}

function minimax(state, depth, alpha, beta, ai) {
  if (state.winner) return state.winner === ai ? WIN_SCORE - state.ply : -WIN_SCORE + state.ply;
  if (depth <= 0) return evaluateState(state, ai);
  const moves = orderedMoves(state, legalMoves(state));
  if (!moves.length) return evaluateState(state, ai);

  if (state.turn === ai) {
    let value = -Infinity;
    for (const move of moves) {
      const next = applyMove(state, move);
      value = Math.max(value, minimax(next, depth - 1, alpha, beta, ai));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  }

  let value = Infinity;
  for (const move of moves) {
    const next = applyMove(state, move);
    value = Math.min(value, minimax(next, depth - 1, alpha, beta, ai));
    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }
  return value;
}

export function chooseAiMove(state, options = {}) {
  if (!state || state.winner) return null;
  const ai = options.player ?? state.turn;
  const depth = options.depth ?? 2;
  const random = options.random ?? Math.random;
  const moves = legalMoves(state);
  if (!moves.length) return null;

  for (const move of moves) {
    const next = applyMove(state, move);
    if (next.winner === ai) return move;
  }

  let bestScore = -Infinity;
  let bestMoves = [];
  for (const move of orderedMoves(state, moves)) {
    const next = applyMove(state, move);
    const score = next.winner
      ? (next.winner === ai ? WIN_SCORE : -WIN_SCORE)
      : minimax(next, depth - 1, -Infinity, Infinity, ai);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  if (!bestMoves.length) return moves[0];
  return bestMoves[Math.floor(random() * bestMoves.length)];
}
