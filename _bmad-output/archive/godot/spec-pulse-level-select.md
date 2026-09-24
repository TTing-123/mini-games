---
title: 'Pulse 调试关卡选择入口'
type: 'feature'
created: '2026-09-24'
status: 'done'
baseline_commit: '10c16b0'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 测试时必须从第一关开始逐关通过，无法快速验证指定关卡或无尽模式。

**Approach:** 增加仅调试版本可见的关卡选择入口。玩家可通过数字键 1-4 直接进入手工关卡，数字键 0 进入无尽模式；同时 HUD 提供一个可切换的调试面板，使用 1/2/3/4/∞ 按钮跳转。

## Boundaries & Constraints

**Always:** 手工关卡和无尽模式复用现有准备函数；调试入口在正式构建中隐藏；跳关时清理当前弹球和状态；不改变正常玩家流程。

**Ask First:** 正式版关卡选择 UI、存档、解锁进度或菜单系统。

**Never:** 调试入口影响正式玩法；跳关残留旧弹球、旧信号或旧状态；使用复杂菜单作为核心界面。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| KEY_LEVEL | 按数字 1-4 | 立即进入对应手工关卡 | 清理当前弹球和结算状态 |
| KEY_ENDLESS | 按数字 0 | 进入无尽第一层 | 清理当前状态 |
| PANEL_TOGGLE | 点击调试入口 | 显示或隐藏关卡选择面板 | 正式构建隐藏入口 |
| PANEL_SELECT | 点击 1-4 或 ∞ | 跳转到目标关卡 | 面板自动关闭 |
| NORMAL_FLOW | 不使用调试入口 | 原有四关和无尽流程不变 | 不影响胜负判断 |

</frozen-after-approval>

## Code Map

- `scenes/hud.tscn` -- 调试入口和关卡选择按钮
- `scripts/hud.gd` -- 面板显隐和关卡信号
- `scripts/main.gd` -- 数字键和关卡跳转
- `tests/smoke_test.gd` -- 跳转入口验证
- `README.md` -- 测试快捷键说明

## Tasks & Acceptance

**Execution:**
- [x] HUD 增加调试入口和五个跳转按钮
- [x] HUD 发出关卡选择信号
- [x] 主控制器支持数字键和跳转函数
- [x] 更新 smoke test 和 README
- [x] 运行 Godot headless 验证

**Acceptance Criteria:**
- Given 调试构建启动，then 显示关卡选择入口
- Given 按数字 1-4，then 进入对应手工关卡
- Given 按数字 0，then 进入无尽第一层
- Given 点击面板按钮，then 跳转并关闭面板
- Given 正式构建运行，then 调试入口隐藏
- Given 跳转发生时，then 当前弹球被清理且状态重置

## Verification

**Commands:**
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --editor --quit`
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --script res://tests/smoke_test.gd`
## Suggested Review Order

**调试入口**

- HUD 在调试构建中显示 LEVELS 入口和跳转面板。
  [`hud.tscn:1`](../../scenes/hud.tscn#L1)

- HUD 发出关卡选择信号并关闭面板。
  [`hud.gd:1`](../../scripts/hud.gd#L1)

- 主控制器支持数字键和直接跳关。
  [`main.gd:1`](../../scripts/main.gd#L1)

**验证**

- Smoke test 覆盖调试入口、手工关卡跳转和无尽跳转。
  [`smoke_test.gd:1`](../../tests/smoke_test.gd#L1)
