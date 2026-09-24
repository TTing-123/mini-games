---
title: 'Pulse 无尽模式起始难度选择'
type: 'feature'
created: '2026-09-24'
status: 'done'
baseline_commit: 'dfda14c'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 玩过无尽模式的玩家再次进入时只能从第 1 层开始，无法直接验证或挑战更高难度。

**Approach:** 将 ∞ 入口改为无尽模式起始层选择器。玩家可选择 1～99 层，或使用 1、5、10、20、50 等快速档位，然后直接开始该层。

## Boundaries & Constraints

**Always:** 无尽难度由层数决定；选择器在关卡面板内；支持任意 1～99 层；选择后立即进入指定层；不改变已有无尽生成规则。

**Ask First:** 解锁系统、排行榜、账号存档或难度上限变化。

**Never:** 强制从第 1 层开始；新增独立页面；修改手工四关；无限实体数量。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|-----------------|
| OPEN_SELECTOR | 点击 ∞ | 显示起始层数控制 | 面板保持当前状态 |
| PICK_DEPTH | 拖动范围或点击档位 | 显示选择层数 | 限制在 1～99 |
| START_ENDLESS | 点击开始 | 直接加载指定无尽层 | 关闭选择器 |
| KEYBOARD | 按 0 | 进入选择器默认层 | 不强制第 1 层 |

</frozen-after-approval>

## Code Map

- index.html -- 无尽起始层控制
- src/game.js -- 选择器状态和加载指定层
- src/style.css -- 深海实验室风格的选择器
- tests/game-core.test.mjs -- 任意层加载验证

## Tasks & Acceptance

**Execution:**
- [x] 添加 1～99 层选择器
- [x] 添加快速档位
- [x] 连接到 loadEndlessLevel(levelNumber)
- [x] 更新测试和文档
- [x] 验证静态服务器加载

**Acceptance Criteria:**
- Given 点击 ∞，then 显示层级选择器
- Given 选择 20，then 可以进入无尽第 20 层
- Given 快速点击 10，then 选择值更新为 10
- Given 选择值超出范围，then 限制到 1～99
- Given 开始后，then 当前层标签和难度对应

## Verification

- node --check src/game.js
- node --test tests/game-core.test.mjs
- 浏览器加载静态服务器成功
## Suggested Review Order

- 无尽入口在关卡面板内展开层级选择器。
  [`index.html:1`](../../index.html#L1)

- HUD 逻辑维护 1～99 层选择和快速档位。
  [`game.js:1`](../../src/game.js#L1)

- 选择器使用深海实验室风格。
  [`style.css:1`](../../src/style.css#L1)

- 测试覆盖从第 20 层启动无尽模式。
  [`game-core.test.mjs:1`](../../tests/game-core.test.mjs#L1)
