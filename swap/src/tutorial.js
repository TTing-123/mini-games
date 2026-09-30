export function createTutorial(canvas) {
  const ctx = canvas.getContext('2d');
  let running = false;
  let startTime = 0;

  const floor = { x: 40, y: 70, size: 70, cols: 6, rows: 3 };

  function roundedRect(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawFloor() {
    ctx.fillStyle = '#071219';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < floor.rows; row += 1) {
      for (let col = 0; col < floor.cols; col += 1) {
        const x = floor.x + col * floor.size;
        const y = floor.y + row * floor.size;
        ctx.fillStyle = (row + col) % 2 ? '#0d2631' : '#102d38';
        ctx.fillRect(x + 2, y + 2, floor.size - 4, floor.size - 4);
        ctx.strokeStyle = 'rgba(125,228,225,.12)';
        ctx.strokeRect(x + 2.5, y + 2.5, floor.size - 5, floor.size - 5);
      }
    }
  }

  function drawPlayer(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.shadowColor = '#4de2d5';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#4de2d5';
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0a2731';
    ctx.beginPath();
    ctx.ellipse(0, -2, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eafffc';
    ctx.beginPath();
    ctx.arc(-3, -2, 2, 0, Math.PI * 2);
    ctx.arc(3, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a8e9e4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawCrate(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#8b5525';
    ctx.shadowColor = '#f5b84b';
    ctx.shadowBlur = 10;
    roundedRect(-20, -20, 40, 40, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#c9873d';
    ctx.fillRect(-16, -17, 32, 8);
    ctx.fillRect(-16, 9, 32, 8);
    ctx.strokeStyle = '#5e3518';
    ctx.lineWidth = 3;
    ctx.strokeRect(-20, -20, 40, 40);
    ctx.beginPath();
    ctx.moveTo(-16, -16);
    ctx.lineTo(16, 16);
    ctx.moveTo(16, -16);
    ctx.lineTo(-16, 16);
    ctx.stroke();
    ctx.fillStyle = '#f5b84b';
    [[-15,-15],[15,-15],[-15,15],[15,15]].forEach(([px,py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawKey(x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.shadowColor = '#f5b84b';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#f5b84b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, -10, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(0, 18);
    ctx.moveTo(0, 12);
    ctx.lineTo(10, 12);
    ctx.moveTo(0, 17);
    ctx.lineTo(7, 17);
    ctx.stroke();
    ctx.restore();
  }

  function drawExit(x, y, glow) {
    ctx.save();
    ctx.strokeStyle = glow ? '#4de2d5' : '#f5b84b';
    ctx.lineWidth = 6;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = glow ? 24 : 10;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawCursor(x, y, click) {
    ctx.save();
    ctx.translate(x, y);
    if (click) {
      ctx.strokeStyle = 'rgba(154,98,232,.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16 + click * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#f4ffff';
    ctx.strokeStyle = '#071219';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 24);
    ctx.lineTo(7, 18);
    ctx.lineTo(13, 27);
    ctx.lineTo(18, 24);
    ctx.lineTo(12, 15);
    ctx.lineTo(21, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  function draw() {
    if (!running) return;
    const elapsed = (performance.now() - startTime) / 1000 % 8;
    drawFloor();

    const startX = floor.x + floor.size / 2;
    const midY = floor.y + floor.size * 1.5;
    const crateX = floor.x + floor.size * 3.5;
    const keyX = floor.x + floor.size * 5.2;
    const exitX = floor.x + floor.size * 6.1;

    let playerX = startX;
    let playerY = midY;
    let crateVisible = true;
    let keyVisible = true;
    let exitGlow = false;
    let cursor = null;
    let phaseLabel = '移动';

    if (elapsed < 1.8) {
      playerX = lerp(startX, startX + 70, elapsed / 1.8);
      phaseLabel = 'WASD 移动';
    } else if (elapsed < 3.8) {
      const t = (elapsed - 1.8) / 2;
      playerX = startX + 70;
      cursor = { x: lerp(startX + 100, crateX, t), y: midY - 20, click: t > .7 };
      phaseLabel = '点击箱子换位';
      if (t > .72) {
        playerX = lerp(startX + 70, crateX, (t - .72) / .28);
      }
    } else if (elapsed < 5.8) {
      const t = (elapsed - 3.8) / 2;
      playerX = crateX;
      cursor = { x: lerp(crateX, keyX, t), y: midY - 20, click: t > .65 };
      phaseLabel = '点击钥匙直接拿到';
      if (t > .72) keyVisible = false;
    } else {
      const t = (elapsed - 5.8) / 2.2;
      playerX = lerp(crateX, exitX, t);
      playerY = midY;
      keyVisible = false;
      exitGlow = true;
      phaseLabel = '拿到钥匙，去出口';
    }

    if (crateVisible) drawCrate(crateX, midY);
    if (keyVisible) drawKey(keyX, midY);
    drawExit(exitX, midY, exitGlow);
    drawPlayer(playerX, playerY);
    if (cursor) drawCursor(cursor.x, cursor.y, cursor.click ? .7 : 0);

    ctx.fillStyle = 'rgba(4,20,27,.86)';
    roundedRect(150, 18, 220, 34, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(77,226,213,.35)';
    ctx.stroke();
    ctx.fillStyle = '#e9f8f6';
    ctx.font = '700 14px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(phaseLabel, 260, 36);

    requestAnimationFrame(draw);
  }

  return {
    start() {
      running = true;
      startTime = performance.now();
      requestAnimationFrame(draw);
    },
    stop() {
      running = false;
    }
  };
}
