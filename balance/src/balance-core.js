export const EPSILON = 0.0001;

const LEVELS = [
  {
    id: 'L1',
    title: '一边一个',
    hint: '把右边的空钩子补齐',
    bars: [{ id: 'b0', leftPos: 2, rightPos: 2, leftChild: null, rightChild: null }],
    weights: [
      { id: 'w1', mass: 2, at: 'b0.left' },
      { id: 'w2', mass: 2, at: null }
    ],
    solution: [{ weightId: 'w2', hookId: 'b0.right' }]
  },
  {
    id: 'L2',
    title: '离得远更重',
    hint: '离支点更远的一边，轻一点也能平衡',
    bars: [{ id: 'b0', leftPos: 1, rightPos: 3, leftChild: null, rightChild: null }],
    weights: [
      { id: 'w1', mass: 3, at: 'b0.left' },
      { id: 'w2', mass: 1, at: null }
    ],
    solution: [{ weightId: 'w2', hookId: 'b0.right' }]
  },
  {
    id: 'L3',
    title: '两边一起算',
    hint: '先算左右两边的力矩',
    bars: [{ id: 'b0', leftPos: 2, rightPos: 1, leftChild: null, rightChild: null }],
    weights: [
      { id: 'w1', mass: 2, at: 'b0.left' },
      { id: 'w2', mass: 1, at: 'b0.right' },
      { id: 'w3', mass: 4, at: null }
    ],
    solution: [{ weightId: 'w3', hookId: 'b0.right' }]
  },
  {
    id: 'L4',
    title: '下面先稳',
    hint: '先把下面那根小横杆弄平',
    bars: [
      { id: 'b0', leftPos: 2, rightPos: 2, leftChild: 'b1', rightChild: null },
      { id: 'b1', leftPos: 1, rightPos: 1, leftChild: null, rightChild: null }
    ],
    weights: [
      { id: 'w1', mass: 1, at: 'b1.left' },
      { id: 'w2', mass: 1, at: null },
      { id: 'w3', mass: 2, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b1.right' },
      { weightId: 'w3', hookId: 'b0.right' }
    ]
  },
  {
    id: 'L5',
    title: '重量传上去',
    hint: '下面的总重量会传到上面',
    bars: [
      { id: 'b0', leftPos: 1, rightPos: 2, leftChild: 'b1', rightChild: null },
      { id: 'b1', leftPos: 3, rightPos: 1, leftChild: null, rightChild: null }
    ],
    weights: [
      { id: 'w1', mass: 1, at: 'b1.left' },
      { id: 'w2', mass: 3, at: null },
      { id: 'w3', mass: 2, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b1.right' },
      { weightId: 'w3', hookId: 'b0.right' }
    ]
  },
  {
    id: 'L6',
    title: '两根一起挂',
    hint: '两根子横杆都先弄平',
    bars: [
      { id: 'b0', leftPos: 1, rightPos: 2, leftChild: 'b1', rightChild: 'b2' },
      { id: 'b1', leftPos: 1, rightPos: 1, leftChild: null, rightChild: null },
      { id: 'b2', leftPos: 1, rightPos: 1, leftChild: null, rightChild: null }
    ],
    weights: [
      { id: 'w1', mass: 2, at: 'b1.left' },
      { id: 'w2', mass: 1, at: 'b2.left' },
      { id: 'w3', mass: 2, at: null },
      { id: 'w4', mass: 1, at: null }
    ],
    solution: [
      { weightId: 'w3', hookId: 'b1.right' },
      { weightId: 'w4', hookId: 'b2.right' }
    ]
  },
  {
    id: 'L7',
    title: '左右各一杆',
    hint: '左右两边总重量要一样',
    bars: [
      { id: 'b0', leftPos: 1, rightPos: 1, leftChild: 'b1', rightChild: 'b2' },
      { id: 'b1', leftPos: 1, rightPos: 1, leftChild: null, rightChild: null },
      { id: 'b2', leftPos: 2, rightPos: 1, leftChild: null, rightChild: null }
    ],
    weights: [
      { id: 'w1', mass: 3, at: 'b1.left' },
      { id: 'w2', mass: 3, at: null },
      { id: 'w3', mass: 2, at: 'b2.left' },
      { id: 'w4', mass: 4, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b1.right' },
      { weightId: 'w4', hookId: 'b2.right' }
    ]
  },
  {
    id: 'L8',
    title: '长链传递',
    hint: '从最下面往上一层一层平衡',
    bars: [
      { id: 'b0', leftPos: 2, rightPos: 2, leftChild: 'b1', rightChild: null },
      { id: 'b1', leftPos: 1, rightPos: 1, leftChild: 'b2', rightChild: null },
      { id: 'b2', leftPos: 1, rightPos: 1, leftChild: null, rightChild: null }
    ],
    weights: [
      { id: 'w1', mass: 2, at: 'b2.left' },
      { id: 'w2', mass: 2, at: null },
      { id: 'w3', mass: 4, at: null },
      { id: 'w4', mass: 8, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b2.right' },
      { weightId: 'w3', hookId: 'b1.right' },
      { weightId: 'w4', hookId: 'b0.right' }
    ]
  }
,
  {
    id: 'L9',
    title: '多个挂点',
    hint: '同一边可以把重量分到不同距离',
    bars: [{
      id: 'b0',
      leftHooks: [{ id: 'b0.l1', pos: 1 }, { id: 'b0.l2', pos: 3 }],
      rightHooks: [{ id: 'b0.r1', pos: 2 }, { id: 'b0.r2', pos: 1 }]
    }],
    weights: [
      { id: 'w1', mass: 1, at: 'b0.l1' },
      { id: 'w2', mass: 3, at: null },
      { id: 'w3', mass: 4, at: null },
      { id: 'w4', mass: 2, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b0.l2' },
      { weightId: 'w3', hookId: 'b0.r1' },
      { weightId: 'w4', hookId: 'b0.r2' }
    ]
  },
  {
    id: 'L10',
    title: '先挂下面，再补上面',
    hint: '子横杆的重量会变成父横杆的负载',
    bars: [
      {
        id: 'b0',
        leftHooks: [{ id: 'b0.l1', pos: 1, child: 'b1' }, { id: 'b0.l2', pos: 3 }],
        rightHooks: [{ id: 'b0.r1', pos: 2 }, { id: 'b0.r2', pos: 1 }]
      },
      {
        id: 'b1',
        leftHooks: [{ id: 'b1.l1', pos: 1 }],
        rightHooks: [{ id: 'b1.r1', pos: 1 }]
      }
    ],
    weights: [
      { id: 'w1', mass: 2, at: 'b1.l1' },
      { id: 'w2', mass: 2, at: null },
      { id: 'w3', mass: 2, at: null },
      { id: 'w4', mass: 4, at: null },
      { id: 'w5', mass: 2, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b1.r1' },
      { weightId: 'w3', hookId: 'b0.l2' },
      { weightId: 'w4', hookId: 'b0.r1' },
      { weightId: 'w5', hookId: 'b0.r2' }
    ]
  },
  {
    id: 'L11',
    title: '两棵树',
    hint: '两边的子横杆都先各自平衡',
    bars: [
      {
        id: 'b0',
        leftHooks: [{ id: 'b0.l1', pos: 3, child: 'b1' }],
        rightHooks: [{ id: 'b0.r1', pos: 1, child: 'b2' }]
      },
      {
        id: 'b1',
        leftHooks: [{ id: 'b1.l1', pos: 1 }],
        rightHooks: [{ id: 'b1.r1', pos: 1 }]
      },
      {
        id: 'b2',
        leftHooks: [{ id: 'b2.l1', pos: 2 }],
        rightHooks: [{ id: 'b2.r1', pos: 1 }]
      }
    ],
    weights: [
      { id: 'w1', mass: 1, at: 'b1.l1' },
      { id: 'w2', mass: 1, at: null },
      { id: 'w3', mass: 2, at: 'b2.l1' },
      { id: 'w4', mass: 4, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b1.r1' },
      { weightId: 'w4', hookId: 'b2.r1' }
    ]
  },
  {
    id: 'L12',
    title: '长链多挂点',
    hint: '从最下面一层开始，把重量一层层送上去',
    bars: [
      {
        id: 'b0',
        leftHooks: [{ id: 'b0.l1', pos: 1, child: 'b1' }],
        rightHooks: [{ id: 'b0.r1', pos: 2 }]
      },
      {
        id: 'b1',
        leftHooks: [{ id: 'b1.l1', pos: 1, child: 'b2' }],
        rightHooks: [{ id: 'b1.r1', pos: 1 }]
      },
      {
        id: 'b2',
        leftHooks: [{ id: 'b2.l1', pos: 1 }, { id: 'b2.l2', pos: 2 }],
        rightHooks: [{ id: 'b2.r1', pos: 1 }]
      }
    ],
    weights: [
      { id: 'w1', mass: 2, at: 'b2.l1' },
      { id: 'w2', mass: 1, at: null },
      { id: 'w3', mass: 4, at: null },
      { id: 'w4', mass: 7, at: null },
      { id: 'w5', mass: 7, at: null }
    ],
    solution: [
      { weightId: 'w2', hookId: 'b2.l2' },
      { weightId: 'w3', hookId: 'b2.r1' },
      { weightId: 'w4', hookId: 'b1.r1' },
      { weightId: 'w5', hookId: 'b0.r1' }
    ]
  }];

export function getLevelCount() {
  return LEVELS.length;
}

export function getLevel(index) {
  return LEVELS[index] ?? null;
}

export function createState(levelIndex = 0) {
  const level = LEVELS[levelIndex];
  if (!level) return null;
  return {
    levelIndex,
    id: level.id,
    title: level.title,
    hint: level.hint,
    bars: level.bars.map((bar) => ({
      ...bar,
      leftHooks: bar.leftHooks?.map((hook) => ({ ...hook })),
      rightHooks: bar.rightHooks?.map((hook) => ({ ...hook }))
    })),
    weights: level.weights.map((weight) => ({ ...weight })),
    solution: level.solution.map((move) => ({ ...move })),
    solved: false
  };
}

export function cloneState(state) {
  return {
    ...state,
    bars: state.bars.map((bar) => ({
      ...bar,
      leftHooks: bar.leftHooks?.map((hook) => ({ ...hook })),
      rightHooks: bar.rightHooks?.map((hook) => ({ ...hook }))
    })),
    weights: state.weights.map((weight) => ({ ...weight })),
    solution: state.solution.map((move) => ({ ...move }))
  };
}

export function getBar(state, barId) {
  return state.bars.find((bar) => bar.id === barId) ?? null;
}

export function getBarHooks(bar) {
  if (bar.leftHooks || bar.rightHooks) {
    return [
      ...(bar.leftHooks ?? []).map((hook) => ({ ...hook, side: 'left' })),
      ...(bar.rightHooks ?? []).map((hook) => ({ ...hook, side: 'right' }))
    ];
  }
  return [
    { id: `${bar.id}.left`, side: 'left', pos: bar.leftPos, child: bar.leftChild ?? null },
    { id: `${bar.id}.right`, side: 'right', pos: bar.rightPos, child: bar.rightChild ?? null }
  ];
}

export function getHook(state, hookId) {
  if (!hookId) return null;
  for (const bar of state.bars) {
    const hook = getBarHooks(bar).find((item) => item.id === hookId);
    if (hook) return { bar, ...hook };
  }
  return null;
}

export function weightAt(state, hookId) {
  return state.weights.find((weight) => weight.at === hookId) ?? null;
}

export function canPlace(state, weightId, hookId) {
  const weight = state.weights.find((item) => item.id === weightId);
  const hook = getHook(state, hookId);
  if (!weight || !hook) return false;
  if (hook.child) return false;
  return true;
}

export function canDetach(state, weightId) {
  const weight = state.weights.find((item) => item.id === weightId);
  return Boolean(weight && weight.at);
}

export function moveWeight(state, weightId, hookId) {
  if (!canPlace(state, weightId, hookId)) return null;
  const next = cloneState(state);
  const weight = next.weights.find((item) => item.id === weightId);
  const occupant = next.weights.find((item) => item.at === hookId && item.id !== weightId);
  const previous = weight.at;
  if (occupant) occupant.at = previous;
  weight.at = hookId;
  next.solved = isSolved(next);
  return next;
}

export function detachWeight(state, weightId) {
  const weight = state.weights.find((item) => item.id === weightId);
  if (!weight) return null;
  const next = cloneState(state);
  const target = next.weights.find((item) => item.id === weightId);
  target.at = null;
  next.solved = isSolved(next);
  return next;
}

export function barStats(state, barId, memo = new Map()) {
  if (memo.has(barId)) return memo.get(barId);
  const bar = getBar(state, barId);
  if (!bar) return null;

  const sideStats = (side) => {
    const hooks = getBarHooks(bar).filter((hook) => hook.side === side);
    let load = 0;
    let torque = 0;
    for (const hook of hooks) {
      const hookLoad = hook.child
        ? (barStats(state, hook.child, memo)?.totalMass ?? 0)
        : (weightAt(state, hook.id)?.mass ?? 0);
      load += hookLoad;
      torque += hookLoad * hook.pos;
    }
    return { load, torque, hooks };
  };

  const left = sideStats('left');
  const right = sideStats('right');
  const leftTorque = left.torque;
  const rightTorque = right.torque;
  const totalMass = left.load + right.load;
  const difference = rightTorque - leftTorque;
  const stats = {
    bar,
    left,
    right,
    leftTorque,
    rightTorque,
    totalMass,
    difference,
    balanced: Math.abs(difference) <= EPSILON,
    angle: Math.max(-0.5, Math.min(0.5, difference / Math.max(1, leftTorque + rightTorque) * 0.7))
  };
  memo.set(barId, stats);
  return stats;
}

export function allStats(state) {
  const memo = new Map();
  for (const bar of state.bars) barStats(state, bar.id, memo);
  return memo;
}

export function isSolved(state) {
  if (!state) return false;
  const stats = allStats(state);
  return state.bars.every((bar) => stats.get(bar.id)?.balanced);
}

export function balanceGap(state) {
  if (!state) return Infinity;
  const stats = allStats(state);
  return state.bars.reduce((sum, bar) => sum + Math.abs(stats.get(bar.id)?.difference ?? 0), 0);
}

