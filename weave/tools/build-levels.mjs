// 由人工整理的成语链生成 WEAVE 关卡数据。
// 工具只负责重叠位置、空白分布、字池和校验；成语与释义全部手写。
import { writeFileSync } from 'node:fs';

const DECOY_POOL = '天地日月山水风云人心手口目耳金石木火土雨雪春夏秋冬东南西北上下左右前后大小多少长短高低明暗真假动静冷暖新旧美丑善恶得失来去有无生死古今';
const chains = [
  {
    title: '一心一意', hint: '先看两句的首尾字，共享字只需要一块。', blankCount: 3, decoyCount: 0,
    idioms: [
      ['一心一意', '心思专一，没有别的念头'],
      ['意气风发', '精神振奋，气概昂扬'],
      ['发人深省', '启发人深刻思考、醒悟']
    ]
  },
  {
    title: '用兵如神', hint: '“省”和“用”各在前一句的末尾。', blankCount: 4, decoyCount: 0,
    idioms: [
      ['省吃俭用', '节约饮食和开销，生活俭朴'],
      ['用兵如神', '调兵遣将极其巧妙'],
      ['神机妙算', '计谋高明，预料准确']
    ]
  },
  {
    title: '人山人海', hint: '第一条成语的第一个字已经给出。', blankCount: 5, decoyCount: 0,
    idioms: [
      ['人山人海', '人聚集得非常多'],
      ['海阔天空', '形容天地辽阔，也指说话漫无边际'],
      ['空前绝后', '以前没有，以后也不会有']
    ]
  },
  {
    title: '心花怒放', hint: '共享字在相邻两句的正中间。', blankCount: 4, decoyCount: 1,
    idioms: [
      ['后来居上', '后来的人或事物超过先前的'],
      ['上下一心', '上上下下团结一致'],
      ['心花怒放', '心里高兴得像花儿盛开']
    ]
  },
  {
    title: '山穷水尽', hint: '一条链里有四个成语，先找每条释义。', blankCount: 5, decoyCount: 1,
    idioms: [
      ['放虎归山', '把坏人放回老巢，留下祸根'],
      ['山穷水尽', '山和水都到了尽头，走投无路'],
      ['尽善尽美', '十分完善美好，没有缺陷'],
      ['美中不足', '总体很好，但还有小缺点']
    ]
  },
  {
    title: '天马行空', hint: '先找“人定胜天”的“天”，它还要接下一句。', blankCount: 5, decoyCount: 2,
    idioms: [
      ['足智多谋', '智慧充足，善于谋划'],
      ['谋事在人', '事情要靠人去谋划、努力'],
      ['人定胜天', '人的力量能够战胜自然或困难'],
      ['天马行空', '才思豪放不受拘束，或诗文气势豪放']
    ]
  },
  {
    title: '瓜熟蒂落', hint: '“顺藤摸瓜”的“瓜”是下一条成语的开头。', blankCount: 6, decoyCount: 2,
    idioms: [
      ['空穴来风', '消息传言并非完全没有原因'],
      ['风调雨顺', '风雨适合农时'],
      ['顺藤摸瓜', '沿着线索追查到底'],
      ['瓜熟蒂落', '时机成熟，事情自然会有结果']
    ]
  },
  {
    title: '固若金汤', hint: '共享字可能藏在释义里没有直接出现的字上。', blankCount: 6, decoyCount: 3,
    idioms: [
      ['落地生根', '长期定居，或事物扎根生长'],
      ['根深蒂固', '基础深厚，不易动摇'],
      ['固若金汤', '防守非常坚固']
    ]
  },
  {
    title: '入木三分', hint: '“长驱直入”的“入”就是下一句的第一字。', blankCount: 7, decoyCount: 3,
    idioms: [
      ['三心二意', '犹豫不定，意志不专一'],
      ['意味深长', '含义深刻，耐人寻味'],
      ['长驱直入', '快速向很远的地方挺进'],
      ['入木三分', '见解、描写深刻有力']
    ]
  },
  {
    title: '门庭若市', hint: '字池里有干扰字，不要只看字形。', blankCount: 7, decoyCount: 4,
    idioms: [
      ['天下无双', '举世没有第二个，独一无二'],
      ['双喜临门', '两件喜事同时到来'],
      ['门庭若市', '来往人多，非常热闹'],
      ['市井之徒', '市井中的普通人或粗俗之人']
    ]
  },
  {
    title: '实事求是', hint: '这一章开始，释义和共享字都更接近。', blankCount: 7, decoyCount: 4,
    idioms: [
      ['徒有虚名', '空有名声，实际不相称'],
      ['名副其实', '名声或名称与实际相符'],
      ['实事求是', '从实际出发，探求真相'],
      ['是非曲直', '事情的对与错、有理与无理']
    ]
  },
  {
    title: '智勇双全', hint: '先确定“当务之急”的“急”。', blankCount: 8, decoyCount: 5,
    idioms: [
      ['直截了当', '说话做事干脆爽快'],
      ['当务之急', '当前最急切要做的事'],
      ['急中生智', '危急时突然想出好办法'],
      ['智勇双全', '智谋和勇敢兼备']
    ]
  },
  {
    title: '厉兵秣马', hint: '“变本加厉”是一条不那么直白的线索。', blankCount: 8, decoyCount: 5,
    idioms: [
      ['风平浪静', '水面平静，比喻平静无事'],
      ['静观其变', '冷静观察事情变化'],
      ['变本加厉', '情况变得比原来更严重'],
      ['厉兵秣马', '磨好兵器、喂饱战马，准备战斗']
    ]
  },
  {
    title: '一诺千金', hint: '共享字“言”会同时出现在两句里。', blankCount: 8, decoyCount: 6,
    idioms: [
      ['一诺千金', '许下的诺言极有信用'],
      ['金玉良言', '非常宝贵有益的劝告'],
      ['言而有信', '说话算数，讲信用'],
      ['信口开河', '随口乱说，没有根据']
    ]
  },
  {
    title: '水到渠成', hint: '“收放自如”的开头是上一句的末字。', blankCount: 8, decoyCount: 6,
    idioms: [
      ['水到渠成', '条件具备后，事情自然顺利成功'],
      ['成人之美', '成全别人的好事'],
      ['美不胜收', '美好的事物太多，看不过来'],
      ['收放自如', '控制得当，进退有度']
    ]
  },
  {
    title: '如鱼得水', hint: '“理直气壮”的“理”要和前一句接上。', blankCount: 9, decoyCount: 7,
    idioms: [
      ['如鱼得水', '得到适合自己的环境或人'],
      ['水泄不通', '拥挤或包围得非常严密'],
      ['通情达理', '说话做事讲道理'],
      ['理直气壮', '理由充分，说话有底气']
    ]
  },
  {
    title: '壮志凌云', hint: '先抓住“日新月异”的“日”。', blankCount: 9, decoyCount: 7,
    idioms: [
      ['壮志凌云', '志向远大，气概豪迈'],
      ['云开见日', '困境过去，重见光明'],
      ['日新月异', '发展变化非常快'],
      ['异想天开', '想法离奇，不切实际']
    ]
  },
  {
    title: '开门见山', hint: '共享字可能刚好是释义里的关键词。', blankCount: 9, decoyCount: 8,
    idioms: [
      ['开门见山', '说话写文章直截了当'],
      ['山明水秀', '山水清朗秀丽'],
      ['秀外慧中', '外表秀美，内心聪慧'],
      ['中流砥柱', '在艰难环境中起支柱作用的人或力量']
    ]
  },
  {
    title: '月下老人', hint: '“人杰地灵”要放在“月下老人”后面。', blankCount: 9, decoyCount: 8,
    idioms: [
      ['月下老人', '主管婚姻的神，指媒人'],
      ['人杰地灵', '杰出人物出生或到过，地方也出名'],
      ['灵机一动', '忽然想出好主意'],
      ['动人心弦', '打动人心，使人激动']
    ]
  },
  {
    title: '弦外之音', hint: '“貌合神离”不是字面意思。', blankCount: 9, decoyCount: 9,
    idioms: [
      ['弦外之音', '言外之意，未明说的意思'],
      ['音容笑貌', '说话的声音和容貌神情'],
      ['貌合神离', '表面亲近，实际心思不同'],
      ['离乡背井', '离开家乡到外地']
    ]
  },
  {
    title: '花红柳绿', hint: '“秀色可餐”可以形容景色，也可以形容美貌。', blankCount: 9, decoyCount: 9,
    idioms: [
      ['花红柳绿', '春天花木繁茂，颜色鲜艳'],
      ['绿水青山', '美好的自然环境'],
      ['山清水秀', '山水风景清幽秀丽'],
      ['秀色可餐', '形容女子美貌或景色优美']
    ]
  },
  {
    title: '无中生有', hint: '“失之毫厘”的结果往往很严重。', blankCount: 9, decoyCount: 10,
    idioms: [
      ['无中生有', '凭空捏造，把没有的说成有'],
      ['有备无患', '事先有准备，就不会有祸患'],
      ['患得患失', '担心得不到，得到后又怕失去'],
      ['失之毫厘', '开始相差很小，结果会造成很大错误']
    ]
  },
  {
    title: '何乐不为', hint: '这一关的连接字是“为”。', blankCount: 9, decoyCount: 10,
    idioms: [
      ['无可奈何', '一点办法也没有'],
      ['何乐不为', '为什么不乐意去做呢'],
      ['为所欲为', '想做什么就做什么，任意妄为'],
      ['为民除害', '替百姓除掉祸害']
    ]
  },
  {
    title: '游刃有余', hint: '最后一条“梁上君子”是窃贼的代称。', blankCount: 9, decoyCount: 10,
    idioms: [
      ['力争上游', '努力争取先进'],
      ['游刃有余', '技术熟练，做事轻松'],
      ['余音绕梁', '歌声或音乐优美，久久不散'],
      ['梁上君子', '窃贼的代称']
    ]
  }
];

