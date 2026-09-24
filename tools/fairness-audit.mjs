// 随机关卡公平性审计：布局间距检查 + 贪心自动玩家的可解性下界。
// 输出保持 ASCII，避免 Windows 控制台编码问题。
// 用法：node tools/fairness-audit.mjs [层号 ...]
import { pathToFileURL } from 'node:url';
import { GameCore, generateEndlessLevel, WIDTH, HEIGHT } from '../src/game-core.js';

const DT = 1 / 120;
const MAX_STEPS = 1200;
const LAUNCH = { x: 640, y: 620 };
const KINDS = [['targets', 24], ['bumpers', 26], ['splitters', 28], ['chargers', 28], ['gravity', 0]];
const DEFAULT_LEVELS = [1, 2, 3, 4, 5, 8, 12, 15, 20, 30, 50, 99];
const SEEDS = [11, 4242, 987654];

function entities(level) {
  return KINDS.flatMap(([key, radius]) => level[key].map((item) => ({ key, x: item.x, y: item.y, radius })));
}

export function layoutIssues(level) {
  const issues = [];
  const list = entities(level);
  for (const item of list) {
    if (item.x < 0 || item.x > WIDTH || item.y < 0 || item.y > HEIGHT) issues.push(`oob ${item.key}`);
    if (Math.hypot(item.x - LAUNCH.x, item.y - LAUNCH.y) < 150) issues.push(`blocks launcher ${item.key}`);
  }
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const a = list[i];
      const b = list[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius) issues.push(`overlap ${a.key}/${b.key}`);
    }
  }
  return issues;
}

function cloneCore(core) {
  const clone = Object.create(GameCore.prototype);
  clone.state = structuredClone(core.state);
  clone.events = [];
  return clone;
}

function settle(core) {
  let steps = 0;
  while (core.state.status === 'resolving' && steps < MAX_STEPS) {
    core.update(DT);
    steps += 1;
  }
  return steps;
}

function hitsFrom(events) {
  return events.filter((event) => event.type === 'target').length;
}

function direction(angle) {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

// 粗采样 + 局部细化，逼近“这一发最多能打掉几个目标”。
function bestShot(core) {
  const coarse = Array.from({ length: 24 }, (_, i) => (i / 24) * Math.PI * 2);
  let best = { angle: coarse[0], hits: -1 };
  for (const angle of coarse) {
    const trial = cloneCore(core);
    trial.launch(direction(angle));
    settle(trial);
    const hits = hitsFrom(trial.consumeEvents());
    if (hits > best.hits) best = { angle, hits };
  }
  const step = Math.PI / 24 / 3;
  for (let offset = -3; offset <= 3; offset += 1) {
    const angle = best.angle + offset * step;
    const trial = cloneCore(core);
    trial.launch(direction(angle));
    settle(trial);
    const hits = hitsFrom(trial.consumeEvents());
    if (hits > best.hits) best = { angle, hits };
  }
  return best;
}

export function greedyPlay(levelNumber, seed) {
  const game = new GameCore();
  game.loadEndlessLevel(levelNumber, seed);
  const shotsMax = game.state.shotsMax;
  const targetsTotal = game.state.targetsTotal;
  let shotsUsed = 0;
  while (game.state.mode === 'endless' && game.state.targetsRemaining > 0 && game.state.shotsLeft > 0 && shotsUsed < 20) {
    const shot = bestShot(game);
    if (shot.hits <= 0) break;
    game.launch(direction(shot.angle));
    settle(game);
    shotsUsed += 1;
  }
  const cleared = game.state.mode !== 'endless' || game.state.targetsRemaining <= 0;
  return { cleared, shotsUsed, shotsMax, targetsTotal, remaining: cleared ? 0 : game.state.targetsRemaining };
}

function main() {
  const levels = process.argv.slice(2).map(Number).filter(Boolean);
  const targetLevels = levels.length ? levels : DEFAULT_LEVELS;
  let layoutFailures = 0;
  let solvable = 0;
  let runs = 0;
  console.log('lvl  seed    layout  result        shots  targets');
  for (const levelNumber of targetLevels) {
    for (const seed of SEEDS) {
      const level = generateEndlessLevel(levelNumber, seed);
      const issues = layoutIssues(level);
      const result = greedyPlay(levelNumber, seed);
      runs += 1;
      if (issues.length) layoutFailures += 1;
      if (result.cleared) solvable += 1;
      console.log(
        `${String(levelNumber).padStart(3)}  ${String(seed).padStart(6)}  ${issues.length ? 'FAIL' : 'ok  '}    ` +
        `${result.cleared ? 'cleared    ' : 'left ' + result.remaining + '     '}  ` +
        `${result.shotsUsed}/${result.shotsMax}     ${result.targetsTotal}`
      );
    }
  }
  console.log();
  console.log(`layout ok ${runs - layoutFailures}/${runs}, greedy-solvable ${solvable}/${runs}`);
  if (layoutFailures) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();