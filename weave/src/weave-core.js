// WEAVE 纯逻辑：连续成语链、共享字、字块放置与完成判定。不碰 DOM，可直接单测。
import { LEVELS } from './levels.js';

function buildPuzzle(config, index) {
  const blanks = [...config.mask].flatMap((flag, position) => flag === '1' ? [position] : []);
  const cells = config.cells ?? [...config.solution].map((char, position) => ({ row: 0, col: position }));
  const entries = config.idioms.map((entry, entryIndex) => {
    const cellsForEntry = entry.cells ?? Array.from({ length: [...entry.answer].length }, (_, offset) => entry.start + offset);
    return {
      index: entryIndex,
      answer: entry.answer,
      clue: entry.clue,
      hiddenClue: Boolean(entry.hiddenClue),
      line: entry.line ?? 0,
      start: entry.start ?? cellsForEntry[0],
      cells: cellsForEntry,
      length: [...entry.answer].length
    };
  });
  return {
    index,
    kind: config.kind ?? 'chain',
    title: config.title,
    hint: config.hint,
    solution: config.solution,
    mask: config.mask,
    width: config.width ?? config.solution.length,
    height: config.height ?? 1,
    cells,
    blanks,
    bank: config.bank.slice(),
    entries
  };
}

export const PUZZLES = LEVELS.map(buildPuzzle);

export function getPuzzleCount() { return PUZZLES.length; }
export function getPuzzleInfo(index) { return PUZZLES[index] ?? null; }

export function createState(index = 0) {
  const puzzle = PUZZLES[index];
  if (!puzzle) return null;
  return {
    puzzleIndex: index,
    placements: Array(puzzle.solution.length).fill(null),
    tiles: puzzle.bank.map((char, tileId) => ({ tileId, char, at: null })),
    status: 'playing'
  };
}

export function tileAt(state, position) {
  const tileId = state.placements[position];
  return tileId === null ? null : state.tiles[tileId];
}

export function canPlace(state, position) {
  const puzzle = PUZZLES[state.puzzleIndex];
  return state.status === 'playing' && puzzle.blanks.includes(position);
}

export function isSolved(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  return puzzle.blanks.every((position) => {
    const tile = tileAt(state, position);
    return tile && tile.char === puzzle.solution[position];
  });
}

export function placeTile(state, tileId, position) {
  if (!canPlace(state, position)) return state;
  const tile = state.tiles[tileId];
  if (!tile) return state;
  if (state.placements[position] === tileId) return state;

  const placements = state.placements.slice();
  const tiles = state.tiles.map((item) => ({ ...item }));
  const source = placements.indexOf(tileId);
  const occupant = placements[position];

  if (occupant === null) {
    if (source !== -1) placements[source] = null;
  } else {
    if (source !== -1) {
      placements[source] = occupant;
      tiles[occupant].at = source;
    } else {
      tiles[occupant].at = null;
    }
  }

  placements[position] = tileId;
  tiles[tileId].at = position;
  const next = { ...state, placements, tiles };
  if (isSolved(next)) next.status = 'won';
  return next;
}

export function takeTile(state, position) {
  if (state.status !== 'playing') return state;
  const tileId = state.placements[position];
  if (tileId === null) return state;
  const placements = state.placements.slice();
  const tiles = state.tiles.map((item) => ({ ...item }));
  placements[position] = null;
  tiles[tileId].at = null;
  return { ...state, placements, tiles };
}

export function entryStatus(state, entryIndex) {
  const puzzle = PUZZLES[state.puzzleIndex];
  const entry = puzzle.entries[entryIndex];
  if (!entry) return 'empty';
  const positions = entry.cells;
  const blankPositions = positions.filter((position) => puzzle.blanks.includes(position));
  const allCorrect = positions.every((position) => {
    if (!puzzle.blanks.includes(position)) return true;
    const tile = tileAt(state, position);
    return tile && tile.char === puzzle.solution[position];
  });
  if (!blankPositions.length) return allCorrect ? 'correct' : 'wrong';
  const filled = blankPositions.filter((position) => state.placements[position] !== null).length;
  if (!filled) return 'empty';
  if (filled < blankPositions.length) return 'partial';
  return allCorrect ? 'correct' : 'wrong';
}

export function nextHint(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  for (const position of puzzle.blanks) {
    const current = tileAt(state, position);
    if (current && current.char === puzzle.solution[position]) continue;
    const wanted = puzzle.solution[position];
    const unused = state.tiles.find((tile) => tile.at === null && tile.char === wanted);
    if (unused) return { position, tileId: unused.tileId };
    const elsewhere = state.tiles.find((tile) => tile.at !== null && tile.at !== position && tile.char === wanted);
    if (elsewhere) return { position, tileId: elsewhere.tileId };
  }
  return null;
}

export function remainingBlanks(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  return puzzle.blanks.filter((position) => state.placements[position] === null).length;
}

export function usedTileCount(state) {
  return state.tiles.filter((tile) => tile.at !== null).length;
}