function seeded(seed) {
  // mulberry32：旧实现里乘数对模数取模后恒为 0，实际只返回固定值，字池从未真正打乱。
  let value = (seed + 0x6D2B79F5) >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) >>> 0;
    let mixed = Math.imul(value ^ (value >>> 15), value | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function validate() {
  const answers = new Set();
  for (const level of chains) {
    if (level.idioms.length < 2) throw new Error(level.title + ': 至少需要两条成语');
    for (let i = 0; i < level.idioms.length - 1; i += 1) {
      const current = level.idioms[i][0];
      const next = level.idioms[i + 1][0];
      if (current.at(-1) !== next[0]) throw new Error(`${level.title}: ${current} 和 ${next} 不接`);
    }
    for (const [answer, clue] of level.idioms) {
      if ([...answer].length !== 4) throw new Error(level.title + ': 非四字成语 ' + answer);
      if (!clue) throw new Error(level.title + ': 缺少释义 ' + answer);
      if (answers.has(answer)) throw new Error('重复成语：' + answer);
      answers.add(answer);
    }
  }
}

function maskFor(solution, idioms, blankCount, seed) {
  const show = new Set();
  const random = seeded(seed * 17 + blankCount);
  idioms.forEach(([answer], index) => {
    const start = index * 3;
    show.add(start + ((seed + index * 2) % answer.length));
  });
  const showCount = solution.length - blankCount;
  if (showCount < idioms.length) throw new Error('空白太多，无法保证每条成语至少露出一个字');
  const candidates = [...Array(solution.length).keys()].filter((index) => !show.has(index));
  while (show.size < showCount) {
    const pick = Math.floor(random() * candidates.length);
    show.add(candidates.splice(pick, 1)[0]);
  }
  return [...solution].map((_, index) => show.has(index) ? '0' : '1').join('');
}

function pickDecoys(solution, count, seed) {
  const forbidden = new Set(solution);
  const chars = [...DECOY_POOL].filter((char) => !forbidden.has(char));
  const random = seeded(seed * 31 + count);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, count);
}

