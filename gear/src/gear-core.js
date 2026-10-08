// GEAR 纯逻辑：装配、传动比、目标判定、解法搜索。不碰 DOM，可直接单测。
import { LEVELS } from './levels.js';

export const ANGLE_STEP = 15;      // 目标角度按 15° 一格
export const TOLERANCE = 1;        // 只认真正落在刻度上的结果（1° 内算浮点误差）

function parseLevel(config, index) {
  const stages = config.stages;
  return {
    index,
    title: config.title,
    hint: config.hint ?? '',
    tutorial: Boolean(config.tutorial),
    stages,
    slots: stages * 2,           // 每级两个槽：主动 + 从动
    parts: config.parts.slice(),
    targetAngle: config.targetAngle,
    targetDir: config.targetDir ?? (stages % 2 === 1 ? -1 : 1)
  };
}

export const PUZZLES = LEVELS.map(parseLevel);

export function getPuzzleCount() {
  return PUZZLES.length;
}

export function getPuzzleInfo(index) {
  return PUZZLES[index] ?? null;
}

export function createState(index = 0) {
  const puzzle = PUZZLES[index];
  if (!puzzle) return null;
  return {
    puzzleIndex: index,
    slots: Array.from({ length: puzzle.slots }, () => null),   // 存零件下标；null = 空
    selected: null,
    won: false
  };
}

export function partAt(state, slot) {
  const used = state.slots[slot];
  if (used === null || used === undefined) return null;
  const puzzle = PUZZLES[state.puzzleIndex];
  return { teeth: puzzle.parts[used], part: used };
}

export function partUsedAt(state, partIndex) {
  return state.slots.indexOf(partIndex);
}

// 放入齿轮：已经装在别处的同一个齿轮会被搬过来（一个齿轮只能用一次）。
export function placePart(state, slot, partIndex) {
  const puzzle = PUZZLES[state.puzzleIndex];
  if (slot < 0 || slot >= puzzle.slots) return state;
  if (partIndex < 0 || partIndex >= puzzle.parts.length) return state;
  const slots = state.slots.slice();
  const previous = slots.indexOf(partIndex);
  if (previous >= 0) slots[previous] = null;
  slots[slot] = partIndex;
  return { ...state, slots, selected: null, won: isSolved({ ...state, slots }) };
}

export function clearSlot(state, slot) {
  if (state.slots[slot] === null) return state;
  const slots = state.slots.slice();
  slots[slot] = null;
  return { ...state, slots, won: false };
}

export function selectPart(state, partIndex) {
  return { ...state, selected: state.selected === partIndex ? null : partIndex };
}

export function filledSlots(state) {
  return state.slots.filter((value) => value !== null).length;
}

// 传动结果：总比、输出角度、方向。槽没填满时 complete = false。
export function trainResult(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  let ratio = 1;
  let complete = true;
  for (let stage = 0; stage < puzzle.stages; stage += 1) {
    const drive = partAt(state, stage * 2);
    const driven = partAt(state, stage * 2 + 1);
    if (!drive || !driven) {
      complete = false;
      break;
    }
    ratio *= driven.teeth / drive.teeth;
  }
  const dir = puzzle.stages % 2 === 1 ? -1 : 1;
  return {
    complete,
    ratio,
    angle: complete ? normalizeAngle(360 * ratio) : null,
    dir
  };
}

export function normalizeAngle(angle) {
  const wrapped = angle % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function angleDistance(a, b) {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

export function isSolved(state) {
  const puzzle = PUZZLES[state.puzzleIndex];
  const result = trainResult(state);
  if (!result.complete) return false;
  if (result.dir !== puzzle.targetDir) return false;
  return angleDistance(result.angle, puzzle.targetAngle) <= TOLERANCE;
}

// 穷举所有「把零件填满所有槽位」的装配方式（每个零件最多用一次）。
export function searchSolutions(state, limit = 200000) {
  const puzzle = PUZZLES[state.puzzleIndex];
  const found = [];
  const used = new Set();
  const slots = Array.from({ length: puzzle.slots }, () => null);
  let visited = 0;
  let capped = false;
  const walk = (slot) => {
    if (found.length >= 200) { capped = true; return; }
    if (slot >= puzzle.slots) {
      visited += 1;
      if (visited > limit) { capped = true; return; }
      if (isSolved({ puzzleIndex: state.puzzleIndex, slots: slots.slice() })) found.push(slots.slice());
      return;
    }
    for (let part = 0; part < puzzle.parts.length; part += 1) {
      if (used.has(part)) continue;
      used.add(part);
      slots[slot] = part;
      walk(slot + 1);
      slots[slot] = null;
      used.delete(part);
      if (capped) return;
    }
  };
  walk(0);
  return { count: found.length, solutions: found, capped };
}

export function solutionCount(state) {
  return searchSolutions(state).count;
}

// 给提示：返回一个可行装配里的第一个动作（放在哪个槽、用哪个齿轮）。
export function nextHint(state) {
  const { solutions } = searchSolutions(state);
  if (!solutions.length) return null;
  const target = solutions[0];
  for (let slot = 0; slot < target.length; slot += 1) {
    if (state.slots[slot] !== target[slot]) return { slot, part: target[slot] };
  }
  return null;
}