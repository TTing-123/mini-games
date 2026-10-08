// 浏览器实测：桌面 + 手机触屏的端到端检查。
// 用法：NODE_PATH=.pw-tmp/node_modules node tilt/tools/browser-check.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.TILT_URL || 'http://127.0.0.1:8080/tilt/';
const OUT = path.join(__dirname, '.browser-check');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const record = (name, ok, detail) => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};
const label = async (page, selector) => (await page.textContent(selector)).trim();

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  record('loads level 0', (await label(page, '#level-label')) === '0 / 51', await label(page, '#level-label'));
  record('level grid lists all 52 levels', (await page.locator('.level-grid .level-button').count()) === 52);
  record('title shown', (await label(page, '#level-title')) === '一步');
  record('favicon linked', (await page.getAttribute('link[rel="icon"]', 'href')) === './favicon.svg');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  record('one tilt clears the tutorial', await page.isVisible('#result'));
  record('result reports move count', /1 步完成/.test(await label(page, '#result-text')), await label(page, '#result-text'));
  await page.screenshot({ path: path.join(OUT, 'desktop-tutorial.png') });

  await page.click('#result-next');
  await page.waitForTimeout(250);
  record('next level loads', (await label(page, '#level-label')) === '1 / 51');
  record('moves reset', (await label(page, '#move-label')) === '0');

  await page.click('#hint');
  await page.waitForTimeout(150);
  record('hint keeps page alive', await page.isVisible('#board'));

  await page.click('.level-grid .level-button:nth-child(4)');
  await page.waitForTimeout(250);
  record('level grid jumps to 3', (await label(page, '#level-label')) === '3 / 51');

  const box = await page.locator('#board').boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.86, box.y + box.height * 0.5, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  record('swipe tilts the board', (await label(page, '#move-label')) === '1', await label(page, '#move-label'));
  await page.screenshot({ path: path.join(OUT, 'desktop-level3.png') });

  await page.locator('.level-grid .level-button').nth(31).click();
  await page.waitForTimeout(250);
  record('colour chapter loads', (await label(page, '#level-label')) === '31 / 51', await label(page, '#level-label'));
  record('colour rule appears in the panel', await page.isVisible('#color-note'));
  await page.screenshot({ path: path.join(OUT, 'desktop-colour.png') });

  await page.click('#restart');
  await page.waitForTimeout(200);
  record('restart resets moves', (await label(page, '#move-label')) === '0');

  // 2048 式输入：连按不丢手，动画只是追上去。回廊的最短解是 → ↓ ←。
  await page.locator('.level-grid .level-button').nth(3).click();
  await page.waitForTimeout(200);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowLeft');
  record('rapid input is never dropped', (await label(page, '#move-label')) === '3', await label(page, '#move-label'));
  await page.waitForTimeout(700);
  record('rapid input still finishes the level', await page.isVisible('#result'));
  await page.click('#result-retry');
  await page.waitForTimeout(200);
  await page.close();
  await ctx.close();

  const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phone = await phoneCtx.newPage();
  phone.on('console', (m) => { if (m.type() === 'error') errors.push('phone console: ' + m.text()); });
  phone.on('pageerror', (e) => errors.push('phone pageerror: ' + e.message));
  await phone.goto(BASE, { waitUntil: 'load' });
  await phone.waitForTimeout(600);
  await phone.click('.pad-right');
  await phone.waitForTimeout(600);
  record('pad button tilts on phone', await phone.isVisible('#result'), await label(phone, '#result-text'));
  record('no horizontal scroll', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  const pad = await phone.locator('.pad-right').boundingBox();
  record('pad reachable on phone', !!pad && pad.x >= 0 && pad.x + pad.width <= 390, JSON.stringify(pad));
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