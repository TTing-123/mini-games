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
];

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
    bars: level.bars.map((bar) => ({ ...bar })),
    weights: level.weights.map((weight) => ({ ...weight })),
    solution: level.solution.map((move) => ({ ...move })),
    solved: false
  };
}

export function cloneState(state) {
  return {
    ...state,
    bars: state.bars.map((bar) => ({ ...bar })),
    weights: state.weights.map((weight) => ({ ...weight })),
    solution: state.solution.map((move) => ({ ...move }))
  };
}

export function getBar(state, barId) {
  return state.bars.find((bar) => bar.id === barId) ?? null;
}

export function getHook(state, hookId) {
  if (!hookId) return null;
  const [barId, side] = hookId.split('.');
  const bar = getBar(state, barId);
  if (!bar || (side !== 'left' && side !== 'right')) return null;
  const child = side === 'left' ? bar.leftChild : bar.rightChild;
  return { bar, side, child };
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

  const sideStats = (side, childId) => {
    if (childId) {
      const child = barStats(state, childId, memo);
      return { load: child?.totalMass ?? 0, child };
    }
    const weight = weightAt(state, `${barId}.${side}`);
    return { load: weight?.mass ?? 0, child: null };
  };

  const left = sideStats('left', bar.leftChild);
  const right = sideStats('right', bar.rightChild);
  const leftTorque = left.load * bar.leftPos;
  const rightTorque = right.load * bar.rightPos;
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
