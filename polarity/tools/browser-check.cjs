// POLARITY 浏览器实测：桌面点击、回合推进、通关、跳关、触屏。
// 依赖：npm i -D playwright && npx playwright install chromium
// 用法：node polarity/tools/browser-check.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.POLARITY_URL || 'http://127.0.0.1:8080/polarity/?debug=1';
const OUT = path.join(__dirname, '.browser-check');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const errors = [];
const record = (name, ok, detail) => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
};

async function canvasMetrics(page) {
  const box = await page.locator('#game-canvas').boundingBox();
  if (!box) throw new Error('canvas not visible');
  return box;
}

async function particleScreenPoint(page, id) {
  const point = await page.evaluate((wanted) => {
    const particle = window.__polarity.state.particles.find((item) => item.id === wanted);
    return particle ? { x: particle.x, y: particle.y } : null;
  }, id);
  if (!point) throw new Error(`particle ${id} not found`);
  const box = await canvasMetrics(page);
  return { x: box.x + (point.x / 1280) * box.width, y: box.y + (point.y / 720) * box.height };
}

async function clickParticle(page, id) {
  const point = await particleScreenPoint(page, id);
  await page.mouse.click(point.x, point.y);
}

async function waitIdle(page, timeout = 20000) {
  await page.waitForFunction(() => window.__polarity.state.status !== 'resolving', null, { timeout });
}

async function state(page) {
  return page.evaluate(() => {
    const s = window.__polarity.state;
    return {
      status: s.status,
      movesLeft: s.movesLeft,
      paired: s.particles.filter((p) => p.partnerId !== null).length / 2,
      pairs: s.particles.length / 2,
      level: s.label
    };
  });
}

(async () => {
  const launchOptions = process.env.PULSE_CHROME ? { executablePath: process.env.PULSE_CHROME } : {};
  const browser = await chromium.launch(launchOptions);

  /* ---------------- 桌面 ---------------- */
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desk = await deskCtx.newPage();
  desk.on('console', (m) => { if (m.type() === 'error') errors.push('desktop console: ' + m.text()); });
  desk.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message));
  await desk.goto(BASE, { waitUntil: 'load' });
  await desk.waitForTimeout(700);

  let snapshot = await state(desk);
  record('level 1 boots ready', snapshot.status === 'ready' && snapshot.level === 'LEVEL 1', JSON.stringify(snapshot));
  record('hud shows flip budget', (await desk.textContent('#move-count')).trim() === '3');
  record('hud shows pair progress', (await desk.textContent('#pair-count')).trim() === '0/2');
  await desk.screenshot({ path: path.join(OUT, 'desktop-level1.png') });

  await clickParticle(desk, 0);
  await desk.waitForTimeout(200);
  snapshot = await state(desk);
  record('clicking a particle flips it and spends a move', snapshot.movesLeft === 2, JSON.stringify(snapshot));
  record('turn is resolving right after the click', snapshot.status === 'resolving');

  await waitIdle(desk);
  snapshot = await state(desk);
  record('turn settles back to ready', snapshot.status === 'ready', JSON.stringify(snapshot));
  record('one pair locked after the first flip', snapshot.paired >= 1, `paired ${snapshot.paired}/${snapshot.pairs}`);
  await desk.screenshot({ path: path.join(OUT, 'desktop-after-first-flip.png') });

  for (let round = 0; round < 6; round += 1) {
    snapshot = await state(desk);
    if (snapshot.status !== 'ready') break;
    await clickParticle(desk, 0);
    await waitIdle(desk);
  }
  snapshot = await state(desk);
  record('level 1 can be cleared', snapshot.status === 'won', JSON.stringify(snapshot));
  record('win overlay shows up', await desk.isVisible('#game-over'));
  await desk.screenshot({ path: path.join(OUT, 'desktop-win.png') });

  await desk.keyboard.press('4');
  await desk.waitForTimeout(400);
  snapshot = await state(desk);
  record('key 4 jumps to level 4', snapshot.level === 'LEVEL 4' && snapshot.status === 'ready', JSON.stringify(snapshot));

  await desk.click('#level-select-toggle');
  await desk.waitForTimeout(200);
  record('level panel opens', await desk.isVisible('#level-select-panel'));
  await desk.click('[data-level="2"]');
  await desk.waitForTimeout(300);
  snapshot = await state(desk);
  record('level panel switches level', snapshot.level === 'LEVEL 3', JSON.stringify(snapshot));
  await desk.close();
  await deskCtx.close();

  /* ---------------- 手机触屏 ---------------- */
  const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const phone = await phoneCtx.newPage();
  phone.on('pageerror', (e) => errors.push('phone pageerror: ' + e.message));
  await phone.goto(BASE, { waitUntil: 'load' });
  await phone.waitForTimeout(700);
  const before = await state(phone);
  const tapPoint = await particleScreenPoint(phone, 0);
  await phone.touchscreen.tap(tapPoint.x, tapPoint.y);
  await phone.waitForTimeout(250);
  const after = await state(phone);
  record('touch tap flips a particle', after.movesLeft === before.movesLeft - 1, `moves ${before.movesLeft} -> ${after.movesLeft}`);
  record('no horizontal scroll on phone', await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await phone.screenshot({ path: path.join(OUT, 'phone-level1.png') });

  await phone.setViewportSize({ width: 844, height: 390 });
  await phone.waitForTimeout(400);
  const land = await phone.locator('.game-frame').boundingBox();
  record('landscape frame fits viewport', !!land && land.y >= 0 && land.y + land.height <= 390, JSON.stringify(land));
  await phone.close();
  await phoneCtx.close();

  await browser.close();
  console.log(results.join('\n'));
  console.log(`\nscreenshots: ${OUT}`);
  if (errors.length) {
    console.log('\nconsole/page errors:\n' + errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('no console or page errors');
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});