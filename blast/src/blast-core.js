// BLAST 核心逻辑：点一下引爆，冲击波按距离逐个点燃周围的球，连锁滚满全屏。
// 纯逻辑，不碰 DOM，可在 Node 里直接跑。

export const WIDTH = 1280;
export const HEIGHT = 720;

export const CONFIG = {
  ballCount: 96,
  minRadius: 9,
  maxRadius: 17,
  minGap: 22,
  minSpeed: 14,
  maxSpeed: 44,
  blastRadius: 124,     // 一次爆炸的波及范围
  waveSpeed: 720,       // 冲击波扩散速度，同时也是连锁传播速度
  minFuse: 0.05,
  clicksPerRun: 5
};

export function createRng(seed = Date.now()) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 泊松盘式撒点：球之间留出空隙，连锁才有"跳着传"的观感。
function scatterBalls(random, count) {
  const balls = [];
  const attempts = count * 80;
  for (let i = 0; i < attempts && balls.length < count; i += 1) {
    const radius = CONFIG.minRadius + random() * (CONFIG.maxRadius - CONFIG.minRadius);
    const x = 60 + random() * (WIDTH - 120);
    const y = 60 + random() * (HEIGHT - 120);
    const fits = balls.every((other) => Math.hypot(other.x - x, other.y - y) > other.radius + radius + CONFIG.minGap);
    if (fits) balls.push({ x, y, radius, phase: random() * Math.PI * 2 });
  }
  return balls;
}

export class BlastCore {
  constructor(seed) {
    this.events = [];
    this.state = null;
    this.reset(seed);
  }

  reset(seed = Date.now()) {
    const random = createRng(seed);
    const balls = scatterBalls(random, CONFIG.ballCount).map((ball, id) => {
      const angle = random() * Math.PI * 2;
      const speed = CONFIG.minSpeed + random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
      return {
        id,
        x: ball.x,
        y: ball.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: ball.radius,
        phase: ball.phase,
        state: 'idle',
        fuse: 0,
        generation: 0,
        heat: 0
      };
    });
    this.state = {
      balls,
      waves: [],
      particles: [],
      chain: 0,
      bestChain: 0,
      clicksLeft: CONFIG.clicksPerRun,
      clicksMax: CONFIG.clicksPerRun,
      status: 'idle'     // idle | chaining | done
    };
    this.queue('reset', { balls: balls.length });
  }

  queue(type, data = {}) {
    this.events.push(type === undefined ? {} : { type, ...data });
  }

  consumeEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  remaining() {
    return this.state.balls.filter((ball) => ball.state === 'idle').length;
  }

  cleared() {
    return this.state.balls.filter((ball) => ball.state === 'gone').length;
  }

  canClick() {
    return this.state.status === 'idle' && this.state.clicksLeft > 0 && this.remaining() > 0;
  }

  ballAt(x, y, slack = 16) {
    let best = null;
    for (const ball of this.state.balls) {
      if (ball.state !== 'idle') continue;
      const distance = Math.hypot(ball.x - x, ball.y - y);
      if (distance <= ball.radius + slack && (!best || distance < best.distance)) best = { ball, distance };
    }
    return best ? best.ball : null;
  }

  ignite(ballId) {
    if (!this.canClick()) return false;
    const ball = this.state.balls.find((item) => item.id === ballId);
    if (!ball || ball.state !== 'idle') return false;
    this.state.clicksLeft -= 1;
    this.state.chain = 0;
    this.state.status = 'chaining';
    ball.generation = 0;
    ball.state = 'armed';
    ball.fuse = 0;
    this.queue('ignite', { id: ball.id, x: ball.x, y: ball.y });
    return true;
  }

