# WEAVE — 织字

把字块放回空缺，拼出一条**首尾共享汉字**的连续成语链。

## 规则

- 每条词句 4-8 个字，下一句的第一个字就是上一句的最后一个字。前 12 关是一条长链，后 8 关是两条链共享一个交点的交叉链；交叉链还会混入五字、六字俗语。
- 释义给出每一条词句的意思；灰色的字已经给出，虚线格需要补字。
- 字池里包含所有缺口字，以及若干干扰字。
- 点字池里的字，再点虚线格即可放下；点已经放下的字可以拿回字池。
- 长链关卡会在链条下方标出范围；交叉关的两条链会共用同一个格子。全部正确时完成。

## 操作

- 点字块选择它。
- 点空缺格放下。
- 点已填格取回。
- 提示会帮你放下一个字。

## 本地运行

```powershell
py -m http.server 8080
```

打开 `http://localhost:8080/weave/`。

## 工具

```powershell
node weave/tools/build-levels.mjs    # 由人工整理的长链 / 交叉链生成 src/levels.js
node weave/tools/level-audit.mjs     # 验证链条、重复、字池、难度曲线
node weave/tools/browser-check.cjs   # 桌面 + 手机端到端检查
```

## 测试

```powershell
node --test weave/tests/weave-core.test.mjs
```