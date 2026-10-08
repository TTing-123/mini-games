// 浏览器实测：桌面鼠标 + 手机触屏。
// 用法：NODE_PATH=.pw-tmp/node_modules node immune/tools/browser-check.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.IMMUNE_URL || 'http://127.0.0.1:8080/immune/';
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
    const hook = window.__immune;
    if (!hook || !hook.geo) return null;
    return { ox: hook.geo.ox, oy: hook.geo.oy, cell: hook.geo.cell };
  });
  if (!box || !geo) throw new Error('board geometry unavailable');
  const at = (row, col) => ({ x: box.x + geo.ox + (col + 0.5) * geo.cell, y: box.y + geo.oy + (row + 0.5) * geo.cell });
  return {
    box,
    at,
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

  record('loads level 0', (await label(page, '#level-label')) === '0 / 11', await label(page, '#level-label'));
  record('level grid lists every level', (await page.locator('.level-grid .level-button').count()) === 12);
  record('starts at turn 0', (await label(page, '#turn-label')) === '0 / 24');

  let board = await view(page);
  await board.click(1, 7);
  await page.waitForTimeout(150);
  record('clicking a drop point injects', (await label(page, '#dose-label')) === '1 / 2', await label(page, '#dose-label'));

  await board.click(3, 1);
  await page.waitForTimeout(120);
  record('a second injection in the same turn is refused', (await label(page, '#dose-label')) === '1 / 2');

  await page.click('#step');
  await page.waitForTimeout(120);
  record('step advances the turn', (await label(page, '#turn-label')) === '1 / 24', await label(page, '#turn-label'));
  await page.click('#step');
  await page.waitForTimeout(120);
  record('rapid steps are not swallowed', (await label(page, '#turn-label')) === '2 / 24', await label(page, '#turn-label'));
  await page.waitForTimeout(500);
  record('saving everyone wins', await page.isVisible('#result') && (await label(page, '#result-kicker')) === '全部安全');
  await page.screenshot({ path: path.join(OUT, 'desktop-win.png') });

  await page.click('#result-next');
  await page.waitForTimeout(250);
  record('next level loads', (await label(page, '#level-label')) === '1 / 11');

  await page.click('#hint');
  await page.waitForTimeout(150);
  record('hint keeps the page alive', await page.isVisible('#board'));

  await page.locator('.level-grid .level-button').nth(9).click();
  await page.waitForTimeout(250);
  record('level grid jumps to 9', (await label(page, '#level-label')) === '9 / 11', await label(page, '#level-label'));
  await page.screenshot({ path: path.join(OUT, 'desktop-level9.png') });

  await page.locator('.level-grid .level-button').nth(0).click();
  await page.waitForTimeout(200);
  board = await view(page);
  await board.click(1, 7);
  await page.click('#restart');
  await page.waitForTimeout(200);
  record('restart clears the dose', (await label(page, '#dose-label')) === '0 / 2');

  // 失败路径：不投针一路推进
  for (let i = 0; i < 6; i += 1) {
    if (await page.locator('#step').isDisabled()) break;   // 关卡结束后按钮会禁用
    await page.click('#step');
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(400);
  record('losing shows the failure panel', await page.isVisible('#result') && (await label(page, '#result-kicker')) === '病毒突破了');
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
  await touch.tap(1, 7);
  await phone.waitForTimeout(150);
  record('touch injects a dose', (await label(phone, '#dose-label')) === '1 / 2', await label(phone, '#dose-label'));
  await phone.click('#step');
  await phone.waitForTimeout(150);
  record('touch step advances', (await label(phone, '#turn-label')) === '1 / 24');
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