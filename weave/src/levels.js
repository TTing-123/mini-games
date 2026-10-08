// WEAVE 关卡数据：成语链由人工挑选，空白与字池由 tools/build-levels.mjs 生成。
// chain = 单条长链；cross = 两条链共享一个交点。
// 0 = 已给出，1 = 空缺；每条成语的 cells 指向共享的格子编号。

export const LEVELS = [
  {
    kind: 'chain',
    title: '一心一意',
    hint: '先看两句的首尾字，共享字只需要一块。',
    solution: '一心一意气风发人深省',
    mask: '0001000110',
    bank: ['深', '人', '意'],
    width: 10,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }],
    idioms: [
      { answer: '一心一意', clue: '心思专一，没有别的念头', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '意气风发', clue: '精神振奋，气概昂扬', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '发人深省', clue: '启发人深刻思考、醒悟', line: 0, start: 6, cells: [6, 7, 8, 9] }
    ]
  },
  {
    kind: 'chain',
    title: '用兵如神',
    hint: '“省”和“用”各在前一句的末尾。',
    solution: '省吃俭用兵如神机妙算',
    mask: '1000010011',
    bank: ['省', '如', '算', '妙'],
    width: 10,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }],
    idioms: [
      { answer: '省吃俭用', clue: '节约饮食和开销，生活俭朴', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '用兵如神', clue: '调兵遣将极其巧妙', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '神机妙算', clue: '计谋高明，预料准确', line: 0, start: 6, cells: [6, 7, 8, 9] }
    ]
  },
  {
    kind: 'chain',
    title: '人山人海',
    hint: '第一条成语的第一个字已经给出。',
    solution: '人山人海阔天空前绝后',
    mask: '1100101001',
    bank: ['山', '空', '阔', '人', '后'],
    width: 10,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }],
    idioms: [
      { answer: '人山人海', clue: '人聚集得非常多', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '海阔天空', clue: '形容天地辽阔，也指说话漫无边际', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '空前绝后', clue: '以前没有，以后也不会有', line: 0, start: 6, cells: [6, 7, 8, 9] }
    ]
  },
  {
    kind: 'chain',
    title: '心花怒放',
    hint: '共享字在相邻两句的正中间。',
    solution: '后来居上下一心花怒放',
    mask: '1110000100',
    bank: ['来', '花', '后', '居', '木'],
    width: 10,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }],
    idioms: [
      { answer: '后来居上', clue: '后来的人或事物超过先前的', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '上下一心', clue: '上上下下团结一致', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '心花怒放', clue: '心里高兴得像花儿盛开', line: 0, start: 6, cells: [6, 7, 8, 9] }
    ]
  },
  {
    kind: 'chain',
    title: '山穷水尽',
    hint: '一条链里有四个成语，先找每条释义。',
    solution: '放虎归山穷水尽善尽美中不足',
    mask: '0101100110000',
    bank: ['穷', '虎', '生', '善', '尽', '山'],
    width: 13,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }],
    idioms: [
      { answer: '放虎归山', clue: '把坏人放回老巢，留下祸根', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '山穷水尽', clue: '山和水都到了尽头，走投无路', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '尽善尽美', clue: '十分完善美好，没有缺陷', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '美中不足', clue: '总体很好，但还有小缺点', line: 0, start: 9, cells: [9, 10, 11, 12] }
    ]
  },
  {
    kind: 'chain',
    title: '天马行空',
    hint: '先找“人定胜天”的“天”，它还要接下一句。',
    solution: '足智多谋事在人定胜天马行空',
    mask: '1001000011010',
    bank: ['火', '胜', '谋', '冷', '天', '足', '行'],
    width: 13,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }],
    idioms: [
      { answer: '足智多谋', clue: '智慧充足，善于谋划', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '谋事在人', clue: '事情要靠人去谋划、努力', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '人定胜天', clue: '人的力量能够战胜自然或困难', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '天马行空', clue: '才思豪放不受拘束，或诗文气势豪放', line: 0, start: 9, cells: [9, 10, 11, 12] }
    ]
  },
  {
    kind: 'chain',
    title: '固若金汤',
    hint: '共享字可能藏在释义里没有直接出现的字上。',
    solution: '落地生根深蒂固若金汤',
    mask: '1110011100',
    bank: ['生', '落', '土', '固', '地', '目', '山', '若', '蒂'],
    width: 10,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }],
    idioms: [
      { answer: '落地生根', clue: '长期定居，或事物扎根生长', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '根深蒂固', clue: '基础深厚，不易动摇', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '固若金汤', clue: '防守非常坚固', line: 0, start: 6, cells: [6, 7, 8, 9] }
    ]
  },
  {
    kind: 'chain',
    title: '入木三分',
    hint: '“长驱直入”的“入”就是下一句的第一字。',
    solution: '三心二意味深长驱直入木三分',
    mask: '0111000011101',
    bank: ['真', '入', '耳', '心', '分', '直', '意', '二', '木', '暗'],
    width: 13,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }],
    idioms: [
      { answer: '三心二意', clue: '犹豫不定，意志不专一', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '意味深长', clue: '含义深刻，耐人寻味', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '长驱直入', clue: '快速向很远的地方挺进', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '入木三分', clue: '见解、描写深刻有力', line: 0, start: 9, cells: [9, 10, 11, 12] }
    ]
  },
  {
    kind: 'chain',
    title: '门庭若市',
    hint: '字池里有干扰字，不要只看字形。',
    solution: '天下无双喜临门庭若市井之徒',
    mask: '1001110011100',
    bank: ['上', '市', '前', '临', '天', '若', '喜', '双', '井', '日', '冷'],
    width: 13,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }],
    idioms: [
      { answer: '天下无双', clue: '举世没有第二个，独一无二', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '双喜临门', clue: '两件喜事同时到来', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '门庭若市', clue: '来往人多，非常热闹', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '市井之徒', clue: '市井中的普通人或粗俗之人', line: 0, start: 9, cells: [9, 10, 11, 12] }
    ]
  },
  {
    kind: 'chain',
    title: '智勇双全',
    hint: '先确定“当务之急”的“急”。',
    solution: '直截了当务之急中生智勇双全',
    mask: '1110011010011',
    bank: ['上', '了', '全', '直', '生', '急', '口', '秋', '暗', '截', '之', '双', '北'],
    width: 13,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }],
    idioms: [
      { answer: '直截了当', clue: '说话做事干脆爽快', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '当务之急', clue: '当前最急切要做的事', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '急中生智', clue: '危急时突然想出好办法', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '智勇双全', clue: '智谋和勇敢兼备', line: 0, start: 9, cells: [9, 10, 11, 12] }
    ]
  },
  {
    kind: 'chain',
    title: '一诺千金',
    hint: '共享字“言”会同时出现在两句里。',
    solution: '一诺千金玉良言而有信口开河',
    mask: '1011110011100',
    bank: ['明', '真', '千', '玉', '金', '一', '良', '长', '口', '水', '有', '人', '地', '信'],
    width: 13,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }],
    idioms: [
      { answer: '一诺千金', clue: '许下的诺言极有信用', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '金玉良言', clue: '非常宝贵有益的劝告', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '言而有信', clue: '说话算数，讲信用', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '信口开河', clue: '随口乱说，没有根据', line: 0, start: 9, cells: [9, 10, 11, 12] }
    ]
  },
  {
    kind: 'chain',
    title: '如鱼得水',
    hint: '“理直气壮”的“理”要和前一句接上。',
    solution: '如鱼得水泄不通情达理直气壮',
    mask: '1110011110011',
    bank: ['鱼', '不', '壮', '动', '去', '得', '南', '土', '通', '达', '气', '如', '暖', '上', '情', '生'],
    width: 13,
    height: 1,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }],
    idioms: [
      { answer: '如鱼得水', clue: '得到适合自己的环境或人', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '水泄不通', clue: '拥挤或包围得非常严密', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '通情达理', clue: '说话做事讲道理', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '理直气壮', clue: '理由充分，说话有底气', line: 0, start: 9, cells: [9, 10, 11, 12] }
    ]
  },
  {
    kind: 'cross',
    title: '一气呵成',
    hint: '两条链在“气”上交叉，共享字只能放一次。',
    solution: '一鼓作扬眉吐气宇轩昂首阔步步高升象万千变万化险为夷',
    mask: '0110101100011100100110100',
    bank: ['变', '步', '左', '险', '鼓', '宇', '作', '气', '步', '冬', '眉', '象', '万', '阔', '手', '雨'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 7 }, { row: 3, col: 8 }, { row: 3, col: 9 }, { row: 3, col: 10 }, { row: 3, col: 11 }, { row: 3, col: 12 }, { row: 4, col: 3 }, { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 }, { row: 8, col: 3 }, { row: 9, col: 3 }, { row: 10, col: 3 }, { row: 11, col: 3 }, { row: 12, col: 3 }],
    idioms: [
      { answer: '扬眉吐气', clue: '摆脱压抑后心情舒畅、得意', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '气宇轩昂', clue: '精神饱满，气度不凡', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '昂首阔步', clue: '抬起头大步前进，精神振奋', line: 0, start: 9, cells: [9, 10, 11, 12] },
      { answer: '步步高升', clue: '职位或成绩不断上升', line: 0, start: 12, cells: [12, 13, 14, 15] },
      { answer: '一鼓作气', clue: '趁着劲头一下子把事情做完', line: 1, start: 0, cells: [0, 1, 2, 6] },
      { answer: '气象万千', clue: '景象宏伟，变化多样', line: 1, start: 6, cells: [6, 16, 17, 18] },
      { answer: '千变万化', clue: '变化极多', line: 1, start: 18, cells: [18, 19, 20, 21] },
      { answer: '化险为夷', clue: '把危险转化为平安', line: 1, start: 21, cells: [21, 22, 23, 24] }
    ]
  },
  {
    kind: 'cross',
    title: '话中有话',
    hint: '“传为佳话”的最后一个字，也是左链的第一个字。',
    solution: '接踵而至理名言归正传为佳话里有话不投机不可失之交臂',
    mask: '1011010001110011110010100',
    bank: ['名', '口', '目', '之', '不', '佳', '春', '为', '至', '接', '而', '有', '投', '动', '秋', '传', '话', '可'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 1, col: 12 }, { row: 2, col: 12 }, { row: 3, col: 12 }, { row: 4, col: 12 }, { row: 5, col: 12 }, { row: 6, col: 12 }, { row: 7, col: 12 }, { row: 8, col: 12 }, { row: 9, col: 12 }, { row: 10, col: 12 }, { row: 11, col: 12 }, { row: 12, col: 12 }],
    idioms: [
      { answer: '接踵而至', clue: '一个接一个地到来', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '至理名言', clue: '最有道理、最有价值的话', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '言归正传', clue: '把话头拉回正题', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '传为佳话', clue: '流传开来，成为美谈', line: 0, start: 9, cells: [9, 10, 11, 12] },
      { answer: '话里有话', clue: '话中暗含别的意思', line: 1, start: 12, cells: [12, 13, 14, 15] },
      { answer: '话不投机', clue: '说不到一起，谈不下去', line: 1, start: 15, cells: [15, 16, 17, 18] },
      { answer: '机不可失', clue: '好机会不能错过', line: 1, start: 18, cells: [18, 19, 20, 21] },
      { answer: '失之交臂', clue: '擦肩而过，错过机会', line: 1, start: 21, cells: [21, 22, 23, 24] }
    ]
  },
  {
    kind: 'cross',
    title: '接二连三',
    hint: '“短兵相接”的“接”正好接上下面的链。',
    solution: '一分为二话不说长道短兵相接二连三言两语重心长年累月',
    mask: '1100010100011100111100111',
    bank: ['地', '死', '月', '二', '火', '言', '一', '重', '相', '不', '接', '分', '天', '累', '年', '两', '长', '春', '耳', '语'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 1, col: 12 }, { row: 2, col: 12 }, { row: 3, col: 12 }, { row: 4, col: 12 }, { row: 5, col: 12 }, { row: 6, col: 12 }, { row: 7, col: 12 }, { row: 8, col: 12 }, { row: 9, col: 12 }, { row: 10, col: 12 }, { row: 11, col: 12 }, { row: 12, col: 12 }],
    idioms: [
      { answer: '一分为二', clue: '全面地看待事物，看到两面', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '二话不说', clue: '不犹豫，马上行动', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '说长道短', clue: '议论别人的是非好坏', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '短兵相接', clue: '近距离激烈交锋', line: 0, start: 9, cells: [9, 10, 11, 12] },
      { answer: '接二连三', clue: '一个接一个，连续不断', line: 1, start: 12, cells: [12, 13, 14, 15] },
      { answer: '三言两语', clue: '用很少的话说清楚', line: 1, start: 15, cells: [15, 16, 17, 18] },
      { answer: '语重心长', clue: '言辞诚恳，情意深长', line: 1, start: 18, cells: [18, 19, 20, 21] },
      { answer: '长年累月', clue: '经历很多年月，时间长久', line: 1, start: 21, cells: [21, 22, 23, 24] }
    ]
  },
  {
    kind: 'cross',
    title: '龙行天下',
    hint: '“车水马龙”的“龙”是两条链的交点。',
    solution: '顾全大局促不安步当车水马龙飞凤舞文弄墨守成规行矩步',
    mask: '1010011100011110011110011',
    bank: ['不', '飞', '右', '墨', '月', '冬', '心', '凤', '弄', '步', '矩', '成', '守', '长', '明', '步', '大', '安', '马', '顾', '龙', '去'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 1, col: 12 }, { row: 2, col: 12 }, { row: 3, col: 12 }, { row: 4, col: 12 }, { row: 5, col: 12 }, { row: 6, col: 12 }, { row: 7, col: 12 }, { row: 8, col: 12 }, { row: 9, col: 12 }, { row: 10, col: 12 }, { row: 11, col: 12 }, { row: 12, col: 12 }],
    idioms: [
      { answer: '顾全大局', clue: '从整体利益出发考虑', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '局促不安', clue: '拘谨不自然，心里不安', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '安步当车', clue: '从容步行，当作坐车', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '车水马龙', clue: '车马往来不绝，非常热闹', line: 0, start: 9, cells: [9, 10, 11, 12] },
      { answer: '龙飞凤舞', clue: '书法笔势有力，也形容气势奔放', line: 1, start: 12, cells: [12, 13, 14, 15] },
      { answer: '舞文弄墨', clue: '玩弄文字技巧', line: 1, start: 15, cells: [15, 16, 17, 18] },
      { answer: '墨守成规', clue: '固守旧规矩，不肯变通', line: 1, start: 18, cells: [18, 19, 20, 21] },
      { answer: '规行矩步', clue: '举止合乎规矩，也指墨守成规', line: 1, start: 21, cells: [21, 22, 23, 24] }
    ]
  },
  {
    kind: 'cross',
    title: '继往开来',
    hint: '交点藏在两条链的中段，先把共同的“开”找出来。',
    solution: '一飞冲天壤之别散兵游勇往直前赴后继往开来生面不改色',
    mask: '0111100011110011110101101',
    bank: ['游', '北', '心', '继', '下', '西', '天', '飞', '来', '色', '往', '后', '往', '雪', '壤', '金', '赴', '少', '不', '面', '冲', '勇', '兵', '山'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 11 }, { row: 1, col: 11 }, { row: 2, col: 11 }, { row: 3, col: 11 }, { row: 4, col: 11 }, { row: 5, col: 11 }, { row: 6, col: 11 }, { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 7, col: 11 }, { row: 7, col: 12 }, { row: 8, col: 11 }, { row: 9, col: 11 }, { row: 10, col: 11 }, { row: 11, col: 11 }, { row: 12, col: 11 }],
    idioms: [
      { answer: '散兵游勇', clue: '没有统属的士兵，也指分散的力量', line: 0, start: 7, cells: [7, 8, 9, 10] },
      { answer: '勇往直前', clue: '勇敢地一直向前', line: 0, start: 10, cells: [10, 11, 12, 13] },
      { answer: '前赴后继', clue: '前面的人冲上去，后面的人跟上来', line: 0, start: 13, cells: [13, 14, 15, 16] },
      { answer: '继往开来', clue: '继承前人的事业，开辟未来', line: 0, start: 16, cells: [16, 17, 18, 19] },
      { answer: '一飞冲天', clue: '一下子取得惊人成就', line: 1, start: 0, cells: [0, 1, 2, 3] },
      { answer: '天壤之别', clue: '差别极大，像天和地', line: 1, start: 3, cells: [3, 4, 5, 6] },
      { answer: '别开生面', clue: '开创出新的局面或形式', line: 1, start: 6, cells: [6, 18, 20, 21] },
      { answer: '面不改色', clue: '遇到危险仍神色不变', line: 1, start: 21, cells: [21, 22, 23, 24] }
    ]
  },
  {
    kind: 'cross',
    title: '全力以赴',
    hint: '两链从同一个“一”字出发，再向不同方向展开。',
    solution: '一应俱全力以赴汤蹈火上浇油马当先发制人云亦云消雾散',
    mask: '1011110011110011110011110',
    bank: ['口', '恶', '当', '制', '消', '善', '亦', '上', '山', '发', '后', '俱', '西', '力', '以', '一', '古', '雾', '夏', '浇', '先', '云', '蹈', '火', '耳', '全'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 8, col: 0 }, { row: 9, col: 0 }, { row: 10, col: 0 }, { row: 11, col: 0 }, { row: 12, col: 0 }],
    idioms: [
      { answer: '一应俱全', clue: '一切都齐全', line: 0, start: 0, cells: [0, 1, 2, 3] },
      { answer: '全力以赴', clue: '用尽全力去做', line: 0, start: 3, cells: [3, 4, 5, 6] },
      { answer: '赴汤蹈火', clue: '不避艰险，奋勇向前', line: 0, start: 6, cells: [6, 7, 8, 9] },
      { answer: '火上浇油', clue: '使事态更加严重', line: 0, start: 9, cells: [9, 10, 11, 12] },
      { answer: '一马当先', clue: '带头走在最前面', line: 1, start: 0, cells: [0, 13, 14, 15] },
      { answer: '先发制人', clue: '先动手争取主动', line: 1, start: 15, cells: [15, 16, 17, 18] },
      { answer: '人云亦云', clue: '别人怎么说就跟着怎么说', line: 1, start: 18, cells: [18, 19, 20, 21] },
      { answer: '云消雾散', clue: '疑虑或困境像云雾一样消散', line: 1, start: 21, cells: [21, 22, 23, 24] }
    ]
  },
  {
    kind: 'cross',
    title: '久旱逢甘雨',
    hint: '这一关混入了五字俗语，先找“雨”的共同位置。',
    solution: '风久旱逢甘雨过天晴空万里应外合同舟车劳顿开茅塞翁失马',
    mask: '11011011110001100111100111',
    bank: ['翁', '丑', '逢', '空', '目', '马', '失', '日', '人', '少', '月', '久', '开', '顿', '车', '甘', '合', '晴', '劳', '外', '南', '风', '过', '天', '有', '动'],
    width: 14,
    height: 13,
    cells: [{ row: 0, col: 4 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 1, col: 8 }, { row: 1, col: 9 }, { row: 1, col: 10 }, { row: 1, col: 11 }, { row: 1, col: 12 }, { row: 1, col: 13 }, { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 }, { row: 5, col: 4 }, { row: 6, col: 4 }, { row: 7, col: 4 }, { row: 8, col: 4 }, { row: 9, col: 4 }, { row: 10, col: 4 }, { row: 11, col: 4 }, { row: 12, col: 4 }],
    idioms: [
      { answer: '久旱逢甘雨', clue: '长期干旱后终于下雨，比喻盼望已久的好事到来', line: 0, start: 1, cells: [1, 2, 3, 4, 5] },
      { answer: '雨过天晴', clue: '风雨过后天气转晴，比喻情况好转', line: 0, start: 5, cells: [5, 6, 7, 8] },
      { answer: '晴空万里', clue: '天空晴朗，没有一点云', line: 0, start: 8, cells: [8, 9, 10, 11] },
      { answer: '里应外合', clue: '外面攻打，里面接应，互相配合', line: 0, start: 11, cells: [11, 12, 13, 14] },
      { answer: '风雨同舟', clue: '在风雨中同坐一条船，比喻共同度过困难', line: 1, start: 0, cells: [0, 5, 15, 16] },
      { answer: '舟车劳顿', clue: '旅途奔波，十分劳累', line: 1, start: 16, cells: [16, 17, 18, 19] },
      { answer: '顿开茅塞', clue: '忽然理解、醒悟过来', line: 1, start: 19, cells: [19, 20, 21, 22] },
      { answer: '塞翁失马', clue: '坏事有时也能变成好事', line: 1, start: 22, cells: [22, 23, 24, 25] }
    ]
  },
  {
    kind: 'cross',
    title: '人心齐泰山移',
    hint: '这条链含六字俗语；交点“国”在链的末端。',
    solution: '人心齐泰山移花接木已成舟中敌国色天香车宝马到成功成身退',
    mask: '001110011110011110011110011',
    bank: ['已', '秋', '接', '马', '退', '身', '小', '齐', '国', '木', '美', '成', '北', '山', '成', '暖', '宝', '敌', '短', '土', '到', '天', '东', '色', '春', '泰', '风'],
    width: 15,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 0, col: 13 }, { row: 0, col: 14 }, { row: 1, col: 14 }, { row: 2, col: 14 }, { row: 3, col: 14 }, { row: 4, col: 14 }, { row: 5, col: 14 }, { row: 6, col: 14 }, { row: 7, col: 14 }, { row: 8, col: 14 }, { row: 9, col: 14 }, { row: 10, col: 14 }, { row: 11, col: 14 }, { row: 12, col: 14 }],
    idioms: [
      { answer: '人心齐泰山移', clue: '大家团结一致，就能产生巨大力量', line: 0, start: 0, cells: [0, 1, 2, 3, 4, 5] },
      { answer: '移花接木', clue: '暗中更换人或事物，以假乱真', line: 0, start: 5, cells: [5, 6, 7, 8] },
      { answer: '木已成舟', clue: '事情已成定局，无法改变', line: 0, start: 8, cells: [8, 9, 10, 11] },
      { answer: '舟中敌国', clue: '同船的人都像敌人，形容不得人心', line: 0, start: 11, cells: [11, 12, 13, 14] },
      { answer: '国色天香', clue: '形容女子美貌，也形容牡丹', line: 1, start: 14, cells: [14, 15, 16, 17] },
      { answer: '香车宝马', clue: '华丽的车马，形容出行豪华', line: 1, start: 17, cells: [17, 18, 19, 20] },
      { answer: '马到成功', clue: '战马一到就取得胜利，形容事情顺利', line: 1, start: 20, cells: [20, 21, 22, 23] },
      { answer: '功成身退', clue: '功业建成后主动退居幕后', line: 1, start: 23, cells: [23, 24, 25, 26] }
    ]
  }
];
