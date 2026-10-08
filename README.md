# Mini Games

浏览器即时游玩的小游戏合集。挑一个，点开就玩，不需要下载或登录。

线上地址：<https://tting-123.github.io/mini-games/>

## 游戏

| 游戏 | 类型 | 在线玩 |
| --- | --- | --- |
| Pulse | 物理连锁弹球 | <https://tting-123.github.io/mini-games/pulse/> |
| Casebook | 手写案件推理 | <https://tting-123.github.io/mini-games/casebook/> |
| Nono | 数织逻辑解谜 | <https://tting-123.github.io/mini-games/nono/> |
| Tilt | 整盘倾倒逻辑解谜 | <https://tting-123.github.io/mini-games/tilt/> |
| Immune | 扩散对抗封锁 | <https://tting-123.github.io/mini-games/immune/> |

每个游戏都有自己的 README、测试和开发工具，放在各自的目录里。

## 开发规范

- 通用规范（任何游戏项目通用，Claude Code / Codex 共用）：[`GAME-DEV.md`](./GAME-DEV.md)；同一份内容也装成了技能 `game-dev-standard`
- 本仓库硬性红线：[`AGENTS.md`](./AGENTS.md)；Claude Code 另见 [`CLAUDE.md`](./CLAUDE.md)

## 本地运行

在仓库根目录执行：

```powershell
py -m http.server 8080
```

`http://localhost:8080` 是合集首页，`http://localhost:8080/pulse/`、`http://localhost:8080/casebook/`、`http://localhost:8080/nono/`、`http://localhost:8080/tilt/` 直接进对应游戏。

## 测试

```powershell
npm test              # 所有游戏的逻辑测试
npm run audit         # Pulse 随机关卡公平性审计
npm run audit:tilt    # TILT 关卡体检：可解性、最短步数、查重
```

浏览器端到端检查（需要 Playwright）：见各游戏 `tools/browser-check.cjs`，桌面鼠标 + 手机触屏都会跑一遍。

## 目录结构

```
mini-games/
├── index.html            合集首页（卡片列表）
├── favicon.svg
├── README.md             合集说明
├── AGENTS.md             AI 代理的硬性规则
├── GAME-DEV.md           游戏制作规范与流程（调研→原型→试玩→内容→上线）
├── package.json          根脚本：dev / test / audit / market
├── tools/market-check.mjs 新游戏的市场调研工具
├── .github/workflows/pages.yml
├── .agents/skills/       GDS / BMAD 技能（Codex 等）
├── .claude/skills/       GDS / BMAD 技能（Claude Code）
├── _bmad/                BMAD 配置
├── pulse/                物理连锁弹球
├── casebook/             手写案件推理
├── nono/                 数织逻辑解谜
└── tilt/                 整盘倾倒逻辑解谜
```

每个游戏的结构一致：`index.html`、`src/<game>-core.js`（纯逻辑，可单测）、`src/game.js`（渲染与交互）、`src/style.css`、`tests/`、`tools/`、`README.md`，历史文档放在 `<game>/_bmad-output/`。

## 加一个新游戏

完整流程、每步门禁和工具链见 **[GAME-DEV.md](./GAME-DEV.md)**；硬性红线见 AGENTS.md。概要：

**第 0 步是先确认市面上没有重复的**：

```powershell
node tools/market-check.mjs "机制关键词"
```

一次查 Steam 商店、itch.io、GitHub 三处，再点开头部作品看它做到什么程度、自己能不能做出明显差异。确认有差异化再动手。

然后：

1. 新建 `<game>/`，里面放自己的 `index.html`，资源一律用相对路径
2. 根 `index.html` 加一张卡片（照 Pulse 那张改）
3. 根 `package.json` 的 `test` 脚本里加上它的测试
4. `.github/workflows/pages.yml` 的 Stage 步骤里加上它的运行时文件
5. 存档写 localStorage 时带游戏前缀，避免和其他游戏撞名

目前五款游戏各自独立。等确认哪几款里的代码真的重复，再考虑 `shared/`。