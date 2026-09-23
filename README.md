# Pulse

一个无文字、低美术、无建模的 2D 回合制物理连锁游戏。

玩家瞄准并发射弹球。弹球会在封闭棋盘内反弹，触发机关和连锁反应。目标是在每关有限发射次数内摧毁所有红核。

## 当前状态

三关渐进教学原型已完成。

## 运行

```powershell
$godot = if ($env:GODOT_BIN) { $env:GODOT_BIN } else { "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" }
& $godot --path .
```

## 验证

```powershell
$godot = if ($env:GODOT_BIN) { $env:GODOT_BIN } else { "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" }
& $godot --headless --path . --editor --quit
& $godot --headless --path . --script res://tests/smoke_test.gd
```

## 操作

- 移动鼠标：调整发射方向
- 鼠标左键：发射弹球
- `R`：结算后重新开始

## 三关规则

- 第一关：红核 + 蓝块，学习发射和反弹
- 第二关：加入紫块，学习引力弯曲
- 第三关：加入黄块，原始弹球首次命中后分裂成两颗

机关说明：

- 红核：目标
- 蓝块：高弹力反弹
- 紫块：产生明显中心引力，并在吸附弹球时显示牵引线
- 黄块：分裂一次
- 白球：玩家弹球

## 架构约束

- 静态关卡、墙壁、机关、目标和 HUD 必须存在于 `.tscn` 场景中。
- 脚本只负责状态、输入、信号和物理行为。
- 弹球等动态实体使用可复用 `PackedScene` 实例化。
- 不使用 3D 模型。
- 基础玩法不依赖文本教程。

## GDS

- 规划工件：`_bmad-output/planning-artifacts/`
- 实现工件：`_bmad-output/implementation-artifacts/`
- 项目规则：`AGENTS.md`