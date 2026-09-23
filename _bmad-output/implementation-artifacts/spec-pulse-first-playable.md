---
title: 'Pulse 首个可玩物理连锁原型'
type: 'feature'
created: '2026-09-23'
status: 'done'
baseline_commit: 'e5a4e90'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Silk 的蛛网核心无法让玩家直观理解连接与剪线的价值，且玩法乐趣不成立。需要换核心，重建一个动作明确、结果直接可见的物理连锁游戏。

**Approach:** 创建单屏 Godot 4.7.2 原型。玩家瞄准并发射一颗弹球，弹球在封闭棋盘内反弹，摧毁红核并受蓝块、紫块影响。发射次数有限，目标是在三次发射内摧毁三个红核。

## Boundaries & Constraints

**Always:** 主动作只有瞄准和发射；没有实时倒计时；静态棋盘和机关存在于场景；动态弹球来自 PackedScene；颜色效果通过碰撞直接展示；结果在物理结算后立即可见。

**Ask First:** 新机关、新弹球能力、元进度、正式美术、音乐或改变胜利条件。

**Never:** 3D 模型；文本教程；隐藏几何计算；反应速度考核；脚本动态搭建主场景；大量数值文本。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| AIM | 鼠标移动 | 准线从出生点指向鼠标 | 无有效方向时不显示准线 |
| LAUNCH | 左键且仍有发射次数 | 创建弹球并扣除一次发射 | 无发射次数时不创建 |
| TARGET_HIT | 弹球碰到红核 | 红核销毁并更新目标计数 | 同一目标只触发一次 |
| BUMPER_HIT | 弹球碰到蓝块 | 弹球高弹力反弹 | 物理材质保证反弹 |
| GRAVITY | 弹球进入紫块范围 | 弹球轨迹向紫块弯曲 | 离开范围后恢复普通运动 |
| BALL_FINISHED | 弹球寿命结束 | 允许下一发或判定失败 | 重复 finished 信号只处理一次 |
| ALL_TARGETS | 红核数量归零 | 显示胜利反馈 | 结算后停止发射 |

</frozen-after-approval>

## Code Map

- `scenes/main.tscn` -- 静态棋盘、墙壁、机关、目标和 HUD
- `scenes/ball.tscn` -- 可复用弹球
- `scenes/target.tscn` -- 红核目标
- `scenes/bumper.tscn` -- 蓝块弹力机关
- `scenes/gravity_well.tscn` -- 紫色引力井
- `scenes/hud.tscn` -- 发射次数、目标数量和结果反馈
- `scripts/main.gd` -- 发射、状态、胜负和输入协调
- `scripts/ball.gd` -- 弹球生命周期与轨迹
- `scripts/target.gd` -- 目标命中
- `scripts/gravity_well.gd` -- 引力
- `scripts/hud.gd` -- 无文字状态反馈

## Tasks & Acceptance

**Execution:**
- [x] 创建静态棋盘、墙壁、红核、蓝块、紫块和出生点
- [x] 实现弹球发射、反弹、生命周期和轨迹
- [x] 实现红核摧毁、引力影响和胜负
- [x] 实现准线和无文字 HUD
- [x] 更新 README、AGENTS 和 Game Brief
- [x] 编写 smoke test 并运行 Godot headless 验证

**Acceptance Criteria:**
- Given 启动场景，then 棋盘、三个红核、四个蓝块、一个紫块和出生点已存在
- Given 移动鼠标，then 显示从出生点出发的准线
- Given 点击左键，then 发射弹球并扣除一次发射
- Given 弹球碰到蓝块，then 弹球明显反弹
- Given 弹球碰到红核，then 红核消失且目标计数更新
- Given 弹球进入紫块范围，then 轨迹向紫块方向弯曲
- Given 红核全部销毁，then 显示胜利反馈
- Given 发射次数耗尽且红核仍存在，then 显示失败反馈

## Design Notes

- 棋盘和机关是静态场景内容，弹球是动态 PackedScene 实体。
- 不使用文字提示，红核颜色、准线和发射次数是主要教学手段。
- 蓝块使用物理材质实现反弹，紫块使用 Area2D 施加中心力。
- 弹球寿命结束后回收，避免无限弹跳。

## Verification

**Commands:**
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --editor --quit` -- expected: 退出码 0
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --script res://tests/smoke_test.gd` -- expected: `tests/.smoke_test_result` 为 `PASS`
## Suggested Review Order

**核心物理**

- 主场景先定义棋盘、墙壁、机关、目标和出生点。
  [`main.tscn:1`](../../scenes/main.tscn#L1)

- 主控制器负责瞄准、发射、回合状态和胜负。
  [`main.gd:1`](../../scripts/main.gd#L1)

- 弹球场景定义物理材质、碰撞形状、视觉和轨迹。
  [`ball.tscn:1`](../../scenes/ball.tscn#L1)

- 弹球脚本负责速度、轨迹、寿命和结束信号。
  [`ball.gd:1`](../../scripts/ball.gd#L1)

**机关交互**

- 蓝块用静态场景和物理材质提供高弹力反弹。
  [`bumper.tscn:1`](../../scenes/bumper.tscn#L1)

- 紫块使用脚本施加中心引力。
  [`gravity_well.gd:1`](../../scripts/gravity_well.gd#L1)

- 红核通过 Area2D 检测弹球并发出销毁信号。
  [`target.gd:1`](../../scripts/target.gd#L1)

**反馈与验证**

- HUD 使用目标条、发射条和无文字结果遮罩。
  [`hud.tscn:1`](../../scenes/hud.tscn#L1)

- Smoke test 覆盖静态结构、发射、弹球回收和目标销毁。
  [`smoke_test.gd:1`](../../tests/smoke_test.gd#L1)
