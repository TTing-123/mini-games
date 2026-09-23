# Pulse

一个无文字、低美术、无建模的 2D 回合制物理连锁游戏。

玩家瞄准并发射一颗弹球。弹球会在封闭棋盘内反弹，撞击不同颜色机关，触发分裂、引力、爆炸和连锁反应。目标是在有限发射次数内摧毁所有红核。

## 当前状态

首个可玩原型正在实现中。

## 运行

引擎：Godot 4.7.2

```powershell
$godot = if ($env:GODOT_BIN) { $env:GODOT_BIN } else { "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" }
& $godot --path .
```

## 操作

- 移动鼠标：调整发射方向
- 鼠标左键：发射弹球
- `R`：结算后重新开始

## 原型规则

- 红核是目标
- 蓝块负责反弹
- 紫块产生引力，弯曲弹球轨迹
- 弹球碰撞后自动结算
- 发射次数有限
- 摧毁所有红核即可获胜
- 发射次数耗尽且仍有红核则失败

## 架构约束

- 静态节点必须存在于 `.tscn` 场景中。
- 脚本只负责状态、行为、输入协调和信号。
- 动态弹球使用可复用 `PackedScene` 实例化。
- 不使用 3D 模型。
- 基础玩法不依赖文本教程。

## GDS

- 规划工件：`_bmad-output/planning-artifacts/`
- 实现工件：`_bmad-output/implementation-artifacts/`
- 项目规则：`AGENTS.md`