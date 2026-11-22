// Thief: movement, wall/cover collision, vault channeling. One job: the player body.
// Collision is circle-vs-rect against walls + covers; the thief never leaves the room.

import { THIEF_SPEED, THIEF_RADIUS, clamp } from './config.js';

export function createThief(x, y) {
  return {
    x, y, r: THIEF_RADIUS,
    dir: 0,            // facing angle, for the hood + hat drawing
    moving: false,
    channel: 0,        // 0..1 progress opening the diamond vault
    channelTarget: null,
    stepTimer: 0,
  };
}

function circleHitsRect(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nx, dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export function moveThief(thief, vx, vy, dt, blockers, speedMul) {
  if (vx === 0 && vy === 0) { thief.moving = false; return; }
  thief.dir = Math.atan2(vy, vx);
  const speed = THIEF_SPEED * speedMul;
  const nx = thief.x + vx * speed * dt;
  const ny = thief.y + vy * speed * dt;
  // Move per axis so the thief slides along walls instead of sticking.
  const ox = thief.x, oy = thief.y;
  if (!blockers.some((b) => circleHitsRect(nx, thief.y, thief.r, b))) thief.x = nx;
  if (!blockers.some((b) => circleHitsRect(thief.x, ny, thief.r, b))) thief.y = ny;
  thief.x = clamp(thief.x, 36 + thief.r, 1244 - thief.r);
  thief.y = clamp(thief.y, 88 + thief.r, 684 - thief.r);
  // moving hanya kalau posisi benar-benar berubah: menabrak dinding sambil
  // menahan tombol bukan bergerak (dan tidak boleh menggagalkan channeling).
  thief.moving = thief.x !== ox || thief.y !== oy;
}

// Stand next to the diamond and hold still: the vault opens over channelSeconds.
// Returns the loot being channeled, or null.
export function updateChannel(thief, loot, dt, channelSeconds, relics) {
  const diamond = loot.find((l) => l.kind === 'diamond' && !l.taken);
  if (!diamond) { thief.channel = 0; thief.channelTarget = null; return null; }
  const d = Math.hypot(thief.x - diamond.x, thief.y - diamond.y);
  const reach = 46;
  if (d <= reach && !thief.moving) {
    const seconds = channelSeconds * (relics.includes('steady') ? 0.5 : 1);
    thief.channel += dt / seconds;
    thief.channelTarget = diamond;
    if (thief.channel >= 1) {
      thief.channel = 0;
      thief.channelTarget = null;
      return diamond;
    }
    return null;
  }
  thief.channel = Math.max(0, thief.channel - dt * 2);
  thief.channelTarget = null;
  return null;
}
