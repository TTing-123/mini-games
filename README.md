# Mini Games

浏览器即时游玩的小游戏合集。挑一个，点开就玩，不需要下载或登录。

线上地址：<https://tting-123.github.io/mini-games/>

## 游戏

| 游戏 | 类型 | 在线玩 |
| --- | --- | --- |
| Pulse | 物理连锁弹球 | <https://tting-123.github.io/mini-games/pulse/> |
| Casebook | 手写案件推理 | <https://tting-123.github.io/mini-games/casebook/> |
| Swap | 换位动作解谜 | <https://tting-123.github.io/mini-games/swap/> |

每个游戏都有自己的 README、测试和开发工具，放在各自的目录里。

## 本地运行

在仓库根目录执行：

```powershell
py -m http.server 8080
```

`http://localhost:8080` 是合集首页，`http://localhost:8080/pulse/`、`http://localhost:8080/casebook/`、`http://localhost:8080/swap/` 分别直接进三个游戏。

## 测试

```powershell
npm test          # 所有游戏的逻辑测试
npm run audit     # Pulse 随机关卡公平性审计
```

## 目录结构

```
mini-games/
├── index.html            合集首页（卡片列表）
├── favicon.svg
├── pulse/                物理连锁弹球
├── casebook/             手写案件推理
├── swap/                 换位动作解谜
└── .github/workflows/pages.yml
```

## 加一个新游戏

**第 0 步是先确认市面上没有重复的**（完整规则见 `AGENTS.md`）：

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

第三个游戏已经出现；SWAP 仍保持独立。等确认三款游戏里哪些代码真的重复，再考虑 `shared/`。