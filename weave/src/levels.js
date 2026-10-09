// WEAVE 关卡数据：成语/俗语链由人工挑选，空白与字池由 tools/build-levels.mjs 生成。
// chain = 单条长链；cross = 两条链共享一个交点；net = 一条横链与两条竖链织网。
// 0 = 已给出，1 = 空缺；每条词句的 cells 指向共享的格子编号。

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
      { answer: '一心一意', clue: '心思专一，没有别的念头', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '意气风发', clue: '精神振奋，气概昂扬', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '发人深省', clue: '启发人深刻思考、醒悟', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false }
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
      { answer: '省吃俭用', clue: '节约饮食和开销，生活俭朴', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '用兵如神', clue: '调兵遣将极其巧妙', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '神机妙算', clue: '计谋高明，预料准确', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false }
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
      { answer: '人山人海', clue: '人聚集得非常多', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '海阔天空', clue: '形容天地辽阔，也指说话漫无边际', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '空前绝后', clue: '以前没有，以后也不会有', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false }
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
      { answer: '后来居上', clue: '后来的人或事物超过先前的', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '上下一心', clue: '上上下下团结一致', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '心花怒放', clue: '心里高兴得像花儿盛开', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false }
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
      { answer: '放虎归山', clue: '把坏人放回老巢，留下祸根', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '山穷水尽', clue: '山和水都到了尽头，走投无路', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '尽善尽美', clue: '十分完善美好，没有缺陷', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '美中不足', clue: '总体很好，但还有小缺点', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false }
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
      { answer: '足智多谋', clue: '智慧充足，善于谋划', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '谋事在人', clue: '事情要靠人去谋划、努力', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '人定胜天', clue: '人的力量能够战胜自然或困难', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '天马行空', clue: '才思豪放不受拘束，或诗文气势豪放', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false }
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
      { answer: '落地生根', clue: '长期定居，或事物扎根生长', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '根深蒂固', clue: '基础深厚，不易动摇', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '固若金汤', clue: '防守非常坚固', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false }
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
      { answer: '三心二意', clue: '犹豫不定，意志不专一', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '意味深长', clue: '含义深刻，耐人寻味', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '长驱直入', clue: '快速向很远的地方挺进', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '入木三分', clue: '见解、描写深刻有力', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false }
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
      { answer: '天下无双', clue: '举世没有第二个，独一无二', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '双喜临门', clue: '两件喜事同时到来', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '门庭若市', clue: '来往人多，非常热闹', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '市井之徒', clue: '市井中的普通人或粗俗之人', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false }
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
      { answer: '直截了当', clue: '说话做事干脆爽快', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '当务之急', clue: '当前最急切要做的事', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '急中生智', clue: '危急时突然想出好办法', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '智勇双全', clue: '智谋和勇敢兼备', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false }
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
      { answer: '一诺千金', clue: '许下的诺言极有信用', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '金玉良言', clue: '非常宝贵有益的劝告', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '言而有信', clue: '说话算数，讲信用', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '信口开河', clue: '随口乱说，没有根据', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false }
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
      { answer: '如鱼得水', clue: '得到适合自己的环境或人', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '水泄不通', clue: '拥挤或包围得非常严密', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '通情达理', clue: '说话做事讲道理', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '理直气壮', clue: '理由充分，说话有底气', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false }
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
      { answer: '扬眉吐气', clue: '摆脱压抑后心情舒畅、得意', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '气宇轩昂', clue: '精神饱满，气度不凡', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '昂首阔步', clue: '抬起头大步前进，精神振奋', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '步步高升', clue: '职位或成绩不断上升', line: 0, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '一鼓作气', clue: '趁着劲头一下子把事情做完', line: 1, start: 0, cells: [0, 1, 2, 6], hiddenClue: false },
      { answer: '气象万千', clue: '景象宏伟，变化多样', line: 1, start: 6, cells: [6, 16, 17, 18], hiddenClue: false },
      { answer: '千变万化', clue: '变化极多', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '化险为夷', clue: '把危险转化为平安', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
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
      { answer: '接踵而至', clue: '一个接一个地到来', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '至理名言', clue: '最有道理、最有价值的话', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '言归正传', clue: '把话头拉回正题', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '传为佳话', clue: '流传开来，成为美谈', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '话里有话', clue: '话中暗含别的意思', line: 1, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '话不投机', clue: '说不到一起，谈不下去', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '机不可失', clue: '好机会不能错过', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '失之交臂', clue: '擦肩而过，错过机会', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
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
      { answer: '一分为二', clue: '全面地看待事物，看到两面', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '二话不说', clue: '不犹豫，马上行动', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '说长道短', clue: '议论别人的是非好坏', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '短兵相接', clue: '近距离激烈交锋', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '接二连三', clue: '一个接一个，连续不断', line: 1, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '三言两语', clue: '用很少的话说清楚', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '语重心长', clue: '言辞诚恳，情意深长', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '长年累月', clue: '经历很多年月，时间长久', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
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
      { answer: '顾全大局', clue: '从整体利益出发考虑', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '局促不安', clue: '拘谨不自然，心里不安', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '安步当车', clue: '从容步行，当作坐车', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '车水马龙', clue: '车马往来不绝，非常热闹', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '龙飞凤舞', clue: '书法笔势有力，也形容气势奔放', line: 1, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '舞文弄墨', clue: '玩弄文字技巧', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '墨守成规', clue: '固守旧规矩，不肯变通', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '规行矩步', clue: '举止合乎规矩，也指墨守成规', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
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
      { answer: '散兵游勇', clue: '没有统属的士兵，也指分散的力量', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '勇往直前', clue: '勇敢地一直向前', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '前赴后继', clue: '前面的人冲上去，后面的人跟上来', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '继往开来', clue: '继承前人的事业，开辟未来', line: 0, start: 16, cells: [16, 17, 18, 19], hiddenClue: false },
      { answer: '一飞冲天', clue: '一下子取得惊人成就', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '天壤之别', clue: '差别极大，像天和地', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '别开生面', clue: '开创出新的局面或形式', line: 1, start: 6, cells: [6, 18, 20, 21], hiddenClue: false },
      { answer: '面不改色', clue: '遇到危险仍神色不变', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
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
      { answer: '一应俱全', clue: '一切都齐全', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '全力以赴', clue: '用尽全力去做', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '赴汤蹈火', clue: '不避艰险，奋勇向前', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '火上浇油', clue: '使事态更加严重', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '一马当先', clue: '带头走在最前面', line: 1, start: 0, cells: [0, 13, 14, 15], hiddenClue: false },
      { answer: '先发制人', clue: '先动手争取主动', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '人云亦云', clue: '别人怎么说就跟着怎么说', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '云消雾散', clue: '疑虑或困境像云雾一样消散', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
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
      { answer: '久旱逢甘雨', clue: '长期干旱后终于下雨，比喻盼望已久的好事到来', line: 0, start: 1, cells: [1, 2, 3, 4, 5], hiddenClue: false },
      { answer: '雨过天晴', clue: '风雨过后天气转晴，比喻情况好转', line: 0, start: 5, cells: [5, 6, 7, 8], hiddenClue: false },
      { answer: '晴空万里', clue: '天空晴朗，没有一点云', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '里应外合', clue: '外面攻打，里面接应，互相配合', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '风雨同舟', clue: '在风雨中同坐一条船，比喻共同度过困难', line: 1, start: 0, cells: [0, 5, 15, 16], hiddenClue: false },
      { answer: '舟车劳顿', clue: '旅途奔波，十分劳累', line: 1, start: 16, cells: [16, 17, 18, 19], hiddenClue: false },
      { answer: '顿开茅塞', clue: '忽然理解、醒悟过来', line: 1, start: 19, cells: [19, 20, 21, 22], hiddenClue: false },
      { answer: '塞翁失马', clue: '坏事有时也能变成好事', line: 1, start: 22, cells: [22, 23, 24, 25], hiddenClue: false }
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
      { answer: '人心齐泰山移', clue: '大家团结一致，就能产生巨大力量', line: 0, start: 0, cells: [0, 1, 2, 3, 4, 5], hiddenClue: false },
      { answer: '移花接木', clue: '暗中更换人或事物，以假乱真', line: 0, start: 5, cells: [5, 6, 7, 8], hiddenClue: false },
      { answer: '木已成舟', clue: '事情已成定局，无法改变', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '舟中敌国', clue: '同船的人都像敌人，形容不得人心', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '国色天香', clue: '形容女子美貌，也形容牡丹', line: 1, start: 14, cells: [14, 15, 16, 17], hiddenClue: false },
      { answer: '香车宝马', clue: '华丽的车马，形容出行豪华', line: 1, start: 17, cells: [17, 18, 19, 20], hiddenClue: false },
      { answer: '马到成功', clue: '战马一到就取得胜利，形容事情顺利', line: 1, start: 20, cells: [20, 21, 22, 23], hiddenClue: false },
      { answer: '功成身退', clue: '功业建成后主动退居幕后', line: 1, start: 23, cells: [23, 24, 25, 26], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·实事求是',
    hint: '入木三分 这一族也来交叉：先找共同的交点字。',
    solution: '三心二意味深长驱徒有虚名副其实事求是非曲直入木三分',
    mask: '1001100000111100110101100',
    bank: ['副', '是', '秋', '小', '下', '味', '曲', '意', '其', '入', '木', '虚', '名', '前', '三', '求', '旧'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 12 }, { row: 1, col: 12 }, { row: 2, col: 12 }, { row: 3, col: 12 }, { row: 4, col: 12 }, { row: 5, col: 12 }, { row: 6, col: 12 }, { row: 7, col: 12 }, { row: 8, col: 0 }, { row: 8, col: 1 }, { row: 8, col: 2 }, { row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 }, { row: 8, col: 6 }, { row: 8, col: 7 }, { row: 8, col: 8 }, { row: 8, col: 9 }, { row: 8, col: 10 }, { row: 8, col: 11 }, { row: 8, col: 12 }, { row: 9, col: 12 }, { row: 10, col: 12 }, { row: 11, col: 12 }, { row: 12, col: 12 }],
    idioms: [
      { answer: '徒有虚名', clue: '空有名声，实际不相称', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '名副其实', clue: '名声或名称与实际相符', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '实事求是', clue: '从实际出发，探求真相', line: 0, start: 14, cells: [14, 15, 16, 17], hiddenClue: false },
      { answer: '是非曲直', clue: '事情的对与错、有理与无理', line: 0, start: 17, cells: [17, 18, 19, 20], hiddenClue: false },
      { answer: '三心二意', clue: '犹豫不定，意志不专一', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '意味深长', clue: '含义深刻，耐人寻味', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '长驱直入', clue: '快速向很远的地方挺进', line: 1, start: 6, cells: [6, 7, 20, 21], hiddenClue: false },
      { answer: '入木三分', clue: '见解、描写深刻有力', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·一心一意',
    hint: '用兵如神 这一族也来交叉：先找共同的交点字。',
    solution: '一心一意气风发人深省吃俭用兵如神机妙算',
    mask: '0111100111100111101',
    bank: ['人', '省', '如', '一', '意', '气', '后', '算', '今', '兵', '心', '动', '深', '暖', '吃', '死', '神', '机', '地'],
    width: 10,
    height: 10,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 1, col: 9 }, { row: 2, col: 9 }, { row: 3, col: 9 }, { row: 4, col: 9 }, { row: 5, col: 9 }, { row: 6, col: 9 }, { row: 7, col: 9 }, { row: 8, col: 9 }, { row: 9, col: 9 }],
    idioms: [
      { answer: '一心一意', clue: '心思专一，没有别的念头', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '意气风发', clue: '精神振奋，气概昂扬', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '发人深省', clue: '启发人深刻思考、醒悟', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '省吃俭用', clue: '节约饮食和开销，生活俭朴', line: 1, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '用兵如神', clue: '调兵遣将极其巧妙', line: 1, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '神机妙算', clue: '计谋高明，预料准确', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·心花怒放',
    hint: '接二连三·横 这一族也来交叉：先找共同的交点字。',
    solution: '后来居上下一心花怒放分为二话不说长道短兵相接',
    mask: '1100101101011000111101',
    bank: ['接', '后', '二', '金', '兵', '来', '花', '短', '夏', '下', '北', '心', '为', '真', '道', '长', '放', '日', '死'],
    width: 10,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 1, col: 5 }, { row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 }, { row: 6, col: 5 }, { row: 7, col: 5 }, { row: 8, col: 5 }, { row: 9, col: 5 }, { row: 10, col: 5 }, { row: 11, col: 5 }, { row: 12, col: 5 }],
    idioms: [
      { answer: '后来居上', clue: '后来的人或事物超过先前的', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '上下一心', clue: '上上下下团结一致', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '心花怒放', clue: '心里高兴得像花儿盛开', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '一分为二', clue: '全面地看待事物，看到两面', line: 1, start: 5, cells: [5, 10, 11, 12], hiddenClue: false },
      { answer: '二话不说', clue: '不犹豫，马上行动', line: 1, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '说长道短', clue: '议论别人的是非好坏', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '短兵相接', clue: '近距离激烈交锋', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·厉兵秣马',
    hint: '用兵如神 这一族也来交叉：先找共同的交点字。',
    solution: '省吃俭用风平浪静观其变本加厉兵秣马如神机妙算',
    mask: '1100110011110001111001',
    bank: ['观', '风', '平', '来', '省', '秣', '其', '算', '变', '左', '神', '本', '少', '有', '吃', '今', '马', '低', '如'],
    width: 13,
    height: 10,
    cells: [{ row: 0, col: 10 }, { row: 1, col: 10 }, { row: 2, col: 10 }, { row: 3, col: 10 }, { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 4, col: 8 }, { row: 4, col: 9 }, { row: 4, col: 10 }, { row: 4, col: 11 }, { row: 4, col: 12 }, { row: 5, col: 10 }, { row: 6, col: 10 }, { row: 7, col: 10 }, { row: 8, col: 10 }, { row: 9, col: 10 }],
    idioms: [
      { answer: '风平浪静', clue: '水面平静，比喻平静无事', line: 0, start: 4, cells: [4, 5, 6, 7], hiddenClue: false },
      { answer: '静观其变', clue: '冷静观察事情变化', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '变本加厉', clue: '情况变得比原来更严重', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '厉兵秣马', clue: '磨好兵器、喂饱战马，准备战斗', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '省吃俭用', clue: '节约饮食和开销，生活俭朴', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '用兵如神', clue: '调兵遣将极其巧妙', line: 1, start: 3, cells: [3, 14, 17, 18], hiddenClue: false },
      { answer: '神机妙算', clue: '计谋高明，预料准确', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·如鱼得水',
    hint: '壮志凌云 这一族也来交叉：先找共同的交点字。',
    solution: '如鱼得水泄不通情达理直气壮志凌云开见日新月异想天开',
    mask: '0101100101100111000111100',
    bank: ['志', '秋', '直', '泄', '异', '鱼', '山', '月', '想', '情', '丑', '凌', '新', '理', '云', '大', '目', '水', '下'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 1, col: 12 }, { row: 2, col: 12 }, { row: 3, col: 12 }, { row: 4, col: 12 }, { row: 5, col: 12 }, { row: 6, col: 12 }, { row: 7, col: 12 }, { row: 8, col: 12 }, { row: 9, col: 12 }, { row: 10, col: 12 }, { row: 11, col: 12 }, { row: 12, col: 12 }],
    idioms: [
      { answer: '如鱼得水', clue: '得到适合自己的环境或人', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '水泄不通', clue: '拥挤或包围得非常严密', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '通情达理', clue: '说话做事讲道理', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '理直气壮', clue: '理由充分，说话有底气', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '壮志凌云', clue: '志向远大，气概豪迈', line: 1, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '云开见日', clue: '困境过去，重见光明', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '日新月异', clue: '发展变化非常快', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '异想天开', clue: '想法离奇，不切实际', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·游刃有余',
    hint: '继往开来·横 这一族也来交叉：先找共同的交点字。',
    solution: '散兵力争上游刃有余音绕梁上君子勇往直前赴后继往开来',
    mask: '0101101001111010100011001',
    bank: ['后', '上', '月', '子', '上', '春', '刃', '争', '绕', '冬', '低', '继', '梁', '兵', '少', '日', '往', '音', '来'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 }, { row: 2, col: 7 }, { row: 2, col: 8 }, { row: 2, col: 9 }, { row: 2, col: 10 }, { row: 2, col: 11 }, { row: 2, col: 12 }, { row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 }, { row: 8, col: 3 }, { row: 9, col: 3 }, { row: 10, col: 3 }, { row: 11, col: 3 }, { row: 12, col: 3 }],
    idioms: [
      { answer: '力争上游', clue: '努力争取先进', line: 0, start: 2, cells: [2, 3, 4, 5], hiddenClue: false },
      { answer: '游刃有余', clue: '技术熟练，做事轻松', line: 0, start: 5, cells: [5, 6, 7, 8], hiddenClue: false },
      { answer: '余音绕梁', clue: '歌声或音乐优美，久久不散', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '梁上君子', clue: '窃贼的代称', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '散兵游勇', clue: '没有统属的士兵，也指分散的力量', line: 1, start: 0, cells: [0, 1, 5, 15], hiddenClue: false },
      { answer: '勇往直前', clue: '勇敢地一直向前', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '前赴后继', clue: '前面的人冲上去，后面的人跟上来', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '继往开来', clue: '继承前人的事业，开辟未来', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·全力以赴·横',
    hint: '心花怒放 这一族也来交叉：先找共同的交点字。',
    solution: '后来居一应俱全力以赴汤蹈火上浇油下一心花怒放',
    mask: '1001011110001110110011',
    bank: ['以', '火', '上', '土', '冬', '俱', '一', '浇', '一', '长', '放', '古', '动', '怒', '下', '全', '后', '静', '力'],
    width: 13,
    height: 10,
    cells: [{ row: 0, col: 10 }, { row: 1, col: 10 }, { row: 2, col: 10 }, { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 7 }, { row: 3, col: 8 }, { row: 3, col: 9 }, { row: 3, col: 10 }, { row: 3, col: 11 }, { row: 3, col: 12 }, { row: 4, col: 10 }, { row: 5, col: 10 }, { row: 6, col: 10 }, { row: 7, col: 10 }, { row: 8, col: 10 }, { row: 9, col: 10 }],
    idioms: [
      { answer: '一应俱全', clue: '一切都齐全', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '全力以赴', clue: '用尽全力去做', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '赴汤蹈火', clue: '不避艰险，奋勇向前', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '火上浇油', clue: '使事态更加严重', line: 0, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '后来居上', clue: '后来的人或事物超过先前的', line: 1, start: 0, cells: [0, 1, 2, 13], hiddenClue: false },
      { answer: '上下一心', clue: '上上下下团结一致', line: 1, start: 13, cells: [13, 16, 17, 18], hiddenClue: false },
      { answer: '心花怒放', clue: '心里高兴得像花儿盛开', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·人山人海',
    hint: '一心一意 这一族也来交叉：先找共同的交点字。',
    solution: '一心一意气风发人山人海阔天空前绝后深省',
    mask: '1110011101111001110',
    bank: ['金', '一', '石', '海', '心', '一', '风', '阔', '明', '发', '深', '土', '口', '水', '人', '天', '木', '人', '绝', '后'],
    width: 10,
    height: 10,
    cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 8, col: 0 }, { row: 9, col: 0 }],
    idioms: [
      { answer: '人山人海', clue: '人聚集得非常多', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '海阔天空', clue: '形容天地辽阔，也指说话漫无边际', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '空前绝后', clue: '以前没有，以后也不会有', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '一心一意', clue: '心思专一，没有别的念头', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '意气风发', clue: '精神振奋，气概昂扬', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '发人深省', clue: '启发人深刻思考、醒悟', line: 1, start: 6, cells: [6, 7, 17, 18], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·水到渠成',
    hint: '一心一意 这一族也来交叉：先找共同的交点字。',
    solution: '一心一意气风发水到渠成人之美不胜收放自如深省',
    mask: '1110011111001111001010',
    bank: ['不', '短', '之', '胜', '多', '美', '东', '动', '得', '春', '水', '风', '一', '渠', '心', '发', '雪', '一', '自', '到', '深'],
    width: 13,
    height: 10,
    cells: [{ row: 0, col: 4 }, { row: 1, col: 4 }, { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 }, { row: 5, col: 4 }, { row: 6, col: 4 }, { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 7, col: 11 }, { row: 7, col: 12 }, { row: 8, col: 4 }, { row: 9, col: 4 }],
    idioms: [
      { answer: '水到渠成', clue: '条件具备后，事情自然顺利成功', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '成人之美', clue: '成全别人的好事', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '美不胜收', clue: '美好的事物太多，看不过来', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '收放自如', clue: '控制得当，进退有度', line: 0, start: 16, cells: [16, 17, 18, 19], hiddenClue: false },
      { answer: '一心一意', clue: '心思专一，没有别的念头', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '意气风发', clue: '精神振奋，气概昂扬', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '发人深省', clue: '启发人深刻思考、醒悟', line: 1, start: 6, cells: [6, 11, 20, 21], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·无中生有',
    hint: '智勇双全 这一族也来交叉：先找共同的交点字。',
    solution: '直截了当务无中生有备无患得患失之毫厘急中生智勇双全',
    mask: '1010011100011100101110011',
    bank: ['秋', '冬', '双', '患', '患', '生', '西', '今', '中', '了', '耳', '左', '中', '全', '生', '急', '毫', '无', '得', '直', '真'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 10 }, { row: 1, col: 10 }, { row: 2, col: 10 }, { row: 3, col: 10 }, { row: 4, col: 10 }, { row: 5, col: 0 }, { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 }, { row: 5, col: 9 }, { row: 5, col: 10 }, { row: 5, col: 11 }, { row: 5, col: 12 }, { row: 6, col: 10 }, { row: 7, col: 10 }, { row: 8, col: 10 }, { row: 9, col: 10 }, { row: 10, col: 10 }, { row: 11, col: 10 }, { row: 12, col: 10 }],
    idioms: [
      { answer: '无中生有', clue: '凭空捏造，把没有的说成有', line: 0, start: 5, cells: [5, 6, 7, 8], hiddenClue: false },
      { answer: '有备无患', clue: '事先有准备，就不会有祸患', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '患得患失', clue: '担心得不到，得到后又怕失去', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '失之毫厘', clue: '开始相差很小，结果会造成很大错误', line: 0, start: 14, cells: [14, 15, 16, 17], hiddenClue: false },
      { answer: '直截了当', clue: '说话做事干脆爽快', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '当务之急', clue: '当前最急切要做的事', line: 1, start: 3, cells: [3, 4, 15, 18], hiddenClue: false },
      { answer: '急中生智', clue: '危急时突然想出好办法', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '智勇双全', clue: '智谋和勇敢兼备', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·接二连三·横',
    hint: '何乐不为 这一族也来交叉：先找共同的交点字。',
    solution: '无可奈何乐一分为二话不说长道短兵相接为所欲为民除害',
    mask: '1100111000111000111000111',
    bank: ['相', '长', '北', '生', '乐', '春', '害', '接', '真', '民', '一', '说', '水', '分', '可', '古', '无', '为', '死', '不', '除'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 5 }, { row: 1, col: 5 }, { row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 0 }, { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 }, { row: 5, col: 9 }, { row: 5, col: 10 }, { row: 5, col: 11 }, { row: 5, col: 12 }, { row: 6, col: 5 }, { row: 7, col: 5 }, { row: 8, col: 5 }, { row: 9, col: 5 }, { row: 10, col: 5 }, { row: 11, col: 5 }, { row: 12, col: 5 }],
    idioms: [
      { answer: '一分为二', clue: '全面地看待事物，看到两面', line: 0, start: 5, cells: [5, 6, 7, 8], hiddenClue: false },
      { answer: '二话不说', clue: '不犹豫，马上行动', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '说长道短', clue: '议论别人的是非好坏', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '短兵相接', clue: '近距离激烈交锋', line: 0, start: 14, cells: [14, 15, 16, 17], hiddenClue: false },
      { answer: '无可奈何', clue: '一点办法也没有', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '何乐不为', clue: '为什么不乐意去做呢', line: 1, start: 3, cells: [3, 4, 10, 18], hiddenClue: false },
      { answer: '为所欲为', clue: '想做什么就做什么，任意妄为', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '为民除害', clue: '替百姓除掉祸害', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·全力以赴·竖',
    hint: '人心齐泰山移·竖 这一族也来交叉：先找共同的交点字。',
    solution: '国色天香车宝一马当先发制人云亦云消雾散到成功成身退',
    mask: '1000111100111000101100111',
    bank: ['一', '成', '上', '国', '发', '到', '消', '车', '人', '马', '制', '金', '右', '手', '失', '身', '退', '散', '左', '宝', '新'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 1 }, { row: 5, col: 1 }, { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 }, { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 7, col: 1 }, { row: 8, col: 1 }, { row: 9, col: 1 }, { row: 10, col: 1 }, { row: 11, col: 1 }, { row: 12, col: 1 }],
    idioms: [
      { answer: '一马当先', clue: '带头走在最前面', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '先发制人', clue: '先动手争取主动', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '人云亦云', clue: '别人怎么说就跟着怎么说', line: 0, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '云消雾散', clue: '疑虑或困境像云雾一样消散', line: 0, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '国色天香', clue: '形容女子美貌，也形容牡丹', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '香车宝马', clue: '华丽的车马，形容出行豪华', line: 1, start: 3, cells: [3, 4, 5, 7], hiddenClue: false },
      { answer: '马到成功', clue: '战马一到就取得胜利，形容事情顺利', line: 1, start: 7, cells: [7, 19, 20, 21], hiddenClue: false },
      { answer: '功成身退', clue: '功业建成后主动退居幕后', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·继往开来·竖',
    hint: '一心一意 这一族也来交叉：先找共同的交点字。',
    solution: '一心一飞冲天壤之别开生面不改色意气风发人深省',
    mask: '0101111001111011100111',
    bank: ['无', '壤', '深', '省', '小', '意', '心', '面', '水', '冲', '人', '生', '飞', '西', '善', '开', '天', '色', '不', '静', '南', '气', '多'],
    width: 13,
    height: 10,
    cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 }, { row: 2, col: 7 }, { row: 2, col: 8 }, { row: 2, col: 9 }, { row: 2, col: 10 }, { row: 2, col: 11 }, { row: 2, col: 12 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 8, col: 0 }, { row: 9, col: 0 }],
    idioms: [
      { answer: '一飞冲天', clue: '一下子取得惊人成就', line: 0, start: 2, cells: [2, 3, 4, 5], hiddenClue: false },
      { answer: '天壤之别', clue: '差别极大，像天和地', line: 0, start: 5, cells: [5, 6, 7, 8], hiddenClue: false },
      { answer: '别开生面', clue: '开创出新的局面或形式', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '面不改色', clue: '遇到危险仍神色不变', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '一心一意', clue: '心思专一，没有别的念头', line: 1, start: 0, cells: [0, 1, 2, 15], hiddenClue: false },
      { answer: '意气风发', clue: '精神振奋，气概昂扬', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '发人深省', clue: '启发人深刻思考、醒悟', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·话中有话·竖',
    hint: '用兵如神 这一族也来交叉：先找共同的交点字。',
    solution: '省吃俭用兵如神话里有话不投机不可失之交臂妙算',
    mask: '1011110101111001101011',
    bank: ['算', '投', '土', '前', '妙', '不', '南', '明', '用', '有', '交', '人', '死', '话', '今', '兵', '省', '如', '可', '俭', '水', '话', '右', '失'],
    width: 13,
    height: 10,
    cells: [{ row: 0, col: 6 }, { row: 1, col: 6 }, { row: 2, col: 6 }, { row: 3, col: 6 }, { row: 4, col: 6 }, { row: 5, col: 6 }, { row: 6, col: 6 }, { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 7, col: 11 }, { row: 7, col: 12 }, { row: 8, col: 6 }, { row: 9, col: 6 }],
    idioms: [
      { answer: '话里有话', clue: '话中暗含别的意思', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '话不投机', clue: '说不到一起，谈不下去', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '机不可失', clue: '好机会不能错过', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '失之交臂', clue: '擦肩而过，错过机会', line: 0, start: 16, cells: [16, 17, 18, 19], hiddenClue: false },
      { answer: '省吃俭用', clue: '节约饮食和开销，生活俭朴', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '用兵如神', clue: '调兵遣将极其巧妙', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '神机妙算', clue: '计谋高明，预料准确', line: 1, start: 6, cells: [6, 13, 20, 21], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·固若金汤',
    hint: '全力以赴·横 这一族也来交叉：先找共同的交点字。',
    solution: '一应俱全力以赴落地生根深蒂固若金汤蹈火上浇油',
    mask: '1100111011110011100111',
    bank: ['以', '春', '油', '地', '失', '冬', '无', '汤', '有', '若', '南', '旧', '一', '力', '日', '生', '山', '上', '深', '应', '赴', '金', '根', '云', '浇'],
    width: 10,
    height: 13,
    cells: [{ row: 0, col: 9 }, { row: 1, col: 9 }, { row: 2, col: 9 }, { row: 3, col: 9 }, { row: 4, col: 9 }, { row: 5, col: 9 }, { row: 6, col: 9 }, { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 8, col: 9 }, { row: 9, col: 9 }, { row: 10, col: 9 }, { row: 11, col: 9 }, { row: 12, col: 9 }],
    idioms: [
      { answer: '落地生根', clue: '长期定居，或事物扎根生长', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '根深蒂固', clue: '基础深厚，不易动摇', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '固若金汤', clue: '防守非常坚固', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '一应俱全', clue: '一切都齐全', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '全力以赴', clue: '用尽全力去做', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '赴汤蹈火', clue: '不避艰险，奋勇向前', line: 1, start: 6, cells: [6, 16, 17, 18], hiddenClue: false },
      { answer: '火上浇油', clue: '使事态更加严重', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·开门见山',
    hint: '智勇双全 这一族也来交叉：先找共同的交点字。',
    solution: '直截了当务之急开门见山明水秀外慧中流砥柱生智勇双全',
    mask: '1001110101111001011011110',
    bank: ['明', '勇', '开', '死', '流', '慧', '目', '智', '砥', '之', '山', '雪', '云', '直', '见', '去', '水', '生', '双', '得', '火', '务', '假', '心', '当'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 9 }, { row: 1, col: 9 }, { row: 2, col: 9 }, { row: 3, col: 9 }, { row: 4, col: 9 }, { row: 5, col: 9 }, { row: 6, col: 9 }, { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 7, col: 11 }, { row: 7, col: 12 }, { row: 8, col: 9 }, { row: 9, col: 9 }, { row: 10, col: 9 }, { row: 11, col: 9 }, { row: 12, col: 9 }],
    idioms: [
      { answer: '开门见山', clue: '说话写文章直截了当', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '山明水秀', clue: '山水清朗秀丽', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '秀外慧中', clue: '外表秀美，内心聪慧', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '中流砥柱', clue: '在艰难环境中起支柱作用的人或力量', line: 0, start: 16, cells: [16, 17, 18, 19], hiddenClue: false },
      { answer: '直截了当', clue: '说话做事干脆爽快', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '当务之急', clue: '当前最急切要做的事', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '急中生智', clue: '危急时突然想出好办法', line: 1, start: 6, cells: [6, 16, 20, 21], hiddenClue: false },
      { answer: '智勇双全', clue: '智谋和勇敢兼备', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·月下老人',
    hint: '全力以赴·横 这一族也来交叉：先找共同的交点字。',
    solution: '月下老人杰地灵机一动人心弦应俱全力以赴汤蹈火上浇油',
    mask: '1100101100111100111100111',
    bank: ['去', '汤', '土', '下', '浇', '南', '心', '应', '新', '明', '弦', '油', '云', '小', '灵', '赴', '以', '人', '上', '月', '机', '北', '力', '金', '杰'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 }, { row: 6, col: 8 }, { row: 7, col: 8 }, { row: 8, col: 8 }, { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }],
    idioms: [
      { answer: '月下老人', clue: '主管婚姻的神，指媒人', line: 0, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '人杰地灵', clue: '杰出人物出生或到过，地方也出名', line: 0, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '灵机一动', clue: '忽然想出好主意', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '动人心弦', clue: '打动人心，使人激动', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '一应俱全', clue: '一切都齐全', line: 1, start: 8, cells: [8, 13, 14, 15], hiddenClue: false },
      { answer: '全力以赴', clue: '用尽全力去做', line: 1, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '赴汤蹈火', clue: '不避艰险，奋勇向前', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '火上浇油', clue: '使事态更加严重', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·龙行天下·横',
    hint: '接二连三·横 这一族也来交叉：先找共同的交点字。',
    solution: '一分为二话顾全大局促不安步当车水马龙说长道短兵相接',
    mask: '1110011100111000111110011',
    bank: ['夏', '假', '相', '分', '接', '暗', '春', '口', '不', '说', '大', '道', '真', '一', '全', '安', '长', '龙', '为', '多', '顾', '火', '古', '步', '马'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 5 }, { row: 1, col: 5 }, { row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 0 }, { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 }, { row: 5, col: 9 }, { row: 5, col: 10 }, { row: 5, col: 11 }, { row: 5, col: 12 }, { row: 6, col: 5 }, { row: 7, col: 5 }, { row: 8, col: 5 }, { row: 9, col: 5 }, { row: 10, col: 5 }, { row: 11, col: 5 }, { row: 12, col: 5 }],
    idioms: [
      { answer: '顾全大局', clue: '从整体利益出发考虑', line: 0, start: 5, cells: [5, 6, 7, 8], hiddenClue: false },
      { answer: '局促不安', clue: '拘谨不自然，心里不安', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '安步当车', clue: '从容步行，当作坐车', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '车水马龙', clue: '车马往来不绝，非常热闹', line: 0, start: 14, cells: [14, 15, 16, 17], hiddenClue: false },
      { answer: '一分为二', clue: '全面地看待事物，看到两面', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '二话不说', clue: '不犹豫，马上行动', line: 1, start: 3, cells: [3, 4, 10, 18], hiddenClue: false },
      { answer: '说长道短', clue: '议论别人的是非好坏', line: 1, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '短兵相接', clue: '近距离激烈交锋', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·人心齐泰山移·横',
    hint: '人山人海 这一族也来交叉：先找共同的交点字。',
    solution: '人山人心齐泰山移花接木已成舟中敌国海阔天空前绝后',
    mask: '011011110111100110011110',
    bank: ['雪', '国', '北', '泰', '山', '敌', '人', '静', '成', '已', '手', '金', '夏', '死', '绝', '天', '前', '山', '齐', '空', '移', '有', '木', '接', '石'],
    width: 15,
    height: 10,
    cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 }, { row: 2, col: 7 }, { row: 2, col: 8 }, { row: 2, col: 9 }, { row: 2, col: 10 }, { row: 2, col: 11 }, { row: 2, col: 12 }, { row: 2, col: 13 }, { row: 2, col: 14 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 8, col: 0 }, { row: 9, col: 0 }],
    idioms: [
      { answer: '人心齐泰山移', clue: '大家团结一致，就能产生巨大力量', line: 0, start: 2, cells: [2, 3, 4, 5, 6, 7], hiddenClue: false },
      { answer: '移花接木', clue: '暗中更换人或事物，以假乱真', line: 0, start: 7, cells: [7, 8, 9, 10], hiddenClue: false },
      { answer: '木已成舟', clue: '事情已成定局，无法改变', line: 0, start: 10, cells: [10, 11, 12, 13], hiddenClue: false },
      { answer: '舟中敌国', clue: '同船的人都像敌人，形容不得人心', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '人山人海', clue: '人聚集得非常多', line: 1, start: 0, cells: [0, 1, 2, 17], hiddenClue: false },
      { answer: '海阔天空', clue: '形容天地辽阔，也指说话漫无边际', line: 1, start: 17, cells: [17, 18, 19, 20], hiddenClue: false },
      { answer: '空前绝后', clue: '以前没有，以后也不会有', line: 1, start: 20, cells: [20, 21, 22, 23], hiddenClue: false }
    ]
  },
  {
    kind: 'cross',
    title: '织网·天马行空',
    hint: '厉兵秣马 这一族也来交叉：先找共同的交点字。',
    solution: '风平浪静观其变本加厉兵秣足智多谋事在人定胜天马行空',
    mask: '1110011110011110011110011',
    bank: ['风', '秋', '胜', '本', '假', '空', '死', '其', '行', '加', '变', '在', '冷', '秣', '平', '人', '浪', '口', '足', '高', '地', '定', '古', '真', '多', '智', '水'],
    width: 13,
    height: 13,
    cells: [{ row: 0, col: 10 }, { row: 1, col: 10 }, { row: 2, col: 10 }, { row: 3, col: 10 }, { row: 4, col: 10 }, { row: 5, col: 10 }, { row: 6, col: 10 }, { row: 7, col: 10 }, { row: 8, col: 10 }, { row: 9, col: 10 }, { row: 10, col: 10 }, { row: 11, col: 10 }, { row: 12, col: 0 }, { row: 12, col: 1 }, { row: 12, col: 2 }, { row: 12, col: 3 }, { row: 12, col: 4 }, { row: 12, col: 5 }, { row: 12, col: 6 }, { row: 12, col: 7 }, { row: 12, col: 8 }, { row: 12, col: 9 }, { row: 12, col: 10 }, { row: 12, col: 11 }, { row: 12, col: 12 }],
    idioms: [
      { answer: '足智多谋', clue: '智慧充足，善于谋划', line: 0, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '谋事在人', clue: '事情要靠人去谋划、努力', line: 0, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '人定胜天', clue: '人的力量能够战胜自然或困难', line: 0, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '天马行空', clue: '才思豪放不受拘束，或诗文气势豪放', line: 0, start: 21, cells: [21, 22, 23, 24], hiddenClue: false },
      { answer: '风平浪静', clue: '水面平静，比喻平静无事', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '静观其变', clue: '冷静观察事情变化', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '变本加厉', clue: '情况变得比原来更严重', line: 1, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '厉兵秣马', clue: '磨好兵器、喂饱战马，准备战斗', line: 1, start: 9, cells: [9, 10, 11, 22], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·一心一意',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '后来居上下一一心一意气风发人深省花吃怒俭放用兵如神机妙算',
    mask: '0111100011100111111010111101',
    bank: ['机', '低', '丑', '吃', '怒', '算', '深', '如', '居', '兵', '耳', '来', '人', '放', '得', '真', '花', '省', '气', '意', '东', '上', '一', '下', '神', '木', '石'],
    width: 10,
    height: 16,
    cells: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 1 }, { row: 5, col: 1 }, { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 }, { row: 6, col: 9 }, { row: 7, col: 1 }, { row: 7, col: 9 }, { row: 8, col: 1 }, { row: 8, col: 9 }, { row: 9, col: 1 }, { row: 9, col: 9 }, { row: 10, col: 9 }, { row: 11, col: 9 }, { row: 12, col: 9 }, { row: 13, col: 9 }, { row: 14, col: 9 }, { row: 15, col: 9 }],
    idioms: [
      { answer: '一心一意', clue: '心思专一，没有别的念头', line: 0, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '意气风发', clue: '精神振奋，气概昂扬', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '发人深省', clue: '启发人深刻思考、醒悟', line: 0, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '省吃俭用', clue: '节约饮食和开销，生活俭朴', line: 1, start: 15, cells: [15, 17, 19, 21], hiddenClue: false },
      { answer: '用兵如神', clue: '调兵遣将极其巧妙', line: 1, start: 21, cells: [21, 22, 23, 24], hiddenClue: true },
      { answer: '神机妙算', clue: '计谋高明，预料准确', line: 1, start: 24, cells: [24, 25, 26, 27], hiddenClue: false },
      { answer: '后来居上', clue: '后来的人或事物超过先前的', line: 2, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '上下一心', clue: '上上下下团结一致', line: 2, start: 3, cells: [3, 4, 5, 7], hiddenClue: true },
      { answer: '心花怒放', clue: '心里高兴得像花儿盛开', line: 2, start: 7, cells: [7, 16, 18, 20], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·壮志凌云',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '一马当先发制人云亦壮志凌云开见日新月异想天开消门雾见散山明水秀外慧中流砥柱',
    mask: '0111100100111100011100100011100101101',
    bank: ['志', '想', '消', '无', '外', '西', '开', '山', '后', '先', '云', '凌', '中', '月', '云', '异', '散', '来', '当', '柱', '马', '发', '死', '火', '长', '流', '春', '明'],
    width: 13,
    height: 22,
    cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 }, { row: 8, col: 3 }, { row: 9, col: 0 }, { row: 9, col: 1 }, { row: 9, col: 2 }, { row: 9, col: 3 }, { row: 9, col: 4 }, { row: 9, col: 5 }, { row: 9, col: 6 }, { row: 9, col: 7 }, { row: 9, col: 8 }, { row: 9, col: 9 }, { row: 9, col: 10 }, { row: 9, col: 11 }, { row: 9, col: 12 }, { row: 10, col: 3 }, { row: 10, col: 12 }, { row: 11, col: 3 }, { row: 11, col: 12 }, { row: 12, col: 3 }, { row: 12, col: 12 }, { row: 13, col: 12 }, { row: 14, col: 12 }, { row: 15, col: 12 }, { row: 16, col: 12 }, { row: 17, col: 12 }, { row: 18, col: 12 }, { row: 19, col: 12 }, { row: 20, col: 12 }, { row: 21, col: 12 }],
    idioms: [
      { answer: '壮志凌云', clue: '志向远大，气概豪迈', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '云开见日', clue: '困境过去，重见光明', line: 0, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '日新月异', clue: '发展变化非常快', line: 0, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '异想天开', clue: '想法离奇，不切实际', line: 0, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '一马当先', clue: '带头走在最前面', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '先发制人', clue: '先动手争取主动', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: true },
      { answer: '人云亦云', clue: '别人怎么说就跟着怎么说', line: 1, start: 6, cells: [6, 7, 8, 12], hiddenClue: false },
      { answer: '云消雾散', clue: '疑虑或困境像云雾一样消散', line: 1, start: 12, cells: [12, 22, 24, 26], hiddenClue: false },
      { answer: '开门见山', clue: '说话写文章直截了当', line: 2, start: 21, cells: [21, 23, 25, 27], hiddenClue: false },
      { answer: '山明水秀', clue: '山水清朗秀丽', line: 2, start: 27, cells: [27, 28, 29, 30], hiddenClue: true },
      { answer: '秀外慧中', clue: '外表秀美，内心聪慧', line: 2, start: 30, cells: [30, 31, 32, 33], hiddenClue: false },
      { answer: '中流砥柱', clue: '在艰难环境中起支柱作用的人或力量', line: 2, start: 33, cells: [33, 34, 35, 36], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·话中有话·竖',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '接踵而至理名言归水正到传渠为成佳人话里有话不投机不可失之交臂美不胜收放自如',
    mask: '0100101100100101110001111001111100101',
    bank: ['不', '美', '佳', '土', '话', '如', '南', '耳', '金', '不', '臂', '理', '人', '不', '心', '到', '古', '大', '来', '为', '交', '之', '踵', '放', '言', '投', '归', '机'],
    width: 13,
    height: 20,
    cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 }, { row: 7, col: 10 }, { row: 8, col: 3 }, { row: 8, col: 10 }, { row: 9, col: 3 }, { row: 9, col: 10 }, { row: 10, col: 3 }, { row: 10, col: 10 }, { row: 11, col: 3 }, { row: 11, col: 10 }, { row: 12, col: 0 }, { row: 12, col: 1 }, { row: 12, col: 2 }, { row: 12, col: 3 }, { row: 12, col: 4 }, { row: 12, col: 5 }, { row: 12, col: 6 }, { row: 12, col: 7 }, { row: 12, col: 8 }, { row: 12, col: 9 }, { row: 12, col: 10 }, { row: 12, col: 11 }, { row: 12, col: 12 }, { row: 13, col: 10 }, { row: 14, col: 10 }, { row: 15, col: 10 }, { row: 16, col: 10 }, { row: 17, col: 10 }, { row: 18, col: 10 }, { row: 19, col: 10 }],
    idioms: [
      { answer: '话里有话', clue: '话中暗含别的意思', line: 0, start: 17, cells: [17, 18, 19, 20], hiddenClue: false },
      { answer: '话不投机', clue: '说不到一起，谈不下去', line: 0, start: 20, cells: [20, 21, 22, 23], hiddenClue: false },
      { answer: '机不可失', clue: '好机会不能错过', line: 0, start: 23, cells: [23, 24, 25, 26], hiddenClue: false },
      { answer: '失之交臂', clue: '擦肩而过，错过机会', line: 0, start: 26, cells: [26, 27, 28, 29], hiddenClue: false },
      { answer: '水到渠成', clue: '条件具备后，事情自然顺利成功', line: 1, start: 8, cells: [8, 10, 12, 14], hiddenClue: false },
      { answer: '成人之美', clue: '成全别人的好事', line: 1, start: 14, cells: [14, 16, 27, 30], hiddenClue: true },
      { answer: '美不胜收', clue: '美好的事物太多，看不过来', line: 1, start: 30, cells: [30, 31, 32, 33], hiddenClue: false },
      { answer: '收放自如', clue: '控制得当，进退有度', line: 1, start: 33, cells: [33, 34, 35, 36], hiddenClue: false },
      { answer: '接踵而至', clue: '一个接一个地到来', line: 2, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '至理名言', clue: '最有道理、最有价值的话', line: 2, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '言归正传', clue: '把话头拉回正题', line: 2, start: 6, cells: [6, 7, 9, 11], hiddenClue: false },
      { answer: '传为佳话', clue: '流传开来，成为美谈', line: 2, start: 11, cells: [11, 13, 15, 20], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·门庭若市',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '话足里智有多话谋不事投在机人不定可胜失天下无双喜临门庭若市井之徒马交行臂空',
    mask: '0101000011011111000000011110011111111',
    bank: ['云', '庭', '临', '假', '交', '喜', '日', '雨', '不', '机', '水', '东', '之', '不', '事', '井', '耳', '行', '在', '徒', '人', '小', '去', '空', '马', '定', '足', '门', '智', '臂'],
    width: 13,
    height: 14,
    cells: [{ row: 0, col: 11 }, { row: 1, col: 0 }, { row: 1, col: 11 }, { row: 2, col: 0 }, { row: 2, col: 11 }, { row: 3, col: 0 }, { row: 3, col: 11 }, { row: 4, col: 0 }, { row: 4, col: 11 }, { row: 5, col: 0 }, { row: 5, col: 11 }, { row: 6, col: 0 }, { row: 6, col: 11 }, { row: 7, col: 0 }, { row: 7, col: 11 }, { row: 8, col: 0 }, { row: 8, col: 11 }, { row: 9, col: 0 }, { row: 9, col: 11 }, { row: 10, col: 0 }, { row: 10, col: 1 }, { row: 10, col: 2 }, { row: 10, col: 3 }, { row: 10, col: 4 }, { row: 10, col: 5 }, { row: 10, col: 6 }, { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 10, col: 9 }, { row: 10, col: 10 }, { row: 10, col: 11 }, { row: 10, col: 12 }, { row: 11, col: 0 }, { row: 11, col: 11 }, { row: 12, col: 0 }, { row: 12, col: 11 }, { row: 13, col: 0 }],
    idioms: [
      { answer: '天下无双', clue: '举世没有第二个，独一无二', line: 0, start: 19, cells: [19, 20, 21, 22], hiddenClue: false },
      { answer: '双喜临门', clue: '两件喜事同时到来', line: 0, start: 22, cells: [22, 23, 24, 25], hiddenClue: false },
      { answer: '门庭若市', clue: '来往人多，非常热闹', line: 0, start: 25, cells: [25, 26, 27, 28], hiddenClue: false },
      { answer: '市井之徒', clue: '市井中的普通人或粗俗之人', line: 0, start: 28, cells: [28, 29, 30, 31], hiddenClue: false },
      { answer: '话里有话', clue: '话中暗含别的意思', line: 1, start: 0, cells: [0, 2, 4, 6], hiddenClue: false },
      { answer: '话不投机', clue: '说不到一起，谈不下去', line: 1, start: 6, cells: [6, 8, 10, 12], hiddenClue: true },
      { answer: '机不可失', clue: '好机会不能错过', line: 1, start: 12, cells: [12, 14, 16, 18], hiddenClue: false },
      { answer: '失之交臂', clue: '擦肩而过，错过机会', line: 1, start: 18, cells: [18, 30, 33, 35], hiddenClue: false },
      { answer: '足智多谋', clue: '智慧充足，善于谋划', line: 2, start: 1, cells: [1, 3, 5, 7], hiddenClue: false },
      { answer: '谋事在人', clue: '事情要靠人去谋划、努力', line: 2, start: 7, cells: [7, 9, 11, 13], hiddenClue: true },
      { answer: '人定胜天', clue: '人的力量能够战胜自然或困难', line: 2, start: 13, cells: [13, 15, 17, 19], hiddenClue: false },
      { answer: '天马行空', clue: '才思豪放不受拘束，或诗文气势豪放', line: 2, start: 19, cells: [19, 32, 34, 36], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·继往开来·竖',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '无中月生下有老备人无杰患地得灵患机失一飞冲天壤之别开生面不改色动毫人厘心弦',
    mask: '0101111110000100110101100111100101101',
    bank: ['有', '厘', '土', '得', '人', '石', '备', '不', '秋', '人', '南', '风', '下', '动', '生', '中', '后', '生', '开', '壤', '右', '机', '老', '飞', '天', '失', '小', '弦', '面', '春'],
    width: 13,
    height: 15,
    cells: [{ row: 0, col: 5 }, { row: 1, col: 5 }, { row: 2, col: 0 }, { row: 2, col: 5 }, { row: 3, col: 0 }, { row: 3, col: 5 }, { row: 4, col: 0 }, { row: 4, col: 5 }, { row: 5, col: 0 }, { row: 5, col: 5 }, { row: 6, col: 0 }, { row: 6, col: 5 }, { row: 7, col: 0 }, { row: 7, col: 5 }, { row: 8, col: 0 }, { row: 8, col: 5 }, { row: 9, col: 0 }, { row: 9, col: 5 }, { row: 10, col: 0 }, { row: 10, col: 1 }, { row: 10, col: 2 }, { row: 10, col: 3 }, { row: 10, col: 4 }, { row: 10, col: 5 }, { row: 10, col: 6 }, { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 10, col: 9 }, { row: 10, col: 10 }, { row: 10, col: 11 }, { row: 10, col: 12 }, { row: 11, col: 0 }, { row: 11, col: 5 }, { row: 12, col: 0 }, { row: 12, col: 5 }, { row: 13, col: 0 }, { row: 14, col: 0 }],
    idioms: [
      { answer: '一飞冲天', clue: '一下子取得惊人成就', line: 0, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '天壤之别', clue: '差别极大，像天和地', line: 0, start: 21, cells: [21, 22, 23, 24], hiddenClue: false },
      { answer: '别开生面', clue: '开创出新的局面或形式', line: 0, start: 24, cells: [24, 25, 26, 27], hiddenClue: false },
      { answer: '面不改色', clue: '遇到危险仍神色不变', line: 0, start: 27, cells: [27, 28, 29, 30], hiddenClue: false },
      { answer: '月下老人', clue: '主管婚姻的神，指媒人', line: 1, start: 2, cells: [2, 4, 6, 8], hiddenClue: false },
      { answer: '人杰地灵', clue: '杰出人物出生或到过，地方也出名', line: 1, start: 8, cells: [8, 10, 12, 14], hiddenClue: true },
      { answer: '灵机一动', clue: '忽然想出好主意', line: 1, start: 14, cells: [14, 16, 18, 31], hiddenClue: false },
      { answer: '动人心弦', clue: '打动人心，使人激动', line: 1, start: 31, cells: [31, 33, 35, 36], hiddenClue: false },
      { answer: '无中生有', clue: '凭空捏造，把没有的说成有', line: 2, start: 0, cells: [0, 1, 3, 5], hiddenClue: false },
      { answer: '有备无患', clue: '事先有准备，就不会有祸患', line: 2, start: 5, cells: [5, 7, 9, 11], hiddenClue: false },
      { answer: '患得患失', clue: '担心得不到，得到后又怕失去', line: 2, start: 11, cells: [11, 13, 15, 17], hiddenClue: false },
      { answer: '失之毫厘', clue: '开始相差很小，结果会造成很大错误', line: 2, start: 17, cells: [17, 23, 32, 34], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·山穷水尽',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '后来居上下一心花怒放虎归山穷水尽善尽美中不足到渠成人之美不胜收放自如',
    mask: '1011110011011010011110110011110011',
    bank: ['美', '下', '不', '短', '一', '雨', '天', '尽', '渠', '之', '暖', '胜', '如', '到', '居', '夏', '不', '放', '少', '归', '怒', '东', '美', '水', '山', '上', '日', '中', '后', '自', '地', '有'],
    width: 13,
    height: 22,
    cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 8, col: 0 }, { row: 9, col: 0 }, { row: 9, col: 1 }, { row: 9, col: 2 }, { row: 9, col: 3 }, { row: 9, col: 4 }, { row: 9, col: 5 }, { row: 9, col: 6 }, { row: 9, col: 7 }, { row: 9, col: 8 }, { row: 9, col: 9 }, { row: 9, col: 10 }, { row: 9, col: 11 }, { row: 9, col: 12 }, { row: 10, col: 5 }, { row: 11, col: 5 }, { row: 12, col: 5 }, { row: 13, col: 5 }, { row: 14, col: 5 }, { row: 15, col: 5 }, { row: 16, col: 5 }, { row: 17, col: 5 }, { row: 18, col: 5 }, { row: 19, col: 5 }, { row: 20, col: 5 }, { row: 21, col: 5 }],
    idioms: [
      { answer: '放虎归山', clue: '把坏人放回老巢，留下祸根', line: 0, start: 9, cells: [9, 10, 11, 12], hiddenClue: false },
      { answer: '山穷水尽', clue: '山和水都到了尽头，走投无路', line: 0, start: 12, cells: [12, 13, 14, 15], hiddenClue: false },
      { answer: '尽善尽美', clue: '十分完善美好，没有缺陷', line: 0, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '美中不足', clue: '总体很好，但还有小缺点', line: 0, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '后来居上', clue: '后来的人或事物超过先前的', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '上下一心', clue: '上上下下团结一致', line: 1, start: 3, cells: [3, 4, 5, 6], hiddenClue: false },
      { answer: '心花怒放', clue: '心里高兴得像花儿盛开', line: 1, start: 6, cells: [6, 7, 8, 9], hiddenClue: false },
      { answer: '水到渠成', clue: '条件具备后，事情自然顺利成功', line: 2, start: 14, cells: [14, 22, 23, 24], hiddenClue: false },
      { answer: '成人之美', clue: '成全别人的好事', line: 2, start: 24, cells: [24, 25, 26, 27], hiddenClue: true },
      { answer: '美不胜收', clue: '美好的事物太多，看不过来', line: 2, start: 27, cells: [27, 28, 29, 30], hiddenClue: false },
      { answer: '收放自如', clue: '控制得当，进退有度', line: 2, start: 30, cells: [30, 31, 32, 33], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·一诺千金',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '风一雨鼓同作舟气车象劳万顿一诺千金玉良言而有信口开河变茅万塞化翁险失为马夷',
    mask: '1111110000001111001111001111100001111',
    bank: ['善', '河', '假', '马', '茅', '作', '山', '西', '变', '雨', '风', '暗', '失', '夷', '耳', '千', '言', '而', '诺', '前', '一', '一', '鼓', '万', '良', '左', '云', '有', '顿', '人', '为', '开', '同', '后'],
    width: 13,
    height: 14,
    cells: [{ row: 0, col: 11 }, { row: 1, col: 2 }, { row: 1, col: 11 }, { row: 2, col: 2 }, { row: 2, col: 11 }, { row: 3, col: 2 }, { row: 3, col: 11 }, { row: 4, col: 2 }, { row: 4, col: 11 }, { row: 5, col: 2 }, { row: 5, col: 11 }, { row: 6, col: 2 }, { row: 6, col: 11 }, { row: 7, col: 0 }, { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 7, col: 11 }, { row: 7, col: 12 }, { row: 8, col: 2 }, { row: 8, col: 11 }, { row: 9, col: 2 }, { row: 9, col: 11 }, { row: 10, col: 2 }, { row: 10, col: 11 }, { row: 11, col: 2 }, { row: 11, col: 11 }, { row: 12, col: 2 }, { row: 12, col: 11 }, { row: 13, col: 2 }],
    idioms: [
      { answer: '一诺千金', clue: '许下的诺言极有信用', line: 0, start: 13, cells: [13, 14, 15, 16], hiddenClue: false },
      { answer: '金玉良言', clue: '非常宝贵有益的劝告', line: 0, start: 16, cells: [16, 17, 18, 19], hiddenClue: false },
      { answer: '言而有信', clue: '说话算数，讲信用', line: 0, start: 19, cells: [19, 20, 21, 22], hiddenClue: false },
      { answer: '信口开河', clue: '随口乱说，没有根据', line: 0, start: 22, cells: [22, 23, 24, 25], hiddenClue: false },
      { answer: '风雨同舟', clue: '在风雨中同坐一条船，比喻共同度过困难', line: 1, start: 0, cells: [0, 2, 4, 6], hiddenClue: false },
      { answer: '舟车劳顿', clue: '旅途奔波，十分劳累', line: 1, start: 6, cells: [6, 8, 10, 12], hiddenClue: true },
      { answer: '顿开茅塞', clue: '忽然理解、醒悟过来', line: 1, start: 12, cells: [12, 24, 27, 29], hiddenClue: false },
      { answer: '塞翁失马', clue: '坏事有时也能变成好事', line: 1, start: 29, cells: [29, 31, 33, 35], hiddenClue: false },
      { answer: '一鼓作气', clue: '趁着劲头一下子把事情做完', line: 2, start: 1, cells: [1, 3, 5, 7], hiddenClue: false },
      { answer: '气象万千', clue: '景象宏伟，变化多样', line: 2, start: 7, cells: [7, 9, 11, 15], hiddenClue: true },
      { answer: '千变万化', clue: '变化极多', line: 2, start: 15, cells: [15, 26, 28, 30], hiddenClue: false },
      { answer: '化险为夷', clue: '把危险转化为平安', line: 2, start: 30, cells: [30, 32, 34, 36], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·久旱逢甘雨·横',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '一飞冲一久旱逢甘雨过天晴空万里应外合壤俱之全别力开以生赴面汤不蹈改火色上浇油',
    mask: '10101111011001101011010101100011110110',
    bank: ['土', '不', '浇', '上', '暖', '左', '以', '火', '甘', '久', '里', '小', '蹈', '改', '冲', '石', '旱', '外', '全', '逢', '死', '右', '壤', '力', '手', '过', '生', '万', '人', '俱', '低', '天', '一', '大'],
    width: 14,
    height: 15,
    cells: [{ row: 0, col: 6 }, { row: 1, col: 6 }, { row: 2, col: 6 }, { row: 2, col: 11 }, { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 }, { row: 3, col: 7 }, { row: 3, col: 8 }, { row: 3, col: 9 }, { row: 3, col: 10 }, { row: 3, col: 11 }, { row: 3, col: 12 }, { row: 3, col: 13 }, { row: 4, col: 6 }, { row: 4, col: 11 }, { row: 5, col: 6 }, { row: 5, col: 11 }, { row: 6, col: 6 }, { row: 6, col: 11 }, { row: 7, col: 6 }, { row: 7, col: 11 }, { row: 8, col: 6 }, { row: 8, col: 11 }, { row: 9, col: 6 }, { row: 9, col: 11 }, { row: 10, col: 6 }, { row: 10, col: 11 }, { row: 11, col: 6 }, { row: 11, col: 11 }, { row: 12, col: 6 }, { row: 12, col: 11 }, { row: 13, col: 11 }, { row: 14, col: 11 }],
    idioms: [
      { answer: '久旱逢甘雨', clue: '长期干旱后终于下雨，比喻盼望已久的好事到来', line: 0, start: 4, cells: [4, 5, 6, 7, 8], hiddenClue: false },
      { answer: '雨过天晴', clue: '风雨过后天气转晴，比喻情况好转', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '晴空万里', clue: '天空晴朗，没有一点云', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '里应外合', clue: '外面攻打，里面接应，互相配合', line: 0, start: 14, cells: [14, 15, 16, 17], hiddenClue: false },
      { answer: '一飞冲天', clue: '一下子取得惊人成就', line: 1, start: 0, cells: [0, 1, 2, 10], hiddenClue: false },
      { answer: '天壤之别', clue: '差别极大，像天和地', line: 1, start: 10, cells: [10, 18, 20, 22], hiddenClue: false },
      { answer: '别开生面', clue: '开创出新的局面或形式', line: 1, start: 22, cells: [22, 24, 26, 28], hiddenClue: false },
      { answer: '面不改色', clue: '遇到危险仍神色不变', line: 1, start: 28, cells: [28, 30, 32, 34], hiddenClue: false },
      { answer: '一应俱全', clue: '一切都齐全', line: 2, start: 3, cells: [3, 15, 19, 21], hiddenClue: false },
      { answer: '全力以赴', clue: '用尽全力去做', line: 2, start: 21, cells: [21, 23, 25, 27], hiddenClue: true },
      { answer: '赴汤蹈火', clue: '不避艰险，奋勇向前', line: 2, start: 27, cells: [27, 29, 31, 33], hiddenClue: false },
      { answer: '火上浇油', clue: '使事态更加严重', line: 2, start: 33, cells: [33, 35, 36, 37], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·花红柳绿',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '顾全大局促不放安虎步归当山车穷花红柳绿水青山清水秀色可餐马尽龙善尽美中不足',
    mask: '1011101000111111011110011110100011110',
    bank: ['东', '绿', '柳', '放', '不', '今', '美', '失', '花', '山', '归', '车', '石', '可', '古', '前', '中', '顾', '下', '尽', '水', '水', '局', '促', '当', '大', '马', '色', '去', '青', '秀', '长', '高', '穷', '金', '火'],
    width: 13,
    height: 18,
    cells: [{ row: 0, col: 4 }, { row: 1, col: 4 }, { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 }, { row: 5, col: 4 }, { row: 5, col: 8 }, { row: 6, col: 4 }, { row: 6, col: 8 }, { row: 7, col: 4 }, { row: 7, col: 8 }, { row: 8, col: 4 }, { row: 8, col: 8 }, { row: 9, col: 4 }, { row: 9, col: 8 }, { row: 10, col: 0 }, { row: 10, col: 1 }, { row: 10, col: 2 }, { row: 10, col: 3 }, { row: 10, col: 4 }, { row: 10, col: 5 }, { row: 10, col: 6 }, { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 10, col: 9 }, { row: 10, col: 10 }, { row: 10, col: 11 }, { row: 10, col: 12 }, { row: 11, col: 4 }, { row: 11, col: 8 }, { row: 12, col: 4 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 }, { row: 15, col: 8 }, { row: 16, col: 8 }, { row: 17, col: 8 }],
    idioms: [
      { answer: '花红柳绿', clue: '春天花木繁茂，颜色鲜艳', line: 0, start: 15, cells: [15, 16, 17, 18], hiddenClue: false },
      { answer: '绿水青山', clue: '美好的自然环境', line: 0, start: 18, cells: [18, 19, 20, 21], hiddenClue: false },
      { answer: '山清水秀', clue: '山水风景清幽秀丽', line: 0, start: 21, cells: [21, 22, 23, 24], hiddenClue: false },
      { answer: '秀色可餐', clue: '形容女子美貌或景色优美', line: 0, start: 24, cells: [24, 25, 26, 27], hiddenClue: false },
      { answer: '顾全大局', clue: '从整体利益出发考虑', line: 1, start: 0, cells: [0, 1, 2, 3], hiddenClue: false },
      { answer: '局促不安', clue: '拘谨不自然，心里不安', line: 1, start: 3, cells: [3, 4, 5, 7], hiddenClue: true },
      { answer: '安步当车', clue: '从容步行，当作坐车', line: 1, start: 7, cells: [7, 9, 11, 13], hiddenClue: false },
      { answer: '车水马龙', clue: '车马往来不绝，非常热闹', line: 1, start: 13, cells: [13, 19, 28, 30], hiddenClue: false },
      { answer: '放虎归山', clue: '把坏人放回老巢，留下祸根', line: 2, start: 6, cells: [6, 8, 10, 12], hiddenClue: false },
      { answer: '山穷水尽', clue: '山和水都到了尽头，走投无路', line: 2, start: 12, cells: [12, 14, 23, 29], hiddenClue: true },
      { answer: '尽善尽美', clue: '十分完善美好，没有缺陷', line: 2, start: 29, cells: [29, 31, 32, 33], hiddenClue: false },
      { answer: '美中不足', clue: '总体很好，但还有小缺点', line: 2, start: 33, cells: [33, 34, 35, 36], hiddenClue: false }
    ]
  },
  {
    kind: 'net',
    title: '交织·龙行天下·横',
    hint: '三条链一起织网：先把两条竖链的共享字定下来。',
    solution: '无可奈如何鱼乐得顾全大局促不安步当车水马龙为泄所不欲通为情民达除理害直气壮',
    mask: '1011010111100111100111011010101101011',
    bank: ['奈', '步', '失', '如', '大', '气', '安', '右', '不', '得', '壮', '鱼', '龙', '口', '手', '恶', '当', '云', '少', '害', '达', '丑', '全', '除', '不', '通', '美', '顾', '情', '马', '土', '高', '无', '为', '所', '天'],
    width: 13,
    height: 15,
    cells: [{ row: 0, col: 5 }, { row: 1, col: 5 }, { row: 2, col: 5 }, { row: 2, col: 10 }, { row: 3, col: 5 }, { row: 3, col: 10 }, { row: 4, col: 5 }, { row: 4, col: 10 }, { row: 5, col: 0 }, { row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 }, { row: 5, col: 9 }, { row: 5, col: 10 }, { row: 5, col: 11 }, { row: 5, col: 12 }, { row: 6, col: 5 }, { row: 6, col: 10 }, { row: 7, col: 5 }, { row: 7, col: 10 }, { row: 8, col: 5 }, { row: 8, col: 10 }, { row: 9, col: 5 }, { row: 9, col: 10 }, { row: 10, col: 5 }, { row: 10, col: 10 }, { row: 11, col: 5 }, { row: 11, col: 10 }, { row: 12, col: 5 }, { row: 12, col: 10 }, { row: 13, col: 10 }, { row: 14, col: 10 }],
    idioms: [
      { answer: '顾全大局', clue: '从整体利益出发考虑', line: 0, start: 8, cells: [8, 9, 10, 11], hiddenClue: false },
      { answer: '局促不安', clue: '拘谨不自然，心里不安', line: 0, start: 11, cells: [11, 12, 13, 14], hiddenClue: false },
      { answer: '安步当车', clue: '从容步行，当作坐车', line: 0, start: 14, cells: [14, 15, 16, 17], hiddenClue: false },
      { answer: '车水马龙', clue: '车马往来不绝，非常热闹', line: 0, start: 17, cells: [17, 18, 19, 20], hiddenClue: false },
      { answer: '无可奈何', clue: '一点办法也没有', line: 1, start: 0, cells: [0, 1, 2, 4], hiddenClue: false },
      { answer: '何乐不为', clue: '为什么不乐意去做呢', line: 1, start: 4, cells: [4, 6, 13, 21], hiddenClue: true },
      { answer: '为所欲为', clue: '想做什么就做什么，任意妄为', line: 1, start: 21, cells: [21, 23, 25, 27], hiddenClue: false },
      { answer: '为民除害', clue: '替百姓除掉祸害', line: 1, start: 27, cells: [27, 29, 31, 33], hiddenClue: false },
      { answer: '如鱼得水', clue: '得到适合自己的环境或人', line: 2, start: 3, cells: [3, 5, 7, 18], hiddenClue: false },
      { answer: '水泄不通', clue: '拥挤或包围得非常严密', line: 2, start: 18, cells: [18, 22, 24, 26], hiddenClue: true },
      { answer: '通情达理', clue: '说话做事讲道理', line: 2, start: 26, cells: [26, 28, 30, 32], hiddenClue: false },
      { answer: '理直气壮', clue: '理由充分，说话有底气', line: 2, start: 32, cells: [32, 34, 35, 36], hiddenClue: false }
    ]
  }
];
