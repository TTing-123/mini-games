// 浏览器实测：桌面鼠标 + 手机触屏的端到端检查。
// 依赖：npm i -D playwright && npx playwright install chromium
// 用法：node pulse/tools/browser-check.cjs      （默认检查本地 http://127.0.0.1:8080/pulse/index.html）
//       PULSE_URL=https://... node tools/browser-check.cjs
//       PULSE_CHROME=/path/to/chrome node tools/browser-check.cjs   （用完整 chromium 取代 headless shell）
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.PULSE_URL || 'http://127.0.0.1:8080/pulse/index.html';
const OUT = path.join(__dirname, '.browser-check');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const record = (name, ok, detail) => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};

async function canvasBox(page) {
  const box = await page.locator('#game-canvas').boundingBox();
  if (!box) throw new Error('canvas not visible');
  return box;
}

(async () => {
  const launchOptions = process.env.PULSE_CHROME ? { executablePath: process.env.PULSE_CHROME } : {};
  const browser = await chromium.launch(launchOptions);

  /* ---------------- desktop ---------------- */
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desk = await deskCtx.newPage();
  desk.on('console', (m) => { if (m.type() === 'error') errors.push('desktop console: ' + m.text()); });
  desk.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message));
  await desk.goto(BASE, { waitUntil: 'load' });
  await desk.waitForTimeout(700);

  record('desktop loads level 1', (await desk.textContent('#level-badge')).trim() === 'LEVEL 1');
  record('favicon linked', (await desk.getAttribute('link[rel="icon"]', 'href')) === './favicon.svg');
  record('og title present', (await desk.getAttribute('meta[property="og:title"]', 'content')) !== null);

  const shots0 = (await desk.textContent('#shot-count')).trim();
  const box = await canvasBox(desk);
  await desk.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.12);
  await desk.waitForTimeout(60);
  await desk.mouse.down();
  await desk.mouse.up();
  await desk.waitForTimeout(250);
  const shots1 = (await desk.textContent('#shot-count')).trim();
  record('mouse click fires a shot', Number(shots1) === Number(shots0) - 1, `${shots0} -> ${shots1}`);
  await desk.screenshot({ path: path.join(OUT, 'desktop-play.png') });

  await desk.keyboard.press('2');
  await desk.waitForTimeout(300);
  record('key 2 jumps to level 2', (await desk.textContent('#level-badge')).trim() === 'LEVEL 2');

  await desk.keyboard.press('0');
  await desk.waitForTimeout(300);
  record('key 0 enters endless', /^ENDLESS/.test((await desk.textContent('#level-badge')).trim()));

  await desk.click('#level-select-toggle');
  await desk.waitForTimeout(200);
  record('level panel opens', await desk.isVisible('#level-select-panel'));
  await desk.click('#endless-button');
  await desk.waitForTimeout(200);
  record('endless selector opens', await desk.isVisible('#endless-selector'));
  await desk.click('[data-depth="20"]');
  await desk.waitForTimeout(120);
  record('depth preset sets 20', (await desk.textContent('#endless-depth-output')).trim() === '20');
  await desk.click('#endless-start');
  await desk.waitForTimeout(300);
  record('endless starts at chosen depth', (await desk.textContent('#level-badge')).trim() === 'ENDLESS 20');
  record('depth persisted to localStorage', (await desk.evaluate(() => localStorage.getItem('pulse-endless-depth'))) === '20');
  await desk.screenshot({ path: path.join(OUT, 'desktop-endless20.png') });
  await desk.close();
  await deskCtx.close();

  /* ---------------- phone (touch) ---------------- */
  const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phone = await phoneCtx.newPage();
  phone.on('console', (m) => { if (m.type() === 'error') errors.push('phone console: ' + m.text()); });
  phone.on('pageerror', (e) => errors.push('phone pageerror: ' + e.message));
  await phone.goto(BASE, { waitUntil: 'load' });
  await phone.waitForTimeout(700);
  record('portrait shows rotate hint', await phone.isVisible('.rotate-hint'));
  record('phone footer shows touch hint', await phone.isVisible('.hint-touch'));

  await phone.reload();
  await phone.waitForTimeout(600);
  const pBox = await canvasBox(phone);
  const shotsBefore = Number((await phone.textContent('#shot-count')).trim());
  await phone.touchscreen.tap(pBox.x + pBox.width * 0.5, pBox.y + pBox.height * 0.2);
  await phone.waitForTimeout(300);
  const shotsAfter = Number((await phone.textContent('#shot-count')).trim());
  record('touch tap fires a shot', shotsAfter === shotsBefore - 1, `${shotsBefore} -> ${shotsAfter}`);

  const hud = await phone.locator('#shot-count').boundingBox();
  record('hud visible on phone', !!hud && hud.x >= 0 && hud.x + hud.width <= 390);
  record('no horizontal page scroll', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await phone.screenshot({ path: path.join(OUT, 'phone-portrait.png') });

  await phone.reload();
  await phone.waitForTimeout(600);
  const touchMove = await phone.evaluate(async () => {
    const canvas = document.querySelector('#game-canvas');
    const rect = canvas.getBoundingClientRect();
    const mk = (type, x, y) => new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1, clientX: x, clientY: y });
    const startShots = Number(document.querySelector('#shot-count').textContent);
    canvas.dispatchEvent(mk('pointerdown', rect.left + rect.width * 0.5, rect.top + rect.height * 0.8));
    await new Promise((r) => setTimeout(r, 80));
    canvas.dispatchEvent(mk('pointermove', rect.left + rect.width * 0.2, rect.top + rect.height * 0.3));
    await new Promise((r) => setTimeout(r, 80));
    const duringDrag = Number(document.querySelector('#shot-count').textContent);
    canvas.dispatchEvent(mk('pointerup', rect.left + rect.width * 0.2, rect.top + rect.height * 0.3));
    await new Promise((r) => setTimeout(r, 120));
    return { startShots, duringDrag, afterRelease: Number(document.querySelector('#shot-count').textContent) };
  });
  record('touch drag aims before releasing', touchMove.duringDrag === touchMove.startShots && touchMove.afterRelease === touchMove.startShots - 1, JSON.stringify(touchMove));

  await phone.setViewportSize({ width: 844, height: 390 });
  await phone.waitForTimeout(400);
  const land = await phone.locator('.game-frame').boundingBox();
  const fits = !!land && land.x >= 0 && land.y >= 0 && land.x + land.width <= 845 && land.y + land.height <= 390;
  record('landscape frame fits viewport', fits, JSON.stringify(land));
  record('rotate hint hidden in landscape', !(await phone.isVisible('.rotate-hint')));
  await phone.screenshot({ path: path.join(OUT, 'phone-landscape.png') });

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