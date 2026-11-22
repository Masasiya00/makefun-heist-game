// Guards: patrol routes, vision cones, line-of-sight detection, investigate + chase.
// One job: everything a guard does — patrol, notice, chase, give up.

import { GUARD_RANGE, GUARD_HALF_ANGLE, angleDiff, dist, clamp } from './config.js';

// Liang-Barsky: does segment (x1,y1)-(x2,y2) cross rect? Used for line of sight.
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

export function lineBlocked(x1, y1, x2, y2, blockers) {
  return blockers.some((b) => segmentHitsRect(x1, y1, x2, y2, b));
}

export function createGuard(def) {
  const start = def.path[0];
  return {
    path: def.path,
    wp: 1,
    pause: def.pause || 1,
    pauseTimer: 0,
    x: start[0], y: start[1],
    angle: 0,
    state: 'patrol',       // patrol | investigate | chase
    investigateX: 0, investigateY: 0, investigateTimer: 0,
    speed: 0,
  };
}

// True when the guard can currently see the thief (cone + range + line of sight).
export function guardSeesThief(guard, thief, blockers, smoke) {
  const d = dist(guard.x, guard.y, thief.x, thief.y);
  if (d > GUARD_RANGE) return false;
  const toThief = Math.atan2(thief.y - guard.y, thief.x - guard.x);
  if (Math.abs(angleDiff(toThief, guard.angle)) > GUARD_HALF_ANGLE) return false;
  if (lineBlocked(guard.x, guard.y, thief.x, thief.y, blockers)) return false;
  if (smoke.some((s) => dist(thief.x, thief.y, s.x, s.y) < s.r)) return false;
  return true;
}

export function updateGuard(guard, dt, diff, loopMul, thief, blockers, smoke, lockdown, alarmSeen) {
  const baseSpeed = diff.guardSpeed * loopMul;
  if (guard.state === 'chase') {
    // Lockdown chase: run straight at the thief, through open floor.
    const d = dist(guard.x, guard.y, thief.x, thief.y);
    if (d > 4) {
      const a = Math.atan2(thief.y - guard.y, thief.x - guard.x);
      guard.angle = a;
      guard.x += Math.cos(a) * diff.chaseSpeed * loopMul * dt;
      guard.y += Math.sin(a) * diff.chaseSpeed * loopMul * dt;
    }
    if (!lockdown) guard.state = 'patrol';
    return;
  }
  if (lockdown) { guard.state = 'chase'; return; }

  if (guard.state === 'investigate') {
    const d = dist(guard.x, guard.y, guard.investigateX, guard.investigateY);
    if (d > 8) {
      const a = Math.atan2(guard.investigateY - guard.y, guard.investigateX - guard.x);
      guard.angle = a;
      guard.x += Math.cos(a) * baseSpeed * 1.15 * dt;
      guard.y += Math.sin(a) * baseSpeed * 1.15 * dt;
    } else {
      guard.investigateTimer -= dt;
      guard.angle += Math.sin(guard.investigateTimer * 3) * dt * 1.5; // look around
      if (guard.investigateTimer <= 0) guard.state = 'patrol';
    }
    return;
  }

  // Patrol: walk the waypoint loop, pausing at each corner.
  if (guard.pauseTimer > 0) {
    guard.pauseTimer -= dt;
    guard.angle += Math.sin(Date.now() * 0.001 + guard.x) * dt * 0.4;
    return;
  }
  const target = guard.path[guard.wp];
  const d = dist(guard.x, guard.y, target[0], target[1]);
  if (d < 6) {
    guard.wp = (guard.wp + 1) % guard.path.length;
    guard.pauseTimer = guard.pause;
    return;
  }
  const a = Math.atan2(target[1] - guard.y, target[0] - guard.x);
  guard.angle = a;
  guard.x += Math.cos(a) * baseSpeed * dt;
  guard.y += Math.sin(a) * baseSpeed * dt;
}

export function sendGuardTo(guard, x, y) {
  guard.state = 'investigate';
  guard.investigateX = clamp(x, 50, 1230);
  guard.investigateY = clamp(y, 100, 670);
  guard.investigateTimer = 3;
}

export function guardTouchesThief(guard, thief) {
  return dist(guard.x, guard.y, thief.x, thief.y) < 26;
}
