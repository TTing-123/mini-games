---
title: 'Pulse 连锁命中奖励'
type: 'feature'
created: '2026-09-24'
status: 'done'
baseline_commit: 'f8574c9'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 一发弹球连锁摧毁多个目标非常爽，但目前没有额外反馈或奖励，核心技巧缺少正反馈。

**Approach:** 同一发射击流程中，当摧毁目标数达到 2 个时，额外奖励一次发射机会。奖励每个射击流程最多触发一次，并通过明显闪光和镜头反馈表达。

## Boundaries & Constraints

**Always:** 奖励绑定到同一发射击流程；分裂产生的新弹球仍属于同一次射击；每次射击最多奖励一次；奖励可增加发射上限。

**Ask First:** 连续奖励、分数系统、元进度或新的机关。

**Never:** 每次命中都奖励；分裂弹球重置连锁计数；奖励导致无限发射。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| DOUBLE_HIT | 同一射击摧毁两个目标 | 奖励一次发射并播放反馈 | 同一射击不再重复奖励 |
| SPLIT_CHAIN | 分裂球摧毁目标 | 计入同一个射击流程 | 不重置连锁计数 |
| SINGLE_HIT | 只摧毁一个目标 | 无额外奖励 | 正常结算 |
| NEXT_SHOT | 开始下一发 | 连锁计数和奖励标记重置 | 不继承上一发状态 |

</frozen-after-approval>

## Code Map

- `scripts/main.gd` -- 射击流程、连锁计数和奖励
- `scripts/hud.gd` -- 连锁奖励闪光
- `tests/smoke_test.gd` -- 奖励去重验证
- `README.md` -- 规则说明

## Tasks & Acceptance

**Execution:**
- [x] 记录当前射击摧毁目标数量
- [x] 达到两目标时奖励一次发射
- [x] 防止同一射击重复奖励
- [x] 增加连锁奖励视觉反馈
- [x] 更新文档和 smoke test
- [x] 运行 Godot headless 验证

**Acceptance Criteria:**
- Given 同一射击摧毁两个目标，then 发射次数和上限各增加 1
- Given 同一射击继续摧毁第三个目标，then 不重复奖励
- Given 下一发射击，then 连锁状态重置
- Given 分裂弹球命中，then 仍计入同一射击流程

## Verification

**Commands:**
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --editor --quit`
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --script res://tests/smoke_test.gd`
## Suggested Review Order

**连锁奖励**

- 每次发射重置连锁计数，同一射击最多奖励一次。
  [`main.gd:1`](../../scripts/main.gd#L1)

- 摧毁两个目标时增加发射次数和发射上限。
  [`main.gd:145`](../../scripts/main.gd#L145)

- HUD 使用金色闪光表达连锁奖励。
  [`hud.gd:1`](../../scripts/hud.gd#L1)

**验证**

- Smoke test 覆盖双目标奖励和单次射击去重。
  [`smoke_test.gd:1`](../../tests/smoke_test.gd#L1)
