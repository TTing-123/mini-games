---
title: '首个可玩织网原型'
type: 'feature'
created: '2026-09-23'
status: 'draft'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 仓库目前只有 GDS 初始化文件，没有可运行的游戏循环。需要用最小 Godot 4.7.2 原型验证《丝》的核心体验：玩家实时织网影响猎物行为，形成可重复、带涌现性的捕猎局面。

**Approach:** 单屏 2D 原型。鼠标控制蜘蛛，按住左键移动时生成丝线；猎物撞线后被黏住并增加张力；张力过高断线；捕获足够猎物后卵囊完成目标。只使用几何图形和简单反馈，不做正式美术、建模或文本教程。

## Boundaries & Constraints

**Always:** Godot 4.7.2、2D、无外部美术；操作不超过移动、织丝、剪线；目标与反馈用视觉表达；网必须实时影响猎物和自身状态。

**Ask First:** 正式美术、音乐、剧情、多人、3D、复杂元进度，或改变核心目标与操作方式。

**Never:** 3D 模型；文本教程依赖；静态放置玩法；把首个原型扩展成完整游戏。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 按住左键并移动鼠标 | 蜘蛛移动并生成可见丝线 | 鼠标离窗时保留状态 |
| STRAND_CUT | 右键点击靠近丝线处 | 对应丝线被剪断 | 未命中则不改变状态 |
| PREY_TRAPPED | 猎物碰到有效丝线 | 猎物被黏住并增加张力 | 离开有效交点后不捕获 |
| STRAND_BREAK | 丝线张力超过阈值 | 丝线消失，猎物可能逃脱 | 断裂后不触发捕获 |
| GOAL | 捕获数达到目标 | 卵囊完成，显示胜利反馈 | 计时结束显示失败反馈 |

</frozen-after-approval>

## Code Map

- `AGENTS.md` -- 游戏开发流程与 AI 协作规则
- `README.md` -- 项目定位、运行和操作说明
- `.gitignore` -- Godot 忽略规则
- `project.godot` -- Godot 项目配置
- `scenes/main.tscn` -- 单屏原型场景
- `scripts/main.gd` -- 蜘蛛、丝线、猎物、张力与目标逻辑
- `_bmad-output/planning-artifacts/silk-game-brief.md` -- 创意基线

## Tasks & Acceptance

**Execution:**
- [ ] `AGENTS.md` -- 加入 GDS 游戏开发默认流程 -- 统一后续 AI 开发行为
- [ ] `README.md` -- 写入愿景、运行方式、操作方式 -- 便于恢复上下文
- [ ] `.gitignore` -- 忽略 Godot 生成文件 -- 保持仓库干净
- [ ] `project.godot`、`scenes/main.tscn` -- 建立 Godot 4.7.2 运行入口 -- 让项目可启动
- [ ] `scripts/main.gd` -- 实现移动、织丝、剪线、猎物、张力、断线和卵囊目标 -- 验证核心循环
- [ ] `_bmad-output/planning-artifacts/silk-game-brief.md` -- 记录体验目标和成功指标 -- 作为后续 GDS 基线
- [ ] 运行 Godot headless 检查 -- 验证脚本无解析错误

**Acceptance Criteria:**
- Given 启动项目，when 移动鼠标，then 蜘蛛跟随移动
- Given 按住左键移动，when 松开，then 出现丝线
- Given 猎物碰到丝线，when 持续接触，then 猎物被黏住且张力上升
- Given 张力过高，when 达到阈值，then 丝线断裂且猎物可继续移动
- Given 捕获数达到目标，when 卵囊填满，then 显示胜利反馈
- Given 没有文本教程，when 观察第一只猎物和第一条丝，then 能理解捕猎关系

## Design Notes

- 丝线是动态系统：张力、断裂、黏住和剪线必须可见。
- 几何视觉：蜘蛛为三角/圆点，猎物为圆与菱形，丝线按张力变色。
- 目标用卵囊、月亮倒计时和丝量条表达，不依赖文字。

## Verification

**Commands:**
- `& "D:\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe" --headless --path . --editor --quit` -- expected: 退出码 0，无脚本解析错误

**Manual checks (if no CLI):**
- 启动后确认鼠标控制蜘蛛，左键织丝，右键剪线，猎物触发张力与捕获。