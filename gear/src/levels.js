// GEAR 关卡数据。齿轮池里每个齿轮只能用一次；每级两个槽（主动 / 从动）。
// 目标角度由 tools/level-forge.mjs 反查、tools/level-audit.mjs 复核：可达且解数最少的那一档。

export const LEVELS = [
  {
    title: '一半',
    hint: '从动 ÷ 主动 = 6 ÷ 12，指针只转半圈',
    tutorial: true,
    stages: 1,
    parts: [12, 6],
    targetAngle: 180
  },
  {
    title: '三分之二',
    hint: '主动 9、从动 6，比是 2 ÷ 3',
    stages: 1,
    parts: [6, 9],
    targetAngle: 240
  },
  {
    title: '挑两个',
    hint: '三个齿轮只用得上两个，先算比例再挑',
    stages: 1,
    parts: [6, 9, 24],
    targetAngle: 90
  },
  {
    title: '两级',
    hint: '每一级各乘一次比例',
    stages: 2,
    parts: [6, 9, 12, 15],
    targetAngle: 120
  },
  {
    title: '五只齿轮',
    hint: '五个齿轮只装四个，选错就绕远路',
    stages: 2,
    parts: [6, 6, 9, 12, 18],
    targetAngle: 60
  },
  {
    title: '减速两级',
    hint: '小齿轮带大齿轮是减速，反过来是加速',
    stages: 2,
    parts: [6, 9, 9, 12, 36],
    targetAngle: 240
  },
  {
    title: '三级',
    hint: '三级就是乘三次比例',
    stages: 3,
    parts: [6, 6, 12, 15, 24, 36],
    targetAngle: 120
  },
  {
    title: '大齿轮',
    hint: '大齿轮留给需要大幅减速的那一级',
    stages: 3,
    parts: [6, 6, 15, 18, 24, 30],
    targetAngle: 60
  },
  {
    title: '双 9',
    hint: '两个 9 齿只有一个用得上',
    stages: 3,
    parts: [6, 9, 9, 18, 18, 30],
    targetAngle: 90
  },
  {
    title: '齿轮箱',
    hint: '先凑出一级，再凑第二级',
    stages: 3,
    parts: [9, 12, 15, 15, 24, 24],
    targetAngle: 105
  }
];