  update(dt) {
    const state = this.state;
    if (!state) return;
    const clamped = Math.min(dt, 0.05);

    this.drift(clamped);

    for (const ball of state.balls) {
      if (ball.state === 'armed') {
        ball.fuse -= clamped;
        if (ball.fuse <= 0) this.explode(ball);
      }
      if (ball.heat > 0) ball.heat = Math.max(0, ball.heat - clamped * 2.2);
    }

    for (let i = state.waves.length - 1; i >= 0; i -= 1) {
      const wave = state.waves[i];
      wave.radius += wave.speed * clamped;
      wave.life -= clamped;
      if (wave.life <= 0) state.waves.splice(i, 1);
    }

    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const particle = state.particles[i];
      particle.x += particle.vx * clamped;
      particle.y += particle.vy * clamped;
      particle.vx *= 0.94;
      particle.vy *= 0.94;
      particle.life -= clamped;
      if (particle.life <= 0) state.particles.splice(i, 1);
    }

    if (state.status === 'chaining') {
      const busy = state.balls.some((ball) => ball.state === 'armed') || state.waves.length > 0;
      if (!busy) {
        state.bestChain = Math.max(state.bestChain, state.chain);
        const finished = this.remaining() === 0 || state.clicksLeft <= 0;
        state.status = finished ? 'done' : 'idle';
        this.queue('settled', { chain: state.chain, cleared: this.cleared(), remaining: this.remaining() });
      }
    }
  }

  // 球缓慢漂移并互相让位，既是视觉生机，也让"什么时候点"变成选择。
  drift(dt) {
    const balls = this.state.balls;
    for (const ball of balls) {
      if (ball.state !== 'idle') continue;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < ball.radius + 20) { ball.x = ball.radius + 20; ball.vx = Math.abs(ball.vx); }
      if (ball.x > WIDTH - ball.radius - 20) { ball.x = WIDTH - ball.radius - 20; ball.vx = -Math.abs(ball.vx); }
      if (ball.y < ball.radius + 20) { ball.y = ball.radius + 20; ball.vy = Math.abs(ball.vy); }
      if (ball.y > HEIGHT - ball.radius - 20) { ball.y = HEIGHT - ball.radius - 20; ball.vy = -Math.abs(ball.vy); }
    }

    for (let i = 0; i < balls.length; i += 1) {
      const a = balls[i];
      if (a.state !== 'idle') continue;
      for (let j = i + 1; j < balls.length; j += 1) {
        const b = balls[j];
        if (b.state !== 'idle') continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minimum = a.radius + b.radius + 6;
        const distance = Math.hypot(dx, dy);
        if (distance >= minimum || distance === 0) continue;
        const nx = dx / distance;
        const ny = dy / distance;
        const push = (minimum - distance) / 2;
        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }

  explode(ball) {
    const state = this.state;
    ball.state = 'gone';
    ball.heat = 1;
    ball.fuse = 0;
    state.chain += 1;
    state.bestChain = Math.max(state.bestChain, state.chain);

    state.waves.push({ x: ball.x, y: ball.y, radius: ball.radius, speed: CONFIG.waveSpeed, life: CONFIG.blastRadius / CONFIG.waveSpeed });
    this.spawnParticles(ball);

    // 冲击波扫过的球会被点燃，延迟跟距离成正比，看起来像热浪在往外传。
    for (const other of state.balls) {
      if (other.state !== 'idle') continue;
      const distance = Math.hypot(other.x - ball.x, other.y - ball.y);
      if (distance > CONFIG.blastRadius) continue;
      other.state = 'armed';
      other.generation = ball.generation + 1;
      other.fuse = Math.max(CONFIG.minFuse, distance / CONFIG.waveSpeed);
      this.queue('spread', { from: ball.id, to: other.id, distance });
    }

    this.queue('blast', {
      id: ball.id,
      x: ball.x,
      y: ball.y,
      radius: ball.radius,
      generation: ball.generation,
      chain: state.chain
    });
  }

  spawnParticles(ball) {
    const count = 6 + Math.round(ball.radius * 0.7);
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 90 + Math.random() * 190;
      this.state.particles.push({
        x: ball.x,
        y: ball.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        size: 1.6 + Math.random() * 2.4
      });
    }
  }
}