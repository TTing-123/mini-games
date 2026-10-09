// 浏览器实测：桌面鼠标 + 手机触屏。
// 用法：NODE_PATH=.pw-tmp/node_modules node weave/tools/browser-check.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.WEAVE_URL || 'http://127.0.0.1:8080/weave/';
const OUT = path.join(__dirname, '.browser-check');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const errors = [];
const record = (name, ok, detail) => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};
const label = async (page, selector) => (await page.textContent(selector)).trim();
const pointer = (page, selector, char) => page.evaluate(({ selector, char }) => {
  const nodes = [...document.querySelectorAll(selector)];
  const node = char === undefined ? nodes.find((item) => !item.classList.contains('is-used')) : nodes.find((item) => item.textContent === char && !item.classList.contains('is-used'));
  if (!node) return false;
  node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
  return true;
}, { selector, char });
const tapCell = (page, position) => page.evaluate((position) => {
  const node = document.querySelector(`[data-position="${position}"]`);
  if (!node) return false;
  node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
  return true;
}, position);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  const page = await ctx.newPage();
  page.on('console', (message) => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
  page.on('pageerror', (error) => errors.push('pageerror: ' + error.message));
  await page.goto(BASE + '?debug=1', { waitUntil: 'load' });
  await page.waitForTimeout(300);

  record('loads level 0', (await label(page, '#level-label')) === '0 / 49', await label(page, '#level-label'));
  record('level grid lists every level', (await page.locator('.level-button').count()) === 50);
  record('tutorial starts with three blanks', (await label(page, '#blank-label')) === '3', await label(page, '#blank-label'));
  record('chain fits the desktop panel', await page.evaluate(() => {
    const box = document.querySelector('#chain').getBoundingClientRect();
    return box.left >= 0 && box.right <= window.innerWidth + 1;
  }));

  const blanks = await page.evaluate(() => window.__weave.puzzle.blanks);
  const firstChar = await page.evaluate((position) => window.__weave.puzzle.solution[position], blanks[0]);
  record('a tile can be selected', await pointer(page, '.tile', firstChar));
  await page.waitForTimeout(30);
  record('a blank accepts the selected tile', await tapCell(page, blanks[0]));
  record('placing a tile changes the blank counter', (await label(page, '#blank-label')) === '2', await label(page, '#blank-label'));
  record('the placed character appears in the chain', await page.evaluate((position) => document.querySelector(`[data-position="${position}"]`).textContent.length > 0, blanks[0]));

  await pointer(page, `[data-position="${blanks[0]}"]`);
  await page.waitForTimeout(30);
  record('clicking a filled cell takes it back', (await label(page, '#blank-label')) === '3');

  await page.locator('#restart').dispatchEvent('pointerdown');
  await page.waitForTimeout(50);
  await page.locator('#hint').dispatchEvent('pointerdown');
  await page.waitForTimeout(50);
  record('hint places one correct tile', (await label(page, '#blank-label')) === '2', await label(page, '#blank-label'));

  await page.locator('.level-button').nth(0).dispatchEvent('pointerdown');
  await page.waitForTimeout(50);
  const allBlanks = await page.evaluate(() => window.__weave.puzzle.blanks);
  for (const position of allBlanks) {
    const char = await page.evaluate((position) => window.__weave.puzzle.solution[position], position);
    await pointer(page, '.tile', char);
    await page.waitForTimeout(10);
    await tapCell(page, position);
  }
  await page.waitForTimeout(120);
  record('solving opens the result panel', await page.isVisible('#result'));
  record('result names the level', (await label(page, '#result-title')) === '一心一意');
  await page.screenshot({ path: path.join(OUT, 'desktop-win.png') });

  await page.click('#result-next');
  await page.waitForTimeout(80);
  record('next level loads', (await label(page, '#level-label')) === '1 / 49');
  await page.locator('.level-button').nth(12).dispatchEvent('pointerdown');
  await page.waitForTimeout(80);
  record('cross level uses a grid board', await page.locator('#chain.is-grid').count() === 1);
  record('cross level has 25 shared cells', await page.locator('#chain .cell').count() === 25);
  record('cross level shows eight clues', await page.locator('#clues .clue').count() === 8);
  record('cross level starts with twelve blanks', (await label(page, '#blank-label')) === '12', await label(page, '#blank-label'));
  await page.locator('.level-button').nth(40).dispatchEvent('pointerdown');
  await page.waitForTimeout(80);
  record('net level uses a grid board', await page.locator('#chain.is-grid').count() === 1);
  record('net level shows a hidden clue', await page.locator('#clues .clue.is-hidden').count() > 0);
  await page.locator('.level-button').nth(49).dispatchEvent('pointerdown');
  await page.waitForTimeout(80);
  record('level grid jumps to the end', (await label(page, '#level-label')) === '49 / 49');
  record('final net level is playable', Number(await label(page, '#blank-label')) > 0);
  await page.screenshot({ path: path.join(OUT, 'desktop-final.png') });
  await page.close();
  await ctx.close();

  const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phone = await phoneCtx.newPage();
  phone.on('console', (message) => { if (message.type() === 'error') errors.push('phone console: ' + message.text()); });
  phone.on('pageerror', (error) => errors.push('phone pageerror: ' + error.message));
  await phone.goto(BASE + '?debug=1', { waitUntil: 'load' });
  await phone.waitForTimeout(250);
  const tileBox = await phone.locator('.tile').first().boundingBox();
  const cellBox = await phone.locator('.cell.is-empty').first().boundingBox();
  if (tileBox && cellBox) await phone.touchscreen.tap(tileBox.x + tileBox.width / 2, tileBox.y + tileBox.height / 2);
  if (tileBox && cellBox) await phone.touchscreen.tap(cellBox.x + cellBox.width / 2, cellBox.y + cellBox.height / 2);
  await phone.waitForTimeout(80);
  record('touch places a tile', (await label(phone, '#blank-label')) === '2', await label(phone, '#blank-label'));
  record('no horizontal scroll on phone', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  record('chain fits the phone', await phone.evaluate(() => {
    const box = document.querySelector('#chain').getBoundingClientRect();
    return box.left >= 0 && box.right <= window.innerWidth + 1;
  }));
  await phone.screenshot({ path: path.join(OUT, 'phone.png') });
  await phone.close();
  await phoneCtx.close();

  await browser.close();
  console.log(results.join('\n'));
  console.log(`\nscreenshots: ${OUT}`);
  if (errors.length) {
    console.log('\nconsole/page errors:');
    console.log(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('no console or page errors');
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});