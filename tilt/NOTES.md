# TILT 设计与市场调研

## 每步玩家在判断什么

**这一倒，哪些方块会停在哪一格、谁会被谁挡住、谁正好落进凹槽。**

判断的是"整块板子的终局形状"，不是某个格子。方块越多，一次倾倒的连锁结果越难预判，这就是这游戏的自发复杂性来源。

## 市场检查

网络上 Steam / itch 接口在当前网络环境下取不到（fetch failed），GitHub 直连可用，所以这次调研是 GitHub + 人工判断：

```powershell
node tools/market-check.mjs "ice sliding puzzle" "tilt board slide blocks puzzle" "gravity slide puzzle all blocks"
```

- GitHub：`ice sliding puzzle` 77 个仓库，多为个人实现、生成器、求解器（Ice-Sliding-Puzzle 生成器、Aycblok 程序化生成、若干 jam 项目）。
- `tilt board slide blocks puzzle` / `gravity slide puzzle all blocks`：0 命中。
- 头部形态：冰面滑动是**单方块**迷宫这一经典解谜玩法的常见子类，散落在各种 app 与课程作业里，没有占据心智的头部作品。

## 差异

- 经典冰面谜题是**一个**方块；这里改成**所有方块一起滑**，判断对象从"一条路线"变成"整块板子的堆叠顺序"。
- 逐关验证可解性，最短步数由 BFS 给出；提示直接闪最短解的第一步。
- 不做 Story、不做皮肤，专注干净的推演；出场即规则，0 文本也看得懂。
- 凹槽停在上面才吸收、滑过不算，这条规则让"停在哪儿"成为唯一的判断对象。

## 原型检查

- 16 关手写关卡，逐关验证可解，最短步数 1～6 步。
- 逻辑测试 9 项（倾倒、叠放顺序、吸收判定、状态不可变、提示有效性）。
- 工具：`tools/level-report.mjs`（体检）、`tools/level-lab.mjs`（设计热力图）。
- 真人试玩：等待反馈。

## 待办

- 关卡可以继续加到 30～50，优先补"多方块互相挡"的中后期关卡。
- 15 关「深井」与 7 关「绕柱」共用了同一套墙体，之后替换掉一套。