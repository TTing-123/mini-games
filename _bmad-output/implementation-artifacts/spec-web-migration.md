---
title: 'Pulse 网页即时游玩迁移与界面优化'
type: 'feature'
created: '2026-09-24'
status: 'done'
baseline_commit: '7777199'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Godot 版本不适合网页即时游玩，且发射次数和红核数量使用连续血条不清晰，黄、紫、绿机关缺少说明。

**Approach:** 迁移为静态 Web 应用。Canvas 2D 负责游戏和物理，DOM 负责离散图标 HUD、首次教程、颜色图例和关卡选择。保留四关、无尽模式和连锁奖励。

## Boundaries & Constraints

**Always:** 无 Godot；静态 HTML/CSS/ES Modules；Canvas 2D 游戏；DOM HUD；目标与发射数使用离散图标；首次教程解释所有颜色；无尽模式实体有上限。

**Ask First:** 正式音频、存档、账号、排行榜或大型美术资源。

**Never:** 构建工具依赖；实时倒计时；无限分裂；无限充能；血条式关键状态；Godot 运行依赖。

## Code Map

- `index.html` -- DOM HUD、教程、关卡选择
- `src/game-core.js` -- 物理、关卡、生成和状态
- `src/game.js` -- Canvas、输入、HUD 和教程交互
- `src/style.css` -- 视觉系统、响应式布局和动画
- `tests/game-core.test.mjs` -- Node 核心逻辑测试

## Tasks & Acceptance

**Execution:**
- [x] 建立静态 Web 应用结构
- [x] 迁移四关和程序化无尽模式
- [x] 迁移反弹、引力、分裂、充能和连锁奖励
- [x] 重做目标与发射次数的离散图标 HUD
- [x] 添加首次教程和颜色图例
- [x] 添加关卡选择
- [x] 移除 Godot 工程文件
- [x] 通过 Node 测试与静态服务器加载验证

**Acceptance Criteria:**
- Given 打开网页，then 可以直接开始游戏
- Given 查看 HUD，then 红核数量和发射次数以离散图标显示
- Given 首次打开，then 自动显示玩法说明和颜色图例
- Given 点击 LEVELS，then 可以跳转手工关卡和无尽模式
- Given 完成红核目标，then 自动进入下一关或无尽模式
- Given 同一发摧毁两个目标，then 奖励一次发射
- Given 不安装 Godot，then 项目仍可通过静态服务器运行

## Design Notes

- DOM 与游戏核心分离，`game-core.js` 不访问 DOM，便于 Node 测试。
- 视觉采用轨道控制台式暗色霓虹界面，而不是默认组件风格。
- 颜色图例与 HUD 使用同一套色彩语义。

## Verification

- `node --check src/game-core.js`
- `node --check src/game.js`
- `node --test tests/game-core.test.mjs`
- 静态服务器返回 `index.html`、`src/game.js` 和 `src/game-core.js`