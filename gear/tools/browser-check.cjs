// 浏览器实测：桌面鼠标 + 手机触屏。
// 用法：NODE_PATH=.pw-tmp/node_modules node gear/tools/browser-check.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.GEAR_URL || 'http://127.0.0.1:8080/gear/';
const OUT = path.join(__dirname, '.browser-check');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const record = (name, ok, detail) => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};
const label = async (page, selector) => (await page.textContent(selector)).trim();

async function board(page) {
  const box = await page.locator('#board').boundingBox();
  const geo = await page.evaluate(() => {
    const hook = window.__gear;
    if (!hook) return null;
    const g = hook.geo;
    return {
      nodes: g.nodes.map((n) => ({ cx: n.cx, cy: n.cy })),
      tray: g.tray.map((t) => ({ cx: t.cx, cy: t.cy }))
    };
  });
  if (!box || !geo) throw new Error('board geometry unavailable');
  const click = (point) => page.mouse.click(box.x + point.cx, box.y + point.cy);
  const tap = (point) => page.touchscreen.tap(box.x + point.cx, box.y + point.cy);
  return { box, geo, click, tap };
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
  record('starts empty', (await label(page, '#slot-label')) === '0 / 2');

  let view = await board(page);
  await view.click(view.geo.tray[0]);
  await view.click(view.geo.nodes[0]);
  view = await board(page);
  await view.click(view.geo.tray[1]);
  view = await board(page);
  await view.click(view.geo.nodes[1]);
  await page.waitForTimeout(200);
  record('assembling the train shows the output', (await label(page, '#angle-label')) === '180°', await label(page, '#angle-label'));
  await page.waitForTimeout(1300);
  record('correct train opens the result', await page.isVisible('#result'));
  await page.screenshot({ path: path.join(OUT, 'desktop-solved.png') });

  await page.click('#result-next');
  await page.waitForTimeout(250);
  record('next level loads', (await label(page, '#level-label')) === '1 / 9');
  record('moves reset', (await label(page, '#slot-label')) === '0 / 2');

  await page.click('#hint');
  await page.waitForTimeout(150);
  record('hint keeps the page alive', await page.isVisible('#board'));

  await page.locator('.level-grid .level-button').nth(4).click();
  await page.waitForTimeout(250);
  record('level grid jumps to 4', (await label(page, '#level-label')) === '4 / 9', await label(page, '#level-label'));

  view = await board(page);
  await view.click(view.geo.tray[0]);
  await view.click(view.geo.nodes[0]);
  view = await board(page);
  await view.click(view.geo.tray[1]);
  view = await board(page);
  await view.click(view.geo.nodes[1]);
  await view.click(view.geo.nodes[0]);
  record('clicking a filled slot takes the gear back', (await label(page, '#slot-label')) === '1 / 4', await label(page, '#slot-label'));
  await page.click('#restart');
  await page.waitForTimeout(200);
  record('restart clears the train', (await label(page, '#slot-label')) === '0 / 4');

  await page.locator('.level-grid .level-button').nth(9).click();
  await page.waitForTimeout(300);
  record('three stage level loads', (await label(page, '#slot-label')) === '0 / 6');
  await page.screenshot({ path: path.join(OUT, 'desktop-level9.png') });
  await page.close();
  await ctx.close();

  const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phone = await phoneCtx.newPage();
  phone.on('console', (m) => { if (m.type() === 'error') errors.push('phone console: ' + m.text()); });
  phone.on('pageerror', (e) => errors.push('phone pageerror: ' + e.message));
  await phone.goto(BASE + '?debug=1', { waitUntil: 'load' });
  await phone.waitForTimeout(500);
  const touch = await board(phone);
  await touch.tap(touch.geo.tray[0]);
  await touch.tap(touch.geo.nodes[0]);
  await phone.waitForTimeout(200);
  record('touch assembles a gear', (await label(phone, '#slot-label')) === '1 / 2', await label(phone, '#slot-label'));
  record('no horizontal scroll on phone', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  const boardBox = await phone.locator('#board').boundingBox();
  record('board fits the phone', !!boardBox && boardBox.x >= 0 && boardBox.x + boardBox.width <= 391, JSON.stringify(boardBox));
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