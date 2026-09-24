# Polarity

浏览器即时游玩的回合制极性解谜游戏。

在线游玩：<https://tting-123.github.io/mini-games/polarity/>

点一下粒子翻转它的极性：异极相吸、同极相斥。让所有粒子两两吸成对，步数刚好够。

## 运行

在合集仓库根目录启动静态服务器：

```powershell
py -m http.server 8080
```

然后打开：`http://localhost:8080/polarity/`

也可以进 `polarity/` 目录执行 `py -m http.server 8080`，直接打开 `http://localhost:8080/`。

## 测试

在合集仓库根目录：

```powershell
npm test
```

只测本游戏：`node --test polarity/tests/*.test.mjs`。

测试覆盖翻转与回合状态机、吸引/排斥、锁定与解锁、输赢判定，以及「每一关都能在给定步数内通关」和难度递进。

### 浏览器实测（可选）

需要一个运行中的本地服务器，并临时安装 Playwright：

```powershell
py -m http.server 8080
npm i -D playwright
npx playwright install chromium
node polarity/tools/browser-check.cjs
```

脚本会检查点击翻转、回合推进、通关、跳关、触屏点击与横竖屏适配，截图写到 `polarity/tools/.browser-check/`。
若只装了完整 chromium（没有 headless shell），用 `PULSE_CHROME` 指向 `chrome.exe`；检查线上版本用 `POLARITY_URL`。

## 操作

- 点击粒子：翻转它的极性（消耗一次翻转机会）
- `R`：从第一关重开
- `LEVELS`：选择关卡
- `1`～`4`：直接跳关
- 触屏：直接点粒子

## 玩法

- 异极的两个粒子会互相吸引，同极会互相排斥
- 异极粒子靠到一起就锁成一对（画面上是一条金色实线），锁定后不再参与相互作用
- 点一个已经锁定的粒子，会把这一对拆开，同时翻转它的极性
- 每翻一次，系统自由演化约 2.4 秒后停住，再交回给你
- 把全部粒子都配对 → 通关；翻转次数用完还有粒子没配上 → 失败

画面上会互相吸引的粒子之间画虚线，已经在吸引范围内的关系一眼可见。

## 关卡

| 关卡 | 粒子 | 翻转次数 | 最少步数 |
| --- | --- | --- | --- |
| 第一关 | 4 | 3 | 2 |
| 第二关 | 4 | 3 | 2 |
| 第三关 | 6 | 4 | 3 |
| 第四关 | 6 | 3 | 3 |

第四关没有容错空间：步数刚好等于最少步数。

## 视觉

沿用合集统一的深海实验室风格：深青生物发光背景、玻璃舱 HUD、粒子自身的极性用颜色和符号双重标识（暖红为 +、冷青为 −）。

## 架构

- `index.html`：DOM 外壳与 HUD
- `src/polarity-core.js`：纯逻辑（物理、回合状态机、配对、连通判定、关卡与求解器），不访问 DOM
- `src/game.js`：Canvas 渲染、输入与界面状态
- `src/style.css`：视觉系统与响应式布局
- `tests/polarity-core.test.mjs`：Node 内置测试

设计决策与市场调研结论见 `NOTES.md`。