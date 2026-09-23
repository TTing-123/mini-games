---
title: 'Pulse 程序化关卡与无尽模式'
type: 'feature'
created: '2026-09-23'
status: 'done'
baseline_commit: '996f897'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 四关教学完成后游戏结束，但当前机关组合已经足够支持随机布局。缺少程序化关卡会限制重复游玩寿命。

**Approach:** 前三关保持手工教学，第四关作为综合关。第四关完成后进入程序化无尽模式。每层根据递增难度随机放置红核、蓝块、紫块、黄块和绿块，并重置独立发射次数。

## Boundaries & Constraints

**Always:** 手工关卡继续存在；无尽布局由 PackedScene 实例化；随机关卡必须包含清晰的红核目标；难度随层数增加；每层发射次数独立；无文字教程。

**Ask First:** 新机关、新弹球能力、正式美术、音乐、元进度或改变主动作。

**Never:** 3D 模型；文本教程；脚本把手工四关替换成动态布局；撤销现有机关可读性；不设上限的实体数量。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| ENDLESS_START | 完成第四关 | 进入第一层无尽模式 | 旧关卡隐藏并停止处理 |
| GENERATE | 进入新一层 | 随机生成合法机关布局 | 重生点附近保持安全 |
| DIFFICULTY | 层数增加 | 红核和机关数量按上限增长 | 数量有硬上限 |
| CLEAR | 清空当前无尽层 | 生成下一层并重置发射次数 | 重复清空不重复生成 |
| FAIL | 无尽层发射耗尽 | 显示失败反馈 | 停止发射 |
| RESTART | 失败后按 R | 回到第一关 | 不保留无尽进度 |

</frozen-after-approval>

## Code Map

- `scripts/endless_generator.gd` -- 程序化布局生成
- `scenes/main.tscn` -- 无尽模式容器及生成器引用
- `scripts/main.gd` -- 手工关卡与无尽层切换
- `scripts/hud.gd` -- 过渡反馈
- `tests/smoke_test.gd` -- 无尽生成与推进验证

## Tasks & Acceptance

**Execution:**
- [x] 创建无尽布局生成器
- [x] 第四关完成后进入无尽模式
- [x] 随层数增加目标和机关数量
- [x] 保持出生点安全区域和实体上限
- [x] 更新文档和 smoke test
- [x] 运行 Godot headless 验证

**Acceptance Criteria:**
- Given 第四关清空，then 进入第一层无尽模式
- Given 生成无尽层，then 场景包含可摧毁红核和至少一种机关
- Given 层数增加，then 红核或机关数量增长但不超过上限
- Given 清空无尽层，then 生成新层并重置发射次数
- Given 发射耗尽，then 显示失败反馈

## Design Notes

- 手工四关不变，无尽模式使用独立的静态容器和脚本生成器。
- 生成器只实例化已有 PackedScene，不手工拼装视觉节点。
- 生成位置使用最小间距和安全区域，避免出生即撞死和机关重叠。

## Verification

**Commands:**
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --editor --quit`
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --script res://tests/smoke_test.gd`
## Suggested Review Order

**程序化生成**

- 生成器从已有 PackedScene 创建目标和机关，并控制数量上限。
  [`endless_generator.gd:1`](../../scripts/endless_generator.gd#L1)

- 主控制器在手工四关完成后进入无尽模式。
  [`main.gd:1`](../../scripts/main.gd#L1)

- 主场景保留静态手工关卡，并提供独立无尽容器。
  [`main.tscn:1`](../../scenes/main.tscn#L1)

**难度与验证**

- 无尽层数增长时增加目标或机关，但不超过硬上限。
  [`endless_generator.gd:20`](../../scripts/endless_generator.gd#L20)

- Smoke test 覆盖程序化生成、难度增长和无尽层推进。
  [`smoke_test.gd:1`](../../tests/smoke_test.gd#L1)
