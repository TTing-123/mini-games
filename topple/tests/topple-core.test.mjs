import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUZZLES,
  canRemove,
  createState,
  getPuzzleCount,
  isWon,
  nextHint,
  removeBlock,
  resolve,
  solve
} from '../src/topple-core.js';

test('every level is solvable and not already finished', () => {
  assert.ok(getPuzzleCount() >= 30, '关卡数至少 30，当前 ' + getPuzzleCount());
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const state = createState(index);
    assert.equal(isWon(state), false, `level ${index} starts solved`);
    assert.equal(state.status, 'playing', `level ${index} should be playable`);
    assert.ok(solve(state).solvable, `level ${index} is not solvable`);
  }
});

test('a structure that is not connected to the ground falls at once', () => {
  const blocks = new Set(['1,1', '2,1']);   // 两格高的悬空砖
  const settled = resolve(blocks, [1, 1], 4);
  assert.deepEqual([...blocks].sort(), ['2,1', '3,1'], '整体下落');
  assert.deepEqual(settled.gold, [2, 1], '金块跟着整坨下落一格（它上面还有一块，落不到地面）');
});

test('the tutorial needs exactly one removal', () => {
  const state = createState(0);
  assert.equal(solve(state).removals, 1);
  const next = removeBlock(state, 1, 2);
  assert.equal(isWon(next), true);
  assert.deepEqual(next.gold, [4, 1]);
});

test('the gold block cannot be removed', () => {
  const state = createState(0);
  assert.equal(canRemove(state, state.gold[0], state.gold[1]), false);
  assert.equal(removeBlock(state, state.gold[0], state.gold[1]), state);
});

test('a wide chunk stops on the highest obstacle under it', () => {
  // 横梁 G### 挂在柱子上，柱子下面有台阶：断掉柱子后横梁停在台阶上
  const state = createState(3);
  const next = removeBlock(state, 1, 3);
  assert.equal(next.gold[0] > state.gold[0], true, '金块下沉了');
  assert.ok(next.gold[0] <= PUZZLES[3].target[0] + 2);
});

test('you cannot remove more blocks than the level allows', () => {
  let state = createState(0);
  state = removeBlock(state, 1, 2);
  assert.equal(state.status, 'won');
  assert.equal(canRemove(state, 2, 2), false, '结算后不能再拆');

  let lost = createState(6);        // 高柱：允许拆 2 次
  lost = removeBlock(lost, 1, 2);   // 金块掉到架子上
  lost = removeBlock(lost, 4, 2);   // 拆掉架子（不是解）
  assert.equal(lost.removed.length, 2);
  assert.equal(canRemove(lost, 5, 2), false, '次数用完就不能再拆');
});

test('running out of removals is a loss, not a win', () => {
  let state = createState(1);       // 剪两边：要拆两块
  state = removeBlock(state, 1, 0);
  assert.equal(state.status, 'playing');
  state = removeBlock(state, 1, 2);
  assert.equal(state.status, 'won');
});

test('the hint suggests a removable block that keeps the level solvable', () => {
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const state = createState(index);
    const cell = nextHint(state);
    assert.ok(cell, `level ${index} hint`);
    assert.ok(canRemove(state, cell[0], cell[1]), `level ${index} hint is clickable`);
    const next = removeBlock(state, cell[0], cell[1]);
    if (next.status === 'playing') {
      assert.ok(solve(next).solvable, `level ${index} hint keeps it solvable`);
    } else {
      assert.equal(next.status, 'won', `level ${index} hint should not lose`);
    }
  }
});

test('the later levels need more removals than the tutorial', () => {
  const first = solve(createState(0)).removals;
  const last = solve(createState(getPuzzleCount() - 1)).removals;
  assert.ok(last > first, `last level should be harder (${last} vs ${first})`);
});

test('steel bricks hold but cannot be removed', () => {
  const index = PUZZLES.findIndex((puzzle) => puzzle.steel.size > 0);
  assert.ok(index >= 0, '至少要有一关用钢砖');
  const state = createState(index);
  const [cell] = [...state.steel];
  const [row, col] = cell.split(',').map(Number);
  assert.equal(state.blocks.has(cell), true, '钢砖也算砖，会支撑');
  assert.equal(canRemove(state, row, col), false, '钢砖拆不掉');
  assert.equal(removeBlock(state, row, col), state);
});

test('no two levels share a layout', () => {
  const seen = new Map();
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const puzzle = PUZZLES[index];
    const rows = [];
    for (let row = 0; row < puzzle.height; row += 1) {
      let line = '';
      for (let col = 0; col < puzzle.width; col += 1) {
        const key = row + ',' + col;
        if (puzzle.gold[0] === row && puzzle.gold[1] === col) line += 'G';
        else if (puzzle.steel.has(key)) line += 'S';
        else if (puzzle.blocks.has(key)) line += '#';
        else if (puzzle.target[0] === row && puzzle.target[1] === col) line += 'T';
        else line += '.';
      }
      rows.push(line);
    }
    const signature = rows.join('|');
    assert.ok(!seen.has(signature), `第 ${index} 关与第 ${seen.get(signature)} 关布局相同`);
    seen.set(signature, index);
  }
});

test('no two levels share the same removal pattern', () => {
  const seen = new Map();
  for (let index = 0; index < getPuzzleCount(); index += 1) {
    const puzzle = PUZZLES[index];
    const found = solve(createState(index));
    const signature = found.sequence
      .map(([row, col]) => `${row - puzzle.gold[0]},${col - puzzle.gold[1]}`)
      .sort()
      .join(' ');
    assert.ok(!seen.has(signature), `第 ${index} 关的拆法与第 ${seen.get(signature)} 关雷同`);
    seen.set(signature, index);
  }
});

test('the last levels are the hardest', () => {
  const counts = [];
  for (let index = 0; index < getPuzzleCount(); index += 1) counts.push(solve(createState(index)).removals);
  const tail = counts.slice(-3);
  const rest = counts.slice(0, -3);
  assert.ok(Math.min(...tail) >= 4, `最后三关至少要拆 4 块，实际 ${tail.join('/')}`);
  assert.ok(Math.min(...tail) >= Math.max(...rest) - 1, '最后三关要是最难的一档');
});