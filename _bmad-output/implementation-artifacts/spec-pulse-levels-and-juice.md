---
title: 'Pulse 手感与三关渐进教学'
type: 'feature'
created: '2026-09-23'
status: 'done'
baseline_commit: '94e68ad'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 弹球核心循环已经验证，但当前版本只有一个棋盘，且碰撞、爆炸和引力反馈较弱，无法验证规则是否通过连续游玩自然学会。

**Approach:** 增加三个静态关卡：第一关只引入红核和蓝块，第二关加入紫块引力，第三关加入黄块分裂。同时加强碰撞闪光、弹球轨迹、目标爆炸、引力脉动和镜头震动，让每次碰撞更容易观察。

## Boundaries & Constraints

**Always:** 无实时倒计时；主动作仍是瞄准和发射；静态关卡存在于场景；弹球来自 PackedScene；新增机制必须通过自然碰撞理解；每关发射次数独立。

**Ask First:** 剧情、正式美术、音乐、元进度、复杂数值或超过三关的扩展。

**Never:** 3D 模型；文本教程；隐藏规则；反应速度考核；脚本动态搭建静态关卡。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| LEVEL_1 | 启动游戏 | 仅红核和蓝块可见 | 其他关卡隐藏且不处理 |
| LEVEL_CLEAR | 当前关红核全部销毁 | 弹球结束后进入下一关 | 重复清空不重复进阶 |
| LEVEL_2 | 进入第二关 | 出现紫块并弯曲轨迹 | 紫块只影响弹球层 |
| LEVEL_3 | 进入第三关 | 出现黄块，弹球首次命中后分裂 | 分裂弹球不能再次分裂 |
| SPLIT | 可分裂弹球命中黄块 | 生成两颗不同方向的弹球 | 已分裂弹球不再触发 |
| JUICE | 弹球撞目标或机关 | 闪光、缩放或镜头震动可见 | 没有对象时不报错 |
| GAME_OVER | 最后一关失败 | 显示失败反馈 | 停止发射 |

</frozen-after-approval>

## Code Map

- `scenes/main.tscn` -- 三关静态布局、相机和 HUD
- `scenes/splitter.tscn` -- 黄块分裂机关
- `scenes/bumper.tscn` -- 蓝块及碰撞闪光
- `scenes/target.tscn` -- 红核爆炸反馈
- `scenes/gravity_well.tscn` -- 紫块引力脉动
- `scripts/main.gd` -- 关卡、弹球池、分裂和胜负
- `scripts/bumper.gd` -- 机关闪光
- `scripts/splitter.gd` -- 分裂触发
- `scripts/gravity_well.gd` -- 引力与脉动
- `scripts/target.gd` -- 目标爆炸
- `scripts/hud.gd` -- 关卡过渡和状态条

## Tasks & Acceptance

**Execution:**
- [x] 建立三个静态关卡并逐关引入机关
- [x] 支持多弹球和一次分裂
- [x] 加强碰撞、目标、引力和相机反馈
- [x] 实现关卡推进和独立发射次数
- [x] 更新 smoke test 和文档
- [x] 运行 Godot headless 验证

**Acceptance Criteria:**
- Given 启动，then 只显示第一关
- Given 第一关清空，then 进入第二关并显示紫块
- Given 第二关清空，then 进入第三关并显示黄块
- Given 原始弹球碰到黄块，then 生成两颗不可再次分裂的弹球
- Given 弹球撞到机关，then 有可见闪光反馈
- Given 目标被摧毁，then 有爆炸反馈和镜头震动
- Given 最后一关完成，then 显示胜利反馈

## Design Notes

- 每个关卡是 `main.tscn` 中的静态子节点，脚本只切换可见性和处理状态。
- 黄块只分裂一次，避免指数爆炸。
- 镜头震动使用现有 Camera2D，不创建新节点。
- 反馈以几何缩放、颜色、轨迹和短 Tween 为主。

## Verification

**Commands:**
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --editor --quit`
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --script res://tests/smoke_test.gd`
## Suggested Review Order

**三关结构**

- 主场景静态声明三关、墙壁、出生点、相机和 HUD。
  [`main.tscn:1`](../../scenes/main.tscn#L1)

- 主控制器切换关卡并处理独立发射次数。
  [`main.gd:1`](../../scripts/main.gd#L1)

**机关与连锁**

- 黄块只触发一次分裂，生成两颗不可再分裂的弹球。
  [`splitter.gd:1`](../../scripts/splitter.gd#L1)

- 紫块持续施加中心力和视觉脉动。
  [`gravity_well.gd:1`](../../scripts/gravity_well.gd#L1)

- 蓝块在受击时产生缩放闪光。
  [`bumper.gd:1`](../../scripts/bumper.gd#L1)

- 红核增加爆炸反馈和销毁动画。
  [`target.gd:1`](../../scripts/target.gd#L1)

**反馈与验证**

- HUD 增加关卡过渡遮罩和状态条。
  [`hud.tscn:1`](../../scenes/hud.tscn#L1)

- Smoke test 覆盖三关结构、关卡推进、分裂和胜负。
  [`smoke_test.gd:1`](../../tests/smoke_test.gd#L1)
