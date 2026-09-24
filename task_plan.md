# Pulse Web Migration Plan

## Goal

将 Pulse 从 Godot 迁移为静态网页游戏，并重做 HUD、教程和颜色说明，使其可以在浏览器中即时游玩。

## Phases

- [x] Phase 1: 确定 Web 架构和视觉方向
- [x] Phase 2: 实现 Canvas 2D 物理与四关/无尽模式
- [x] Phase 3: 重做 HUD，使用离散图标而非血条
- [x] Phase 4: 添加首次教程和颜色图例
- [x] Phase 5: 替换 Godot 文件，更新文档和测试
- [x] Phase 6: 本地验证、提交并推送

## Constraints

- 静态 HTML/CSS/JavaScript，无 Godot。
- 不依赖构建工具；可直接由静态服务器运行。
- 使用 Canvas 2D 实现游戏，DOM 负责 HUD 和教程。
- 保持四关教学、无尽模式、连锁奖励和调试跳关。
- 目标是在浏览器中即时开始，不下载大型资源。

## Decisions

- 技术栈：原生 ES Modules + Canvas 2D。
- 游戏逻辑拆分为纯函数模块，便于 Node 测试。
- 视觉方向：轨道控制台式的暗色霓虹界面，但避免常见紫色渐变模板。
- HUD：红核图标表示目标数量，弹球图标表示发射次数，颜色图例解释机关。