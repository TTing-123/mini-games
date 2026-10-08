// 浏览器实测：桌面鼠标 + 手机触屏。
// 用法：NODE_PATH=.pw-tmp/node_modules node topple/tools/browser-check.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.TOPPLE_URL || 'http://127.0.0.1:8080/topple/';
const OUT = path.join(__dirname, '.browser-check');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const record = (name, ok, detail) => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};
const label = async (page, selector) => (await page.textContent(selector)).trim();

async function view(page) {
  const box = await page.locator('#board').boundingBox();
  const geo = await page.evaluate(() => {
    const hook = window.__topple;
    if (!hook || !hook.geo) return null;
    return { ox: hook.geo.ox, oy: hook.geo.oy, cell: hook.geo.cell };
  });
  if (!box || !geo) throw new Error('board geometry unavailable');
  const at = (row, col) => ({ x: box.x + geo.ox + (col + 0.5) * geo.cell, y: box.y + geo.oy + (row + 0.5) * geo.cell });
  return {
    box,
    click: (row, col) => page.mouse.click(at(row, col).x, at(row, col).y),
    tap: (row, col) => page.touchscreen.tap(at(row, col).x, at(row, col).y)
  };
}

(async () => {
  const browser = await chromium.launch();

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(BASE + '?debug=1', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  record('loads level 0', (await label(page, '#level-label')) === '0 / 9', await label(page, '#level-label'));
  record('level grid lists every level', (await page.locator('.level-grid .level-button').count()) === 10);
  record('favicon linked', (await page.getAttribute('link[rel="icon"]', 'href')) === './favicon.svg');
  record('starts with one removal', (await label(page, '#left-label')) === '1 / 1');

  let board = await view(page);
  await board.click(1, 2);                 // 拆掉金块旁边的支撑
  await page.waitForTimeout(150);
  record('removing the support spends a removal', (await label(page, '#left-label')) === '0 / 1');
  await page.waitForTimeout(600);
  record('the gold lands on the target', await page.isVisible('#result') && (await label(page, '#result-kicker')) === '金块到位');
  await page.screenshot({ path: path.join(OUT, 'desktop-win.png') });

  await page.click('#result-next');
  await page.waitForTimeout(250);
  record('next level loads', (await label(page, '#level-label')) === '1 / 9');
  record('next level has two removals', (await label(page, '#left-label')) === '2 / 2');

  await page.click('#hint');
  await page.waitForTimeout(150);
  record('hint keeps the page alive', await page.isVisible('#board'));

  await page.locator('.level-grid .level-button').nth(9).click();
  await page.waitForTimeout(250);
  record('level grid jumps to 9', (await label(page, '#level-label')) === '9 / 9', await label(page, '#level-label'));
  record('big level has four removals', (await label(page, '#left-label')) === '4 / 4');
  await page.screenshot({ path: path.join(OUT, 'desktop-level9.png') });

  board = await view(page);
  await board.click(3, 1);                 // 拆一块挡路的
  await page.waitForTimeout(200);
  record('removal works on a big level', (await label(page, '#left-label')) === '3 / 4', await label(page, '#left-label'));
  await page.click('#restart');
  await page.waitForTimeout(200);
  record('restart restores removals', (await label(page, '#left-label')) === '4 / 4');

  // 金块本身拆不掉
  const gold = await page.evaluate(() => window.__topple.state.gold);
  board = await view(page);
  await board.click(gold[0], gold[1]);
  await page.waitForTimeout(150);
  record('the gold block cannot be removed', (await label(page, '#left-label')) === '4 / 4');

  // 失败路径：把次数用光
  board = await view(page);
  for (const cell of [[3, 1], [5, 1], [7, 1], [2, 2]]) {
    await board.click(cell[0], cell[1]);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(600);
  record('running out of removals shows the failure panel', await page.isVisible('#result') && (await label(page, '#result-kicker')) === '砖用完了');
  await page.screenshot({ path: path.join(OUT, 'desktop-lose.png') });
  await page.close();
  await ctx.close();

  const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phone = await phoneCtx.newPage();
  phone.on('console', (m) => { if (m.type() === 'error') errors.push('phone console: ' + m.text()); });
  phone.on('pageerror', (e) => errors.push('phone pageerror: ' + e.message));
  await phone.goto(BASE + '?debug=1', { waitUntil: 'load' });
  await phone.waitForTimeout(500);
  const touch = await view(phone);
  await touch.tap(1, 2);
  await phone.waitForTimeout(300);
  record('touch removes a block', (await label(phone, '#left-label')) === '0 / 1', await label(phone, '#left-label'));
  record('no horizontal scroll on phone', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  const box = await phone.locator('#board').boundingBox();
  record('board fits the phone', !!box && box.x >= 0 && box.x + box.width <= 391, JSON.stringify(box));
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