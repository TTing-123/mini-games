import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLS,
  ROWS,
  applyTileEffects,
  cellCenter,
  cellOf,
  createState,
  findSwapTarget,
  getEntity,
  getLevelCount,
  getLevelInfo,
  lineOfSight,
  movePlayer,
  solidTile,
  swapWith,
  update
} from '../src/swap-core.js';

test('all levels are 15 by 10 maps', () => {
  assert.ok(getLevelCount() >= 5);
  for (let index = 0; index < getLevelCount(); index += 1) {
    const rows = getLevelInfo(index).rows;
    assert.equal(rows.length, ROWS);
    for (const row of rows) assert.equal(row.length, COLS);
  }
});

test('swapping with a crate exchanges the two positions', () => {
  const state = createState(0);
  const crate = getEntity(state, 'crate:1');
  const oldPlayer = { x: state.player.x, y: state.player.y };
  const oldCrate = { x: crate.x, y: crate.y };
  assert.equal(swapWith(state, crate.id), true);
  assert.equal(state.player.x, oldCrate.x);
  assert.equal(state.player.y, oldCrate.y);
  assert.equal(crate.x, oldPlayer.x);
  assert.equal(crate.y, oldPlayer.y);
});

test('a key can be pulled across a pit by swapping twice', () => {
  const state = createState(0);
  assert.equal(swapWith(state, 'crate:1'), true);
  state.swapCooldown = 0;
  const key = getEntity(state, 'key:2');
  const before = { x: state.player.x, y: state.player.y };
  const keyBefore = { x: key.x, y: key.y };
  assert.equal(swapWith(state, key.id), true);
  assert.equal(state.player.x, keyBefore.x);
  assert.equal(key.x, before.x);
  assert.equal(key.collected, false);
});

test('walls block line of sight', () => {
  const state = createState(2);
  assert.equal(lineOfSight(state, cellCenter(1, 1), cellCenter(12, 5)), false);
  assert.equal(lineOfSight(state, cellCenter(1, 1), cellCenter(2, 1)), true);
});

test('the player cannot walk into a pit', () => {
  const state = createState(0);
  const before = { ...state.player };
  movePlayer(state, 0, 1, 1);
  assert.equal(cellOf(state.player).row, cellOf(before).row);
});

test('solid tiles include walls, pits, and closed doors', () => {
  const state = createState(2);
  assert.equal(solidTile(state, 0, 0), true);
  assert.equal(solidTile(state, 2, 1), false);
  assert.equal(solidTile(state, 9, 3), true);
  state.doorOpen = true;
  assert.equal(solidTile(state, 9, 3), false);
});

test('a crate on a plate opens the door', () => {
  const state = createState(2);
  state.player.x = cellCenter(6, 1).x;
  state.player.y = cellCenter(6, 1).y;
  assert.equal(swapWith(state, 'crate:1'), true);
  update(state, 0);
  assert.equal(state.doorOpen, true);
});

test('a crate swapped into a pit fills the pit', () => {
  const state = createState(0);
  const crate = getEntity(state, 'crate:1');
  crate.x = cellCenter(2, 1).x;
  crate.y = cellCenter(2, 1).y;
  applyTileEffects(state);
  assert.equal(getEntity(state, 'crate:1'), null);
  assert.equal(state.tiles[1][2], '.');
});

test('an enemy damages the player on contact', () => {
  const state = createState(3);
  state.player.x = state.enemies[0].x;
  state.player.y = state.enemies[0].y;
  const before = state.player.hp;
  update(state, .05);
  assert.ok(state.player.hp < before);
});

test('the exit only works after the key is collected', () => {
  const state = createState(0);
  state.player.x = state.exit.x;
  state.player.y = state.exit.y;
  update(state, 0);
  assert.equal(state.won, false);
  state.keys.forEach((key) => { key.collected = true; });
  update(state, 0);
  assert.equal(state.won, true);
});
