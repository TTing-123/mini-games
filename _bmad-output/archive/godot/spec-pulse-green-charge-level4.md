---
title: 'Pulse 绿色充能机关与第四关综合关'
type: 'feature'
created: '2026-09-23'
status: 'done'
baseline_commit: '6834aab'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 当前三关已经能展示反弹、引力和分裂，但玩家还缺少一个主动改变资源的机会，发射次数只有消耗没有补充。

**Approach:** 新增绿色充能机关。弹球首次命中绿块时，当前关卡的发射次数上限和剩余次数各增加 1。新增第四关，将红核、蓝块、紫块、黄块和绿块组合在一起。

## Boundaries & Constraints

**Always:** 主动作仍是瞄准和发射；绿块只充能一次；充能结果通过发射条和绿色闪光可见；第四关静态存在于场景；无文字说明。

**Ask First:** 新机关、新弹球能力、正式美术、音乐、元进度或改变胜负条件。

**Never:** 3D 模型；文本教程；无限充能；反应速度考核；脚本动态搭建关卡。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CHARGE_HIT | 弹球首次碰绿块 | 发射上限和剩余次数各加 1 | 每个绿块只触发一次 |
| CHARGE_REPEAT | 弹球再次碰同一绿块 | 不增加发射次数 | 视觉机关已禁用 |
| LEVEL4 | 前三关完成 | 显示综合关并包含全部机关 | 旧关卡停止处理 |
| WIN | 第四关清空 | 显示最终胜利 | 重复完成不重复触发 |

</frozen-after-approval>

## Code Map

- `scenes/charger.tscn` -- 绿色充能机关
- `scripts/charger.gd` -- 单次充能触发
- `scenes/main.tscn` -- 第四关综合布局
- `scripts/main.gd` -- 充能和关卡推进
- `scripts/hud.gd` -- 绿色充能闪光
- `tests/smoke_test.gd` -- 充能与四关结构验证

## Tasks & Acceptance

**Execution:**
- [x] 创建绿色充能机关
- [x] 实现单次充能和发射条更新
- [x] 增加第四关综合布局
- [x] 增加绿色充能视觉反馈
- [x] 更新文档和 smoke test
- [x] 运行 Godot headless 验证

**Acceptance Criteria:**
- Given 前三关完成，then 第四关可见且包含全部机关
- Given 弹球首次碰绿块，then 发射次数增加 1 并出现绿色闪光
- Given 再次碰同一绿块，then 发射次数保持不变
- Given 第四关清空，then 显示最终胜利

## Verification

**Commands:**
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --editor --quit`
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --script res://tests/smoke_test.gd`
## Suggested Review Order

**绿色充能**

- 绿块由静态场景定义，首次命中后只触发一次。
  [`charger.tscn:1`](../../scenes/charger.tscn#L1)

- 充能逻辑通过信号增加当前关卡的发射次数。
  [`main.gd:1`](../../scripts/main.gd#L1)

**第四关**

- 主场景新增综合关，组合全部机关。
  [`main.tscn:1`](../../scenes/main.tscn#L1)

- HUD 增加绿色充能闪光。
  [`hud.gd:1`](../../scripts/hud.gd#L1)

**验证**

- Smoke test 覆盖第四关结构、充能和发射上限增长。
  [`smoke_test.gd:1`](../../tests/smoke_test.gd#L1)