function shuffled(items, seed) {
  const result = items.slice();
  const random = seeded(seed);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function tooOrdered(bank, required) {
  const bankText = bank.join('');
  if (bank.length === required.length) return (bankText + bankText).includes(required);
  return bank.slice(0, required.length).join('') === required;
}

function shuffledBank(items, required, seed) {
  let bank = shuffled(items, seed);
  let attempt = 1;
  while (tooOrdered(bank, required) && attempt < 20) {
    bank = shuffled(items, seed + attempt * 997);
    attempt += 1;
  }
  return bank;
}

function build() {
  validate();
  const levels = chains.map((level, index) => {
    const solution = level.idioms[0][0] + level.idioms.slice(1).map(([answer]) => answer.slice(1)).join('');
    const mask = maskFor(solution, level.idioms, level.blankCount, index);
    const blanks = [...mask].flatMap((flag, position) => flag === '1' ? [position] : []);
    const decoys = pickDecoys(solution, level.decoyCount, index);
    const required = blanks.map((position) => solution[position]).join('');
    const bank = shuffledBank(blanks.map((position) => solution[position]).concat(decoys), required, index + 101);
    return {
      title: level.title,
      hint: level.hint,
      solution,
      mask,
      bank,
      idioms: level.idioms.map(([answer, clue], idiomIndex) => ({ answer, clue, start: idiomIndex * 3 }))
    };
  });
  const body = levels.map((level) => {
    const idioms = level.idioms.map((entry) => `      { answer: '${entry.answer}', clue: '${entry.clue}', start: ${entry.start} }`).join(',\n');
    return `  {\n    title: '${level.title}',\n    hint: '${level.hint}',\n    solution: '${level.solution}',\n    mask: '${level.mask}',\n    bank: [${level.bank.map((char) => `'${char}'`).join(', ')}],\n    idioms: [\n${idioms}\n    ]\n  }`;
  }).join(',\n');
  const source = `// WEAVE 关卡数据：成语链由人工挑选，空白与字池由 tools/build-levels.mjs 生成。\n// 0 = 已给出，1 = 空缺；相邻成语共享首尾一个字。\n\nexport const LEVELS = [\n${body}\n];\n`;
  writeFileSync(new URL('../src/levels.js', import.meta.url), source, 'utf8');
  console.log(`生成 ${levels.length} 关`);
}

build();