// Render: every pixel of the room. One job: draw the game state onto the canvas.
// Glow comes from pre-rendered sprites (no shadowBlur per frame, 60fps stays cheap).

import { PALETTE, FLOOR_TOP, FLOOR_BOTTOM, FLOOR_LEFT, FLOOR_RIGHT, LOOT_VALUES, GUARD_RANGE, GUARD_HALF_ANGLE, CAMERA_RANGE, CAMERA_HALF_ANGLE } from './config.js';

export function createSprites() {
  function glow(color, inner) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.4, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return c;
  }
  return {
    gold: glow('rgba(245,197,66,0.55)', 'rgba(255,240,180,0.9)'),
    diamond: glow('rgba(127,231,255,0.7)', 'rgba(230,250,255,0.95)'),
    red: glow('rgba(255,64,80,0.5)', 'rgba(255,120,120,0.8)'),
    smoke: glow('rgba(180,180,200,0.35)', 'rgba(220,220,235,0.5)'),
  };
}

function drawCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle - halfAngle) * range, y + Math.sin(angle - halfAngle) * range);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle + halfAngle) * range, y + Math.sin(angle + halfAngle) * range);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawRoom(ctx, state, sprites, time) {
  const level = state.level;
  // Floor: dark marble checker + vignette edge.
  ctx.fillStyle = PALETTE.floorDark;
  ctx.fillRect(FLOOR_LEFT, FLOOR_TOP, FLOOR_RIGHT - FLOOR_LEFT, FLOOR_BOTTOM - FLOOR_TOP);
  const tile = 62;
  ctx.fillStyle = PALETTE.floorLight;
  for (let y = FLOOR_TOP; y < FLOOR_BOTTOM; y += tile) {
    for (let x = FLOOR_LEFT; x < FLOOR_RIGHT; x += tile) {
      if (((x - FLOOR_LEFT) / tile + (y - FLOOR_TOP) / tile) % 2 === 0) ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
    }
  }
  // Walls.
  ctx.fillStyle = PALETTE.wallTop;
  level.walls.forEach((w) => ctx.fillRect(w.x, w.y, w.w, w.h));
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(FLOOR_LEFT + 8, FLOOR_TOP + 8, FLOOR_RIGHT - FLOOR_LEFT - 16, FLOOR_BOTTOM - FLOOR_TOP - 16);

  // Decor (flat, under everything).
  level.decor.forEach((d) => {
    if (d.kind === 'rug' || d.kind === 'carpet') {
      ctx.fillStyle = PALETTE.carpet;
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = PALETTE.carpetEdge;
      ctx.lineWidth = 4;
      ctx.strokeRect(d.x + 4, d.y + 4, d.w - 8, d.h - 8);
    } else if (d.kind === 'painting') {
      ctx.fillStyle = '#0e0a14';
      ctx.fillRect(d.x - 4, d.y - 4, d.w + 8, d.h + 8);
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, d.y, d.w, d.h);
    } else if (d.kind === 'plant') {
      ctx.fillStyle = '#2d5a34';
      ctx.beginPath(); ctx.arc(d.x + d.w / 2, d.y + d.h / 2 - 6, 16, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#7a4a22';
      ctx.fillRect(d.x + 8, d.y + d.h - 14, d.w - 16, 14);
    } else if (d.kind === 'artifact') {
      ctx.fillStyle = '#8a6d3b';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.fillStyle = PALETTE.diamond;
      ctx.beginPath(); ctx.arc(d.x + d.w / 2, d.y + 6, 7, 0, 6.29); ctx.fill();
    } else if (d.kind === 'vaultdoor') {
      ctx.fillStyle = '#232030';
      ctx.fillRect(d.x, d.y, d.w, d.h);
      ctx.strokeStyle = '#5a5470';
      ctx.lineWidth = 3;
      ctx.strokeRect(d.x + 4, d.y + 4, d.w - 8, d.h - 8);
      ctx.beginPath(); ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 14, 0, 6.29); ctx.stroke();
    }
  });

  // Exit door (bottom-left): green, labelled, pulses when loot is complete.
  const ready = state.loot.every((l) => !l.required || l.taken);
  const ex = level.exit;
  ctx.fillStyle = ready ? '#0f7a3d' : '#123f28';
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.strokeStyle = ready ? PALETTE.exitGreen : '#2a7a4a';
  ctx.lineWidth = ready ? 4 : 2;
  ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
  ctx.fillStyle = ready ? '#b6ffd4' : '#7fd6a4';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', ex.x + ex.w / 2, ex.y + ex.h / 2 - 4);
  ctx.font = '11px sans-serif';
  ctx.fillText(ready ? '★ TERBUKA' : 'AMBIL LOOT DULU', ex.x + ex.w / 2, ex.y + ex.h / 2 + 16);
  if (ready) {
    ctx.drawImage(sprites.gold, ex.x - 20, ex.y - 20, 124, 124);
  }

  // Loot: glow sprite + icon + bob; diamond sparkles.
  state.loot.forEach((l) => {
    if (l.taken) return;
    const bob = Math.sin(time * 2.4 + l.bob) * 3;
    const v = LOOT_VALUES[l.kind];
    if (l.kind === 'diamond') {
      ctx.drawImage(sprites.diamond, l.x - 42, l.y - 42 + bob, 84, 84);
      ctx.save();
      ctx.translate(l.x, l.y + bob);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = PALETTE.diamond;
      ctx.fillRect(-11, -11, 22, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();
      ctx.fillStyle = '#bff4ff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(l.label, l.x, l.y - 26 + bob);
    } else if (l.kind === 'medium') {
      ctx.drawImage(sprites.gold, l.x - 30, l.y - 30 + bob, 60, 60);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(l.x - 12, l.y - 7 + bob, 24, 14);
      ctx.fillStyle = PALETTE.goldDeep;
      ctx.fillRect(l.x - 12, l.y + 2 + bob, 24, 5);
    } else {
      ctx.drawImage(sprites.gold, l.x - 22, l.y - 22 + bob, 44, 44);
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath(); ctx.arc(l.x, l.y + bob, 8, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#7a5a10';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', l.x, l.y + 4 + bob);
    }
  });

  // Vision cones (under the covers, over the floor).
  state.guards.forEach((g) => {
    const chasing = g.state === 'chase';
    drawCone(ctx, g.x, g.y, g.angle, GUARD_RANGE, GUARD_HALF_ANGLE,
      chasing ? 'rgba(255,64,80,0.28)' : PALETTE.guardCone,
      chasing ? 'rgba(255,64,80,0.7)' : PALETTE.guardConeEdge);
  });
  state.cameras.forEach((c) => {
    if (c.disabledTimer > 0) return;
    drawCone(ctx, c.x, c.y, c.angle, CAMERA_RANGE, CAMERA_HALF_ANGLE, PALETTE.cameraCone, PALETTE.cameraConeEdge);
  });

  // Patrol paths (relic: Mata Elang).
  if (state.relics.includes('eagle')) {
    ctx.strokeStyle = 'rgba(245,197,66,0.35)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    state.guards.forEach((g) => {
      ctx.beginPath();
      g.path.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.closePath();
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  // Covers: sofas, safes, pillars, tables, cases, vault — the safe shadows.
  level.covers.forEach((c) => {
    const fill = c.kind === 'sofa' ? PALETTE.coverVelvet : c.kind === 'safe' || c.kind === 'vault' ? '#3a3f52' : c.kind === 'desk' || c.kind === 'table' ? '#14532a' : c.kind === 'case' ? '#274b63' : PALETTE.coverStone;
    ctx.fillStyle = fill;
    roundRect(ctx, c.x, c.y, c.w, c.h, c.kind === 'pillar' ? 23 : 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(c.x, c.y + c.h - 8, c.w, 8);
    if (c.label) {
      ctx.fillStyle = 'rgba(242,234,216,0.75)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
    }
  });

  // Lasers (level 5): red beams with a gap; touching one spikes the alarm.
  if (level.lasers) {
    level.lasers.forEach((L) => {
      const gx = L.x1 + (L.x2 - L.x1) * L.gapAt;
      ctx.strokeStyle = 'rgba(255,40,60,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(L.x1, L.y1); ctx.lineTo(gx - L.gapW / 2, L.y1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx + L.gapW / 2, L.y1); ctx.lineTo(L.x2, L.y2); ctx.stroke();
      ctx.drawImage(sprites.red, gx - 30, L.y1 - 30, 60, 60);
      ctx.fillStyle = '#ff8090';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LASER', gx, L.y1 - 12);
    });
  }

  // Guards: body + cap + facing tick; red when chasing.
  state.guards.forEach((g) => {
    const chasing = g.state === 'chase';
    ctx.fillStyle = chasing ? '#a11' : '#3d4a6b';
    ctx.beginPath(); ctx.arc(g.x, g.y, 15, 0, 6.29); ctx.fill();
    ctx.strokeStyle = chasing ? '#ff6060' : '#8fa3cc';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = chasing ? '#ff4040' : '#22304a';
    ctx.beginPath(); ctx.arc(g.x, g.y - 3, 9, Math.PI, 0); ctx.fill();
    ctx.fillRect(g.x - 9, g.y - 5, 18, 4);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x + Math.cos(g.angle) * 16, g.y + Math.sin(g.angle) * 16);
    ctx.lineTo(g.x + Math.cos(g.angle) * 24, g.y + Math.sin(g.angle) * 24);
    ctx.stroke();
    if (g.state === 'investigate') {
      ctx.fillStyle = '#f5c542';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', g.x, g.y - 24);
    }
    if (chasing) {
      ctx.fillStyle = '#ff6060';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 24);
    }
  });

  // Cameras: wall mount + lens; grey + "OFF" when EMP'd.
  state.cameras.forEach((c) => {
    const off = c.disabledTimer > 0;
    ctx.fillStyle = off ? '#555' : '#c33';
    ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(c.x, c.y, 5, 0, 6.29); ctx.fill();
    if (!off) ctx.drawImage(sprites.red, c.x - 14, c.y - 14, 28, 28);
    if (off) {
      ctx.fillStyle = '#bbb';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFF', c.x, c.y - 14);
    }
  });

  // Thief: dark hood, gold trim, hat brim; ring while channeling the vault.
  const t = state.thief;
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 6.29); ctx.fill();
  ctx.strokeStyle = PALETTE.thiefHood;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.thiefHood;
  ctx.beginPath(); ctx.arc(t.x, t.y - 2, 6, 0, 6.29); ctx.fill();
  ctx.strokeStyle = '#1a1c2a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(t.x + Math.cos(t.dir) * 8, t.y + Math.sin(t.dir) * 8);
  ctx.lineTo(t.x + Math.cos(t.dir) * 16, t.y + Math.sin(t.dir) * 16);
  ctx.stroke();
  if (t.channel > 0 && t.channelTarget) {
    ctx.strokeStyle = PALETTE.diamond;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, -Math.PI / 2, -Math.PI / 2 + t.channel * 6.283);
    ctx.stroke();
    ctx.fillStyle = '#bff4ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MEMBOBOL…', t.x, t.y - 30);
  }

  // Smoke puffs.
  state.tools.smoke.forEach((s) => {
    ctx.drawImage(sprites.smoke, s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    ctx.fillStyle = 'rgba(200,200,220,0.25)';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.8, 0, 6.29); ctx.fill();
  });

  // Thrown coins in flight / on the floor.
  state.tools.thrownCoins.forEach((c) => {
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.landed ? 6 : 8, 0, 6.29); ctx.fill();
    ctx.strokeStyle = '#7a5a10';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Floating score text.
  ctx.textAlign = 'center';
  state.floats.forEach((f) => {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(f.text, f.x, f.y);
    ctx.globalAlpha = 1;
  });
}
