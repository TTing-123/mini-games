# CLAUDE.md

本仓库的规则对 **Claude Code 与 Codex 完全一致**，开工前读这两份：

- **通用游戏制作规范与流程**：`GAME-DEV.md`（不限本仓库，任何游戏项目通用；同一份内容也装成了技能 `game-dev-standard`）
- **本仓库硬性红线**：`AGENTS.md`

做新游戏、加关卡、调手感、发版时按 `GAME-DEV.md` 的八步流程走：灵感 → 市场调研 → 机制锁定 → 时间盒原型 → 真人试玩 → 内容生产 → 打磨 → 上线复盘。

## 本仓库特有的红线（摘自 AGENTS.md）

- 纯静态 HTML / CSS / JS，无构建工具；`py -m http.server 8080` 就能跑
- 逻辑与渲染分离：`src/<game>-core.js` 放纯逻辑（可单测、不碰 DOM），`src/game.js` 只做渲染与交互
- 根 `npm test` 必须一次跑完所有游戏的测试
- 输入不等动画：按下立刻结算模型，动画只追视觉（2048 式）；按钮用 `pointerdown`；长按不连发
- 关卡手写；查重门槛：最短解两两不同、同尺寸内部墙体 Jaccard < 0.7、布局不重复
- 教学内嵌在前几关，不做独立教程页；低美术低音乐
- 新增游戏必须同步三处：根 `index.html` 卡片、`package.json` 的 `test`、`.github/workflows/pages.yml` 的 Stage
- 收尾：`npm test` + 浏览器检查 + 线上复验；临时文件不进库，历史文档放 `<game>/_bmad-output/`